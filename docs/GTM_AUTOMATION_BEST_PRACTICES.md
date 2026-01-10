# GTM Automation Best Practices

## Service Account Permissions

### Current Status
- **Service Account**: `auxo-website-gtm@auxodata.iam.gserviceaccount.com`
- **Container**: `GTM-N6547BGW` (auxodata.com)
- **Current Permissions**: READ ✅ | EDIT ✅ | PUBLISH ❌

### GTM Permission Levels

| Level | Capabilities | Use Case |
|-------|-------------|----------|
| **Read** | View containers, tags, triggers, variables | Auditing, reporting |
| **Edit** | Create/modify tags, triggers, variables | Development, configuration |
| **Approve** | Create container versions (unpublished) | Staging, review workflow |
| **Publish** | Create AND publish versions to production | Automated deployments |
| **Administrator** | Full access including user management | Account management |

### Best Practices for Automated Publishing

#### 1. **Separate Service Accounts by Environment**

```
✅ RECOMMENDED:
- gtm-dev@project.iam.gserviceaccount.com (Edit permission)
- gtm-staging@project.iam.gserviceaccount.com (Approve permission)
- gtm-prod@project.iam.gserviceaccount.com (Publish permission)

❌ NOT RECOMMENDED:
- single-service-account@project.iam.gserviceaccount.com (Administrator)
```

**Why?** Separation limits blast radius if credentials are compromised.

#### 2. **Use Workspaces for Different Environments**

```typescript
// Development Workspace
const DEV_WORKSPACE = 'Development';

// Staging Workspace
const STAGING_WORKSPACE = 'Staging';

// Production = Default Workspace
const PROD_WORKSPACE = 'Default Workspace';
```

**Workflow:**
1. Test changes in Development workspace
2. Promote to Staging workspace for review
3. Publish from Default Workspace to production

#### 3. **Version Control & Audit Trail**

Always include detailed version notes when publishing:

```typescript
const versionResponse = await gtm.accounts.containers.workspaces.create_version({
  path: workspacePath,
  requestBody: {
    name: 'v2.1.0 - Feature Description',
    notes: `
Deployment: ${new Date().toISOString()}
Branch: ${process.env.GIT_BRANCH}
Commit: ${process.env.GIT_COMMIT}
Author: ${process.env.GIT_AUTHOR}

Changes:
- Added Consent Mode v2
- Updated Core Web Vitals tracking
- Fixed session quality calculation

Tested on: ${process.env.STAGING_URL}
Approved by: ${process.env.APPROVER}
    `,
  },
});
```

#### 4. **Pre-Publish Validation**

Before publishing, validate container configuration:

```typescript
async function validateBeforePublish(gtm: any, workspacePath: string) {
  const checks = {
    tags: false,
    triggers: false,
    variables: false,
    ga4Config: false,
  };

  // Check for required tags
  const tagsResponse = await gtm.accounts.containers.workspaces.tags.list({
    parent: workspacePath,
  });
  checks.tags = tagsResponse.data.tag?.length > 0;

  // Check for GA4 configuration tag
  const ga4Config = tagsResponse.data.tag?.find(
    (t: any) => t.type === 'googtag'
  );
  checks.ga4Config = !!ga4Config;

  // Check for required triggers
  const triggersResponse = await gtm.accounts.containers.workspaces.triggers.list({
    parent: workspacePath,
  });
  checks.triggers = triggersResponse.data.trigger?.length > 0;

  // Check for required variables
  const variablesResponse = await gtm.accounts.containers.workspaces.variables.list({
    parent: workspacePath,
  });
  checks.variables = variablesResponse.data.variable?.length > 0;

  const allValid = Object.values(checks).every((v) => v === true);

  if (!allValid) {
    throw new Error(`Validation failed: ${JSON.stringify(checks, null, 2)}`);
  }

  return true;
}
```

#### 5. **Rollback Strategy**

Always keep previous versions for quick rollback:

```typescript
// Get previous version
const versionsResponse = await gtm.accounts.containers.versions.list({
  parent: containerPath,
  pageSize: 10,
});

const previousVersion = versionsResponse.data.containerVersion?.[1]; // Second most recent

// Rollback if needed
async function rollback(gtm: any, previousVersionPath: string) {
  await gtm.accounts.containers.versions.publish({
    path: previousVersionPath,
  });
}
```

#### 6. **Rate Limiting & Error Handling**

GTM API has quota limits:
- **Queries per minute per user**: 300
- **Queries per day**: 1,000,000

