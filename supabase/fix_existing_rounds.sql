-- Script to fix existing game_rounds that don't have headlines_round_id set
-- This will help if you have old rounds created before the migration

-- WARNING: This is a best-effort script that tries to match existing rounds
-- to headlines.json rounds based on article titles. It may not be 100% accurate.

-- Option 1: Delete all existing rounds (start fresh)
-- Uncomment these lines if you want to delete all existing game data:
-- DELETE FROM player_guesses;
-- DELETE FROM game_rounds;
-- DELETE FROM game_participants;
-- DELETE FROM game_sessions;

-- Option 2: Just view rounds that are missing headlines_round_id
SELECT
  id,
  game_session_id,
  headlines_round_id,
  true_article_1,
  lie_article,
  created_at
FROM game_rounds
WHERE headlines_round_id IS NULL
ORDER BY created_at DESC;

-- Check total count
SELECT
  COUNT(*) as total_rounds,
  COUNT(headlines_round_id) as rounds_with_headline_id,
  COUNT(*) - COUNT(headlines_round_id) as rounds_missing_headline_id
FROM game_rounds;
