# Fix Icons - Chinese Characters Issue

## Problem
Icons are showing as Chinese characters instead of actual icons. This happens when `react-native-vector-icons` fonts are not properly linked to the Android app.

## Solution

### Quick Fix (Automated)
Run the fix script:
```powershell
cd C:\BuzzIt\BuzzIt
powershell -ExecutionPolicy Bypass -File fix-icons.ps1
```

### Manual Fix

1. **Copy fonts to Android assets:**
   ```powershell
   # Navigate to project root
   cd C:\BuzzIt\BuzzIt
   
   # Create fonts directory
   New-Item -ItemType Directory -Path "android\app\src\main\assets\fonts" -Force
   
   # Copy fonts
   Copy-Item -Path "node_modules\react-native-vector-icons\Fonts\*.ttf" -Destination "android\app\src\main\assets\fonts" -Force
   ```

2. **Clean and rebuild the app:**
   
   **In Android Studio:**
   - Click **Build** → **Clean Project**
   - Click **Build** → **Rebuild Project**
   - Click **Run** → **Run 'app'**
   
   **Or from command line:**
   ```powershell
   cd android
   .\gradlew.bat clean
   .\gradlew.bat assembleDebug
   ```

3. **Reinstall the app:**
   - Uninstall the existing app from your device
   - Install the newly built APK
   - Or run from Android Studio to auto-install

## Verification

After rebuilding, check that fonts are included:
```powershell
# Check fonts in assets
Get-ChildItem "android\app\src\main\assets\fonts\*.ttf" | Select-Object Name
```

You should see files like:
- MaterialIcons.ttf
- FontAwesome.ttf
- Ionicons.ttf
- etc.

## Why This Happens

React Native Vector Icons requires font files to be:
1. Installed via npm (`node_modules/react-native-vector-icons/Fonts`)
2. Copied to Android assets (`android/app/src/main/assets/fonts`)
3. Included in the APK build

The `react-native.config.js` file should handle this automatically, but sometimes manual copying is needed, especially after:
- Fresh clone of repository
- npm install
- Android Studio project import

## Prevention

To prevent this issue in the future:
1. Ensure `react-native.config.js` includes:
   ```javascript
   module.exports = {
     assets: ['node_modules/react-native-vector-icons/Fonts'],
   };
   ```

2. Run asset linking after npm install:
   ```powershell
   npx react-native-asset
   ```

3. Always rebuild after adding new dependencies

## Troubleshooting

### Icons still showing Chinese characters after rebuild?

1. **Verify fonts are in assets:**
   ```powershell
   Test-Path "android\app\src\main\assets\fonts\MaterialIcons.ttf"
   ```
   Should return `True`

2. **Check app bundle:**
   - Unzip the APK
   - Check `assets/fonts/` folder contains `.ttf` files

3. **Clear app data:**
   - Settings → Apps → BuzzIt → Clear Data
   - Reinstall app

4. **Full clean rebuild:**
   ```powershell
   cd android
   .\gradlew.bat clean
   Remove-Item -Recurse -Force app\build
   .\gradlew.bat assembleDebug
   ```

### Fonts not found in node_modules?

Reinstall the package:
```powershell
npm install react-native-vector-icons
```

Then run the fix script again.



