#!/bin/bash

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_FILE="${ROOT_DIR}/schema.json"

echo "Extracting Sanity schema..."

SCHEMA_OUTPUT=$(npx sanity schema extract 2>/dev/null)

if [ $? -eq 0 ]; then
  echo "$SCHEMA_OUTPUT" | jq '.' > "${OUTPUT_FILE}"
  
  SCHEMA_COUNT=$(echo "$SCHEMA_OUTPUT" | jq '. | length')
  echo "✅ Schema generated successfully: ${OUTPUT_FILE}"
  echo "   Found ${SCHEMA_COUNT} schema types"
else
  echo "❌ Failed to extract schema"
  exit 1
fi
