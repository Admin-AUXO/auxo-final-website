# Session Handoff - 2026-03-30

## Goal
Reduce dead/redundant code and keep the same behavior by removing always-loaded feature weight from global layout.

## What Was Done
- Moved feature CSS to runtime-only loading (calendar modal, floating FAB, cookie consent, tab engagement).
- Stopped importing these feature styles through Astro/Vite CSS graph.
- Added route-aware feature gating in `BaseLayout`.
- Removed feature DOM from routes that do not need it (legal/blog/offline/404).
- Gated runtime feature init so modules are imported only when needed.

## Created
- `doc/session-handoff-2026-03-30.md`
- `public/styles/calendar-modal.css`
- `public/styles/fab.css`
- `public/styles/cookie-consent.css`
- `public/styles/tab-engagement.css`
- `src/scripts/common/cookieConsent.ts`
- `src/scripts/core/layoutRuntime.ts`

## Removed
- `src/styles/widgets/calendar-modal.css`
- `src/styles/components/fab.css`
- `src/styles/components/cookie-consent.css`
- `src/styles/features/tab-engagement.css`

## Key Updated Files
- `src/layouts/BaseLayout.astro`
- `src/scripts/core/init.ts`
- `src/scripts/core/layoutRuntime.ts`
- `src/scripts/utils/thirdPartyLoader.ts`
- `src/scripts/widgets/googleCalendar.ts`
- `src/scripts/utils/tabEngagement.ts`
- `src/components/common/CookieConsent.astro`
- `src/components/widgets/CalendarModal.astro`
- `src/components/widgets/FloatingCalendarButton.astro`

## Current Route Behavior
- Feature-enabled routes: `/`, `/about`, `/contact`, `/services`, `/services/*`
- Feature-disabled routes: `/404`, `/offline`, `/blog`, `/blog/*`, `/legal/*`

## What Can Be Removed Further (Next Aggressive Pass)
- Remove server-rendered calendar modal/FAB DOM even on enabled routes; inject it only after first calendar trigger interaction.
- Remove/trim any code paths that assume calendar UI exists on pages with zero `data-google-calendar-open` triggers.
- Audit global/shared CSS (`cookie-policy-*.css` chunk) for selectors that are no longer reachable after route gating.
- Review `src/scripts/core/init.ts` for modules that can be route-scoped like cookie/calendar/tab already are.

## How To Check Quickly
- Run:
  - `npm run lint`
  - `npm run build`
- Confirm no old style imports remain:
  - `rg -n "src/styles/(widgets/calendar-modal|components/fab|components/cookie-consent|features/tab-engagement)\.css" src`
- Confirm feature DOM only where expected:
  - `rg -l "floating-calendar-button|calendar-modal|cookie-consent-banner" dist -g "*.html"`
- Confirm tab engagement route flag split:
  - `rg -l "data-enable-tab-engagement=\"true\"" dist -g "*.html"`
  - `rg -l "data-enable-tab-engagement=\"false\"" dist -g "*.html"`

## Usage Notes For Future Edits
- If a page should not carry these features, pass explicit props to `BaseLayout`:
  - `enableCalendarWidgets={false}`
  - `enableCookieConsent={false}`
  - `enableTabEngagement={false}`
- To trigger calendar behavior from UI:
  - Use `Button` with `googleCalendar={true}` or add `data-google-calendar-open` on a clickable element.
- Do not reintroduce static imports of feature CSS into `src/styles` or layout-level imports.

## Suggested Next Step
Implement true on-demand DOM injection for calendar widgets and rerun the same route + build verification commands above.
