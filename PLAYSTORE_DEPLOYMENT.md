# Google Play Store Deployment Guide

## Prerequisites

1. **Google Play Developer Account** - You need a Google Play Developer account ($25 one-time fee)
2. **Expo Account** - Sign up at https://expo.dev
3. **EAS CLI** - Already installed

## Step 1: Login to Expo

```bash
eas login
```

Follow the prompts to login with your Expo account.

## Step 2: Create Android Build

### For Android (Google Play Store):

```bash
eas build --platform android --profile production
```

This will:
- Create a production Android build (AAB - Android App Bundle)
- Sign it with your signing key
- Upload it to Expo's servers
- Take approximately 10-20 minutes

### Monitor the build:

```bash
eas build:list
```

Or view it in the browser at https://expo.dev

## Step 3: Create App in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console/)
2. Click on "Create app"
3. Fill in the details:
   - **App name**: Buzz it
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
   - **Developer Program Policies**: Agree and continue

## Step 4: Complete App Information

1. **Store listing**:
   - App description (short and long)
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (at least 2)
   - Phone screenshots (1920 x 1280)
   - Tablet screenshots (if applicable)
   - Promotional video (optional)
   - Website URL
   - Privacy Policy URL (required)

2. **Content rating**:
   - Complete the questionnaire
   - Get your rating

3. **Target audience and content**:
   - Age groups
   - Content guidelines

4. **Privacy policy**:
   - Link to privacy policy
   - Data safety section

## Step 5: Submit AAB to Play Store

Once the build is complete, submit it:

```bash
eas submit --platform android --latest
```

This will:
- Download the AAB file
- Upload to Google Play Console
- Create a new release

## Step 6: Complete Additional Information

1. **App access**:
   - Choose if your app is available to everyone or restricted

2. **Ads**:
   - Declare if your app contains ads

3. **Content rating**:
   - Complete the IARC rating questionnaire

4. **Target audience**:
   - Select primary and secondary target audiences

5. **COVID-19 contact tracing and status apps**:
   - Answer if applicable

## Step 7: Upload AAB and Create Release

1. Go to "Production" → "Releases"
2. Click "Create new release"
3. Upload the AAB file downloaded from EAS
4. Fill in release notes:
   ```
   Version 1.0.0
   - Initial release
   - Create buzz in social media
   - Follow buzzers and channels
   - Share to social media platforms
   - Backend powered by Railway
   ```
5. Click "Review release"

## Step 8: Review and Rollout

1. Review all information
2. Click "Start rollout to production"
3. Google will review your app (typically 1-3 days)

## Important Notes

### Environment Setup

Your app is configured to use the Railway backend:
- **Backend URL**: `https://buzzit-production.up.railway.app`
- **Backend enabled**: Yes (`USE_BACKEND: true`)

### Package Information

- **Package Name**: `com.buzzit.app`
- **Version**: 1.0.0
- **Version Code**: 1

### Required Permissions

The app requests:
- Camera (for photos/videos)
- Storage (for selecting media)
- Microphone (for video recording)
- Location (optional usage)
- Internet (for backend connections)

### Important Links to Prepare

1. **Privacy Policy** - Required by Google Play
   - Describe what data you collect
   - How you use the data
   - Example: https://yourwebsite.com/privacy

2. **Support URL**
   - Contact information
   - Example: https://yourwebsite.com/support

3. **Promotional Graphics**:
   - Feature Graphic: 1024x500 PNG
   - Phone Screenshots: 1920x1280 PNG (at least 2)
   - Icon: 512x512 PNG

## Testing Before Submission

### Test the Android Build

```bash
# Download the AAB and test
eas build:download -p android --latest
```

Or install directly on a device:
```bash
eas build --platform android --profile preview
```

## Android Signing

EAS automatically handles signing for you. The first time you build, you'll be asked to:

1. Choose signing key management
2. Either let EAS manage it or upload your own

## Google Play Console Checklist

- [ ] App created in Play Console
- [ ] Store listing completed
- [ ] Screenshots uploaded
- [ ] App icon (512x512) uploaded
- [ ] Feature graphic (1024x500) uploaded
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] Content rating completed
- [ ] Target audience selected
- [ ] Data safety section completed
- [ ] AAB file uploaded
- [ ] Release notes added
- [ ] Review and roll out

## Post-Submission

Once approved:
1. Your app will be live on Google Play Store
2. Update the backend URL if needed
3. Monitor crash reports in Play Console
4. Track user reviews and ratings
5. Prepare for updates

## Common Issues

### Signing Issues

If you encounter signing issues:

```bash
eas credentials
```

This will help you manage signing keys.

### Build Failures

Check the build logs:
```bash
eas build:view <build-id>
```

### Missing Permissions

Make sure all required permissions are in `app.json`:

```json
"permissions": [
  "CAMERA",
  "READ_EXTERNAL_STORAGE",
  "WRITE_EXTERNAL_STORAGE",
  "RECORD_AUDIO",
  "ACCESS_FINE_LOCATION",
  "ACCESS_COARSE_LOCATION",
  "INTERNET"
]
```

## Testing Checklist

Before submitting to Play Store:

- [ ] Install on real Android device
- [ ] Test all features
- [ ] Verify backend connections
- [ ] Test social media sharing
- [ ] Test profile creation and logout
- [ ] Test follow functionality
- [ ] Test three-dot menu actions
- [ ] Test subscribed channels
- [ ] Test image/video picker
- [ ] Test camera functionality
- [ ] Verify all permissions work
- [ ] Test on different screen sizes

## Next Steps

1. Set up analytics (Firebase, Google Analytics, etc.)
2. Implement crash reporting (Sentry, Firebase Crashlytics)
3. Monitor app performance
4. Plan feature updates
5. Set up beta testing track

## Support

- **Expo Documentation**: https://docs.expo.dev/
- **Google Play Console**: https://play.google.com/console/
- **EAS Build**: https://docs.expo.dev/build/introduction/

## Quick Commands Reference

```bash
# Login to Expo
eas login

# Build for Android
eas build --platform android --profile production

# List builds
eas build:list

# View build details
eas build:view <build-id>

# Download build
eas build:download -p android

# Submit to Play Store
eas submit --platform android --latest

# Check credentials
eas credentials

# Create preview build
eas build --platform android --profile preview
```

## App Store vs Play Store

### iOS (App Store)
- Bundle ID: `com.buzzit.app`
- Build for: App Store
- Format: .ipa
- Review time: 24-48 hours

### Android (Play Store)
- Package Name: `com.buzzit.app`
- Build for: Play Store
- Format: .aab (Android App Bundle)
- Review time: 1-3 days

Both platforms share the same codebase and backend! 🚀
