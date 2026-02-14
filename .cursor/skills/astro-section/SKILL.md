---
name: astro-section
description: Create new page sections for the AUXO Astro website following established patterns. Use when building new sections, components, or layouts for the homepage, services, or about pages.
---

# Astro Section Creation

## Component Structure

Sections live in `src/components/sections/{page}/` organized by page:

```
src/components/sections/
├── home/          # Homepage sections
├── services/      # Services page sections
├── about/         # About page sections
└── common/        # Shared sections (CTA, etc.)
```

## Standard Section Template

```astro
---
import type { ContentType } from "@/types/content";

interface Props {
  content: ContentType["sectionName"];
}

const { content } = Astro.props;
---

<section 
  id="section-id" 
  class="section py-16 sm:py-20 lg:py-24"
>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Section content -->
  </div>
</section>
```

## Key Patterns

### Reveal Animations

Add scroll reveal attributes:

```astro
<div 
  data-reveal="fade-up" 
  data-reveal-delay="0" 
  data-reveal-duration="200"
>
  Content
</div>
```

**Reveal types**: `fade-up`, `fade-down`, `fade-left`, `fade-right`, `zoom-in`

### Responsive Typography

Use theme utility classes:

```astro
<h2 class="text-h2 font-bold text-theme-primary">
  Headline
</h2>
<p class="text-body-lg text-theme-secondary">
  Description
</p>
```

**Size classes**: `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body-md`

### Text Highlighting

For content with inline highlights:

```astro
<p class="text-body-lg">
  {content.description}
  {content.descriptionHighlight?.map((highlight: string) => (
    <span class="highlight-gradient">{highlight}</span>
  ))}
</p>
```

### Grid Layouts

Standard responsive grid:

```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
  {items.map((item) => (
    <div class="card">
      <!-- Card content -->
    </div>
  ))}
</div>
```

### Cards with Icons

```astro
<div class="card bg-theme-surface border border-theme-border rounded-lg p-6">
  <div class="icon-wrapper mb-4">
    <Icon name={`mdi:${item.icon}`} class="w-8 h-8 text-theme-accent" />
  </div>
  <h3 class="text-h4 font-semibold mb-2">{item.title}</h3>
  <p class="text-body-md text-theme-secondary">{item.description}</p>
</div>
```

## Component Imports

Common imports for sections:

```astro
---
import { Icon } from "astro-icon/components";
import Button from "@/components/ui/Button.astro";
import OptimizedImage from "@/components/ui/OptimizedImage.astro";
---
```

## Carousel Sections

For sections with Embla carousel:

```astro
<div class="embla relative" data-carousel="section-name">
  <div class="embla__viewport overflow-hidden">
    <div class="embla__container flex">
      {items.map((item) => (
        <div class="embla__slide flex-[0_0_100%] min-w-0 px-4">
          <!-- Slide content -->
        </div>
      ))}
    </div>
  </div>
  <button class="embla__prev" aria-label="Previous">←</button>
  <button class="embla__next" aria-label="Next">→</button>
</div>
```

Initialize in `src/scripts/sections/utils/carouselConfigs.ts`.

## Performance

- Use `loading="lazy"` for below-fold images
- Minimize client-side scripts
- Use `client:visible` for interactive components
- Avoid `client:load` unless necessary

## Accessibility

- Use semantic HTML (`<section>`, `<article>`, `<nav>`)
- Include ARIA labels for interactive elements
- Ensure sufficient color contrast
- Test keyboard navigation

## Styling

Follow Tailwind-first approach:

- Use theme variables (`text-theme-primary`, `bg-theme-surface`)
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Spacing scale: `gap-4`, `p-6`, `mb-8`
- Custom CSS only when necessary in scoped `<style>` tags

## Layout Integration

Import and use sections in page files:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import HeroSection from "@/components/sections/home/HeroSection.astro";
import { homepageData } from "@/lib/sanity/data";

const content = await homepageData();
---

<BaseLayout title="Home">
  <HeroSection content={content.hero} />
  <!-- More sections -->
</BaseLayout>
```
