# Amazon IVS Demo Code Analysis & Patterns for BuzzIt

## Executive Summary

This document analyzes the [Amazon IVS Real-time Android Demo](https://github.com/aws-samples/amazon-ivs-real-time-for-android-demo) and extracts patterns applicable to BuzzIt. While the demo uses WebRTC (IVS Stages) and BuzzIt uses RTMP (IVS Channels), the lifecycle management, error handling, and state management patterns are highly relevant.

---

## 1. Stream Ending/Cleanup Logic Comparison

### IVS Demo Cleanup Pattern

**StageHandler.endStage()** (lines 165-187):
```kotlin
fun endStage() = launchDefault {
    val currentStageIndex = _stages.value.indexOfFirst {
        it.stageId == _currentStageId
    }.takeIf { it >= 0 } ?: return@launchDefault
    
    Timber.d("Ending stage: ${currentStage?.stageId} at index: $currentStageIndex")
    
    // 1. Stop publishing FIRST (local cleanup)
    StageManager.stopPublishing()
    
    // 2. Show loading state
    NavigationHandler.setLoading(true)
    
    // 3. Delete on backend
    NetworkHandler.deleteStage().handle(
        onSuccess = {
            NavigationHandler.setLoading(false)
            NavigationHandler.goBack()
            NavigationHandler.goTo(Destination.Stage(StageDestinationType.None))
            
            // 4. Update local state
            val stages = _stages.value.map { it.copy() }.toMutableList()
            stages.removeAt(currentStageIndex)
            _stages.update { stages }
        },
        onFailure = { error ->
            NavigationHandler.setLoading(false)
            NavigationHandler.showError(ErrorDestination.SnackBar(error = error))
        }
    )
}
```

**StageManager.stopPublishing()** (lines 413-422):
```kotlin
fun stopPublishing() {
    _selfStreams.clear()                    // Clear stream list
    _selfAudioStream?.setStatsCallback(null) // Remove callbacks
    _selfAudioStream?.setListener(null)     // Remove listeners
    _selfAudioStream = null                  // Nullify reference
    _selfVideoStream?.setListener(null)     // Remove listeners
    _selfVideoStream = null                  // Nullify reference
    Timber.d("Publishing stopped")
    refreshVideoStreams()                   // Update UI
}
```

**StageManager.dispose()** (lines 365-372):
```kotlin
fun dispose() {
    Timber.d("Disposing stage manager")
    _rtcStatsJob?.cancel()                  // Cancel background jobs
    _rtcStatsJob = null
    _stage?.removeRenderer(stageRenderer)    // Remove renderer
    _stage?.leave()                         // Leave stage
    _stage = null                           // Nullify reference
}
```

### BuzzIt Current Cleanup Pattern

**GoBuzzLiveScreen.handleEndStream()** (lines 379-444):
```typescript
const handleEndStream = async () => {
  Alert.alert(
    'End Stream',
    'Are you sure you want to end this live stream?',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'End Stream',
        style: 'destructive',
        onPress: async () => {
          try {
            // 1. Stop publishing first
            if (publisherRef.current) {
              try {
                await publisherRef.current.stop();
              } catch (stopError) {
                console.error('Error stopping publisher:', stopError);
              }
            }

            // 2. Clear publish URL and trigger
            setPublishUrl('');
            setPublisherTrigger(0);
            setStreamStatus('idle');
            setIsStreaming(false);

            // 3. End stream on backend
            if (currentStream) {
              try {
                await ApiService.endLiveStream(currentStream.id);
                console.log('Stream ended successfully on backend');
              } catch (apiError: any) {
                console.error('Error ending stream on backend:', apiError);
              }
            }

            // 4. Clear all state
            setCurrentStream(null);
            setShowSetup(true);
            setTitle('');
            setDescription('');
            setComments([]);
            setViewers(0);
            setActiveServerStream(null);
            setHasIncrementedViewerCount(false);
            
            // 5. Navigate back
            navigation.goBack();
          } catch (error: any) {
            console.error('Error ending stream:', error);
            // Fallback cleanup
            setIsStreaming(false);
            setCurrentStream(null);
            setActiveServerStream(null);
            setPublishUrl('');
            setPublisherTrigger(0);
            setStreamStatus('idle');
            setShowSetup(true);
            navigation.goBack();
          }
        },
      },
    ]
  );
};
```

**BuzzLivePublisher.handleStop()** (lines 162-183):
```typescript
const handleStop = useCallback(async () => {
  try {
    setBusy(true);
    updateStatus('idle');
    // Stop the stream - this should stop both stream and preview
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
        console.log('Camera stopped successfully');
      } catch (stopError) {
        console.error('Error stopping camera:', stopError);
        // Continue with cleanup even if stop fails
      }
    }
  } catch (error: any) {
    console.error('Error in handleStop:', error);
    updateStatus('error');
  } finally {
    setBusy(false);
    updateStatus('idle');
  }
}, [updateStatus]);
```

### Key Differences & Improvements

| Aspect | IVS Demo | BuzzIt | Recommendation |
|--------|----------|--------|----------------|
| **Order of Operations** | 1. Stop publishing 2. Backend 3. State 4. Navigation | 1. Stop publishing 2. State 3. Backend 4. Navigation | ✅ BuzzIt order is good |
| **Error Handling** | Separate success/failure handlers | Try-catch with fallback | ✅ Both are good, but demo's pattern is cleaner |
| **Loading State** | Shows loading during backend call | No loading indicator | ⚠️ **Add loading state** |
| **Listener Cleanup** | Explicitly removes callbacks/listeners | Relies on component unmount | ⚠️ **Add explicit cleanup** |
| **Background Jobs** | Cancels RTC stats job | No background jobs | ✅ N/A for BuzzIt |
| **State Updates** | Updates state after backend success | Updates state before backend | ⚠️ **Consider updating after backend success** |
| **Navigation** | Navigates after backend success | Navigates regardless | ⚠️ **Consider conditional navigation** |

---

## 2. Extracted Patterns for BuzzIt

### Pattern 1: Explicit Resource Cleanup

**From Demo:**
```kotlin
fun stopPublishing() {
    _selfStreams.clear()
    _selfAudioStream?.setStatsCallback(null)  // Explicit cleanup
    _selfAudioStream?.setListener(null)
    _selfAudioStream = null
    _selfVideoStream?.setListener(null)
    _selfVideoStream = null
    refreshVideoStreams()
}
```

**Adaptation for BuzzIt:**
```typescript
// In BuzzLivePublisher.tsx
const handleStop = useCallback(async () => {
  try {
    setBusy(true);
    updateStatus('idle');
    
    if (cameraRef.current) {
      try {
        // Stop the stream
        cameraRef.current.stop();
        
        // Explicit cleanup (if NodePublisher supports it)
        // cameraRef.current?.removeAllListeners?.();
        // cameraRef.current = null;
        
        console.log('Camera stopped successfully');
      } catch (stopError) {
        console.error('Error stopping camera:', stopError);
      }
    }
  } catch (error: any) {
    console.error('Error in handleStop:', error);
    updateStatus('error');
  } finally {
    setBusy(false);
    updateStatus('idle');
  }
}, [updateStatus]);
```

### Pattern 2: Loading State During Backend Operations

**From Demo:**
```kotlin
NavigationHandler.setLoading(true)
NetworkHandler.deleteStage().handle(
    onSuccess = {
        NavigationHandler.setLoading(false)
        // ... success handling
    },
    onFailure = { error ->
        NavigationHandler.setLoading(false)
        // ... error handling
    }
)
```

**Adaptation for BuzzIt:**
```typescript
// In GoBuzzLiveScreen.tsx
const [isEndingStream, setIsEndingStream] = useState(false);

const handleEndStream = async () => {
  Alert.alert(
    'End Stream',
    'Are you sure you want to end this live stream?',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'End Stream',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsEndingStream(true); // Show loading
            
            // Stop publishing first
            if (publisherRef.current) {
              await publisherRef.current.stop();
            }

            // End stream on backend
            if (currentStream) {
              await ApiService.endLiveStream(currentStream.id);
            }

            // Clear state
            setPublishUrl('');
            setPublisherTrigger(0);
            setStreamStatus('idle');
            setIsStreaming(false);
            setCurrentStream(null);
            // ... other state clears
            
            navigation.goBack();
          } catch (error: any) {
            console.error('Error ending stream:', error);
            Alert.alert('Error', 'Failed to end stream. Please try again.');
          } finally {
            setIsEndingStream(false);
          }
        },
      },
    ]
  );
};
```

### Pattern 3: State Update After Backend Success

**From Demo:**
```kotlin
NetworkHandler.deleteStage().handle(
    onSuccess = {
        // Update state ONLY after backend confirms
        val stages = _stages.value.map { it.copy() }.toMutableList()
        stages.removeAt(currentStageIndex)
        _stages.update { stages }
    }
)
```

**Adaptation for BuzzIt:**
```typescript
// Consider updating state after backend success
const handleEndStream = async () => {
  // ... confirmation dialog
  onPress: async () => {
    try {
      // 1. Stop publishing (local)
      if (publisherRef.current) {
        await publisherRef.current.stop();
      }

      // 2. Clear local publishing state immediately
      setPublishUrl('');
      setPublisherTrigger(0);
      setStreamStatus('idle');
      setIsStreaming(false);

      // 3. End on backend
      if (currentStream) {
        await ApiService.endLiveStream(currentStream.id);
        
        // 4. Clear stream state AFTER backend success
        setCurrentStream(null);
        setShowSetup(true);
        setTitle('');
        setDescription('');
        setComments([]);
        setViewers(0);
        setActiveServerStream(null);
        setHasIncrementedViewerCount(false);
      }
      
      navigation.goBack();
    } catch (error) {
      // Handle error, but keep some state for retry
      console.error('Error ending stream:', error);
    }
  }
};
```

### Pattern 4: Separation of Concerns (Handler Pattern)

**From Demo:**
- `StageHandler`: Orchestrates stage operations
- `StageManager`: Manages SDK interactions
- `NetworkHandler`: Handles API calls

**BuzzIt Current Structure:**
- `GoBuzzLiveScreen`: UI + Logic (could be split)
- `BuzzLivePublisher`: SDK wrapper (good separation)
- `ApiService`: API calls (good separation)

**Recommendation:** Consider creating a `StreamManager` or `StreamHandler` to centralize stream lifecycle logic.

### Pattern 5: Error Handling with Result Types

**From Demo:**
```kotlin
sealed class Response<T> {
    data class Success<T>(val data: T) : Response<T>()
    data class Failure<T>(val error: Error) : Response<T>()
}

suspend fun deleteStage() = try {
    api.deleteStage(...)
    Success()
} catch (e: Exception) {
    Failure(Error.DeleteStageError)
}
```

**Adaptation for BuzzIt:**
```typescript
// Create a Result type
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// In ApiService
async endLiveStream(streamId: string): Promise<Result<void>> {
  try {
    await api.delete(`/live-streams/${streamId}`);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Usage
const result = await ApiService.endLiveStream(streamId);
if (result.success) {
  // Handle success
} else {
  // Handle error
  Alert.alert('Error', result.error.message);
}
```

---

## 3. Additional Code Review Findings

### 3.1 Lifecycle Management

**Demo Pattern:**
- Uses `LaunchedEffect` for side effects
- Proper cleanup in `dispose()` methods
- Cancels coroutines on unmount

**BuzzIt:**
- Uses `useEffect` with cleanup functions
- ✅ Good: Has cleanup in `useFocusEffect`
- ⚠️ Consider: Add cleanup for polling intervals

### 3.2 Permission Handling

**Demo Pattern:**
```kotlin
const permitted = await ensurePermissions();
if (!permitted) {
    Alert.alert('Permissions required', '...');
    return;
}
```

**BuzzIt:**
- ✅ Already has permission checks
- ✅ Good implementation

### 3.3 State Management

**Demo:**
- Uses Kotlin Flow (reactive)
- Centralized state in handlers
- Immutable state updates

**BuzzIt:**
- Uses React hooks (reactive)
- State in components (could be centralized)
- ✅ Good: Uses functional updates

### 3.4 UI Patterns

**Demo:**
- Jetpack Compose
- Declarative UI
- Animated transitions

**BuzzIt:**
- React Native
- Declarative UI
- ✅ Good: Uses animations

---

## 4. Actionable Recommendations

### Priority 1: High Impact, Low Effort

1. **Add Loading State During Stream End**
   - Show ActivityIndicator/loading overlay
   - Prevents double-taps
   - Better UX

2. **Improve Error Handling**
   - Show user-friendly error messages
   - Allow retry on failure
   - Log errors for debugging

3. **Add Explicit Cleanup**
   - Clear callbacks/listeners if SDK supports it
   - Nullify refs after cleanup
   - Clear intervals/timeouts

### Priority 2: Medium Impact, Medium Effort

4. **Centralize Stream Lifecycle Logic**
   - Create `StreamManager` or `useStreamManager` hook
   - Separate concerns (UI vs Logic)
   - Easier to test and maintain

5. **Update State After Backend Success**
   - More reliable state management
   - Better error recovery
   - Consistent with demo pattern

6. **Add Result Type Pattern**
   - Type-safe error handling
   - Better error messages
   - Easier to test

### Priority 3: Low Priority, High Effort

7. **Refactor to Use Context/Reducer**
   - Centralized state management
   - Better for complex state
   - More scalable

8. **Add Stream Health Monitoring**
   - Track connection quality
   - Show warnings to user
   - Auto-reconnect on failure

---

## 5. Code Examples for Implementation

### Example 1: Enhanced handleEndStream with Loading State

```typescript
const [isEndingStream, setIsEndingStream] = useState(false);

const handleEndStream = async () => {
  Alert.alert(
    'End Stream',
    'Are you sure you want to end this live stream?',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'End Stream',
        style: 'destructive',
        onPress: async () => {
          setIsEndingStream(true);
          
          try {
            // 1. Stop publishing (local cleanup)
            if (publisherRef.current) {
              await publisherRef.current.stop();
            }

            // 2. Clear publishing state
            setPublishUrl('');
            setPublisherTrigger(0);
            setStreamStatus('idle');
            setIsStreaming(false);

            // 3. End on backend
            if (currentStream) {
              await ApiService.endLiveStream(currentStream.id);
            }

            // 4. Clear all state (after backend success)
            setCurrentStream(null);
            setShowSetup(true);
            setTitle('');
            setDescription('');
            setComments([]);
            setViewers(0);
            setActiveServerStream(null);
            setHasIncrementedViewerCount(false);
            
            // 5. Navigate
            navigation.goBack();
          } catch (error: any) {
            console.error('Error ending stream:', error);
            Alert.alert(
              'Error',
              'Failed to end stream. Please try again.',
              [
                {text: 'OK'},
                {
                  text: 'Retry',
                  onPress: handleEndStream,
                },
              ]
            );
          } finally {
            setIsEndingStream(false);
          }
        },
      },
    ]
  );
};

// In render:
{isEndingStream && (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="#FF0069" />
    <Text style={styles.loadingText}>Ending stream...</Text>
  </View>
)}
```

### Example 2: StreamManager Hook

```typescript
// hooks/useStreamManager.ts
import { useState, useCallback, useRef } from 'react';
import ApiService from '../services/APIService';

export const useStreamManager = () => {
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const endStream = useCallback(async (
    streamId: string,
    publisherRef: React.RefObject<any>,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    setIsEnding(true);
    setError(null);

    try {
      // 1. Stop publishing
      if (publisherRef.current) {
        await publisherRef.current.stop();
      }

      // 2. End on backend
      await ApiService.endLiveStream(streamId);

      // 3. Success
      onSuccess?.();
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsEnding(false);
    }
  }, []);

  return {
    endStream,
    isEnding,
    error,
  };
};

// Usage in GoBuzzLiveScreen:
const { endStream, isEnding } = useStreamManager();

const handleEndStream = async () => {
  Alert.alert(/* ... */, {
    onPress: async () => {
      try {
        await endStream(
          currentStream.id,
          publisherRef,
          () => {
            // Success callback
            setCurrentStream(null);
            // ... clear state
            navigation.goBack();
          },
          (error) => {
            // Error callback
            Alert.alert('Error', error.message);
          }
        );
      } catch (error) {
        // Already handled in callback
      }
    },
  });
};
```

---

## 6. Summary

### Strengths of BuzzIt Implementation
- ✅ Good error handling with try-catch
- ✅ Proper cleanup in finally blocks
- ✅ Hardware back button handling
- ✅ Multiple ways to close stream
- ✅ State management with React hooks

### Areas for Improvement
- ⚠️ Add loading state during stream end
- ⚠️ Consider updating state after backend success
- ⚠️ Add explicit listener cleanup (if SDK supports)
- ⚠️ Centralize stream lifecycle logic
- ⚠️ Improve error messages for users

### Key Takeaways
1. **Order matters**: Stop publishing → Backend → State → Navigation
2. **Loading states**: Show feedback during async operations
3. **Error recovery**: Allow retry, show helpful messages
4. **Cleanup**: Explicit is better than implicit
5. **Separation**: Keep UI, logic, and API calls separate

---

## References

- [Amazon IVS Demo Repository](https://github.com/aws-samples/amazon-ivs-real-time-for-android-demo)
- [Amazon IVS Broadcast SDK Docs](https://docs.aws.amazon.com/ivs/latest/userguide/broadcast-android.html)
- [React Native Best Practices](https://reactnative.dev/docs/performance)

