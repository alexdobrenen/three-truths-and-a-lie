-- Migration to make headlines_round_id globally unique
-- This ensures each round from headlines.json can only be used once EVER

-- First, drop the old per-game-session constraint if it exists
ALTER TABLE game_rounds DROP CONSTRAINT IF EXISTS unique_headlines_round_per_game;

-- Add the headlines_round_id column if it doesn't exist
ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS headlines_round_id INTEGER;

-- Add a GLOBAL unique constraint - each headlines_round_id can only be used once
ALTER TABLE game_rounds ADD CONSTRAINT unique_headlines_round_global
  UNIQUE(headlines_round_id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_rounds_headlines_round_id
  ON game_rounds(headlines_round_id);
