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

### GitLab Pages (Automatic)
The project automatically deploys to GitLab Pages on pushes to the `main` branch using GitLab CI/CD.

**Required GitLab CI/CD Variables:**
Configure these in your GitLab project under **Settings > CI/CD > Variables**:
- `SANITY_PROJECT_ID` - Your Sanity project ID
- `SANITY_API_TOKEN` - Your Sanity API token (mark as masked and protected)
- `SANITY_DATASET` (optional, defaults to 'production')
- `SITE_URL` (optional, defaults to 'https://auxodata.com')
- `BASE_PATH` (optional, defaults to '/')

**Accessing Your Site:**
After deployment, your site will be available at:
- `https://<username>.gitlab.io/<project-name>/` (default GitLab Pages URL)
- Or your custom domain if configured in **Settings > Pages**

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains the production build.

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests: `npm run build:check`
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Create a Merge Request

## 📄 License

This project is proprietary software owned by AUXO Data Labs.
