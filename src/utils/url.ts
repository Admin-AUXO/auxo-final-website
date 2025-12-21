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
  const base = import.meta.env.BASE_URL || '/';
  const cleanPath = path.replace(/^\/+/, '');
  
  if (base === '/' || !base) {
    return `/${cleanPath}`;
  }
  
  const baseWithoutTrailing = base.replace(/\/+$/, '');
  return `${baseWithoutTrailing}/${cleanPath}`;
}

