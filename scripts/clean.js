import { rmSync } from 'fs';

const dirs = ['dist', 'node_modules/.astro', '.astro', '.vite', '.turbo'];
dirs.forEach(dir => {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {}
});
