---
name: tailwind-ui
description: Build responsive UI components using Tailwind CSS patterns for the AUXO website. Use when creating layouts, styling components, implementing responsive design, or when the user asks about Tailwind usage or design system.
---

# Tailwind UI Design Patterns

## Design System Overview

AUXO website uses a custom design system built on Tailwind CSS with:
- CSS custom properties for theming
- Responsive typography scale
- Consistent spacing system
- Dark mode support
- Glassmorphism effects

## Color System

### Theme Colors (CSS Variables)

Colors adapt automatically for light/dark mode:

```css
/* Backgrounds */
--bg-primary         /* Main background */
--bg-secondary       /* Secondary background */
--bg-card            /* Card backgrounds */
--bg-surface         /* Surface elements */
--bg-elevated        /* Elevated surfaces */

/* Text */
--text-primary       /* Primary text */
--text-secondary     /* Secondary text */
--text-tertiary      /* Tertiary text */
--text-on-accent     /* Text on accent backgrounds */

/* Accent */
--accent-green       /* Primary brand color */

/* Borders */
--border-color       /* Standard border */
--border-color-light /* Light border */
```

### Tailwind Classes

Use semantic classes from `tailwind.config.js`:

```astro
<!-- Backgrounds -->
<div class="bg-primary">
<div class="bg-secondary">
<div class="bg-card">
<div class="bg-surface">
<div class="bg-elevated">

<!-- Text -->
<p class="text-theme-primary">
<p class="text-theme-secondary">
<p class="text-theme-tertiary">
<span class="text-accent-green">

<!-- Borders -->
<div class="border border-theme">
<div class="border border-theme-light">
```

## Typography System

### Font Families

```css
font-sans      /* Plus Jakarta Sans - body text */
font-display   /* Plus Jakarta Sans - headings */
font-mono      /* Monospace - code/metrics */
```

### Heading Classes

Responsive heading sizes:

```astro
<h1 class="text-h1">    <!-- 2.5rem → 4rem responsive -->
<h2 class="text-h2">    <!-- 2rem → 3rem responsive -->
<h3 class="text-h3">    <!-- 1.5rem → 2rem responsive -->
<h4 class="text-h4">    <!-- 1.25rem → 1.5rem responsive -->
```

### Body Text Classes

```astro
<p class="text-body-xl">    <!-- Extra large body -->
<p class="text-body-lg">    <!-- Large body -->
<p class="text-body-md">    <!-- Medium body -->
<p class="text-body-base">  <!-- Base body -->
<p class="text-body-sm">    <!-- Small body -->
```

### Font Weights

```astro
<span class="font-light">      <!-- 300 -->
<span class="font-normal">     <!-- 400 -->
<span class="font-medium">     <!-- 500 -->
<span class="font-semibold">   <!-- 600 -->
<span class="font-bold">       <!-- 700 -->
<span class="font-extrabold">  <!-- 800 -->
```

## Spacing System

Consistent spacing using Tailwind's scale:

```astro
<!-- Padding -->
<div class="p-4">        <!-- 1rem (16px) -->
<div class="p-6">        <!-- 1.5rem (24px) -->
<div class="p-8">        <!-- 2rem (32px) -->
<div class="px-4 py-6">  <!-- Horizontal 1rem, Vertical 1.5rem -->

<!-- Margin -->
<div class="m-4 mt-8 mb-6">  <!-- Multiple directions -->

<!-- Gap (for flex/grid) -->
<div class="flex gap-4">
<div class="grid gap-6 lg:gap-8">
```

**Common spacing values:**
- `4` = 1rem (16px)
- `6` = 1.5rem (24px)
- `8` = 2rem (32px)
- `12` = 3rem (48px)
- `16` = 4rem (64px)
- `20` = 5rem (80px)
- `24` = 6rem (96px)

## Responsive Design

### Breakpoint System

```css
sm:   640px   /* Small tablets */
md:   768px   /* Tablets */
lg:   1024px  /* Small laptops */
xl:   1280px  /* Desktops */
2xl:  1536px  /* Large desktops */
```

### Mobile-First Approach

Always design mobile-first, add larger breakpoints:

```astro
<!-- Base (mobile): single column, small text -->
<div class="text-base p-4 flex flex-col gap-4">
  
<!-- Tablet: 2 columns, larger text -->
<div class="sm:text-lg sm:p-6 md:grid md:grid-cols-2 md:gap-6">
  
<!-- Desktop: 3 columns, even larger -->
<div class="lg:text-xl lg:p-8 lg:grid-cols-3 lg:gap-8">
```

### Responsive Patterns

