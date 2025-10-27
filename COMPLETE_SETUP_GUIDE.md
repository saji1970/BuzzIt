# 🚀 Complete Buzz it Setup Guide

Complete setup guide for Buzz it app with Twilio SMS verification, backend API, and cross-device buzz sharing.

## 🎯 What's Included

- ✅ **React Native App** - iOS and Android
- ✅ **Backend API** - Node.js with Express
- ✅ **Twilio SMS** - Real verification codes
- ✅ **JWT Authentication** - Secure user auth
- ✅ **Cross-Device Sharing** - Buzzes visible to all users
- ✅ **Railway Deployment** - Production ready

## 📱 App Features

### Authentication
- Mobile number verification via SMS
- Username/password login
- Duplicate username checking
- JWT token-based authentication

### Social Features
- Create and share buzzes
- Like, comment, and share
- Interest-based content discovery
- Cross-device buzz visibility
- Social media integration

### UI/UX
- Instagram-style design
- 5 customizable themes
- Pull-down to close buzzes
- Swipe navigation
- Responsive design

## 🛠 Setup Instructions

### 1. Prerequisites

- Node.js 16+ installed
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Twilio account
- Railway account (for deployment)

### 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/saji1970/BuzzIt.git
cd BuzzIt

# Install app dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Backend Setup

#### Configure Twilio

1. **Sign up at [twilio.com](https://www.twilio.com)**
2. **Get credentials from Console:**
   - Account SID
   - Auth Token
   - Phone Number

3. **Create environment file:**
   ```bash
   cd server
   cp env.example .env
   ```

4. **Edit `.env` file:**
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_phone_number
   JWT_SECRET=your-super-secret-key
   PORT=3000
   ```

#### Start Backend

```bash
cd server
npm run dev
```

Backend will run on `http://localhost:3000`

### 4. Frontend Setup

#### iOS Development

```bash
# Install iOS dependencies
cd ios
pod install
cd ..

# Run on iOS Simulator
npx expo run:ios
```

#### Android Development

```bash
# Run on Android
npx expo run:android
```

### 5. Production Deployment

#### Deploy Backend to Railway

1. **Connect GitHub to Railway:**
   - Visit [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select `server` as root directory

2. **Set Environment Variables:**
   - Add all variables from `.env` file
   - Railway will provide a production URL

3. **Update Frontend API URL:**
   - Edit `src/services/ApiService.ts`
   - Replace `API_BASE_URL` with your Railway URL

#### Deploy App to Stores

**iOS (App Store):**
```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**Android (Play Store):**
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## 🔧 Configuration

### API Configuration

Update `src/services/ApiService.ts`:

```typescript
const API_BASE_URL = 'https://your-railway-app.up.railway.app';
```

### Twilio Setup

1. **Trial Account Limitations:**
   - Can only send to verified numbers
   - Add your test numbers in Twilio Console

2. **Production Setup:**
   - Upgrade to paid account
   - Purchase phone number
   - Configure webhooks if needed

### Authentication Flow

1. **User Registration:**
   - Enter mobile number and username
   - Receive SMS verification code
   - Verify code to create account

2. **User Login:**
   - Enter username and password
   - Receive JWT token
   - Token stored in AsyncStorage

3. **Buzz Creation:**
   - Create buzz with content and media
   - Automatically shared across all devices
   - Real-time updates via API

## 📊 Database Schema

### Users
```javascript
{
  id: string,
  username: string,
  mobileNumber: string,
  displayName: string,
  email: string,
  isVerified: boolean,
  interests: Array,
  followers: number,
  following: number,
  buzzCount: number,
  createdAt: string
}
```

### Buzzes
```javascript
{
  id: string,
  userId: string,
  username: string,
  content: string,
  media: { type: string, url: string },
  interests: Array,
  likes: number,
  comments: number,
  shares: number,
  createdAt: string
}
```

## 🚀 Advanced Features

### Real-time Updates
- WebSocket integration for live buzzes
- Push notifications for new buzzes
- Real-time like/share counts

### Media Handling
- Image upload to cloud storage
- Video compression and streaming
- Audio recording and playback

### Analytics
- User engagement tracking
- Buzz performance metrics
- Popular content discovery

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🐛 Troubleshooting

### Common Issues

**SMS Not Sending:**
- Check Twilio credentials
- Verify phone number format
- Check account balance

**API Connection Failed:**
- Verify backend URL
- Check network connectivity
- Verify CORS settings

**App Build Fails:**
- Clear Metro cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check iOS/Android setup

### Debug Mode

Enable debug logging:

```typescript
// In ApiService.ts
console.log('API Request:', endpoint, options);
console.log('API Response:', response);
```

## 📈 Performance Optimization

- Image compression and caching
- Lazy loading for buzzes
- Pagination for large datasets
- Background sync for offline support
- Memory management for media

## 🎨 Customization

### Themes
- Edit `src/context/ThemeContext.tsx`
- Add new color schemes
- Customize component styles

### UI Components
- Modify components in `src/components/`
- Add new screens in `src/screens/`
- Update navigation in `App.tsx`

## 📞 Support

- **Documentation**: Check README files
- **Issues**: GitHub Issues tab
- **Twilio**: Twilio Console and docs
- **Railway**: Railway dashboard and logs

## 🎉 Success!

Your Buzz it app is now ready with:

- ✅ Real SMS verification
- ✅ Cross-device buzz sharing
- ✅ Production-ready backend
- ✅ App Store deployment
- ✅ Secure authentication

**Happy Buzzing! 🐝**

---

*For questions or support, check the troubleshooting section or create an issue on GitHub.*
