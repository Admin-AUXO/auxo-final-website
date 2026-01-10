import { google } from 'googleapis';
import * as path from 'path';

const GTM_ACCOUNT_PATH = 'accounts/6332993563';
const GTM_CONTAINER_PUBLIC_ID = 'GTM-N6547BGW';
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), '..', 'auxodata-1a2b6e31bc0d.json');
const GA4_MEASUREMENT_ID = 'G-WBMKHRWS7Z';

const EVENTS_TO_REMOVE = [
  'video_play',
  'video_pause',
  'video_complete',
  'video_progress',
  'add_to_cart',
  'begin_checkout',
  'select_item',
  'enhanced_conversion',
  'page_performance',
  'long_task',
  'element_visibility',
  'performance_mark',
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

async function removeUnusedTags(gtm: any, workspacePath: string) {
  console.log('\n🗑️  Removing Unused Tags...');

  const tagsResponse = await gtm.accounts.containers.workspaces.tags.list({
    parent: workspacePath,
  });

  const tags = tagsResponse.data.tag || [];
  let removed = 0;

  for (const tag of tags) {
    const shouldRemove = EVENTS_TO_REMOVE.some((event) =>
      tag.name?.toLowerCase().includes(event.replace('_', ' '))
    );

    if (shouldRemove) {
      try {
        await gtm.accounts.containers.workspaces.tags.delete({
          path: tag.path,
        });
        console.log(`   ✅ Removed tag: ${tag.name}`);
        removed++;
      } catch (error: any) {
        console.log(`   ❌ Failed to remove tag ${tag.name}: ${error.message}`);
      }
    }
  }

  console.log(`   📊 Removed ${removed} unused tags`);
}

async function removeUnusedTriggers(gtm: any, workspacePath: string) {
  console.log('\n🗑️  Removing Unused Triggers...');

  const triggersResponse = await gtm.accounts.containers.workspaces.triggers.list({
    parent: workspacePath,
  });

  const triggers = triggersResponse.data.trigger || [];
  let removed = 0;

  for (const trigger of triggers) {
    const shouldRemove = EVENTS_TO_REMOVE.some((event) =>
      trigger.name?.toLowerCase().includes(event)
    );

    if (shouldRemove) {
      try {
        await gtm.accounts.containers.workspaces.triggers.delete({
          path: trigger.path,
        });
        console.log(`   ✅ Removed trigger: ${trigger.name}`);
        removed++;
      } catch (error: any) {
        console.log(`   ❌ Failed to remove trigger ${trigger.name}: ${error.message}`);
      }
    }
  }

  console.log(`   📊 Removed ${removed} unused triggers`);
}

async function addGA4ConfigTag(gtm: any, workspacePath: string) {
  console.log('\n🏷️  Adding GA4 Configuration Tag...');

  const tagsResponse = await gtm.accounts.containers.workspaces.tags.list({
    parent: workspacePath,
  });
  const existingTags = tagsResponse.data.tag || [];

  const configTagExists = existingTags.some((tag: any) =>
    tag.name === 'GA4 Config - Main' || tag.type === 'gaawc'
  );

  if (configTagExists) {
    console.log('   ⏭️  GA4 Configuration Tag already exists');
    return;
  }

  const triggersResponse = await gtm.accounts.containers.workspaces.triggers.list({
    parent: workspacePath,
  });
  const triggers = triggersResponse.data.trigger || [];
  const allPagesTrigger = triggers.find((t: any) => t.type === 'pageview' || t.name === 'All Pages');

  if (!allPagesTrigger) {
    console.log('   ⚠️  All Pages trigger not found, creating it...');
    const newTrigger = await gtm.accounts.containers.workspaces.triggers.create({
      parent: workspacePath,
      requestBody: {
        name: 'All Pages',
        type: 'pageview',
      },
    });

    await gtm.accounts.containers.workspaces.tags.create({
      parent: workspacePath,
      requestBody: {
        name: 'GA4 Config - Main',
        type: 'gaawc',
        parameter: [
          {
            type: 'template',
            key: 'measurementId',
            value: GA4_MEASUREMENT_ID,
          },
          {
            type: 'boolean',
            key: 'sendPageView',
            value: 'false',
          },
        ],
        firingTriggerId: [newTrigger.data.triggerId],
      },
    });
    console.log('   ✅ Created GA4 Configuration Tag with All Pages trigger');
  } else {
    await gtm.accounts.containers.workspaces.tags.create({
      parent: workspacePath,
      requestBody: {
        name: 'GA4 Config - Main',
        type: 'gaawc',
        parameter: [
          {
            type: 'template',
            key: 'measurementId',
            value: GA4_MEASUREMENT_ID,
          },
          {
            type: 'boolean',
            key: 'sendPageView',
            value: 'false',
          },
        ],
        firingTriggerId: [allPagesTrigger.triggerId],
      },
    });
    console.log('   ✅ Created GA4 Configuration Tag');
  }
}

async function optimizeGTM() {
  console.log('🚀 GTM Optimization - Removing Unused Events & Adding Config Tag\n');
  console.log('='.repeat(60));

  try {
    const gtm = await getGTMClient();
    console.log('✅ GTM API client initialized');

    const { containerPath, workspacePath } = await getContainerAndWorkspace(gtm);
    console.log(`✅ Container: ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log(`✅ Workspace: Default Workspace`);

    await removeUnusedTags(gtm, workspacePath);
    await removeUnusedTriggers(gtm, workspacePath);
    await addGA4ConfigTag(gtm, workspacePath);

    console.log('\n' + '='.repeat(60));
    console.log('✅ GTM Optimization Complete!\n');

    console.log('📝 Events Removed:');
    EVENTS_TO_REMOVE.forEach(event => console.log(`   - ${event}`));
    console.log('');

    console.log('📝 Next Steps:');
    console.log('   1. Go to https://tagmanager.google.com/');
    console.log(`   2. Select container ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log('   3. Review changes in Default Workspace');
    console.log('   4. Test in Preview mode');
    console.log('   5. Publish when ready\n');

  } catch (error: any) {
    console.log('\n❌ Optimization failed:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

optimizeGTM();
