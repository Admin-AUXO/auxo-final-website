# Performance Optimization Guide

This document outlines all performance optimizations implemented in the AUXO Data Labs website.

## Overview

The website has been optimized for best-in-class performance with focus on:
- Core Web Vitals (LCP, FID, CLS, FCP, TTFB, INP)
- Bundle size optimization
- Network efficiency
- Runtime performance
- Perceived performance

## Key Performance Features

### 1. Resource Hints & Preloading

**Location:** `src/components/common/MetaTags.astro`

- **Preconnect:** Early connection to critical third-party origins
  - Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
  - Sanity CDN (cdn.sanity.io)
  - EmailJS API (api.emailjs.com)
  - Google Calendar (calendar.app.google)

- **DNS Prefetch:** Faster DNS resolution for external resources

- **Module Preload:** Critical JavaScript bundles preloaded for faster execution
  - `/_astro/hoisted.js`
  - `/_astro/page.js`

### 2. Font Loading Optimization

**Strategy:** Async font loading with print media trick

```html
<link href="fonts.css" rel="stylesheet" media="print" onload="this.media='all'" />
```

**Benefits:**
- Non-blocking font loading
- Faster First Contentful Paint (FCP)
- No flash of unstyled text (FOUT)

### 3. JavaScript Bundle Optimization

**Location:** `astro.config.mjs`

**Manual Chunk Splitting:**
- `icons` - @iconify and astro-icon (98KB)
- `ui-vendor` - Embla Carousel (19KB)
- `lenis` - Smooth scrolling library (16KB)
- `react-vendor` - React runtime (6KB)
- `emailjs` - Email service (3.4KB)
- `utils` - Zod validation (separate chunk)

**Benefits:**
- Better browser caching (vendor chunks change less frequently)
- Parallel downloads
- Smaller initial bundle
- Faster Time to Interactive (TTI)

**Experimental Min Chunk Size:** 1500 bytes (reduced unnecessary micro-chunks)

### 4. Lazy Loading System

**Location:** `src/scripts/core/init.ts`

**Features:**
- Immediate load of first 2 sections (above-the-fold content)
- Viewport-based lazy loading with Intersection Observer
- Responsive root margins:
  - Mobile: 100px (tighter for slower connections)
  - Desktop: 200px (preload earlier for smooth UX)
- `requestAnimationFrame` for smooth DOM updates

**Benefits:**
- Faster initial page load
- Reduced memory usage
- Smooth scroll experience
- Better mobile performance

### 5. Web Vitals Monitoring

**Location:** `src/scripts/utils/webVitals.ts`

**Tracked Metrics:**
- **LCP** (Largest Contentful Paint) - Good: <2.5s
- **FID** (First Input Delay) - Good: <100ms
- **CLS** (Cumulative Layout Shift) - Good: <0.1
- **FCP** (First Contentful Paint) - Good: <1.8s
- **TTFB** (Time to First Byte) - Good: <800ms
- **INP** (Interaction to Next Paint) - Good: <200ms

**Features:**
- Real-time performance monitoring (dev mode)
- Color-coded console output (✓ good, ⚠ needs-improvement, ✗ poor)
- Zero external dependencies
- Production-safe (no logging in prod)

### 6. Build Optimizations

**Compression:**
- Terser minification with aggressive settings
- Console statements dropped in production
- Dead code elimination
- Safari 10 compatibility

**CSS:**
- Code splitting enabled
- Auto-inlining of small stylesheets
- PostCSS optimization
- Tailwind CSS purging

**HTML:**
- Compression enabled
- View Transitions API support

### 7. Prefetching Strategy

**Location:** `astro.config.mjs`

**Configuration:**
```javascript
prefetch: {
  prefetchAll: true,
  defaultStrategy: 'viewport'
}
```

**Benefits:**
- Automatic prefetch of internal links when they enter viewport
- Near-instant navigation
- Better perceived performance
- Smart throttling to avoid wasting bandwidth

### 8. Caching Strategy

**Location:** `public/_headers`

**Static Assets (Hashed):**
- JavaScript, CSS, fonts, images: `max-age=31536000, immutable`
- Never expires (safe due to content hashing)

**Dynamic Content:**
- HTML pages: `max-age=0, must-revalidate`
- Always fresh, validates with server

**Semi-Static:**
- Favicon, manifest: `max-age=86400` (24 hours)
- Sitemap: `max-age=3600` (1 hour)

