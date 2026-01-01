# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AUXO Data Labs website: A high-performance marketing site built with Astro v5, TypeScript, Tailwind CSS, and Sanity CMS. Focus on analytics consultancy with advanced scroll animations, smooth scrolling (Lenis on desktop), and responsive mobile-first design.

## Development Commands

### Essential Commands
- `npm run dev` - Start dev server on port 4340
- `npm run build` - Production build
- `npm run build:fast` - Production build with increased memory (4GB)
- `npm run preview` - Preview production build on port 4341
- `npm run lint` - Run type checking and CSS linting
- `npm run lint:fix` - Auto-fix CSS lint issues
- `npm test` - Run Playwright tests
- `npm test:ui` - Run Playwright tests with UI
- `npm run clean:all` - Clean port 4340 and build artifacts

### Port Management
If port 4340 is in use: `npm run clean:port` or `lsof -ti:4340 | xargs kill -9`

## Architecture

### Scroll System (Critical)
**Recent major changes** - The scroll system has been heavily modified:
- **Desktop**: Lenis smooth scrolling (v1.2.11) via `src/scripts/smoothScroll.ts`
- **Mobile**: Native browser scrolling (Lenis disabled for performance)
- Device detection: `src/scripts/utils/deviceDetection.ts`
- Scroll animations: `src/scripts/scrollAnimations.ts` (uses IntersectionObserver)
- Fixed elements: Navigation, ScrollProgressBar, FloatingCalendarButton use `position: fixed` and `z-index` layering

**When modifying scroll:**
- Test both desktop and mobile thoroughly
- Check `src/scripts/core/init.ts` - initializes all scroll features
- Lenis instance: `window.__lenis` (desktop only)
- Avoid conflicting with native scroll on mobile
- Fixed elements must maintain correct z-index hierarchy

### Carousel System (Embla Carousel)
**Architecture** - Autoplay-only carousel system:
- **No play/pause controls**: All carousels autoplay continuously with no user controls
- **Core**: `src/scripts/animations/EmblaCarousel.ts` - Wrapper class with autoplay plugin
- **Management**: `src/scripts/utils/carousels.ts` - Lifecycle and responsive handling
- **Configs**: `src/scripts/sections/utils/carouselConfigs.ts` - Central registry of all carousels
- **Component**: `src/components/ui/Carousel.astro` - Reusable Astro wrapper

**Critical CSS Spacing Pattern:**
- Carousel track uses `gap` property for ALL spacing between slides
- Slides have NO padding-left/padding-right (removed to fix first-child alignment issues)
- **Never** add `:first-child { padding-left: 0; }` - causes misalignment
- Use consistent gap values via CSS variables: `--carousel-gap-mobile`, `--carousel-gap-tablet`

**Carousel Types:**
- Mobile-only: `breakpoint: 768` or `1024` (hidden on desktop)
- Desktop-only: `activateOnDesktop: true` (e.g., Impact section)
- Always visible: `alwaysVisible: true`

**Autoplay Intervals:**
- Services: 6000ms, Models: 5500ms, Process: 5000ms, Impact: 4000ms
- Code principles: 4000ms, Capabilities: 4500ms, Global metrics: 3500ms

### Component Organization
```
src/
├── components/
│   ├── common/          # Navigation, Footer, MetaTags
│   ├── sections/        # Page-specific sections (home/, about/, services/)
│   ├── ui/              # Reusable UI (Button, Card, Carousel)
│   ├── layouts/         # LegalLayout, SectionContainer
│   ├── forms/           # ContactForm with EmailJS
│   ├── widgets/         # FloatingCalendarButton, CalendarModal
│   └── effects/         # ParticleBackground (canvas-based)
├── layouts/
│   ├── BaseLayout.astro # Main layout (Navigation, Footer, scroll init)
│   └── ServiceLayout.astro
├── pages/               # File-based routing
│   ├── services/[slug].astro # Dynamic service pages
│   └── legal/           # Privacy, Terms, Cookie Policy
├── scripts/             # Client-side TypeScript modules
│   ├── core/            # init.ts, navigation.ts, floatingButton.ts
│   ├── sections/        # Page-specific scripts
│   └── utils/           # carousels.ts, accordions.ts, notifications.ts
├── data/content/        # Static content (navigation, homepage, services)
├── lib/sanity/          # Sanity client, queries, cache, image helpers
└── styles/              # Global CSS, animations, typography
```

