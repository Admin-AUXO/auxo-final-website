---
name: public-assets-and-discovery
description: Use when editing files under public/, especially ai.txt, robots.txt, manifest.json, security.txt, browserconfig.xml, service worker files, icons, or runtime-loaded stylesheets in public/styles. Trigger for crawler metadata, PWA metadata, static-host compatibility, and raw CSS shipped without the app build pipeline.
---

# Public Assets and Discovery

Treat `public/` as raw output. No Tailwind pass. No PostCSS rescue. No server-side magic.

## Scope

- Metadata files: `robots.txt`, `ai.txt`, `manifest.json`, `security.txt`, `humans.txt`
- Static hosting files: icons, fonts, browser config, `.well-known/*`
- Runtime assets: `public/styles/*`, `sw.js`

## Rules

- Keep files plain, explicit, and tied to real routes or capabilities.
- Remove host-specific artifacts when the current deployment will not honor them.
- Do not declare manifest features, crawler endpoints, or service-worker flows unless the app actually implements them.
- Prefer short authoritative metadata over verbose marketing copy.
- Keep icon, manifest, and crawler assets synchronized with the actual site navigation and published routes.
- If a public asset is not referenced by the site, browser, crawler, or build output, it is dead weight.

## Runtime CSS

- Assume files in `public/styles` are shipped as-is.
- Prefer flat, standards-based CSS over build-time abstractions or fragile nesting.
- Reuse existing design tokens where they already exist.
- Keep selectors tightly scoped to the runtime widget they serve.
- Add reduced-motion handling when the file introduces noticeable animation.
- Do not assume app-bundled CSS variables or layers exist unless the runtime asset is explicitly loaded in that context.

## Service Worker

- Keep caching strategies simple and predictable.
- Precache only a small set of core offline assets.
- Use network-first for navigations with an offline fallback.
- Avoid background sync, periodic sync, or custom message flows unless the app uses them end to end.

## Verification

- Check every edited public asset has a real caller or browser purpose.
- Rebuild when changing metadata paths, service worker behavior, or manifest contents.
- When editing crawler-facing files, confirm links and canonical paths are current.
- Re-open the generated output path when asset naming, icon sets, or discovery files change.
