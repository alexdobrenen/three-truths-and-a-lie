# Three Truths and a Lie - Team Game

A React/TypeScript web application for playing Three Truths and a Lie with teams, featuring real news articles and progress tracking.

## Features

- QR code generation for easy game access
- Team-based player management
- Real-time news article integration
- 1-minute timed rounds
- Score tracking and historical data
- Team progress dashboard

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a project at [supabase.com](https://supabase.com)
   - Run `supabase/schema.sql` in SQL Editor
   - Optionally run `supabase/seed.sql` for sample teams

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

- `teams`: Stores team information
- `players`: Stores player information linked to teams
- `game_sessions`: Tracks individual game sessions
- `game_participants`: Links players to game sessions
- `game_rounds`: Stores the articles and answers for each round
- `player_guesses`: Records player guesses and scores

See `supabase/schema.sql` for the complete schema.

## How to Play

1. A host creates a new game session
2. A QR code is displayed for players to scan and join
3. Players select their team and enter their name
4. Once all players have joined, the host starts the game
5. The game presents 4 articles (3 true, 1 fake)
6. Players have 1 minute to vote on which article is the lie
7. Scores are calculated and progress is tracked over time

## Tech Stack

- React + TypeScript
- Vite
- Supabase (Backend & Database)
- QRCode.react
- React Router
- News API
