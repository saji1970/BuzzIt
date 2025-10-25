# Quick Build Guide for Buzzit App

## Prerequisites

1. Login to EAS:
```bash
eas login
```

## Option 1: Build Both Platforms Automatically

Run the automated build script:
```bash
./build-production.sh
```

## Option 2: Build Manually

### Build for iOS (App Store)

```bash
eas build --platform ios --profile production
```

### Build for Android (Google Play Store)

```bash
eas build --platform android --profile production
```

## Monitor Builds

Check build status:
```bash
eas build:list
```

View specific build:
```bash
eas build:view <build-id>
```

## Download Builds

### iOS
```bash
eas build:download -p ios
```

### Android
```bash
eas build:download -p android
```

## Submit to Stores

### iOS (App Store)
```bash
eas submit --platform ios --latest
```

### Android (Google Play Store)
```bash
eas submit --platform android --latest
```

## Build Profiles

Check current profiles in `eas.json`:
- `production` - For App Store/Play Store submission
- `preview` - For internal testing
- `development` - For development builds

## Common Commands

```bash
# List all builds
eas build:list

# View build details
eas build:view <build-id>

# Download specific build
eas build:download <build-id>

# Cancel running build
eas build:cancel <build-id>

# Delete a build
eas build:delete <build-id>

# Check credentials
eas credentials
```

## Troubleshooting

### Build Failed

1. Check logs:
```bash
eas build:view <build-id>
```

2. Common issues:
   - Missing dependencies
   - Code signing errors
   - Invalid configuration

### Check Configuration

```bash
eas config
```

## Time Estimates

- iOS Build: 10-20 minutes
- Android Build: 10-20 minutes
- Total: ~30-40 minutes for both

## After Builds Complete

1. Download builds
2. Test on devices
3. Submit to stores
4. Monitor status

## Need Help?

- EAS Documentation: https://docs.expo.dev/build/introduction/
- EAS Status: https://status.expo.dev/
- Support: support@expo.dev
