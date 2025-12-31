#!/bin/bash

# AUXO Website Setup Script for macOS
# This script helps set up environment variables for development

echo "🚀 Setting up AUXO Website for macOS development"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Skipping setup."
    echo "   If you need to update environment variables, edit the .env file directly."
    exit 0
fi

# Copy example environment file
if [ -f "env.example" ]; then
    cp env.example .env
    echo "✅ Created .env file from env.example"
    echo "   Please edit .env and fill in your Sanity CMS credentials:"
    echo "   - SANITY_PROJECT_ID"
    echo "   - SANITY_API_TOKEN"
    echo ""
    echo "   You can find these values in your Sanity project settings."
else
    echo "❌ env.example file not found. Please check your repository."
    exit 1
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit the .env file with your actual values"
echo "2. Run 'npm install' to install dependencies"
echo "3. Run 'npm run dev' to start development server"
echo ""
echo "🎯 For production builds, make sure these secrets are set in GitHub:"
echo "   - SANITY_PROJECT_ID"
echo "   - SANITY_API_TOKEN"
echo "   - SANITY_DATASET (optional, defaults to 'production')"
echo "   - SITE_URL (optional, defaults to 'https://auxodata.com')"echo "   - BASE_PATH (optional, defaults to '/')"echo ""
echo "✨ Setup complete! Happy coding! 🎉"
