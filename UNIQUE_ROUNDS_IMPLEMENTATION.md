# Unique Rounds Implementation

This document explains the implementation of unique round tracking to ensure each round from `headlines.json` can only be used once GLOBALLY across all games.

## Overview

The system now tracks which rounds from `headlines.json` have been used across ALL games and ensures no round can ever be repeated. Each round from headlines.json can only be used once globally.

## Database Changes

### Migration Required

Run this SQL script in your Supabase SQL Editor:
```sql
-- File: supabase/migration_global_unique_headlines.sql

-- Drop the old per-game-session constraint if it exists
ALTER TABLE game_rounds DROP CONSTRAINT IF EXISTS unique_headlines_round_per_game;

-- Add the headlines_round_id column if it doesn't exist
ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS headlines_round_id INTEGER;

-- Add a GLOBAL unique constraint - each headlines_round_id can only be used once
ALTER TABLE game_rounds ADD CONSTRAINT unique_headlines_round_global
  UNIQUE(headlines_round_id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_rounds_headlines_round_id
  ON game_rounds(headlines_round_id);
```

This adds:
- `headlines_round_id` column to track which round from headlines.json was used
- **Global** unique constraint to prevent the same round being used across any game
- Index for faster lookups

## Code Changes

### 1. newsService.ts

**Changes:**
- Added `roundId` to the `NewsWithLie` interface
- Modified `fetchArticlesAndGenerateLie()` to accept `usedRoundIds` parameter
- Changed from sequential round selection to random selection from unused rounds
- Throws error if all rounds have been used

**Usage:**
```typescript
// Get unused rounds by passing array of used round IDs
const { trueArticles, lieArticle, roundId } = await fetchArticlesAndGenerateLie([1, 2]);
```

### 2. GamePlay.tsx

**Changes:**
- Fetches ALL previously used round IDs from database globally (not per game session)
- Passes used round IDs to `fetchArticlesAndGenerateLie()`
- Saves the `headlines_round_id` when creating a new round

**Flow:**
1. Query database for ALL `headlines_round_id` values across all games
2. Pass array of used IDs to newsService
3. NewsService selects random unused round
4. Save the round ID to database when creating the round

## Behavior

### Normal Operation
- Each round from headlines.json can only be used once EVER
- Rounds are selected randomly from unused rounds
- Console logs show which rounds have been used globally
- You can play as many games as you have rounds in headlines.json

### When All Rounds Are Used
If you try to create a game after all rounds have been used globally:
```
Error: No more unused rounds available. All rounds have been used.
```

### Important Note
Once all rounds in headlines.json have been used, you will need to either:
1. Add more rounds to headlines.json
2. Clear the game_rounds table to reset (using clear_all_data_except_players.sql)
3. Manually delete specific rounds from the database to free them up

## Testing

1. **Run the migration** in Supabase SQL Editor (migration_global_unique_headlines.sql)
2. **Start a new game** and play it
3. **Start another game** and verify it uses a different round
4. **Check console logs** to see:
   - "📊 Already used X rounds globally: [1, 2]"
   - "📰 Using round 3 (2 rounds already used)"
5. **Verify in database** that `headlines_round_id` is being saved and no duplicates exist globally
6. **Try creating more games** than you have rounds in headlines.json to test the error message

## Headlines.json Structure

Ensure your `public/headlines.json` has rounds with unique IDs:
```json
{
  "rounds": [
    { "id": 1, "trueHeadlines": [...], "fakeHeadline": {...} },
    { "id": 2, "trueHeadlines": [...], "fakeHeadline": {...} },
    { "id": 3, "trueHeadlines": [...], "fakeHeadline": {...} }
  ]
}
```

## Future Enhancements

Possible improvements:
- Add ability to reset used rounds for a game
- Track round usage globally (across all games) if desired
- Add UI to show how many rounds remain unused
- Automatically end game when all rounds are used
