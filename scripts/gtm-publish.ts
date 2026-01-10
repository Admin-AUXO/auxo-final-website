import { google } from 'googleapis';
import * as path from 'path';

const GTM_ACCOUNT_PATH = 'accounts/6332993563';
const GTM_CONTAINER_PUBLIC_ID = 'GTM-N6547BGW';
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'auxodata-1a2b6e31bc0d.json');

async function getGTMClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: [
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
      'https://www.googleapis.com/auth/tagmanager.publish',
    ],
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

async function publishGTMContainer() {
  console.log('🚀 GTM Container - Publishing Workspace\n');
  console.log('=' .repeat(60));

  try {
    const gtm = await getGTMClient();
    console.log('✅ GTM API client initialized');

    const { containerPath, workspacePath } = await getContainerAndWorkspace(gtm);
    console.log(`✅ Container: ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log(`✅ Workspace: Default Workspace\n`);

    console.log('📦 Creating container version...');
    const versionResponse = await gtm.accounts.containers.workspaces.create_version({
      path: workspacePath,
      requestBody: {
        name: '2026 Best Practices - Complete GA4/GTM Setup',
        notes: `Automated deployment - ${new Date().toISOString()}

GA4/GTM Best Practices Implementation:
- Consent Mode v2 with region-specific defaults (EEA & non-EEA)
- Event deduplication and parameter validation
- Standardized event naming (snake_case)
- Debug mode support
- Consent-aware event tracking

Tracking Coverage:
- Core Web Vitals (LCP, INP, CLS, FCP, TTFB)
- User interactions (clicks, scrolls, navigation)
- Form tracking (start, submission, abandonment)
- Engagement metrics (session quality, scroll depth)
- Enhanced Conversion tracking with PII hashing
- Performance monitoring (page load, long tasks)
- Video interactions (play, pause, complete, progress)
- Error tracking (exceptions)
- Search and theme changes

GTM Configuration:
- 50+ DataLayer variables for event data capture
- 30+ custom event triggers
- 25+ GA4 event tags with proper parameter mapping
- Measurement ID override for all tags
- Proper trigger-to-tag associations

All following 2026 Google Analytics 4 and GTM best practices.`,
      },
    });

    const version = versionResponse.data.containerVersion;
    if (!version) {
      throw new Error('Failed to create container version');
    }

    console.log(`✅ Version created: ${version.name}`);
    console.log(`   Version ID: ${version.containerVersionId}\n`);

    console.log('📤 Publishing container version...');
    const publishResponse = await gtm.accounts.containers.versions.publish({
      path: version.path!,
    });

    const publishedVersion = publishResponse.data.containerVersion;
    console.log(`✅ Container published successfully!\n`);

    console.log('=' .repeat(60));
    console.log('✅ GTM Container Published!\n');

    console.log('📊 Published Details:');
    console.log(`   Container ID: ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log(`   Version: ${publishedVersion?.containerVersionId}`);
    console.log(`   Published at: ${new Date().toLocaleString()}\n`);

    console.log('🔍 Next Steps:');
    console.log('   1. Go to https://tagmanager.google.com/');
    console.log(`   2. Select container ${GTM_CONTAINER_PUBLIC_ID}`);
    console.log('   3. Review the published version');
    console.log('   4. Use Preview & Debug mode to test');
    console.log('   5. Monitor GA4 for incoming events\n');

  } catch (error: any) {
    console.log('\n❌ Publish failed:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

publishGTMContainer();
