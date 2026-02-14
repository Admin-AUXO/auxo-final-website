---
name: web-performance
description: Optimize website performance including Core Web Vitals, bundle size, image loading, and runtime performance. Use when addressing performance issues, slow load times, or optimizing the AUXO website.
---

# Web Performance Optimization

## Performance Stack

- **Build Tool**: Vite with Astro
- **Bundling**: Manual chunk splitting
- **Images**: Sharp for optimization
- **CSS**: PostCSS with cssnano
- **JS**: Terser minification
- **Analytics**: Web Vitals tracking

## Core Web Vitals

### Metrics to Monitor

```typescript
// Tracked in src/scripts/webVitals.ts
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- FCP (First Contentful Paint): < 1.8s
- TTFB (Time to First Byte): < 800ms
- INP (Interaction to Next Paint): < 200ms
```

### Measuring Performance

```bash
# Build and analyze
npm run build:analyze

# Web Vitals in browser console
localStorage.setItem('debug_vitals', 'true');
```

## Bundle Optimization

### Current Configuration

Located in `astro.config.mjs`:

```javascript
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('embla-carousel')) return 'ui-vendor';
    if (id.includes('astro-icon') || id.includes('@iconify')) return 'icons';
    if (id.includes('@sanity/') || id.includes('groq')) return 'sanity';
    if (id.includes('react')) return 'react-vendor';
    if (id.includes('@emailjs')) return 'emailjs';
    if (id.includes('lenis')) return 'lenis';
  }
}
```

### Chunk Size Targets

**Recommended limits:**
- Initial JS: < 200 KB gzipped
- Route chunks: < 100 KB gzipped
- Vendor chunks: < 150 KB gzipped each
- Total JS: < 500 KB gzipped

### Adding New Chunks

For large dependencies (> 50 KB):

```javascript
if (id.includes('your-library')) return 'library-chunk';
```

### Analyzing Bundle

```bash
npm run build:analyze
```

Opens interactive bundle analyzer showing:
- Chunk sizes
- Module dependencies
- Duplicate code
- Import relationships

## Image Optimization

### OptimizedImage Component

Use `src/components/ui/OptimizedImage.astro`:

```astro
<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  loading="lazy"
  format="webp"
  quality={80}
/>
```

**Benefits:**
- Automatic format conversion (webp)
- Responsive srcset generation
- Lazy loading
- Proper aspect ratio (no CLS)

### Image Best Practices

```astro
<!-- Above fold: eager loading -->
<OptimizedImage 
  src={heroImage} 
  loading="eager" 
  fetchpriority="high"
/>

<!-- Below fold: lazy loading -->
<OptimizedImage 
  src={image} 
  loading="lazy"
/>

<!-- Responsive sizes -->
<OptimizedImage
  src={image}
  widths={[400, 800, 1200]}
  sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px"
/>
```

### Image Formats

Preferred order:
1. **WebP** - Best compression, wide support
2. **AVIF** - Better compression, limited support
3. **JPEG** - Fallback for older browsers

```astro
<OptimizedImage 
  src={image}
  format="webp"
  formats={['webp', 'jpeg']}
/>
```

## JavaScript Optimization

### Code Splitting

**Dynamic imports for large modules:**

```typescript
// Lazy load heavy component
const HeavyComponent = await import('./HeavyComponent');

// Conditional loading
if (condition) {
  const module = await import('./rarely-used');
  module.init();
}
```

**Route-based splitting (automatic in Astro):**
Each page gets its own bundle.

### Tree Shaking

**Import only what you need:**

```typescript
// Good
import { specificFunction } from 'library';

// Bad - includes entire library
import * as library from 'library';
```

### Hydration Strategy

**Minimize client-side JavaScript:**

```astro
<!-- No hydration (static) -->
<Component />

<!-- Hydrate when visible -->
<Component client:visible />

<!-- Hydrate when idle -->
<Component client:idle />

<!-- Only when needed -->
<Component client:media="(max-width: 768px)" />

<!-- Avoid if possible -->
<Component client:load />
```

**Rule of thumb:** Only 10-20% of components should need hydration.

## CSS Optimization

### Tailwind Purging

Configured in `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  // Only classes in these files are included
}
```

**Ensure all templates are listed** to avoid missing classes.

### CSS Code Splitting

Already enabled in `astro.config.mjs`:

```javascript
build: {
  cssCodeSplit: true,
}
```

Each page gets only the CSS it needs.

### Custom CSS

**Minimize custom CSS:**
- Prefer Tailwind utilities
- Use scoped `<style>` tags in components
- Avoid global CSS when possible

```astro
<!-- Good: Tailwind utilities -->
<div class="flex items-center gap-4">

<!-- Avoid: Custom CSS for simple layouts -->
<style>
  .custom-flex { 
    display: flex; 
    align-items: center; 
    gap: 1rem; 
  }
</style>
```

## Runtime Performance

### Reducing Layout Shifts (CLS)

**Set dimensions on images:**

```astro
<img 
  src={image} 
  width="600" 
  height="400"
  alt="Description"
/>
```

**Reserve space for dynamic content:**

```astro
<div class="min-h-[200px]">
  <!-- Dynamic content loads here -->
</div>
```

**Use skeleton loaders:**

```astro
{loading ? (
  <SkeletonCard />
) : (
  <ContentCard data={data} />
)}
```

### Smooth Animations

**Use GPU-accelerated properties:**
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (blur, brightness)

**Avoid animating:**
- `width`, `height` (triggers layout)
- `margin`, `padding` (triggers layout)
- `top`, `left` (triggers layout)

