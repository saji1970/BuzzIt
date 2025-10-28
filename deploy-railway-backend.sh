#!/bin/bash

echo "🚀 Deploying Buzzit Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Navigate to server directory
cd server

echo "📦 Preparing backend for deployment..."

# Ensure all dependencies are installed
npm install --production

echo "🔗 Deploying to Railway..."

# Deploy using Railway CLI
railway up --detach

echo "✅ Backend deployment initiated!"
echo "🌐 Your API should be available at: https://buzzit-production.up.railway.app"
echo "🔍 Test the API: https://buzzit-production.up.railway.app/api/features"
