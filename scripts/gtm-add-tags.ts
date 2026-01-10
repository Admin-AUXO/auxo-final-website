import { google } from 'googleapis';
import * as path from 'path';

const GTM_ACCOUNT_PATH = 'accounts/6332993563';
const GTM_CONTAINER_PUBLIC_ID = 'GTM-N6547BGW';
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'auxodata-1a2b6e31bc0d.json');
const GA4_MEASUREMENT_ID = 'G-WBMKHRWS7Z';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

async function createGA4TagsWithDelay(gtm: any, workspacePath: string) {
  console.log('\n🏷️  Creating GA4 Event Tags (with rate limiting)...');

  const triggersResponse = await gtm.accounts.containers.workspaces.triggers.list({
    parent: workspacePath,
  });
  const existingTriggers = triggersResponse.data.trigger || [];

  const tagsResponse = await gtm.accounts.containers.workspaces.tags.list({
    parent: workspacePath,
  });
  const existingTags = tagsResponse.data.tag || [];
  console.log(`   Found ${existingTags.length} existing tags`);

  const tags = [
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
  ];

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];

    try {
      const tagExists = existingTags.find((t: any) => t.name === tag.name);
      if (tagExists) {
        console.log(`   ⏭️  ${tag.name} (already exists)`);
        continue;
      }

      const trigger = existingTriggers.find((t: any) => t.name === tag.triggerName);
      if (!trigger) {
        console.log(`   ⚠️  ${tag.name} - trigger not found`);
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

      if (i < tags.length - 1) {
        console.log(`   ⏳ Waiting 10 seconds...`);
        await delay(10000);
      }
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log(`   ⏭️  ${tag.name} (already exists)`);
      } else {
        console.log(`   ❌ ${tag.name}: ${error.message}`);
      }

      if (i < tags.length - 1) {
        await delay(2000);
      }
    }
  }
}

async function addTags() {
  console.log('🏷️  GTM - Adding GA4 Event Tags\n');
  console.log('=' .repeat(60));
  console.log('⏱️  This will take ~2 minutes due to API rate limits\n');

  try {
    const gtm = await getGTMClient();
    console.log('✅ GTM API client initialized');

    const { workspacePath } = await getContainerAndWorkspace(gtm);
    console.log(`✅ Workspace ready`);

    await createGA4TagsWithDelay(gtm, workspacePath);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Tags Added Successfully!\n');

    console.log('📝 Next Steps:');
    console.log('   1. Go to https://tagmanager.google.com/');
    console.log(`   2. Select container ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log('   3. Review all new tags in Default Workspace');
    console.log('   4. Test in Preview mode');
    console.log('   5. Publish when ready\n');

    console.log('🔍 Verify with: npm run gtm:check\n');

  } catch (error: any) {
    console.log('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

addTags();
