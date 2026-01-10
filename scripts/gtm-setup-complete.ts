import { google } from 'googleapis';
import * as path from 'path';

const GTM_ACCOUNT_PATH = 'accounts/6332993563';
const GTM_CONTAINER_PUBLIC_ID = 'GTM-N6547BGW';
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'auxodata-1a2b6e31bc0d.json');
const GA4_MEASUREMENT_ID = 'G-WBMKHRWS7Z';

async function getGTMClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/tagmanager.edit.containers'],
  });

  return google.tagmanager({ version: 'v2', auth });
}

async function getContainerAndWorkspace(gtm: any) {
  const containersResponse = await gtm.accounts.containers.list({
    parent: GTM_ACCOUNT_PATH,
  });

  const container = containersResponse.data.container?.find(
    (c: any) => c.publicId === GTM_CONTAINER_PUBLIC_ID
  );

  if (!container || !container.path) {
    throw new Error(`Container ${GTM_CONTAINER_PUBLIC_ID} not found`);
  }

  const workspacesResponse = await gtm.accounts.containers.workspaces.list({
    parent: container.path,
  });

  const workspace = workspacesResponse.data.workspace?.[0];
  if (!workspace || !workspace.path) {
    throw new Error('No workspace found');
  }

  return { containerPath: container.path, workspacePath: workspace.path };
}

async function createDataLayerVariables(gtm: any, workspacePath: string) {
  console.log('\n📊 Creating DataLayer Variables...');

  const variables = [
    { name: 'DLV - page_path', key: 'page_path' },
    { name: 'DLV - page_title', key: 'page_title' },
    { name: 'DLV - page_location', key: 'page_location' },
    { name: 'DLV - form_name', key: 'form_name' },
    { name: 'DLV - form_location', key: 'form_location' },
    { name: 'DLV - form_type', key: 'form_type' },
    { name: 'DLV - cta_text', key: 'cta_text' },
    { name: 'DLV - cta_location', key: 'cta_location' },
    { name: 'DLV - cta_destination', key: 'cta_destination' },
    { name: 'DLV - cta_type', key: 'cta_type' },
    { name: 'DLV - link_text', key: 'link_text' },
    { name: 'DLV - link_url', key: 'link_url' },
    { name: 'DLV - link_location', key: 'link_location' },
    { name: 'DLV - link_type', key: 'link_type' },
    { name: 'DLV - file_name', key: 'file_name' },
    { name: 'DLV - file_extension', key: 'file_extension' },
    { name: 'DLV - file_url', key: 'file_url' },
    { name: 'DLV - percent_scrolled', key: 'percent_scrolled' },
    { name: 'DLV - search_term', key: 'search_term' },
    { name: 'DLV - search_location', key: 'search_location' },
    { name: 'DLV - theme', key: 'theme' },
    { name: 'DLV - video_title', key: 'video_title' },
    { name: 'DLV - video_url', key: 'video_url' },
    { name: 'DLV - video_percent', key: 'video_percent' },
    { name: 'DLV - error_description', key: 'description' },
    { name: 'DLV - error_type', key: 'error_type' },
    { name: 'DLV - fatal', key: 'fatal' },
    { name: 'DLV - fields_completed', key: 'fields_completed' },
    { name: 'DLV - timing_name', key: 'name' },
    { name: 'DLV - timing_value', key: 'value' },
    { name: 'DLV - timing_category', key: 'timing_category' },
    { name: 'DLV - timing_label', key: 'timing_label' },
    { name: 'DLV - item_id', key: 'item_id' },
    { name: 'DLV - item_name', key: 'item_name' },
    { name: 'DLV - item_category', key: 'item_category' },
    { name: 'DLV - item_list_id', key: 'item_list_id' },
    { name: 'DLV - item_list_name', key: 'item_list_name' },
    { name: 'DLV - currency', key: 'currency' },
    { name: 'DLV - value', key: 'value' },
    { name: 'DLV - items', key: 'items' },
    { name: 'DLV - engagement_type', key: 'engagement_type' },
    { name: 'DLV - engagement_time_msec', key: 'engagement_time_msec' },
    { name: 'DLV - metric_name', key: 'metric_name' },
    { name: 'DLV - metric_value', key: 'metric_value' },
    { name: 'DLV - metric_rating', key: 'metric_rating' },
    { name: 'DLV - navigation_type', key: 'navigation_type' },
    { name: 'DLV - session_duration', key: 'session_duration' },
    { name: 'DLV - engagement_time', key: 'engagement_time' },
    { name: 'DLV - engagement_rate', key: 'engagement_rate' },
    { name: 'DLV - session_quality', key: 'session_quality' },
    { name: 'DLV - scroll_depth', key: 'scroll_depth' },
    { name: 'DLV - clicks', key: 'clicks' },
    { name: 'DLV - page_views', key: 'page_views' },
    { name: 'DLV - web_vitals', key: 'web_vitals' },
  ];

  const existingVariablesResponse = await gtm.accounts.containers.workspaces.variables.list({
    parent: workspacePath,
  });
  const existingVariables = existingVariablesResponse.data.variable || [];
  const existingVariableNames = new Set(existingVariables.map((v: any) => v.name));

  for (const variable of variables) {
    if (existingVariableNames.has(variable.name)) {
      console.log(`   ⏭️  ${variable.name} (already exists)`);
      continue;
    }

    try {
      await gtm.accounts.containers.workspaces.variables.create({
        parent: workspacePath,
        requestBody: {
          name: variable.name,
          type: 'v',
          parameter: [
            {
              type: 'integer',
              key: 'dataLayerVersion',
              value: '2',
            },
            {
              type: 'boolean',
              key: 'setDefaultValue',
              value: 'false',
            },
            {
              type: 'template',
              key: 'name',
              value: variable.key,
            },
          ],
        },
      });
      console.log(`   ✅ ${variable.name}`);
    } catch (error: any) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`   ⏭️  ${variable.name} (already exists)`);
      } else {
        console.log(`   ❌ ${variable.name}: ${error.message}`);
      }
    }
  }
}

