# Google Tag Manager Setup Guide

**Container ID**: `GTM-N6547BGW` | **GA4 Measurement ID**: `G-WBMKHRWS7Z`  
**Status**: ✅ GTM already installed in website

## Setup Options

### Option 1: Automated API Setup (Recommended)

Use the GTM API script to automate configuration:

```bash
GTM_ACCOUNT_ID="6332993563" npm run gtm:setup
```

See [scripts/README-GTM-API.md](scripts/README-GTM-API.md) for detailed setup instructions.

### Option 2: Manual Setup

Follow the steps below to configure GTM manually:

1. **GA4 Configuration Tag** → Create tag with Measurement ID `G-WBMKHRWS7Z`, trigger on "All Pages"
2. **Data Layer Variables** → Create variables for all event parameters (see list below)
3. **Event Tags & Triggers** → Create 11 GA4 Event tags with Custom Event triggers
4. **Test & Publish** → Verify in Preview Mode, then publish container

---

## 1. GA4 Configuration Tag

**Tags** → **New** → Name: `GA4 - Configuration`
- Tag Type: **Google Analytics: GA4 Configuration**
- Measurement ID: `G-WBMKHRWS7Z`
- Trigger: **All Pages**
- Enable Enhanced Measurement: Scroll, Outbound clicks, Site search, Video, File downloads

---

## 2. Data Layer Variables

Create variables for each parameter used in events. Pattern: `DLV - [parameter_name]`

**Variables** → **New** → Select **Data Layer Variable** → Enter variable name

### Required Variables

| Variable Name | Data Layer Variable Name |
|--------------|-------------------------|
| `DLV - form_name` | `form_name` |
| `DLV - form_location` | `form_location` |
| `DLV - form_type` | `form_type` |
| `DLV - event_category` | `event_category` |
| `DLV - event_label` | `event_label` |
| `DLV - cta_location` | `cta_location` |
| `DLV - cta_destination` | `cta_destination` |
| `DLV - cta_type` | `cta_type` |
| `DLV - link_url` | `link_url` |
| `DLV - link_location` | `link_location` |
| `DLV - link_type` | `link_type` |
| `DLV - percent_scrolled` | `percent_scrolled` |
| `DLV - theme` | `theme` |
| `DLV - location` | `location` |
| `DLV - context` | `context` |
| `DLV - value` | `value` |
| `DLV - currency` | `currency` |
| `DLV - items` | `items` |
| `DLV - item_list_id` | `item_list_id` |
| `DLV - item_list_name` | `item_list_name` |
| `DLV - outbound_url` | `outbound_url` |
| `DLV - fields_completed` | `fields_completed` |

---

## 3. Event Tags & Triggers

For each event, create:
1. **Trigger**: **Triggers** → **New** → Custom Event → Event name = `[event_name]`
2. **Tag**: **Tags** → **New** → GA4 Event → Event name = `[event_name]` → Add parameters → Attach trigger

### Events Configuration

| Event Name | Parameters | Conversion |
|-----------|-----------|-----------|
| `generate_lead` | `form_name`, `form_location`, `form_type`, `value`, `currency` | ✅ Yes |
| `schedule_meeting` | `event_category`, `event_label`, `location`, `context`, `value` | ✅ Yes |
| `cta_click` | `event_category`, `event_label`, `cta_location`, `cta_destination`, `cta_type` | - |
| `navigation_click` | `event_category`, `event_label`, `link_url`, `link_location`, `link_type` | - |
| `scroll` | `event_category`, `event_label`, `percent_scrolled` | - |
| `theme_change` | `event_category`, `event_label`, `theme` | - |
| `form_start` | `event_category`, `event_label`, `form_name`, `form_location` | - |
| `form_abandonment` | `event_category`, `event_label`, `form_name`, `fields_completed` | - |
| `view_item` | `currency`, `value`, `items` | - |
| `view_item_list` | `item_list_id`, `item_list_name` | - |
| `click` | `event_category`, `event_label`, `outbound_url`, `link_location` | - |

**Note**: Use the Data Layer Variables created in Step 2 for all parameters (e.g., `{{DLV - form_name}}`).

---

## 4. Testing & Publishing

### Test in GTM Preview Mode
1. GTM → **Preview** → Enter website URL
2. Interact with site (forms, CTAs, navigation)
3. Verify events appear in GTM debugger

### Verify in GA4 DebugView
1. Install [GA Debugger extension](https://chrome.google.com/webstore/detail/google-analytics-debugger)
2. GA4 → **Admin** → **DebugView**
3. Browse site and verify real-time events

### Mark Conversions
GA4 → **Admin** → **Events** → Mark as conversions:
- `generate_lead`
- `schedule_meeting`

### Publish Container
GTM → **Submit** → Add version name/description → **Publish**

---

## Events Reference

| Event | Description | Value |
|-------|-------------|-------|
| `generate_lead` | Form submission | 1 |
| `schedule_meeting` | Calendar booking | 5 |
| `cta_click` | CTA button clicks | - |
| `navigation_click` | Menu/footer navigation | - |
| `scroll` | Scroll depth (25%, 50%, 75%, 90%, 100%) | - |
| `theme_change` | Light/dark mode toggle | - |
| `form_start` | User begins form | - |
| `form_abandonment` | Form abandonment | - |
| `view_item` | Service page view | 0 |
| `view_item_list` | Service category view | - |
| `click` | Outbound link clicks | - |

---

## Support

- [GTM Help Center](https://support.google.com/tagmanager)
- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)

**Note**: All tracking code is implemented. Configure GTM to pass events to GA4.
