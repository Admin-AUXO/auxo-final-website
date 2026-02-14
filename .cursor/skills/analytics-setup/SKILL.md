---
name: analytics-setup
description: Configure Google Analytics 4 and GTM tracking for the AUXO website. Use when adding tracking, event analytics, custom dimensions, or debugging tracking issues.
---

# Analytics Setup

## Analytics Stack

- **Google Tag Manager (GTM)**: Tag container management
- **Google Analytics 4 (GA4)**: Event-based analytics
- **Consent Management**: Cookie consent with privacy controls

## File Structure

```
src/scripts/analytics/
├── ga4.ts              # GA4 initialization
├── gtmConfig.ts        # GTM configuration
├── formAnalytics.ts    # Form tracking
├── utmTracking.ts      # Campaign tracking
├── advancedEngagement.ts # Engagement metrics
├── identifiers.ts      # User identification
└── privacy.ts          # Privacy controls
```

## GTM Configuration

Configure in `src/scripts/analytics/gtmConfig.ts`:

```typescript
export const GTM_CONFIG = {
  containerId: 'GTM-XXXXXX',
  dataLayerName: 'dataLayer',
  events: {
    pageView: 'page_view',
    formSubmit: 'form_submit',
    customEvent: 'custom_event',
  },
};
```

## Event Tracking

### Standard Events

```typescript
import { trackEvent } from '@/scripts/analytics/ga4';

trackEvent('button_click', {
  event_category: 'engagement',
  event_label: 'CTA Button',
  value: 1,
});
```

### Form Tracking

Forms are automatically tracked via `formAnalytics.ts`:

```typescript
// Auto-tracked on submit
<form id="contact-form" data-form-name="contact">
  <!-- Fields -->
</form>
```

Tracks:
- Form submissions
- Field interactions
- Validation errors
- Abandonment

### Custom Events

Add to `src/scripts/analytics/ga4.ts`:

```typescript
export function trackCustomEvent(
  eventName: string,
  params: Record<string, any>
) {
  if (!window.gtag) return;
  
  window.gtag('event', eventName, params);
}
```

## UTM Tracking

Automatically captures and stores UTM parameters:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`

Stored in localStorage and sent with form submissions.

## Privacy & Consent

Cookie consent managed in `src/components/common/CookieConsent.astro`.

Check consent before tracking:

```typescript
import { hasConsent } from '@/scripts/analytics/privacy';

if (hasConsent('analytics')) {
  trackEvent('page_view', { /* params */ });
}
```

## GTM Scripts

Utility scripts in `scripts/`:

- `gtm-check.ts`: Validate GTM setup
- `gtm-optimize.ts`: Optimize tag configuration
- `gtm-cleanup-variables.ts`: Remove unused variables

Run with:
```bash
npm run gtm:check
npm run gtm:optimize
npm run gtm:cleanup-vars
```

## Debugging

Enable debug mode:

```typescript
// In browser console
localStorage.setItem('ga_debug', 'true');
```

Check dataLayer:

```javascript
console.log(window.dataLayer);
```

Verify events in GA4 DebugView or GTM Preview mode.

## Advanced Engagement

Track scroll depth, time on page, and interactions:

```typescript
import { initAdvancedEngagement } from '@/scripts/analytics/advancedEngagement';

initAdvancedEngagement({
  scrollThresholds: [25, 50, 75, 100],
  timeThresholds: [10, 30, 60, 120],
});
```

## User Identification

Generate and track anonymous user IDs:

```typescript
import { getUserId, setUserId } from '@/scripts/analytics/identifiers';

const userId = getUserId(); // Auto-generated if not exists
setUserId('custom-id'); // Set custom ID
```

## Environment Setup

Configure in `.env`:

```env
PUBLIC_GTM_ID=GTM-XXXXXX
PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Common Patterns

### Track CTA Clicks

```astro
<button
  onclick="trackEvent('cta_click', { 
    cta_location: 'hero', 
    cta_text: 'Get Started' 
  })"
>
  Get Started
</button>
```

### Track Navigation

```typescript
document.addEventListener('astro:page-load', () => {
  trackEvent('page_view', {
    page_path: window.location.pathname,
    page_title: document.title,
  });
});
```

### Track Video Plays

```typescript
videoElement.addEventListener('play', () => {
  trackEvent('video_play', {
    video_title: 'Demo Video',
    video_position: videoElement.currentTime,
  });
});
```

## Performance

- Load GTM asynchronously
- Defer analytics scripts
- Use conditional loading based on consent
- Minimize dataLayer pushes

## Testing Checklist

- [ ] GTM container loads
- [ ] GA4 receives page views
- [ ] Events tracked correctly
- [ ] UTM parameters captured
- [ ] Consent honored
- [ ] No console errors
- [ ] DebugView shows events
