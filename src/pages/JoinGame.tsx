import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './JoinGame.css';

interface Player {
  id: string;
  name: string;
}

function JoinGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingPlayers, setExistingPlayers] = useState<Player[]>([]);
  const [showNewPlayerInput, setShowNewPlayerInput] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    fetchExistingPlayers();
  }, []);

  const fetchExistingPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setExistingPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleSelectExistingPlayer = async (playerId: string) => {
    if (!gameId) return;

    setLoading(true);
    setSelectedPlayerId(playerId);

    try {
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          game_session_id: gameId,
          player_id: playerId,
        });

      if (participantError) {
        if (participantError.code === '23505') {
          alert('You have already joined this game!');
          navigate(`/waiting/${gameId}`, { state: { playerId } });
          return;
        }
        throw participantError;
      }

      navigate(`/waiting/${gameId}`, { state: { playerId } });
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game. Please try again.');
      setLoading(false);
      setSelectedPlayerId(null);
    }
  };

  const handleCreateNewPlayer = async () => {
    if (!gameId) return;

    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      const { data: player, error: playerError} = await supabase
        .from('players')
        .insert({ name: playerName.trim() })
        .select()
        .single();

      if (playerError) throw playerError;

      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          game_session_id: gameId,
          player_id: player.id,
        });

      if (participantError) {
        if (participantError.code === '23505') {
          alert('You have already joined this game!');
          navigate(`/waiting/${gameId}`, { state: { playerId: player.id } });
          return;
        }
        throw participantError;
      }

      navigate(`/waiting/${gameId}`, { state: { playerId: player.id } });
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="join-game-container">
      <h1>Join Game</h1>
      <p>{showNewPlayerInput ? 'Enter your name to join' : 'Select your name or add new'}</p>

      <div className="form-container">
        {!showNewPlayerInput ? (
          <>
            <div className="form-group">
              <label htmlFor="player-select">Select Your Name</label>
              <select
                id="player-select"
                className="player-dropdown"
                value={selectedPlayerId || ''}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                disabled={loading}
              >
                <option value="">Choose your name...</option>
                {existingPlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="primary-button"
              onClick={() => selectedPlayerId && handleSelectExistingPlayer(selectedPlayerId)}
              disabled={loading || !selectedPlayerId}
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>

            <button
              className="secondary-button"
              onClick={() => setShowNewPlayerInput(true)}
              disabled={loading}
            >
              I'm a new player
            </button>
          </>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              className="primary-button"
              onClick={handleCreateNewPlayer}
              disabled={loading || !playerName.trim()}
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>

            <button
              className="secondary-button"
              onClick={() => setShowNewPlayerInput(false)}
              disabled={loading}
            >
              Back to player list
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default JoinGame;
