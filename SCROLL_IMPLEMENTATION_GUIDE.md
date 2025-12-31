# Mobile & Desktop Scroll Implementation Guide

## Overview
This document provides comprehensive details about all scroll-related functionality in the project, covering both mobile and desktop implementations. The project uses **Lenis** for smooth scrolling with specialized handling for mobile devices, scroll locking, and gesture-based interactions.

## Core Scroll Engine

### 1. Lenis Smooth Scrolling Implementation
**File:** `src/scripts/smoothScroll.ts`

#### Initialization (Lines 6-20)
```typescript
lenis = new Lenis(); // Basic configuration for compatibility

function raf(time: number) {
  lenis?.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Expose lenis globally for scroll lock integration
if (typeof window !== 'undefined') {
  (window as any).__lenis = lenis;
}
```

#### Anchor Link Handling (Lines 22-27)
```typescript
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href) as HTMLElement;
    if (target) {
      e.preventDefault();
      scrollToElement(target);
    }
  });
});
```

#### Hash Navigation (Lines 28-42)
```typescript
document.addEventListener('astro:page-load', () => {
  const hash = window.location.hash;
  if (hash && hash !== '#') {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const target = document.querySelector(hash) as HTMLElement;
        if (target) {
          scrollToElement(target);
        }
      }, 100);
    });
  }
});
```

#### Scroll Control Methods (Lines 51-94)
```typescript
export function stopSmoothScroll() {
  if (lenis) {
    lenis.stop();
  }
}

export function startSmoothScroll() {
  if (lenis) {
    lenis.start();
  }
}

export function scrollToElement(target: string | HTMLElement, options?: { offset?: number; immediate?: boolean }) {
  if (!lenis) return;

  const element = typeof target === 'string' ? document.querySelector(target) as HTMLElement : target;
  if (!element) return;

  const offset = options?.offset || 0;

  if (options?.immediate) {
    lenis.scrollTo(element, { offset, immediate: true });
  } else {
    lenis.scrollTo(element, { offset });
  }
}
```

## Scroll Progress Tracking

### 2. Scroll Progress Bar with Lenis Integration
**File:** `src/scripts/core/scrollProgress.ts`

#### Lenis Scroll Event Handler (Lines 16-18)
```typescript
function handleLenisScroll(data: { scroll: number }): void {
  updateProgress(data.scroll);
}
```

#### Progress Update Logic (Lines 6-13)
```typescript
function updateProgress(scroll: number = 0): void {
  const progressBar = document.getElementById('scroll-progress-bar');
  const progressFill = progressBar?.querySelector('.scroll-progress-bar-fill') as HTMLElement;

  if (!progressBar || !progressFill) return;

  const progress = Math.min(100, Math.max(0, scroll * 100));
  progressFill.style.setProperty('--scroll-progress-width', `${progress}%`);
}
```

#### Initialization with Lenis (Lines 39-46)
```typescript
lenisInstance = getLenisInstance();

if (lenisInstance) {
  lenisInstance.on('scroll', handleLenisScroll);
  updateProgress(lenisInstance.scroll);
} else {
  console.warn('Lenis not initialized, scroll progress may not work correctly');
}
```

## Scroll Lock System

### 3. Scroll Lock with Lenis Integration
**File:** `src/scripts/navigation/utils.ts`

#### Lock Scroll Implementation (Lines 53-78)
```typescript
export function lockScroll(): void {
  scrollLockCount++;

  if (scrollLockCount === 1) {
    const scrollY = window.scrollY;
    savedScrollY = scrollY;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    document.body.setAttribute('data-scroll-y', scrollY.toString());
    document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Stop Lenis smooth scrolling when menu is open
    if (typeof window !== 'undefined' && (window as any).__lenis) {
      (window as any).__lenis.stop();
    }
  }
}
```

#### Unlock Scroll with Lenis Restart (Lines 82-110)
```typescript
export function unlockScroll(): void {
  if (scrollLockCount > 0) {
    scrollLockCount--;
  }

  if (scrollLockCount === 0 && savedScrollY !== null) {
    // ... scroll restoration logic ...

    // Restart Lenis smooth scrolling when menu is closed
    if (typeof window !== 'undefined' && (window as any).__lenis) {
      (window as any).__lenis.start();
    }

    savedScrollY = null;
  }
}
```

#### Scroll Prevention (Lines 115-117)
```typescript
function preventScroll(e: Event): void {
  e.preventDefault();
}
```

## Mobile Menu Scrolling

### 4. Mobile Menu with Independent Scrolling
**File:** `src/scripts/navigation/mobile-menu.ts`

