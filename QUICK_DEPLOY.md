# Quick Deploy to Android Studio

## Fastest Method

### 1. Open Android Studio
- Launch Android Studio

### 2. Open Project
- Click **File** → **Open**
- Navigate to: `C:\BuzzIt\android`
- Select the `android` folder
- Click **OK**

### 3. Wait for Sync
- Android Studio will sync Gradle automatically
- Wait for "Gradle sync completed" message

### 4. Connect Device
- **Physical Device**: Connect via USB, enable USB debugging
- **Emulator**: Click **Tools** → **Device Manager** → Start an emulator

### 5. Run App
- Click the green **Run** button (▶️) or press `Shift+F10`
- Select your device/emulator
- App will build and install automatically

## Using the Script

Run from project root:
```powershell
powershell -ExecutionPolicy Bypass -File open-android-studio.ps1
```

## Command Line (Alternative)

If Android Studio is in your PATH:
```powershell
cd C:\BuzzIt\android
studio64.exe .
```

Or find Android Studio manually:
- `C:\Program Files\Android\Android Studio\bin\studio64.exe`
- `C:\Users\<YourUser>\AppData\Local\Programs\Android\Android Studio\bin\studio64.exe`

## Troubleshooting

**Gradle Sync Failed?**
- Click **File** → **Invalidate Caches** → **Invalidate and Restart**

**Device Not Detected?**
- Enable USB debugging on device
- Check `adb devices` in terminal

**Build Errors?**
- Click **Build** → **Clean Project**
- Then **Build** → **Rebuild Project**

For detailed instructions, see: `DEPLOY_ANDROID_STUDIO.md`



