import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './WaitingRoom.css';

function WaitingRoom() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { playerId } = location.state as { playerId: string };

  useEffect(() => {
    if (!gameId) return;

    // Check game status immediately
    checkGameStatus();

    // Set up polling (every 1 second)
    const pollInterval = setInterval(() => {
      checkGameStatus();
    }, 1000);

    // Set up realtime subscription
    const channel = supabase
      .channel(`waiting-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log('Waiting room - game status update:', payload);
          if (payload.new.status === 'playing') {
            navigate(`/play/${gameId}`, { state: { playerId } });
          }
        }
      )
      .subscribe((status) => {
        console.log('Waiting room subscription status:', status);
      });

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [gameId, navigate, playerId]);

  const checkGameStatus = async () => {
    if (!gameId) return;

    try {
      const { data: session, error } = await supabase
        .from('game_sessions')
        .select('status')
        .eq('id', gameId)
        .single();

      if (error) {
        console.error('Error checking game status:', error);
        return;
      }

      if (session.status === 'playing') {
        console.log('Game started! Navigating to play...');
        navigate(`/play/${gameId}`, { state: { playerId } });
      }
    } catch (error) {
      console.error('Error checking game status:', error);
    }
  };

  return (
    <div className="waiting-room-container">
      <div className="waiting-content">
        <h1>Ready to Play!</h1>
        <p>You've successfully joined the game</p>

        <div className="spinner">
          <div className="bounce1"></div>
          <div className="bounce2"></div>
          <div className="bounce3"></div>
        </div>

        <p className="waiting-text">Waiting for the game to start...</p>

        <div className="info-box">
          <p>The host will start the game when everyone has joined.</p>
          <p>Keep this page open!</p>
        </div>
      </div>
    </div>
  );
}

export default WaitingRoom;
