# Project Structure

## Overview

This document outlines the structure of the Three Truths and a Lie application.

## Directory Structure

```
three-truths-and-a-lie/
├── public/
│   ├── headlines.json           # Pre-curated article rounds
│   ├── devil-logo.png           # Favicon
│   └── 404.html                 # GitHub Pages SPA routing
├── src/
│   ├── assets/
│   │   ├── three-truths-and-a-lie-title.png
│   │   └── devil-logo.png
│   ├── lib/
│   │   └── supabase.ts          # Supabase client configuration
│   ├── pages/
│   │   ├── Home.tsx             # Landing page
│   │   ├── Home.css
│   │   ├── CreateGame.tsx       # Game creation and QR code
│   │   ├── CreateGame.css
│   │   ├── JoinGame.tsx         # Player join flow
│   │   ├── JoinGame.css
│   │   ├── GamePlay.tsx         # Main game interface
│   │   ├── GamePlay.css
│   │   ├── Dashboard.tsx        # Statistics display
│   │   └── Dashboard.css
│   ├── services/
│   │   └── newsService.ts       # Headlines.json loader
│   ├── App.tsx                  # Main app with routing
│   ├── App.css                  # Global styles
│   ├── main.tsx                 # Entry point
│   └── index.css                # Base styles
├── supabase/
│   ├── schema.sql               # Database schema
│   └── migration_simplify_articles.sql
├── .env.example
├── README.md
└── PROJECT_STRUCTURE.md
```

## Application Flow

### 1. Home Page (`/`)
- Entry point with New Game and Game Statistics buttons

### 2. Create Game (`/create`)
- Host enters name
- Creates game session in database
- Displays QR code for players to join
- Redirects to game play

### 3. Join Game (`/join/:gameId`)
- Accessed via QR code
- Players enter name
- Adds player to game session
- Redirects to game play

### 4. Game Play (`/play/:gameId`)
- Loads round from `headlines.json` (unique per game)
- Displays 4 articles in exact JSON order
- Players see their name in top right
- 60-second countdown timer
- Players vote on which article is the lie
- Results show vote counts and correct answer
- True articles display "Article Link" buttons

### 5. Dashboard (`/dashboard`)
- Last Game section: Shows each player's result and voted article
- Overall section: Player statistics sorted by correct guesses then accuracy

## Key Features

### Headlines System
- Articles stored in `public/headlines.json`
- Each round has 4 articles with one marked `isLie: true`
- Articles displayed in exact JSON order (no shuffling)
- Each headlines round can only be used once globally
- True articles have URLs, fake article has empty URL

### Real-time Updates
- Uses Supabase real-time subscriptions
- Vote counts update live during voting
- Timer synchronized across all players

### Database Schema
- **players**: Stores player names
- **game_sessions**: Tracks games with status (lobby/playing/completed)
- **game_participants**: Links players to sessions
- **game_rounds**: Stores all 4 articles in order (`article_1_title/url` through `article_4_title/url`) with `correct_answer` indicating lie position (1-4)
- **player_guesses**: Records votes and correctness

### Dark Mode UI
- Black background (#000)
- Dark containers (#1a1a1a, #0a0a0a)
- Gray borders (#333)
- White text (#fff)
- Green for correct (#4caf50)
- Red for incorrect (#ff4444)

## State Management

- React useState for local state
- Supabase real-time for shared state
- URL params for game ID
- React Router location state for player ID

## Styling

- Component-scoped CSS files
- Dark mode throughout
- Responsive design with mobile support
- Grid layouts for statistics cards
- Flexbox for component alignment
