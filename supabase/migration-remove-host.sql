-- Migration to remove host requirements from the schema
-- Run this in your Supabase SQL Editor if you've already created the tables

-- Remove host_id from game_sessions and is_host from game_participants
ALTER TABLE game_sessions DROP COLUMN IF EXISTS host_id;
ALTER TABLE game_participants DROP COLUMN IF EXISTS is_host;
