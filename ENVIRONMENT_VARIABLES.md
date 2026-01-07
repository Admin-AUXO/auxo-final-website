# Environment Variables Configuration

This document outlines the required environment variables for the AuxoData website deployment.

## Required Variables

### Sanity CMS Configuration
```bash
SANITY_PROJECT_ID=your_project_id_here
SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token_here
SANITY_API_VERSION=2024-01-01
```

### Build Configuration
```bash
NODE_ENV=production
```

## Optional Variables

### Analytics and Tracking
```bash
GOOGLE_ANALYTICS_ID=
MIXPANEL_TOKEN=
```

### Email Service Configuration
```bash
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
```

### Social Media Links
```bash
LINKEDIN_URL=
TWITTER_URL=
```

## GitLab CI/CD Configuration

### Setting up Variables in GitLab

1. Go to your GitLab project
2. Navigate to **Settings > CI/CD > Variables**
3. Add the following variables (mark sensitive ones as "Protected" and "Masked"):

#### Required CI/CD Variables:
- `SANITY_PROJECT_ID` - Your Sanity project ID
- `SANITY_DATASET` - Dataset name (usually "production")
- `SANITY_API_TOKEN` - Sanity API token with read access

#### Optional CI/CD Variables:
- `BUNDLESIZE_GITHUB_TOKEN` - For bundle size monitoring
- `LIGHTHOUSE_API_KEY` - For Lighthouse CI integration

### Variable Protection

- **Protected**: Variables are only available in protected branches/tags
- **Masked**: Variable values are hidden in job logs
- **Environment scope**: Limit variables to specific environments

### Security Best Practices

1. Never commit actual values to the repository
2. Use different tokens for different environments
3. Rotate tokens regularly
4. Use the principle of least privilege for API tokens
5. Monitor token usage in Sanity dashboard

### Local Development

For local development, create a `.env` file in the project root with the required variables. This file is already in `.gitignore`.
