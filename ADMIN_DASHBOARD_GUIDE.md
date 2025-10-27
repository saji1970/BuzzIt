# 🔧 Admin Dashboard Guide

Complete guide for the Buzz it Admin Dashboard - manage your app and view comprehensive statistics.

## 🎯 Admin Features

### 📊 **Dashboard Overview**
- **Real-time Statistics** - Users, buzzes, engagement metrics
- **Growth Analytics** - 24h, 7d, 30d growth tracking
- **Top Users** - Most active users by buzz count
- **Top Buzzes** - Most engaging content
- **Popular Interests** - Trending topics and categories
- **Daily Activity** - 7-day activity charts

### 👥 **User Management**
- **User List** - Paginated user listing with search
- **User Details** - View user profiles and activity
- **Ban/Unban Users** - Manage user access
- **Delete Users** - Remove users and their content
- **Verification Status** - Track verified vs unverified users

### 📝 **Content Management**
- **Buzz List** - All buzzes with search and filtering
- **Content Moderation** - Review and manage buzzes
- **Delete Buzzes** - Remove inappropriate content
- **Engagement Tracking** - Monitor likes, shares, comments

### 🔐 **Admin Authentication**
- **Role-based Access** - Admin-only features
- **Secure Login** - Separate admin authentication
- **Session Management** - JWT token-based security

## 🚀 Quick Start

### 1. Admin Login

**Default Admin Credentials:**
- **Username:** `admin`
- **Password:** `any password` (for demo)

**Login Process:**
1. Open the app
2. Go to Login screen
3. Enter admin credentials
4. Admin tab will appear in bottom navigation

### 2. Access Admin Dashboard

Once logged in as admin:
1. **Admin Tab** appears in bottom navigation
2. **Tap Admin tab** to access dashboard
3. **View real-time statistics** and metrics
4. **Manage users and content** as needed

## 📊 Dashboard Sections

### Overview Tab
- **Total Users** - Complete user count with verification status
- **Total Buzzes** - All buzzes created
- **Engagement Metrics** - Likes, shares, comments totals
- **Average Engagement** - Per-buzz engagement rates
- **Growth Metrics** - 24h, 7d, 30d growth data

### Top Users Section
- **Most Active Users** - Ranked by buzz count
- **User Statistics** - Followers, following, buzz count
- **Quick Actions** - View user details, manage access

### Top Buzzes Section
- **Most Engaging Content** - Ranked by total engagement
- **Engagement Breakdown** - Likes, shares, comments
- **Content Preview** - First 100 characters
- **Author Information** - Username and engagement

### Popular Interests
- **Trending Topics** - Most used interest tags
- **Usage Counts** - How many buzzes use each interest
- **Visual Chips** - Easy-to-read interest display

## 🔧 Admin API Endpoints

### Dashboard Data
```bash
GET /api/admin/dashboard
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "verifiedUsers": 120,
      "totalBuzzes": 500,
      "totalLikes": 2500,
      "totalShares": 800,
      "avgLikesPerBuzz": "5.00"
    },
    "growth": {
      "users24h": 5,
      "buzzes24h": 25
    },
    "topUsers": [...],
    "topBuzzes": [...],
    "topInterests": [...]
  }
}
```

### User Management
```bash
# Get users with pagination
GET /api/admin/users?page=1&limit=20&search=john

# Delete user
DELETE /api/admin/users/:id

# Ban/Unban user
PATCH /api/admin/users/:id/ban
{
  "banned": true
}
```

### Content Management
```bash
# Get buzzes with pagination
GET /api/admin/buzzes?page=1&limit=20&search=tech

# Delete buzz
DELETE /api/admin/buzzes/:id
```

## 🛠 Setup Instructions

### 1. Backend Setup

**Admin User Creation:**
The admin user is automatically created in the backend:

```javascript
let adminUsers = [
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@buzzit.app',
    role: 'super_admin',
    createdAt: new Date().toISOString(),
  }
];
```

**Add More Admins:**
```javascript
// In server/index.js, add to adminUsers array
{
  id: 'admin-2',
  username: 'moderator',
  email: 'moderator@buzzit.app',
  role: 'moderator',
  createdAt: new Date().toISOString(),
}
```

### 2. Frontend Setup

**Admin Tab Visibility:**
The admin tab only appears for authenticated admin users:

