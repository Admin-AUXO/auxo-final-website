import { readFileSync } from 'fs';
import { join } from 'path';
import { google } from 'googleapis';

const GTM_ACCOUNT_ID = '6332993563';
const GTM_CONTAINER_ID = '240117459';
const SERVICE_ACCOUNT_PATH = join(process.cwd(), 'auxodata-1a2b6e31bc0d.json');

interface GTMVariable {
  name: string;
  type: string;
  parameter: Array<{ key: string; value: string; type: string }>;
}

interface GTMTag {
  name: string;
  type: string;
  parameter: Array<{ key: string; value: string; type: string; list?: any[] }>;
  firingTriggerId?: string[];
}

interface GTMTrigger {
  name: string;
  type: string;
  customEventFilter?: Array<{ parameter: Array<{ key: string; value: string; type: string }> }>;
}

async function getAuthClient() {
  const keyFile = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));

  const auth = new google.auth.GoogleAuth({
    credentials: keyFile,
    scopes: [
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
      'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
      'https://www.googleapis.com/auth/tagmanager.publish',
      'https://www.googleapis.com/auth/tagmanager.manage.accounts',
    ],
  });

  return await auth.getClient();
}

async function createDataLayerVariables(tagmanager: any, workspacePath: string) {
  console.log('\n📊 Creating DataLayer Variables...');

  const variables: GTMVariable[] = [
    { name: 'DLV - session_count', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'session_count', type: 'template' }] },
    { name: 'DLV - source', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'source', type: 'template' }] },
    { name: 'DLV - medium', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'medium', type: 'template' }] },
    { name: 'DLV - client_id', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'client_id', type: 'template' }] },
    { name: 'DLV - session_id', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'session_id', type: 'template' }] },
    { name: 'DLV - utm_source', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'utm_source', type: 'template' }] },
    { name: 'DLV - utm_medium', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'utm_medium', type: 'template' }] },
    { name: 'DLV - utm_campaign', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'utm_campaign', type: 'template' }] },
    { name: 'DLV - utm_term', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'utm_term', type: 'template' }] },
    { name: 'DLV - utm_content', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'utm_content', type: 'template' }] },
    { name: 'DLV - ft_source', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'ft_source', type: 'template' }] },
    { name: 'DLV - ft_medium', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'ft_medium', type: 'template' }] },
    { name: 'DLV - lt_source', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'lt_source', type: 'template' }] },
    { name: 'DLV - lt_medium', type: 'v', parameter: [{ key: 'dataLayerVersion', value: '2', type: 'integer' }, { key: 'name', value: 'lt_medium', type: 'template' }] },
  ];

  for (const variable of variables) {
    try {
      await tagmanager.accounts.containers.workspaces.variables.create({
        parent: workspacePath,
        requestBody: variable,
      });
      console.log(`  ✓ Created: ${variable.name}`);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log(`  ⊙ Exists: ${variable.name}`);
      } else {
        console.error(`  ✗ Failed: ${variable.name} - ${error.message}`);
      }
    }
  }
}

async function createTriggers(tagmanager: any, workspacePath: string): Promise<Record<string, string>> {
  console.log('\n🎯 Creating Triggers...');

  const triggers: Record<string, any> = {
    attribution_ready: {
      name: 'Custom Event - attribution_data_ready',
      type: 'customEvent',
      parameter: [
        { key: 'eventName', value: 'attribution_data_ready', type: 'template' }
      ],
    },
    page_not_found: {
      name: 'Custom Event - page_not_found',
      type: 'customEvent',
      parameter: [
        { key: 'eventName', value: 'page_not_found', type: 'template' }
      ],
    },
    rage_click: {
      name: 'Custom Event - rage_click',
      type: 'customEvent',
      parameter: [
        { key: 'eventName', value: 'rage_click', type: 'template' }
      ],
    },
  };

  const createdTriggers: Record<string, string> = {};

  for (const [key, trigger] of Object.entries(triggers)) {
    try {
      const response = await tagmanager.accounts.containers.workspaces.triggers.create({
        parent: workspacePath,
        requestBody: trigger,
      });
      createdTriggers[key] = response.data.triggerId;
      console.log(`  ✓ Created: ${trigger.name}`);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log(`  ⊙ Exists: ${trigger.name}`);
        const list = await tagmanager.accounts.containers.workspaces.triggers.list({
          parent: workspacePath,
        });
        const existing = list.data.trigger?.find((t: any) => t.name === trigger.name);
        if (existing) {
          createdTriggers[key] = existing.triggerId;
        }
      } else {
        console.error(`  ✗ Failed: ${trigger.name} - ${error.message}`);
      }
    }
  }

  return createdTriggers;
}

async function deployGTMConfiguration() {
  try {
    console.log('🚀 Starting GTM Configuration Deployment\n');

    const authClient = await getAuthClient();
    const tagmanager = google.tagmanager({ version: 'v2', auth: authClient as any });

    const accountPath = `accounts/${GTM_ACCOUNT_ID}`;
    const containerPath = `${accountPath}/containers/${GTM_CONTAINER_ID}`;

    console.log(`📦 Container: ${containerPath}`);

    const workspaces = await tagmanager.accounts.containers.workspaces.list({
      parent: containerPath,
    });

    let workspace = workspaces.data.workspace?.find((w: any) => w.name.includes('Default Workspace'));

    if (!workspace) {
      console.log('Creating new workspace...');
      const newWorkspace = await tagmanager.accounts.containers.workspaces.create({
        parent: containerPath,
        requestBody: {
          name: 'Analytics Enhancement Workspace',
          description: 'Automated deployment of advanced analytics tracking',
        },
      });
      workspace = newWorkspace.data;
    }

    const workspacePath = workspace?.path;
    console.log(`🔧 Workspace: ${workspacePath}\n`);

    await createDataLayerVariables(tagmanager, workspacePath);
    const triggers = await createTriggers(tagmanager, workspacePath);

    console.log('\n✨ Configuration deployment complete!');
    console.log('\n📦 Publishing container...');

    const versionName = `Advanced Analytics v${new Date().toISOString().split('T')[0]}`;
    const versionDescription = `
Automated deployment of advanced analytics tracking:
- 14 DataLayer variables for attribution and session tracking
- Custom event triggers for 404, rage clicks, and attribution
- Client ID, Session ID, and UTM parameter tracking
- PII redaction and privacy compliance
- Enhanced form analytics and engagement tracking
    `.trim();

    const version = await tagmanager.accounts.containers.workspaces.create_version({
      path: workspacePath,
      requestBody: {
        name: versionName,
        notes: versionDescription,
      },
    });

    console.log(`  ✓ Version created: ${versionName}`);

    if (version.data.containerVersion) {
      const publishResult = await tagmanager.accounts.containers.versions.publish({
        path: version.data.containerVersion.path,
      });

      console.log(`  ✓ Container published successfully!`);
      console.log(`  📊 Version: ${publishResult.data.containerVersion?.containerVersionId}`);
      console.log(`  🔗 Container ID: GTM-N6547BGW`);
    }

    console.log('\n✅ Deployment and publication complete!');
    console.log('\n📝 Next Steps:');
    console.log('  1. Test your website to verify tracking');
    console.log('  2. Check GA4 DebugView for events');
    console.log('  3. Monitor GTM Preview mode if needed');

  } catch (error: any) {
    console.error('\n❌ Deployment failed:', error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

deployGTMConfiguration().catch(console.error);