#### Dropdown Auto-Scroll Logic (Lines 70-88)
```typescript
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouch && wrapperRect.top < menuRect.top + padding) {
  // Only auto-scroll on desktop/mouse where momentum isn't an issue
  const scrollAmount = menuContent.scrollTop + (wrapperRect.top - menuRect.top) - padding;
  menuContent.scrollTo({
    top: Math.max(0, scrollAmount),
    behavior: 'smooth'
  });
} else if (!isTouch && wrapperRect.bottom > menuRect.bottom - padding) {
  // Only auto-scroll on desktop/mouse where momentum isn't an issue
  const scrollAmount = menuContent.scrollTop + (wrapperRect.bottom - menuRect.bottom) + padding;
  menuContent.scrollTo({
    top: Math.min(menuContent.scrollHeight - menuContent.clientHeight, scrollAmount),
    behavior: 'smooth'
  });
}
// On mobile, let the user scroll manually or use scrollIntoView for gentle nudges
```

#### Scroll Indicators Update (Lines 217-228)
```typescript
function updateScrollIndicators(): void {
  const menuContent = document.querySelector('.mobile-menu-content') as HTMLElement;
  if (!menuContent) return;

  const scrollTop = menuContent.scrollTop;
  const scrollHeight = menuContent.scrollHeight;
  const clientHeight = menuContent.clientHeight;
  const threshold = 10;

  menuContent.classList.toggle('scrollable-top', scrollTop > threshold);
  menuContent.classList.toggle('scrollable-bottom', scrollTop + clientHeight < scrollHeight - threshold);
}
```

#### Lenis Prevention Setup (Lines 269-273)
```typescript
const menuContent = document.querySelector('.mobile-menu-content') as HTMLElement;
if (menuContent) {
  menuContent.addEventListener('scroll', updateScrollIndicators, { passive: true });
  menuContent.setAttribute('data-lenis-prevent', 'true');
  updateScrollIndicators();
}
```

#### Lenis Prevention Cleanup (Lines 186-190)
```typescript
const menuContent = document.querySelector('.mobile-menu-content') as HTMLElement;
if (menuContent) {
  menuContent.removeEventListener('scroll', updateScrollIndicators);
  menuContent.classList.remove('scrollable-top', 'scrollable-bottom');
  menuContent.removeAttribute('data-lenis-prevent');
}
```

### 5. Swipe-to-Close Gesture
**File:** `src/scripts/navigation/mobile-menu.ts`

#### Swipe Gesture Setup (Lines 322-335)
```typescript
swipeGesture = new DragGesture(
  mobileMenu,
  ({ active, movement: [mx, my], direction: [dx, dy], velocity: [vx, vy] }) => {
    if (Math.abs(dx) < Math.abs(dy)) return;

    if (!active && dx > 0) {
      const swipeDistance = Math.abs(mx);
      const swipeVelocity = Math.abs(vx);

      if (swipeDistance > SWIPE_DISTANCE_THRESHOLD || swipeVelocity > SWIPE_VELOCITY_THRESHOLD) {
        closeMobileMenu();
      }
    }
  },
  {
    axis: 'x',
    threshold: 10,
    filterTaps: true,
    pointer: { touch: true },
  }
);
```

## Navigation Scroll Effects

### 6. Navigation State Management
**File:** `src/scripts/navigation/scroll-effects.ts`

#### Lenis Scroll Handler (Lines 11-27)
```typescript
function handleLenisScroll(data: { scroll: number }): void {
  const { nav } = getNavElements();
  if (!nav) return;

  if (state.isScrolling) return;
  state.isScrolling = true;

  const scrollTop = data.scroll * window.innerHeight;
  state.lastScrollTop = scrollTop;

  requestAnimationFrame(() => {
    if (nav) {
      updateNavState(nav, scrollTop);
    }
    state.isScrolling = false;
  });
}
```

#### Fallback Native Scroll Handler (Lines 44-59)
```typescript
function handleScroll(): void {
  if (state.isScrolling || !nav) return;
  state.isScrolling = true;

  const scrollTop = getScrollTop();
  state.lastScrollTop = scrollTop;

  requestAnimationFrame(() => {
    if (nav) {
      updateNavState(nav, scrollTop);
    }
    state.isScrolling = false;
  });
}

window.addEventListener('scroll', handleScroll, { passive: true });
```

## Parallax Effects

### 7. Lenis-Based Parallax Scrolling
**File:** `src/scripts/sections/services/parallax.ts`

