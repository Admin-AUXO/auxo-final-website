export function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? base : `${base}/`;
}

// Create URL with base path handling
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

// Create asset URL that respects base path
export function createAssetUrl(path: string): string {
  const base = getBaseUrl();
  // Remove leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Root base: serve from /
  if (base === '/' || base === '') {
    return `/${cleanPath}`;
  }
  
  // Non-root base: prefix with base
  return `${base}${cleanPath}`;
}

