# Oracle Cloud Infrastructure (OCI) Setup Guide

## Prerequisites

1. **OCI Account** with active free tier
2. **OCI CLI** installed locally
3. **SSH Key Pair** for instance access
4. **Compute Instance** (VM) running Oracle Linux

## Step 1: Create OCI Resources

### 1.1 Create a Compute Instance
```bash
# Using OCI CLI
oci compute instance launch \
  --compartment-id <YOUR_COMPARTMENT_ID> \
  --availability-domain <YOUR_AD> \
  --display-name "buzzit-backend" \
  --image-id "ocid1.image.oc1.iad.aaaaaaaaxxxxxxxxxx" \
  --shape "VM.Standard.E2.1.Micro" \
  --subnet-id <YOUR_SUBNET_ID> \
  --assign-public-ip true \
  --ssh-authorized-keys-file ~/.ssh/id_rsa.pub
```

### 1.2 Configure Security Rules
```bash
# Allow HTTP traffic on port 3000
oci network security-list update \
  --security-list-id <YOUR_SECURITY_LIST_ID> \
  --ingress-security-rules '[{
    "source": "0.0.0.0/0",
    "protocol": "6",
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": {
        "min": 3000,
        "max": 3000
      }
    }
  }]'
```

## Step 2: Configure Environment Variables

Create a `.env` file in your project root:
```bash
# OCI Configuration
OCI_REMOTE_HOST=your-instance-public-ip
OCI_REMOTE_USER=opc
OCI_SSH_KEY_PATH=~/.ssh/id_rsa
OCI_COMPARTMENT_ID=ocid1.compartment.oc1..xxxxx
```

## Step 3: Deploy

```bash
# Set environment variables
export OCI_REMOTE_HOST="your-instance-public-ip"
export OCI_REMOTE_USER="opc"
export OCI_SSH_KEY_PATH="~/.ssh/id_rsa"

# Deploy to OCI
./oci-deployment/deploy.sh
```

## Step 4: Test Deployment

```bash
# Test the API
curl http://your-instance-public-ip:3000/api/health
curl http://your-instance-public-ip:3000/api/features
```

## Step 5: Update Mobile App

Update your mobile app's API configuration to use the OCI endpoint:
```typescript
const API_BASE_URL = 'http://your-instance-public-ip:3000';
```

## Troubleshooting

### Common Issues:
1. **SSH Connection Failed**: Check security rules and SSH key
2. **Port Not Accessible**: Verify security list rules for port 3000
3. **Docker Installation Failed**: Run `sudo yum update` first
4. **Container Won't Start**: Check logs with `docker-compose logs`

### Useful Commands:
```bash
# Check instance status
oci compute instance get --instance-id <INSTANCE_ID>

# View security list
oci network security-list get --security-list-id <SECURITY_LIST_ID>

# SSH into instance
ssh -i ~/.ssh/id_rsa opc@your-instance-public-ip

# Check running containers
docker ps

# View logs
docker-compose logs -f
```
