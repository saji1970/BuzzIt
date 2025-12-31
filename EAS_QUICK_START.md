# 🚀 EAS Quick Start Guide

## ✅ What's Been Set Up

1. ✅ **EAS CLI Installed** globally
2. ✅ **New Expo App Created**: `buzzit-ios`
3. ✅ **EAS Configuration Files** created:
   - `buzzit-ios/eas.json` - Build configuration
   - `BuzzIt/eas.json` - For existing React Native app

## 🎯 Next Steps

### Option 1: Use New Expo App (buzzit-ios)

```bash
# 1. Navigate to the new Expo app
cd buzzit-ios

# 2. Login to Expo
eas login

# 3. Initialize EAS with your project ID
eas init --id d537200a-e0fa-4ca6-892f-e5b6b40fb377

# 4. Build iOS app
eas build --platform ios --profile preview
```

### Option 2: Use Existing React Native App (BuzzIt)

Your existing React Native app can also use EAS Build:

```bash
# 1. Navigate to your React Native app
cd BuzzIt

# 2. Login to Expo
eas login

# 3. Initialize EAS (will create eas.json if needed)
eas init

# 4. Build iOS app
eas build --platform ios --profile preview
```

## 📱 Build Profiles

### Development (Simulator)
```bash
eas build --platform ios --profile development
```
- For iOS Simulator testing
- Faster builds
- No code signing required

### Preview (Ad-Hoc)
```bash
eas build --platform ios --profile preview
```
- For device testing
- Requires code signing
- Can install on up to 100 registered devices

### Production (App Store)
```bash
eas build --platform ios --profile production
```
- For App Store submission
- Requires App Store credentials
- Can auto-submit to App Store Connect

## 🔐 First Time Setup

On your first build, EAS will ask about code signing:

1. **Automatic (Recommended)**: EAS manages everything
   - Choose "Set up credentials automatically"
   - EAS creates certificates and provisioning profiles

2. **Manual**: You provide certificates
   - Upload your certificates via Expo dashboard
   - More control but more setup

## 📦 After Build Completes

1. **Check Status**:
   ```bash
   eas build:list
   ```

2. **Download IPA**:
   ```bash
   eas build:download
   ```
   Or download from: https://expo.dev

3. **Install on iPhone**:
   - Drag IPA to Finder (Mac) or iTunes
   - Or use TestFlight if submitted

## 🎨 Update Your Expo App

To copy your existing React Native code to the new Expo app:

1. Copy components from `BuzzIt/src` to `buzzit-ios`
2. Install dependencies: `npm install`
3. Update `app.json` with your app details
4. Test locally: `npx expo start`

## 📚 Resources

- **EAS Dashboard**: https://expo.dev
- **Documentation**: https://docs.expo.dev/build/introduction/
- **Build Status**: Check your Expo dashboard

## 💡 Tips

1. **Free Tier**: Limited builds/month, upgrade for more
2. **Build Time**: First build takes 15-20 min, subsequent builds faster
3. **OTA Updates**: Use `eas update` for JavaScript-only changes
4. **Credentials**: EAS auto-manages certificates (recommended)

---

## 🚀 Quick Commands Reference

```bash
# Login
eas login

# Initialize (new Expo app)
cd buzzit-ios
eas init --id d537200a-e0fa-4ca6-892f-e5b6b40fb377

# Initialize (existing React Native app)
cd BuzzIt
eas init

# Build iOS
eas build --platform ios --profile preview

# List builds
eas build:list

# Download build
eas build:download

# Update app (OTA)
eas update --branch production
```

---

**Ready to build?** Start with:
```bash
cd buzzit-ios
eas login
eas init --id d537200a-e0fa-4ca6-892f-e5b6b40fb377
eas build --platform ios --profile preview
```

