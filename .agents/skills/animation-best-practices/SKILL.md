---
name: High-Performance Animations (Lenis/Embla) 2026
description: Best practices for integrating Lenis smooth scrolling and Embla Carousel into Astro at 60 FPS.
---

# High-Performance Animations & Interaction (2026)

This skill dictates the exact standards required to achieve seamless, 60fps animations utilizing Lenis (for global smooth scroll) and Embla (for interactive dragging/carousels) within an "Islands Architecture" framework like Astro.

## 1. Lenis Smooth Scroll Implementation

Lenis relies heavily on `requestAnimationFrame` to delegate DOM scrolling away from the browser's default thread.

- **Initialization via Astro Client**: Because Lenis requires JS, it must be initialized carefully within Astro via a `<script>` tag at the bottom of the `<body>` or via a dedicated global client-wrapper component.
- **Calibration**:
  - Keep `lerp` low but snappy. Do not exceed normal `duration` ranges, or it will feel incredibly sluggish to the end user.
  - Disable `smoothTouch` for mobile to maintain the native iOS/Android buttery elastic scrolling feel.
- **Conflict Prevention**:
  - For any internal containers that have their own scrollbars (e.g., a modal box, a code-sidebar overflow), you **must** attach the `data-lenis-prevent` attribute to that container so Lenis does not hijack it and cause infinite scroll loops.
  - Call `lenis.destroy()` inside standard cleanup callbacks to prevent memory leaks if navigating via libraries that unmount root references.

## 2. Embla Carousel Architecture

Embla is chosen strictly for its zero-dependency minimal DOM manipulation, which is critical for Astro performance.

- **Hydration Strategy**: Because a carousel requires immediate JS calculation for dragging layout logic, hydrate it strategically:
  - Hero Slider: `client:load`
  - Below-the-fold Testimonials: `client:visible`
- **Structure**: Always adhere strictly to the `embla__viewport > embla__container > slide` structure. Avoid adding excess wrapper `<div>`s that bloat the HTML tree and slow down Embla's internal bounding box calculations.
- **Image Handling Inside Embla**: Do not let massive images load normally inside a carousel. Ensure all images are heavily optimized, using `loading="lazy"` on all slides NOT immediately visible on screen 1, preventing main thread blockage.

## 3. The 60FPS Golden Rules

- **Zero Translate Combats**: Do NOT apply custom `transform: translate()` or `transition` CSS properties to elements being managed by Embla or Lenis. They use hardware-accelerated `translate3d` natively under the hood. Forcing standard CSS transitions onto them will cause severe jank.
- **Astro View Transitions Awareness**: Be heavily aware that Astro's View Transitions API can interrupt `requestAnimationFrame` hooks. Ensure external components are re-initialized properly on the `astro:page-load` event.
- **Respect Accessibility**: You must wrap your Lenis initialization logic in a check for `window.matchMedia('(prefers-reduced-motion: reduce)')`. If a user demands reduced motion, do not load the global smooth scroll.
