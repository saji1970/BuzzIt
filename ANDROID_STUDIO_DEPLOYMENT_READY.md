# Android Studio Deployment - Ready!

## ✅ Preparation Complete

The following steps have been completed:
- ✅ React Native bundle rebuilt with social media integration code
- ✅ Android project cleaned (gradlew clean)
- ✅ All new components included (SocialPlatformSelector, SocialMediaService, DeepLinkingHandler)
- ✅ Code committed and pushed to GitHub

## 📱 Next Steps: Deploy in Android Studio

### Step 1: Open Android Studio

**Option A - Using File Explorer:**
1. Open File Explorer
2. Navigate to: `C:\BuzzIt\BuzzIt\android`
3. Right-click on the `android` folder
4. Select **"Open with Android Studio"**

**Option B - From Android Studio:**
1. Open Android Studio
2. Click **"File" → "Open"**
3. Navigate to: `C:\BuzzIt\BuzzIt\android`
4. Click **"OK"**

### Step 2: Wait for Gradle Sync

After opening the project:
1. Android Studio will automatically start syncing Gradle
2. You'll see "Gradle Build Running..." at the bottom
3. **Wait for sync to complete** (may take 2-5 minutes)
4. If sync fails, click **"Sync Project with Gradle Files"** button (elephant icon)

### Step 3: Start Metro Bundler

**Open a new terminal/command prompt:**
```bash
cd C:\BuzzIt\BuzzIt
npm start
```

**Or use the batch file:**
```bash
start-metro.bat
```

**Keep the Metro Bundler window open!**

### Step 4: Connect Device or Start Emulator

**For Physical Device:**
1. Connect Android phone via USB
2. Enable USB Debugging in Developer Options
3. Allow USB debugging prompt on phone
4. Verify connection: `adb devices`

**For Emulator:**
1. In Android Studio, click **"Device Manager"** (phone icon)
2. Click **▶** to start an emulator
3. Wait for emulator to fully boot

### Step 5: Run the App

1. **Select device** from dropdown (top toolbar next to green play button)
2. Click **green play button (▶)** or press **Shift + F10**
3. Wait for build to complete (first build: 5-10 minutes)
4. App will install and launch automatically

## 🎉 Testing Social Media Integration

### After App Launches:

#### Test 1: Check Settings
1. Open app
2. Go to **Settings** → **Privacy & Social**
3. You should see three platform cards:
   - Facebook
   - Instagram
   - Snapchat
4. Verify they show "Not Connected" status

#### Test 2: Try Instagram Connection (if Railway configured)
1. Tap **"Connect"** on Instagram
2. Browser should open with Instagram OAuth
3. Log in with Instagram Business Account
4. Authorize permissions
5. App should return and show "Connected"

**Prerequisites for Instagram:**
- ✅ Environment variables set in Railway:
  - `INSTAGRAM_CLIENT_ID = 1393033811657781`
  - `INSTAGRAM_CLIENT_SECRET = 8feb4f68ca96a05a075bea39aa214451`
  - `APP_BASE_URL = https://buzzit-production.up.railway.app`
- ✅ Redirect URIs configured in Instagram app
- ✅ Instagram Business Account (not personal)

#### Test 3: Publish to Instagram
1. Go to **Create** screen
2. **Add an image** (Instagram requires media!)
3. Write a caption
4. Scroll down to **"Publish to Social Media"** section
5. **Select Instagram** platform
6. Tap **"Create Buzz"**
7. Check Instagram - post should appear

## 🐛 Troubleshooting

### Build Fails in Android Studio

**Error: "Could not resolve dependencies"**
```bash
cd android
./gradlew clean
./gradlew build --refresh-dependencies
```

**Error: "SDK location not found"**
1. Create `android/local.properties` with:
```
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

### Metro Bundler Issues

**Error: "Port 8081 already in use"**
```bash
# Kill existing Metro
npx react-native start --reset-cache
```

**Or on Windows:**
```bash
kill-metro.bat
npm start
```

### App Won't Install

**Error: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"**
```bash
# Uninstall old version first
adb uninstall com.buzzit

# Then rebuild in Android Studio
```

### Social Media Connection Fails

**Error: "Invalid redirect URI"**
- Check redirect URIs are configured in Instagram app settings
- Make sure Railway environment variables are set
- Verify no typos in redirect URIs (no trailing slashes!)

**Error: "Instagram OAuth is not configured on the server"**
- Environment variables not set in Railway
- Railway needs to redeploy after adding variables
- Check Railway deployment logs

## 📋 Build Information

**Generated Files:**
- `android/app/src/main/assets/index.android.bundle` ✅
- Social media components included ✅
- Deep linking configured ✅

**New Features in This Build:**
- Facebook OAuth integration
- Instagram OAuth integration
- Snapchat OAuth integration
- Social platform selector in Create Buzz
- Automatic publishing to selected platforms
- Token refresh management
- Connection status tracking

## 🚀 Quick Deploy Command

If you need to rebuild and redeploy quickly:

```bash
# Rebuild bundle
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

# Clean Android
cd android && ./gradlew.bat clean && cd ..

# Then open Android Studio and run
```

## 📝 Notes

- First build takes 5-10 minutes
- Subsequent builds are faster (2-3 minutes)
- Keep Metro Bundler running while developing
- Hot reload enabled - changes reflect automatically
- If you make changes to native code, rebuild in Android Studio

## ✅ Ready to Deploy!

Everything is prepared. Just:
1. Open Android Studio
2. Open `C:\BuzzIt\BuzzIt\android`
3. Wait for sync
4. Start Metro
5. Run the app

Good luck! 🎊
