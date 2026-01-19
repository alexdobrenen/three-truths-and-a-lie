# Setup Guide

This guide will walk you through setting up the Three Truths and a Lie application.

## Prerequisites

Before you begin, make sure you have:
- Node.js v18 or higher installed
- A Supabase account (free tier works fine)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: "three-truths-and-a-lie" (or any name you prefer)
   - Database Password: Choose a strong password (save it somewhere safe)
   - Region: Choose the closest region to your users
4. Click "Create new project" and wait for setup to complete

### Set Up the Database Schema

1. In your Supabase project dashboard, go to the **SQL Editor** (in the left sidebar)
2. Click "New Query"
3. Copy the contents of `supabase/schema.sql` and paste it into the editor
4. Click "Run" to execute the SQL

### (Optional) Add Sample Team Data

1. In the SQL Editor, click "New Query"
2. Copy the contents of `supabase/seed.sql` and paste it into the editor
3. Click "Run" to add sample teams (Engineering, Product, Marketing, Sales, Design)

### Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Project Settings** (gear icon in sidebar)
2. Go to **API** section
3. You'll need two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

## Step 3: Add Your Headlines

The app uses headlines from a JSON file that you can customize:

1. Open `public/headlines.json` in your code editor
2. The file contains rounds of headlines - each round has:
   - 3 true headlines (with title, URL, and source)
   - 1 fake headline (with title and source)
3. You can add as many rounds as you want
4. The game will cycle through the rounds automatically

Example structure:
```json
{
  "rounds": [
    {
      "id": 1,
      "trueHeadlines": [
        {
          "title": "Your real headline here",
          "url": "https://example.com/article",
          "source": "News Source"
        }
      ],
      "fakeHeadline": {
        "title": "Your fake headline here",
        "source": "Fake News"
      }
    }
  ]
}
```

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your values:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Replace:
   - `your_supabase_project_url` with the Project URL from Step 2
   - `your_supabase_anon_key` with the anon/public key from Step 2

## Step 5: Run the Application

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Testing the Application

### Create Your First Game

1. Open the app in your browser
2. Click "Create New Game"
3. Select a team (if you ran seed.sql, you'll see sample teams)
4. Enter your name
5. Click "Create Game"
6. A QR code will be displayed

### Join the Game (Multiple Devices)

1. Scan the QR code with your phone or open the join URL in another browser window
2. Select your team and enter your name
3. Click "Join Game"
4. You'll see yourself in the lobby

### Play the Game

1. As the host, click "Start Game" when ready
2. The game will display 4 headlines (3 true, 1 fake) from your `headlines.json` file
3. You have 60 seconds to vote on which headline is the lie
4. Click on a headline to vote
5. After time expires, results are shown
6. View the dashboard to see team and player statistics

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env` file exists and has the correct values
- Restart the dev server after changing `.env`

### QR code doesn't work
- Make sure your phone is on the same network
- Try using the URL directly instead of scanning

### No headlines showing or using mock data
- Make sure `public/headlines.json` exists and is valid JSON
- Check browser console for any errors loading the file
- Verify the JSON structure matches the expected format
- The app will fall back to mock data if the headlines file can't be loaded

### Database errors
- Verify you ran the `schema.sql` script correctly
- Check that Row Level Security policies are set up correctly
- Make sure your Supabase project is active

## Next Steps

### Add More Teams

You can add more teams directly in Supabase:

1. Go to your Supabase project
2. Click on **Table Editor**
3. Select the `teams` table
4. Click "Insert row" and add team names

### Customize the Game

- Edit `public/headlines.json` to add your own headlines
- Adjust the timer duration in `src/pages/GamePlay.tsx`
- Update the fallback mock data in `src/services/newsService.ts` if needed

## Deployment

To deploy the application:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service of choice:
   - Vercel
   - Netlify
   - GitHub Pages
   - Any static hosting service

3. Make sure to set your environment variables in your hosting service's settings

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Make sure your Supabase database schema is up to date
