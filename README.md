# AUXO Data Labs Website

A modern, high-performance website for AUXO Data Labs built with Astro, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19.0 or higher
- npm 8.0.0 or higher

### Setup

1. **Clone the repository**
   ```bash
   git clone https://gitlab.com/admin-auxo-group/auxo-final-website.git
   cd auxo-final-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Astro Configuration
BASE_PATH=/
SITE_URL=https://auxodata.com

# Sanity CMS Configuration
SANITY_PROJECT_ID=4ddas0r0
SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token_here
SANITY_API_VERSION=2024-01-01

# EmailJS Configuration (Public)
PUBLIC_EMAILJS_SERVICE_ID=your_service_id
PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Development
NODE_ENV=development
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development server (port 4340)
- `npm run preview` - Preview production build (port 4341)
- `npm run type-check` - Run TypeScript type checking

### Building
- `npm run build` - Build for production
- `npm run build:fast` - Fast production build with increased memory
- `npm run build:check` - Build with type checking and linting
- `npm run build:analyze` - Build and analyze bundle size

### Code Quality
- `npm run lint` - Run TypeScript and CSS linting
- `npm run lint:fix` - Auto-fix linting issues
- `npm run validate` - Run all quality checks

### Testing
- `npm run test` - Run Playwright E2E tests
- `npm run test:ui` - Run tests with Playwright UI
- `npm run test:headed` - Run tests in headed mode
- `npm run test:ci` - Run tests for CI/CD

### Sanity CMS
- `npm run sanity:schema` - Generate schema.json from TypeScript schemas
- `npm run sanity:deploy` - Deploy schema to Sanity
- `npm run sanity:migrate` - Check data migration needs
- `npm run sanity:typegen` - Generate TypeScript types from schema
- `npm run sanity:backup` - Backup Sanity dataset
- `npm run sanity:restore` - Restore Sanity dataset

### Cleanup
- `npm run clean` - Remove build directories
- `npm run clean:temp` - Remove temporary files
- `npm run clean:all` - Clean all build artifacts

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

#### Public Visibility (GitLab Settings)
To ensure the project and GitLab Pages are publicly accessible:
- Set **Project visibility** to **Public** under **Settings > General > Visibility, project features, permissions**
- Under **Settings > Pages**, set **Access control** to **Everyone** (or disable access control)

**Required GitLab CI/CD Variables:**
Configure these in your GitLab project under **Settings > CI/CD > Variables**:
- `SANITY_PROJECT_ID` - Your Sanity project ID (required)
- `SANITY_API_TOKEN` - Your Sanity API token (required, masked, protected)
- `SANITY_DATASET` - Dataset name (optional, defaults to 'production')
- `SANITY_API_VERSION` - API version (optional, defaults to '2024-01-01')

**Optional Variables:**
- `BUNDLESIZE_GITHUB_TOKEN` - For bundle size monitoring
- `LIGHTHOUSE_API_KEY` - For Lighthouse CI integration
- `PUBLIC_EMAILJS_SERVICE_ID` - EmailJS service ID
- `PUBLIC_EMAILJS_TEMPLATE_ID` - EmailJS template ID
- `PUBLIC_EMAILJS_PUBLIC_KEY` - EmailJS public key

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
- **Testing:** Playwright
- **Performance:** Astro Edge optimizations

## 📱 Features

- ⚡ Lightning-fast performance
- 📱 Mobile-first responsive design
- 🎨 Modern UI with smooth animations
- 🔍 SEO optimized
- 🌙 Dark mode support
- 🎯 TypeScript for type safety
- 🚀 Optimized build process
- 📊 Sanity CMS integration

## 🔧 CI/CD Features

### Automated Quality Assurance
- **Security Scanning** - Detects secrets and vulnerabilities
- **Dependency Auditing** - Checks for package vulnerabilities
- **Code Quality** - TypeScript and Stylelint checks
- **Type Safety** - TypeScript compilation verification
- **E2E Testing** - Playwright automated tests
- **Performance Monitoring** - Lighthouse CI audits
- **Accessibility Testing** - Automated WCAG compliance checks
- **Bundle Size Monitoring** - Prevents JavaScript bloat
- **SEO Validation** - HTML validation and SEO checks

### Development Workflow
1. **Feature Development**
   - Create feature branch from `main`
   - Write code with tests
   - Commit with conventional commit messages

2. **Code Quality Gates**
   - All checks must pass in CI/CD
   - Code review required for merge requests
   - Security scans must pass

3. **Merge Strategy**
   - Merge requests to `main` trigger full pipeline
   - `main` branch auto-deploys to production

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
