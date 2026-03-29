# Repository Expectations

- Stack: Astro 5, TypeScript, Tailwind CSS, Lenis, Embla, Playwright.
- Primary goal: build a sharp, high-trust marketing site without trading clarity for animation noise or hydration bloat.

## Repo layout

- `src/pages`, `src/layouts`, `src/components`: routes and page composition
- `src/scripts`: browser behavior and interaction logic
- `src/styles`: shared styling layers and section styles
- `.codex/agents`: TOML subagents for repo-specific delegation
- `.agents/skills`: repo-scoped Codex skills

## How to work here

- Default to static Astro markup. Hydrate only where the interaction is real.
- Follow the existing structure before inventing new abstractions.
- Keep performance, reduced motion, and mobile layout intact when changing UI.
- Use the repo skills in `.agents/skills` for design system work, landing page composition, Astro section implementation, and performance-sensitive motion changes.
- Use the repo subagents in `.codex/agents` when bounded exploration, design review, docs verification, or perf review would help.

## Commands

- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm run test`

## Done means

- Run the narrowest command that proves the change.
- Run `npm run lint` for Astro, TypeScript, or CSS edits.
- Run `npm run build` when layouts, routing, or shared UI behavior changes.
- State what you verified and what you could not verify.
