# 👤 User Credentials - Buzz it App

## 🔐 Configured Users and Passwords

### Regular User Account

**Username:** `testuser`  
**Password:** `Test123!`

**Details:**
- User ID: `test-user-1`
- Profile Name: Test Buzzer
- Interests: Technology, Music, Sports
- Mobile Number: +1234567890
- Verified: Yes
- Status: Active

**Login:**
```json
{
  "username": "testuser",
  "password": "Test123!"
}
```

### Admin Account

**Username:** `admin`  
**Password:** `any password` (accepts any password for demo)

**Details:**
- User ID: `admin-1`
- Email: admin@buzzit.app
- Role: super_admin
- Status: Active

**Note:** For demo purposes, the admin account accepts any password. In production, this should be properly secured.

## 🧪 Test Credentials

### Login via API

```bash
curl -X POST https://buzzit-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123!"}'
```

### Login via App

1. Open the Buzz it app
2. Navigate to Login screen
3. Enter:
   - Username: `testuser`
   - Password: `Test123!`
4. Tap Login

## 📝 Creating New Users

### Via App Registration

1. Tap "Sign Up" on Login screen
2. Fill in:
   - Username (must be unique)
   - Password
   - Profile Name
   - Interests
3. Complete registration

### Via API

```bash
# Step 1: Send verification code
curl -X POST https://buzzit-production.up.railway.app/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "+1234567890",
    "username": "newuser"
  }'

# Step 2: Verify code (if mobile verification enabled)
curl -X POST https://buzzit-production.up.railway.app/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "+1234567890",
    "code": "123456",
    "verificationId": "verification-id"
  }'
```

## ⚠️ Important Notes

### Password Security

- **Production:** Currently accepts any password for demo purposes
- **In Production:** Should use bcrypt password hashing
- The test user password is hashed: `$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`

### Admin Access

- Admin account accepts any password (demo mode)
- Admin has access to Admin Dashboard
- Can manage users, buzzes, and features

### User Storage

- Users are stored in memory (not persisted)
- Server restart will clear all users except predefined ones
- In production, use a database for persistence

## 🔄 Default Test User Data

The test user (`testuser`) has:
- 3 sample buzzes pre-created
- Interests configured
- Verified status

## 📱 Quick Login Reference

| Account Type | Username | Password |
|--------------|----------|----------|
| Regular User | `testuser` | `Test123!` |
| Admin | `admin` | `any password` |

---

**Note:** These are demo/test credentials. In production, implement proper password hashing and secure authentication.

