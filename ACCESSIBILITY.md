# Accessibility Guidelines - WCAG AAA Compliance

This document outlines the accessibility standards and testing procedures for the AUXO Data Labs website.

## Compliance Target: WCAG 2.1 Level AAA

### Color Contrast (1.4.6 - AAA)

**Requirement**: Text contrast ratio of at least 7:1 for normal text, 4.5:1 for large text.

**Implementation**:
- Primary text on background: 7:1 minimum
- Secondary text on background: 7:1 minimum
- Interactive elements (buttons, links): 7:1 minimum
- Large text (18pt+ or 14pt+ bold): 4.5:1 minimum

**Testing**:
```bash
# Use browser DevTools or automated tools
npm install -g pa11y
pa11y --standard WCAG2AAA http://localhost:4321
```

### Focus Indicators (2.4.7 - AAA)

**Implementation**:
- Minimum 2px outline for all focusable elements
- 3px outline for interactive elements (buttons, links)
- High contrast outline color (--accent-green)
- Outline offset of 2-3px for clarity
- Enhanced visible focus for keyboard navigation

**CSS Location**: `src/styles/base/accessibility.css`

### Heading Hierarchy (1.3.1 - A, 2.4.10 - AAA)

**Rules**:
- Single `<h1>` per page (page title)
- Logical heading order (h1 → h2 → h3, no skipping)
- Headings describe content sections accurately

**Audit Checklist**:
- [ ] Homepage has one H1
- [ ] Services pages have logical hierarchy
- [ ] About page follows structure
- [ ] Blog posts use semantic headings
- [ ] No decorative headings (use CSS for styling)

### Keyboard Navigation (2.1.1 - A, 2.1.3 - AAA)

**Requirements**:
- All interactive elements reachable via Tab
- Logical tab order (matches visual flow)
- No keyboard traps
- Visible focus indicators
- Shortcuts don't conflict with assistive tech

**Implementation**:
```html
<!-- Skip to main content link -->
<a href="#main-content" class="skip-to-main">Skip to main content</a>

<!-- Main landmark -->
<main id="main-content" tabindex="-1">
  <!-- Page content -->
</main>
```

**Testing**:
1. Use Tab to navigate through page
2. Verify focus order matches reading order
3. Test Shift+Tab for reverse navigation
4. Verify modals trap focus
5. Test with screen reader (NVDA, JAWS, VoiceOver)

### ARIA Labels and Landmarks (1.3.1 - A, 4.1.2 - A)

**Implementation**:
```html
<!-- Landmarks -->
<header role="banner">
<nav role="navigation" aria-label="Main navigation">
<main role="main" id="main-content">
<aside role="complementary" aria-label="Related content">
<footer role="contentinfo">

<!-- Interactive elements -->
<button aria-label="Close modal" aria-pressed="false">
<div role="alert" aria-live="assertive">Error message</div>
<div role="status" aria-live="polite">Loading...</div>

<!-- Forms -->
<label for="email">Email Address</label>
<input id="email" type="email" aria-required="true" aria-describedby="email-help">
<span id="email-help" class="sr-only">Enter a valid email address</span>
```

### Screen Reader Support

**Tested with**:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS, iOS)
- TalkBack (Android)

**Screen Reader Only Content**:
```html
<span class="sr-only">Additional context for screen readers</span>
```

### Touch Target Size (2.5.5 - AAA)

**Requirement**: Minimum 44x44px for touch targets

**Implementation**:
- All buttons: min-height/width 44px on mobile
- Links in navigation: adequate padding
- Form controls: minimum 44px height
- Icon buttons: 44x44px minimum

**CSS Location**: `src/styles/base/accessibility.css` (media query for coarse pointers)

### Motion and Animations (2.3.3 - AAA)

**Implementation**:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Application**:
- All CSS animations
- JavaScript scroll animations
- Particle background
- Smooth scroll (Lenis)
- Carousel transitions

### Alternative Text (1.1.1 - A)

**Rules**:
- Decorative images: `alt=""`
- Informative images: Descriptive alt text
- Complex images: Extended description
- Icons with meaning: ARIA labels

