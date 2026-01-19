# Unique Rounds Implementation

This document explains the implementation of unique round tracking to ensure each round from `headlines.json` can only be used once per game.

## Overview

The system now tracks which rounds from `headlines.json` have been used in each game session and ensures no round is repeated within the same game.

## Database Changes

### Migration Required

Run this SQL script in your Supabase SQL Editor:
```sql
-- File: supabase/migration_add_headlines_round_id.sql

ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS headlines_round_id INTEGER;

ALTER TABLE game_rounds ADD CONSTRAINT unique_headlines_round_per_game
  UNIQUE(game_session_id, headlines_round_id);

CREATE INDEX IF NOT EXISTS idx_game_rounds_headlines_round_id
  ON game_rounds(headlines_round_id);
```

This adds:
- `headlines_round_id` column to track which round from headlines.json was used
- Unique constraint to prevent the same round being used twice in one game
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
- Fetches previously used round IDs from database before creating new round
- Passes used round IDs to `fetchArticlesAndGenerateLie()`
- Saves the `headlines_round_id` when creating a new round

**Flow:**
1. Query database for all `headlines_round_id` values in current game session
2. Pass array of used IDs to newsService
3. NewsService selects random unused round
4. Save the round ID to database when creating the round

## Behavior

### Normal Operation
- Each game can use rounds 1, 2, 3 (from headlines.json) exactly once
- Rounds are selected randomly from unused rounds
- Console logs show which rounds have been used

### When All Rounds Are Used
If a game tries to create a round after all rounds have been used:
```
Error: No more unused rounds available. All rounds have been used in this game.
```

## Testing

1. **Run the migration** in Supabase SQL Editor
2. **Start a new game** and play multiple rounds
3. **Check console logs** to see:
   - "📊 Already used X rounds in this game: [1, 2]"
   - "📰 Using round 3 (2 rounds already used)"
4. **Verify in database** that `headlines_round_id` is being saved and no duplicates exist per game

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
