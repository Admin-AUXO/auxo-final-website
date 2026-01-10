/**
 * GTM API Setup Script
 * Programmatically updates GTM container with 2026 best practices
 *
 * Run with: npx tsx scripts/gtm-api-setup.ts
 */

import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';

// Configuration
const GTM_ACCOUNT_PATH = 'accounts/6332993563';
const GTM_CONTAINER_PUBLIC_ID = 'GTM-N6547BGW';
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'auxodata-1a2b6e31bc0d.json');

// Initialize GTM API client
async function getGTMClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/tagmanager.edit.containers'],
  });

  return google.tagmanager({ version: 'v2', auth });
}

/**
 * Get workspace or create a new one
 */
async function getOrCreateWorkspace(gtm: any, containerPath: string): Promise<string> {
  console.log('📋 Checking for existing workspaces...');

  try {
    const workspaces = await gtm.accounts.containers.workspaces.list({
      parent: containerPath,
    });

    // Look for our automation workspace
    let workspace = workspaces.data.workspace?.find(
      (ws: any) => ws.name === 'Automation - 2026 Optimization'
    );

    if (workspace) {
      console.log('✅ Found existing workspace:', workspace.path);
      return workspace.path;
    }

    // Create new workspace
    console.log('🆕 Creating new workspace...');
    const newWorkspace = await gtm.accounts.containers.workspaces.create({
      parent: containerPath,
      requestBody: {
        name: 'Automation - 2026 Optimization',
        description: 'Automated setup for GA4 2026 best practices including Consent Mode v2, Core Web Vitals, and Enhanced Conversions',
      },
    });

    console.log('✅ Created workspace:', newWorkspace.data.path);
    return newWorkspace.data.path;
  } catch (error: any) {
    console.error('❌ Error with workspace:', error.message);
    throw error;
  }
}

/**
 * Create GA4 Configuration Tag with Consent Mode
 */
async function createGA4ConfigTag(gtm: any, workspacePath: string): Promise<void> {
  console.log('🏷️  Creating GA4 Configuration Tag with Consent Mode...');

  try {
    const tag = {
      name: 'GA4 - Config - Consent Mode v2',
      type: 'gaawc', // GA4 Configuration Tag
      parameter: [
        { type: 'template', key: 'measurementId', value: '{{GA4 Measurement ID}}' },
        { type: 'boolean', key: 'sendPageView', value: 'true' },
        { type: 'boolean', key: 'enableSendToServerContainer', value: 'false' },
        {
          type: 'list',
          key: 'userProperties',
          list: [
            {
              type: 'map',
              map: [
                { type: 'template', key: 'name', value: 'user_type' },
                { type: 'template', key: 'value', value: '{{User Type}}' },
              ],
            },
            {
              type: 'map',
              map: [
                { type: 'template', key: 'name', value: 'device_category' },
                { type: 'template', key: 'value', value: '{{Device Category}}' },
              ],
            },
          ],
        },
      ],
      firingTriggerId: ['{{All Pages Trigger ID}}'], // Will need to get actual trigger ID
    };

    await gtm.accounts.containers.workspaces.tags.create({
      parent: workspacePath,
      requestBody: tag,
    });

    console.log('✅ Created GA4 Config Tag');
  } catch (error: any) {
    console.error('❌ Error creating GA4 Config Tag:', error.message);
  }
}

/**
 * Create Consent Mode Variables
 */
async function createConsentVariables(gtm: any, workspacePath: string): Promise<void> {
  console.log('📊 Creating Consent Mode Variables...');

  const variables = [
    {
      name: 'Consent - Analytics Storage',
      type: 'jsm',
      parameter: [
        {
          type: 'template',
          key: 'javascript',
          value: `
function() {
  try {
    var consent = localStorage.getItem('auxo_consent_preferences');
    if (!consent) return 'denied';
    var parsed = JSON.parse(consent);
    return parsed.preferences && parsed.preferences.analytics ? 'granted' : 'denied';
  } catch(e) {
    return 'denied';
  }
}
          `.trim(),
        },
      ],
    },
    {
      name: 'Consent - Ad Storage',
      type: 'jsm',
      parameter: [
        {
          type: 'template',
          key: 'javascript',
          value: `
function() {
  try {
    var consent = localStorage.getItem('auxo_consent_preferences');
    if (!consent) return 'denied';
    var parsed = JSON.parse(consent);
    return parsed.preferences && parsed.preferences.marketing ? 'granted' : 'denied';
  } catch(e) {
    return 'denied';
  }
}
          `.trim(),
        },
      ],
    },
    {
      name: 'User Type',
      type: 'jsm',
      parameter: [
        {
          type: 'template',
          key: 'javascript',
          value: `
function() {
  try {
    var returning = document.cookie.indexOf('_ga=') !== -1;
    return returning ? 'returning' : 'new';
  } catch(e) {
    return 'unknown';
  }
}
          `.trim(),
        },
      ],
    },
    {
      name: 'Device Category',
      type: 'jsm',
      parameter: [
        {
          type: 'template',
          key: 'javascript',
          value: `
function() {
  var width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
          `.trim(),
        },
      ],
    },
    {
      name: 'Page Context',
      type: 'jsm',
      parameter: [
        {
          type: 'template',
          key: 'javascript',
          value: `
function() {
  var path = window.location.pathname;
  if (path === '/' || path === '') return 'homepage';
  if (path.includes('/services')) return 'services';
  if (path.includes('/about')) return 'about';
  if (path.includes('/contact')) return 'contact';
  if (path.includes('/blog')) return 'blog';
  if (path.includes('/legal')) return 'legal';
  return 'other';
}
          `.trim(),
        },
      ],
    },
  ];

  for (const variable of variables) {
    try {
      await gtm.accounts.containers.workspaces.variables.create({
        parent: workspacePath,
        requestBody: variable,
      });
      console.log(`✅ Created variable: ${variable.name}`);
    } catch (error: any) {
      console.error(`❌ Error creating variable ${variable.name}:`, error.message);
    }
  }
}

