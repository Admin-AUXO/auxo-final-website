#!/usr/bin/env node

import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GTM_CONTAINER_ID_PUBLIC = 'GTM-N6547BGW';
const GTM_CONTAINER_ID_INTERNAL = '240117459';
const GA4_MEASUREMENT_ID = 'G-WBMKHRWS7Z';

const DATA_LAYER_VARIABLES = [
  'form_name', 'form_location', 'form_type', 'event_category', 'event_label',
  'cta_location', 'cta_destination', 'cta_type', 'link_url', 'link_location',
  'link_type', 'percent_scrolled', 'theme', 'location', 'context', 'value',
  'currency', 'items', 'item_list_id', 'item_list_name', 'outbound_url',
  'fields_completed'
];

const EVENTS = [
  {
    name: 'generate_lead',
    parameters: ['form_name', 'form_location', 'form_type', 'value', 'currency'],
    conversion: true
  },
  {
    name: 'schedule_meeting',
    parameters: ['event_category', 'event_label', 'location', 'context', 'value'],
    conversion: true
  },
  {
    name: 'cta_click',
    parameters: ['event_category', 'event_label', 'cta_location', 'cta_destination', 'cta_type']
  },
  {
    name: 'navigation_click',
    parameters: ['event_category', 'event_label', 'link_url', 'link_location', 'link_type']
  },
  {
    name: 'scroll',
    parameters: ['event_category', 'event_label', 'percent_scrolled']
  },
  {
    name: 'theme_change',
    parameters: ['event_category', 'event_label', 'theme']
  },
  {
    name: 'form_start',
    parameters: ['event_category', 'event_label', 'form_name', 'form_location']
  },
  {
    name: 'form_abandonment',
    parameters: ['event_category', 'event_label', 'form_name', 'fields_completed']
  },
  {
    name: 'view_item',
    parameters: ['currency', 'value', 'items']
  },
  {
    name: 'view_item_list',
    parameters: ['item_list_id', 'item_list_name']
  },
  {
    name: 'click',
    parameters: ['event_category', 'event_label', 'outbound_url', 'link_location']
  }
];

async function getAuth() {
  let keyFile = process.env.GTM_SERVICE_ACCOUNT_KEY;
  
  if (!keyFile) {
    const fs = await import('fs');
    const keyFileWithAt = join(__dirname, '../@auxodata-1a2b6e31bc0d.json');
    const keyFileWithoutAt = join(__dirname, '../auxodata-1a2b6e31bc0d.json');
    
    if (fs.existsSync(keyFileWithAt)) {
      keyFile = keyFileWithAt;
    } else if (fs.existsSync(keyFileWithoutAt)) {
      keyFile = keyFileWithoutAt;
    } else {
      keyFile = keyFileWithAt;
    }
  }
  
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/tagmanager.edit.containers']
  });

  return auth.getClient();
}

async function getContainerInfo(tagmanager, accountId) {
  try {
    console.log(`  Checking account: ${accountId}...`);
    const containers = await tagmanager.accounts.containers.list({
      parent: `accounts/${accountId}`
    });

    if (!containers.data.container || containers.data.container.length === 0) {
      console.log('  No containers found in account. Available containers:');
      throw new Error(`No containers found in account ${accountId}`);
    }

    console.log(`  Found ${containers.data.container.length} container(s)`);
    let container = containers.data.container.find(c => c.containerId === GTM_CONTAINER_ID_INTERNAL);
    if (!container) {
      container = containers.data.container.find(c => c.publicId === GTM_CONTAINER_ID_PUBLIC);
    }
    if (!container) {
      console.log('  Available containers:');
      containers.data.container.forEach(c => {
        console.log(`    - ${c.name} (ID: ${c.containerId}, Public: ${c.publicId || 'N/A'})`);
      });
      throw new Error(`Container ${GTM_CONTAINER_ID_PUBLIC} (${GTM_CONTAINER_ID_INTERNAL}) not found in account ${accountId}`);
    }

    return container;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('  ❌ Account not found or service account lacks permission');
      console.error('  Verify:');
      console.error('    1. Account ID is correct: 6332993563');
      console.error('    2. Service account has Tag Manager Editor role');
      console.error('    3. Service account has access to this account/container');
    }
    console.error('Error fetching container:', error.message);
    throw error;
  }
}

async function getOrCreateWorkspace(tagmanager, accountId, containerId) {
  try {
    const workspaces = await tagmanager.accounts.containers.workspaces.list({
      parent: `accounts/${accountId}/containers/${containerId}`
    });

    const workspace = workspaces.data.workspace?.[0];
    if (workspace) {
      console.log(`Using existing workspace: ${workspace.name} (${workspace.workspaceId})`);
      return workspace;
    }

    const newWorkspace = await tagmanager.accounts.containers.workspaces.create({
      parent: `accounts/${accountId}/containers/${containerId}`,
      requestBody: {
        name: 'API Setup Workspace',
        description: 'Created via API for automated GTM setup'
      }
    });

    console.log(`Created new workspace: ${newWorkspace.data.name}`);
    return newWorkspace.data;
  } catch (error) {
    console.error('Error managing workspace:', error.message);
    throw error;
  }
}

