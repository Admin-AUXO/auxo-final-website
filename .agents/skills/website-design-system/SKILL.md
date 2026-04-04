---
name: website-design-system
description: Use when defining or revising the visual direction, typography, color system, shared component styling language, or overall aesthetic for this Astro marketing site. Trigger for token changes, component visual cleanup, shared style refactors, and page-level visual direction updates.
---

# Website Design System

Shape the system before touching components.

## Workflow

1. Identify the page goal, audience confidence level, and desired emotional tone.
2. Define one visual thesis in a sentence.
3. Lock four choices before implementation: type pairing, color logic, spacing rhythm, motion character.
4. Reuse existing tokens and patterns where they still fit. Extend them only when the new direction is clearly better.
5. Decide where information density should live so design supports scanning instead of fighting it.

## Rules

- Use one display voice and one workhorse body face.
- Headlines should signal authority fast, not chase trendiness.
- Body text must stay easy to scan on dense marketing pages.
- Avoid default-looking stacks unless the existing design already commits to them.
- Assign colors by role: base, surface, accent, proof, caution.
- Use accent color sparingly so CTAs and proof elements still matter.
- Prefer contrast that feels intentional over washed-out gradient fog.
- Keep a consistent vertical rhythm between section intro, proof, and CTA.
- Use whitespace to separate ideas, not to fake luxury.
- Densify sections with real information before adding decorative wrappers.
- Cards should expose their hierarchy in one glance: label, title, one useful support line, action.
- Icons are for scan value, not decoration. If removing the icon improves the card, the icon was noise.
- Menus and dropdowns should feel denser and calmer than landing-page sections. Reduce copy, reduce ornament, increase scan speed.
- When content is doing the work, backgrounds should stay quiet. Decorative effects must not compete with labels, fit text, or CTAs.
- Primary outputs, proof statements, and stakeholder groups deserve stronger visual hierarchy than generic paragraph copy.
- Motion must reinforce reading order or state change.
- Use a few memorable moments, not constant shimmer.
- Always respect reduced motion and avoid scroll-jank theatrics.
- Adapt to the existing Astro and CSS architecture instead of importing a foreign design system whole.
- When changing a shared visual language, update tokens or reusable patterns instead of stacking one-off overrides.

## High-Risk Areas

- Mega menus: keep them inside the viewport, grouped clearly, and visually quieter than the page behind them.
- Mobile service sections: convert dense grids into accordions or carousels only when the alternate pattern improves comprehension.
- Comparison-heavy sections: make labels, fit statements, and outputs visually scannable before styling supporting copy.
