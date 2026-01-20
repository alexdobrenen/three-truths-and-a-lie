# Three Truths and a Lie - Team Game

A React/TypeScript web application for playing Three Truths and a Lie with real news articles and AI-generated fake headlines.

## Features

- QR code generation for easy game access
- Real-time multiplayer gameplay
- Pre-curated news articles with AI-generated lies
- 1-minute timed rounds
- Player statistics and last game results
- Dark mode UI

## Quick Start

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a project at [supabase.com](https://supabase.com)
   - Run `supabase/schema.sql` in SQL Editor
   - Run `supabase/migration_simplify_articles.sql` for latest schema

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. Run the app:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Schema

The application uses the following tables:

- `players`: Stores player information
- `game_sessions`: Tracks individual game sessions
- `game_participants`: Links players to game sessions
- `game_rounds`: Stores articles in position order with correct answer
- `player_guesses`: Records player guesses and correctness

## How to Play

1. A host creates a new game session
2. A QR code is displayed for players to scan and join
3. Players enter their name
4. Once all players have joined, the host starts the game
5. The game presents 4 articles (3 true, 1 fake) from `headlines.json`
6. Players have 1 minute to vote on which article is the lie
7. Results are displayed with vote counts and correct answer
8. View statistics on the Dashboard

## Headlines

Game content is managed in `public/headlines.json`. Each round contains:
- 4 articles in a specific order
- One article marked with `isLie: true`
- URLs for true articles only
- Each round can only be used once globally

## Tech Stack

- React + TypeScript
- Vite
- Supabase (Backend & Database)
- QRCode.react
- React Router

## Deployment

The app is configured for GitHub Pages deployment with SPA routing support.
