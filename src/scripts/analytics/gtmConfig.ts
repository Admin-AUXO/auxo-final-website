/**
 * GTM Configuration and Setup Utilities
 *
 * This file provides utilities for configuring Google Tag Manager
 * with proper attribution and traffic source tracking
 */

/**
 * Get GTM configuration for recommended tags and triggers
 */
export function getGTMConfiguration() {
  return {
    tags: {
      // Recommended tags to create in GTM
      ga4Config: {
        name: 'GA4 - Configuration Tag',
        type: 'Google Analytics: GA4 Configuration',
        description: 'Main GA4 configuration tag with enhanced measurement',
        triggerOn: 'All Pages',
        settings: {
          measurementId: 'G-WBMKHRWS7Z',
          sendPageView: true,
          enhancedMeasurement: {
            scrolls: true,
            outboundClicks: true,
            siteSearch: false,
            videoEngagement: true,
            fileDownloads: true,
          },
          userPropertiesFromDataLayer: [
            'session_count',
            'source',
            'medium',
            'campaign',
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_term',
            'utm_content',
            'ft_source',
            'ft_medium',
            'lt_source',
            'lt_medium',
          ],
        },
      },

      attributionTag: {
        name: 'GA4 - Attribution Event',
        type: 'Google Analytics: GA4 Event',
        description: 'Fires on attribution_data_ready event',
        triggerOn: 'Custom Event - attribution_data_ready',
        eventName: 'session_start_attribution',
        eventParameters: [
          { parameter: 'session_count', value: '{{DLV - session_count}}' },
          { parameter: 'source', value: '{{DLV - source}}' },
          { parameter: 'medium', value: '{{DLV - medium}}' },
          { parameter: 'campaign', value: '{{DLV - utm_campaign}}' },
          { parameter: 'term', value: '{{DLV - utm_term}}' },
          { parameter: 'content', value: '{{DLV - utm_content}}' },
          { parameter: 'first_touch_source', value: '{{DLV - ft_source}}' },
          { parameter: 'first_touch_medium', value: '{{DLV - ft_medium}}' },
          { parameter: 'last_touch_source', value: '{{DLV - lt_source}}' },
          { parameter: 'last_touch_medium', value: '{{DLV - lt_medium}}' },
        ],
      },
    },

    variables: {
      // Recommended dataLayer variables to create
      dataLayerVariables: [
        { name: 'DLV - session_count', type: 'Data Layer Variable', dataLayerVariable: 'session_count' },
        { name: 'DLV - source', type: 'Data Layer Variable', dataLayerVariable: 'source' },
        { name: 'DLV - medium', type: 'Data Layer Variable', dataLayerVariable: 'medium' },
        { name: 'DLV - utm_source', type: 'Data Layer Variable', dataLayerVariable: 'utm_source' },
        { name: 'DLV - utm_medium', type: 'Data Layer Variable', dataLayerVariable: 'utm_medium' },
        { name: 'DLV - utm_campaign', type: 'Data Layer Variable', dataLayerVariable: 'utm_campaign' },
        { name: 'DLV - utm_term', type: 'Data Layer Variable', dataLayerVariable: 'utm_term' },
        { name: 'DLV - utm_content', type: 'Data Layer Variable', dataLayerVariable: 'utm_content' },
        { name: 'DLV - ft_source', type: 'Data Layer Variable', dataLayerVariable: 'ft_source' },
        { name: 'DLV - ft_medium', type: 'Data Layer Variable', dataLayerVariable: 'ft_medium' },
        { name: 'DLV - ft_utm_campaign', type: 'Data Layer Variable', dataLayerVariable: 'ft_utm_campaign' },
        { name: 'DLV - lt_source', type: 'Data Layer Variable', dataLayerVariable: 'lt_source' },
        { name: 'DLV - lt_medium', type: 'Data Layer Variable', dataLayerVariable: 'lt_medium' },
        { name: 'DLV - lt_utm_campaign', type: 'Data Layer Variable', dataLayerVariable: 'lt_utm_campaign' },
        { name: 'DLV - referrer', type: 'Data Layer Variable', dataLayerVariable: 'referrer' },
        { name: 'DLV - referrer_domain', type: 'Data Layer Variable', dataLayerVariable: 'referrer_domain' },
      ],
    },

    triggers: {
      // Recommended triggers
      attributionReady: {
        name: 'Custom Event - attribution_data_ready',
        type: 'Custom Event',
        eventName: 'attribution_data_ready',
      },
      allPages: {
        name: 'All Pages',
        type: 'Page View',
      },
    },
  };
}

/**
 * Generate a setup guide for GTM
 */
export function generateGTMSetupGuide(): string {
  const config = getGTMConfiguration();

  return `
# Google Tag Manager Setup Guide

## Container ID: GTM-N6547BGW

### Step 1: Create DataLayer Variables

Create the following dataLayer variables in GTM (Variables > New > Data Layer Variable):

${config.variables.dataLayerVariables.map((v) => `- **${v.name}**
  - Type: ${v.type}
  - Data Layer Variable Name: ${v.dataLayerVariable}`).join('\n\n')}

### Step 2: Create Triggers

1. **All Pages Trigger** (should already exist)
   - Type: Page View
   - Trigger: All Pages

2. **Attribution Ready Trigger**
   - Type: Custom Event
   - Event name: attribution_data_ready
   - This event fires when UTM and attribution data is ready

### Step 3: Configure Tags

1. **GA4 Configuration Tag**
   - Tag Type: Google Analytics: GA4 Configuration
   - Measurement ID: G-WBMKHRWS7Z
   - Trigger: All Pages
   - Enable Enhanced Measurement (recommended):
     ✓ Page views
     ✓ Scrolls
     ✓ Outbound clicks
     ✓ File downloads
     ✓ Video engagement

2. **Attribution Event Tag** (optional but recommended)
   - Tag Type: Google Analytics: GA4 Event
   - Event Name: session_start_attribution
   - Trigger: Custom Event - attribution_data_ready
   - Event Parameters:
     ${config.tags.attributionTag.eventParameters.map((p) => `- ${p.parameter}: ${p.value}`).join('\n     ')}

### Step 4: Set Up GA4 Custom Dimensions

In your GA4 property, create the following custom dimensions:

**Session-scoped dimensions:**
- session_count (Dimension name: Session Count)
- source (Dimension name: Traffic Source)
- medium (Dimension name: Traffic Medium)

**Event-scoped dimensions:**
- utm_campaign (Dimension name: Campaign Name)
- utm_term (Dimension name: Campaign Term)
- utm_content (Dimension name: Campaign Content)
- first_touch_source (Dimension name: First Touch Source)
- first_touch_medium (Dimension name: First Touch Medium)
- last_touch_source (Dimension name: Last Touch Source)
- last_touch_medium (Dimension name: Last Touch Medium)

### Step 5: Testing

1. Use GTM Preview mode to test your setup
2. Check that dataLayer variables are populated correctly
3. Verify events are firing in GA4 Debug View
4. Test with UTM parameters in the URL:
   \`?utm_source=google&utm_medium=cpc&utm_campaign=test_campaign\`

### Step 6: Attribution Reports

Once set up, you can create custom reports in GA4 using:
- First-touch attribution (ft_source, ft_medium)
- Last-touch attribution (lt_source, lt_medium)
- Multi-touch attribution analysis
- Campaign performance tracking
  `;
}

/**
 * Export configuration as JSON for import
 */
export function exportGTMConfigAsJSON() {
  return JSON.stringify(getGTMConfiguration(), null, 2);
}