### 9. Security Headers

**Location:** `public/_headers`

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Performance Initialization Flow

### Page Load Sequence

1. **Inline Critical Scripts** (BaseLayout.astro)
   - Theme detection and application
   - View Transitions setup
   - Scroll restoration
   - Error suppression

2. **Core Features** (`initCoreFeatures()`)
   - Web Vitals monitoring starts
   - Critical: Smooth scroll, scroll progress, navigation
   - Deferred (requestIdleCallback): Animations, floating button, accordions, lazy loading

3. **Page Features** (`initPageFeatures()`)
   - Particle background (if present)
   - Carousels initialization
   - Deferred: Google Calendar, theme toggle

### Cleanup on Navigation

- Astro View Transitions triggers cleanup
- All observers disconnected
- Event listeners removed
- Lenis instance destroyed
- Re-initialization after swap

## Performance Metrics

### Build Output
- Total build size: ~3.1MB
- JavaScript assets: ~932KB
- Largest chunks:
  - client.js: 187KB
  - icons.js: 98KB
  - server.js: 70KB
  - utils.js: 52KB

### Target Metrics
- **LCP:** <2.5s (Good)
- **FID:** <100ms (Good)
- **CLS:** <0.1 (Good)
- **FCP:** <1.8s (Good)
- **TTFB:** <800ms (Good)

## Testing Performance

### Development
```bash
npm run dev
# Check console for Web Vitals metrics
```

### Production Build
```bash
npm run build
npm run preview
# Use browser DevTools > Lighthouse
```

### CI/CD
```bash
npm run build:check  # Runs lint and build
```

## Best Practices

### When Adding New Features

1. **Third-party Scripts:**
   - Add to manual chunks in `astro.config.mjs`
   - Use `client:visible` or `client:idle` for loading strategy
   - Add preconnect hints in MetaTags.astro

2. **Images:**
   - Always use Astro's Image component
   - Add `loading="lazy"` for below-fold images
   - Add `fetchpriority="high"` for LCP image
   - Provide width/height to prevent CLS

3. **Fonts:**
   - Keep font subsets minimal
   - Use `font-display: swap`
   - Preload critical font files

4. **Animations:**
   - Use CSS transforms (GPU-accelerated)
   - Avoid layout-triggering properties
   - Use `will-change` sparingly
   - Clean up observers on unmount

5. **Data Fetching:**
   - Use server-side fetching when possible
   - Implement caching in `src/lib/sanity/cache.ts`
   - Avoid waterfall requests

## Monitoring

### Browser DevTools
- Performance tab for profiling
- Network tab for resource timing
- Lighthouse for audits
- Coverage tab for unused code

### Production Monitoring
- Web Vitals are logged to console in dev mode
- Extend `webVitals.ts` to send metrics to analytics service
- Monitor Core Web Vitals in Google Search Console

## Common Performance Pitfalls

### ❌ Avoid
- Large unoptimized images
- Synchronous third-party scripts
- Excessive `useEffect` in React components
- Deep component nesting
- Unthrottled scroll/resize listeners
- Multiple re-renders
- Blocking the main thread

### ✅ Do
- Lazy load off-screen content
- Code-split by route
- Use Web Workers for heavy computation
- Implement virtual scrolling for long lists
- Debounce/throttle event handlers
- Use CSS containment
- Optimize critical rendering path

## Future Optimizations

### Potential Improvements
1. **Service Worker** for offline support and advanced caching
2. **Critical CSS extraction** for above-the-fold content
3. **Image optimization** with WebP/AVIF formats
4. **Route-based code splitting** for dynamic imports
5. **Edge caching** with CDN (Cloudflare, Vercel Edge)
6. **Brotli compression** for text assets
7. **HTTP/3** support when widely available
8. **Resource hints prioritization** based on user journey

## Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Check bundle sizes are reasonable
- [ ] Test on slow 3G network
- [ ] Verify mobile performance
- [ ] Test View Transitions navigation
- [ ] Check Lighthouse scores (aim for 90+)
- [ ] Verify caching headers are applied
- [ ] Test with JavaScript disabled
- [ ] Check font loading behavior
- [ ] Verify all images lazy load correctly

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Astro Performance Guide](https://docs.astro.build/en/guides/performance/)
- [MDN Web Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Lighthouse Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
