#!/bin/bash

# AUXO Build Script
# Handles environment variables and PATH automatically

# Set up environment variables (replace with your actual values)
export SANITY_PROJECT_ID="${SANITY_PROJECT_ID:-4ddas0r0}"
export SANITY_DATASET="${SANITY_DATASET:-production}"
export SANITY_API_TOKEN="${SANITY_API_TOKEN:-sk7boAumpQ37aU9QUJKQ7qqB4CleS9iGbCVrKQmQeBoTOoLapAeRoZyWMidX4XZh4mCoZaaOgoj0nb6QAOncF45U5Jc2A4A0ZEvE3vKFDeDSsiHM6GMfwBkhMHJnYLRECjNP6hqIz7PePRfWZB1q4ncL2Rp1zhcW84Xb3tnrAXTXwyq4kmo7}"
export SANITY_API_VERSION="${SANITY_API_VERSION:-2024-01-01}"
export SITE_URL="${SITE_URL:-https://auxodata.com}"
export BASE_PATH="${BASE_PATH:-/}"

# Set up Node.js PATH
export PATH="/Users/ammu/auxo/auxo-final-website/node-v20/bin:$PATH"

echo "🧹 Cleaning up any existing processes..."
npm run clean:port 2>/dev/null || true

echo "🚀 Building AUXO Website..."
echo "📋 Environment:"
echo "   SANITY_PROJECT_ID: ${SANITY_PROJECT_ID:0:8}..."
echo "   SANITY_DATASET: $SANITY_DATASET"
echo "   SITE_URL: $SITE_URL"
echo "   BASE_PATH: $BASE_PATH"
echo ""

# Run the build
npm run build

