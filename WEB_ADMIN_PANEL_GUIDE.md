# 🌐 Web Admin Panel Guide

Complete guide for the Buzz it Web Admin Panel - manage features, users, subscriptions, and app settings from a beautiful web interface.

## 🎯 Admin Panel Features

### 🔧 **Feature Management**
- **Toggle App Features** - Enable/disable any app feature
- **Mobile Verification Control** - Turn SMS verification on/off
- **Channel & Radio Controls** - Manage creation and subscription features
- **Content Controls** - Control buzz creation, likes, comments, shares
- **Social Features** - Manage following, blocking, social sharing

### 👥 **User Management**
- **User List** - View all users with pagination
- **User Details** - See user profiles, stats, and activity
- **Ban/Unban Users** - Suspend or restore user access
- **Delete Users** - Remove users and their content
- **Search & Filter** - Find specific users quickly

### 💳 **Subscription Management**
- **Subscription Plans** - Basic, Premium, Pro tiers
- **User Subscriptions** - View who's subscribed to what
- **Feature Access** - Control which features require subscriptions
- **Revenue Tracking** - Monitor subscription revenue

### 📊 **Statistics Dashboard**
- **Real-time Metrics** - Users, buzzes, engagement
- **Growth Analytics** - 24h, 7d, 30d trends
- **Top Content** - Most engaging buzzes
- **User Activity** - Active users and engagement

## 🚀 Quick Start

### 1. Access the Admin Panel

**URL:** `https://your-railway-app.up.railway.app`

**Default Admin Credentials:**
- **Username:** `admin`
- **Password:** `any password` (for demo)

### 2. Login Process

1. **Open the admin panel URL**
2. **Enter admin credentials**
3. **Click "Login"**
4. **Access the full admin dashboard**

### 3. Navigate the Panel

- **Features Tab** - Manage app features and settings
- **Users Tab** - View and manage users
- **Subscriptions Tab** - Monitor subscription data
- **Statistics Tab** - View app analytics

## 🔧 Feature Management

### Mobile Verification Control

**Default Status:** Disabled

**How to Enable:**
1. Go to **Features** tab
2. Find **"Mobile Verification"** in User Management section
3. Toggle the switch to **ON**
4. Click **"Save Changes"**

**Effect on App:**
- When **enabled**: Users must verify mobile number during registration
- When **disabled**: Users can register without mobile verification

### Channel & Radio Features

**Channel Creation:**
- Toggle **"Channel Creation"** to enable/disable
- When disabled, users cannot create new channels
- Existing channels remain accessible

**Radio Creation:**
- Toggle **"Radio Creation"** to enable/disable
- When disabled, users cannot create radio stations
- Existing radio stations remain accessible

**Subscription Requirements:**
- Toggle **"Premium Channels"** to require subscription
- Toggle **"Premium Radio"** to require subscription
- Toggle **"Subscription Required"** to require subscription for app access

### Content Features

**Buzz Creation:**
- Toggle **"Buzz Creation"** to enable/disable
- When disabled, users cannot create new buzzes

**Engagement Features:**
- **Buzz Likes** - Enable/disable liking buzzes
- **Buzz Comments** - Enable/disable commenting
- **Buzz Shares** - Enable/disable sharing
- **Buzz Media** - Enable/disable media attachments

### Social Features

**User Interactions:**
- **User Following** - Enable/disable follow system
- **User Blocking** - Enable/disable blocking users
- **Social Media Sharing** - Enable/disable external sharing
- **User Profiles** - Enable/disable profile customization

## 👥 User Management

### Viewing Users

**User List Features:**
- **Pagination** - Navigate through user pages
- **Search** - Find users by username or email
- **Sorting** - Sort by creation date, buzz count, etc.
- **User Details** - View comprehensive user information

**User Information Displayed:**
- Username and display name
- Email address
- Verification status
- Buzz count and activity
- Account creation date

### Managing Users

**Ban/Unban Users:**
1. Find the user in the user list
2. Click **"Ban"** to suspend access
3. Click **"Unban"** to restore access
4. Banned users cannot login or use the app

**Delete Users:**
1. Find the user in the user list
2. Click **"Delete"** button
3. Confirm deletion in the popup
4. User and all their content will be permanently removed

**Bulk Actions:**
- Select multiple users for bulk operations
- Ban/unban multiple users at once
- Delete multiple users (use with caution)

## 💳 Subscription Management

### Subscription Plans

**Basic Plan (Free):**
- Price: $0
- Features: Basic buzz creation and interaction
- Channel Limit: 0
- Radio Limit: 0

**Premium Plan:**
- Price: $9.99/month
- Features: Channels, radio, subscriptions
- Channel Limit: 5
- Radio Limit: 3

**Pro Plan:**
- Price: $19.99/month
- Features: All features, live streaming
- Channel Limit: Unlimited
- Radio Limit: Unlimited

### Managing Subscriptions

**View User Subscriptions:**
- See which users are subscribed to which plans
- Track subscription dates and status
- Monitor revenue from subscriptions

