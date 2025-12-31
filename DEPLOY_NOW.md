# 🚀 Deploy to Android Studio - Quick Guide

## ✅ Current Status

**Metro Bundler**: Starting in separate window  
**Android Project**: `C:\BuzzIt\BuzzIt\android`  
**Package**: `com.buzzit.app`

## 📋 Deployment Steps

### Step 1: Android Studio is Opening...

The script should have opened Android Studio automatically. If not:

1. **Launch Android Studio**
2. **File → Open**
3. Navigate to: `C:\BuzzIt\BuzzIt\android`
4. Click **OK**

### Step 2: Wait for Gradle Sync ⏳

- Android Studio will automatically sync Gradle files
- **First sync: 5-10 minutes** (downloads dependencies)
- Watch the progress bar at the bottom
- Wait for "Gradle sync finished" ✅

**If sync fails:**
- **File → Invalidate Caches → Invalidate and Restart**
- **Build → Clean Project**
- **Build → Rebuild Project**

### Step 3: Connect Device/Emulator 📱

**Physical Device:**
1. Enable **Developer Options** (tap Build Number 7 times)
2. Enable **USB Debugging**
3. Connect via USB
4. Accept debugging prompt

**Emulator:**
1. **Tools → Device Manager**
2. Click **Create Device** (if needed)
3. Select device and system image
4. Click **Start**

### Step 4: Verify Metro Bundler 🔄

Check the Metro Bundler window - you should see:
```
Metro waiting on port 8081
```

If not running, open terminal:
```bash
cd C:\BuzzIt\BuzzIt
npm start
```

### Step 5: Run the App ▶️

**In Android Studio:**
1. Select device from dropdown (top toolbar)
2. Click **Run** button (▶️) or press **Shift + F10**
3. Wait for build (1-3 minutes)
4. App will install and launch automatically!

**Or from Command Line:**
```bash
cd C:\BuzzIt\BuzzIt
npm run android
```

## ✅ Verification

After deployment:
- ✅ App icon appears on device
- ✅ App launches successfully
- ✅ Metro connected (shake device → Dev Menu)
- ✅ Logs visible in **View → Tool Windows → Logcat**

## 🐛 Quick Troubleshooting

**"SDK not found"**
- Update `android/local.properties`:
  ```properties
  sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
  ```

**"Gradle sync failed"**
- **File → Invalidate Caches → Invalidate and Restart**
- **Build → Clean Project**

**"App won't connect to Metro"**
- Ensure Metro is running: `npm start`
- Check device and computer on same network

**"Build failed"**
- Check **Build** tab for errors
- **Build → Clean Project → Rebuild Project**

## 📦 Build APK

**Debug APK:**
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Location: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK:**
- **Build → Generate Signed Bundle / APK**
- Select **APK** → Create/select keystore → **release** variant

---

**🎉 Your app is deploying! Keep Metro Bundler running while developing.**




