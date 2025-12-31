# EAS Build Commands for buzzit-ios

## 🔐 First: Login to Expo

```bash
cd buzzit-ios
eas login
```

You'll be prompted to:
- Enter your email/username
- Enter your password
- Or login via browser

## 📦 Initialize EAS (After Login)

After logging in, run:

```bash
eas init --id d537200a-e0fa-4ca6-892f-e5b6b40fb377
```

This will link your local project to your Expo project.

## 🚀 Build Commands

### Build for iOS Simulator (Development)
```bash
eas build --platform ios --profile development
```

### Build for iOS Device (Preview/Ad-Hoc)
```bash
eas build --platform ios --profile preview
```

### Build for App Store (Production)
```bash
eas build --platform ios --profile production
```

### Build and Auto-Submit to App Store
```bash
eas build --platform ios --profile production --auto-submit
```

## 📱 View Builds

```bash
# List all builds
eas build:list

# View specific build details
eas build:view [build-id]

# Download build
eas build:download [build-id]
```

## 🔄 Update App (OTA Updates)

After making JavaScript changes, update without rebuilding:

```bash
eas update --branch production --message "Update description"
```

## 📋 Build Status

Check build status at:
- Web: https://expo.dev/accounts/[your-account]/projects/buzzit-ios/builds
- CLI: `eas build:list`

## 🎯 Quick Start Script

After logging in, run:

```bash
# 1. Login
eas login

# 2. Initialize (if not already done)
eas init --id d537200a-e0fa-4ca6-892f-e5b6b40fb377

# 3. Build iOS preview
eas build --platform ios --profile preview

# 4. Wait for build to complete (10-15 min)
# 5. Download IPA from Expo dashboard or use:
eas build:download
```

## 📦 Installation

Once build completes:

1. **Download IPA**:
   - From Expo dashboard, or
   - Run `eas build:download`

2. **Install on iPhone**:
   - Connect iPhone to Mac
   - Drag IPA to Finder/iTunes
   - Or use TestFlight (if submitted to App Store Connect)

## 🔐 Code Signing

EAS handles code signing automatically. On first build:
- You'll be prompted to create credentials
- EAS will manage certificates and provisioning profiles
- Choose "Set up credentials automatically" (recommended)

## 💡 Tips

- **First build**: Takes 15-20 minutes (environment setup)
- **Subsequent builds**: Faster (5-10 minutes) with caching
- **Free tier**: Limited builds/month
- **Auto-submit**: Saves time by automatically submitting to App Store

