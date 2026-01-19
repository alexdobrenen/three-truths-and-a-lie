# Changes Made - Removing Host Concept

## Summary

The application has been updated to remove the host concept. Now any player can start the game once there are at least 2 players in the lobby.

## What Changed

### 1. Create Game Flow
**Before:**
- User had to select team and enter their name to create a game
- Creator became the "host"

**After:**
- Just click "Create Game" - no name or team selection needed
- QR code is displayed immediately
- Anyone can go to the lobby

### 2. Game Lobby
**Before:**
- Only the host could see the "Start Game" button
- Non-hosts saw "Waiting for host to start..."
- Players had "Host" badge displayed

**After:**
- Everyone sees the "Start Game" button
- Button is disabled until 2+ players join
- No host badges displayed

### 3. Game Play
**Before:**
- Only the host would initialize the game round
- Non-hosts would fetch the round created by the host

**After:**
- First player to reach the play page creates the round
- If round already exists, it's fetched
- Handles race conditions with duplicate key detection

### 4. Database Schema
**Before:**
```sql
CREATE TABLE game_sessions (
  ...
  host_id UUID REFERENCES players(id) ON DELETE CASCADE,
  ...
);

CREATE TABLE game_participants (
  ...
  is_host BOOLEAN DEFAULT FALSE,
  ...
);
```

**After:**
```sql
CREATE TABLE game_sessions (
  ...
  -- host_id removed
  ...
);

CREATE TABLE game_participants (
  ...
  -- is_host removed
  ...
);
```

## Files Modified

1. **src/pages/CreateGame.tsx**
   - Removed host name input
   - Removed team selection (moved to join flow only)
   - Simplified to just create a session

2. **src/pages/GameLobby.tsx**
   - Removed `isHost` check
   - Everyone can start the game
   - Removed host badge display

3. **src/pages/GamePlay.tsx**
   - Removed host-only round initialization
   - Added `checkAndInitializeRound()` that handles both creating and fetching
   - Race condition handling for multiple players trying to create round

4. **src/pages/JoinGame.tsx**
   - Removed `isHost: false` flag when joining

5. **src/lib/supabase.ts**
   - Updated TypeScript types to remove `host_id` and `is_host`

6. **supabase/schema.sql**
   - Updated schema to remove host concept

## Migration Guide

If you've already set up your database with the old schema, run this SQL in your Supabase SQL Editor:

```sql
-- Migration to remove host requirements
ALTER TABLE game_sessions DROP COLUMN IF EXISTS host_id;
ALTER TABLE game_participants DROP COLUMN IF EXISTS is_host;
```

Or run the contents of `supabase/migration-remove-host.sql`.

## New User Flow

1. Someone clicks "Create Game"
2. QR code is generated with game link
3. Players scan QR code or visit link
4. Players select their team and name
5. Players join the lobby
6. Anyone can click "Start Game" (needs 2+ players)
7. Game begins - first player to enter creates the round
8. Everyone plays simultaneously
