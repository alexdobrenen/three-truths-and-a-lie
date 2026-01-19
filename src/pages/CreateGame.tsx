import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import './CreateGame.css';

interface Participant {
  id: string;
  player_id: string;
  players: {
    name: string;
  };
}

function CreateGame() {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [startingGame, setStartingGame] = useState(false);

  useEffect(() => {
    const createGameOnMount = async () => {
      setLoading(true);

      try {
        const { data: session, error: sessionError } = await supabase
          .from('game_sessions')
          .insert({ status: 'lobby' })
          .select()
          .single();

        if (sessionError) throw sessionError;

        setGameId(session.id);
        setLoading(false);
      } catch (error) {
        console.error('Error creating game:', error);
        alert('Failed to create game. Please try again.');
        setLoading(false);
        navigate('/');
      }
    };

    createGameOnMount();
  }, [navigate]);

  useEffect(() => {
    if (!gameId) return;

    fetchParticipants();

    // Set up polling as fallback (every 2 seconds)
    const pollInterval = setInterval(() => {
      fetchParticipants();
    }, 2000);

    // Set up realtime subscription
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `game_session_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchParticipants();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log('Game status update:', payload);
          if (payload.new.status === 'playing') {
            navigate(`/play/${gameId}`);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [gameId, navigate]);

  const fetchParticipants = async () => {
    if (!gameId) return;

    const { data, error } = await supabase
      .from('game_participants')
      .select(`
        id,
        player_id,
        players (
          name
        )
      `)
      .eq('game_session_id', gameId)
      .order('joined_at');

    if (error) {
      console.error('Error fetching participants:', error);
    } else {
      setParticipants((data as any) || []);
    }
  };

  const handleStartGame = async () => {
    if (!gameId) return;

    if (participants.length < 2) {
      alert('You need at least 2 players to start the game');
      return;
    }

    console.log('Starting game with', participants.length, 'players');
    setStartingGame(true);

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .update({ status: 'playing', started_at: new Date().toISOString() })
        .eq('id', gameId)
        .select();

      if (error) throw error;

      console.log('Game status updated successfully:', data);
      navigate(`/play/${gameId}`);
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
      setStartingGame(false);
    }
  };

  if (loading) {
    return (
      <div className="create-game-container">
        <h1>Creating game...</h1>
      </div>
    );
  }

  if (!gameId) {
    return null;
  }

  const joinUrl = `${window.location.origin}${import.meta.env.BASE_URL}join/${gameId}`;

  return (
    <div className="create-game-container">
      <h1>Scan to Join!</h1>
      <p>Share this QR code with your team</p>

      <div className="qr-code-container">
        <QRCodeSVG value={joinUrl} size={256} />
      </div>

      <div className="join-url">
        <p>Or visit:</p>
        <code>{joinUrl}</code>
      </div>

      <div className="participants-list">
        <h2>Players ({participants.length})</h2>
        {participants.length === 0 ? (
          <p className="no-players">Waiting for players to join...</p>
        ) : (
          <div className="participants-grid">
            {participants.map((participant) => (
              <div key={participant.id} className="participant-card">
                <div className="participant-name">{participant.players.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="primary-button"
        onClick={handleStartGame}
        disabled={startingGame || participants.length < 2}
      >
        {startingGame ? 'Starting...' : 'Start Game'}
      </button>

      {participants.length < 2 && (
        <div className="waiting-message">
          <p>Need at least 2 players to start</p>
        </div>
      )}
    </div>
  );
}

export default CreateGame;