```css
/* Good - GPU accelerated */
.element {
  transition: transform 300ms, opacity 300ms;
}
.element:hover {
  transform: translateY(-4px);
  opacity: 0.8;
}

/* Bad - triggers layout */
.element {
  transition: margin-top 300ms;
}
.element:hover {
  margin-top: -4px;
}
```

**Use will-change sparingly:**

```css
.animated-element {
  will-change: transform;
}
```

Remove after animation completes to free resources.

### Scroll Performance

**Use passive event listeners:**

```typescript
element.addEventListener('scroll', handler, { passive: true });
```

**Debounce/throttle scroll handlers:**

```typescript
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    // Handle scroll
  }, 100);
}, { passive: true });
```

## Font Optimization

### Font Loading Strategy

Current setup in `src/styles/base/fonts.css`:

```css
@font-face {
  font-family: 'Plus Jakarta Sans';
  src: url('/fonts/plus-jakarta-sans.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
}
```

**`font-display: swap`** shows fallback font immediately, swaps when custom font loads.

### Preload Critical Fonts

In `<head>`:

```astro
<link 
  rel="preload" 
  href="/fonts/plus-jakarta-sans.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin
/>
```

## Network Optimization

### Compression

Server should serve with:
- **Brotli** (preferred, ~20% better than gzip)
- **Gzip** (fallback)

Build output is pre-compressed.

### Caching Strategy

**Static assets:**
```
Cache-Control: public, max-age=31536000, immutable
```

**HTML:**
```
Cache-Control: public, max-age=0, must-revalidate
```

**API responses:**
```
Cache-Control: public, max-age=3600
```

### Preloading

**Preload critical resources:**

```astro
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/hero-image.webp" as="image">
```

**Prefetch next pages:**

```astro
<link rel="prefetch" href="/about">
```

Astro's `prefetch` integration handles this automatically.

## Icon Optimization

### Minimize Icon Set

Only include used icons in `astro.config.mjs`:

```javascript
icon({
  include: {
    'mdi': [
      'chart-line',
      'database',
      // ... only icons actually used
    ],
  },
})
```

### Finding Used Icons

```bash
# Search for icon usage
rg "Icon name=\"mdi:" src/ --type astro
rg "Icon name=\"simple-icons:" src/ --type astro
```

### Icon Loading

Icons are inlined as SVG (no HTTP requests), but larger icon sets increase bundle size.

## Build Configuration

### Production Build

```bash
npm run build
```

**Optimizations applied:**
- Minification (Terser)
- Code splitting
- Tree shaking
- CSS optimization (cssnano)
- Image optimization (Sharp)

### Build Options

```javascript
// astro.config.mjs
build: {
  inlineStylesheets: 'auto',  // Inline small CSS
}
```

### Terser Configuration

```javascript
terserOptions: {
  compress: {
    drop_console: true,     // Remove console.logs
    drop_debugger: true,    // Remove debuggers
  },
  mangle: { 
    safari10: true          // Safari compatibility
  },
}
```

## Performance Checklist

### Initial Load
- [ ] LCP < 2.5s
- [ ] FCP < 1.8s
- [ ] TTFB < 800ms
- [ ] Initial JS < 200 KB gzipped
- [ ] Critical CSS inlined
- [ ] Fonts preloaded

### Interactivity
- [ ] FID < 100ms
- [ ] INP < 200ms
- [ ] No blocking scripts
- [ ] Hydration strategy optimized

### Visual Stability
- [ ] CLS < 0.1
- [ ] Image dimensions set
- [ ] Skeleton loaders for dynamic content
- [ ] No layout shifts during load

### Bundle Size
- [ ] Total JS < 500 KB gzipped
- [ ] Vendor chunks < 150 KB each
- [ ] No duplicate dependencies
- [ ] Unused code eliminated

### Images
- [ ] WebP format used
- [ ] Lazy loading below fold
- [ ] Responsive srcset
- [ ] Proper alt text

### CSS
- [ ] Unused classes purged
- [ ] Critical CSS inlined
- [ ] Code splitting enabled
- [ ] Minimal custom CSS

### Fonts
- [ ] WOFF2 format
- [ ] font-display: swap
- [ ] Critical fonts preloaded

## Debugging Performance Issues

### Identify Bottlenecks

**Chrome DevTools Performance tab:**
1. Open DevTools > Performance
2. Record page load
3. Look for:
   - Long tasks (> 50ms)
   - Large bundle downloads
   - Render-blocking resources

**Lighthouse:**
```bash
npx lighthouse https://auxodata.com --view
```

### Common Issues & Fixes

**Large bundle size:**
- Check `npm run build:analyze`
- Add manual chunks for large libraries
- Use dynamic imports

**Slow LCP:**
- Preload hero image
- Optimize image size/format
- Reduce render-blocking resources

**High CLS:**
- Set image dimensions
- Reserve space for ads/embeds
- Use skeleton loaders

**Slow FID/INP:**
- Reduce JavaScript execution
- Defer non-critical scripts
- Optimize event handlers

## Monitoring

### Web Vitals Tracking

Automatically tracked via `src/scripts/webVitals.ts` and sent to Google Analytics.

### Regular Audits

```bash
# Weekly performance check
npm run build
npm run build:analyze

# Check bundle sizes
ls -lh dist/_astro/*.js

# Run Lighthouse
npx lighthouse https://auxodata.com
```

### Performance Budget

Set thresholds in CI/CD:
- JS: 500 KB total
- CSS: 100 KB total
- Images: WebP optimized
- LCP: < 2.5s
- CLS: < 0.1
