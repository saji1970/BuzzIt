# EAS Login Instructions

## Run These Commands in Your Terminal

```bash
cd /Users/sajipillai/Buzzit

# Login to EAS
eas login

# Enter your Expo account credentials when prompted
# Email: your-email@example.com
# Password: *******
```

## After Login

Once logged in, run:

```bash
# Build Android app for Play Store
eas build --platform android --profile production
```

## What Happens Next

1. **Build process starts** (15-20 minutes)
2. **Expo builds your app** in the cloud
3. **Download the .aab file** when complete
4. **Upload to Play Store**

## Alternative: Use GitHub Login

If you prefer:

```bash
eas login --github
```

## Check Login Status

```bash
eas whoami
```

Should show your Expo username if logged in.

## If You Don't Have an Expo Account

1. Go to: https://expo.dev/signup
2. Create a free account
3. Come back and run `eas login`

---

**After login, the build will start automatically! 🚀**
