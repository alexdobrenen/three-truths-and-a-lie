# Deployment Guide - GitHub Pages

This guide will help you deploy your Three Truths and a Lie game to GitHub Pages.

## Prerequisites

- GitHub account
- Git installed on your computer
- Repository created on GitHub

## Step 1: Install Dependencies

First, install the new `gh-pages` package:

```bash
npm install
```

## Step 2: Push to GitHub

If you haven't already created a GitHub repository:

1. Go to https://github.com/new
2. Create a new repository called `three-truths-and-a-lie`
3. **Important:** Make sure the repository name matches exactly (case-sensitive)

Then push your code:

```bash
# If you haven't initialized git yet
git init
git add .
git commit -m "Initial commit"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/three-truths-and-a-lie.git

# Push to main branch
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Pages** in the left sidebar
4. Under "Build and deployment":
   - Source: Select **GitHub Actions**

## Step 4: Deployment

The GitHub Actions workflow will automatically deploy when you push to the main branch.

To check the deployment status:
1. Go to the **Actions** tab in your repository
2. You should see a "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually 1-2 minutes)

## Step 5: Access Your App

Once deployed, your app will be available at:
```
https://YOUR_USERNAME.github.io/three-truths-and-a-lie/
```

The QR codes will now work on mobile devices!

## Manual Deployment (Alternative)

If you prefer to deploy manually instead of using GitHub Actions:

```bash
npm run deploy
```

This will build your app and deploy it to the `gh-pages` branch.

## Updating Your Deployment

Every time you push changes to the main branch, GitHub Actions will automatically rebuild and redeploy your app.

Or manually:
```bash
git add .
git commit -m "Your update message"
git push
```

## Environment Variables

Don't forget to update your `.env` file with your Supabase credentials if you haven't already:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** These environment variables are baked into the build at build time. If you change them, you need to redeploy.

## Troubleshooting

### 404 Error on Page Refresh
If you get 404 errors when refreshing pages, add a `404.html` file that redirects to `index.html`.

### QR Code Still Showing localhost
Make sure you've pushed your changes and the GitHub Actions deployment has completed successfully.

### Build Fails
Check the Actions tab for error messages. Common issues:
- TypeScript errors - fix them locally first with `npm run build`
- Missing environment variables
- Node version mismatch

## Custom Domain (Optional)

If you want to use a custom domain instead of github.io:

1. Update `vite.config.ts` - change `base: '/three-truths-and-a-lie/'` to `base: '/'`
2. Update `App.tsx` - change `basename="/three-truths-and-a-lie"` to `basename=""`
3. Go to Settings > Pages > Custom domain
4. Enter your domain and follow GitHub's instructions
