import { google } from 'googleapis';
import * as path from 'path';

const GTM_ACCOUNT_PATH = 'accounts/6332993563';
const GTM_CONTAINER_PUBLIC_ID = 'GTM-N6547BGW';
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'auxodata-1a2b6e31bc0d.json');

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
    { name: 'DLV - enhanced_conversion_data', key: 'enhanced_conversion_data' },
    { name: 'DLV - web_vitals', key: 'web_vitals' },
    { name: 'DLV - page_load_time', key: 'page_load_time' },
    { name: 'DLV - task_duration', key: 'task_duration' },
  ];

  for (const variable of variables) {
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
      if (error.message.includes('already exists')) {
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
    { name: 'Custom Event - consent_update', eventName: 'consent_update' },
    { name: 'Custom Event - consent_preferences_updated', eventName: 'consent_preferences_updated' },
    { name: 'Custom Event - web_vitals', eventName: 'web_vitals' },
    { name: 'Custom Event - core_web_vitals', eventName: 'core_web_vitals' },
    { name: 'Custom Event - session_quality', eventName: 'session_quality' },
    { name: 'Custom Event - enhanced_conversion', eventName: 'enhanced_conversion' },
    { name: 'Custom Event - page_performance', eventName: 'page_performance' },
    { name: 'Custom Event - long_task', eventName: 'long_task' },
    { name: 'Custom Event - engagement_milestone', eventName: 'engagement_milestone' },
    { name: 'Custom Event - element_visibility', eventName: 'element_visibility' },
    { name: 'Custom Event - performance_mark', eventName: 'performance_mark' },
    { name: 'Custom Event - performance_measure', eventName: 'performance_measure' },
    { name: 'Custom Event - set_user_properties', eventName: 'set_user_properties' },
  ];

  for (const trigger of triggers) {
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
      if (error.message.includes('already exists')) {
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

  const triggersResponse = await gtm.accounts.containers.workspaces.triggers.list({
    parent: workspacePath,
  });
  const existingTriggers = triggersResponse.data.trigger || [];

  for (const tag of tags) {
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

      await gtm.accounts.containers.workspaces.tags.create({
        parent: workspacePath,
        requestBody: {
          name: tag.name,
          type: 'gaawe',
          parameter: [
            { type: 'template', key: 'eventName', value: tag.eventName },
            {
              type: 'list',
              key: 'eventParameters',
              list: eventParameters,
            },
          ],
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
