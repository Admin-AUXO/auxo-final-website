---
name: performance-and-motion
description: Use when adding or changing animations, smooth scrolling, carousel behavior, lazy loading, service worker behavior, hydration strategy, or other performance-sensitive front-end behavior in this Astro site. Trigger for Lenis, Embla, reveal effects, runtime media loading, and interaction code that can affect responsiveness.
---

# Performance and Motion

Fast first. Fancy second.

## Priorities

1. Preserve static delivery whenever possible.
2. Keep hydration narrow and intentional.
3. Protect LCP, input responsiveness, and scroll smoothness.
4. Respect reduced motion before styling the effect.

## Rules

- Animate emphasis, transitions, or orientation. Not everything.
- Use transform and opacity for movement when possible.
- Avoid stacked scroll listeners when CSS or existing observers can do the job.
- Re-test page transitions and re-initialization after motion changes.
- Do not fight their transforms with extra animation layers.
- Protect nested scroll regions with the appropriate Lenis escape hatch.
- Keep carousel content light and avoid heavy first-frame assets.
- Treat hero media as LCP-critical and everything else as suspect.
- Lazy-load what is not needed immediately.
- Keep fonts and third-party scripts from blocking the page.
