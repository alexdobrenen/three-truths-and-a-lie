import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateGame from './pages/CreateGame';
import JoinGame from './pages/JoinGame';
import WaitingRoom from './pages/WaitingRoom';
import GamePlay from './pages/GamePlay';
import Dashboard from './pages/Dashboard';
import SetupRequired from './pages/SetupRequired';
import './App.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your_supabase') &&
  !supabaseAnonKey.includes('your_supabase');

function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="app">
        <SetupRequired />
      </div>
    );
  }

  return (
    <Router basename="/three-truths-and-a-lie">
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/join/:gameId" element={<JoinGame />} />
          <Route path="/waiting/:gameId" element={<WaitingRoom />} />
          <Route path="/play/:gameId" element={<GamePlay />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