async function createTriggers(gtm: any, workspacePath: string) {
  console.log('\n🎯 Creating Triggers...');

  const triggers = [
    { name: 'Custom Event - page_view', eventName: 'page_view' },
    { name: 'Custom Event - generate_lead', eventName: 'generate_lead' },
    { name: 'Custom Event - schedule_meeting', eventName: 'schedule_meeting' },
    { name: 'Custom Event - cta_click', eventName: 'cta_click' },
    { name: 'Custom Event - navigation_click', eventName: 'navigation_click' },
    { name: 'Custom Event - click', eventName: 'click' },
    { name: 'Custom Event - file_download', eventName: 'file_download' },
    { name: 'Custom Event - scroll', eventName: 'scroll' },
    { name: 'Custom Event - user_engagement', eventName: 'user_engagement' },
    { name: 'Custom Event - search', eventName: 'search' },
    { name: 'Custom Event - theme_change', eventName: 'theme_change' },
    { name: 'Custom Event - view_item', eventName: 'view_item' },
    { name: 'Custom Event - view_item_list', eventName: 'view_item_list' },
    { name: 'Custom Event - form_start', eventName: 'form_start' },
    { name: 'Custom Event - form_abandonment', eventName: 'form_abandonment' },
    { name: 'Custom Event - video_play', eventName: 'video_play' },
    { name: 'Custom Event - video_pause', eventName: 'video_pause' },
    { name: 'Custom Event - video_complete', eventName: 'video_complete' },
    { name: 'Custom Event - video_progress', eventName: 'video_progress' },
    { name: 'Custom Event - exception', eventName: 'exception' },
    { name: 'Custom Event - timing_complete', eventName: 'timing_complete' },
    { name: 'Custom Event - web_vitals', eventName: 'web_vitals' },
    { name: 'Custom Event - core_web_vitals', eventName: 'core_web_vitals' },
    { name: 'Custom Event - session_quality', eventName: 'session_quality' },
    { name: 'Custom Event - engagement_milestone', eventName: 'engagement_milestone' },
    { name: 'Custom Event - select_item', eventName: 'select_item' },
    { name: 'Custom Event - begin_checkout', eventName: 'begin_checkout' },
    { name: 'Custom Event - add_to_cart', eventName: 'add_to_cart' },
    { name: 'Custom Event - element_visibility', eventName: 'element_visibility' },
    { name: 'Custom Event - performance_mark', eventName: 'performance_mark' },
    { name: 'Custom Event - performance_measure', eventName: 'performance_measure' },
    { name: 'Custom Event - consent_update', eventName: 'consent_update' },
    { name: 'Custom Event - consent_preferences_updated', eventName: 'consent_preferences_updated' },
  ];

  const uniqueTriggers = triggers.filter((trigger, index, self) =>
    index === self.findIndex((t) => t.name === trigger.name)
  );

  const existingTriggersResponse = await gtm.accounts.containers.workspaces.triggers.list({
    parent: workspacePath,
  });
  const existingTriggers = existingTriggersResponse.data.trigger || [];
  const existingTriggerNames = new Set(existingTriggers.map((t: any) => t.name));

  for (const trigger of uniqueTriggers) {
    if (existingTriggerNames.has(trigger.name)) {
      console.log(`   ⏭️  ${trigger.name} (already exists)`);
      continue;
    }

    try {
      await gtm.accounts.containers.workspaces.triggers.create({
        parent: workspacePath,
        requestBody: {
          name: trigger.name,
          type: 'customEvent',
          customEventFilter: [
            {
              type: 'equals',
              parameter: [
                { type: 'template', key: 'arg0', value: '{{_event}}' },
                { type: 'template', key: 'arg1', value: trigger.eventName },
              ],
            },
          ],
        },
      });
      console.log(`   ✅ ${trigger.name}`);
    } catch (error: any) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`   ⏭️  ${trigger.name} (already exists)`);
      } else {
        console.log(`   ❌ ${trigger.name}: ${error.message}`);
      }
    }
  }
}

