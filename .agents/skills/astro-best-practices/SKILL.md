---
name: Astro Best Practices & Code Optimizations (2026)
description: Guidelines for building high-performance, content-driven websites using Astro in 2026.
---

# Astro Best Practices & Code Optimizations (2026)

This skill provides architectural guidelines and performance optimization strategies for Astro applications in 2026. Astro’s core philosophy is "zero JavaScript by default" and leveraging the "Islands Architecture" to deliver incredibly fast websites.

## 1. Core Architecture & Hydration

Astro's biggest advantage is its ability to strip out JavaScript. You should lean heavily into this.

- **Islands Architecture**: Render majority of the page as static HTML. Only use UI framework components (React, Vue, Svelte, solid) for interactive "islands".
- **Strategic Hydration**: Do not use `client:load` unless a component is immediately visible and required for initial interaction.
  - `client:idle`: For non-critical components that can wait for the main thread to be free.
  - `client:visible`: For components "below the fold" that should only hydrate when the user scrolls to them. Ensure interactive MDX components like charts are securely gated behind `client:visible` so they don't block main thread parsing on mobile.
  - `client:media`: For components that only need hydration on specific screen sizes (e.g., mobile navigation menus).
  - `client:only`: Use only when a component relies entirely on browser APIs and cannot be server-rendered.

## 2. Content & Data Management

- **Content Collections & Live Collections**: Always use Astro Content Collections (introduced and matured in Astro 5/6) for Markdown/MDX content. This provides strict TypeScript validation, autocomplete, and better performance for content heavy sites.
- **Data Fetching Optimization**:
  - If using `getStaticPaths()`, ensure data is fetched once at build time to prevent slow build times.
  - Avoid heavy API calls in child components unless explicitly made client-side.
- **HTML Streaming (SSR)**: Structure layout components to avoid blocking data fetches high up in the tree, enabling `head`, `body`, and `h2` elements to render and stream to the browser sooner.

## 3. Performance & Asset Optimization

- **Establish a Baseline**: Run regular audits to capture output sizes and use dedicated performance builds to log bundle budgets and test regressions.
- **Image & Media Optimization**: Always use the native `<Image />` component. Set `fetchpriority="high"` strictly for Hero or Critical LCP images, and keep the rest lazy-loaded. Move very heavy assets (videos) to external object storage/CDNs (like Cloudflare R2).
- **Font Strategy**: explicitly set `font-display: swap` for Web Fonts so users don't face layout shifts. Bundle and self-host fonts instead of using blocking third-party requests whenever possible.
- **Third-party scripts**: Guard all third party trackers and analytics. Put them in wrappers that only load upon explicit user consent or delayed user interaction.

## 4. Rendering Strategies

Astro provides flexible rendering options. Choose the right one for each page:

- **Static Site Generation (SSG)**: Default. Best for blogs, documentation, and marketing pages.
- **Server-Side Rendering (SSR)**: Enable for pages requiring authentication, dynamic user data, or real-time information.
- **Hybrid Rendering**: Mix SSG and SSR components appropriately within the same project for optimal performance vs. dynamism.

## 5. Development Parity

With the new Astro 6 development server (which bridges the dev/production gap):

- Ensure you test features closely to the production runtime, as the dev server now behaves closer to the final build compared to older versions.
