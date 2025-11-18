# Troubleshooting Guide

## Current Status

✅ **Files Created:**
- `src/utils/Result.ts` (56 lines)
- `src/hooks/useStreamManager.ts` (77 lines)

✅ **Code Updated:**
- `src/screens/GoBuzzLiveScreen.tsx` - Added useCallback wrappers

✅ **Fixes Applied:**
- TypeScript type errors fixed
- React import added
- Dependency arrays fixed
- Circular references fixed

## To Get the Exact Error

### Method 1: Metro Bundler
```bash
npx react-native start --reset-cache
```
Look for red error messages in the terminal output.

### Method 2: Android Logs
```bash
adb logcat *:E | grep -i "buzzit\|error\|exception"
```

### Method 3: Check Device
- Open the app
- Navigate to GoBuzzLive screen
- Check the red error screen for the exact message

## Common Errors & Fixes

### Error: "Cannot find module '../hooks/useStreamManager'"
**Fix**: Verify files exist:
```powershell
Test-Path "src\hooks\useStreamManager.ts"
Test-Path "src\utils\Result.ts"
```

### Error: "Hooks can only be called inside function components"
**Fix**: Make sure `useStreamManager()` is called at the top level, not inside conditions

### Error: "Maximum update depth exceeded"
**Fix**: This is usually a dependency array issue - already fixed with useCallback

### Error: TypeScript compilation errors
**Fix**: Run `npx tsc --noEmit` to see specific errors

## Quick Verification

Run these commands to verify everything is in place:

```powershell
# Check files
Get-ChildItem "src\utils" | Select-Object Name
Get-ChildItem "src\hooks" | Select-Object Name

# Check imports in GoBuzzLiveScreen
Select-String -Path "src\screens\GoBuzzLiveScreen.tsx" -Pattern "useStreamManager"
```

## Next Steps

**Please share:**
1. The exact error message (copy/paste from Metro or device logs)
2. When the error occurs (startup, navigation, button press)
3. Any stack trace or additional context

This will help me identify and fix the specific issue.

