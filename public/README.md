# Public Assets

This folder contains static files that are served directly by the web server.

## Security Files

- **`_headers`** - Security headers configuration (Note: GitHub Pages doesn't support custom headers via `_headers` file. Headers are implemented via meta tags in HTML and GitHub Pages settings)
- **`security.txt`** - Security contact information for vulnerability reporting
- **`.well-known/security.txt`** - Alternative location for security.txt (RFC 9116)

## SEO & Discovery

- **`robots.txt`** - Search engine crawler instructions
- **`.well-known/robots.txt`** - Alternative robots.txt location

## Icons & Branding

- **`favicon.svg`** - Main favicon (SVG format)
- **`apple-touch-icon.svg`** - Apple touch icon for iOS devices
- **`logo.svg`** - Company logo
- **`og-image.svg`** - Open Graph image for social media sharing (1200x630px)

## PWA & App Configuration

- **`manifest.json`** - Web App Manifest for PWA support
- **`browserconfig.xml`** - Microsoft browser configuration

## GitHub Pages Configuration

- **`.nojekyll`** - Prevents Jekyll processing (required for Astro sites on GitHub Pages)

## Other Files

- **`humans.txt`** - Human-readable site information

## Notes

- All image files are currently SVG format. For production, consider generating PNG versions for better compatibility.
- GitHub Pages doesn't support custom HTTP headers via `_headers` file. Security headers are implemented via meta tags in the HTML head section.
- Update `security.txt` expiration date annually.

