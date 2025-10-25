# 🔥 Buzz it Backend Server

Express.js API server for the Buzz it mobile app.

## 🚨 How to Deploy to Railway

### The Critical Step: Set Root Directory

When deploying to Railway, you **MUST** set the **Root Directory** to `server`.

**Without this setting, Railway will try to use the root `package.json` which contains React Native dependencies, causing the build to fail.**

### Quick Deploy Steps

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `BuzzIt` repository
4. **SET ROOT DIRECTORY TO: `server`** ⬅️ **CRITICAL**
5. Click "Deploy"

That's it! Railway will automatically:
- Detect Node.js
- Install dependencies from `server/package.json`
- Run `npm start`
- Provide you with a live URL

## 📁 Server Structure

```
server/
├── index.js              # Main server file
├── package.json          # Backend dependencies only
├── package-lock.json     # Locked versions
├── railway.json          # Railway configuration
├── Dockerfile            # Docker configuration (optional)
├── README.md             # Server documentation
└── RAILWAY_SETUP.md      # Detailed Railway setup
```

## 🔗 API Endpoints

Once deployed, your API will be available at:
`https://your-app.up.railway.app`

**Endpoints:**
- `GET /` - API info
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/buzzes` - List buzzes
- `POST /api/buzzes` - Create buzz
- `PATCH /api/buzzes/:id/like` - Like buzz
- `PATCH /api/buzzes/:id/share` - Share buzz
- `GET /api/social/:userId` - Get social accounts
- `POST /api/social` - Add social account
- `GET /health` - Health check

## 🛠️ Local Development

```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:3000`

## 📝 Files Needed for Railway

These files are committed to git:
- ✅ `server/index.js` - Server code
- ✅ `server/package.json` - Dependencies
- ✅ `server/package-lock.json` - Locked versions
- ✅ `server/railway.json` - Railway config
- ✅ `server/Dockerfile` - Docker config
- ❌ `server/node_modules/` - Excluded (installed by Railway)
- ❌ `server/package-lock.json.bak` - Excluded (backup file)

## ❓ Troubleshooting

### Build fails with "No matching version found for react-native"
➡️ Root directory not set to `server`. Railway is using root package.json.

### Cannot find module 'express'
➡️ Check that `server/package-lock.json` is committed.

### Port already in use
➡️ Railway auto-assigns PORT. No configuration needed.

## 📚 More Info

See `server/RAILWAY_SETUP.md` for detailed deployment instructions.
