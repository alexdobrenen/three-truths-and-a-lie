import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { fetchArticlesAndGenerateLie, type Article } from '../services/newsService';
import './GamePlay.css';

interface ArticleWithPosition extends Article {
  position: number;
  isLie: boolean;
}

function GamePlay() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { playerId } = (location.state || {}) as { playerId?: string };

  const [articles, setArticles] = useState<ArticleWithPosition[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [votes, setVotes] = useState<{ [key: number]: number }>({});
  const [roundInitialized, setRoundInitialized] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState<string | null>(null);
  const [playerWasCorrect, setPlayerWasCorrect] = useState<boolean | null>(null);
  const [nonVoterCount, setNonVoterCount] = useState(0);
  const [playerGuess, setPlayerGuess] = useState<number | null>(null);

  useEffect(() => {
    console.log('GamePlay mounted - gameId:', gameId, 'playerId:', playerId);
    checkAndInitializeRound();
  }, [gameId, playerId]);


  // Synchronized timer based on server timestamp
  useEffect(() => {
    if (!roundStartTime || showResults) return;

    const calculateTimeRemaining = () => {
      const startTime = new Date(roundStartTime).getTime();
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      const remaining = Math.max(0, 15 - elapsedSeconds);

      setTimeRemaining(remaining);

      if (remaining === 0 && !showResults) {
        handleTimeUp();
      }
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [roundStartTime, showResults]);

  useEffect(() => {
    if (!roundId) return;

    const channel = supabase
      .channel(`round-${roundId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'player_guesses',
          filter: `game_round_id=eq.${roundId}`,
        },
        () => {
          fetchVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roundId]);

  const checkAndInitializeRound = async () => {
    if (!gameId) {
      console.error('No gameId provided');
      return;
    }

    console.log('Checking for existing round...');
    setLoading(true);

    try {
      // First, check if a round already exists
      const { data: existingRound, error: fetchError } = await supabase
        .from('game_rounds')
        .select('*')
        .eq('game_session_id', gameId)
        .order('round_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching round:', fetchError);
        throw fetchError;
      }

      if (existingRound) {
        console.log('Found existing round:', existingRound);
        console.log('🎯 Correct answer from database:', existingRound.correct_answer);
        setRoundId(existingRound.id);
        setCorrectAnswer(existingRound.correct_answer);
        setRoundStartTime(existingRound.started_at);

        const fetchedArticles = [
          { title: existingRound.true_article_1, url: existingRound.true_article_1_url, position: 1, isLie: false, source: '' },
          { title: existingRound.true_article_2, url: existingRound.true_article_2_url, position: 2, isLie: false, source: '' },
          { title: existingRound.true_article_3, url: existingRound.true_article_3_url, position: 3, isLie: false, source: '' },
          { title: existingRound.lie_article, url: '', position: 4, isLie: false, source: '' },
        ];

        fetchedArticles[existingRound.correct_answer - 1].isLie = true;
        console.log('📰 Articles with isLie flags:', fetchedArticles.map(a => ({ position: a.position, title: a.title.substring(0, 30), isLie: a.isLie })));
        setArticles(fetchedArticles);
        setLoading(false);
        setRoundInitialized(true);
        return;
      }

      // Only proceed with creation if we haven't tried before (prevents duplicate attempts)
      if (roundInitialized) {
        console.log('Round already initialized, skipping creation');
        return;
      }

      console.log('No existing round, creating new one...');

      // Fetch articles first before attempting database insert
      const { trueArticles, lieArticle } = await fetchArticlesAndGenerateLie();
      console.log('Articles fetched:', trueArticles.length, 'true articles');
      console.log('Fake headline generated:', lieArticle);

      const allArticles = [
        ...trueArticles,
        { title: lieArticle, url: '', source: 'AI Generated' },
      ];

      const shuffled = shuffleArray(allArticles);
      const liePosition = shuffled.findIndex((a) => a.url === '') + 1;

      console.log('🔀 Shuffled articles:', shuffled.map((a, i) => ({ position: i + 1, title: a.title, isLie: a.url === '' })));
      console.log('✅ Lie position:', liePosition);

      // Try to insert the round with better conflict handling
      const maxRetries = 3;
      let retryCount = 0;
      let round = null;

      while (retryCount < maxRetries && !round) {
        try {
          const { data, error: roundError } = await supabase
            .from('game_rounds')
            .insert({
              game_session_id: gameId,
              round_number: 1,
              true_article_1: shuffled[0].title,
              true_article_1_url: shuffled[0].url || 'none',
              true_article_2: shuffled[1].title,
              true_article_2_url: shuffled[1].url || 'none',
              true_article_3: shuffled[2].title,
              true_article_3_url: shuffled[2].url || 'none',
              lie_article: shuffled[3].title,
              correct_answer: liePosition,
            })
            .select()
            .single();

          if (roundError) {
            if (roundError.code === '23505') {
              // Duplicate key - another client created the round
              console.log('⚠️  Duplicate round detected, fetching existing round...');
              // Wait a bit and then fetch the existing round
              await new Promise(resolve => setTimeout(resolve, 200));

              const { data: existingRoundRetry } = await supabase
                .from('game_rounds')
                .select('*')
                .eq('game_session_id', gameId)
                .order('round_number', { ascending: false })
                .limit(1)
                .single();

              if (existingRoundRetry) {
                round = existingRoundRetry;
                console.log('✅ Using existing round from another client');
                break;
              }
            } else {
              throw roundError;
            }
          } else {
            round = data;
            console.log('✅ Round created successfully');
          }
        } catch (err) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw err;
          }
          await new Promise(resolve => setTimeout(resolve, 300 * retryCount));
        }
      }

      if (!round) {
        throw new Error('Failed to create or fetch round after retries');
      }

      setRoundId(round.id);
      setCorrectAnswer(round.correct_answer);
      setRoundStartTime(round.started_at);

      // If we used an existing round, reconstruct articles from it
      if (round.true_article_1 !== shuffled[0].title) {
        const reconstructedArticles = [
          { title: round.true_article_1, url: round.true_article_1_url, position: 1, isLie: false, source: '' },
          { title: round.true_article_2, url: round.true_article_2_url, position: 2, isLie: false, source: '' },
          { title: round.true_article_3, url: round.true_article_3_url, position: 3, isLie: false, source: '' },
          { title: round.lie_article, url: '', position: 4, isLie: false, source: '' },
        ];
        reconstructedArticles[round.correct_answer - 1].isLie = true;
        setArticles(reconstructedArticles);
      } else {
        setArticles(
          shuffled.map((article, index) => ({
            ...article,
            position: index + 1,
            isLie: article.url === '',
          }))
        );
      }

      console.log('Articles set, loading complete');
      setLoading(false);
      setRoundInitialized(true);
    } catch (error) {
      console.error('Error with round:', error);
      alert('Failed to load round. Please try again.');
      setLoading(false);
    }
  };

  const fetchVotes = async () => {
    if (!roundId) return;

    const { data, error } = await supabase
      .from('player_guesses')
      .select('guess')
      .eq('game_round_id', roundId);

    if (error) {
      console.error('Error fetching votes:', error);
      return;
    }

    const voteCount: { [key: number]: number } = {};
    let nonVoters = 0;

    data.forEach((vote) => {
      if (vote.guess === 0) {
        nonVoters++;
      } else {
        voteCount[vote.guess] = (voteCount[vote.guess] || 0) + 1;
      }
    });

    setVotes(voteCount);
    setNonVoterCount(nonVoters);
  };

  const handleVote = async (position: number) => {
    if (!roundId || !playerId || showResults) return;

    setSelectedArticle(position);

    try {
      const isCorrect = position === correctAnswer;
      console.log('🗳️  Voting:', { position, correctAnswer, isCorrect });

      // Use upsert to allow changing votes
      const { data, error } = await supabase
        .from('player_guesses')
        .upsert({
          game_round_id: roundId,
          player_id: playerId,
          guess: position,
          is_correct: isCorrect,
        }, {
          onConflict: 'game_round_id,player_id'
        })
        .select();

      if (error) {
        console.error('❌ Error inserting vote:', error);
        throw error;
      }

      console.log('✅ Vote recorded:', data);
      console.log('💾 Setting local state - playerWasCorrect:', isCorrect, 'playerGuess:', position);
      setHasVoted(true);
      setPlayerWasCorrect(isCorrect);
      setPlayerGuess(position);
      fetchVotes(); // Update vote counts immediately
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
      setSelectedArticle(null);
    }
  };

  const handleTimeUp = async () => {
    console.log('⏰ Time up! hasVoted:', hasVoted, 'playerGuess:', playerGuess, 'playerWasCorrect:', playerWasCorrect);

    // Always check the database for the player's vote to avoid stale closure issues
    if (playerId && roundId) {
      const { data: existingGuess } = await supabase
        .from('player_guesses')
        .select('guess, is_correct')
        .eq('game_round_id', roundId)
        .eq('player_id', playerId)
        .maybeSingle();

      if (existingGuess) {
        // Player has voted, use their result
        console.log('✅ Player voted, using database result:', existingGuess);
        setPlayerWasCorrect(existingGuess.is_correct);
        setPlayerGuess(existingGuess.guess);
      } else {
        // Player hasn't voted, record as incorrect
        console.log('❌ Player did not vote, recording as incorrect');
        try {
          const { error: insertError } = await supabase
            .from('player_guesses')
            .insert({
              game_round_id: roundId,
              player_id: playerId,
              guess: 0, // 0 indicates no guess
              is_correct: false,
            });

          if (insertError) {
            // If it's a duplicate key error, that's OK - it means they voted in a race condition
            if (insertError.code === '23505') {
              console.log('⚠️  Vote already exists (race condition), fetching...');
              const { data: raceGuess } = await supabase
                .from('player_guesses')
                .select('guess, is_correct')
                .eq('game_round_id', roundId)
                .eq('player_id', playerId)
                .single();

              if (raceGuess) {
                setPlayerWasCorrect(raceGuess.is_correct);
                setPlayerGuess(raceGuess.guess);
              }
            } else {
              console.error('Error recording non-vote:', insertError);
            }
          } else {
            setPlayerWasCorrect(false);
            setPlayerGuess(0);
          }
        } catch (error) {
          console.error('Error recording non-vote:', error);
        }
      }
    }

    setShowResults(true);
    fetchVotes();
  };


  const handleNextRound = () => {
    navigate('/dashboard');
  };


  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  if (loading) {
    return (
      <div className="game-play-container">
        <h1>Loading round...</h1>
      </div>
    );
  }

  console.log('🎮 Render state - playerId:', playerId, 'showResults:', showResults, 'playerWasCorrect:', playerWasCorrect);

  return (
    <div className="game-play-container">
      <div className="game-header">
        <h1>Three Truths and a Lie</h1>
        {!showResults && (
          <div className="timer">
            <span className={timeRemaining <= 10 ? 'timer-warning' : ''}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>


      <p className="instructions">
        {showResults
          ? 'Round complete! See the results below.'
          : 'Which article is the lie? Click to vote!'}
      </p>

      <div className="articles-grid">
        {articles.map((article) => (
          <div
            key={article.position}
            className={`article-card ${
              selectedArticle === article.position ? 'selected' : ''
            } ${showResults && article.isLie ? 'lie-article' : ''} ${
              showResults && !article.isLie ? 'true-article' : ''
            } ${showResults && playerGuess === article.position ? 'player-voted' : ''}`}
            onClick={() => !showResults && handleVote(article.position)}
          >
            <div className="article-number">Article {article.position}</div>
            <h3 className="article-title">{article.title}</h3>
            {article.url && article.url !== 'none' && !showResults && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="article-link"
                onClick={(e) => e.stopPropagation()}
              >
                Read more
              </a>
            )}
            {(showResults ? (playerGuess === article.position || (!playerGuess && selectedArticle === article.position)) : selectedArticle === article.position) && (
              <div className="vote-checkmark">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}
            {showResults && (
              <div className="vote-count">
                {votes[article.position] || 0} vote(s)
              </div>
            )}
            {showResults && article.isLie && (
              <div className="lie-badge">This was the lie!</div>
            )}
          </div>
        ))}
      </div>

      {hasVoted && !showResults && (
        <div className="voted-message">
          <p>Vote submitted! You can change your vote until time runs out.</p>
        </div>
      )}

      {showResults && playerWasCorrect !== null && (
        <div className={`player-result ${playerWasCorrect ? 'correct' : 'incorrect'}`}>
          {playerWasCorrect ? 'Correct!' : 'Incorrect'}
        </div>
      )}

      {showResults && nonVoterCount > 0 && (
        <div className="non-voter-message">
          <p>{nonVoterCount} player{nonVoterCount !== 1 ? 's' : ''} didn't vote (marked incorrect)</p>
        </div>
      )}

      {showResults && (
        <button className="primary-button" onClick={handleNextRound}>
          View Results
        </button>
      )}
    </div>
  );
}

export default GamePlay;
