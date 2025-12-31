# BuzzIt App Icon Setup Guide

## Overview
This guide explains how to generate and install the BuzzIt app icon for both Android and iOS.

## Step 1: Generate Icon Images

1. Open `app-icon-generator.html` in your web browser (Chrome, Firefox, Safari, or Edge)
2. You'll see the BuzzIt icon design with:
   - A blue gradient background (#2F7BFF to #5D3BFF)
   - Large white "B" lettermark
   - Pink "live" indicator dot in the top-right
   - Subtle buzz waves in the background

3. Click **"Download All Sizes"** to download all required icon sizes:
   - 1024x1024 (iOS App Store)
   - 192x192 (Android xxxhdpi)
   - 144x144 (Android xxhdpi)
   - 96x96 (Android xhdpi)
   - 72x72 (Android hdpi)
   - 48x48 (Android mdpi)

## Step 2: Install Android Icons

After downloading the icons, copy them to the Android mipmap folders:

```bash
# Copy icons to Android folders
cp buzzit-icon-192x192.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
cp buzzit-icon-192x192.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

cp buzzit-icon-144x144.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp buzzit-icon-144x144.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png

cp buzzit-icon-96x96.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
cp buzzit-icon-96x96.png android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png

cp buzzit-icon-72x72.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
cp buzzit-icon-72x72.png android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png

cp buzzit-icon-48x48.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png
cp buzzit-icon-48x48.png android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
```

### On Windows (PowerShell):
```powershell
Copy-Item buzzit-icon-192x192.png android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png
Copy-Item buzzit-icon-192x192.png android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png

Copy-Item buzzit-icon-144x144.png android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png
Copy-Item buzzit-icon-144x144.png android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png

Copy-Item buzzit-icon-96x96.png android\app\src\main\res\mipmap-xhdpi\ic_launcher.png
Copy-Item buzzit-icon-96x96.png android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png

Copy-Item buzzit-icon-72x72.png android\app\src\main\res\mipmap-hdpi\ic_launcher.png
Copy-Item buzzit-icon-72x72.png android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png

Copy-Item buzzit-icon-48x48.png android\app\src\main\res\mipmap-mdpi\ic_launcher.png
Copy-Item buzzit-icon-48x48.png android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png
```

## Step 3: Install iOS Icons

1. Open your project in Xcode
2. Navigate to `ios/Buzzit/Images.xcassets/AppIcon.appiconset/`
3. Drag and drop the 1024x1024 icon into the App Store slot
4. Xcode will automatically generate the other required sizes

**Or manually:**
- Place `buzzit-icon-1024x1024.png` in `ios/Buzzit/Images.xcassets/AppIcon.appiconset/`
- Update the `Contents.json` file to reference the new icon

## Step 4: Clean and Rebuild

### Android:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### iOS:
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

## Icon Design Details

The BuzzIt icon features:
- **Background**: Blue gradient (#2F7BFF → #5D3BFF) representing trust and technology
- **Letter "B"**: Bold white lettermark for brand recognition
- **Live Indicator**: Pink/red dot (#FF0069) representing the "BuzzLive" streaming feature
- **Buzz Waves**: Subtle concentric circles suggesting broadcasting and social buzz
- **Modern Style**: Rounded corners (iOS style) with subtle gradients and shadows

## Customization

To modify the icon design:
1. Open `app-icon-generator.html` in a text editor
2. Modify the JavaScript `drawIcon()` function
3. Update colors, shapes, or text as needed
4. Reload the HTML file in your browser
5. Re-download the icons

## Troubleshooting

**Android icon not updating:**
- Clear app data
- Uninstall and reinstall the app
- Run `./gradlew clean`

**iOS icon not updating:**
- Clean build folder (Cmd+Shift+K in Xcode)
- Delete app from simulator/device
- Rebuild

## Notes

- The icon uses a rounded square design that works well on both Android (adaptive icons) and iOS
- All icons are PNG format with transparent backgrounds where applicable
- The design is optimized for visibility at all sizes (48px to 1024px)