async function createGA4Tags(gtm: any, workspacePath: string) {
  console.log('\n🏷️  Creating GA4 Event Tags...');

  const tags = [
    {
      name: 'GA4 Event - Page View',
      eventName: 'page_view',
      triggerName: 'Custom Event - page_view',
      parameters: [
        { name: 'page_path', value: '{{DLV - page_path}}' },
        { name: 'page_title', value: '{{DLV - page_title}}' },
        { name: 'page_location', value: '{{DLV - page_location}}' },
      ],
    },
    {
      name: 'GA4 Event - Generate Lead',
      eventName: 'generate_lead',
      triggerName: 'Custom Event - generate_lead',
      parameters: [
        { name: 'form_name', value: '{{DLV - form_name}}' },
        { name: 'form_location', value: '{{DLV - form_location}}' },
        { name: 'form_type', value: '{{DLV - form_type}}' },
        { name: 'value', value: '1' },
        { name: 'currency', value: 'USD' },
      ],
    },
    {
      name: 'GA4 Event - Schedule Meeting',
      eventName: 'schedule_meeting',
      triggerName: 'Custom Event - schedule_meeting',
      parameters: [
        { name: 'location', value: '{{DLV - cta_location}}' },
        { name: 'context', value: '{{DLV - cta_destination}}' },
        { name: 'value', value: '5' },
      ],
    },
    {
      name: 'GA4 Event - CTA Click',
      eventName: 'cta_click',
      triggerName: 'Custom Event - cta_click',
      parameters: [
        { name: 'cta_text', value: '{{DLV - cta_text}}' },
        { name: 'cta_location', value: '{{DLV - cta_location}}' },
        { name: 'cta_destination', value: '{{DLV - cta_destination}}' },
        { name: 'cta_type', value: '{{DLV - cta_type}}' },
        { name: 'link_url', value: '{{DLV - link_url}}' },
      ],
    },
    {
      name: 'GA4 Event - Navigation Click',
      eventName: 'navigation_click',
      triggerName: 'Custom Event - navigation_click',
      parameters: [
        { name: 'link_text', value: '{{DLV - link_text}}' },
        { name: 'link_url', value: '{{DLV - link_url}}' },
        { name: 'link_location', value: '{{DLV - link_location}}' },
        { name: 'link_type', value: '{{DLV - link_type}}' },
      ],
    },
    {
      name: 'GA4 Event - Outbound Click',
      eventName: 'click',
      triggerName: 'Custom Event - click',
      parameters: [
        { name: 'link_url', value: '{{DLV - link_url}}' },
        { name: 'link_text', value: '{{DLV - link_text}}' },
        { name: 'link_location', value: '{{DLV - link_location}}' },
        { name: 'outbound', value: 'true' },
      ],
    },
    {
      name: 'GA4 Event - File Download',
      eventName: 'file_download',
      triggerName: 'Custom Event - file_download',
      parameters: [
        { name: 'file_name', value: '{{DLV - file_name}}' },
        { name: 'file_extension', value: '{{DLV - file_extension}}' },
        { name: 'file_url', value: '{{DLV - file_url}}' },
        { name: 'link_url', value: '{{DLV - file_url}}' },
        { name: 'link_location', value: '{{DLV - link_location}}' },
      ],
    },
    {
      name: 'GA4 Event - Scroll Depth',
      eventName: 'scroll',
      triggerName: 'Custom Event - scroll',
      parameters: [
        { name: 'percent_scrolled', value: '{{DLV - percent_scrolled}}' },
        { name: 'engagement_time_msec', value: '0' },
      ],
    },
    {
      name: 'GA4 Event - Search',
      eventName: 'search',
      triggerName: 'Custom Event - search',
      parameters: [
        { name: 'search_term', value: '{{DLV - search_term}}' },
        { name: 'search_location', value: '{{DLV - search_location}}' },
      ],
    },
    {
      name: 'GA4 Event - Theme Change',
      eventName: 'theme_change',
      triggerName: 'Custom Event - theme_change',
      parameters: [
        { name: 'theme', value: '{{DLV - theme}}' },
      ],
    },
    {
      name: 'GA4 Event - Form Start',
      eventName: 'form_start',
      triggerName: 'Custom Event - form_start',
      parameters: [
        { name: 'form_name', value: '{{DLV - form_name}}' },
        { name: 'form_location', value: '{{DLV - form_location}}' },
      ],
    },
    {
      name: 'GA4 Event - Form Abandonment',
      eventName: 'form_abandonment',
      triggerName: 'Custom Event - form_abandonment',
      parameters: [
        { name: 'form_name', value: '{{DLV - form_name}}' },
        { name: 'fields_completed', value: '{{DLV - fields_completed}}' },
      ],
    },
    {
      name: 'GA4 Event - Video Play',
      eventName: 'video_play',
      triggerName: 'Custom Event - video_play',
      parameters: [
        { name: 'video_title', value: '{{DLV - video_title}}' },
        { name: 'video_url', value: '{{DLV - video_url}}' },
      ],
    },
    {
      name: 'GA4 Event - Video Pause',
      eventName: 'video_pause',
      triggerName: 'Custom Event - video_pause',
      parameters: [
        { name: 'video_title', value: '{{DLV - video_title}}' },
        { name: 'video_url', value: '{{DLV - video_url}}' },
      ],
    },
    {
      name: 'GA4 Event - Video Complete',
      eventName: 'video_complete',
      triggerName: 'Custom Event - video_complete',
      parameters: [
        { name: 'video_title', value: '{{DLV - video_title}}' },
        { name: 'video_url', value: '{{DLV - video_url}}' },
      ],
    },
    {
      name: 'GA4 Event - Video Progress',
      eventName: 'video_progress',
      triggerName: 'Custom Event - video_progress',
      parameters: [
        { name: 'video_title', value: '{{DLV - video_title}}' },
        { name: 'video_url', value: '{{DLV - video_url}}' },
        { name: 'video_percent', value: '{{DLV - video_percent}}' },
      ],
    },
    {
      name: 'GA4 Event - Exception',
      eventName: 'exception',
      triggerName: 'Custom Event - exception',
      parameters: [
        { name: 'description', value: '{{DLV - error_description}}' },
        { name: 'fatal', value: '{{DLV - fatal}}' },
        { name: 'error_type', value: '{{DLV - error_type}}' },
        { name: 'page_location', value: '{{DLV - page_location}}' },
      ],
    },
    {
      name: 'GA4 Event - Timing Complete',
      eventName: 'timing_complete',
      triggerName: 'Custom Event - timing_complete',
      parameters: [
        { name: 'name', value: '{{DLV - timing_name}}' },
        { name: 'value', value: '{{DLV - timing_value}}' },
        { name: 'timing_category', value: '{{DLV - timing_category}}' },
        { name: 'timing_label', value: '{{DLV - timing_label}}' },
      ],
    },
    {
      name: 'GA4 Event - View Item',
      eventName: 'view_item',
      triggerName: 'Custom Event - view_item',
      parameters: [
        { name: 'currency', value: '{{DLV - currency}}' },
        { name: 'value', value: '{{DLV - value}}' },
        { name: 'items', value: '{{DLV - items}}' },
      ],
    },
    {
      name: 'GA4 Event - View Item List',
      eventName: 'view_item_list',
      triggerName: 'Custom Event - view_item_list',
      parameters: [
        { name: 'item_list_id', value: '{{DLV - item_list_id}}' },
        { name: 'item_list_name', value: '{{DLV - item_list_name}}' },
        { name: 'items', value: '{{DLV - items}}' },
      ],
    },
    {
      name: 'GA4 Event - User Engagement',
      eventName: 'user_engagement',
      triggerName: 'Custom Event - user_engagement',
      parameters: [
        { name: 'engagement_type', value: '{{DLV - engagement_type}}' },
        { name: 'engagement_time_msec', value: '{{DLV - engagement_time_msec}}' },
        { name: 'value', value: '{{DLV - value}}' },
      ],
    },
    {
      name: 'GA4 Event - Web Vitals',
      eventName: 'web_vitals',
      triggerName: 'Custom Event - web_vitals',
      parameters: [
        { name: 'metric_name', value: '{{DLV - metric_name}}' },
        { name: 'metric_value', value: '{{DLV - metric_value}}' },
        { name: 'metric_rating', value: '{{DLV - metric_rating}}' },
        { name: 'navigation_type', value: '{{DLV - navigation_type}}' },
      ],
    },
    {
      name: 'GA4 Event - Core Web Vitals',
      eventName: 'core_web_vitals',
      triggerName: 'Custom Event - core_web_vitals',
      parameters: [
        { name: 'web_vitals', value: '{{DLV - web_vitals}}' },
      ],
    },
    {
      name: 'GA4 Event - Session Quality',
      eventName: 'session_quality',
      triggerName: 'Custom Event - session_quality',
      parameters: [
        { name: 'session_duration', value: '{{DLV - session_duration}}' },
        { name: 'engagement_time', value: '{{DLV - engagement_time}}' },
        { name: 'engagement_rate', value: '{{DLV - engagement_rate}}' },
        { name: 'session_quality', value: '{{DLV - session_quality}}' },
        { name: 'scroll_depth', value: '{{DLV - scroll_depth}}' },
        { name: 'clicks', value: '{{DLV - clicks}}' },
        { name: 'page_views', value: '{{DLV - page_views}}' },
      ],
    },
    {
      name: 'GA4 Event - Enhanced Conversion',
      eventName: 'enhanced_conversion',
      triggerName: 'Custom Event - enhanced_conversion',
      parameters: [
        { name: 'enhanced_conversion_data', value: '{{DLV - enhanced_conversion_data}}' },
      ],
    },
    {
      name: 'GA4 Event - Page Performance',
      eventName: 'page_performance',
      triggerName: 'Custom Event - page_performance',
      parameters: [
        { name: 'page_load_time', value: '{{DLV - page_load_time}}' },
      ],
    },
    {
      name: 'GA4 Event - Long Task',
      eventName: 'long_task',
      triggerName: 'Custom Event - long_task',
      parameters: [
        { name: 'task_duration', value: '{{DLV - task_duration}}' },
      ],
    },
    {
      name: 'GA4 Event - Consent Update',
      eventName: 'consent_update',
      triggerName: 'Custom Event - consent_update',
      parameters: [],
    },
    {
      name: 'GA4 Event - Engagement Milestone',
      eventName: 'engagement_milestone',
      triggerName: 'Custom Event - engagement_milestone',
      parameters: [],
    },
    {
      name: 'GA4 Event - View Item',
      eventName: 'view_item',
      triggerName: 'Custom Event - view_item',
      parameters: [
        { name: 'currency', value: '{{DLV - currency}}' },
        { name: 'value', value: '{{DLV - value}}' },
        { name: 'items', value: '{{DLV - items}}' },
      ],
    },
    {
      name: 'GA4 Event - View Item List',
      eventName: 'view_item_list',
      triggerName: 'Custom Event - view_item_list',
      parameters: [
        { name: 'item_list_id', value: '{{DLV - item_list_id}}' },
        { name: 'item_list_name', value: '{{DLV - item_list_name}}' },
        { name: 'items', value: '{{DLV - items}}' },
      ],
    },
    {
      name: 'GA4 Event - Schedule Meeting',
      eventName: 'schedule_meeting',
      triggerName: 'Custom Event - schedule_meeting',
      parameters: [
        { name: 'location', value: '{{DLV - cta_location}}' },
        { name: 'context', value: '{{DLV - cta_destination}}' },
        { name: 'value', value: '5' },
      ],
    },
    {
      name: 'GA4 Event - User Engagement',
      eventName: 'user_engagement',
      triggerName: 'Custom Event - user_engagement',
      parameters: [
        { name: 'engagement_type', value: '{{DLV - engagement_type}}' },
        { name: 'engagement_time_msec', value: '{{DLV - engagement_time_msec}}' },
        { name: 'value', value: '{{DLV - value}}' },
      ],
    },
    {
      name: 'GA4 Event - Web Vitals',
      eventName: 'web_vitals',
      triggerName: 'Custom Event - web_vitals',
      parameters: [
        { name: 'metric_name', value: '{{DLV - metric_name}}' },
        { name: 'metric_value', value: '{{DLV - metric_value}}' },
        { name: 'metric_rating', value: '{{DLV - metric_rating}}' },
        { name: 'navigation_type', value: '{{DLV - navigation_type}}' },
      ],
    },
    {
      name: 'GA4 Event - Core Web Vitals',
      eventName: 'core_web_vitals',
      triggerName: 'Custom Event - core_web_vitals',
      parameters: [
        { name: 'web_vitals', value: '{{DLV - web_vitals}}' },
      ],
    },
    {
      name: 'GA4 Event - Session Quality',
      eventName: 'session_quality',
      triggerName: 'Custom Event - session_quality',
      parameters: [
        { name: 'session_duration', value: '{{DLV - session_duration}}' },
        { name: 'engagement_time', value: '{{DLV - engagement_time}}' },
        { name: 'engagement_rate', value: '{{DLV - engagement_rate}}' },
        { name: 'session_quality', value: '{{DLV - session_quality}}' },
        { name: 'scroll_depth', value: '{{DLV - scroll_depth}}' },
        { name: 'clicks', value: '{{DLV - clicks}}' },
        { name: 'page_views', value: '{{DLV - page_views}}' },
      ],
    },
    {
      name: 'GA4 Event - Engagement Milestone',
      eventName: 'engagement_milestone',
      triggerName: 'Custom Event - engagement_milestone',
      parameters: [],
    },
    {
      name: 'GA4 Event - Select Item',
      eventName: 'select_item',
      triggerName: 'Custom Event - select_item',
      parameters: [
        { name: 'item_list_id', value: '{{DLV - item_list_id}}' },
        { name: 'item_list_name', value: '{{DLV - item_list_name}}' },
        { name: 'items', value: '{{DLV - items}}' },
      ],
    },
    {
      name: 'GA4 Event - Begin Checkout',
      eventName: 'begin_checkout',
      triggerName: 'Custom Event - begin_checkout',
      parameters: [
        { name: 'currency', value: '{{DLV - currency}}' },
        { name: 'value', value: '{{DLV - value}}' },
        { name: 'items', value: '{{DLV - items}}' },
      ],
    },
    {
      name: 'GA4 Event - Add to Cart',
      eventName: 'add_to_cart',
      triggerName: 'Custom Event - add_to_cart',
      parameters: [
        { name: 'currency', value: '{{DLV - currency}}' },
        { name: 'value', value: '{{DLV - value}}' },
        { name: 'items', value: '{{DLV - items}}' },
      ],
    },
    {
      name: 'GA4 Event - Element Visibility',
      eventName: 'element_visibility',
      triggerName: 'Custom Event - element_visibility',
      parameters: [],
    },
    {
      name: 'GA4 Event - Performance Mark',
      eventName: 'performance_mark',
      triggerName: 'Custom Event - performance_mark',
      parameters: [],
    },
    {
      name: 'GA4 Event - Performance Measure',
      eventName: 'performance_measure',
      triggerName: 'Custom Event - performance_measure',
      parameters: [
        { name: 'value', value: '{{DLV - timing_value}}' },
      ],
    },
    {
      name: 'GA4 Event - Consent Update',
      eventName: 'consent_update',
      triggerName: 'Custom Event - consent_update',
      parameters: [],
    },
    {
      name: 'GA4 Event - Consent Preferences Updated',
      eventName: 'consent_preferences_updated',
      triggerName: 'Custom Event - consent_preferences_updated',
      parameters: [],
    },
  ];

  const triggersResponse = await gtm.accounts.containers.workspaces.triggers.list({
    parent: workspacePath,
  });
  const existingTriggers = triggersResponse.data.trigger || [];
  const existingTagsResponse = await gtm.accounts.containers.workspaces.tags.list({
    parent: workspacePath,
  });
  const existingTags = existingTagsResponse.data.tag || [];
  const existingTagNames = new Set(existingTags.map((t: any) => t.name));

  for (const tag of tags) {
    if (existingTagNames.has(tag.name)) {
      console.log(`   ⏭️  ${tag.name} (already exists)`);
      continue;
    }

    try {
      const trigger = existingTriggers.find((t: any) => t.name === tag.triggerName);
      if (!trigger) {
        console.log(`   ⚠️  Skipping ${tag.name} - trigger not found`);
        continue;
      }

      const eventParameters = tag.parameters.map((param) => ({
        type: 'map',
        map: [
          { type: 'template', key: 'name', value: param.name },
          { type: 'template', key: 'value', value: param.value },
        ],
      }));

      const tagParameters: any[] = [
        { type: 'template', key: 'eventName', value: tag.eventName },
        { type: 'template', key: 'measurementIdOverride', value: GA4_MEASUREMENT_ID },
      ];

      if (eventParameters.length > 0) {
        tagParameters.push({
          type: 'list',
          key: 'eventParameters',
          list: eventParameters,
        });
      }

      await gtm.accounts.containers.workspaces.tags.create({
        parent: workspacePath,
        requestBody: {
          name: tag.name,
          type: 'gaawe',
          parameter: tagParameters,
          firingTriggerId: [trigger.triggerId],
        },
      });
      console.log(`   ✅ ${tag.name}`);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log(`   ⏭️  ${tag.name} (already exists)`);
      } else {
        console.log(`   ❌ ${tag.name}: ${error.message}`);
      }
    }
  }
}

async function setupGTMComplete() {
  console.log('🚀 GTM Complete Setup - Adding Missing Configurations\n');
  console.log('=' .repeat(60));

  try {
    const gtm = await getGTMClient();
    console.log('✅ GTM API client initialized');

    const { containerPath, workspacePath } = await getContainerAndWorkspace(gtm);
    console.log(`✅ Container: ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log(`✅ Workspace: Default Workspace`);

    await createDataLayerVariables(gtm, workspacePath);
    await createTriggers(gtm, workspacePath);
    await createGA4Tags(gtm, workspacePath);

    console.log('\n' + '='.repeat(60));
    console.log('✅ GTM Setup Complete!\n');

    console.log('📝 Next Steps:');
    console.log('   1. Go to https://tagmanager.google.com/');
    console.log(`   2. Select container ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log('   3. Review changes in Default Workspace');
    console.log('   4. Test in Preview mode');
    console.log('   5. Publish when ready\n');

    console.log('🔍 Verify with: npm run gtm:check\n');

  } catch (error: any) {
    console.log('\n❌ Setup failed:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

setupGTMComplete();