```typescript
async function publishWithRetry(
  gtm: any,
  versionPath: string,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await gtm.accounts.containers.versions.publish({
        path: versionPath,
      });
    } catch (error: any) {
      if (error.message.includes('quota') && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

#### 7. **Security Best Practices**

**JSON Key Security:**
```bash
# Never commit service account keys to git
echo "*.json" >> .gitignore
echo "!package.json" >> .gitignore
echo "!tsconfig.json" >> .gitignore

# Store in environment-specific locations
# Development: Local file with restricted permissions
chmod 600 auxodata-1a2b6e31bc0d.json

# Production: Secret manager (GCP Secret Manager, AWS Secrets Manager)
# Use workload identity instead of JSON keys when possible
```

**Rotate Keys Regularly:**
- Create new service account key every 90 days
- Delete old keys after rotation
- Monitor key usage in GCP Console

**Restrict Key Permissions:**
```typescript
// Only request minimum required scopes
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: [
    // For read-only operations
    'https://www.googleapis.com/auth/tagmanager.readonly',

    // For edit operations (includes read)
    'https://www.googleapis.com/auth/tagmanager.edit.containers',

    // For publish operations (includes edit + read)
    'https://www.googleapis.com/auth/tagmanager.publish',
  ],
});
```

#### 8. **CI/CD Integration**

**GitHub Actions Example:**
```yaml
name: Deploy GTM Configuration

on:
  push:
    branches: [main]
    paths:
      - 'scripts/gtm-*.ts'

jobs:
  deploy-gtm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Decode service account key
        run: echo "${{ secrets.GTM_SERVICE_ACCOUNT_KEY }}" | base64 -d > key.json

      - name: Validate GTM config
        run: npm run gtm:check

      - name: Publish GTM container
        run: npm run gtm:publish

      - name: Cleanup
        if: always()
        run: rm -f key.json
```

#### 9. **Testing Strategy**

**Preview Mode Testing:**
1. Create version (don't publish yet)
2. Use Preview mode to test on staging site
3. Verify all events in GA4 DebugView
4. Only publish after validation

```typescript
async function createPreviewVersion(gtm: any, workspacePath: string) {
  // Create version but don't publish
  const versionResponse = await gtm.accounts.containers.workspaces.create_version({
    path: workspacePath,
    requestBody: {
      name: 'Preview - Testing Changes',
      notes: 'Testing in preview mode before publish',
    },
  });

  console.log('Version created for preview testing');
  console.log('Use GTM Preview mode to test before publishing');

  return versionResponse.data.containerVersion;
}
```

#### 10. **Monitoring & Alerts**

Set up monitoring for:
- Failed publish attempts
- Unexpected configuration changes
- API quota usage
- Service account key expiration

```typescript
// Log all publish operations
async function publishWithLogging(gtm: any, versionPath: string) {
  const startTime = Date.now();

  try {
    const result = await gtm.accounts.containers.versions.publish({
      path: versionPath,
    });

    // Log success
    console.log({
      event: 'gtm_publish_success',
      duration: Date.now() - startTime,
      version: result.data.containerVersion?.containerVersionId,
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error: any) {
    // Log failure
    console.error({
      event: 'gtm_publish_failed',
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}
```

## Granting Publish Permission

### Via GTM Web Interface

1. Go to https://tagmanager.google.com/
2. Select container **GTM-N6547BGW**
3. Click **Admin** → **User Management**
4. Find service account: `auxo-website-gtm@auxodata.iam.gserviceaccount.com`
5. Change permission to **Publish**
6. Save changes

### Permission Verification

After granting permission, verify:

```bash
npm run gtm:check
npx tsx scripts/gtm-check-permissions.ts
```

Should show:
- ✅ READ
- ✅ EDIT
- ✅ PUBLISH

## Available Scripts

```bash
# Check current GTM configuration
npm run gtm:check

# Check service account permissions
npx tsx scripts/gtm-check-permissions.ts

# Setup missing variables and triggers
npm run gtm:setup

# Add missing GA4 event tags
npm run gtm:add-tags

# Publish current workspace to production
npm run gtm:publish
```

## Emergency Rollback

If published version has issues:

```bash
# List recent versions
npx tsx scripts/gtm-list-versions.ts

# Publish previous version
npx tsx scripts/gtm-rollback.ts --version <VERSION_ID>
```

## Support

For issues:
- GTM API Documentation: https://developers.google.com/tag-platform/tag-manager/api/v2
- Service Account Guide: https://cloud.google.com/iam/docs/service-accounts
- GTM Best Practices: https://developers.google.com/tag-platform/tag-manager/best-practices
