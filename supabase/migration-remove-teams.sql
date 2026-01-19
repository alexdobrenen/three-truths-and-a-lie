-- Migration to remove teams from the application
-- Run this in your Supabase SQL Editor if you've already created the tables

-- Remove team_id from players table
ALTER TABLE players DROP COLUMN IF EXISTS team_id;

-- Remove the unique constraint that included team_id
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_name_team_id_key;

-- Drop the teams table entirely
DROP TABLE IF EXISTS teams CASCADE;
