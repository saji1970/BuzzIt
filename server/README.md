# 🔥 Buzz it Backend API

Backend API for the Buzz it social media platform.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start
```

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user

### Buzzes
- `GET /api/buzzes` - Get all buzzes
- `GET /api/buzzes/:id` - Get buzz by ID
- `POST /api/buzzes` - Create new buzz
- `PATCH /api/buzzes/:id/like` - Toggle like on buzz
- `PATCH /api/buzzes/:id/share` - Share buzz
- `DELETE /api/buzzes/:id` - Delete buzz

### Social Accounts
- `GET /api/social/:userId` - Get user's social accounts
- `POST /api/social` - Add social account
- `PUT /api/social/:id` - Update social account
- `DELETE /api/social/:id` - Remove social account

## 🚢 Deploy to Railway

### Option 1: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Option 2: Deploy via GitHub

1. **Push code to GitHub repository**
2. **Go to [Railway.app](https://railway.app)**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Railway will auto-detect the server folder**
6. **Add environment variables if needed**
7. **Click "Deploy"**

### Environment Variables

Set these in Railway dashboard under your project → Variables:

- `PORT` - Server port (default: 3000, auto-set by Railway)
- `NODE_ENV` - Environment (production/development)

### Railway Configuration

Create `railway.json` in the server folder:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🔒 Production Considerations

- Replace in-memory storage with a real database (PostgreSQL, MongoDB)
- Add authentication middleware (JWT)
- Implement rate limiting
- Add input validation
- Set up CORS properly
- Add logging and monitoring
- Implement error handling

## 📝 License

MIT
