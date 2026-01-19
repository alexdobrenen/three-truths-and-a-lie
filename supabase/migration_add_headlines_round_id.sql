-- Migration to add headlines_round_id to game_rounds table
-- This tracks which round from headlines.json was used for each game round
-- Run this in your Supabase SQL Editor

-- Add the headlines_round_id column
ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS headlines_round_id INTEGER;

-- Add a unique constraint to ensure each round can only be used once per game session
ALTER TABLE game_rounds ADD CONSTRAINT unique_headlines_round_per_game
  UNIQUE(game_session_id, headlines_round_id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_rounds_headlines_round_id
  ON game_rounds(headlines_round_id);
