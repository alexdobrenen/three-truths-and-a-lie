-- Diagnostic script to check headlines_round_id implementation

-- 1. Check if the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'game_rounds' AND column_name = 'headlines_round_id';

-- 2. Check if the unique constraint exists
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'game_rounds' AND constraint_name = 'unique_headlines_round_per_game';

-- 3. Check if the index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'game_rounds' AND indexname = 'idx_game_rounds_headlines_round_id';

-- 4. Check current game_rounds data
SELECT
  game_session_id,
  headlines_round_id,
  true_article_1,
  created_at
FROM game_rounds
ORDER BY created_at DESC
LIMIT 20;

-- 5. Check for duplicate headlines_round_id within same game_session_id
SELECT
  game_session_id,
  headlines_round_id,
  COUNT(*) as count
FROM game_rounds
WHERE headlines_round_id IS NOT NULL
GROUP BY game_session_id, headlines_round_id
HAVING COUNT(*) > 1;

-- 6. Count rounds per game session
SELECT
  game_session_id,
  COUNT(*) as total_rounds,
  COUNT(DISTINCT headlines_round_id) as unique_headline_rounds,
  array_agg(headlines_round_id ORDER BY created_at) as round_ids_used
FROM game_rounds
GROUP BY game_session_id
ORDER BY MAX(created_at) DESC
LIMIT 10;
