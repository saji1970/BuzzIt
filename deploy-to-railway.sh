#!/bin/bash

echo "🚀 Deploying Buzzit Backend to Railway..."

# Navigate to server directory
cd server

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Set Railway token
export RAILWAY_TOKEN="2a211ac2-6f2f-4720-947d-2f5ec3812ad3"

# Try to login
echo "🔐 Logging into Railway..."
railway login --token $RAILWAY_TOKEN

# Deploy the project
echo "📦 Deploying to Railway..."
railway up --detach

echo "✅ Deployment complete!"
echo "🌐 Your API should be available at: https://buzzit-production.up.railway.app"