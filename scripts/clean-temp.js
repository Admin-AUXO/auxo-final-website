import { readdirSync, unlinkSync, rmSync, statSync } from 'fs';
import { join } from 'path';

function clean(dir) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    entries.forEach(entry => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        clean(path);
        if (/\.(vite|turbo|astro|cache|temp|tmp)$/.test(path)) {
          rmSync(path, { recursive: true, force: true });
        }
      } else if (/\.(log|tmp|cache|tsbuildinfo)$|^(eslint|stylelint)\.cache$/.test(entry.name)) {
        unlinkSync(path);
      }
    });
  } catch {}
}

clean('.');
