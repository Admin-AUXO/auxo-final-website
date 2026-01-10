import { google } from 'googleapis';
import * as path from 'path';

const GTM_ACCOUNT_PATH = 'accounts/6332993563';
const GTM_CONTAINER_PUBLIC_ID = 'GTM-N6547BGW';
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'auxodata-1a2b6e31bc0d.json');
const GA4_MEASUREMENT_ID = 'G-WBMKHRWS7Z';

const MISSING_TAGS = [
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
    name: 'GA4 Event - Form Start',
    eventName: 'form_start',
    triggerName: 'Custom Event - form_start',
    parameters: [
      { name: 'form_name', value: '{{DLV - form_name}}' },
      { name: 'form_location', value: '{{DLV - form_location}}' },
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
    name: 'GA4 Event - Video Complete',
    eventName: 'video_complete',
    triggerName: 'Custom Event - video_complete',
    parameters: [
      { name: 'video_title', value: '{{DLV - video_title}}' },
      { name: 'video_url', value: '{{DLV - video_url}}' },
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
    name: 'GA4 Event - Element Visibility',
    eventName: 'element_visibility',
    triggerName: 'Custom Event - element_visibility',
    parameters: [],
  },
];

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

async function addMissingTags() {
  console.log('🔧 Adding Missing GA4 Event Tags\n');
  console.log('='.repeat(60));

  try {
    const gtm = await getGTMClient();
    console.log('✅ GTM API client initialized\n');

    const { containerPath, workspacePath } = await getContainerAndWorkspace(gtm);
    console.log(`✅ Container: ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log(`✅ Workspace: Default Workspace\n`);

    const triggersResponse = await gtm.accounts.containers.workspaces.triggers.list({
      parent: workspacePath,
    });
    const existingTriggers = triggersResponse.data.trigger || [];

    const tagsResponse = await gtm.accounts.containers.workspaces.tags.list({
      parent: workspacePath,
    });
    const existingTags = tagsResponse.data.tag || [];
    const existingTagNames = new Set(existingTags.map((t: any) => t.name));

    console.log(`📊 Found ${existingTags.length} existing tags`);
    console.log(`🎯 Adding ${MISSING_TAGS.length} missing tags\n`);

    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const tag of MISSING_TAGS) {
      if (existingTagNames.has(tag.name)) {
        console.log(`   ⏭️  ${tag.name} (already exists)`);
        skippedCount++;
        continue;
      }

      try {
        const trigger = existingTriggers.find((t: any) => t.name === tag.triggerName);
        if (!trigger) {
          console.log(`   ⚠️  Skipping ${tag.name} - trigger "${tag.triggerName}" not found`);
          errorCount++;
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
        addedCount++;
      } catch (error: any) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`   ⏭️  ${tag.name} (already exists)`);
          skippedCount++;
        } else {
          console.log(`   ❌ ${tag.name}: ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Added: ${addedCount} tags`);
    console.log(`   ⏭️  Skipped: ${skippedCount} tags (already exist)`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount} tags`);
    }
    console.log('');

  } catch (error: any) {
    console.log('\n❌ Failed:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

addMissingTags();