/**
 * Create Custom Event Triggers
 */
async function createCustomTriggers(gtm: any, workspacePath: string): Promise<void> {
  console.log('🎯 Creating Custom Event Triggers...');

  const triggers = [
    {
      name: 'Event - Consent Update',
      type: 'customEvent',
      customEventFilter: [
        {
          type: 'equals',
          parameter: [
            { type: 'template', key: 'arg0', value: '{{_event}}' },
            { type: 'template', key: 'arg1', value: 'consent_update' },
          ],
        },
      ],
    },
    {
      name: 'Event - Form Submission',
      type: 'customEvent',
      customEventFilter: [
        {
          type: 'equals',
          parameter: [
            { type: 'template', key: 'arg0', value: '{{_event}}' },
            { type: 'template', key: 'arg1', value: 'generate_lead' },
          ],
        },
      ],
    },
    {
      name: 'Event - Core Web Vitals',
      type: 'customEvent',
      customEventFilter: [
        {
          type: 'equals',
          parameter: [
            { type: 'template', key: 'arg0', value: '{{_event}}' },
            { type: 'template', key: 'arg1', value: 'core_web_vitals' },
          ],
        },
      ],
    },
    {
      name: 'Event - Enhanced Conversion',
      type: 'customEvent',
      customEventFilter: [
        {
          type: 'equals',
          parameter: [
            { type: 'template', key: 'arg0', value: '{{_event}}' },
            { type: 'template', key: 'arg1', value: 'enhanced_conversion' },
          ],
        },
      ],
    },
  ];

  for (const trigger of triggers) {
    try {
      await gtm.accounts.containers.workspaces.triggers.create({
        parent: workspacePath,
        requestBody: trigger,
      });
      console.log(`✅ Created trigger: ${trigger.name}`);
    } catch (error: any) {
      console.error(`❌ Error creating trigger ${trigger.name}:`, error.message);
    }
  }
}

/**
 * Create Enhanced Conversion Tag
 */
async function createEnhancedConversionTag(gtm: any, workspacePath: string): Promise<void> {
  console.log('🏷️  Creating Enhanced Conversion Tag...');

  try {
    const tag = {
      name: 'GA4 - Enhanced Conversions',
      type: 'gaawe', // GA4 Event Tag
      parameter: [
        { type: 'template', key: 'measurementId', value: '{{GA4 Measurement ID}}' },
        { type: 'template', key: 'eventName', value: 'enhanced_conversion' },
        {
          type: 'list',
          key: 'eventParameters',
          list: [
            {
              type: 'map',
              map: [
                { type: 'template', key: 'name', value: 'enhanced_conversion_data' },
                { type: 'template', key: 'value', value: '{{Enhanced Conversion Data}}' },
              ],
            },
          ],
        },
      ],
      firingTriggerId: ['{{Enhanced Conversion Trigger ID}}'],
    };

    await gtm.accounts.containers.workspaces.tags.create({
      parent: workspacePath,
      requestBody: tag,
    });

    console.log('✅ Created Enhanced Conversion Tag');
  } catch (error: any) {
    console.error('❌ Error creating Enhanced Conversion Tag:', error.message);
  }
}

/**
 * Main setup function
 */
async function setupGTMContainer() {
  console.log('🚀 Starting GTM Container Setup...\n');

  try {
    const gtm = await getGTMClient();
    console.log('✅ GTM API client initialized\n');

    console.log('📋 Looking up container ID...');
    const containersResponse = await gtm.accounts.containers.list({
      parent: GTM_ACCOUNT_PATH,
    });

    const container = containersResponse.data.container?.find(
      (c: any) => c.publicId === GTM_CONTAINER_PUBLIC_ID
    );

    if (!container || !container.path) {
      throw new Error(`Container with public ID ${GTM_CONTAINER_PUBLIC_ID} not found`);
    }

    const containerPath = container.path;
    console.log(`✅ Found container: ${containerPath}\n`);

    const workspacePath = await getOrCreateWorkspace(gtm, containerPath);
    console.log('');

    // Create variables
    await createConsentVariables(gtm, workspacePath);
    console.log('');

    // Create triggers
    await createCustomTriggers(gtm, workspacePath);
    console.log('');

    // Create tags
    await createGA4ConfigTag(gtm, workspacePath);
    await createEnhancedConversionTag(gtm, workspacePath);
    console.log('');

    console.log('✅ GTM Container setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Review the changes in GTM workspace');
    console.log('2. Test the implementation in preview mode');
    console.log('3. Publish the workspace when ready');
    console.log('4. Monitor GA4 for incoming events\n');
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

export { setupGTMContainer, getGTMClient };

setupGTMContainer();
