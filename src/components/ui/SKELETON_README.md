# Skeleton Loader Components

Skeleton loaders provide better perceived performance during content loading by showing placeholder content that matches the dimensions of actual content.

## Components

### 1. Skeleton.astro
Base skeleton component for individual elements.

**Props:**
- `variant`: 'text' | 'title' | 'avatar' | 'card' | 'image' | 'button' (default: 'text')
- `width`: Custom width (e.g., '100%', '10rem')
- `height`: Custom height (e.g., '1rem', '50px')
- `rounded`: Boolean for rounded corners (default: false)
- `class`: Additional CSS classes

**Usage:**
```astro
import Skeleton from '@/components/ui/Skeleton.astro';

<Skeleton variant="title" width="60%" />
<Skeleton variant="text" />
<Skeleton variant="avatar" rounded={true} />
<Skeleton variant="image" height="12rem" />
```

### 2. SkeletonCard.astro
Composite skeleton for common card layouts.

**Variants:**
- `service`: Service offering card
- `team`: Team member card
- `case-study`: Case study card
- `blog`: Blog post card

**Usage:**
```astro
import SkeletonCard from '@/components/ui/SkeletonCard.astro';

<SkeletonCard variant="service" />
<SkeletonCard variant="team" />
<SkeletonCard variant="case-study" />
```

### 3. SkeletonGrid.astro
Grid of skeleton cards for list pages.

**Props:**
- `variant`: Same as SkeletonCard
- `count`: Number of skeleton cards (default: 6)
- `columns`: Number of columns (default: 3)
- `class`: Additional CSS classes

**Usage:**
```astro
import SkeletonGrid from '@/components/ui/SkeletonGrid.astro';

<SkeletonGrid variant="service" count={6} columns={3} />
<SkeletonGrid variant="team" count={4} columns={2} />
```

## Implementation Examples

### Example 1: Service Cards with Loading State

```astro
---
import { getServices } from '@/lib/data/services';
import SkeletonGrid from '@/components/ui/SkeletonGrid.astro';

const services = await getServices();
---

{services.length === 0 ? (
  <SkeletonGrid variant="service" count={6} />
) : (
  <div class="services-grid">
    {services.map(service => (
      <ServiceCard {service} />
    ))}
  </div>
)}
```

### Example 2: Client-Side Loading with Islands

```tsx
// React component with loading state
import { useState, useEffect } from 'react';

export default function TeamGrid() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetchTeam().then(data => {
      setTeam(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <SkeletonGrid variant="team" count={4} />;
  }

  return (
    <div className="team-grid">
      {team.map(member => (
        <TeamCard key={member.id} member={member} />
      ))}
    </div>
  );
}
```

### Example 3: Progressive Enhancement

```astro
---
import Skeleton from '@/components/ui/Skeleton.astro';
---

<div class="content-wrapper">
  <div class="loading-state">
    <Skeleton variant="title" />
    <div class="skeleton-text-group">
      <Skeleton variant="text" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="95%" />
    </div>
  </div>

  <div class="actual-content" style="display: none;">
    <!-- Actual content loaded via JS -->
  </div>
</div>

<script>
  // Show actual content when loaded
  document.addEventListener('content-loaded', () => {
    document.querySelector('.loading-state').style.display = 'none';
    document.querySelector('.actual-content').style.display = 'block';
  });
</script>
```

## Accessibility

- All skeleton components include `aria-hidden="true"` to hide from screen readers
- SkeletonGrid includes `aria-busy="true"` and `aria-label="Loading content..."`
- Respects `prefers-reduced-motion` by disabling animations

## Styling

Skeletons use CSS custom properties from the theme:
- `--bg-surface`: Background base color
- `--bg-card`: Highlight color during animation

Animation is a smooth left-to-right gradient pulse (1.5s duration).

## Performance

- Zero JavaScript required (pure CSS animation)
- Minimal DOM overhead
- GPU-accelerated animations
- Automatically disabled for users with motion sensitivity
