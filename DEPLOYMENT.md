# Deployment Guide - GitHub Pages

This guide explains how to deploy the AUXO website to GitHub Pages.

## Prerequisites

- GitHub account
- Repository with the code
- Node.js 20+ installed locally (for testing)

## Initial Setup

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the settings

### 2. Configure Custom Domain (Optional)

If you're using a custom domain (e.g., `auxodata.com`):

1. In **Settings** → **Pages**, enter your custom domain
2. Add a `CNAME` file to the `public/` folder (GitHub will create this automatically)
3. Update your DNS records:
   - Add an `A` record pointing to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Or add a `CNAME` record pointing to `yourusername.github.io`

### 3. Update Site URL

If your site URL differs from `https://auxodata.com`, update it in:
- `astro.config.mjs` - `site` property
- `src/data/config/site.ts` - `url` property

## Deployment Process

### Automatic Deployment

The site deploys automatically when you:
- Push to the `main` branch
- Merge a pull request to `main`

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
1. Checkout the code
2. Install dependencies
3. Build the Astro site
4. Deploy to GitHub Pages

### Manual Deployment

You can trigger a manual deployment:
1. Go to **Actions** tab in your repository
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

### Local Testing

Before deploying, test the build locally:

```bash
# Build the site
npm run build

# Preview the production build
npm run preview
```

## Deployment Status

Check deployment status:
- **Actions** tab - View workflow runs and logs
- **Settings** → **Pages** - View deployment history and status

## Troubleshooting

### Build Failures

1. Check the **Actions** tab for error logs
2. Verify Node.js version compatibility (workflow uses Node 20)
3. Ensure all dependencies are listed in `package.json`

### Site Not Updating

1. Wait a few minutes (GitHub Pages can take 1-10 minutes to update)
2. Clear your browser cache
3. Check the deployment status in **Settings** → **Pages**
4. Verify the workflow completed successfully in **Actions**

### Custom Domain Issues

1. Verify DNS records are correct (use `dig` or online DNS checker)
2. Ensure `CNAME` file exists in `public/` folder
3. Wait up to 24 hours for DNS propagation
4. Check domain settings in **Settings** → **Pages**

### Security Headers

GitHub Pages doesn't support custom HTTP headers via `_headers` file. Security headers are implemented via:
- Meta tags in HTML (`BaseLayout.astro`)
- Content Security Policy via meta tags
- Other security headers via meta tags

If you need full HTTP header control, consider:
- Cloudflare Pages (supports `_headers`)
- Netlify (supports `_headers`)
- Vercel (supports headers via config)

## Environment Variables

If you need environment variables:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add your secret (e.g., `SITE_URL`)
4. Reference in workflow: `${{ secrets.SITE_URL }}`

## Branch Strategy

- **main** branch - Production deployments
- **develop** branch (optional) - Staging/preview deployments
- Feature branches - Development work

## Performance Optimization

After deployment:
1. Enable GitHub Pages caching (automatic)
2. Use a CDN (Cloudflare) for additional caching
3. Optimize images (consider PNG versions of SVG icons)
4. Monitor performance with Lighthouse

## Monitoring

- **GitHub Pages** - Built-in analytics (if enabled)
- **Google Analytics** - Add tracking code to `BaseLayout.astro`
- **Lighthouse** - Test performance regularly

