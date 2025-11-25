export function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? base : `${base}/`;
}

export function createUrl(path: string): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const pathWithSlash = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  return `${base}${pathWithSlash}`;
}

