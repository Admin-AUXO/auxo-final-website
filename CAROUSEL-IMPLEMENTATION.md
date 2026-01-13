# Carousel Implementation Guide

## Working Pattern (DO NOT MODIFY)

The carousel implementation follows a specific hierarchy that ensures proper overflow behavior on mobile devices with peek effects.

### CSS Structure

```
Section Wrapper (e.g., .impact-carousel-section)
  ├─ overflow: visible (allows peek on sides)
  │
  └─ Carousel Viewport (.carousel-viewport)
      ├─ overflow: visible (allows content extension)
      ├─ touch-action: none (on mobile)
      │
      └─ Carousel Container (.carousel-container.embla)
          ├─ overflow: hidden (clips the draggable area)
          ├─ touch-action: pan-x pinch-zoom (on mobile)
          │
          └─ Carousel Track (.carousel-track.embla__container)
              ├─ display: flex
              ├─ overflow: visible (allows slides to extend)
              ├─ width: max-content
              └─ touch-action: pan-x pinch-zoom (on mobile)
```

### Key Principles

1. **Viewport** (`carousel-viewport`): 
   - MUST have `overflow: visible` to allow peek effect
   - `touch-action: none` on mobile to prevent scrolling conflicts

2. **Container** (`carousel-container`): 
   - MUST have `overflow: hidden` to clip the embla draggable area
   - `touch-action: pan-x pinch-zoom` for proper swipe handling

3. **Track** (`carousel-track`): 
   - MUST have `overflow: visible` so slides can extend beyond bounds
   - `display: flex` with `width: max-content` for proper layout

### Files

- **Main Carousel CSS**: `src/styles/components/carousels.css`
- **Overflow Management**: `src/styles/critical-overflows.css`
- **Section-Specific**: `src/styles/sections/*.css` (for specific carousel variants)
- **Carousel Script**: `src/scripts/animations/EmblaCarousel.ts`
- **Component**: `src/components/ui/Carousel.astro`

### Verified Working Carousels

All carousels use the same pattern and work correctly:

1. **Industries Carousel** (Services page) - `.impact-carousel-*`
2. **Services Intro Carousel** (Homepage) - `.services-intro-carousel-section`
3. **Capabilities Carousel** (Homepage) - `.capabilities-carousel-section`
4. **Mission/Vision Carousel** (About page) - `.mission-vision-carousel-section`
5. **CODE Principles Carousel** (About page) - `.approach-carousel-section`
6. **Global Metrics Carousel** (About page) - `.global-metrics-carousel-section`
7. **Service Benefits Carousel** (Service detail pages) - `.service-benefits-carousel-section`
8. **Service Process Carousel** (Service detail pages) - `.service-process-carousel-section`

### Mobile Behavior (width <= 767px)

```css
@media (width <= 767px) {
  /* Section and viewport allow content to peek */
  [class*="-carousel-section"],
  .carousel-viewport {
    overflow: visible !important;
    touch-action: none !important;
  }

  /* Container clips and handles pan gestures */
  .carousel-container {
    overflow: hidden !important;
    touch-action: pan-x pinch-zoom !important;
    overscroll-behavior: contain auto !important;
  }

  /* Track allows slides to extend */
  .carousel-track {
    overflow: visible !important;
    touch-action: pan-x pinch-zoom !important;
  }

  /* Slides handle touch properly */
  .embla__slide {
    touch-action: pan-x !important;
  }
}
```

### What NOT To Do

❌ Do NOT set `overflow: hidden clip` or `overflow-x: clip` on carousel sections
❌ Do NOT set `overflow: hidden` on the viewport
❌ Do NOT remove the specific mobile touch-action rules
❌ Do NOT consolidate "duplicate" CSS without understanding the cascade
❌ Do NOT assume generic rules will work - section-specific overrides are intentional

### Testing Checklist

When verifying carousel functionality on mobile:

- [ ] One card is centered
- [ ] Parts of adjacent cards are visible on both sides (peek effect)
- [ ] Swiping left/right works smoothly
- [ ] Cards remain visible throughout the swipe animation
- [ ] No cards get clipped or disappear
- [ ] Autoplay works without causing cards to vanish
- [ ] Touch gestures don't conflict with page scrolling

### Debugging

If a carousel is broken:

1. Check that the section has `overflow: visible`
2. Verify viewport has `overflow: visible`
3. Confirm container has `overflow: hidden`
4. Ensure track has `overflow: visible` and `width: max-content`
5. Check mobile-specific touch-action rules are applied
6. Verify no conflicting CSS is overriding these rules in critical-overflows.css

## References

- Embla Carousel Docs: https://www.embla-carousel.com/
- Working commit: c243d5c (Revert of incorrect optimization)
- Last verified: January 13, 2026