**Feature Access Control:**
- Set which features require subscription
- Control premium content access
- Manage feature availability by plan

## 📊 Statistics Dashboard

### Overview Metrics

**User Statistics:**
- Total registered users
- Verified vs unverified users
- New users (24h, 7d, 30d)
- User growth trends

**Content Statistics:**
- Total buzzes created
- New buzzes (24h, 7d, 30d)
- Total likes, shares, comments
- Average engagement per buzz

**Engagement Metrics:**
- Most liked buzzes
- Most shared content
- Top performing users
- Popular interest tags

### Growth Analytics

**Daily Activity:**
- 7-day activity chart
- User registration trends
- Content creation patterns
- Engagement peaks

**Trend Analysis:**
- Week-over-week growth
- Month-over-month trends
- Seasonal patterns
- Feature usage statistics

## 🔐 Security & Access

### Admin Authentication

**Login Security:**
- JWT token-based authentication
- Secure admin-only endpoints
- Session management
- Automatic logout on token expiry

**Access Control:**
- Admin-only feature access
- Role-based permissions
- Secure API endpoints
- Protected admin routes

### Data Protection

**User Privacy:**
- Secure user data handling
- GDPR compliance considerations
- Data anonymization options
- User data export capabilities

**Content Moderation:**
- Flagged content review
- Automated content filtering
- Manual moderation tools
- Content removal tracking

## 🛠 Technical Details

### API Endpoints

**Feature Management:**
```bash
GET /api/features - Get all features
PATCH /api/features - Update features (admin only)
GET /api/features/check/:feature - Check user access
```

**User Management:**
```bash
GET /api/admin/users - List users (admin only)
DELETE /api/admin/users/:id - Delete user (admin only)
PATCH /api/admin/users/:id/ban - Ban/unban user (admin only)
```

**Subscription Management:**
```bash
GET /api/subscriptions/plans - Get subscription plans
GET /api/subscriptions/user/:userId - Get user subscription
POST /api/subscriptions/subscribe - Subscribe to plan
DELETE /api/subscriptions/unsubscribe - Unsubscribe
```

### Database Schema

**Features Table:**
```javascript
{
  featureName: boolean,
  // e.g., mobileVerification: true
}
```

**Subscription Plans:**
```javascript
{
  id: string,
  name: string,
  price: number,
  features: string[],
  channelLimit: number,
  radioLimit: number,
  isActive: boolean
}
```

**User Subscriptions:**
```javascript
{
  id: string,
  userId: string,
  planId: string,
  subscribedAt: string,
  status: string,
  features: string[]
}
```

## 🚀 Deployment

### Railway Deployment

**Backend Setup:**
1. Deploy backend to Railway
2. Set environment variables
3. Configure Twilio credentials
4. Access admin panel at Railway URL

**Environment Variables:**
```env
JWT_SECRET=your-super-secret-jwt-key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### Custom Domain

**Setup Custom Domain:**
1. Add custom domain in Railway
2. Update DNS records
3. Configure SSL certificate
4. Access admin panel at custom domain

## 📱 Mobile App Integration

### Feature Checking

**App Feature Checks:**
- App checks feature status on startup
- Features are disabled/enabled in real-time
- No app update required for feature changes
- Graceful degradation for disabled features

**User Experience:**
- Clear messaging when features are disabled
- Alternative actions for disabled features
- Seamless experience for enabled features
- Admin-controlled feature availability

### Subscription Integration

**Plan-based Features:**
- Features check user subscription level
- Upgrade prompts for premium features
- Graceful degradation for basic users
- Clear feature availability indicators

## 🐛 Troubleshooting

### Common Issues

**Admin Panel Not Loading:**
- Check if backend is running
- Verify Railway deployment status
- Check browser console for errors
- Ensure proper URL access

**Feature Changes Not Applied:**
- Verify admin authentication
- Check API response for errors
- Ensure features are saved properly
- Restart app to refresh feature status

**User Management Issues:**
- Check user permissions
- Verify admin authentication
- Check API endpoint responses
- Ensure proper data validation

### Debug Mode

**Enable Debug Logging:**
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

**Check API Responses:**
- Open browser developer tools
- Monitor network requests
- Check API response data
- Verify authentication headers

## 📞 Support

### Getting Help

**Documentation:**
- Check this guide for common issues
- Review API documentation
- Check backend logs for errors
- Monitor Railway deployment logs

**Common Solutions:**
- Clear browser cache and cookies
- Check internet connection
- Verify admin credentials
- Restart backend service

### Best Practices

**Feature Management:**
- Test features before disabling
- Communicate changes to users
- Monitor user feedback
- Keep backup of feature settings

**User Management:**
- Use ban before delete
- Document moderation actions
- Monitor user reports
- Follow data protection guidelines

---

**🎉 Your Web Admin Panel is Ready!**

Manage your Buzz it app with complete control over features, users, subscriptions, and analytics. The web admin panel provides everything you need to run and grow your social media platform.

**Happy Administering! 🌐**

---

*For technical support or feature requests, check the GitHub repository or create an issue.*