#### Parallax Update Function (Lines 3-11)
```typescript
function handleParallax(data: { scroll: number }): void {
  const parallaxElements = document.querySelectorAll('.service-hero-section .blur-xl, .service-hero-section .blur-2xl');
  const scrollY = data.scroll * window.innerHeight;

  parallaxElements.forEach((element, index) => {
    const parallaxY = -(scrollY * (0.5 + index * 0.1));
    (element as HTMLElement).style.setProperty('--parallax-y', `${parallaxY}px`);
  });
}
```

#### Lenis Integration (Lines 21-28)
```typescript
const lenisInstance = (window as any).__lenis;
if (lenisInstance) {
  lenisInstance.on('scroll', handleParallax);
  parallaxCleanup = () => lenisInstance.off('scroll', handleParallax);
} else {
  console.warn('Lenis not available for parallax effects');
}
```

## Floating Action Button

### 8. Scroll-Based FAB Visibility
**File:** `src/scripts/core/floatingButton.ts`

#### Scroll Position Tracking (Lines 20-52)
```typescript
function updateFabVisibility(scrollTop: number): void {
  const fab = getFabElement();
  if (!fab) return;

  const scrollDelta = scrollTop - lastScrollTop;
  const scrollingDown = scrollDelta > 0 && Math.abs(scrollDelta) > FAB_SCROLL_HIDE_THRESHOLD;
  const scrollingUp = scrollDelta < 0 && Math.abs(scrollDelta) > FAB_SCROLL_HIDE_THRESHOLD;
  const scrolledPastThreshold = scrollTop > FAB_SCROLL_THRESHOLD;

  if (scrollingDown && scrolledPastThreshold && !isFabHidden) {
    fab.classList.add('fab-hidden');
    isFabHidden = true;
  } else if (scrollingUp || scrollTop <= FAB_SCROLL_THRESHOLD) {
    fab.classList.remove('fab-hidden');
    isFabHidden = false;
  }

  lastScrollTop = scrollTop;
}
```

## Scroll Utilities

### 9. Enhanced Scrolling Setup
**File:** `src/scripts/utils/scrollUtils.ts`

#### Enhanced Scrolling Configuration (Lines 7-22)
```typescript
export function setupEnhancedScrolling(element: HTMLElement, config: ScrollConfig = {}): () => void {
  const { touchAction = 'pan-y', overscrollBehavior = 'contain', momentumScrolling = true } = config;

  element.style.touchAction = touchAction;
  element.style.overscrollBehavior = overscrollBehavior;

  if (momentumScrolling) {
    (element.style as any).webkitOverflowScrolling = 'touch';
  }

  return () => {
    element.style.touchAction = '';
    element.style.overscrollBehavior = '';
    (element.style as any).webkitOverflowScrolling = '';
  };
}
```

#### Mobile Touch Scrolling Initialization (Lines 53-71)
```typescript
export function initTouchScrolling(): void {
  if (typeof document === 'undefined') return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return;

  document.querySelectorAll('[data-modal-content], [data-scrollable-iframe]').forEach((element) => {
    const el = element as HTMLElement;
    setupScrollIndicators(el);
  });
}
```

## CSS Styling

### 10. Scroll Lock Styling
**File:** `src/styles/features/scroll-lock.css`

#### Body Scroll Lock (Lines 1-4)
```css
body.scroll-locked {
  overscroll-behavior: none;
  touch-action: none !important;
}
```

#### Modal Content Scrolling (Lines 6-12)
```css
body.scroll-locked .mobile-menu-content,
body.scroll-locked [data-modal-content] {
  touch-action: pan-y !important;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scroll-behavior: auto;
}
```

#### Fixed Element Protection (Lines 15-34)
```css
#scroll-progress-bar,
#main-navigation,
.fab-button {
  position: fixed !important;
  transform: translateZ(0) !important;
  backface-visibility: hidden !important;
  will-change: auto !important;
}

[data-lenis-root] #scroll-progress-bar,
[data-lenis-root] #main-navigation,
[data-lenis-root] .fab-button {
  position: fixed !important;
  inset: auto !important;
  transform: translateZ(0) !important;
}
```

### 11. Mobile Menu Scrolling
**File:** `src/styles/navigation/mobile-menu.css`

