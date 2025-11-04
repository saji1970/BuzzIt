# Play Store Release Guide

## Prerequisites

1. **Google Play Console Account**: You need a Google Play Developer account ($25 one-time fee)
2. **EAS Build Quota**: Your free plan quota resets on December 1, 2025
3. **App Information**: Store listing details ready

## Step 1: Build the AAB (Android App Bundle)

Once your EAS build quota resets, run:

```bash
npx eas-cli build --platform android --profile production
```

This will create an AAB (Android App Bundle) file required for Play Store submission.

### Alternative: Manual Build
If you need to build before the quota resets, you can:
1. Upgrade your EAS plan: https://expo.dev/accounts/sajipillai70/settings/billing
2. Or wait until December 1, 2025 when the quota resets

## Step 2: Create App in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in:
   - **App name**: Buzz it
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Accept terms

## Step 3: Complete Store Listing

### Required Information:

1. **App name**: Buzz it
2. **Short description** (80 chars max):
   ```
   Create buzz, share live streams, and connect with your community
   ```

3. **Full description** (4000 chars max):
   ```
   Buzz it - Your Social Media Hub

   Create and share your buzzes with the world! Buzz it is a modern social media platform where you can:

   ✨ Create Buzzes
   - Share your thoughts, events, polls, and gossip
   - Add photos and videos
   - Tag your interests
   - Connect with your community

   📹 Go Live
   - Stream live from your camera
   - Interact with viewers in real-time
   - Share your live streams
   - Facebook Live-like experience

   🔍 Discover
   - Search for users and channels
   - Follow interesting creators
   - Get personalized recommendations
   - Filter by interests and location

   💬 Engage
   - Like, comment, and share
   - View live comments on streams
   - Follow your favorite creators
   - Build your community

   🎯 Smart Features
   - AI-powered recommendations
   - Location-based content
   - Interest filters
   - Personalized feed

   Join Buzz it today and start sharing your story!
   ```

4. **App icon**: 512x512 PNG (no transparency)
5. **Feature graphic**: 1024x500 PNG
6. **Screenshots**: At least 2 screenshots (up to 8)
   - Phone: 16:9 or 9:16 aspect ratio
   - Minimum: 320px
   - Maximum: 3840px
   - Recommended: 1080 x 1920px

7. **Categories**: 
   - Primary: Social
   - Secondary: Communication

8. **Contact details**:
   - Email: (your support email)
   - Phone: (optional)
   - Website: (optional)

## Step 4: Set Up App Content

1. **Content rating**: Complete the questionnaire
2. **Target audience**: Select appropriate age groups
3. **Privacy policy**: Required URL
   - Create a privacy policy page
   - Add URL in Play Console

4. **Data safety**: Declare data collection practices
   - Location data (if used)
   - Personal information
   - Photos and videos
   - Device information

## Step 5: Upload AAB File

1. Go to "Production" → "Create new release"
2. Upload the AAB file from EAS build
3. Add release notes:
   ```
   Version 1.0.2 Release Notes:
   
   - Added goBuzzLive feature for live streaming
   - Removed Channel and Radio tabs
   - Fixed buzz creation to sync with backend
   - Improved user experience with My Buzzes section
   - Enhanced search functionality for users and channels
   - Bug fixes and performance improvements
   ```

4. Review and start rollout

## Step 6: Complete App Access

### Required for Submission:

1. **App signing**: EAS will handle this automatically
2. **App size**: Should be optimized (EAS handles this)
3. **Permissions**: Already configured in app.json:
   - CAMERA
   - RECORD_AUDIO
   - READ_EXTERNAL_STORAGE
   - WRITE_EXTERNAL_STORAGE
   - ACCESS_FINE_LOCATION
   - ACCESS_COARSE_LOCATION

4. **Target API level**: 33 (configured)

## Step 7: Submit for Review

1. Review all sections show green checkmarks
2. Click "Submit for review"
3. Review process typically takes 1-3 days

## Current App Configuration

- **Package name**: com.buzzit.app
- **Version**: 1.0.2
- **Version code**: 3
- **Build type**: AAB (Android App Bundle)
- **Target SDK**: 33
- **Compile SDK**: 33

## Important Notes

1. **EAS Build Quota**: Your free plan quota resets on December 1, 2025
   - To build before then, upgrade your plan
   - Or wait for quota reset

2. **Privacy Policy**: Required for Play Store
   - Must be accessible URL
   - Should cover data collection and usage

3. **Testing**: Consider internal testing track first
   - Test the AAB before production release
   - Use internal testing track for beta testing

4. **Store Assets**: Prepare all required images
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (at least 2)

## Quick Commands

### Build AAB (after quota reset):
```bash
npx eas-cli build --platform android --profile production
```

### Submit to Play Store (after setting up Google Service Account):
```bash
npx eas-cli submit --platform android
```

### Check build status:
```bash
npx eas-cli build:list --platform android
```

## Next Steps

1. ✅ App configured for AAB build
2. ⏳ Wait for EAS build quota reset (Dec 1, 2025) or upgrade plan
3. ⏳ Build AAB file
4. ⏳ Create Google Play Console account (if not done)
5. ⏳ Complete store listing
6. ⏳ Upload AAB and submit for review

## Support Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Play Store Policy](https://play.google.com/about/developer-content-policy/)

