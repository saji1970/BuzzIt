# Git Push Instructions

## Quick Push to GitHub

Run these commands in your terminal from the `BuzzIt/BuzzIt` directory:

```bash
cd C:\BuzzIt\BuzzIt

# Check current status
git status

# Add all changes
git add -A

# Commit changes
git commit -m "Fix stream viewer: Add user-initiated video loading to prevent bridge errors"

# Check which branch you're on
git branch --show-current

# Push to GitHub (replace 'main' with your branch name if different)
git push origin main
```

## Files Changed

The following files have been modified:

1. **`src/screens/StreamViewerScreen.tsx`**
   - Added `userRequestedVideo` state
   - Added play button for user-initiated video loading
   - Simplified bridge readiness logic

2. **`src/components/StreamVideoPlayer.tsx`** (if exists)
   - Video player component improvements

3. **`server/index.js`** (if modified)
   - Server-side improvements

## Railway Deployment

Once you push to GitHub, Railway will automatically detect the changes and start a new deployment.

To verify:
1. Go to https://railway.app
2. Check your project's deployment logs
3. Wait for deployment to complete

## If Git Commands Don't Work

If you get errors, try:

```bash
# Initialize git if needed (only if not already initialized)
git init

# Add remote if needed (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/buzzit.git

# Set branch name
git branch -M main

# Push with upstream
git push -u origin main
```




