---
name: deployment
description: Build, deploy, and manage the AUXO website deployment workflow. Use when setting up CI/CD, configuring deployments, troubleshooting build issues, or managing environment variables.
---

# Deployment & Build Workflow

## Build Commands

### Development

```bash
npm run dev
# Starts dev server on http://localhost:4340
```

### Production Build

```bash
npm run build
# Builds static site to dist/
```

### Preview Build

```bash
npm run preview
# Preview production build locally on http://localhost:4341
```

### Build Variants

```bash
# Fast build (increased memory)
npm run build:fast

# Build with linting
npm run build:check

# Build with bundle analysis
npm run build:analyze
```

## Build Configuration

### Astro Config

Located in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://auxodata.com',
  base: '/',
  output: 'static',
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
```

**Key settings:**
- `output: 'static'` - Static site generation
- `assets: '_astro'` - Asset directory
- `compressHTML: true` - Minify HTML

### Environment Variables

**Required variables:**

```env
# Sanity CMS
SANITY_PROJECT_ID=4ddas0r0
SANITY_DATASET=production
SANITY_API_TOKEN=<token>
SANITY_API_VERSION=2024-01-01

# Analytics
PUBLIC_GTM_ID=GTM-XXXXXX
PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# EmailJS
PUBLIC_EMAILJS_SERVICE_ID=<service-id>
PUBLIC_EMAILJS_TEMPLATE_ID=<template-id>
PUBLIC_EMAILJS_PUBLIC_KEY=<public-key>

# Google Calendar
GOOGLE_CALENDAR_ID=<calendar-id>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<email>
GOOGLE_PRIVATE_KEY=<private-key>
```

**Variable prefixes:**
- `PUBLIC_` - Exposed to client-side code
- No prefix - Server-side only

### Build Output

```
dist/
├── _astro/           # JS, CSS, images
├── fonts/            # Font files
├── images/           # Optimized images
├── index.html        # Homepage
├── about.html        # About page
├── services.html     # Services page
└── ...              # Other pages
```

## Deployment Platforms

### Static Hosting Options

**Recommended platforms:**
- **Vercel** - Zero config, automatic deployments
- **Netlify** - Easy setup, form handling
- **Cloudflare Pages** - Fast global CDN
- **GitHub Pages** - Free for public repos

### Vercel Deployment

**One-click deploy:**
1. Connect GitHub repo
2. Vercel auto-detects Astro
3. Set environment variables
4. Deploy

**Vercel config (vercel.json):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro"
}
```

### Netlify Deployment

**netlify.toml:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Cloudflare Pages

**Build settings:**
- Build command: `npm run build`
- Build output: `dist`
- Environment variables: Add in dashboard

## CI/CD Workflow

### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          SANITY_PROJECT_ID: ${{ secrets.SANITY_PROJECT_ID }}
          SANITY_DATASET: ${{ secrets.SANITY_DATASET }}
          SANITY_API_TOKEN: ${{ secrets.SANITY_API_TOKEN }}
          PUBLIC_GTM_ID: ${{ secrets.PUBLIC_GTM_ID }}
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

### Automated Checks

**Pre-deployment checks:**
1. Type checking: `npm run type-check`
2. CSS linting: `npm run lint:css`
3. Build validation: `npm run build:check`
4. Bundle analysis: `npm run build:analyze`

## Sanity CMS Integration

### Schema Deployment

After schema changes:

```bash
# Generate TypeScript types
npm run sanity:typegen

# Deploy schema to Sanity
npm run sanity:deploy
```

### Sanity Scripts

Located in `scripts/`:

```bash
# Export Sanity data
npm run sanity:backup

# Import Sanity data
npm run sanity:restore

# Generate schema
npm run sanity:schema

# Migrate data
npm run sanity:migrate
```

### Sanity Studio

**Development only:**
```bash
npm run dev
# Access studio at http://localhost:4340/studio
```

**Production:** Deploy Sanity Studio separately or disable in production builds.

## Build Optimization

### Memory Management

For large builds:

```bash
# Increase Node memory
npm run build:fast
# Uses NODE_OPTIONS="--max-old-space-size=4096"
```

Or manually:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

### Parallelization

Configured in `astro.config.mjs`:

```javascript
rollupOptions: {
  maxParallelFileOps: 3,  // Limit parallel file operations
}
```

