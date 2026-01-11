import { readFileSync } from 'fs';
import { join } from 'path';
import { google } from 'googleapis';

const SERVICE_ACCOUNT_PATH = join(process.cwd(), 'auxodata-1a2b6e31bc0d.json');

async function getAuthClient() {
  const keyFile = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));

  const auth = new google.auth.GoogleAuth({
    credentials: keyFile,
    scopes: [
      'https://www.googleapis.com/auth/tagmanager.readonly',
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
    ],
  });

  return await auth.getClient();
}

async function checkAccess() {
  try {
    console.log('🔍 Checking GTM Access for Service Account\n');

    const authClient = await getAuthClient();
    const tagmanager = google.tagmanager({ version: 'v2', auth: authClient as any });

    const keyFile = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
    console.log(`📧 Service Account: ${keyFile.client_email}\n`);

    console.log('📊 Listing accessible accounts...\n');

    const accounts = await tagmanager.accounts.list();

    if (!accounts.data.account || accounts.data.account.length === 0) {
      console.log('⚠️  No accounts accessible to this service account');
      console.log('\n💡 The service account needs to be granted access in GTM:');
      console.log('   1. Go to https://tagmanager.google.com/');
      console.log('   2. Admin > User Management');
      console.log('   3. Add user: ' + keyFile.client_email);
      console.log('   4. Grant "Publish" permission');
      return;
    }

    console.log(`✓ Found ${accounts.data.account.length} accessible account(s):\n`);

    for (const account of accounts.data.account) {
      console.log(`📦 Account: ${account.name}`);
      console.log(`   ID: ${account.accountId}`);
      console.log(`   Path: ${account.path}\n`);

      try {
        const containers = await tagmanager.accounts.containers.list({
          parent: account.path!,
        });

        if (containers.data.container && containers.data.container.length > 0) {
          console.log(`   📁 Containers (${containers.data.container.length}):`);

          for (const container of containers.data.container) {
            console.log(`      • ${container.name}`);
            console.log(`        ID: ${container.publicId}`);
            console.log(`        Container ID: ${container.containerId}`);
            console.log(`        Path: ${container.path}`);

            try {
              const workspaces = await tagmanager.accounts.containers.workspaces.list({
                parent: container.path!,
              });

              if (workspaces.data.workspace) {
                console.log(`        Workspaces: ${workspaces.data.workspace.length}`);
                workspaces.data.workspace.forEach((ws: any) => {
                  console.log(`          - ${ws.name}`);
                });
              }
            } catch (wsError: any) {
              console.log(`        ⚠️  Cannot list workspaces: ${wsError.message}`);
            }

            console.log('');
          }
        } else {
          console.log(`   ℹ️  No containers in this account\n`);
        }
      } catch (containerError: any) {
        console.log(`   ⚠️  Cannot list containers: ${containerError.message}\n`);
      }
    }

    console.log('\n✅ Access check complete!');

  } catch (error: any) {
    console.error('\n❌ Access check failed:', error.message);

    if (error.code === 403) {
      console.log('\n⚠️  Permission denied - the service account has no GTM access');
    } else if (error.code === 401) {
      console.log('\n⚠️  Authentication failed - check the service account JSON file');
    }

    if (error.response?.data) {
      console.error('\nDetails:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkAccess().catch(console.error);
