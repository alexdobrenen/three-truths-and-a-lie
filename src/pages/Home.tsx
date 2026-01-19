import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Three Truths and a Lie</h1>
      <p className="subtitle">Test your news knowledge with your team!</p>

      <div className="button-container">
        <button
          className="primary-button"
          onClick={() => navigate('/create')}
        >
          Create New Game
        </button>

        <button
          className="secondary-button"
          onClick={() => navigate('/dashboard')}
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
}

export default Home;
