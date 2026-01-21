# Scroll Lock Fix - Calendar Modal

## Issue
After opening and closing the calendar modal, page scrolling was not working properly. This was caused by a scroll lock reference counting mismatch.

## Root Cause
The modal's `open()` method didn't check if the modal was already open before calling `lockScroll()`. This meant:

1. User clicks calendar button → `lockScroll()` called (count: 1)
2. If `open()` was called again (e.g., rapid clicking or programmatic re-opening) → `lockScroll()` called again (count: 2)
3. User closes modal → `unlockScroll()` called once (count: 1)
4. Scroll remains locked because count > 0

## Fixes Applied

### 1. Modal Open/Close Guard
**File**: `src/scripts/utils/modalManager.ts`

Added checks to prevent multiple open/close calls:
```typescript
open(): void {
  if (!this.modal || this.isDestroyed) return;
  if (this.isOpen()) return; // NEW: Prevent re-opening

  // ... rest of open logic
}

close(): void {
  if (!this.modal || this.isDestroyed) return;
  if (!this.isOpen()) return; // NEW: Prevent re-closing

  // ... rest of close logic
}
```

### 2. Force Unlock on Navigation
**File**: `src/scripts/widgets/googleCalendar.ts`

Added cleanup on Astro page navigation:
```typescript
document.addEventListener('astro:before-preparation', () => {
  closeCalendarModal();
});
```

### 3. Safety Handlers
**File**: `src/scripts/core/scrollLock.ts`

Added automatic cleanup on page unload and navigation:
```typescript
window.addEventListener('beforeunload', () => {
  scrollLock.forceUnlockAll();
});

document.addEventListener('astro:before-preparation', () => {
  scrollLock.forceUnlockAll();
});
```

### 4. Debug Helpers
**File**: `src/scripts/core/scrollLock.ts`

Added console debugging functions:
```javascript
// Check scroll lock state
window.__debugScrollLock()

// Force unlock (emergency fix)
window.__forceUnlockScroll()

// Enable detailed logging
window.__DEBUG_SCROLL_LOCK = true
```

## How Scroll Lock Works

### Reference Counting System
The scroll lock uses a reference counting system to handle multiple components:

```typescript
lock('modal')    // count: 1, scroll locked
lock('dropdown') // count: 2, scroll stays locked
unlock('modal')  // count: 1, scroll stays locked
unlock('dropdown') // count: 0, scroll UNLOCKED
```

### Lock Lifecycle
1. **Lock**: `lockScroll()` increments counter, applies CSS if first lock
2. **Unlock**: `unlockScroll()` decrements counter, removes CSS if count reaches 0
3. **Force Unlock**: `forceUnlockScroll()` clears all locks immediately

## Testing

### Manual Test
1. Open contact page
2. Click calendar button to open modal
3. Click close button or press Escape
4. Try scrolling the page
5. ✅ Scroll should work normally

### Debug Test
Open browser console and run:
```javascript
// Check current state
window.__debugScrollLock()

// Expected output when scroll working:
// { isLocked: false, activeLocks: [] }

// If scroll stuck, force unlock:
window.__forceUnlockScroll()
```

### Enable Debug Logging
```javascript
// In browser console
window.__DEBUG_SCROLL_LOCK = true

// Now all lock/unlock operations will be logged
```

## Prevention Checklist

When creating new modals:
- [ ] Always check `isOpen()` before calling `open()`
- [ ] Always check `!isOpen()` before calling `close()`
- [ ] Set `scrollLock: true` in modal config
- [ ] Add cleanup on page navigation if modal can persist
- [ ] Test rapid open/close scenarios
- [ ] Test with keyboard shortcuts (Escape)
- [ ] Test with multiple modals open simultaneously

## Related Files
- `src/scripts/core/scrollLock.ts` - Scroll lock service
- `src/scripts/utils/modalManager.ts` - Modal management
- `src/scripts/widgets/googleCalendar.ts` - Calendar modal
- `src/scripts/navigation/utils.ts` - Navigation scroll lock
- `src/scripts/core/init.ts` - Cleanup on navigation

## Emergency Fix

If scroll becomes stuck in production:

**Browser Console**:
```javascript
window.__forceUnlockScroll()
```

**Or manually**:
```javascript
document.body.style.overflow = ''
document.documentElement.style.overflow = ''
document.body.classList.remove('scroll-locked')
document.documentElement.classList.remove('scroll-locked')
```
