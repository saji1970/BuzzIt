# Build Scripts Location and Execution Path

## Project Structure

```
C:\BuzzIt\
├── android\                    ← Android project (no gradlew.bat - incomplete)
│   └── app\
│       └── build.gradle
│
└── BuzzIt\                     ← Main React Native Project (RUN FROM HERE)
    ├── android\                ← Android project (HAS gradlew.bat)
    │   ├── gradlew.bat         ← Gradle wrapper (Windows)
    │   ├── gradlew             ← Gradle wrapper (Unix)
    │   └── app\
    │       └── build.gradle
    │
    ├── package.json            ← React Native package.json
    ├── node_modules\           ← Dependencies
    │
    └── Build Scripts (PowerShell):
        ├── build-apk.ps1       ← Build APK script
        ├── fix-icons.ps1        ← Fix icon fonts script
        ├── redeploy.ps1        ← Redeploy script
        └── open-android-studio.ps1
```

## Where to Run Build Scripts

### ✅ CORRECT Location (Main Project)
```
C:\BuzzIt\BuzzIt\
```

**All build scripts should be run from here:**
- `build-apk.ps1`
- `fix-icons.ps1`
- `redeploy.ps1`
- `open-android-studio.ps1`

### ❌ INCORRECT Location
```
C:\BuzzIt\android\    ← This is incomplete, no gradlew.bat
```

## Execution Paths

### 1. Build Scripts (PowerShell)
**Location:** `C:\BuzzIt\BuzzIt\`
**Run from:** `C:\BuzzIt\BuzzIt\`

```powershell
cd C:\BuzzIt\BuzzIt
powershell -ExecutionPolicy Bypass -File build-apk.ps1
powershell -ExecutionPolicy Bypass -File fix-icons.ps1
powershell -ExecutionPolicy Bypass -File redeploy.ps1
```

### 2. Gradle Commands
**Location:** `C:\BuzzIt\BuzzIt\android\`
**Run from:** `C:\BuzzIt\BuzzIt\android\`

```powershell
cd C:\BuzzIt\BuzzIt\android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
.\gradlew.bat assembleRelease
```

### 3. React Native Commands
**Location:** `C:\BuzzIt\BuzzIt\`
**Run from:** `C:\BuzzIt\BuzzIt\`

```powershell
cd C:\BuzzIt\BuzzIt
npm start
npm run android
npm install
```

### 4. Android Studio Project
**Open this path in Android Studio:**
```
C:\BuzzIt\BuzzIt\android
```

## Quick Reference

| Task | Run From | Command |
|------|----------|---------|
| Build APK | `C:\BuzzIt\BuzzIt\` | `.\build-apk.ps1` |
| Fix Icons | `C:\BuzzIt\BuzzIt\` | `.\fix-icons.ps1` |
| Redeploy | `C:\BuzzIt\BuzzIt\` | `.\redeploy.ps1` |
| Gradle Clean | `C:\BuzzIt\BuzzIt\android\` | `.\gradlew.bat clean` |
| Gradle Build | `C:\BuzzIt\BuzzIt\android\` | `.\gradlew.bat assembleDebug` |
| React Native | `C:\BuzzIt\BuzzIt\` | `npm start` |
| Android Studio | Open | `C:\BuzzIt\BuzzIt\android` |

## Current Working Directory

When you open a terminal in the project:
- **Default:** Usually `C:\BuzzIt\` (root)
- **For scripts:** Should be `C:\BuzzIt\BuzzIt\` (project root)
- **For Gradle:** Should be `C:\BuzzIt\BuzzIt\android\` (Android project)

## Verification Commands

Check where you are:
```powershell
# Check current directory
Get-Location

# Check if gradlew.bat exists
Test-Path "android\gradlew.bat"

# Check if package.json exists (React Native project)
Test-Path "package.json"
```

## Common Mistakes

### ❌ Running from wrong directory
```powershell
# WRONG - Running from C:\BuzzIt\
cd C:\BuzzIt
.\build-apk.ps1    # Script not found here
```

### ✅ Running from correct directory
```powershell
# CORRECT - Running from C:\BuzzIt\BuzzIt\
cd C:\BuzzIt\BuzzIt
.\build-apk.ps1     # Script found here
```

### ❌ Running Gradle from wrong directory
```powershell
# WRONG
cd C:\BuzzIt\android
.\gradlew.bat clean    # gradlew.bat not found
```

### ✅ Running Gradle from correct directory
```powershell
# CORRECT
cd C:\BuzzIt\BuzzIt\android
.\gradlew.bat clean    # gradlew.bat found
```

## Summary

**Main Project Root:** `C:\BuzzIt\BuzzIt\`
- Contains: `package.json`, build scripts, React Native code
- Run all PowerShell scripts from here

**Android Project:** `C:\BuzzIt\BuzzIt\android\`
- Contains: `gradlew.bat`, `build.gradle`, Android code
- Run all Gradle commands from here
- Open this path in Android Studio



