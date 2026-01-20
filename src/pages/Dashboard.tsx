import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

interface PlayerStats {
  player_name: string;
  correct_guesses: number;
  total_guesses: number;
  accuracy: number;
}

interface LastGameResult {
  player_name: string;
  is_correct: boolean;
  article_title: string;
  guess: number;
}

function Dashboard() {
  const navigate = useNavigate();
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [lastGameResults, setLastGameResults] = useState<LastGameResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayerStats();
    fetchLastGameResults();
  }, []);

  const fetchLastGameResults = async () => {
    try {
      // First, get the most recent completed game round
      const { data: latestRound, error: roundError } = await supabase
        .from('game_rounds')
        .select('id, article_1_title, article_2_title, article_3_title, article_4_title, correct_answer')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (roundError || !latestRound) {
        console.error('Error fetching latest round:', roundError);
        return;
      }

      // Get all player guesses for this round
      const { data: guesses, error: guessError } = await supabase
        .from('player_guesses')
        .select(`
          guess,
          is_correct,
          players!inner (
            name
          )
        `)
        .eq('game_round_id', latestRound.id);

      if (guessError) {
        console.error('Error fetching guesses:', guessError);
        return;
      }

      // Map the articles to their positions (all 4 in order)
      const articles = [
        latestRound.article_1_title,
        latestRound.article_2_title,
        latestRound.article_3_title,
        latestRound.article_4_title,
      ];

      const results: LastGameResult[] = guesses?.map((guess: any) => ({
        player_name: guess.players.name,
        is_correct: guess.is_correct,
        article_title: guess.guess > 0 ? articles[guess.guess - 1] : 'Did not vote',
        guess: guess.guess,
      })) || [];

      setLastGameResults(results);
    } catch (error) {
      console.error('Error fetching last game results:', error);
    }
  };

  const fetchPlayerStats = async () => {
    setLoading(true);
    try {
      const { data: guesses, error } = await supabase
        .from('player_guesses')
        .select(`
          is_correct,
          players!inner (
            id,
            name
          )
        `);

      if (error) throw error;

      const statsMap: { [playerId: string]: PlayerStats } = {};

      guesses?.forEach((guess: any) => {
        const playerId = guess.players.id;

        if (!statsMap[playerId]) {
          statsMap[playerId] = {
            player_name: guess.players.name,
            correct_guesses: 0,
            total_guesses: 0,
            accuracy: 0,
          };
        }

        statsMap[playerId].total_guesses++;
        if (guess.is_correct) {
          statsMap[playerId].correct_guesses++;
        }
      });

      const statsArray = Object.values(statsMap).map((stat) => ({
        ...stat,
        accuracy: stat.total_guesses > 0 ? (stat.correct_guesses / stat.total_guesses) * 100 : 0,
      }));

      statsArray.sort((a, b) => {
        // First sort by correct guesses (descending)
        if (b.correct_guesses !== a.correct_guesses) {
          return b.correct_guesses - a.correct_guesses;
        }
        // If correct guesses are equal, sort by accuracy (descending)
        return b.accuracy - a.accuracy;
      });
      setPlayerStats(statsArray);
    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <h1>Loading dashboard...</h1>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <button className="back-to-home-button" onClick={() => navigate('/')}>
        Home
      </button>
      <div className="dashboard-header">
        <h1>Game Statistics</h1>
      </div>

      {lastGameResults.length > 0 && (
        <div className="stats-section">
          <h2>Last Game</h2>
          <div className="last-game-results">
            {lastGameResults.map((result, index) => (
              <div key={index} className="last-game-result-card">
                <div className="result-player-name">{result.player_name}</div>
                <div className={`result-badge ${result.is_correct ? 'correct-badge' : 'incorrect-badge'}`}>
                  {result.is_correct ? 'Correct' : 'Incorrect'}
                </div>
                <div className="result-article-title">
                  {result.article_title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-section">
        <h2>Overall</h2>
        {playerStats.length === 0 ? (
          <p className="no-data">No player data available yet. Play some games to see stats!</p>
        ) : (
          <div className="stats-table">
            <div className="table-header">
              <div>Player</div>
              <div>Correct</div>
              <div>Total</div>
              <div>Accuracy</div>
            </div>
            {playerStats.map((stat, index) => (
              <div key={index} className="table-row">
                <div className="player-name">{stat.player_name}</div>
                <div>{stat.correct_guesses}</div>
                <div>{stat.total_guesses}</div>
                <div className="accuracy">{stat.accuracy.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
