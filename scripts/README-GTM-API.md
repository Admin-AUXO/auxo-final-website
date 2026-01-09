# GTM API Setup Script

Automates Google Tag Manager configuration using the GTM API v2.

## Quick Reference

- **Account ID**: `6332993563`
- **Container ID**: `GTM-N6547BGW` (configured in script)
- **GA4 Measurement ID**: `G-WBMKHRWS7Z`
- **Service Account**: `auxo-website-gtm@auxodata.iam.gserviceaccount.com`

## Prerequisites

1. **Install dependencies**: `npm install` (installs `googleapis` package)
2. **Google Cloud Project** with Tag Manager API enabled
3. **Service Account** with Tag Manager Editor permissions
4. **Service Account Key** (JSON file)

## Setup

### 1. Enable Tag Manager API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Library**
4. Search for "Tag Manager API"
5. Click **Enable**

### 2. Service Account

**Service Account Email**: `auxo-website-gtm@auxodata.iam.gserviceaccount.com`

This service account should already have:
- **Tag Manager Editor** role
- Access to container `GTM-N6547BGW`

If you need to create a new service account:
1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `gtm-api-setup`
4. Grant role: **Tag Manager** → **Tag Manager Editor**
5. Click **Done**

### 3. Service Account Key File

**Key File**: `@auxodata-1a2b6e31bc0d.json`

For service account `auxo-website-gtm@auxodata.iam.gserviceaccount.com`:

1. Go to **IAM & Admin** → **Service Accounts**
2. Click on `auxo-website-gtm@auxodata.iam.gserviceaccount.com`
3. Go to **Keys** tab
4. Click **Add Key** → **Create new key** (if key doesn't exist)
5. Select **JSON**
6. Download the key file
7. Save it as `@auxodata-1a2b6e31bc0d.json` in the project root

**Note**: The key file should be placed in the project root or specify the path via `GTM_SERVICE_ACCOUNT_KEY` environment variable.

### 4. Account & Container Info

- **Account ID**: `6332993563` (already configured)
- **Container ID**: `GTM-N6547BGW` (configured in script)
- **Service Account**: `auxo-website-gtm@auxodata.iam.gserviceaccount.com`

To find these manually:
1. Go to [Tag Manager](https://tagmanager.google.com/)
2. Click on your account
3. The Account ID is in the URL: `accounts/{ACCOUNT_ID}/containers/...`

## Usage

### Option 1: Default Key File Location

Place the key file `@auxodata-1a2b6e31bc0d.json` in the project root:

```bash
export GTM_ACCOUNT_ID="6332993563"
npm run gtm:setup
```

The script will automatically look for `gtm-service-account.json` or `@auxodata-1a2b6e31bc0d.json` in the project root.

### Option 2: Custom Key File Path

Specify the key file path via environment variable:

```bash
export GTM_ACCOUNT_ID="6332993563"
export GTM_SERVICE_ACCOUNT_KEY="./@auxodata-1a2b6e31bc0d.json"
npm run gtm:setup
```

### Option 3: Direct Node Execution

```bash
GTM_ACCOUNT_ID="6332993563" GTM_SERVICE_ACCOUNT_KEY="./@auxodata-1a2b6e31bc0d.json" node scripts/setup-gtm.js
```

**Note**: Container ID `GTM-N6547BGW` is already configured in the script.

## What It Does

1. ✅ Creates all 22 Data Layer Variables
2. ✅ Creates "All Pages" trigger
3. ✅ Creates GA4 Configuration tag
4. ✅ Creates 11 Custom Event triggers
5. ✅ Creates 11 GA4 Event tags with parameters

## After Running

1. **Review** the workspace in GTM UI
2. **Test** in Preview Mode
3. **Create Version** → Add description
4. **Publish** the container

## Troubleshooting

### "Container not found"
- Verify `GTM_CONTAINER_ID` matches your container
- Check service account has access to the container

### "Permission denied"
- Ensure service account has **Tag Manager Editor** role
- Verify Tag Manager API is enabled

### "Authentication failed"
- Check service account key file path
- Verify JSON key file is valid
- Ensure key hasn't been deleted

## Manual Setup Alternative

If API setup fails, use the manual guide: [GTM-SETUP-GUIDE.md](../GTM-SETUP-GUIDE.md)
