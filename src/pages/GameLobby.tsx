import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './GameLobby.css';

interface Participant {
  id: string;
  player_id: string;
  players: {
    name: string;
    teams: {
      name: string;
    };
  };
}

function GameLobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { playerId } = location.state as { playerId?: string };

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    fetchParticipants();

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
        () => {
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
          if (payload.new.status === 'playing') {
            navigate(`/play/${gameId}`, { state: { playerId } });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, navigate, playerId]);

  const fetchParticipants = async () => {
    if (!gameId) return;

    const { data, error } = await supabase
      .from('game_participants')
      .select(`
        id,
        player_id,
        players (
          name,
          teams (
            name
          )
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

    setLoading(true);

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({ status: 'playing', started_at: new Date().toISOString() })
        .eq('id', gameId);

      if (error) throw error;

      navigate(`/play/${gameId}`, { state: { playerId } });
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="game-lobby-container">
      <h1>Game Lobby</h1>
      <p>Waiting for players to join...</p>

      <div className="participants-list">
        <h2>Players ({participants.length})</h2>
        {participants.length === 0 ? (
          <p className="no-players">No players yet. Share the QR code or join link!</p>
        ) : (
          participants.map((participant) => (
            <div key={participant.id} className="participant-card">
              <div className="participant-info">
                <span className="participant-name">
                  {participant.players.name}
                </span>
                <span className="participant-team">
                  {participant.players.teams.name}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="primary-button"
        onClick={handleStartGame}
        disabled={loading || participants.length < 2}
      >
        {loading ? 'Starting...' : 'Start Game'}
      </button>

      {participants.length < 2 && (
        <div className="waiting-message">
          <p>Need at least 2 players to start the game</p>
        </div>
      )}
    </div>
  );
}

export default GameLobby;