async function createVariable(tagmanager, parent, variableName) {
  try {
    const existing = await tagmanager.accounts.containers.workspaces.variables.list({
      parent
    });

    const exists = existing.data.variable?.some(v => v.name === `DLV - ${variableName}`);
    if (exists) {
      console.log(`  ✓ Variable DLV - ${variableName} already exists (skipped)`);
      return null;
    }

    const variable = await tagmanager.accounts.containers.workspaces.variables.create({
      parent,
      requestBody: {
        name: `DLV - ${variableName}`,
        type: 'v',
        parameter: [
          {
            type: 'template',
            key: 'dataLayerVersion',
            value: '2'
          },
          {
            type: 'template',
            key: 'name',
            value: variableName
          }
        ]
      }
    });

    console.log(`  ✓ Created variable: DLV - ${variableName}`);
    return variable.data;
  } catch (error) {
    console.error(`  ✗ Failed to create variable DLV - ${variableName}:`, error.message);
    return null;
  }
}

async function createTrigger(tagmanager, parent, eventName) {
  try {
    const existing = await tagmanager.accounts.containers.workspaces.triggers.list({
      parent
    });

    const existingTrigger = existing.data.trigger?.find(t => t.name === `Custom Event - ${eventName}`);
    if (existingTrigger) {
      console.log(`  ✓ Trigger Custom Event - ${eventName} already exists (skipped)`);
      return existingTrigger;
    }

    const trigger = await tagmanager.accounts.containers.workspaces.triggers.create({
      parent,
      requestBody: {
        name: `Custom Event - ${eventName}`,
        type: 'CUSTOM_EVENT',
        customEventFilter: [
          {
            type: 'EQUALS',
            parameter: [
              {
                type: 'template',
                key: 'arg0',
                value: '{{_event}}'
              },
              {
                type: 'template',
                key: 'arg1',
                value: eventName
              }
            ]
          }
        ]
      }
    });

    console.log(`  ✓ Created trigger: Custom Event - ${eventName}`);
    return trigger.data;
  } catch (error) {
    console.error(`  ✗ Failed to create trigger for ${eventName}:`, error.message);
    return null;
  }
}

async function createEventTag(tagmanager, parent, event, triggerId) {
  try {
    const existing = await tagmanager.accounts.containers.workspaces.tags.list({
      parent
    });

    const exists = existing.data.tag?.some(t => t.name === `GA4 Event - ${event.name}`);
    if (exists) {
      console.log(`  ✓ Tag GA4 Event - ${event.name} already exists (skipped)`);
      return null;
    }

    const parameters = event.parameters.map(param => ({
      type: 'template',
      key: param,
      value: `{{DLV - ${param}}}`
    }));

    const tag = await tagmanager.accounts.containers.workspaces.tags.create({
      parent,
      requestBody: {
        name: `GA4 Event - ${event.name}`,
        type: 'gaawe',
        parameter: [
          {
            type: 'template',
            key: 'eventName',
            value: event.name
          },
          {
            type: 'template',
            key: 'measurementIdOverride',
            value: GA4_MEASUREMENT_ID
          },
          ...parameters
        ],
        firingTriggerId: [triggerId]
      }
    });

    console.log(`  ✓ Created tag: GA4 Event - ${event.name}`);
    return tag.data;
  } catch (error) {
    console.error(`  ✗ Failed to create tag for ${event.name}:`, error.message);
    return null;
  }
}

async function createGA4ConfigTag(tagmanager, parent, allPagesTriggerId) {
  try {
    const existing = await tagmanager.accounts.containers.workspaces.tags.list({
      parent
    });

    const exists = existing.data.tag?.some(t => t.name === 'GA4 - Configuration');
    if (exists) {
      console.log('  ✓ GA4 Configuration tag already exists (skipped)');
      return null;
    }

    const tag = await tagmanager.accounts.containers.workspaces.tags.create({
      parent,
      requestBody: {
        name: 'GA4 - Configuration',
        type: 'gaawc',
        parameter: [
          {
            type: 'template',
            key: 'measurementId',
            value: GA4_MEASUREMENT_ID
          },
          {
            type: 'boolean',
            key: 'sendPageView',
            value: 'true'
          },
          {
            type: 'boolean',
            key: 'enableScrollTracking',
            value: 'true'
          },
          {
            type: 'boolean',
            key: 'enableOutboundClicks',
            value: 'true'
          },
          {
            type: 'boolean',
            key: 'enableSiteSearch',
            value: 'true'
          },
          {
            type: 'boolean',
            key: 'enableVideoEngagement',
            value: 'true'
          },
          {
            type: 'boolean',
            key: 'enableFileDownloads',
            value: 'true'
          }
        ],
        firingTriggerId: [allPagesTriggerId]
      }
    });

    console.log('  ✓ Created GA4 Configuration tag');
    return tag.data;
  } catch (error) {
    console.error('  ✗ Failed to create GA4 Configuration tag:', error.message);
    return null;
  }
}

