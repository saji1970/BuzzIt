# 🔐 Admin URLs and Endpoints

## 🌐 Backend API Base URL

**Production Backend:** `https://buzzit-production.up.railway.app`

## 📍 Admin API Endpoints

All admin endpoints require authentication with an admin token.

### Base URL
```
https://buzzit-production.up.railway.app
```

### 1. Admin Dashboard
**GET** `/api/admin/dashboard`

Get comprehensive statistics and analytics.

**Example:**
```bash
curl https://buzzit-production.up.railway.app/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response includes:**
- User statistics (total, verified, new users)
- Buzz statistics (total, by time period)
- Engagement metrics (likes, shares, comments)
- Top users by buzz count
- Daily activity charts

### 2. List Users (Admin)
**GET** `/api/admin/users?page=1&limit=20&search=&sortBy=createdAt&sortOrder=desc`

Get paginated list of users with search and sorting.

**Example:**
```bash
curl "https://buzzit-production.up.railway.app/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Delete User
**DELETE** `/api/admin/users/:id`

Delete a user by ID.

**Example:**
```bash
curl -X DELETE https://buzzit-production.up.railway.app/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Ban/Unban User
**PATCH** `/api/admin/users/:id/ban`

Ban or unban a user.

**Example:**
```bash
curl -X PATCH https://buzzit-production.up.railway.app/api/admin/users/USER_ID/ban \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"banned": true}'
```

### 5. List Buzzes (Admin)
**GET** `/api/admin/buzzes?page=1&limit=20&search=&sortBy=createdAt&sortOrder=desc`

Get paginated list of buzzes with search and sorting.

**Example:**
```bash
curl "https://buzzit-production.up.railway.app/api/admin/buzzes?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 6. Delete Buzz
**DELETE** `/api/admin/buzzes/:id`

Delete a buzz by ID.

**Example:**
```bash
curl -X DELETE https://buzzit-production.up.railway.app/api/admin/buzzes/BUZZ_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 7. List Subscriptions (Admin)
**GET** `/api/admin/subscriptions?page=1&limit=20`

Get paginated list of user subscriptions.

**Example:**
```bash
curl "https://buzzit-production.up.railway.app/api/admin/subscriptions?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔑 Getting Admin Token

### Login as Admin

**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST https://buzzit-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "any_password"
  }'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "admin-1",
    "username": "admin",
    "email": "admin@buzzit.app",
    "role": "super_admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isAdmin": true
}
```

Use the `token` value in the `Authorization: Bearer` header for admin API calls.

## 📱 Mobile App Admin Dashboard

The admin dashboard is also accessible **within the mobile app**:

1. **Login as admin** (username: `admin`, any password)
2. **Open the app**
3. **Tap the "Admin" tab** in the bottom navigation (only visible when logged in as admin)

The admin tab shows:
- Dashboard statistics
- User management
- Buzz management
- Feature toggles
- System settings

## 🔒 Security Notes

- All admin endpoints require `verifyAdmin` middleware
- Admin token must be valid and contain admin user ID
- Admin endpoints return 403 if user is not an admin
- Tokens expire after a set period (check JWT configuration)

## 📋 Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard` | GET | Get dashboard statistics |
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/:id` | DELETE | Delete user |
| `/api/admin/users/:id/ban` | PATCH | Ban/unban user |
| `/api/admin/buzzes` | GET | List all buzzes |
| `/api/admin/buzzes/:id` | DELETE | Delete buzz |
| `/api/admin/subscriptions` | GET | List subscriptions |

## 🧪 Test Admin Access

```bash
# 1. Login as admin
TOKEN=$(curl -s -X POST https://buzzit-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

# 2. Access admin dashboard
curl https://buzzit-production.up.railway.app/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

**Note:** There is no web-based admin panel URL. Admin functionality is available through:
1. **Mobile app** (Admin tab)
2. **REST API endpoints** (programmatic access)

