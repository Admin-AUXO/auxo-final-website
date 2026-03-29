---
name: website-design-system
description: Use when defining or revising the visual direction, typography, color system, component styling language, or overall aesthetic for this Astro marketing site.
---

# Website Design System

Shape the visual system before touching components. Pick a clear point of view and make every later decision serve it.

## Workflow

1. Identify the page goal, audience confidence level, and desired emotional tone.
2. Define one visual thesis in a sentence.
3. Lock four system choices before implementation:
   - type pairing
   - color logic
   - spacing rhythm
   - motion character
4. Reuse existing tokens and patterns where they still fit. Extend them only when the new direction is clearly better.

## Visual Thesis

Every page or redesign needs a crisp aesthetic statement such as:

- precision editorial with restrained motion
- technical authority with sharp contrast and dense proof
- modern consultancy with warm credibility and deliberate pacing

If the page cannot be described in one sentence, the design is unfocused.

## Required Decisions

### Typography

- Use one display voice and one workhorse body face.
- Headlines should signal authority fast, not chase trendiness.
- Body text must stay easy to scan on dense marketing pages.
- Avoid default-looking stacks unless the existing design already commits to them.

### Color

- Assign colors by role: base, surface, accent, proof, caution.
- Use accent color sparingly so CTAs and proof elements still matter.
- Prefer contrast that feels intentional over washed-out gradient fog.

### Spacing

- Keep a consistent vertical rhythm between section intro, proof, and CTA.
- Use whitespace to separate ideas, not to fake luxury.
- Densify sections with real information before adding decorative wrappers.

### Motion

- Motion must reinforce reading order or state change.
- Use a few memorable moments, not constant shimmer.
- Always respect reduced motion and avoid scroll-jank theatrics.

## Anti-Patterns

- Generic SaaS cards with equal visual weight everywhere
- Accent color sprayed across every element
- Oversized hero copy with no proof nearby
- Decorative gradients masking weak structure
- Animations that delay comprehension

## Repo Fit

- Adapt to the existing Astro and CSS architecture instead of importing a foreign design system whole.
- When changing a shared visual language, update tokens or reusable patterns instead of stacking one-off overrides.