### Caching

**Cache npm dependencies:**

```yaml
# GitHub Actions
- uses: actions/setup-node@v3
  with:
    cache: 'npm'

# Or manually
- name: Cache node_modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
```

## Troubleshooting

### Build Fails

**Out of memory:**
```bash
npm run build:fast
# or
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

**Missing dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Sanity connection issues:**
```bash
# Check environment variables
echo $SANITY_PROJECT_ID
echo $SANITY_API_TOKEN

# Test Sanity connection
npx sanity debug
```

### TypeScript Errors

```bash
# Generate Sanity types
npm run sanity:typegen

# Check types
npm run type-check
```

### CSS Issues

```bash
# Lint CSS
npm run lint:css

# Fix CSS issues
npm run lint:css:fix
```

### Bundle Size Too Large

```bash
# Analyze bundle
npm run build:analyze

# Check for:
# - Duplicate dependencies
# - Large vendor chunks
# - Unused imports
```

## Pre-Deployment Checklist

- [ ] Environment variables set
- [ ] Sanity schema deployed
- [ ] Types generated (`npm run sanity:typegen`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Bundle size acceptable (`npm run build:analyze`)
- [ ] Images optimized
- [ ] Analytics configured
- [ ] Preview locally (`npm run preview`)

## Post-Deployment Verification

- [ ] Site loads correctly
- [ ] Navigation works
- [ ] Forms submit successfully
- [ ] Analytics tracking works
- [ ] Images load properly
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass

## Continuous Deployment Strategy

### Branch Strategy

```
main          → Production
staging       → Staging environment
feature/*     → Preview deployments
```

### Deployment Flow

1. **Feature branch** → Create PR
2. **PR checks** → Linting, build, tests
3. **Preview deployment** → Automatic preview URL
4. **Review & approve** → Code review
5. **Merge to staging** → Deploy to staging
6. **Test staging** → QA validation
7. **Merge to main** → Deploy to production

### Rollback Strategy

**Vercel/Netlify:**
- Use platform UI to rollback to previous deployment
- Or redeploy specific commit

**Manual:**
```bash
git revert <commit-hash>
git push origin main
```

## Environment-Specific Builds

### Development

```bash
NODE_ENV=development npm run dev
```

**Features:**
- Hot module reloading
- Sanity Studio enabled
- Source maps enabled
- Unminified output

### Production

```bash
NODE_ENV=production npm run build
```

**Optimizations:**
- Minification
- Tree shaking
- Image optimization
- No source maps
- Console logs removed

## Performance Monitoring

### Build Time

Track build duration:

```bash
time npm run build
```

**Target:** < 5 minutes for full build

### Bundle Size Monitoring

```bash
npm run build
ls -lh dist/_astro/*.js
```

**Alert if:**
- Any JS file > 150 KB gzipped
- Total JS > 500 KB gzipped

## Scripts Reference

```bash
# Development
npm run dev              # Dev server
npm run preview          # Preview production build

# Building
npm run build            # Production build
npm run build:fast       # Fast build (more memory)
npm run build:check      # Build with linting
npm run build:analyze    # Build with bundle analysis

# Linting
npm run type-check       # TypeScript check
npm run lint:css         # CSS linting
npm run lint:css:fix     # Fix CSS issues
npm run lint             # All linting

# Sanity
npm run sanity:backup    # Export Sanity data
npm run sanity:restore   # Import Sanity data
npm run sanity:typegen   # Generate types
npm run sanity:schema    # Generate schema
npm run sanity:deploy    # Deploy schema
npm run sanity:migrate   # Migrate data

# Testing
npm run test             # Run Playwright tests
npm run test:ui          # Playwright UI mode
npm run test:headed      # Run tests headed
npm run test:ci          # CI test mode

# GTM/Analytics
npm run gtm:check        # Validate GTM setup
npm run gtm:optimize     # Optimize GTM config
npm run gtm:cleanup-vars # Clean unused variables

# Maintenance
npm run clean            # Clean build artifacts
npm run clean:temp       # Clean temp files
npm run clean:all        # Clean everything
```

## Security Best Practices

- Never commit `.env` files
- Use environment variables for secrets
- Rotate API tokens regularly
- Enable HTTPS only
- Set appropriate CORS headers
- Use Content Security Policy (CSP)
- Regular dependency updates: `npm audit`
