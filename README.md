# AUXO Data Labs Website

A modern, high-performance website for AUXO Data Labs built with Astro, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19.0 or higher
- npm 8.0.0 or higher

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Admin-AUXO/auxo-final-website.git
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

### GitHub Actions & GitHub Pages

The project uses GitHub Actions for CI/CD with automatic deployment to GitHub Pages.

#### Deployment Process:
1. **Build** - Optimized production build with Astro
2. **Deploy** - Automatic deployment to GitHub Pages on pushes to `main` branch

#### GitHub Pages Deployment (Automatic)
The project automatically deploys to GitHub Pages when changes are pushed to the `main` branch. The GitHub Actions workflow (`.github/workflows/deploy.yml`) handles the build and deployment process.

#### GitHub Pages Setup
1. Go to **Settings > Pages** in your GitHub repository
2. Under **Source**, select **GitHub Actions**
3. The site will be deployed to `https://admin-auxo.github.io/auxo-final-website/` or your custom domain

**Required GitHub Secrets:**
Configure these in your GitHub repository under **Settings > Secrets and variables > Actions**:
- `SANITY_PROJECT_ID` - Your Sanity project ID (required)
- `SANITY_API_TOKEN` - Your Sanity API token (required)
- `SANITY_DATASET` - Dataset name (optional, defaults to 'production')
- `SANITY_API_VERSION` - API version (optional, defaults to '2024-01-01')
- `SITE_URL` - Your site URL (optional, defaults to 'https://auxodata.com')

**Optional Secrets:**
- `PUBLIC_EMAILJS_SERVICE_ID` - EmailJS service ID
- `PUBLIC_EMAILJS_TEMPLATE_ID` - EmailJS template ID
- `PUBLIC_EMAILJS_PUBLIC_KEY` - EmailJS public key

#### Custom Domain Setup
The site is configured for `auxodata.com` domain:
1. Go to **Settings > Pages** in your GitHub repository
2. Enter `auxodata.com` in the **Custom domain** field
3. Configure DNS records:
   - Add a CNAME record pointing to `admin-auxo.github.io`
   - Or add A records for GitHub Pages IP addresses
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
- **Automated Building** - Production-optimized builds via GitHub Actions
- **Type Safety** - TypeScript compilation verification
- **Dependency Management** - Automated npm installation and caching
- **Build Verification** - Validates output and creates required files

### Development Workflow
1. **Feature Development**
   - Create feature branch from `main`
   - Write code with tests
   - Commit with conventional commit messages

2. **Code Quality Gates**
   - Run local quality checks: `npm run validate`
   - Ensure all tests pass before pushing

3. **Deployment Strategy**
   - Push to `main` branch triggers automatic deployment
   - GitHub Actions builds and deploys to GitHub Pages
   - Changes go live automatically after successful build

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the [Conventional Commits](https://conventionalcommits.org/) standard
4. Run local quality checks: `npm run validate`
5. Push to the branch and create a Pull Request
6. Ensure all tests and quality checks pass
7. Request code review for your Pull Request

## 📄 License

This project is proprietary software owned by AUXO Data Labs.
