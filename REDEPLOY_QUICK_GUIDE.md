# 🚀 Quick Redeploy Guide - Android Studio

## ✅ Redeployment Started!

The app redeployment process has been initiated:

1. ✅ **Metro Bundler**: Started in separate window
2. ✅ **Build Cleaned**: Previous build artifacts removed
3. ✅ **Android Studio**: Opening with project

## 📋 Next Steps in Android Studio

### Step 1: Wait for Gradle Sync ⏳
- Android Studio will automatically sync Gradle files
- Watch the progress bar at the bottom
- **First sync: 5-10 minutes** (downloads dependencies)
- Wait for "Gradle sync finished" ✅

**If sync fails:**
- **File → Invalidate Caches → Invalidate and Restart**
- **Build → Clean Project**
- **Build → Rebuild Project**

### Step 2: Connect Device/Emulator 📱

**Physical Android Device:**
1. Enable **Developer Options** (tap Build Number 7 times)
2. Enable **USB Debugging** in Developer Options
3. Connect device via USB
4. Accept USB debugging prompt on device
5. Verify device appears in Android Studio device dropdown

**Android Emulator:**
1. **Tools → Device Manager**
2. Click **Create Device** (if you don't have one)
3. Select device (e.g., Pixel 5) and system image (e.g., Android 13)
4. Click **Start** to launch emulator

### Step 3: Select Device
- Top toolbar → Device dropdown
- Select your connected device/emulator

### Step 4: Run the App ▶️

**Option A: Run Button**
- Click the green **Run** button (▶️) in the toolbar
- Or press **Shift + F10**

**Option B: Menu**
- **Run → Run 'app'**

**Option C: Command Line** (if Metro is running)
```bash
cd C:\BuzzIt\BuzzIt
npm run android
```

### Step 5: Wait for Build & Install
- Gradle will build the APK (1-3 minutes)
- App will install automatically on device
- App will launch automatically

## 🔍 Verify Deployment

After deployment, check:

1. ✅ **App Installed**: App icon appears on device
2. ✅ **App Launches**: App opens successfully
3. ✅ **Metro Connected**: Shake device → Dev Menu → Check "Debug server host"
4. ✅ **Logs**: **View → Tool Windows → Logcat** to see app logs

## 🐛 Quick Troubleshooting

### "Gradle sync failed"
- **File → Invalidate Caches → Invalidate and Restart**
- **Build → Clean Project**
- **Build → Rebuild Project**

### "App won't connect to Metro"
- Ensure Metro Bundler window is open and running
- Check Metro shows: `Metro waiting on port 8081`
- Verify device and computer are on same network
- Shake device → Settings → Update "Debug server host" to your IP

### "Build failed"
- Check **Build** tab for error messages
- **Build → Clean Project**
- **Build → Rebuild Project**
- Ensure JDK 17 is configured: **File → Project Structure → SDK Location**

### "Installation failed"
- Uninstall existing app: `adb uninstall com.buzzit.app`
- Try installing again
- Check device has enough storage

### "Port 8081 already in use"
- Run: `.\kill-metro.bat`
- Then: `.\start-metro.bat`

## 📦 Build APK Manually

If you want to build APK without running:

**Debug APK:**
```bash
cd C:\BuzzIt\BuzzIt\android
.\gradlew assembleDebug
```
Location: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK:**
```bash
cd C:\BuzzIt\BuzzIt\android
.\gradlew assembleRelease
```
Location: `android/app/build/outputs/apk/release/app-release.apk`

## 🔄 Quick Redeploy Commands

**Full Redeploy:**
```bash
.\redeploy-android.bat
```

**Just Restart Metro:**
```bash
.\start-metro.bat
```

**Stop Metro:**
```bash
.\kill-metro.bat
```

## ✅ Deployment Checklist

- [ ] Metro Bundler running (check separate window)
- [ ] Android Studio opened
- [ ] Gradle sync completed
- [ ] Device/emulator connected
- [ ] Device selected in dropdown
- [ ] App deployed successfully
- [ ] App launches on device
- [ ] Metro connected (hot reload works)

---

**🎉 Your app is redeploying!**

Keep the Metro Bundler window open while developing. Once Gradle sync completes in Android Studio, you can run the app!




