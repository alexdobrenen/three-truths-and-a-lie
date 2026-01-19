# Enabling Realtime in Supabase

For the live player updates to work instantly on the Create Game page, you need to enable Realtime replication in your Supabase project.

## Steps to Enable Realtime:

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication** in the left sidebar
3. Find the `game_participants` table
4. Toggle the switch to **enable replication** for this table
5. Optionally, also enable it for `game_sessions` table

## How It Works:

- **With Realtime enabled**: Players appear instantly as they join (uses WebSocket)
- **Without Realtime**: Players appear within 2 seconds (uses polling fallback)

The app will work either way, but Realtime provides the best experience!

## Troubleshooting:

If players still don't appear:

1. Open browser console (F12) on the Create Game page
2. Look for messages like:
   - `Subscription status: SUBSCRIBED` - Good! Realtime is working
   - `Realtime update received:` - Confirms updates are coming through

3. If you don't see these messages, check:
   - Supabase project is active
   - Database tables were created with the schema.sql
   - Row Level Security policies allow reads

## Fallback Polling:

The app automatically polls every 2 seconds for updates, so even without Realtime enabled, you'll see players join within a couple seconds. This ensures the app works regardless of Realtime configuration.
