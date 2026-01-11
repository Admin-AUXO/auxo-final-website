import { readFileSync } from 'fs';
import { join } from 'path';
import { google } from 'googleapis';

const GTM_ACCOUNT_ID = '6332993563';
const GTM_CONTAINER_ID = '240117459';
const SERVICE_ACCOUNT_PATH = join(process.cwd(), 'auxodata-1a2b6e31bc0d.json');

async function verifyDeployment() {
  try {
    const keyFile = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
    const auth = new google.auth.GoogleAuth({
      credentials: keyFile,
      scopes: ['https://www.googleapis.com/auth/tagmanager.readonly'],
    });

    const authClient = await auth.getClient();
    const tagmanager = google.tagmanager({ version: 'v2', auth: authClient as any });

    const containerPath = `accounts/${GTM_ACCOUNT_ID}/containers/${GTM_CONTAINER_ID}`;
    const workspaces = await tagmanager.accounts.containers.workspaces.list({ parent: containerPath });
    const workspace = workspaces.data.workspace?.find((w: any) => w.name.includes('Default'));

    if (!workspace?.path) {
      throw new Error('Workspace path not found');
    }

    console.log('🔍 GTM Container Verification\n');
    console.log(`📦 Container: GTM-N6547BGW`);
    console.log(`🔧 Workspace: ${workspace.name}\n`);

    const vars = await tagmanager.accounts.containers.workspaces.variables.list({
      parent: workspace.path
    });

    console.log(`📊 DataLayer Variables (${vars?.data?.variable?.length || 0}):`);
    vars?.data?.variable?.forEach((v: any) => {
      console.log(`  ✓ ${v.name}`);
    });

    const triggers = await tagmanager.accounts.containers.workspaces.triggers.list({
      parent: workspace.path
    });

    console.log(`\n🎯 Triggers (${triggers?.data?.trigger?.length || 0}):`);
    triggers?.data?.trigger?.forEach((t: any) => {
      console.log(`  ✓ ${t.name}`);
    });

    const versions = await (tagmanager.accounts.containers as any).versions.list({
      parent: containerPath,
    });

    const latestVersion = versions.data.containerVersion?.[0];
    console.log(`\n📦 Latest Published Version: ${latestVersion?.containerVersionId}`);
    console.log(`   Name: ${latestVersion?.name}`);
    console.log(`   Description: ${latestVersion?.description || 'N/A'}`);

    console.log('\n✅ Verification complete!');

  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyDeployment().catch(console.error);