```typescript
// In App.tsx
{isAdmin && <Tab.Screen name="Admin" component={AdminDashboardScreen} />}
```

**Admin Authentication:**
```typescript
// In AuthContext.tsx
const {isAdmin} = useAuth();
```

### 3. Environment Variables

**Backend (.env):**
```env
JWT_SECRET=your-super-secret-jwt-key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

## 📱 Mobile App Features

### Admin Dashboard Screen
- **Responsive Design** - Works on all screen sizes
- **Pull-to-Refresh** - Update data in real-time
- **Tab Navigation** - Overview, Users, Buzzes tabs
- **Search & Filter** - Find specific users or content
- **Action Buttons** - Quick actions for management

### Statistics Cards
- **Visual Metrics** - Color-coded statistics
- **Trend Indicators** - Growth and decline indicators
- **Real-time Updates** - Live data refresh
- **Interactive Elements** - Tap for more details

### User Management
- **User Cards** - Clean user information display
- **Quick Actions** - Ban, delete, view details
- **Search Functionality** - Find users by name or username
- **Pagination** - Handle large user lists

## 🔒 Security Features

### Authentication
- **JWT Tokens** - Secure admin authentication
- **Role-based Access** - Admin-only features
- **Session Management** - Automatic token refresh
- **Logout Security** - Clear all admin data

### Authorization
- **Admin Middleware** - Verify admin access on all endpoints
- **Permission Checks** - Role-based feature access
- **Secure Endpoints** - Protected admin API routes

### Data Protection
- **Input Validation** - Sanitize all admin inputs
- **Error Handling** - Secure error messages
- **Rate Limiting** - Prevent abuse of admin endpoints

## 📈 Analytics & Insights

### User Analytics
- **Registration Trends** - Daily, weekly, monthly growth
- **Verification Rates** - SMS verification success rates
- **User Engagement** - Activity patterns and behavior
- **Geographic Data** - User location insights (if available)

### Content Analytics
- **Buzz Performance** - Most engaging content types
- **Interest Trends** - Popular topics over time
- **Engagement Patterns** - Peak activity times
- **Content Moderation** - Flagged content statistics

### Platform Metrics
- **API Performance** - Response times and uptime
- **Error Rates** - System health monitoring
- **Resource Usage** - Server and database metrics
- **Security Events** - Login attempts and violations

## 🚀 Advanced Features

### Real-time Updates
- **WebSocket Integration** - Live dashboard updates
- **Push Notifications** - Admin alerts and notifications
- **Auto-refresh** - Periodic data updates

### Bulk Operations
- **Bulk User Actions** - Select multiple users
- **Bulk Content Moderation** - Manage multiple buzzes
- **Export Data** - Download user and content data

### Custom Reports
- **Date Range Selection** - Custom time periods
- **Filter Options** - Advanced filtering capabilities
- **Export Formats** - CSV, PDF, JSON exports

## 🐛 Troubleshooting

### Common Issues

**Admin Tab Not Showing:**
- Check if user is logged in as admin
- Verify `isAdmin` flag in AsyncStorage
- Check admin authentication in backend

**Dashboard Data Not Loading:**
- Verify admin token is valid
- Check API endpoint responses
- Ensure backend is running

**Permission Denied Errors:**
- Verify admin role in backend
- Check JWT token validity
- Ensure proper authorization headers

### Debug Mode

**Enable Logging:**
```typescript
// In ApiService.ts
console.log('Admin API Request:', endpoint, options);
console.log('Admin API Response:', response);
```

**Check Admin Status:**
```typescript
// In any component
const {isAdmin, user} = useAuth();
console.log('Is Admin:', isAdmin);
console.log('User:', user);
```

## 📞 Support

### Getting Help
- **Documentation** - Check this guide and API docs
- **GitHub Issues** - Report bugs and feature requests
- **Backend Logs** - Check server logs for errors
- **Frontend Debug** - Use React Native debugger

### Best Practices
- **Regular Backups** - Backup user and content data
- **Monitor Performance** - Track dashboard load times
- **Security Updates** - Keep admin credentials secure
- **User Privacy** - Follow data protection guidelines

---

**🎉 Your Admin Dashboard is Ready!**

Manage your Buzz it app with comprehensive statistics, user management, and content moderation tools. The admin dashboard provides everything you need to monitor and control your social media platform.

**Happy Administering! 🔧**