async function getOrCreateAllPagesTrigger(tagmanager, parent) {
  try {
    const existing = await tagmanager.accounts.containers.workspaces.triggers.list({
      parent
    });

    const allPagesTrigger = existing.data.trigger?.find(t => t.name === 'All Pages');
    if (allPagesTrigger) {
      return allPagesTrigger.triggerId;
    }

    const trigger = await tagmanager.accounts.containers.workspaces.triggers.create({
      parent,
      requestBody: {
        name: 'All Pages',
        type: 'PAGEVIEW'
      }
    });

    console.log('  ✓ Created All Pages trigger');
    return trigger.data.triggerId;
  } catch (error) {
    console.error('  ✗ Failed to create All Pages trigger:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting GTM API Setup...\n');

  const accountId = process.env.GTM_ACCOUNT_ID;
  if (!accountId) {
    console.error('❌ Error: GTM_ACCOUNT_ID environment variable is required');
    console.log('\nUsage:');
    console.log('  GTM_ACCOUNT_ID=123456789 node scripts/setup-gtm.js');
    console.log('\nOr set up a service account:');
    console.log('  1. Create service account in Google Cloud Console');
    console.log('  2. Enable Tag Manager API');
    console.log('  3. Download JSON key file');
    console.log('  4. Set GTM_SERVICE_ACCOUNT_KEY environment variable or place at @auxodata-1a2b6e31bc0d.json');
    process.exit(1);
  }

  try {
    const auth = await getAuth();
    const tagmanager = google.tagmanager({ version: 'v2', auth });

    console.log(`📦 Fetching container: ${GTM_CONTAINER_ID_PUBLIC} (${GTM_CONTAINER_ID_INTERNAL})...`);
    const container = await getContainerInfo(tagmanager, accountId);
    console.log(`✓ Found container: ${container.name}\n`);

    const workspace = await getOrCreateWorkspace(tagmanager, accountId, container.containerId);
    const parent = `accounts/${accountId}/containers/${container.containerId}/workspaces/${workspace.workspaceId}`;

    console.log('\n📝 Step 1: Creating Data Layer Variables...');
    let variablesCreated = 0;
    for (const variableName of DATA_LAYER_VARIABLES) {
      const result = await createVariable(tagmanager, parent, variableName);
      if (result) variablesCreated++;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (variablesCreated === 0) {
      console.log('  ℹ All variables already exist, skipping creation');
    }

    console.log('\n🎯 Step 2: Creating Triggers...');
    const allPagesTriggerId = await getOrCreateAllPagesTrigger(tagmanager, parent);
    await new Promise(resolve => setTimeout(resolve, 500));
    const triggerIds = {};
    
    const existingTriggers = await tagmanager.accounts.containers.workspaces.triggers.list({ parent });
    const existingTriggerMap = new Map();
    existingTriggers.data.trigger?.forEach(t => {
      if (t.name.startsWith('Custom Event - ')) {
        const eventName = t.name.replace('Custom Event - ', '');
        existingTriggerMap.set(eventName, t);
        triggerIds[eventName] = t.triggerId;
      }
    });

    let triggersCreated = 0;
    for (const event of EVENTS) {
      if (!existingTriggerMap.has(event.name)) {
        const trigger = await createTrigger(tagmanager, parent, event.name);
        if (trigger) {
          triggerIds[event.name] = trigger.triggerId;
          triggersCreated++;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log(`  ✓ Trigger Custom Event - ${event.name} already exists (skipped)`);
      }
    }
    if (triggersCreated === 0 && existingTriggerMap.size === EVENTS.length) {
      console.log('  ℹ All triggers already exist, skipping creation');
    }

    console.log('\n🏷️  Step 3: Creating GA4 Configuration Tag...');
    await createGA4ConfigTag(tagmanager, parent, allPagesTriggerId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n📊 Step 4: Creating Event Tags...');
    const existingTags = await tagmanager.accounts.containers.workspaces.tags.list({ parent });
    const existingTagNames = new Set(existingTags.data.tag?.map(t => t.name) || []);
    
    let tagsCreated = 0;
    for (const event of EVENTS) {
      const tagName = `GA4 Event - ${event.name}`;
      if (!existingTagNames.has(tagName) && triggerIds[event.name]) {
        const result = await createEventTag(tagmanager, parent, event, triggerIds[event.name]);
        if (result) tagsCreated++;
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (existingTagNames.has(tagName)) {
        console.log(`  ✓ Tag ${tagName} already exists (skipped)`);
      }
    }
    if (tagsCreated === 0) {
      console.log('  ℹ All event tags already exist, skipping creation');
    }

    console.log('\n✅ Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('  1. Review the workspace in GTM UI');
    console.log('  2. Test in Preview Mode');
    console.log('  3. Create a version and publish');
    console.log(`\n🔗 Workspace: https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${container.containerId}/workspaces/${workspace.workspaceId}`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.response) {
      console.error('API Error:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