**Examples**:
```html
<!-- Decorative -->
<img src="/decorative-pattern.svg" alt="" role="presentation">

<!-- Informative -->
<img src="/chart.png" alt="Revenue growth chart showing 45% increase">

<!-- Icon button -->
<button aria-label="Open navigation menu">
  <svg aria-hidden="true">...</svg>
</button>
```

### Form Accessibility

**Requirements**:
- Visible labels for all inputs
- Error messages announced to screen readers
- Success feedback accessible
- Required fields indicated
- Validation errors clear and actionable

**Implementation**:
```html
<form>
  <div class="form-group">
    <label for="name">
      Name <span aria-label="required">*</span>
    </label>
    <input
      id="name"
      type="text"
      required
      aria-required="true"
      aria-invalid="false"
      aria-describedby="name-error"
    >
    <div id="name-error" role="alert" aria-live="assertive" class="error-message" style="display: none;">
      <!-- Error message appears here -->
    </div>
  </div>
</form>
```

### Live Regions

**Usage**:
- Form validation errors: `aria-live="assertive"`
- Loading states: `aria-live="polite"`
- Success messages: `aria-live="polite"`
- Dynamic content updates: `aria-live="polite"`

**Examples**:
```html
<!-- Assertive for critical updates -->
<div role="alert" aria-live="assertive">
  Form submission failed. Please try again.
</div>

<!-- Polite for non-critical updates -->
<div role="status" aria-live="polite" aria-atomic="true">
  3 new items added to your cart.
</div>
```

## Testing Checklist

### Automated Testing

```bash
# Install testing tools
npm install -g pa11y lighthouse axe-core

# Run tests
pa11y --standard WCAG2AAA http://localhost:4321
lighthouse http://localhost:4321 --only-categories=accessibility
npx @axe-core/cli http://localhost:4321
```

### Manual Testing

**Keyboard Navigation**:
- [ ] Tab through all interactive elements
- [ ] Focus order is logical
- [ ] All buttons/links reachable
- [ ] No keyboard traps
- [ ] Skip to main content works
- [ ] Modal focus trapping works
- [ ] Dropdown menus accessible

**Screen Reader**:
- [ ] Page title announced
- [ ] Landmarks identified
- [ ] Headings navigable
- [ ] Images have alt text
- [ ] Form labels associated
- [ ] Error messages announced
- [ ] Dynamic content updates announced

**Visual**:
- [ ] Text meets 7:1 contrast ratio
- [ ] Focus indicators visible (2px minimum)
- [ ] Text resizable to 200% without loss
- [ ] No horizontal scrolling at 200% zoom
- [ ] Color not sole indicator of meaning

**Mobile/Touch**:
- [ ] Touch targets minimum 44x44px
- [ ] Gestures have alternatives
- [ ] Orientation changes supported
- [ ] Pinch zoom enabled

### Browser Testing

Test in:
- Chrome + NVDA (Windows)
- Firefox + NVDA (Windows)
- Safari + VoiceOver (macOS)
- Safari + VoiceOver (iOS)
- Chrome + TalkBack (Android)

## Common Issues and Fixes

### Issue: Low Color Contrast
**Fix**: Use CSS custom properties with AAA-compliant values
```css
:root {
  --text-primary: #ffffff; /* On dark background */
  --text-secondary: #e5e7eb; /* Meets 7:1 on dark */
  --bg-primary: #0a0a0a;
}
```

### Issue: Missing Focus Indicators
**Fix**: Applied in `accessibility.css`

### Issue: Unlabeled Form Fields
**Fix**:
```html
<!-- Bad -->
<input type="text" placeholder="Email">

<!-- Good -->
<label for="email">Email</label>
<input id="email" type="email">
```

### Issue: Decorative Images with Alt Text
**Fix**:
```html
<!-- Bad -->
<img src="/pattern.svg" alt="Green pattern">

<!-- Good -->
<img src="/pattern.svg" alt="" role="presentation">
```

### Issue: Inaccessible Icon Buttons
**Fix**:
```html
<!-- Bad -->
<button><svg>...</svg></button>

<!-- Good -->
<button aria-label="Close menu">
  <svg aria-hidden="true">...</svg>
</button>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)

## Maintenance

Run accessibility audits:
- Before each major release
- After significant UI changes
- Monthly automated scans
- Quarterly manual testing

Report issues in GitHub with `a11y` label.