### Sanity CMS Integration
- **Config**: `sanity.config.ts` - Studio available at `/studio` in dev mode only
- **Client**: `src/lib/sanity/` contains client, queries (GROQ), and caching
- **Images**: Use `src/lib/sanity/image.ts` helpers with `@sanity/image-url`
- **Data fetching**: Server-side via `getSiteConfigData()` and GROQ queries
- **Environment**: Requires `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, `SANITY_API_VERSION` in `.env`

### Script Initialization Pattern
All client scripts follow lifecycle pattern in `BaseLayout.astro`:
1. `initCoreFeatures()` - Runs once on page load (scroll, nav, progress bar)
2. `initPageFeatures(showParticles)` - Page-specific features (particles, calendar, theme)
3. `reinitOnPageLoad()` - Cleanup and re-init on Astro page transitions
4. Scripts use `astro:page-load` events for View Transitions compatibility

### Path Aliases
TypeScript paths configured in `tsconfig.json`:
- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/scripts/*` → `src/scripts/*`
- `@/lib/*` → `src/lib/*`
- etc.

### Build Configuration
`astro.config.mjs` includes aggressive optimizations:
- Terser minification with `drop_console` in production
- Manual code splitting: `ui-vendor`, `icons`, `sanity`, `react-vendor`, `utils`
- Sanity integration disabled in production builds
- Vite alias: `@` → `./src`

## Styling Guidelines

### Tailwind + Custom CSS
- **Utility-first**: Prefer Tailwind utilities
- **CSS variables**: Defined in `src/styles/base.css` (e.g., `--bg-primary`, `--text-primary`)
- **Dark mode**: Use `dark:` variants; theme stored in localStorage, applied inline in `<head>` to prevent flash
- **Responsive**: Mobile-first breakpoints; min touch target 44px
- **Typography**: Fluid scaling via `clamp()` in `src/styles/typography.css`

### CSS Structure
- `global.css` - Main imports
- `base.css` - CSS variables, theme definitions
- `animations.css` - Keyframes, transitions
- `view-transitions.css` - Astro View Transitions styling
- Lint with Stylelint: `npm run lint:css`

### Animation & Reveal Standards
**Scroll reveal animations** - Consistent timing across the site:
- **Duration**: `200ms` (standard for all reveals, faster feels smoother)
- **Easing**: `ease-out` (natural deceleration)
- **Header delays**: `0-50ms` (minimal delay for immediate feedback)
- **Content delays**: `50-100ms` (stagger after headers)
- **Stagger intervals**: `40ms` for grid items (cards, features, metrics)

**Service Page Patterns:**
- Section headers: `data-reveal="fade-down"` with `200ms` duration
- Content grids: `data-reveal="zoom-in"` or `fade-up` with `40ms` stagger per item
- Carousels: `data-reveal="fade-up"` with `50ms` delay
- Secondary content: `100ms` delay maximum

**Common reveal types:**
- `fade-down`: Headers, titles (top-down hierarchy)
- `fade-up`: Content blocks, cards (bottom-up reveal)
- `fade-right`/`fade-left`: Side-by-side content
- `zoom-in`: Grid items (benefits, outcomes, features)
- `fade`: Backgrounds, decorative elements

### Hover Effect Patterns
**Subtle interactions** - Service page standards:
- **Border colors**: Opacity shifts only (e.g., `opacity-20` → `opacity-30`)
- **Backgrounds**: Light gradient/opacity changes
- **Transform movements**: Generally avoided on service pages for cleaner UX
- **Icons**: Border color changes, no scale/rotate
- **Exceptions**: Navigation, buttons, CTAs can have more pronounced effects

