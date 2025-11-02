# Local Development Setup with PostgreSQL

## Setting Up DATABASE_URL for Local Development

If you're running the server locally (not on Railway), you need to set the `DATABASE_URL` environment variable.

### Option 1: Using Railway PostgreSQL from Local (Recommended for Testing)

1. **Get your Railway PostgreSQL connection string:**
   - Go to Railway Dashboard → Your Project → PostgreSQL Service
   - Click on **"Variables"** tab
   - Copy the `DATABASE_URL` value (it looks like):
     ```
     postgresql://postgres:PVBWkzlYhxOcwmOGAsHMGbBiDeRInVFK@postgres.railway.internal:5432/railway
     ```

2. **Create a `.env` file:**
   - In your project root: `/Users/sajipillai/Buzzit/server/`
   - Create a file named `.env`
   - Add the connection string:
     ```bash
     DATABASE_URL=postgresql://postgres:PVBWkzlYhxOcwmOGAsHMGbBiDeRInVFK@postgres.railway.internal:5432/railway
     ```

3. **Note:** Railway's internal URLs (`postgres.railway.internal`) might not work from your local machine.
   - If connection fails, use the **public connection string** (see Option 2)

### Option 2: Get Public Connection String from Railway

1. Go to Railway Dashboard → PostgreSQL Service
2. Click on **"Connect"** or **"Settings"** tab
3. Look for **"Public Network"** or **"Public Connection String"**
4. Copy that connection string to your `.env` file

### Option 3: Set Environment Variable Directly

**macOS/Linux:**
```bash
export DATABASE_URL="postgresql://postgres:password@host:5432/railway"
node server/index.js
```

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://postgres:password@host:5432/railway"
node server/index.js
```

### Option 4: Use Local PostgreSQL (If you have PostgreSQL installed locally)

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/buzzit"
```

## Verify Connection

After setting `DATABASE_URL`, run the server and check the logs:

```bash
cd server
npm start
```

You should see:
```
🔌 Connecting to PostgreSQL...
📍 Connection string: postgresql://postgres:****@...
🔄 Testing database connection...
✅ PostgreSQL connected successfully
📊 Database: railway
🔨 Initializing database tables...
✅ Database tables initialized successfully
💾 Database: PostgreSQL connected ✅
```

## Troubleshooting

### If connection fails locally:

1. **Railway Internal URLs:**
   - `postgres.railway.internal` only works within Railway's network
   - You need the **public connection string** for local access

2. **Get Public Connection String:**
   - Railway Dashboard → PostgreSQL → Connect tab
   - Look for "Public Network" connection string
   - It should have a public hostname, not `railway.internal`

3. **Firewall/Network Issues:**
   - Make sure Railway PostgreSQL allows public connections
   - Check Railway PostgreSQL settings for network access

4. **SSL Requirements:**
   - Railway PostgreSQL requires SSL
   - The code automatically enables SSL for Railway connections

## Quick Start

1. Create `.env` file in `/Users/sajipillai/Buzzit/server/`:
   ```bash
   cd /Users/sajipillai/Buzzit/server
   touch .env
   ```

2. Add your DATABASE_URL to `.env`:
   ```
   DATABASE_URL=your_connection_string_here
   ```

3. Run the server:
   ```bash
   npm start
   ```

## Note

The `.env` file is already in `.gitignore`, so your connection string won't be committed to git.

