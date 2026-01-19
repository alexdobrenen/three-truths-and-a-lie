-- Create teams table
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_sessions table
CREATE TABLE game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT CHECK (status IN ('lobby', 'playing', 'completed')) DEFAULT 'lobby',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create game_participants table
CREATE TABLE game_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_session_id, player_id)
);

-- Create game_rounds table
CREATE TABLE game_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  true_article_1 TEXT NOT NULL,
  true_article_1_url TEXT NOT NULL,
  true_article_2 TEXT NOT NULL,
  true_article_2_url TEXT NOT NULL,
  true_article_3 TEXT NOT NULL,
  true_article_3_url TEXT NOT NULL,
  lie_article TEXT NOT NULL,
  correct_answer INTEGER CHECK (correct_answer BETWEEN 1 AND 4) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(game_session_id, round_number)
);

-- Create player_guesses table
CREATE TABLE player_guesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_round_id UUID REFERENCES game_rounds(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  guess INTEGER CHECK (guess BETWEEN 0 AND 4) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  guessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_round_id, player_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_game_participants_session_id ON game_participants(game_session_id);
CREATE INDEX idx_game_participants_player_id ON game_participants(player_id);
CREATE INDEX idx_game_rounds_session_id ON game_rounds(game_session_id);
CREATE INDEX idx_player_guesses_round_id ON player_guesses(game_round_id);
CREATE INDEX idx_player_guesses_player_id ON player_guesses(player_id);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_guesses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
CREATE POLICY "Allow public read access on teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert on teams" ON teams FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert on players" ON players FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public access on game_sessions" ON game_sessions FOR ALL USING (true);
CREATE POLICY "Allow public access on game_participants" ON game_participants FOR ALL USING (true);
CREATE POLICY "Allow public access on game_rounds" ON game_rounds FOR ALL USING (true);
CREATE POLICY "Allow public access on player_guesses" ON player_guesses FOR ALL USING (true);
