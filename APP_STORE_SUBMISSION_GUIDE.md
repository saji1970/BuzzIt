# App Store Submission Guide

## Overview
This guide covers submitting **Buzz it** to both:
- 📱 **Apple App Store** (iOS)
- 🤖 **Google Play Store** (Android)

---

## 🍎 Part 1: iOS App Store Submission

### Prerequisites
1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com/programs
2. **App Store Connect** access
   - Access at: https://appstoreconnect.apple.com
3. **Xcode** (for certificates and provisioning profiles)

### Step 1: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in the details:
   - **Platform**: iOS
   - **Name**: Buzz it
   - **Primary Language**: English
   - **Bundle ID**: com.buzzit.app (already configured)
   - **SKU**: com.buzzit.app
   - **User Access**: Full Access

### Step 2: Configure App Information

In App Store Connect, fill in:
- **App Information**:
  - Category: Social Networking
  - Subcategory: Social
  - Content Rights: You own all content
  
- **Pricing**:
  - Price: Free
  - Availability: All countries

- **App Privacy**:
  - Data Collection: Camera, Photos, Location
  - Reason: User-generated content, social features

### Step 3: Add App Store Listing

**Screenshots** (Required):
- iPhone 6.7" (iPhone 14 Pro Max)
- iPhone 6.5" (iPhone 11 Pro Max)
- iPhone 5.5" (iPhone 8 Plus)

**App Preview** (Optional):
- 30-second video showing app features

**App Description**:
```
🔥 Buzz it - Create Buzz in Social Media

Buzz it is a revolutionary social media platform that lets you share content based on your interests. Connect with like-minded people and discover what's buzzing around you.

FEATURES:
✨ Interest-based Content Discovery
🎬 Buzz Channel - Share music videos, movies, and more
📻 Radio Channel - Live podcasts and discussions
🎨 Beautiful Themes - Customize your experience
🔒 Enterprise-grade Security
🌍 Geographic Targeting - Reach your audience

Create buzz today!
```

**Keywords**: social media, buzz, content sharing, interest-based, social network

**Support URL**: https://buzzit.app/support
**Marketing URL**: https://buzzit.app

### Step 4: Build and Submit

```bash
cd /Users/sajipillai/Buzzit

# 1. Update eas.json with your credentials
# Edit eas.json and replace placeholders with your actual:
# - appleId (your Apple ID email)
# - ascAppId (from App Store Connect)
# - appleTeamId (your team ID from Apple Developer)

# 2. Build for App Store
eas build --platform ios --profile production

# 3. Wait for build to complete (~20-30 minutes)

# 4. Submit to App Store
eas submit --platform ios --latest
```

### Step 5: Submit for Review

1. Go to App Store Connect
2. Click **Prepare for Submission**
3. Select your build
4. Answer **App Review Information**:
   - Contact Information
   - Demo Account (if required)
   - Notes: "This is a social media app. Users can create content and share it with others based on interests."

5. Click **Submit for Review**
6. Wait 1-7 days for review

---

## 🤖 Part 2: Google Play Store Submission

### Prerequisites
1. **Google Play Developer Account** ($25 one-time)
   - Sign up at: https://play.google.com/console

### Step 1: Create App in Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in:
   - **App name**: Buzz it
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Check all applicable

### Step 2: App Content

**App Access**:
- All or some functionality is restricted? No

**Content Rating**:
- Complete questionnaire
- Likely rating: **Everyone** or **Teen**

**Content Rights**:
- You own all rights to the content

**Target Audience**:
- Age: 13+ or Adults
- Must have: Teen or Adult content (social media)

### Step 3: Set Up Your Store Listing

**App Details**:
```
Short description:
Create buzz in social media! Share content based on your interests.

Full description:
🔥 Buzz it - Create Buzz in Social Media

Buzz it is a revolutionary social media platform that lets you share content based on your interests. Connect with like-minded people and discover what's buzzing around you.

KEY FEATURES:
✨ Interest-based content discovery
🎬 Buzz Channel for media content
📻 Radio Channel for live podcasts
🎨 Beautiful customizable themes
🔒 Enterprise-grade security
🌍 Geographic audience targeting

Download now and start creating buzz!
```

**Screenshots** (Required):
- Phone: 1080 x 1920 px (minimum 2)
- 7-inch tablet: 1200 x 1920 px (optional)
- TV: 1920 x 1080 px (optional)

**Graphics**:
- App icon: 512 x 512 px
- Feature graphic: 1024 x 500 px

**Categories**:
- App category: Social
- Tags: social media, social network, content sharing

**Contact details**:
- Website: https://buzzit.app
- Email: support@buzzit.app

### Step 4: App Content Policies

**Data Safety**:
- Data collected: Photos, Camera, Location, Personal info
- Data shared: No data shared with third parties
- Security practices: Data encrypted

**Privacy Policy** (Required):
- Create a privacy policy document
- Host it at: https://buzzit.app/privacy
- Link it in Play Console

**Content Rating**:
- Complete the questionnaire
- Age ratings: 13+

### Step 5: Build and Submit

```bash
cd /Users/sajipillai/Buzzit

# 1. Build for Play Store
eas build --platform android --profile production

# 2. Wait for build to complete (~15-20 minutes)

# 3. Download the AAB file
eas build:download --platform android --latest

# 4. Manual upload to Play Console:
#    - Go to Play Console → Production → Create new release
#    - Upload the .aab file
#    - Add release notes
#    - Click Review release
```

---

## 📋 Submission Checklist

### iOS App Store
- ✅ Apple Developer Account
- ✅ App created in App Store Connect
- ✅ App screenshots uploaded
- ✅ App description written
- ✅ Build created via EAS
- ✅ Build submitted to App Store Connect
- ✅ App submitted for review
- ✅ Review approved

### Google Play Store
- ✅ Google Play Developer Account
- ✅ App created in Play Console
- ✅ Store listing completed
- ✅ Privacy policy created
- ✅ Content rating completed
- ✅ Screenshots uploaded
- ✅ Build created via EAS
- ✅ AAB file uploaded to Play Console
- ✅ App published

---

## ⚙️ Configuration Needed

### Update eas.json

Replace these placeholders in `eas.json`:

**iOS**:
```json
"appleId": "your-actual-apple-id@example.com",
"ascAppId": "1234567890",  // Get from App Store Connect
"appleTeamId": "ABCD123456"  // Get from Apple Developer account
```

**Android** (if using automatic submission):
```json
"serviceAccountKeyPath": "./path/to/service-account-key.json"
```

---

## 📞 Support

For issues during submission:
- **Apple Support**: https://developer.apple.com/support
- **Google Support**: https://support.google.com/googleplay
- **EAS Support**: https://docs.expo.dev/build/introduction/

---

## 🎉 After Approval

Once approved:
1. **iOS**: App goes live in 24-48 hours
2. **Android**: App goes live within a few hours

Monitor reviews and ratings in your developer consoles!

---

**Good luck with your submission! 🚀**
