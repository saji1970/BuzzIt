# Railway PostgreSQL Setup Guide

## Problem: DATABASE_URL Not Set

If you see this error in Railway logs:
```
⚠️ DATABASE_URL environment variable not set
⚠️ Server will run in fallback mode (in-memory storage only)
```

This means your backend service is not connected to the PostgreSQL database.

## Solution: Link PostgreSQL to Your Backend Service

### Step 1: Check if PostgreSQL Service Exists

1. Go to your Railway project dashboard
2. Check if you have a PostgreSQL service (usually named "PostgreSQL" or "postgres")
3. If you don't have one, create it:
   - Click **"New"** → **"Database"** → **"PostgreSQL"**
   - Railway will create a PostgreSQL database

### Step 2: Link PostgreSQL to Backend Service

#### Option A: Automatic Linking (Railway should do this automatically)
- When you add PostgreSQL, Railway should automatically set `DATABASE_URL` for all services in the project
- Check if `DATABASE_URL` appears in your backend service's environment variables

#### Option B: Manual Linking via Environment Variables

1. Go to your **Backend Service** (not the PostgreSQL service)
2. Click on the **"Variables"** tab
3. Look for `DATABASE_URL` in the list
4. If it's **NOT there**, you need to add it:

   **To get the DATABASE_URL:**
   - Go to your **PostgreSQL service**
   - Click on the **"Variables"** tab
   - Look for `DATABASE_URL` or `POSTGRES_URL`
   - Copy the entire connection string (it should look like):
     ```
     postgresql://postgres:password@postgres.railway.internal:5432/railway
     ```

5. Go back to your **Backend Service**
6. Click **"New Variable"**
7. Name: `DATABASE_URL`
8. Value: Paste the connection string you copied
9. Click **"Add"**

### Step 3: Verify the Connection

1. Railway will automatically redeploy your backend service
2. Check the logs after deployment
3. You should see:
   ```
   🔌 Connecting to PostgreSQL...
   📍 Connection string: postgresql://postgres:****@postgres.railway.internal:5432/railway
   🔄 Testing database connection...
   ✅ PostgreSQL connected successfully
   📊 Database: railway
   🔨 Initializing database tables...
   📝 Creating database tables...
   ✅ Database tables initialized successfully
   ```

### Step 4: Verify Tables Are Created

After successful connection, check Railway logs for:
```
📋 Created tables: buzzes, live_streams, user_interactions, users, verification_codes
```

## Quick Checklist

- [ ] PostgreSQL service exists in Railway project
- [ ] Backend service has `DATABASE_URL` environment variable
- [ ] `DATABASE_URL` value matches your PostgreSQL connection string
- [ ] Backend service redeployed after setting variable
- [ ] Logs show "✅ PostgreSQL connected successfully"
- [ ] Logs show "✅ Database tables initialized successfully"

## Troubleshooting

### If DATABASE_URL is still not set:

1. **Check Railway Service Linking:**
   - In Railway, make sure both services (Backend + PostgreSQL) are in the **same project**
   - Railway automatically shares `DATABASE_URL` when services are in the same project

2. **Manual Variable Setup:**
   - If automatic linking didn't work, manually add `DATABASE_URL` as shown in Step 2

3. **Check Variable Name:**
   - Make sure it's exactly `DATABASE_URL` (case-sensitive)
   - The code also checks for `POSTGRES_URL` and `POSTGRES_CONNECTION_STRING`

4. **Verify Connection String Format:**
   - Should start with `postgresql://`
   - Should include username, password, host, port, and database name

### If connection fails:

- Check if PostgreSQL service is running (should show as "Active" in Railway)
- Verify the connection string is correct
- Check Railway logs for specific error messages

## After Setup

Once connected, the app will:
- ✅ Create all database tables automatically
- ✅ Migrate existing in-memory data to PostgreSQL
- ✅ Create admin user (username: `admin`, password: `admin`)
- ✅ Store all new data in PostgreSQL

