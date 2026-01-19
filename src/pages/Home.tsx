import { useNavigate } from 'react-router-dom';
import './Home.css';
import titleImage from '../assets/three-truths-and-a-lie-title.png';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <img src={titleImage} alt="Three Truths and a Lie" style={{ maxWidth: '600px', width: '100%', marginBottom: '2rem' }} />

      <div className="button-container">
        <button
          className="primary-button"
          onClick={() => navigate('/create')}
        >
          New Game
        </button>

        <button
          className="secondary-button"
          onClick={() => navigate('/dashboard')}
        >
          Game Statistics
        </button>
      </div>
    </div>
  );
}

export default Home;
