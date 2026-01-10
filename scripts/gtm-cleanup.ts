import { google } from 'googleapis';
import * as path from 'path';

const GTM_ACCOUNT_PATH = 'accounts/6332993563';
const GTM_CONTAINER_PUBLIC_ID = 'GTM-N6547BGW';
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'auxodata-1a2b6e31bc0d.json');
const GA4_MEASUREMENT_ID = 'G-WBMKHRWS7Z';

const REQUIRED_EVENTS = [
  'page_view',
  'generate_lead',
  'schedule_meeting',
  'cta_click',
  'navigation_click',
  'click',
  'file_download',
  'scroll',
  'user_engagement',
  'search',
  'theme_change',
  'view_item',
  'view_item_list',
  'form_start',
  'form_abandonment',
  'video_play',
  'video_pause',
  'video_complete',
  'video_progress',
  'exception',
  'timing_complete',
  'web_vitals',
  'core_web_vitals',
  'session_quality',
  'engagement_milestone',
  'select_item',
  'begin_checkout',
  'add_to_cart',
  'element_visibility',
  'performance_mark',
  'performance_measure',
  'consent_update',
  'consent_preferences_updated',
  'set_user_properties',
];

const REQUIRED_PARAMETERS = [
  'page_path',
  'page_title',
  'page_location',
  'form_name',
  'form_location',
  'form_type',
  'cta_text',
  'cta_location',
  'cta_destination',
  'cta_type',
  'link_text',
  'link_url',
  'link_location',
  'link_type',
  'file_name',
  'file_extension',
  'file_url',
  'percent_scrolled',
  'search_term',
  'search_location',
  'theme',
  'video_title',
  'video_url',
  'video_percent',
  'description',
  'error_type',
  'fatal',
  'fields_completed',
  'name',
  'value',
  'timing_category',
  'timing_label',
  'item_id',
  'item_name',
  'item_category',
  'item_list_id',
  'item_list_name',
  'currency',
  'items',
  'engagement_type',
  'engagement_time_msec',
  'metric_name',
  'metric_value',
  'metric_rating',
  'navigation_type',
  'session_duration',
  'engagement_time',
  'engagement_rate',
  'session_quality',
  'scroll_depth',
  'clicks',
  'page_views',
  'enhanced_conversion_data',
  'web_vitals',
  'page_load_time',
  'task_duration',
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

function extractDataLayerKey(variable: any): string | null {
  if (variable.type !== 'v') return null;
  const nameParam = variable.parameter?.find((p: any) => p.key === 'name');
  return nameParam?.value || null;
}

function extractEventName(trigger: any): string | null {
  if (trigger.type !== 'customEvent') return null;
  const filter = trigger.customEventFilter?.[0];
  if (!filter || filter.type !== 'equals') return null;
  const arg1Param = filter.parameter?.find((p: any) => p.key === 'arg1');
  return arg1Param?.value || null;
}

function extractTagEventName(tag: any): string | null {
  if (tag.type !== 'gaawe') return null;
  const eventNameParam = tag.parameter?.find((p: any) => p.key === 'eventName');
  return eventNameParam?.value || null;
}

async function cleanupGTM() {
  console.log('🧹 GTM Cleanup - Removing Unnecessary Items\n');
  console.log('='.repeat(60));

  try {
    const gtm = await getGTMClient();
    console.log('✅ GTM API client initialized\n');

    const { containerPath, workspacePath } = await getContainerAndWorkspace(gtm);
    console.log(`✅ Container: ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log(`✅ Workspace: Default Workspace\n`);

    console.log('📊 Step 1: Analyzing Current Variables...');
    const variablesResponse = await gtm.accounts.containers.workspaces.variables.list({
      parent: workspacePath,
    });
    const allVariables = variablesResponse.data.variable || [];
    
    const dlvVariables = allVariables.filter((v: any) => v.name?.startsWith('DLV - '));
    const variablesToKeep = new Set<string>();
    const variablesToDelete: any[] = [];

    for (const variable of dlvVariables) {
      const key = extractDataLayerKey(variable);
      if (key && REQUIRED_PARAMETERS.includes(key)) {
        variablesToKeep.add(variable.name);
      } else {
        variablesToDelete.push(variable);
      }
    }

    console.log(`   Found ${dlvVariables.length} DLV variables`);
    console.log(`   ✅ Keeping ${variablesToKeep.size} required variables`);
    console.log(`   🗑️  Removing ${variablesToDelete.length} unnecessary variables`);

    console.log('\n🎯 Step 2: Analyzing Current Triggers...');
    const triggersResponse = await gtm.accounts.containers.workspaces.triggers.list({
      parent: workspacePath,
    });
    const allTriggers = triggersResponse.data.trigger || [];
    
    const customTriggers = allTriggers.filter((t: any) => 
      t.name?.startsWith('Custom Event - ')
    );
    const triggersToKeep = new Set<string>();
    const triggersToDelete: any[] = [];
    const seenEventNames = new Set<string>();

    for (const trigger of customTriggers) {
      const eventName = extractEventName(trigger);
      if (eventName && REQUIRED_EVENTS.includes(eventName)) {
        if (!seenEventNames.has(eventName)) {
          triggersToKeep.add(trigger.name);
          seenEventNames.add(eventName);
        } else {
          triggersToDelete.push(trigger);
        }
      } else {
        triggersToDelete.push(trigger);
      }
    }

    console.log(`   Found ${customTriggers.length} custom event triggers`);
    console.log(`   ✅ Keeping ${triggersToKeep.size} required triggers`);
    console.log(`   🗑️  Removing ${triggersToDelete.length} unnecessary/duplicate triggers`);

    console.log('\n🏷️  Step 3: Analyzing Current Tags...');
    const tagsResponse = await gtm.accounts.containers.workspaces.tags.list({
      parent: workspacePath,
    });
    const allTags = tagsResponse.data.tag || [];
    
    const ga4Tags = allTags.filter((t: any) => 
      t.type === 'gaawe' && t.name?.startsWith('GA4 Event - ')
    );
    const tagsToKeep = new Set<string>();
    const tagsToDelete: any[] = [];
    const seenTagEvents = new Set<string>();

    for (const tag of ga4Tags) {
      const eventName = extractTagEventName(tag);
      if (eventName && REQUIRED_EVENTS.includes(eventName)) {
        if (!seenTagEvents.has(eventName)) {
          tagsToKeep.add(tag.name);
          seenTagEvents.add(eventName);
        } else {
          tagsToDelete.push(tag);
        }
      } else {
        tagsToDelete.push(tag);
      }
    }

    console.log(`   Found ${ga4Tags.length} GA4 event tags`);
    console.log(`   ✅ Keeping ${tagsToKeep.size} required tags`);
    console.log(`   🗑️  Removing ${tagsToDelete.length} unnecessary/duplicate tags`);

    console.log('\n🗑️  Step 4: Deleting Unnecessary Items...\n');

    let deletedCount = 0;
    let errorCount = 0;

    for (const tag of tagsToDelete) {
      try {
        await gtm.accounts.containers.workspaces.tags.delete({
          path: tag.path,
        });
        console.log(`   ✅ Deleted tag: ${tag.name}`);
        deletedCount++;
      } catch (error: any) {
        if (!error.message.includes('404')) {
          console.log(`   ⚠️  Could not delete tag ${tag.name}: ${error.message}`);
          errorCount++;
        }
      }
    }

    for (const trigger of triggersToDelete) {
      try {
        await gtm.accounts.containers.workspaces.triggers.delete({
          path: trigger.path,
        });
        console.log(`   ✅ Deleted trigger: ${trigger.name}`);
        deletedCount++;
      } catch (error: any) {
        if (!error.message.includes('404')) {
          console.log(`   ⚠️  Could not delete trigger ${trigger.name}: ${error.message}`);
          errorCount++;
        }
      }
    }

    for (const variable of variablesToDelete) {
      try {
        await gtm.accounts.containers.workspaces.variables.delete({
          path: variable.path,
        });
        console.log(`   ✅ Deleted variable: ${variable.name}`);
        deletedCount++;
      } catch (error: any) {
        if (!error.message.includes('404')) {
          console.log(`   ⚠️  Could not delete variable ${variable.name}: ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Cleanup Complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Deleted: ${deletedCount} items`);
    if (errorCount > 0) {
      console.log(`   ⚠️  Errors: ${errorCount} items`);
    }
    console.log(`   📦 Variables kept: ${variablesToKeep.size}`);
    console.log(`   🎯 Triggers kept: ${triggersToKeep.size}`);
    console.log(`   🏷️  Tags kept: ${tagsToKeep.size}\n`);

    console.log('📝 Next Steps:');
    console.log('   1. Review changes in GTM workspace');
    console.log('   2. Test in Preview mode');
    console.log('   3. Run: npm run gtm:setup (to add missing items)');
    console.log('   4. Publish when ready: npm run gtm:publish\n');

  } catch (error: any) {
    console.log('\n❌ Cleanup failed:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

cleanupGTM();