**Typography:**
```astro
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
<p class="text-base sm:text-lg lg:text-xl">
```

**Spacing:**
```astro
<section class="py-12 sm:py-16 lg:py-20">
<div class="px-4 sm:px-6 lg:px-8">
```

**Grid:**
```astro
<!-- 1 col mobile, 2 tablet, 3 desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- 2 col mobile, 3 tablet, 4 desktop -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

**Flexbox:**
```astro
<!-- Stack mobile, row desktop -->
<div class="flex flex-col lg:flex-row gap-6">

<!-- Different alignment per breakpoint -->
<div class="flex justify-center lg:justify-between items-start lg:items-center">
```

## Card Patterns

### Basic Card

```astro
<div class="bg-card border border-theme rounded-lg p-6">
  <h3 class="text-h4 font-semibold mb-2">Title</h3>
  <p class="text-body-md text-theme-secondary">Description</p>
</div>
```

### Glassmorphism Card

```astro
<div class="glassmorphism-card bg-card border-2 border-accent-green/15 rounded-xl p-6">
  <!-- Content -->
</div>
```

### Hover Effects

```astro
<div class="
  bg-card border border-theme rounded-lg p-6
  hover:border-accent-green/50 
  hover:shadow-lg 
  transition-all duration-300
">
  <!-- Content -->
</div>
```

### Card with Icon

```astro
<div class="bg-card border border-theme rounded-lg p-6">
  <div class="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center mb-4">
    <Icon name="mdi:chart-line" class="w-6 h-6 text-accent-green" />
  </div>
  <h3 class="text-h4 font-semibold mb-2">Title</h3>
  <p class="text-body-md text-theme-secondary">Description</p>
</div>
```

## Button Patterns

### Variants

```astro
<!-- Primary -->
<button class="btn-primary px-6 py-3 rounded-lg font-semibold">
  Primary Action
</button>

<!-- Secondary -->
<button class="btn-secondary px-6 py-3 rounded-lg font-semibold">
  Secondary
</button>

<!-- Outline -->
<button class="btn-outline px-6 py-3 rounded-lg font-semibold">
  Outline
</button>

<!-- Ghost -->
<button class="btn-ghost px-6 py-3 rounded-lg font-semibold">
  Ghost
</button>
```

### With Icons

```astro
<button class="btn-primary px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2">
  <Icon name="mdi:arrow-right" class="w-5 h-5" />
  <span>Get Started</span>
</button>
```

### Sizes

```astro
<!-- Small -->
<button class="px-4 py-2 text-sm">Small</button>

<!-- Medium -->
<button class="px-6 py-3 text-base">Medium</button>

<!-- Large -->
<button class="px-8 py-4 text-lg">Large</button>
```

## Layout Patterns

### Container Widths

```astro
<!-- Standard container -->
<div class="container mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Max width from Tailwind defaults -->
</div>

<!-- Narrow (text content) -->
<div class="max-w-3xl mx-auto px-4">
  <!-- 768px max width -->
</div>

<!-- Wide -->
<div class="max-w-7xl mx-auto px-4">
  <!-- 1280px max width -->
</div>

<!-- Prose (articles) -->
<div class="prose prose-lg max-w-prose mx-auto">
  <!-- Optimized for reading -->
</div>
```

### Section Spacing

```astro
<section class="py-16 sm:py-20 lg:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Content -->
  </div>
</section>
```

### Grid Layouts

```astro
<!-- Equal columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Items -->
</div>

<!-- Auto-fit with min width -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
  <!-- Responsive without breakpoints -->
</div>

<!-- Asymmetric -->
<div class="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
  <!-- 2:1 ratio on large screens -->
</div>
```

### Flexbox Layouts

```astro
<!-- Center everything -->
<div class="flex items-center justify-center min-h-screen">
  <!-- Vertically and horizontally centered -->
</div>

<!-- Space between -->
<div class="flex items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>

<!-- Wrap -->
<div class="flex flex-wrap gap-4">
  <!-- Items wrap to next line -->
</div>

<!-- Vertical stack -->
<div class="flex flex-col gap-4">
  <!-- Stacked with gap -->
</div>
```

## Visual Effects

### Gradients

```astro
<!-- Background gradient -->
<div class="bg-gradient-to-r from-accent-green/20 to-transparent">

<!-- Text gradient -->
<span class="bg-gradient-to-r from-accent-green to-accent-green/70 bg-clip-text text-transparent">
  Gradient Text
</span>

<!-- Border gradient (via shadow) -->
<div class="border-2 border-transparent bg-gradient-to-r from-accent-green/20 to-accent-green/5 bg-origin-border">
```

### Shadows

```astro
<!-- Small shadow -->
<div class="shadow-sm">

