# Repository Expectations

- Stack: Astro 5, TypeScript, Tailwind CSS, Lenis, Embla, Playwright.
- Primary goal: build a sharp, high-trust marketing site without trading clarity for animation noise or hydration bloat.
- Default audience: skeptical B2B buyers. They skim first, compare second, and contact only after the page earns trust.

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
- Research current best practices before changing page-level structure, navigation patterns, or buyer-facing copy direction.
- `public/` files bypass the app CSS/tooling pipeline. Keep them standards-based, self-contained, and compatible with static hosting.
- This repo deploys as a static GitHub Pages build. Do not add host-specific files or headers unless the deployment model changes.
- Use the repo skills in `.agents/skills` for design system work, landing page composition, Astro section implementation, performance-sensitive motion changes, and public metadata/static asset work.
- Use the repo subagents in `.codex/agents` when bounded exploration, design review, docs verification, or perf review would help.

## Page And Content Rules

- Every page needs one job. Do not let sections drift into generic awareness copy.
- Service pages must answer this sequence fast: what the service is, who it fits, what changes, how it works, why AUXO is credible, what happens next.
- Put fit criteria, deliverables, proof, or objection-handling ahead of fluffy vision language.
- Keep buyer-facing copy concrete. Prefer named problems, stakeholders, outputs, and decision scenarios over abstract transformation language.
- Write for skimmers. Headings, labels, cards, and the first sentence of each paragraph must carry the argument on their own.
- Use the buyer’s language, not internal consulting language. Cut hedging, filler, and empty intensifiers.
- Relevance sections such as industries, use cases, and FAQs must help buyers self-qualify. If they do not affect the buying decision, they are clutter.
- CTA strategy should progress with commitment. One strong primary action, with lighter assistive CTAs only where a longer page actually needs them.

## Navigation And Mobile Rules

- Desktop dropdowns and mega menus must fit inside the viewport and keep their own scroll region when needed. Never rely on the page behind the menu to bail you out.
- Group navigation options by user intent or buying stage, not by arbitrary internal taxonomy.
- Keep navigation copy compact. Use labels plus one short line of guidance, not mini landing pages stuffed into a menu.
- Mobile is not a shrunk desktop. Dense comparison content should become accordions or carousels only when that reduces cognitive load.
- Use accordions for stacked detail and category disclosure. Use carousels for side-by-side browsing of repeated cards. Do not use both when one pattern is enough.
- Keep tap targets, focus states, and keyboard behavior usable across nav, accordions, and carousel controls.

## Data And Implementation Rules

- Model semantic content explicitly. Do not depend on array order, magic indexes, or label text when other components need the data.
- Keep section contracts typed and readable. Shared content belongs in data files or focused helpers, not repeated template branches.
- If a component rewrite makes selectors obsolete, remove the dead CSS in the same pass.
- Preserve reduced-motion behavior and re-initialization paths whenever changing Embla, Lenis, reveals, or dropdown runtime logic.

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
- For navigation, layout, carousel, or major page-composition changes, do not stop at static checks. Also do a browser pass at representative desktop and mobile breakpoints when feasible.
- State what you verified and what you could not verify.
