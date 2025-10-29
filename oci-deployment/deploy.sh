#!/bin/bash

# OCI Deployment Script for Buzzit Backend
# This script deploys the backend to Oracle Cloud Infrastructure

set -e

echo "🚀 Starting OCI deployment for Buzzit Backend..."

# Configuration
COMPARTMENT_ID="${OCI_COMPARTMENT_ID:-}"
INSTANCE_ID="${OCI_INSTANCE_ID:-}"
SSH_KEY_PATH="${OCI_SSH_KEY_PATH:-~/.ssh/id_rsa}"
REMOTE_USER="${OCI_REMOTE_USER:-opc}"
REMOTE_HOST="${OCI_REMOTE_HOST:-}"

# Validate required environment variables
if [ -z "$REMOTE_HOST" ]; then
    echo "❌ Error: OCI_REMOTE_HOST environment variable is required"
    echo "   Set it to your OCI instance public IP address"
    exit 1
fi

if [ -z "$COMPARTMENT_ID" ]; then
    echo "⚠️  Warning: OCI_COMPARTMENT_ID not set, some features may not work"
fi

echo "📋 Deployment Configuration:"
echo "   Remote Host: $REMOTE_HOST"
echo "   Remote User: $REMOTE_USER"
echo "   SSH Key: $SSH_KEY_PATH"
echo "   Compartment ID: ${COMPARTMENT_ID:-'Not set'}"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf buzzit-backend.tar.gz \
    -C server \
    package.json package-lock.json index.js config/ public/ \
    -C .. \
    oci-deployment/

# Upload and deploy
echo "📤 Uploading to OCI instance..."
scp -i "$SSH_KEY_PATH" buzzit-backend.tar.gz "$REMOTE_USER@$REMOTE_HOST:/tmp/"

echo "🔧 Deploying on OCI instance..."
ssh -i "$SSH_KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
    # Create application directory
    sudo mkdir -p /opt/buzzit-backend
    cd /opt/buzzit-backend
    
    # Extract deployment package
    sudo tar -xzf /tmp/buzzit-backend.tar.gz
    
    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        sudo yum update -y
        sudo yum install -y docker
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo usermod -a -G docker opc
    fi
    
    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        echo "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Stop existing containers
    sudo docker-compose down || true
    
    # Build and start new containers
    sudo docker-compose up -d --build
    
    # Clean up
    rm -f /tmp/buzzit-backend.tar.gz
    
    echo "✅ Deployment completed!"
    echo "🌐 Backend should be available at: http://$REMOTE_HOST:3000"
EOF

# Clean up local files
rm -f buzzit-backend.tar.gz

echo "✅ OCI deployment completed!"
echo "🌐 Your backend API should be available at: http://$REMOTE_HOST:3000"
echo "🔍 Test it with: curl http://$REMOTE_HOST:3000/api/health"