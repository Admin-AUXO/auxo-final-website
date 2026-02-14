---
name: astro-component
description: Create and modify Astro components for the AUXO website following project patterns. Use when building UI components, sections, layouts, or when the user asks to create or modify Astro components.
---

# Astro Component Creation

## Component Organization

```
src/components/
├── common/           # Site-wide components (Nav, Footer, Logo)
├── effects/          # Visual effects (ParticleBackground)
├── forms/            # Form components (ContactForm)
├── interactive/      # Client-side interactive components
├── layouts/          # Layout wrappers
├── legal/            # Legal-specific components
├── navigation/       # Navigation components (NavLink, NavDropdown)
├── sections/         # Page sections organized by page
│   ├── about/
│   ├── common/
│   ├── home/
│   └── services/
├── ui/              # Reusable UI components
└── widgets/         # Special widgets (CalendarModal, CookieConsent)
```

## Standard Component Template

```astro
---
import type { HTMLAttributes } from 'astro/types';
import { Icon } from 'astro-icon/components';

export interface Props extends HTMLAttributes<'div'> {
  title?: string;
  description?: string;
  variant?: 'default' | 'primary' | 'secondary';
  class?: string;
}

const {
  title,
  description,
  variant = 'default',
  class: className = '',
  ...rest
} = Astro.props;
---

<div class={`component-wrapper ${className}`} {...rest}>
  {title && <h3 class="text-h3 font-bold text-theme-primary">{title}</h3>}
  {description && <p class="text-body-lg text-theme-secondary">{description}</p>}
  <slot />
</div>
```

## UI Component Patterns

### Button Component Pattern

Reference existing: `src/components/ui/Button.astro`

**Key features:**
- Variant system: `primary`, `secondary`, `ghost`, `outline`, `cta`
- Size system: `sm`, `md`, `lg`
- Supports both `<a>` and `<button>` tags
- Accessibility: focus states, aria-labels
- Touch-friendly min-height targets

**Usage:**
```astro
<Button variant="primary" size="md" href="/contact">
  Get Started
</Button>
```

### Card Component Pattern

Reference existing: `src/components/ui/Card.astro`

**Key features:**
- Multiple variants: `default`, `glassmorphism`, `bordered`, `highlight`, `service`, `capability`
- Flexible padding: `sm`, `md`, `lg`
- Icon support with size configuration
- Hover effects and animations
- Carousel-optimized variant

**Usage:**
```astro
<Card 
  variant="service" 
  title="Data Analytics"
  description="Transform data into insights"
  icon="mdi:chart-line"
  link="/services/analytics"
/>
```

## Styling System

### Theme Variables

Use CSS variables from global styles:

```css
/* Colors */
var(--bg-primary)
var(--bg-secondary)
var(--bg-card)
var(--bg-surface)
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)
var(--accent-green)
var(--border-color)

/* Transitions */
var(--duration-fast)
var(--duration-normal)
var(--duration-slow)
var(--timing-smooth)
```

### Tailwind Custom Classes

Available via `tailwind.config.js`:

```astro
<!-- Colors -->
<div class="bg-primary text-theme-primary">
<div class="bg-card border-theme">
<div class="text-accent-green">

<!-- Typography -->
<h1 class="font-sans">         <!-- Plus Jakarta Sans -->
<h2 class="font-display">      <!-- Plus Jakarta Sans -->

<!-- Transitions -->
<div class="transition-fast">
<div class="transition-normal">
<div class="transition-smooth">
```

### Responsive Typography

Standard text sizing:

```astro
<h1 class="text-h1">           <!-- Responsive heading 1 -->
<h2 class="text-h2">           <!-- Responsive heading 2 -->
<h3 class="text-h3">           <!-- Responsive heading 3 -->
<p class="text-body-lg">       <!-- Large body text -->
<p class="text-body-md">       <!-- Medium body text -->
<p class="text-body-base">     <!-- Base body text -->
```

## Animation & Reveal System

Use `data-reveal` attributes for scroll animations:

```astro
<div 
  data-reveal="fade-up"
  data-reveal-delay="0"
  data-reveal-duration="200"
  data-reveal-easing="ease-out"
>
  Content appears on scroll
</div>
```

**Reveal types:**
- `fade-up` - Fade in from bottom
- `fade-down` - Fade in from top
- `fade-left` - Fade in from right
- `fade-right` - Fade in from left
- `zoom-in` - Scale up from center

**Staggered animations:**
```astro
{items.map((item, index) => (
  <div 
    data-reveal="fade-up"
    data-reveal-delay={index * 100}
  >
    {item.title}
  </div>
))}
```

