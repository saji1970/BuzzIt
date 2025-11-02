# 👥 Users Sync Status & Backend User List

## 🔄 User Sync Status

**Last Checked:** 2025-11-02

### ✅ Automatic Sync Enabled

Users are **automatically synced** to the backend when:
- ✅ User creates profile via app (Profile creation now syncs to backend)
- ✅ User registers via `/api/auth/verify-code` endpoint
- ✅ User created via `/api/users` POST endpoint

**Status:** All users created in the app are automatically saved to the backend server.

## 📊 Current Backend Users

### Total Users: 1

#### 1. Test User
- **User ID:** `test-user-1`
- **Username:** `testuser`
- **Password:** `Test123!`
- **Display Name:** Test Buzzer
- **Email:** N/A
- **Mobile Number:** +1234567890
- **Verified:** ✅ Yes
- **Created:** 2025-11-02T11:53:45.421Z
- **Interests:** Technology, Music, Sports (3 selected)

### Admin Users

#### 1. Admin Account
- **User ID:** `admin-1`
- **Username:** `admin`
- **Email:** admin@buzzit.app
- **Role:** super_admin
- **Password:** `any password` (accepts any for demo)

## 🔍 How to Check Users

### Via API (Public)
```bash
curl https://buzzit-production.up.railway.app/api/users
```

### Via API (Admin - More Details)
```bash
# Get admin token
TOKEN=$(curl -s -X POST https://buzzit-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

# Get all users with pagination
curl "https://buzzit-production.up.railway.app/api/admin/users?page=1&limit=100" \
  -H "Authorization: Bearer $TOKEN"
```

### Via Web Admin Panel
1. Go to: `https://buzzit-production.up.railway.app/`
2. Login as admin (username: `admin`, any password)
3. Click "Users" tab
4. View all users with search and filters

## ⚠️ Important Notes

### User Storage
- **Current:** Users stored in memory (in-memory array)
- **Persistence:** Users are lost on server restart (except predefined ones)
- **Backup:** No automatic backup currently
- **Production:** Should use database (MongoDB, PostgreSQL, etc.) for persistence

### User Sync
- **App to Backend:** ✅ Automatic (fixed in recent update)
- **Backend Persistence:** ❌ Memory only (lost on restart)
- **New Users:** Created via app are automatically saved to backend
- **Existing Users:** Already in backend from previous registrations

## 📝 User Creation Flow

1. **User creates profile in app**
   - Fills out username, password, profile name, interests
   - App calls `POST /api/users` → User created on backend ✅
   - App auto-login → Gets auth token ✅
   - User can now access app ✅

2. **User verifies via mobile**
   - User sends verification code
   - User verifies code → `POST /api/auth/verify-code`
   - User created on backend ✅
   - Gets auth token ✅

## 🔄 Sync Status Summary

| Item | Status | Notes |
|------|--------|-------|
| App Profile Creation | ✅ Syncing | All new profiles sync to backend |
| Mobile Verification | ✅ Syncing | Verified users saved to backend |
| Direct API Creation | ✅ Working | Users can be created via API |
| Backend Persistence | ❌ Memory Only | Lost on server restart |
| Database Storage | ❌ Not Implemented | Should add for production |

## 📊 Current User Statistics

- **Total Users:** 1 regular + 1 admin = **2 users**
- **Verified Users:** 1
- **Unverified Users:** 0
- **Users with Interests:** 1 (3 interests selected)

## 🚀 Next Steps (For Production)

1. **Add Database:** Use MongoDB, PostgreSQL, or similar
2. **Persist Users:** Save users to database instead of memory
3. **Backup Strategy:** Regular database backups
4. **User Migration:** Migrate existing users to database

---

**Current Status:** Users created in the app are automatically synced to backend. ✅
**Issue:** Backend uses in-memory storage, so users are lost on server restart. ⚠️
