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

If you need to set environment variables:
- Go to repository Settings → Secrets and variables → Actions
- Add any required secrets (e.g., `SITE_URL`)

## Project Structure

- `src/pages/index.astro` - Homepage entry point
- `src/components/sections/home/` - Homepage sections
- `src/components/ui/` - Reusable UI components
- `src/data/content/` - Content data
- `src/styles/` - Global styles
- `src/scripts/` - JavaScript utilities
- `public/` - Static assets served directly
- `.github/workflows/` - GitHub Actions workflows

## Notes

- The `.nojekyll` file in `public/` prevents Jekyll processing (required for Astro)
- Security headers are implemented via meta tags in the HTML head section
- GitHub Pages doesn't support custom HTTP headers via `_headers` file

