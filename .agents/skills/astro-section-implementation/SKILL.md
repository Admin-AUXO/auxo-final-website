---
name: astro-section-implementation
description: Use when building or refactoring Astro sections, content blocks, reusable page modules, or section-level styling in this repository.
---

# Astro Section Implementation

Build sections that survive real use: static first, styled coherently, and interactive only when needed.

## Before Editing

1. Inspect the nearest matching section, component, and stylesheet pattern.
2. Decide whether the new work belongs in an existing component family or needs a new focused file.
3. Confirm whether any interaction can stay server-rendered.

## Implementation Rules

- Keep markup semantic and readable.
- Push repeated logic into focused helpers or shared data, not into tangled template conditionals.
- Use hydration only when the section has real client behavior.
- Match the repo's CSS organization so styles remain discoverable.

## Styling Guidance

- Prefer reusable tokens, utility patterns, and existing section conventions.
- Add custom classes when the visual pattern is specific and likely to repeat.
- Keep responsive behavior deliberate; do not let desktop composition collapse into random mobile stacking.

## Interaction Guidance

- Scope scripts to the section they serve.
- Guard DOM queries and event listeners.
- Handle Astro navigation or re-entry events if the feature depends on runtime initialization.

## Quality Bar

- Section reads well with CSS late or partially broken.
- CTA hierarchy is obvious.
- Spacing works on narrow screens.
- Motion, if any, does not block first comprehension.
