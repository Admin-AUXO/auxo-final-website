import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const packageJsonPath = path.join(root, "package.json");
const searchableExtensions = new Set([
  ".astro",
  ".cjs",
  ".css",
  ".cts",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
const ignoredDirectories = new Set([".astro", ".git", "dist", "node_modules"]);

const packageNeedles = {
  "@astrojs/rss": ["@astrojs/rss"],
  "@astrojs/sitemap": ["@astrojs/sitemap"],
  "@astrojs/tailwind": ["@astrojs/tailwind"],
  "@emailjs/browser": ["@emailjs/browser"],
  "@iconify-json/mdi": ["mdi:", "\"mdi\"", "'mdi'"],
  "@iconify-json/simple-icons": ["simple-icons", "\"simple-icons\"", "'simple-icons'"],
  "@playwright/test": ["@playwright/test", "playwright test"],
  astro: ["from 'astro'", "from \"astro\"", "astro build", "astro dev"],
  "astro-icon": ["astro-icon"],
  autoprefixer: ["autoprefixer"],
  cssnano: ["cssnano"],
  "embla-carousel": ["embla-carousel"],
  "embla-carousel-autoplay": ["embla-carousel-autoplay"],
  "focus-trap": ["focus-trap"],
  lenis: ["lenis"],
  "postcss-preset-env": ["postcss-preset-env"],
  purgecss: ["purgecss"],
  sharp: ["astro/assets/services/sharp", "sharp"],
  stylelint: ["stylelint", ".stylelintrc"],
  "stylelint-config-standard": ["stylelint-config-standard"],
  "stylelint-config-tailwindcss": ["stylelint-config-tailwindcss"],
  "stylelint-order": ["stylelint-order"],
  tailwindcss: ["tailwindcss", "@tailwind"],
  typescript: ["tsc --noEmit", "typescript"],
  "web-vitals": ["web-vitals"],
};

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (!searchableExtensions.has(path.extname(entry.name))) continue;
    if (fullPath === packageJsonPath || fullPath.endsWith("package-lock.json")) continue;
    files.push(fullPath);
  }

  return files;
}

function hasNeedle(text, needles) {
  return needles.some((needle) => text.includes(needle));
}

async function main() {
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  const files = await walk(root);
  const haystacks = await Promise.all(
    files.map(async (file) => await fs.readFile(file, "utf8")),
  );
  const candidates = [];

  for (const [sectionName, deps] of [
    ["dependencies", packageJson.dependencies ?? {}],
    ["devDependencies", packageJson.devDependencies ?? {}],
  ]) {
    for (const packageName of Object.keys(deps).sort()) {
      const needles = packageNeedles[packageName] ?? [packageName];
      const isUsed = haystacks.some((text) => hasNeedle(text, needles));
      if (!isUsed) {
        candidates.push({ packageName, sectionName });
      }
    }
  }

  if (candidates.length === 0) {
    console.log("dependency audit: 0 candidate unused packages");
    return;
  }

  console.log(
    `dependency audit: ${candidates.length} candidate unused package${candidates.length === 1 ? "" : "s"}`,
  );
  console.log("heuristic only: verify before uninstalling");
  for (const candidate of candidates) {
    console.log(`- ${candidate.packageName} (${candidate.sectionName})`);
  }

  process.exitCode = 1;
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
