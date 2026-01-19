# Project Structure

## Overview

This document outlines the structure of the Three Truths and a Lie application.

## Directory Structure

```
three-truths-and-a-lie/
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Supabase client configuration and types
│   ├── pages/
│   │   ├── Home.tsx             # Landing page with Create/Dashboard buttons
│   │   ├── Home.css
│   │   ├── CreateGame.tsx       # Game creation and QR code display
│   │   ├── CreateGame.css
│   │   ├── JoinGame.tsx         # Player join flow with team selection
│   │   ├── JoinGame.css
│   │   ├── GameLobby.tsx        # Pre-game lobby with player list
│   │   ├── GameLobby.css
│   │   ├── GamePlay.tsx         # Main game interface with timer
│   │   ├── GamePlay.css
│   │   ├── Dashboard.tsx        # Statistics and leaderboards
│   │   └── Dashboard.css
│   ├── services/
│   │   └── newsService.ts       # News API integration and mock data
│   ├── App.tsx                  # Main app component with routing
│   ├── App.css                  # Global styles
│   ├── main.tsx                 # Entry point
│   └── index.css                # Base CSS reset and global styles
├── supabase/
│   ├── schema.sql               # Database schema definition
│   └── seed.sql                 # Sample team data
├── .env.example                 # Environment variable template
├── README.md                    # Project overview
├── SETUP.md                     # Detailed setup instructions
└── PROJECT_STRUCTURE.md         # This file

```

## Application Flow

### 1. Home Page (`/`)
- Entry point of the application
- Options to create a new game or view dashboard

### 2. Create Game Flow (`/create`)
- Host selects their team and enters name
- Creates game session in database
- Displays QR code for players to join
- Redirects to lobby

### 3. Join Game Flow (`/join/:gameId`)
- Accessed via QR code or direct link
- Players select team from dropdown
- Players can find existing name or register as new
- Adds player to game session
- Redirects to lobby

### 4. Game Lobby (`/lobby/:gameId`)
- Shows all joined players
- Real-time updates when players join
- Host can start game when ready (minimum 2 players)
- Non-hosts wait for game to start

### 5. Game Play (`/play/:gameId`)
- Host generates 3 true articles + 1 lie
- All players see the same articles
- 60-second countdown timer
- Players vote on which article is the lie
- Real-time vote tracking
- Results displayed after timer expires

### 6. Dashboard (`/dashboard`)
- Team statistics (games played, accuracy)
- Player statistics (filterable by team)
- Historical performance tracking

## Key Features

### Real-time Updates
- Uses Supabase real-time subscriptions
- Lobby updates when players join
- Vote counts update as players vote
- Game state changes trigger navigation

### QR Code Generation
- Dynamically generates QR codes for game sessions
- Contains join URL with game ID
- Makes mobile joining seamless

### News Integration
- Fetches real news articles from News API
- Falls back to mock data if API unavailable
- Generates humorous fake articles for the "lie"

### Team Management
- Players organized by teams
- Team-based statistics tracking
- Searchable player lists per team

### Scoring System
- Tracks correct/incorrect guesses
- Calculates team and individual accuracy
- Maintains historical data across sessions

## Database Schema

### Tables

1. **teams**
   - Stores team information
   - Referenced by players

2. **players**
   - Stores player names
   - Links to teams
   - Unique constraint on (name, team_id)

3. **game_sessions**
   - Tracks individual game instances
   - Has host player
   - Status: lobby, playing, completed

4. **game_participants**
   - Many-to-many relationship
   - Links players to game sessions
   - Tracks host status

5. **game_rounds**
   - Stores article data for each round
   - Links to game session
   - Contains correct answer position

6. **player_guesses**
   - Records individual votes
   - Links to round and player
   - Stores correctness of guess

## Component Architecture

### Page Components
- Self-contained pages with routing
- Handle data fetching and mutations
- Manage local state

### Services
- `newsService.ts`: External API integration
- Separates business logic from UI

### Lib
- `supabase.ts`: Database client and types
- Type-safe database operations

## Styling Approach

- Component-scoped CSS files
- Global styles in `App.css` and `index.css`
- Consistent color scheme (purple gradient theme)
- Responsive design with mobile support
- CSS Grid for layouts
- Flexbox for component alignment

## State Management

- React's built-in useState for local state
- No external state management library
- Supabase real-time for shared state
- URL params for routing state
- React Router location state for navigation data

## Security Considerations

- Row Level Security enabled on all tables
- Public access policies (adjust for production)
- Environment variables for sensitive keys
- No direct secret exposure in code

## Future Enhancement Ideas

- Multiple rounds per game
- Different difficulty levels
- Custom article categories
- Team tournaments
- Achievement badges
- Social sharing
- Mobile app version
- Admin dashboard for team management