## Icon Usage

Icons from `astro-icon` package (MDI and Simple Icons):

```astro
---
import { Icon } from 'astro-icon/components';
---

<!-- MDI Icons -->
<Icon name="mdi:chart-line" class="w-6 h-6 text-accent-green" />
<Icon name="mdi:database" class="w-8 h-8" />

<!-- Simple Icons (brands) -->
<Icon name="simple-icons:python" class="w-6 h-6" />
<Icon name="simple-icons:postgresql" class="w-6 h-6" />
```

Available icons defined in `astro.config.mjs` under `icon.include`.

## Client-Side Hydration

Use appropriate hydration directives:

```astro
<!-- Load immediately on page load -->
<Component client:load />

<!-- Load when component becomes visible -->
<Component client:visible />

<!-- Load when browser is idle -->
<Component client:idle />

<!-- Load only on specific media query -->
<Component client:media="(max-width: 768px)" />

<!-- Don't hydrate at all (static only) -->
<Component />
```

**Best practice:** Use `client:visible` for below-fold interactive components.

## TypeScript Integration

### Props with Type Safety

```astro
---
interface Props {
  title: string;
  items: Array<{
    id: string;
    name: string;
    value: number;
  }>;
  optional?: boolean;
}

const { title, items, optional = false } = Astro.props;
---
```

### Sanity CMS Content Types

```astro
---
import type { HomepageData } from '@/lib/sanity/types';

interface Props {
  content: HomepageData['hero'];
}

const { content } = Astro.props;
---

<h1>{content.title}</h1>
<p>{content.subtitle}</p>
```

## Section Component Pattern

Sections should follow this structure:

```astro
---
interface Props {
  content: {
    title: string;
    description?: string;
    items?: Array<any>;
  };
}

const { content } = Astro.props;
---

<section 
  id="section-name" 
  class="section py-16 sm:py-20 lg:py-24"
>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center max-w-3xl mx-auto mb-12">
      <h2 class="text-h2 font-bold text-theme-primary mb-4">
        {content.title}
      </h2>
      {content.description && (
        <p class="text-body-lg text-theme-secondary">
          {content.description}
        </p>
      )}
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.items?.map((item, index) => (
        <div 
          data-reveal="fade-up" 
          data-reveal-delay={index * 100}
        >
          <!-- Item content -->
        </div>
      ))}
    </div>
  </div>
</section>
```

## Common Layout Patterns

### Container Width

```astro
<!-- Standard container -->
<div class="container mx-auto px-4 sm:px-6 lg:px-8">

<!-- Narrow container (for text) -->
<div class="max-w-3xl mx-auto px-4">

<!-- Wide container -->
<div class="max-w-7xl mx-auto px-4">

<!-- Full width -->
<div class="w-full px-4">
```

### Grid Layouts

```astro
<!-- 2 columns on tablet, 3 on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- 4 columns on large screens -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

<!-- Auto-fit with minimum width -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
```

### Flexbox Layouts

```astro
<!-- Center aligned -->
<div class="flex items-center justify-center gap-4">

<!-- Space between -->
<div class="flex items-center justify-between">

<!-- Vertical stack -->
<div class="flex flex-col gap-4">

<!-- Responsive direction -->
<div class="flex flex-col md:flex-row gap-6">
```

## Accessibility Checklist

- [ ] Use semantic HTML (`<section>`, `<article>`, `<nav>`)
- [ ] Add `aria-label` to icon-only buttons
- [ ] Include alt text for images
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus states visible
- [ ] Skip links for navigation

## Performance Best Practices

- Lazy load images: `loading="lazy"`
- Use `OptimizedImage` component for responsive images
- Minimize client-side JS with `client:visible`
- Avoid large inline SVGs (use Icon component)
- Keep scoped styles minimal
- Defer non-critical scripts

## Common Component Imports

```astro
---
import { Icon } from 'astro-icon/components';
import Button from '@/components/ui/Button.astro';
import Card from '@/components/ui/Card.astro';
import OptimizedImage from '@/components/ui/OptimizedImage.astro';
import HighlightText from '@/components/ui/HighlightText.astro';
---
```

## Debugging Tips

**View compiled output:**
```bash
npm run build
# Check dist/ folder for compiled HTML/CSS/JS
```

**Check for hydration issues:**
```typescript
// Add to component script
console.log('Component hydrated', Astro.props);
```

**Validate props:**
```astro
---
const { title } = Astro.props;
if (!title) {
  throw new Error('Title prop is required');
}
---
```
