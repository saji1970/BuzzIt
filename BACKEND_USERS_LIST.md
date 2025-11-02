# 👥 Backend Users List

## 📋 Current Users in Backend

### Regular Users

#### 1. Test User
- **User ID:** `test-user-1`
- **Username:** `testuser`
- **Password:** `Test123!` (hashed: `$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`)
- **Profile Name:** Test Buzzer
- **Interests:** Technology, Music, Sports
- **Mobile Number:** +1234567890
- **Verified:** ✅ Yes
- **Created:** 2025-11-01T15:00:06.309Z
- **Status:** Active

### Admin Users

#### 1. Admin Account
- **User ID:** `admin-1`
- **Username:** `admin`
- **Email:** admin@buzzit.app
- **Password:** `any password` (accepts any password for demo)
- **Role:** super_admin
- **Status:** Active

## 📊 User Statistics

**Total Users:** 1 regular user + 1 admin = **2 users**

## 🔍 Query Users via API

### Get All Users
```bash
curl https://buzzit-production.up.railway.app/api/users
```

### Get Specific User
```bash
curl https://buzzit-production.up.railway.app/api/users/test-user-1
```

### Get Current User (with auth token)
```bash
curl https://buzzit-production.up.railway.app/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Admin Users List (Admin only)
```bash
# First login as admin to get token
TOKEN=$(curl -s -X POST https://buzzit-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

# Then get admin dashboard/users
curl https://buzzit-production.up.railway.app/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

## 📝 Notes

1. **User Storage:** Users are stored in memory on the server
   - Server restart clears all users except predefined ones
   - Only `testuser` and `admin` persist after restart

2. **New Users:** Users created via registration are added to the array
   - Will be lost on server restart
   - In production, use a database for persistence

3. **Password Security:**
   - Currently accepts any password (demo mode)
   - Password hashing exists but not enforced
   - Production should enforce bcrypt verification

## 🔄 Current Backend State

**API Endpoint:** `https://buzzit-production.up.railway.app`

**Users Count:** 1 regular user

**Sample Response:**
```json
[
  {
    "id": "test-user-1",
    "username": "testuser",
    "buzzProfileName": "Test Buzzer",
    "interests": ["Technology", "Music", "Sports"],
    "mobileNumber": "+1234567890",
    "isVerified": true,
    "createdAt": "2025-11-01T15:00:06.309Z"
  }
]
```

---

**To add more users, register via the app or API!** 📱

