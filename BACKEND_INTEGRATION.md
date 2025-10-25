# 🔗 Backend Integration Guide

This guide explains how to connect your Buzz it app to the Railway backend.

## 📋 Overview

Your app currently uses local storage (AsyncStorage) to store buzzes and user data. You now have the option to connect to the Railway backend for persistent, cloud-based data storage.

## 🚀 Quick Start

### Step 1: Deploy Backend to Railway

Follow the instructions in `SERVER_README.md` to deploy your backend to Railway.

### Step 2: Get Your Railway URL

After deployment, Railway will provide you with a URL like:
```
https://your-app-name.up.railway.app
```

### Step 3: Update API Configuration

1. Open `src/config/API_CONFIG.ts`
2. Update `PRODUCTION_BACKEND` with your Railway URL:
```typescript
PRODUCTION_BACKEND: 'https://your-actual-url.up.railway.app',
```

### Step 4: Enable Backend

In `src/config/API_CONFIG.ts`, set `USE_BACKEND` to `true`:
```typescript
USE_BACKEND: true,
```

### Step 5: Update APIService

In `src/services/APIService.ts`, update the default URL:
```typescript
const API_BASE_URL = 'https://your-actual-url.up.railway.app';
```

## 🔧 How It Works

The app now has two data storage modes:

### 1. Local Storage Mode (Current)
- Uses AsyncStorage
- Data stored on device
- No internet required
- Good for testing

### 2. Backend Mode (New)
- Uses Railway API
- Data stored in cloud
- Requires internet
- Good for production

## 📁 Files Created

### `src/services/APIService.ts`
- API service class for interacting with the backend
- Methods for CRUD operations on users, buzzes, and social accounts
- Error handling and type safety

### `src/config/API_CONFIG.ts`
- Configuration for switching between local and backend modes
- URL management for different environments

## 🧪 Testing the Connection

### Test Backend Health

1. Deploy backend to Railway
2. Open browser and visit: `https://your-url.up.railway.app/health`
3. Should return:
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2025-10-25T13:00:00.000Z"
}
```

### Test API Endpoints

```bash
# Get all buzzes
curl https://your-url.up.railway.app/api/buzzes

# Get health
curl https://your-url.up.railway.app/health

# Create a buzz (example)
curl -X POST https://your-url.up.railway.app/api/buzzes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "username": "testuser",
    "content": "Hello from API!"
  }'
```

## 🔄 Migrating to Backend

When you're ready to switch from local storage to backend:

1. **Enable Backend**
   - Set `USE_BACKEND: true` in `API_CONFIG.ts`

2. **Update UserContext**
   - Modify `src/context/UserContext.tsx` to use `APIService` instead of `AsyncStorage`

3. **Test Thoroughly**
   - Create test buzzes
   - Verify likes and shares work
   - Check that data persists across app restarts

## 🌐 Environment Variables (Optional)

For production, you might want to use environment variables:

1. Create `.env` file in project root:
```
API_URL=https://your-url.up.railway.app
```

2. Update `API_CONFIG.ts` to read from environment:
```typescript
PRODUCTION_BACKEND: process.env.API_URL || 'http://localhost:3000',
```

## 🐛 Troubleshooting

### Backend Not Responding
- Check Railway dashboard for deployment status
- Verify the URL is correct in `API_CONFIG.ts`
- Check CORS settings in `server/index.js`

### Data Not Syncing
- Verify backend is enabled (`USE_BACKEND: true`)
- Check network connection
- Look at console logs for API errors

### SSL/HTTPS Issues
- Railway provides HTTPS by default
- If testing locally, use HTTP for `LOCAL_BACKEND`

## 📊 Current Implementation Status

- ✅ Backend deployed to Railway
- ✅ API service created
- ✅ Configuration system in place
- ⏳ Context integration (ready to implement)
- ⏳ Migration from AsyncStorage (ready to implement)

## 🎯 Next Steps

1. Deploy backend to Railway
2. Update URLs in configuration
3. Test API connection
4. Integrate API service into UserContext
5. Migrate data from local storage
6. Deploy app update

## 📚 Additional Resources

- Railway Dashboard: https://railway.app
- API Documentation: See `server/README.md`
- Deployment Guide: See `SERVER_README.md`
