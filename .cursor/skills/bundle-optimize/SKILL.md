---
name: bundle-optimize
description: Optimize bundle size and analyze build output for the AUXO Astro website. Use when dealing with large bundles, slow build times, or when the user asks about performance optimization.
---

# Bundle Optimization

## Bundle Analysis

Run bundle analysis:

```bash
npm run build:analyze
```

Generates interactive visualization of bundle contents.

## Vite Configuration

Bundle splitting configured in `astro.config.mjs`:

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

## Optimization Strategies

### 1. Code Splitting

**Manual chunks for large dependencies:**

```javascript
// Add to manualChunks in astro.config.mjs
if (id.includes('your-large-library')) return 'library-name';
```

**Dynamic imports for rarely-used code:**

```typescript
const module = await import('./heavy-module');
```

### 2. Tree Shaking

**Import only what you need:**

```typescript
// Good
import { specificFunction } from 'library';

// Bad
import * as library from 'library';
```

### 3. Reduce Client-Side JS

**Use Astro islands strategically:**

```astro
<!-- Only hydrate when visible -->
<Component client:visible />

<!-- Only hydrate on interaction -->
<Component client:idle />

<!-- Avoid if possible -->
<Component client:load />
```

### 4. Icon Optimization

**Include only used icons in `astro.config.mjs`:**

```javascript
icon({
  include: {
    'mdi': ['specific-icon-1', 'specific-icon-2'],
    'simple-icons': ['brand-1', 'brand-2'],
  },
})
```

**Find unused icons:**

```bash
# Search codebase for icon usage
rg "Icon name=\"mdi:" --type astro
```

### 5. Image Optimization

**Use Astro's Image component:**

```astro
<Image 
  src={image} 
  alt="Description"
  loading="lazy"
  format="webp"
  quality={80}
/>
```

**Optimize image dimensions:**

```astro
<Image 
  src={image}
  widths={[400, 800, 1200]}
  sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px"
/>
```

### 6. CSS Optimization

**Enable CSS code splitting (already configured):**

```javascript
build: {
  cssCodeSplit: true,
}
```

**Minimize custom CSS, use Tailwind:**

```astro
<!-- Good: Tailwind utilities -->
<div class="flex items-center gap-4">

<!-- Avoid: Custom CSS when Tailwind suffices -->
<style>
  .custom-flex { 
    display: flex; 
    align-items: center; 
    gap: 1rem; 
  }
</style>
```

### 7. Minification

**Terser optimization (configured in `astro.config.mjs`):**

```javascript
terserOptions: {
  compress: {
    drop_console: true,    // Remove console.logs in production
    drop_debugger: true,   // Remove debuggers
  },
}
```

## Build Scripts

### Fast Build

For development/testing:

```bash
npm run build:fast
```

Uses increased memory allocation.

### Production Build

Full optimization:

```bash
npm run build
```

### Build Check

Lint + build:

```bash
npm run build:check
```

## Chunk Size Targets

**Recommended limits:**

- Initial bundle: < 200 KB gzipped
- Route chunks: < 100 KB gzipped
- Vendor chunks: < 150 KB gzipped
- Total JS: < 500 KB gzipped

**Check chunk sizes:**

```bash
npm run build
# Review output for chunk sizes
```

## Common Issues & Fixes

### Large Vendor Chunks

**Split into smaller chunks:**

```javascript
manualChunks(id) {
  // Split by feature instead of library
  if (id.includes('chart-library')) return 'charts';
  if (id.includes('form-library')) return 'forms';
}
```

### Duplicate Dependencies

**Check for version conflicts:**

```bash
npm ls <package-name>
```

**Use overrides in package.json:**

```json
"overrides": {
  "package-name": "^version"
}
```

### Large Page Bundles

**Lazy load heavy components:**

```astro
---
const HeavyComponent = (await import('./HeavyComponent.astro')).default;
---

{condition && <HeavyComponent />}
```

### CSS Bloat

**Purge unused Tailwind classes:**

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  // Ensures only used classes are included
}
```

## Monitoring

**Track bundle size over time:**

1. Run `npm run build:analyze` before changes
2. Note current sizes
3. Make optimizations
4. Re-run analysis
5. Compare results

**Set size budget in CI/CD:**

```yaml
# GitHub Actions example
- name: Check bundle size
  run: |
    npm run build
    npx size-limit
```

## Performance Checklist

- [ ] Analyzed bundle with `build:analyze`
- [ ] Vendor chunks < 150 KB each
- [ ] No duplicate dependencies
- [ ] Icons list pruned to used icons only
- [ ] Client-side JS minimized
- [ ] Images optimized and lazy loaded
- [ ] CSS code splitting enabled
- [ ] Console logs removed in production
- [ ] Unused imports removed
- [ ] Dynamic imports for large modules