**Impact Section:**
- Cards: Border color change + top accent line reveal only
- Use case items: Background + border color shift + left accent bar
- No translateY, translateX, scale, or rotate transforms

**Models Section:**
- Accordion summary: Background + left bar reveal + translateX (kept for affordance)
- Deliverable items: Light background + border color shift only
- Tags: Static accent-green background (no hover changes)

## Content & Coding Standards

### From .cursor/rules/auxo.mdc
- **Output**: Diff-style only, no conversational filler
- **Comments**: Forbidden except `TODO` or `@ts-ignore` with justification
- **Imports**: Group as: 1) Astro/React, 2) Third-party, 3) Local components, 4) Types/Utils
- **Voice**: Expert, analytical, concise
- **Keywords**: "Growth", "Metrics", "KPIs", "Scale", "Data-Driven"
- **Git**: Conventional Commits (feat:, fix:, refactor:)
- **Mobile nav**: MUST use `astro:page-load` listeners for View Transitions
- **Performance**: `client:visible` for charts/carousels, `client:load` for nav/search
- **Build verification**: Always `npm run build` locally before pushing

## Common Pitfalls

### Scroll Issues
- **Don't** add multiple scroll libraries or conflicting smooth scroll
- **Don't** use `overflow: hidden` on body without understanding scroll lock system
- **Do** test mobile scroll separately from desktop
- **Do** check z-index on fixed elements (nav: 100, progress bar: 101, floating button: 50)

### Astro View Transitions
- Use `astro:page-load` for all DOM manipulation on page change
- Cleanup listeners in `astro:before-swap`
- Scripts in `<script>` tags auto-execute on transitions

### Sanity CMS
- Studio only loads in dev mode (`NODE_ENV === 'development'`)
- Always type GROQ query responses with TypeScript interfaces
- Use caching helpers in `src/lib/sanity/cache.ts`

### Performance
- Lazy load off-screen content with `data-lazy-load` attribute
- Carousels use Embla Carousel, init via `src/scripts/utils/carousels.ts`
- Images: Always use `aspect-ratio` to prevent CLS

### Carousel Patterns
- **Don't** add play/pause buttons - carousels are autoplay-only by design
- **Don't** use padding on `.embla__slide` - causes spacing inconsistencies
- **Don't** add `:first-child` padding overrides - use gap-based spacing only
- **Do** use the `gap` property on `.carousel-track` for all slide spacing
- **Do** configure autoplay intervals in `carouselConfigs.ts` (3500ms - 6000ms range)
- **Do** test both desktop and mobile - some carousels are breakpoint-specific

### Service Page Patterns
- **Animations**: Use 200ms duration, 40-50ms stagger intervals
- **Hover effects**: Keep subtle - prefer border/background changes over transforms
- **Icon positioning**: Check icons on the right to save horizontal space (e.g., Key Use Cases)
- **Tags/badges**: Use permanent styling (accent-green background) without hover state changes
- **Accordion content**: Deliverables have subtle hover, tags remain static

## Testing

- Playwright config: `playwright.config.ts`
- Run tests: `npm test`
- UI mode: `npm test:ui`
- Headed mode: `npm test:headed`

## Deployment

- **Platform**: GitHub Pages via `.github/workflows/deploy.yml`
- **Trigger**: Push to `main` branch
- **Required secrets**: `SANITY_PROJECT_ID`, `SANITY_API_TOKEN`, `SANITY_DATASET`, `SITE_URL`, `BASE_PATH`
- **Build**: Runs lint, type-check, and build in CI
- **Verification**: Checks `dist/index.html` exists before deploy

## MCP Servers (Model Context Protocol)

Configuration in `mcp.json`. Available servers:

- **playwright** - Browser automation and testing
- **filesystem** - Read/search project files
- **git** - Git operations and repo management
- **fetch** - Fetch and process web content
- **github** - GitHub operations (requires `GITHUB_PERSONAL_ACCESS_TOKEN`)
- **memory** - Persistent knowledge graph across sessions

**Setup**: Add `GITHUB_PERSONAL_ACCESS_TOKEN` to `.env` for GitHub MCP (optional).
