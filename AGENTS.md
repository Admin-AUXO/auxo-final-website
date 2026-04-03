# Repository Expectations

- Stack: Astro 5, TypeScript, Tailwind CSS, Lenis, Embla, Playwright.
- Primary goal: build a sharp, high-trust marketing site without trading clarity for animation noise or hydration bloat.

## Repo layout

- `src/pages`, `src/layouts`, `src/components`: routes and page composition
- `src/scripts`: browser behavior and interaction logic
- `src/styles`: shared styling layers and section styles
- `public`: raw static files shipped as-is, including crawler metadata, PWA files, icons, service worker, and runtime-loaded public stylesheets
- `.codex/agents`: TOML subagents for repo-specific delegation
- `.agents/skills`: repo-scoped Codex skills

## How to work here

- Default to static Astro markup. Hydrate only where the interaction is real.
- Follow the existing structure before inventing new abstractions.
- Keep performance, reduced motion, and mobile layout intact when changing UI.
- `public/` files bypass the app CSS/tooling pipeline. Keep them standards-based, self-contained, and compatible with static hosting.
- This repo deploys as a static GitHub Pages build. Do not add host-specific files or headers unless the deployment model changes.
- Use the repo skills in `.agents/skills` for design system work, landing page composition, Astro section implementation, performance-sensitive motion changes, and public metadata/static asset work.
- Use the repo subagents in `.codex/agents` when bounded exploration, design review, docs verification, or perf review would help.

## Commands

- `npm run type-check`
- `npm run lint`
- `npm run audit`
- `npm run audit:full`
- `npm run audit:astro`
- `npm run audit:embla`
- `npm run build`
- `npm run test`

## Done means

- Run the narrowest command that proves the change.
- Run `npm run lint` for Astro, TypeScript, or CSS edits.
- Run `npm run audit` for repo-wide refactors, Astro file cleanup, Embla carousel changes, `public/` cleanup, dependency cleanup, or stacking/layering changes that benefit from targeted static checks.
- Run `npm run build` when layouts, routing, shared UI behavior, or `public/` metadata/service worker/style files change.
- State what you verified and what you could not verify.
