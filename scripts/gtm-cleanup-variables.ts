import { google } from 'googleapis';
import * as path from 'path';

const GTM_ACCOUNT_PATH = 'accounts/6332993563';
const GTM_CONTAINER_PUBLIC_ID = 'GTM-N6547BGW';
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), '..', 'auxodata-1a2b6e31bc0d.json');

const VARIABLES_TO_REMOVE = [
  'DLV - enhanced_conversion_data',
  'DLV - page_load_time',
  'DLV - task_duration',
  'DLV - video_title',
  'DLV - video_percent',
  'DLV - video_url',
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

async function removeUnusedVariables(gtm: any, workspacePath: string) {
  console.log('\n🗑️  Removing Unused Variables...');

  const variablesResponse = await gtm.accounts.containers.workspaces.variables.list({
    parent: workspacePath,
  });

  const variables = variablesResponse.data.variable || [];
  let removed = 0;

  for (const variable of variables) {
    if (VARIABLES_TO_REMOVE.includes(variable.name || '')) {
      try {
        await gtm.accounts.containers.workspaces.variables.delete({
          path: variable.path,
        });
        console.log(`   ✅ Removed variable: ${variable.name}`);
        removed++;
      } catch (error: any) {
        console.log(`   ❌ Failed to remove variable ${variable.name}: ${error.message}`);
      }
    }
  }

  console.log(`   📊 Removed ${removed} unused variables`);
}

async function cleanupVariables() {
  console.log('🚀 GTM Variable Cleanup\n');
  console.log('='.repeat(60));

  try {
    const gtm = await getGTMClient();
    console.log('✅ GTM API client initialized');

    const { containerPath, workspacePath } = await getContainerAndWorkspace(gtm);
    console.log(`✅ Container: ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log(`✅ Workspace: Default Workspace`);

    await removeUnusedVariables(gtm, workspacePath);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Cleanup Complete!\n');

  } catch (error: any) {
    console.log('\n❌ Cleanup failed:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

cleanupVariables();
