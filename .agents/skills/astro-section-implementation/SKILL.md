---
name: astro-section-implementation
description: Use when creating or refactoring Astro sections, reusable section modules, section-specific markup, or section-level CSS in this repository. Trigger for section extraction, repeated section cleanup, CTA block restructuring, and static-vs-client decisions inside Astro components.
---

# Astro Section Implementation

Build sections that stay readable, mostly static, and easy to maintain.

## Workflow

1. Inspect the nearest matching section, component, and stylesheet pattern.
2. Decide whether the work belongs in an existing family or needs one focused file.
3. Keep section data and repeated markup out of tangled template conditionals.

## Rules

- Keep markup semantic and readable.
- Prefer shared data, arrays, and focused helpers over repeated section blocks.
- Use hydration only when the section has real client behavior.
- Match the repo's CSS organization so styles remain discoverable.
- Keep responsive behavior deliberate; do not let desktop composition collapse into random mobile stacking.
- Scope scripts to the section they serve.
- Guard DOM queries and event listeners.
- Handle Astro navigation or re-entry events if the feature depends on runtime initialization.