<!-- Medium shadow -->
<div class="shadow-md">

<!-- Large shadow -->
<div class="shadow-lg">

<!-- Colored shadow -->
<div class="shadow-lg shadow-accent-green/20">

<!-- Hover shadow -->
<div class="hover:shadow-xl hover:shadow-accent-green/30 transition-shadow">
```

### Glassmorphism

```astro
<div class="glassmorphism-card backdrop-blur-md bg-white/10 border border-white/20">
  <!-- Glass effect -->
</div>
```

### Blur & Backdrop

```astro
<!-- Blur background -->
<div class="backdrop-blur-sm">   <!-- Small blur -->
<div class="backdrop-blur-md">   <!-- Medium blur -->
<div class="backdrop-blur-lg">   <!-- Large blur -->

<!-- Filter blur -->
<div class="blur-sm">            <!-- Blur element itself -->
```

## Transition & Animation

### Transition Classes

```astro
<!-- Basic transition -->
<div class="transition-all duration-300">

<!-- Specific properties -->
<div class="transition-colors duration-200">
<div class="transition-transform duration-300">
<div class="transition-opacity duration-500">

<!-- Custom durations from config -->
<div class="transition-fast">     <!-- var(--duration-fast) -->
<div class="transition-normal">   <!-- var(--duration-normal) -->
<div class="transition-slow">     <!-- var(--duration-slow) -->

<!-- Easing -->
<div class="transition-smooth">   <!-- var(--timing-smooth) -->
<div class="ease-in-out">
<div class="ease-out">
```

### Hover Transforms

```astro
<!-- Scale up -->
<div class="hover:scale-105 transition-transform">

<!-- Scale down -->
<div class="hover:scale-95 transition-transform">

<!-- Translate -->
<div class="hover:translate-y-1 transition-transform">
<div class="hover:-translate-y-1 transition-transform">

<!-- Rotate -->
<div class="hover:rotate-6 transition-transform">

<!-- Combine -->
<div class="hover:scale-110 hover:rotate-3 transition-transform">
```

### Opacity

```astro
<!-- Set opacity -->
<div class="opacity-0">       <!-- Invisible -->
<div class="opacity-50">      <!-- 50% -->
<div class="opacity-100">     <!-- Visible -->

<!-- Hover opacity -->
<div class="opacity-0 hover:opacity-100 transition-opacity">
```

## Dark Mode

### Dark Mode Classes

```astro
<!-- Light/dark variants -->
<div class="bg-white dark:bg-gray-900">
<p class="text-gray-900 dark:text-gray-100">

<!-- Using theme variables (auto-adapts) -->
<div class="bg-primary text-theme-primary">
```

### Dark Mode Strategy

**Preferred:** Use CSS variables that change in dark mode

```astro
<!-- This automatically adapts -->
<div class="bg-card text-theme-primary border-theme">
```

**Alternative:** Explicit dark classes

```astro
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

## Accessibility

### Focus States

```astro
<button class="
  focus:outline-none 
  focus-visible:ring-2 
  focus-visible:ring-accent-green 
  focus-visible:ring-offset-2
">
  Accessible Button
</button>
```

### Screen Reader Only

```astro
<span class="sr-only">
  Screen reader only text
</span>
```

### Touch Targets

```astro
<!-- Minimum 44px touch target -->
<button class="min-h-[var(--touch-target-min)] min-w-[var(--touch-target-min)]">
  Touch Friendly
</button>
```

## Performance Tips

- Use `will-change-transform` sparingly on animated elements
- Avoid animating properties that trigger layout recalculation
- Use `transform` and `opacity` for animations (GPU accelerated)
- Minimize custom CSS, leverage Tailwind utilities
- Purge unused classes via `content` config

## Common Utility Combinations

### Card with hover effect:
```astro
<div class="bg-card border border-theme rounded-xl p-6 hover:border-accent-green/50 hover:shadow-lg transition-all duration-300">
```

### Centered content section:
```astro
<section class="py-20">
  <div class="max-w-3xl mx-auto px-4 text-center">
    <h2 class="text-h2 font-bold mb-6">Heading</h2>
    <p class="text-body-lg text-theme-secondary">Description</p>
  </div>
</section>
```

### Button with icon and hover:
```astro
<button class="btn-primary px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 hover:scale-105 transition-transform">
  <span>Action</span>
  <Icon name="mdi:arrow-right" class="w-5 h-5" />
</button>
```

### Responsive grid with gaps:
```astro
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
```
