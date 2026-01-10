# GTM Setup Summary - GA4 Best Practices Implementation

## Overview
Complete GTM configuration aligned with GA4/GTM 2026 best practices, ensuring all tracked events have corresponding GTM tags, triggers, and data layer variables.

## Configuration Details

### Data Layer Variables (50+)
All event parameters are mapped to data layer variables for consistent data capture:

**Page & Navigation:**
- `DLV - page_path`, `DLV - page_title`, `DLV - page_location`
- `DLV - link_text`, `DLV - link_url`, `DLV - link_location`, `DLV - link_type`

**Forms:**
- `DLV - form_name`, `DLV - form_location`, `DLV - form_type`
- `DLV - fields_completed`

**CTAs & Engagement:**
- `DLV - cta_text`, `DLV - cta_location`, `DLV - cta_destination`, `DLV - cta_type`
- `DLV - percent_scrolled`, `DLV - session_duration`, `DLV - engagement_time`
- `DLV - engagement_rate`, `DLV - session_quality`, `DLV - scroll_depth`
- `DLV - clicks`, `DLV - page_views`

**Media & Files:**
- `DLV - file_name`, `DLV - file_extension`, `DLV - file_url`
- `DLV - video_title`, `DLV - video_url`, `DLV - video_percent`

**Performance:**
- `DLV - metric_name`, `DLV - metric_value`, `DLV - metric_rating`
- `DLV - navigation_type`, `DLV - web_vitals`
- `DLV - page_load_time`, `DLV - task_duration`

**Errors & Timing:**
- `DLV - error_description`, `DLV - error_type`, `DLV - fatal`
- `DLV - timing_name`, `DLV - timing_value`, `DLV - timing_category`, `DLV - timing_label`

**Other:**
- `DLV - search_term`, `DLV - search_location`
- `DLV - theme`
- `DLV - enhanced_conversion_data`

### Custom Event Triggers (30+)
All triggers use custom event type with proper event name matching:

**User Interaction Events:**
- `page_view`, `generate_lead`, `schedule_meeting`
- `cta_click`, `navigation_click`, `click` (outbound)
- `file_download`, `scroll`, `search`, `theme_change`

**Form Events:**
- `form_start`, `form_abandonment`

**Video Events:**
- `video_play`, `video_pause`, `video_complete`, `video_progress`

**Performance Events:**
- `web_vitals`, `core_web_vitals`
- `page_performance`, `long_task`
- `performance_mark`, `performance_measure`
- `timing_complete`

**Engagement Events:**
- `session_quality`, `engagement_milestone`
- `user_engagement`, `element_visibility`

**System Events:**
- `consent_update`, `consent_preferences_updated`
- `enhanced_conversion`, `exception`
- `set_user_properties`

### GA4 Event Tags (25+)
All tags configured with:
- Proper event name mapping
- Measurement ID override (`G-WBMKHRWS7Z`)
- Event parameters mapped from data layer variables
- Correct trigger associations

**Key Tags:**
1. **Page View** - Tracks page navigation
2. **Generate Lead** - Form submissions
3. **CTA Click** - Call-to-action interactions
4. **Navigation Click** - Header/footer navigation
5. **Outbound Click** - External link tracking
6. **File Download** - Document downloads
7. **Scroll Depth** - Scroll engagement (25%, 50%, 75%, 90%, 100%)
8. **Search** - Site search queries
9. **Theme Change** - Dark/light mode toggles
10. **Form Start** - Form interaction initiation
11. **Form Abandonment** - Incomplete form submissions
12. **Video Events** - Play, pause, complete, progress
13. **Exception** - Error tracking
14. **Timing Complete** - Performance measurements
15. **Web Vitals** - Core Web Vitals metrics
16. **Session Quality** - Engagement quality metrics
17. **Enhanced Conversion** - PII-hashed conversion data
18. **Page Performance** - Load time metrics
19. **Long Task** - Performance bottleneck detection
20. **Consent Update** - Privacy consent changes
21. **Engagement Milestone** - User engagement milestones

## Best Practices Implemented

### 1. Event Parameter Standardization
- All parameters use snake_case naming
- Consistent parameter names across events
- Proper data type handling

### 2. Measurement ID Override
- All tags include `measurementIdOverride` parameter
- Ensures events go to correct GA4 property
- Prevents misconfiguration

### 3. Trigger-to-Tag Mapping
- One trigger per event type
- Proper event name matching
- No duplicate triggers

### 4. Data Layer Structure
- Consistent variable naming (`DLV - parameter_name`)
- Proper data layer version (v2)
- Default values handled appropriately

### 5. Consent Mode Integration
- Consent-aware event tracking
- Events only fire when consent granted
- Proper consent update handling

## Setup Scripts

### Complete Setup
```bash
npm run gtm:setup
```
Creates all variables, triggers, and tags in one operation.

### Add Tags Only
```bash
npm run gtm:add-tags
```
Adds missing GA4 event tags (with rate limiting).

### Publish Container
```bash
npm run gtm:publish
```
Publishes current workspace to production.

### Check Configuration
```bash
npm run gtm:check
```
Verifies GTM access and lists current configuration.

## Event Coverage

✅ **User Interactions** - All click, scroll, navigation events tracked
✅ **Form Tracking** - Start, submission, abandonment covered
✅ **Engagement** - Scroll depth, session quality, milestones
✅ **Performance** - Web Vitals, page load, long tasks
✅ **Media** - Video interactions fully tracked
✅ **Errors** - Exception tracking with context
✅ **Conversions** - Lead generation and enhanced conversions
✅ **Privacy** - Consent mode v2 integration

## Next Steps

1. Run `npm run gtm:setup` to create all configurations
2. Test in GTM Preview mode
3. Verify events in GA4 DebugView
4. Publish when validated: `npm run gtm:publish`

## Maintenance

- Review GTM configuration quarterly
- Update tags when adding new events
- Monitor GA4 for missing events
- Keep data layer variables in sync with code
