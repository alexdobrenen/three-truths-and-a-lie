-- Migration to simplify article storage
-- Drop old columns and add new cleaner schema

-- Drop old article columns
ALTER TABLE game_rounds DROP COLUMN IF EXISTS true_article_1;
ALTER TABLE game_rounds DROP COLUMN IF EXISTS true_article_1_url;
ALTER TABLE game_rounds DROP COLUMN IF EXISTS true_article_2;
ALTER TABLE game_rounds DROP COLUMN IF EXISTS true_article_2_url;
ALTER TABLE game_rounds DROP COLUMN IF EXISTS true_article_3;
ALTER TABLE game_rounds DROP COLUMN IF EXISTS true_article_3_url;
ALTER TABLE game_rounds DROP COLUMN IF EXISTS lie_article;

-- Add new columns for storing all 4 articles in order
ALTER TABLE game_rounds ADD COLUMN article_1_title TEXT NOT NULL;
ALTER TABLE game_rounds ADD COLUMN article_1_url TEXT NOT NULL;
ALTER TABLE game_rounds ADD COLUMN article_2_title TEXT NOT NULL;
ALTER TABLE game_rounds ADD COLUMN article_2_url TEXT NOT NULL;
ALTER TABLE game_rounds ADD COLUMN article_3_title TEXT NOT NULL;
ALTER TABLE game_rounds ADD COLUMN article_3_url TEXT NOT NULL;
ALTER TABLE game_rounds ADD COLUMN article_4_title TEXT NOT NULL;
ALTER TABLE game_rounds ADD COLUMN article_4_url TEXT NOT NULL;

-- The correct_answer column (1-4) already indicates which article is the lie
