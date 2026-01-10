import { google } from 'googleapis';
import * as path from 'path';

const GTM_ACCOUNT_PATH = 'accounts/6332993563';
const GTM_CONTAINER_PUBLIC_ID = 'GTM-N6547BGW';
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'auxodata-1a2b6e31bc0d.json');

async function getGTMClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: [
      'https://www.googleapis.com/auth/tagmanager.readonly',
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
    ],
  });

  return google.tagmanager({ version: 'v2', auth });
}

async function checkGTMAccess() {
  console.log('🔍 Checking GTM Access & Configuration\n');
  console.log('=' .repeat(60));

  try {
    const gtm = await getGTMClient();
    console.log('✅ GTM API client initialized\n');

    console.log('📋 Step 1: Checking Account Access...');
    try {
      const accountsResponse = await gtm.accounts.list();
      const accounts = accountsResponse.data.account || [];

      if (accounts.length === 0) {
        console.log('❌ No accounts accessible');
        console.log('\n⚠️  The service account has NO access to any GTM accounts');
        console.log('   You need to grant access in GTM Admin → User Management\n');
        return;
      }

      console.log(`✅ Found ${accounts.length} accessible account(s):`);
      accounts.forEach((acc: any) => {
        console.log(`   - ${acc.name} (${acc.accountId})`);
      });
      console.log('');
    } catch (error: any) {
      console.log('❌ Cannot access accounts:', error.message);
      return;
    }

    console.log('📦 Step 2: Checking Container Access...');
    try {
      const containersResponse = await gtm.accounts.containers.list({
        parent: GTM_ACCOUNT_PATH,
      });

      const containers = containersResponse.data.container || [];

      if (containers.length === 0) {
        console.log('❌ No containers found in this account');
        return;
      }

      console.log(`✅ Found ${containers.length} container(s):`);
      containers.forEach((container: any) => {
        const isCurrent = container.publicId === GTM_CONTAINER_PUBLIC_ID;
        console.log(`   ${isCurrent ? '→' : ' '} ${container.name} (${container.publicId})`);
      });

      const targetContainer = containers.find(
        (c: any) => c.publicId === GTM_CONTAINER_PUBLIC_ID
      );

      if (!targetContainer) {
        console.log(`\n❌ Target container ${GTM_CONTAINER_PUBLIC_ID} not found`);
        return;
      }

      const containerPath = targetContainer.path!;
      console.log(`\n✅ Target container found: ${targetContainer.name}`);
      console.log(`   Path: ${containerPath}\n`);

      console.log('🔧 Step 3: Checking Workspaces...');
      const workspacesResponse = await gtm.accounts.containers.workspaces.list({
        parent: containerPath,
      });

      const workspaces = workspacesResponse.data.workspace || [];
      console.log(`✅ Found ${workspaces.length} workspace(s):`);

      if (workspaces.length === 0) {
        console.log('   (none - using default workspace)');
      } else {
        workspaces.forEach((ws: any) => {
          console.log(`   - ${ws.name}`);
        });
      }

      const workspacePath = workspaces.length > 0
        ? workspaces[0].path!
        : `${containerPath}/workspaces/1`;

      console.log(`\n📊 Step 4: Checking Variables...`);
      try {
        const variablesResponse = await gtm.accounts.containers.workspaces.variables.list({
          parent: workspacePath,
        });

        const variables = variablesResponse.data.variable || [];
        console.log(`✅ Found ${variables.length} variable(s):`);

        if (variables.length === 0) {
          console.log('   (none configured)');
        } else {
          variables.forEach((variable: any) => {
            console.log(`   - ${variable.name} (${variable.type})`);
          });
        }
      } catch (error: any) {
        console.log(`⚠️  Cannot access variables: ${error.message}`);
      }

      console.log(`\n🎯 Step 5: Checking Triggers...`);
      try {
        const triggersResponse = await gtm.accounts.containers.workspaces.triggers.list({
          parent: workspacePath,
        });

        const triggers = triggersResponse.data.trigger || [];
        console.log(`✅ Found ${triggers.length} trigger(s):`);

        if (triggers.length === 0) {
          console.log('   (none configured)');
        } else {
          triggers.slice(0, 10).forEach((trigger: any) => {
            console.log(`   - ${trigger.name} (${trigger.type})`);
          });
          if (triggers.length > 10) {
            console.log(`   ... and ${triggers.length - 10} more`);
          }
        }
      } catch (error: any) {
        console.log(`⚠️  Cannot access triggers: ${error.message}`);
      }

      console.log(`\n🏷️  Step 6: Checking Tags...`);
      try {
        const tagsResponse = await gtm.accounts.containers.workspaces.tags.list({
          parent: workspacePath,
        });

        const tags = tagsResponse.data.tag || [];
        console.log(`✅ Found ${tags.length} tag(s):`);

        if (tags.length === 0) {
          console.log('   (none configured)');
        } else {
          tags.slice(0, 10).forEach((tag: any) => {
            console.log(`   - ${tag.name} (${tag.type})`);
          });
          if (tags.length > 10) {
            console.log(`   ... and ${tags.length - 10} more`);
          }
        }
      } catch (error: any) {
        console.log(`⚠️  Cannot access tags: ${error.message}`);
      }

      console.log('\n' + '='.repeat(60));
      console.log('✅ GTM Access Check Complete!\n');

      console.log('📝 Summary:');
      console.log(`   Account: ${GTM_ACCOUNT_PATH}`);
      console.log(`   Container: ${GTM_CONTAINER_PUBLIC_ID}`);
      console.log(`   Service Account: auxo-website-gtm@auxodata.iam.gserviceaccount.com`);
      console.log(`   Status: ${workspaces.length > 0 ? 'Has Access ✅' : 'Limited Access ⚠️'}`);
      console.log('');

    } catch (error: any) {
      console.log('❌ Error accessing container:', error.message);

      if (error.message.includes('permission') || error.message.includes('403')) {
        console.log('\n⚠️  Permission Issue Detected!');
        console.log('   The service account needs permissions in GTM.');
        console.log('\n   To grant access:');
        console.log('   1. Go to https://tagmanager.google.com/');
        console.log(`   2. Select container ${GTM_CONTAINER_PUBLIC_ID}`);
        console.log('   3. Admin → User Management');
        console.log('   4. Add: auxo-website-gtm@auxodata.iam.gserviceaccount.com');
        console.log('   5. Give "Publish" permission\n');
      }
    }

  } catch (error: any) {
    console.log('❌ Setup failed:', error.message);

    if (error.code === 'ENOENT') {
      console.log('\n⚠️  Service account key file not found!');
      console.log(`   Expected location: ${SERVICE_ACCOUNT_PATH}\n`);
    }
  }
}

checkGTMAccess();
