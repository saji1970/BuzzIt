# UI/UX Issues Summary & Fix Plan

## Issues Found:

### 1. ✅ Logged-in Username Display (Top Right Corner)
**Location**: `src/screens/HomeScreen.tsx` - HeroCard component
**Issue**: Username is not displayed in the top right corner
**Fix**: Add username display to the HeroCard header
**File to modify**: `src/components/HeroCard.tsx` or `HomeScreen.tsx` line 731-748

---

### 2. ✅ Real-Time Buzz Feed Updates
**Location**: `src/screens/HomeScreen.tsx` - lines 181-194
**Issue**: Need to close and open app to see new buzzes
**Current**: Already has 30-second refresh (line 191)
**Fix**: May need to force re-render or check feed loading logic
**Analysis**: The refresh is working, but might not be triggering UI update

---

### 3. ✅ Profile Photo Mandatory Requirement
**Location**: `src/screens/CreateProfileScreen.tsx` - line 276-279
**Issue**: Cannot create user without adding a photo
**Code**:
```typescript
if (!avatarUri) {
  Alert.alert('Add Profile Photo', 'Please add a profile photo or avatar before continuing.');
  return;
}
```
**Fix**: Make this check optional or remove it entirely

---

### 4. ✅ Poll Buzz - No Voting Options
**Location**: `src/components/BuzzCard.tsx`
**Issue**: Poll buzzes don't show Yes/No voting buttons
**Current**: Poll options are defined in CreateBuzzScreen.tsx (lines 67-71)
**Fix**: Add poll voting UI to BuzzCard component
**Need**:
- Check if buzz is a poll type
- Render poll options as clickable buttons
- Submit vote to backend
- Show vote count/percentage

---

### 5. ✅ Poll Buzz Interest Display Inconsistency
**Location**: `src/components/BuzzCard.tsx` - lines 581-600
**Issue**: Poll buzzes show interests, other types don't (or vice versa)
**Current Code**: Shows interests for ALL buzz types if they exist
**Analysis**: Need to verify if this is a data issue or UI issue
- Are interests being saved only for poll buzzes?
- Or should poll buzzes NOT show interests?

---

### 6. ✅ Separate User's Own Buzz
**Location**: `src/screens/HomeScreen.tsx` - loadBuzzes() function
**Issue**: Own buzzes take up screen space in main feed
**Current**: All buzzes including own are shown (line 252)
**Solution**: Add "My Buzz" tab/screen
**Files**:
- YourBuzzScreen already exists (line 34, 924-926)
- Need to filter out own buzzes from main feed
- Add navigation to "My Buzz" screen

---

## Quick Fix Order (Easiest to Hardest):

1. **Profile Photo Optional** - 1 line change
2. **Username Display** - Add text component to header
3. **Filter Own Buzz** - Modify feed loading logic
4. **Interest Display Fix** - Conditional rendering
5. **Poll Voting UI** - New component + backend integration
6. **Real-Time Updates** - Debug refresh logic

---

## Estimated Time:
- Quick fixes (1-3): ~15 minutes
- Medium fixes (4-5): ~30 minutes
- Complex fix (6): ~20 minutes
- **Total**: ~1 hour

---

## Priority Recommendation:

### HIGH PRIORITY (User Experience Blockers):
1. Profile photo optional (users can't sign up!)
2. Poll voting options (feature is broken)

### MEDIUM PRIORITY (UX Improvements):
3. Username display
4. Separate own buzz

### LOW PRIORITY (Nice to have):
5. Interest display consistency
6. Real-time feed debugging

---

## Which should I fix first?

Type the number (1-6) or say "fix all" to do them in recommended order!
