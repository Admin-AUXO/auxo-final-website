export function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * Creates a URL with proper base path handling.
 * Handles anchors (#), external URLs (http/https), and relative paths.
 */
export function createUrl(path: string): string {
  // Return anchors and external URLs as-is
  if (path.startsWith('#') || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('mailto:')) {
    return path;
  }
  
  const base = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const pathWithSlash = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  return `${base}${pathWithSlash}`;
}

/**
 * Creates a URL for static assets (favicons, manifests, etc.)
 * Public folder assets in Astro are served at the root, so we need to ensure
 * the base path is correctly applied.
 */
export function createAssetUrl(path: string): string {
  const base = getBaseUrl();
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Handle base URL - if it's root, just return the path with leading slash
  if (base === '/' || base === '') {
    return `/${cleanPath}`;
  }
  
  // Otherwise, combine base (which already ends with /) with clean path
  return `${base}${cleanPath}`;
}

