# 🚂 Quick Deploy to Railway

## Prerequisites ✅
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app) with GitHub)

## Steps to Deploy

### 1. Push Backend Code to GitHub

```bash
# Commit and push the backend
git add server/
git commit -m "Add backend API"
git push origin main
```

### 2. Deploy to Railway

1. **Visit [railway.app](https://railway.app)**
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Connect your repository**
5. **Configure:**
   - Root Directory: **`server`**
   - Build Command: **`npm install`**
   - Start Command: **`npm start`**
6. **Click "Deploy"**

### 3. Get Your API URL

After deployment, Railway will provide a URL like:
- `https://your-project.up.railway.app`

### 4. Test Your API

Open in browser:
```
https://your-project.up.railway.app/
```

Should see:
```json
{
  "message": "🔥 Buzz it Backend API",
  "version": "1.0.0"
}
```

## API Endpoints Available

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

## Next Steps

1. Update your React Native app to use the Railway API URL
2. Add a real database (Railway supports PostgreSQL)
3. Add authentication
4. Custom domain (Railway supports this)

## Need Help?

- Railway Docs: https://docs.railway.app
- View logs in Railway dashboard
- Check deployment status in Railway dashboard
