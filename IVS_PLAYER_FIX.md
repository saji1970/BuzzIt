# IVS Player Import Fix

## Issue Found
The Amazon IVS React Native Player was not rendering because of an **incorrect import statement**.

## Root Cause
The package exports `IVSPlayer` as a **default export**, not a named export.

### Incorrect Import (Before)
```typescript
import {IVSPlayer} from 'amazon-ivs-react-native-player';  // ❌ Wrong - named import
```

### Correct Import (After)
```typescript
import IVSPlayer from 'amazon-ivs-react-native-player';  // ✅ Correct - default import
```

## Evidence
From the TypeScript definitions:
```typescript
// node_modules/amazon-ivs-react-native-player/lib/typescript/index.d.ts
export { default } from './IVSPlayer';
```

This confirms it's a default export.

## Impact
- The component was `undefined`, causing it to not render
- No errors were thrown (React just silently fails when component is undefined)
- The "Stream not available" placeholder was shown instead
- No logs from IVS Player callbacks because the component never mounted

## Fix Applied
✅ Changed import from named to default export in `StreamViewerScreen.tsx`

## Next Steps
1. **Reload the app** - The Metro bundler should pick up the change automatically
2. **Test streaming** - Open a live stream and verify playback works
3. **Check logs** - You should now see IVS Player logs:
   - `[StreamViewerScreen] Playable URL: ...`
   - `[StreamViewerScreen] IVS Player load started, URL: ...`
   - `[StreamViewerScreen] IVS Player state changed: ...`

## Monitoring Logs
After reloading, check for IVS Player activity:
```bash
adb logcat | Select-String -Pattern "StreamViewerScreen|IVS Player" -CaseSensitive:$false
```

You should now see:
- Playable URL logs
- IVS Player load/state change logs
- Any errors from the player

## Additional Notes
The IVS Player component should now:
- ✅ Render properly
- ✅ Load the stream URL
- ✅ Trigger state change callbacks
- ✅ Handle errors correctly
- ✅ Support play/pause controls

If streaming still doesn't work after this fix, check:
1. Network connectivity
2. Stream URL validity
3. IVS Player native module linking (may need to rebuild)
4. Android permissions (INTERNET is already set)

