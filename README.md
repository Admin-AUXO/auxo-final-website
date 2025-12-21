# AUXO Homepage

A clean, modern homepage implementation built with Astro and deployed to GitHub Pages.

## Getting Started

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Deployment to GitHub Pages

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Configure Repository**:
   - Ensure your repository is public (or upgrade to GitHub Pro for private repos)
   - The workflow will automatically deploy on pushes to `main` branch

3. **Custom Domain (Optional)**:
   - In repository Settings → Pages, add your custom domain
   - Update `astro.config.mjs` with your domain if different from `auxodata.com`

4. **Manual Deployment**:
   - You can also trigger deployments manually from the Actions tab

### Deployment Workflow

The `.github/workflows/deploy.yml` workflow:
- Builds the Astro site on every push to `main`
- Deploys to GitHub Pages automatically
- Uses Node.js 20 and caches dependencies for faster builds

### Environment Variables

The project uses the following environment variables:

#### Local Development

Create a `.env` file in the root directory (see `.env.example` for template):

```bash
# Base path for GitHub Pages deployment
# Use '/' for root deployment (custom domain or username.github.io)
# Use '/repo-name/' for subdirectory deployment
BASE_PATH=/

# Site URL (optional, defaults to https://auxodata.com)
SITE_URL=https://auxodata.com
```

#### GitHub Actions (Production)

For GitHub Pages deployment, set these as repository secrets:
- Go to repository **Settings** → **Secrets and variables** → **Actions**
- Add secrets:
  - `BASE_PATH` (optional): Set to `/repo-name/` if deploying to subdirectory, otherwise defaults to `/`
  - `SITE_URL` (optional): Override the site URL, defaults to `https://auxodata.com`

**Note:** `BASE_URL` is automatically set by Astro based on the `base` config and is available via `import.meta.env.BASE_URL` in your code.

## Project Structure

- `src/pages/index.astro` - Homepage entry point
- `src/components/sections/home/` - Homepage sections
- `src/components/ui/` - Reusable UI components
- `src/data/content/` - Content data
- `src/styles/` - Global styles
- `src/scripts/` - JavaScript utilities
- `public/` - Static assets served directly
- `.github/workflows/` - GitHub Actions workflows

## Performance Optimizations

### Sanity CMS Caching
- **In-memory caching**: Sanity data is cached for 30 minutes to reduce API calls
- **Request deduplication**: Concurrent requests for the same data are deduplicated
- **CDN enabled**: Production builds use Sanity's CDN for faster content delivery
- **Build-time optimization**: All content is fetched at build time for static generation

### Code Optimizations
- **AstroEdge Integration**: Automated performance optimization toolkit for maximum Lighthouse scores
- **Code splitting**: JavaScript bundles are optimized for optimal loading
- **Tree shaking**: Unused code is eliminated during build
- **Asset optimization**: Images and assets are automatically optimized (WebP conversion, compression)
- **Font optimization**: `font-display: swap` ensures text is visible immediately
- **Lazy loading**: Below-the-fold components load on-demand using Intersection Observer
- **Service Worker**: Offline support and intelligent caching for repeat visits

Run `npm run optimize` to run AstroEdge optimizations before building.

## Sanity CMS Integration

The site uses Sanity CMS for content management. Content can be managed through:
- Homepage content
- Services pages
- About page
- Site configuration
- Navigation
- Footer sections

### Environment Variables for Sanity

Add these to your `.env` file:
```bash
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_API_TOKEN=your-api-token
```

## Notes

- The `.nojekyll` file in `public/` prevents Jekyll processing (required for Astro)
- Security headers are implemented via meta tags in the HTML head section
- GitHub Pages doesn't support custom HTTP headers via `_headers` file
- All content is managed through Sanity CMS - ensure content is published before building

