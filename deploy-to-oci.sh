#!/bin/bash

# Simple OCI Deployment Script
# Run this from the project root directory

set -e

echo "🚀 Deploying Buzzit Backend to Oracle Cloud Infrastructure..."

# Check if required environment variables are set
if [ -z "$OCI_REMOTE_HOST" ]; then
    echo "❌ Error: OCI_REMOTE_HOST environment variable is required"
    echo "   Set it to your OCI instance public IP address"
    echo "   Example: export OCI_REMOTE_HOST=123.456.789.012"
    exit 1
fi

# Set default values
export OCI_REMOTE_USER="${OCI_REMOTE_USER:-opc}"
export OCI_SSH_KEY_PATH="${OCI_SSH_KEY_PATH:-~/.ssh/id_rsa}"

echo "📋 Deployment Configuration:"
echo "   Remote Host: $OCI_REMOTE_HOST"
echo "   Remote User: $OCI_REMOTE_USER"
echo "   SSH Key: $OCI_SSH_KEY_PATH"

# Run the deployment
./oci-deployment/deploy.sh

echo "✅ Deployment completed!"
echo "🌐 Your backend API should be available at: http://$OCI_REMOTE_HOST:3000"
echo "🔍 Test it with: curl http://$OCI_REMOTE_HOST:3000/api/health"