#### Menu Container (Lines 257-260)
```css
.mobile-menu {
  touch-action: pan-y !important;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

#### Content Scrolling (Lines 334-341)
```css
.mobile-menu-content {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  scroll-behavior: auto;
  transform: translateZ(0);
}
```

#### Dropdown Scrolling (Lines 471-474)
```css
.mobile-dropdown-content.dropdown-opening {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y !important;
}
```

### 12. Global Scroll Behavior
**File:** `src/styles/base.css`

#### Base Body Styling (Lines 41-57)
```css
body {
  overflow: auto !important;
  overflow-x: hidden !important;
  max-width: 100vw !important;
  transform: translateZ(0) !important;
  backface-visibility: hidden !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
  -webkit-overflow-scrolling: touch !important;
}
```

#### Mobile Optimizations (Lines 142-152)
```css
@media (width <= 767px) {
  html {
    touch-action: pan-y !important;
  }
}
```

### 13. Scroll Progress Styling
**File:** `src/styles/components/scroll-progress.css`

#### Progress Bar (Lines 1-12)
```css
#scroll-progress-bar {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 100vw;
  z-index: var(--z-scroll-progress);
  pointer-events: none;
  touch-action: none;
  will-change: auto;
}
```

## Initialization & Cleanup

### 14. Core Initialization
**File:** `src/scripts/core/init.ts`

#### Scroll System Initialization (Lines 47-56)
```typescript
const runInit = () => {
  initSmoothScroll();
  initScrollAnimations();
  initScrollProgress();
  initNavigation();
  initFloatingButton();
  initAccordions();
  initLazyLoading();
  setTimeout(() => refreshScrollAnimations(), 100);
};
```

### 15. Page Transition Handling
**File:** `src/scripts/sections/utils/initUtils.ts`

#### Section Initialization (Lines 3-27)
```typescript
export function setupSectionInit(initFn: () => void, cleanupFn?: () => void): void {
  const runInit = () => {
    setTimeout(initFn, 50);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit, { once: true });
  } else {
    runInit();
  }

  document.addEventListener('astro:page-load', () => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPagePath) {
      requestAnimationFrame(() => requestAnimationFrame(runInit));
      lastPagePath = currentPath;
    }
  });

  if (cleanupFn) {
    document.addEventListener('astro:before-swap', cleanupFn);
  }
}
```

## Modal & Calendar Scrolling

### 16. Modal Scroll Management
**File:** `src/scripts/utils/modalManager.ts`

#### Modal Scroll Lock (Lines 239-241)
```typescript
if (this.config.scrollLock !== false) {
  lockScroll();
}
```

#### Modal Scroll Unlock (Lines 259-261)
```typescript
if (this.config.scrollLock !== false) {
  unlockScroll();
}
```

### 17. Google Calendar Scrolling
**File:** `src/scripts/widgets/googleCalendar.ts`

#### Calendar Scroll Indicators (Lines 83-99)
```typescript
const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;
const scrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
const clientHeight = iframeDoc.documentElement.clientHeight || iframeDoc.body.clientHeight;

if (topIndicator) {
  topIndicator.classList.toggle('visible', scrollTop > SCROLL_THRESHOLD);
}
if (bottomIndicator) {
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;
  bottomIndicator.classList.toggle('visible', !isAtBottom);
}
```

## Performance Optimizations

### 18. Scroll Performance Settings
**File:** `src/styles/base/utilities.css`

#### Touch Action Management (Lines 211-212)
```css
*::before,
*::after {
  touch-action: pan-y;
}
```

#### Scrollable Element Optimization (Lines 319-326)
```css
.overflow-scroll:not(.process-stepper-wrapper, [class*="horizontal-scroll"], [class*="scroll-x"], .overflow-x-auto),
.overflow-y-scroll {
  -webkit-overflow-scrolling: touch !important;
  overscroll-behavior: contain !important;
  touch-action: pan-y !important;
  scroll-behavior: smooth !important;
}
```

## Key Implementation Patterns

### Mobile vs Desktop Scroll Handling
1. **Lenis Smooth Scrolling**: Primary scroll engine for both platforms
2. **Touch Action Control**: `touch-action: pan-y` for vertical scrolling, `touch-action: pan-x` for horizontal
3. **Overscroll Behavior**: `contain` prevents parent scrolling, `none` for locked states
4. **Momentum Scrolling**: `-webkit-overflow-scrolling: touch` for iOS
5. **Scroll Lock Integration**: Stops/restarts Lenis during modal states

### Gesture & Touch Handling
1. **Swipe Gestures**: @use-gesture/vanilla for drag interactions
2. **Touch Event Listeners**: `passive: false` for scroll prevention
3. **Touch Action Specificity**: Overrides prevent accidental scrolling
4. **Momentum Prevention**: Touch devices skip programmatic scrolling

### Performance Considerations
1. **Hardware Acceleration**: `transform: translateZ(0)` for GPU compositing
2. **RAF Throttling**: RequestAnimationFrame for smooth animations
3. **Passive Listeners**: `{ passive: true }` for scroll events
4. **Lenis Integration**: Native scroll events replaced with Lenis events

This implementation provides comprehensive scroll handling across all devices with proper performance optimization and accessibility considerations.
