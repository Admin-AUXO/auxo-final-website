---
name: performance-and-motion
description: Use when adding or changing animations, smooth scrolling, carousel behavior, media loading, hydration strategy, or other performance-sensitive front-end behavior in this Astro site.
---

# Performance and Motion

Fast first. Fancy second. If an effect costs clarity, battery, or frame rate, kill it.

## Performance Priorities

1. Preserve static delivery whenever possible.
2. Keep hydration narrow and intentional.
3. Protect LCP, input responsiveness, and scroll smoothness.
4. Respect reduced motion before styling the effect.

## Motion Rules

- Animate emphasis, transitions, or orientation. Not everything.
- Use transform and opacity for movement when possible.
- Avoid stacked scroll listeners when CSS or existing observers can do the job.
- Re-test page transitions and re-initialization after motion changes.

## Lenis and Embla

- Do not fight their transforms with extra animation layers.
- Protect nested scroll regions with the appropriate Lenis escape hatch.
- Keep carousel content light and avoid heavy first-frame assets.

## Media and Asset Rules

- Treat hero media as LCP-critical and everything else as suspect.
- Lazy-load what is not needed immediately.
- Keep fonts and third-party scripts from blocking the page.

## Verification

- Check reduced motion behavior.
- Check scroll feel on desktop and mobile.
- Check that animation still works after Astro navigation.
- Run lint and build before claiming the change is safe.
