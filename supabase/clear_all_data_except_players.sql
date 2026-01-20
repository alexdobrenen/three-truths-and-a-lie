-- Script to delete all data from all tables except the players table
-- Run this in your Supabase SQL Editor
-- WARNING: This will permanently delete data. Make sure you want to do this!

-- Delete in order to respect foreign key constraints

-- Delete player guesses first (references game_rounds and players)
DELETE FROM player_guesses;

-- Delete game rounds (references game_sessions)
DELETE FROM game_rounds;

-- Delete game participants (references game_sessions and players)
DELETE FROM game_participants;

-- Delete game sessions
DELETE FROM game_sessions;


-- Verify the deletions
SELECT 'player_guesses' as table_name, COUNT(*) as remaining_rows FROM player_guesses
UNION ALL
SELECT 'game_rounds', COUNT(*) FROM game_rounds
UNION ALL
SELECT 'game_participants', COUNT(*) FROM game_participants
UNION ALL
SELECT 'game_sessions', COUNT(*) FROM game_sessions
UNION ALL
SELECT 'players', COUNT(*) FROM players;
