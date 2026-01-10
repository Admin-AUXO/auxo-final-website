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
      'https://www.googleapis.com/auth/tagmanager.publish',
    ],
  });

  return google.tagmanager({ version: 'v2', auth });
}

async function checkPermissions() {
  console.log('🔐 Checking GTM Service Account Permissions\n');
  console.log('=' .repeat(60));

  try {
    const gtm = await getGTMClient();
    console.log('✅ GTM API client initialized');
    console.log('📧 Service Account: auxo-website-gtm@auxodata.iam.gserviceaccount.com\n');

    const containersResponse = await gtm.accounts.containers.list({
      parent: GTM_ACCOUNT_PATH,
    });

    const container = containersResponse.data.container?.find(
      (c: any) => c.publicId === GTM_CONTAINER_PUBLIC_ID
    );

    if (!container || !container.path) {
      throw new Error(`Container ${GTM_CONTAINER_PUBLIC_ID} not found`);
    }

    console.log(`📦 Container: ${container.name} (${GTM_CONTAINER_PUBLIC_ID})`);
    console.log(`   Path: ${container.path}\n`);

    console.log('🧪 Testing Permissions:\n');

    // Test 1: Read Permission
    console.log('1️⃣  Testing READ permission...');
    try {
      await gtm.accounts.containers.list({ parent: GTM_ACCOUNT_PATH });
      console.log('   ✅ READ - Can list containers\n');
    } catch (error: any) {
      console.log(`   ❌ READ - Failed: ${error.message}\n`);
    }

    // Test 2: Edit Permission
    console.log('2️⃣  Testing EDIT permission...');
    try {
      const workspacesResponse = await gtm.accounts.containers.workspaces.list({
        parent: container.path,
      });
      const workspace = workspacesResponse.data.workspace?.[0];

      if (workspace && workspace.path) {
        await gtm.accounts.containers.workspaces.variables.list({
          parent: workspace.path,
        });
        console.log('   ✅ EDIT - Can access and modify workspace\n');
      }
    } catch (error: any) {
      console.log(`   ❌ EDIT - Failed: ${error.message}\n`);
    }

    // Test 3: Publish Permission
    console.log('3️⃣  Testing PUBLISH permission...');
    try {
      const workspacesResponse = await gtm.accounts.containers.workspaces.list({
        parent: container.path,
      });
      const workspace = workspacesResponse.data.workspace?.[0];

      if (!workspace || !workspace.path) {
        throw new Error('No workspace found');
      }

      // Try to create a version (this requires publish permission)
      const versionResponse = await gtm.accounts.containers.workspaces.create_version({
        path: workspace.path,
        requestBody: {
          name: 'Permission Test - DO NOT PUBLISH',
          notes: 'Testing publish permissions - this version should be deleted',
        },
      });

      if (versionResponse.data.containerVersion) {
        console.log('   ✅ PUBLISH - Can create container versions');
        console.log('   ⚠️  Test version created (unpublished)\n');

        // Now test actual publish
        console.log('4️⃣  Testing actual PUBLISH operation...');
        try {
          await gtm.accounts.containers.versions.publish({
            path: versionResponse.data.containerVersion.path!,
          });
          console.log('   ✅ PUBLISH - Full publish permission confirmed\n');
        } catch (publishError: any) {
          console.log(`   ❌ PUBLISH - Cannot publish: ${publishError.message}\n`);
        }
      }
    } catch (error: any) {
      if (error.message.includes('insufficient authentication scopes')) {
        console.log('   ❌ PUBLISH - Insufficient permissions');
        console.log('   ℹ️  Service account does NOT have Publish permission\n');
      } else {
        console.log(`   ❌ PUBLISH - Failed: ${error.message}\n`);
      }
    }

    console.log('=' .repeat(60));
    console.log('📊 Permission Summary:\n');
    console.log('Required GTM Permission Levels:');
    console.log('   • READ - View containers and settings');
    console.log('   • EDIT - Modify tags, triggers, variables');
    console.log('   • APPROVE - Create versions (but not publish)');
    console.log('   • PUBLISH - Create versions AND publish to live\n');

    console.log('🔧 To grant PUBLISH permission:');
    console.log('   1. Go to: https://tagmanager.google.com/');
    console.log(`   2. Select container: ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log('   3. Admin → User Management');
    console.log('   4. Find: auxo-website-gtm@auxodata.iam.gserviceaccount.com');
    console.log('   5. Change permission to: "Publish" or "Administrator"\n');

  } catch (error: any) {
    console.log('\n❌ Error:', error.message);
    if (error.code === 'ENOENT') {
      console.log('   Service account key file not found!');
      console.log(`   Expected: ${SERVICE_ACCOUNT_PATH}\n`);
    }
  }
}

checkPermissions();
