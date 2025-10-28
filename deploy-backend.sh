#!/bin/bash

echo "🚀 Deploying Buzzit Backend to Railway..."

# Navigate to server directory
cd server

# Install Railway CLI if not present
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (interactive)
echo "🔐 Please login to Railway..."
railway login

# Link to existing project
echo "🔗 Linking to existing Railway project..."
railway link

# Deploy the backend
echo "📦 Deploying backend to Railway..."
railway up --detach

echo "✅ Backend deployment complete!"
echo "🌐 Your API should be available at: https://buzzit-production.up.railway.app"
