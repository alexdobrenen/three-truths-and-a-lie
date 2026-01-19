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

function Dashboard() {
  const navigate = useNavigate();
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayerStats();
  }, []);

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

      statsArray.sort((a, b) => b.accuracy - a.accuracy);
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
      <div className="dashboard-header">
        <h1>Game Dashboard</h1>
        <button className="secondary-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>

      <div className="stats-section">
        <h2>Player Statistics</h2>
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
