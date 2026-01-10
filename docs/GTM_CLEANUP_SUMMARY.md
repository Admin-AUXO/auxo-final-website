# GTM Cleanup and Setup Summary

## Overview
This document summarizes the GTM cleanup and setup process to ensure only necessary variables, triggers, and tags are configured.

## Required Events (33 total)
Based on actual codebase usage, these events are tracked:

### Core Events
- `page_view`
- `generate_lead`
- `schedule_meeting`
- `cta_click`
- `navigation_click`
- `click` (outbound links)
- `file_download`
- `scroll`
- `user_engagement`
- `search`
- `theme_change`

### E-commerce Events
- `view_item`
- `view_item_list`
- `select_item`
- `begin_checkout`
- `add_to_cart`

### Form Events
- `form_start`
- `form_abandonment`

### Video Events
- `video_play`
- `video_pause`
- `video_complete`
- `video_progress`

### Performance & Quality Events
- `exception`
- `timing_complete`
- `web_vitals`
- `core_web_vitals`
- `session_quality`
- `engagement_milestone`
- `element_visibility`
- `performance_mark`
- `performance_measure`

### Consent Events
- `consent_update`
- `consent_preferences_updated`

## Required Parameters (50+)
All parameters used by the above events are configured as DataLayer Variables (DLV).

## Cleanup Script
The `gtm:cleanup` script removes:
- Duplicate triggers/tags/variables
- Unused variables not in the required list
- Unused triggers for events not tracked
- Unused tags for events not tracked

## Setup Script Updates
The `gtm:setup` script now:
- Checks for existing items before creating (avoids duplicates)
- Only creates missing items
- Includes all 33 required events
- Includes all required parameters

## Next Steps

1. **Wait for API quota reset** (if quota exceeded)
2. **Run cleanup** (optional, removes duplicates):
   ```bash
   npm run gtm:cleanup
   ```

3. **Run setup** (adds missing items):
   ```bash
   npm run gtm:setup
   ```

4. **Review in GTM**:
   - Go to https://tagmanager.google.com/
   - Select container `GTM-N6547BGW`
   - Review changes in Default Workspace

5. **Test in Preview mode**

6. **Publish when ready**:
   ```bash
   npm run gtm:publish
   ```

## Notes
- Most items already exist (duplicate name errors are expected)
- Setup script now checks for existing items before creating
- Cleanup script identifies and removes duplicates automatically
- API quota limits may require waiting between runs
