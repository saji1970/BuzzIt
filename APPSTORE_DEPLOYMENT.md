# App Store Deployment Guide

## Prerequisites

1. **Apple Developer Account** - You need an active Apple Developer Program membership ($99/year)
2. **Expo Account** - Sign up at https://expo.dev
3. **EAS CLI** - Already installed

## Step 1: Login to Expo

```bash
eas login
```

Follow the prompts to login with your Expo account.

## Step 2: Configure EAS

```bash
eas build:configure
```

This will create/update your `eas.json` configuration.

## Step 3: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click on "My Apps" → "+" → "New App"
3. Fill in the details:
   - **Platform**: iOS
   - **Name**: Buzz it
   - **Primary Language**: English
   - **Bundle ID**: com.buzzit.app
   - **SKU**: buzzit-app
   - **User Access**: Full Access

## Step 4: Create a Production Build

### For iOS (App Store):

```bash
eas build --platform ios --profile production
```

This will:
- Create a production iOS build
- Sign it with your Apple Developer certificate
- Upload it to Expo's servers
- Take approximately 10-20 minutes

### Monitor the build:

```bash
eas build:list
```

Or view it in the browser at https://expo.dev

## Step 5: Submit to App Store

Once the build is complete, submit it to the App Store:

```bash
eas submit --platform ios --latest
```

This will:
- Download the build
- Create an App Store Connect record
- Submit the app for review

## Step 6: Complete App Store Connect Information

Go to App Store Connect and complete:

1. **App Information**:
   - Category
   - Subtitle
   - Privacy Policy URL
   - Support URL

2. **Pricing and Availability**:
   - Price: Free
   - Availability: All countries or specific ones

3. **App Privacy**:
   - Describe data collection
   - Privacy policy URL

4. **App Review Information**:
   - Contact information
   - Demo account credentials (if needed)
   - Notes for review

5. **Version Information**:
   - What's New in This Version
   - Screenshots (required)
   - App Preview (optional)
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)

6. **Build Selection**:
   - Select the build you submitted

## Step 7: Submit for Review

1. Review all information
2. Click "Submit for Review"
3. Apple will review your app (typically 24-48 hours)

## Important Notes

### Environment Setup

Your app is configured to use the Railway backend:
- **Backend URL**: `https://buzzit-production.up.railway.app`
- **Backend enabled**: Yes (`USE_BACKEND: true`)

### Bundle ID

- **iOS Bundle ID**: `com.buzzit.app`

### Version Information

- **Version**: 1.0.0
- **Build Number**: 1.0.0

### Required Permissions

The app requests:
- Camera (for photos/videos)
- Photo Library (for selecting media)
- Microphone (for video recording)
- Location (optional usage)

### Manual Submission (Alternative)

If automatic submission doesn't work:

1. Download the `.ipa` file from EAS
2. Use **Transporter** app (from Mac App Store) or **Xcode**:
   - Open Xcode
   - Window → Organizer
   - Archives tab
   - Click "Distribute App"
   - Follow the wizard

## Troubleshooting

### Certificate Issues

If you encounter certificate issues:

```bash
eas credentials
```

This will help you manage certificates.

### Build Failures

Check the build logs:
```bash
eas build:view <build-id>
```

### Common Issues

1. **Missing entitlements**: Make sure all required permissions are in `app.json`
2. **Code signing errors**: Run `eas credentials` to fix
3. **Version conflicts**: Update the version number in `app.json`

## Testing Before Submission

Test your app thoroughly:
1. Install the production build on a real device
2. Test all features
3. Verify backend connections
4. Test social media sharing
5. Test profile creation and logout

## Post-Submission

Once approved:
1. Your app will be live on the App Store
2. Update the backend URL if needed
3. Monitor crash reports and user feedback
4. Prepare for updates

## Next Steps

1. Set up analytics (Firebase, Mixpanel, etc.)
2. Implement crash reporting (Sentry)
3. Monitor app performance
4. Plan feature updates

## Support

- **Expo Documentation**: https://docs.expo.dev/
- **App Store Connect**: https://appstoreconnect.apple.com/
- **Apple Developer**: https://developer.apple.com/
