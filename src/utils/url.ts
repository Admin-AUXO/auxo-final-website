export function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? base : `${base}/`;
}

function isExternalUrl(path: string): boolean {
  return /^(#|https?:\/\/|mailto:)/.test(path);
}

export function createUrl(path: string): string {
  if (isExternalUrl(path)) return path;
  
  const base = getBaseUrl();
  const cleanPath = path.replace(/^\/+/, '');
  const pathWithSlash = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  return `${base}${pathWithSlash}`;
}

export function createAssetUrl(path: string): string {
  // Always return paths relative to root for asset URLs
  // Don't use import.meta.env.BASE_URL for assets to avoid path issues
  const cleanPath = path.replace(/^\/+/, '');
  return `/${cleanPath}`;
}

