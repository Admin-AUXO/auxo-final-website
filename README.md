# AUXO Data Labs Website

A modern, high-performance website for AUXO Data Labs built with Astro, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.14.1 or higher
- npm 8.0.0 or higher

### macOS Setup

1. **Clone the repository**
   ```bash
   git clone https://gitlab.com/admin-auxo-group/auxo-final-website.git
   cd auxo-final-website
   ```

2. **Run the setup script**
   ```bash
   ./setup-macos.sh
   ```

3. **Edit environment variables**
   ```bash
   # Edit .env file with your Sanity CMS credentials
   nano .env
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev:easy
   # or manually: npm run dev
   ```

## 📋 Environment Variables

Create a `.env` file with the following variables:

```env
# Sanity CMS Configuration
SANITY_PROJECT_ID=your_project_id_here
SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token_here
SANITY_API_VERSION=2024-01-01

# Site Configuration
SITE_URL=https://auxodata.com
BASE_PATH=/

# Development
NODE_ENV=development
```

## 🛠️ Available Scripts

### Easy Commands (Recommended)
- `npm run dev:easy` - Start development server with auto environment setup
- `npm run build:easy` - Build for production with auto environment setup
- `npm run clean:all` - Clean port and build files

### Standard Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:fast` - Fast production build with increased memory
- `npm run build:check` - Build with type checking and linting
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint and Stylelint
- `npm run test:env` - Check environment variables
- `npm run performance:audit` - Run Lighthouse performance audit

## 🚀 Deployment

### GitLab CI/CD Pipeline

The project uses a comprehensive GitLab CI/CD pipeline with the following stages:

#### Pipeline Stages:
1. **Security** - Secret detection, dependency scanning, license compliance
2. **Test** - Linting, type checking, Playwright E2E tests
3. **Build** - Optimized production build with bundle analysis
4. **Deploy** - Automatic deployment to GitLab Pages
5. **Performance** - Lighthouse audits, accessibility testing, SEO validation

#### GitLab Pages Deployment (Automatic)
The project automatically deploys to `https://auxodata.com` on pushes to the `main` branch.

**Required GitLab CI/CD Variables:**
Configure these in your GitLab project under **Settings > CI/CD > Variables**:
- `SANITY_PROJECT_ID` - Your Sanity project ID (required)
- `SANITY_API_TOKEN` - Your Sanity API token (required, masked, protected)
- `SANITY_DATASET` - Dataset name (optional, defaults to 'production')

**Optional Variables:**
- `BUNDLESIZE_GITHUB_TOKEN` - For bundle size monitoring
- `LIGHTHOUSE_API_KEY` - For Lighthouse CI integration

#### Custom Domain Setup
The site is configured for `auxodata.com` domain:
1. Go to **Settings > Pages** in your GitLab project
2. Add `auxodata.com` as a custom domain
3. Configure DNS records as instructed
4. The CNAME file in `public/` is already set to `auxodata.com`

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains the production build ready for deployment.

## 🏗️ Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **CMS:** Sanity
- **Icons:** Astro Icon
- **PWA:** Vite PWA
- **Performance:** Astro Edge optimizations

## 📱 Features

- ⚡ Lightning-fast performance
- 📱 Mobile-first responsive design
- 🎨 Modern UI with smooth animations
- 🔍 SEO optimized
- 🌙 PWA support
- 🎯 TypeScript for type safety
- 🚀 Optimized build process

## 🔧 CI/CD Features

### Automated Quality Assurance
- **Security Scanning** - Detects secrets and vulnerabilities
- **Dependency Auditing** - Checks for package vulnerabilities
- **Code Quality** - ESLint and Stylelint checks
- **Type Safety** - TypeScript compilation verification
- **E2E Testing** - Playwright automated tests
- **Performance Monitoring** - Lighthouse CI audits
- **Accessibility Testing** - Automated WCAG compliance checks
- **Bundle Size Monitoring** - Prevents JavaScript bloat
- **SEO Validation** - HTML validation and SEO checks

### Development Workflow
1. **Feature Development**
   - Create feature branch from `develop`
   - Write code with tests
   - Commit with conventional commit messages

2. **Code Quality Gates**
   - All checks must pass in CI/CD
   - Code review required for merge requests
   - Security scans must pass

3. **Merge Strategy**
   - Merge requests to `main` trigger full pipeline
   - `main` branch auto-deploys to production
   - `develop` branch for integration testing

### Issue and Merge Request Templates
Use the provided templates in `.gitlab/` for consistent issue reporting and merge request documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the [Conventional Commits](https://conventionalcommits.org/) standard
4. Run local quality checks: `npm run validate`
5. Push to the branch and create a Merge Request
6. Ensure CI/CD pipeline passes all checks
7. Request code review using the merge request template

## 📄 License

This project is proprietary software owned by AUXO Data Labs.
