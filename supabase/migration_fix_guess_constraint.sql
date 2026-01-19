-- Migration to update player_guesses table to allow guess value of 0 for non-voters
-- Run this in your Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE player_guesses DROP CONSTRAINT IF EXISTS player_guesses_guess_check;

-- Add the new constraint that allows 0-4
ALTER TABLE player_guesses ADD CONSTRAINT player_guesses_guess_check CHECK (guess BETWEEN 0 AND 4);
