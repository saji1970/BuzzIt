#!/bin/bash

# Deploy Buzz it Backend to Railway
# Using token: 2a211ac2-6f2f-4720-947d-2f5ec3812ad3

echo "🚂 Deploying Buzz it Backend to Railway..."

# Set Railway token
export RAILWAY_TOKEN="2a211ac2-6f2f-4720-947d-2f5ec3812ad3"

# Install Railway CLI if not installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "Logging in to Railway..."
railway login --token $RAILWAY_TOKEN

# Navigate to server directory
cd server

# Deploy to Railway
echo "Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "Your backend should be available at: https://your-app.up.railway.app"
echo "Test the health endpoint: curl https://your-app.up.railway.app/health"
