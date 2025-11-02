# 💾 Database Setup Guide

## MongoDB Integration Complete

The backend now uses MongoDB for data persistence. All data will be saved to the database and persist across server restarts.

## What's Been Added

### 1. Database Models
- ✅ **User Model** (`server/models/User.js`) - User accounts, profiles, interests
- ✅ **Buzz Model** (`server/models/Buzz.js`) - Posts, content, media
- ✅ **VerificationCode Model** (`server/models/VerificationCode.js`) - SMS verification codes
- ✅ **SocialAccount Model** (`server/models/SocialAccount.js`) - Social media integrations
- ✅ **Subscription Model** (`server/models/Subscription.js`) - User subscriptions

### 2. Database Connection
- ✅ MongoDB connection module (`server/db/connection.js`)
- ✅ Automatic connection on server start
- ✅ Fallback mode if database unavailable

### 3. Migrated Endpoints
- ✅ User creation - saves to database
- ✅ User retrieval - reads from database
- ✅ User updates - updates database
- ✅ User deletion - deletes from database
- ✅ Buzz creation - saves to database
- ✅ Buzz retrieval - reads from database
- ✅ Admin users endpoint - reads from database
- ✅ Admin buzzes endpoint - reads from database
- ✅ Login - checks database
- ✅ Verification codes - stored in database

### 4. Data Migration
- ✅ Automatic migration of existing in-memory data on startup
- ✅ Preserves existing users and buzzes
- ✅ Creates admin user if missing

## Environment Variable

Add to Railway environment variables or `.env`:

```bash
MONGODB_URI=mongodb://localhost:27017/buzzit
```

For Railway MongoDB addon:
```bash
MONGODB_URI=${MONGO_URL}  # Railway auto-provides this
```

## Setup MongoDB

### Option 1: MongoDB Atlas (Cloud - Free Tier Available)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (free tier: M0)
4. Get connection string
5. Add to Railway as `MONGODB_URI` environment variable

### Option 2: Railway MongoDB Addon
1. In Railway dashboard, add MongoDB service
2. Railway automatically provides `MONGO_URL` environment variable
3. Code already configured to use `MONGO_URL` or `MONGODB_URI`

### Option 3: Local MongoDB
```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
# or
sudo apt-get install mongodb    # Linux

# Start MongoDB
mongod

# Use local connection string
MONGODB_URI=mongodb://localhost:27017/buzzit
```

## What Gets Persisted

✅ **Users** - All user accounts, profiles, interests  
✅ **Buzzes** - All posts and content  
✅ **Verification Codes** - SMS verification (auto-expire)  
✅ **Social Accounts** - Social media integrations  
✅ **Subscriptions** - User subscription plans  

## Backwards Compatibility

The system maintains backwards compatibility:
- Falls back to in-memory arrays if database unavailable
- Merges database and in-memory data during transition
- Graceful degradation if MongoDB connection fails

## Testing

After setup, verify:
```bash
# Check users
curl https://buzzit-production.up.railway.app/api/users

# Create a user via app
# Check again - should persist across restarts!
```

---

**Status:** Database integration complete! ✅  
**Next:** Set up MongoDB connection string in Railway environment variables.

