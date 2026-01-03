#!/bin/bash

set -e

REPO_OWNER="Admin-AUXO"
REPO_NAME="auxo-final-website"
GITHUB_TOKEN="${GITHUB_PERSONAL_ACCESS_TOKEN}"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_PERSONAL_ACCESS_TOKEN not set"
  exit 1
fi

source .env 2>/dev/null || true

add_secret() {
  local secret_name=$1
  local secret_value=$2

  if [ -z "$secret_value" ]; then
    echo "Warning: $secret_name is empty, skipping"
    return
  fi

  echo "Getting repository public key..."
  KEY_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key")

  KEY_ID=$(echo "$KEY_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['key_id'])" 2>/dev/null)
  PUBLIC_KEY=$(echo "$KEY_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['key'])" 2>/dev/null)

  if [ -z "$KEY_ID" ] || [ -z "$PUBLIC_KEY" ]; then
    echo "Error: Failed to parse repository public key"
    echo "Response: $KEY_RESPONSE"
    exit 1
  fi

  echo "Installing libsodium if needed..."
  if ! command -v base64 &> /dev/null; then
    echo "base64 command not found"
    exit 1
  fi

  echo "Encrypting secret using Python..."
  ENCRYPTED_VALUE=$(python3 -c "
import base64
import os
from nacl import encoding, public

def encrypt_secret(public_key: str, secret_value: str) -> str:
    public_key_bytes = base64.b64decode(public_key)
    public_key_obj = public.PublicKey(public_key_bytes)
    sealed_box = public.SealedBox(public_key_obj)
    encrypted = sealed_box.encrypt(secret_value.encode('utf-8'))
    return base64.b64encode(encrypted).decode('utf-8')

try:
    print(encrypt_secret('$PUBLIC_KEY', '''$secret_value'''))
except ImportError:
    print('ERROR_NACL_NOT_INSTALLED')
    exit(1)
" 2>&1)

  if [ "$ENCRYPTED_VALUE" = "ERROR_NACL_NOT_INSTALLED" ]; then
    echo "Installing PyNaCl..."
    pip3 install --user PyNaCl -q

    ENCRYPTED_VALUE=$(python3 -c "
import base64
from nacl import encoding, public

def encrypt_secret(public_key: str, secret_value: str) -> str:
    public_key_bytes = base64.b64decode(public_key)
    public_key_obj = public.PublicKey(public_key_bytes)
    sealed_box = public.SealedBox(public_key_obj)
    encrypted = sealed_box.encrypt(secret_value.encode('utf-8'))
    return base64.b64encode(encrypted).decode('utf-8')

print(encrypt_secret('$PUBLIC_KEY', '''$secret_value'''))
")
  fi

  echo "Adding secret $secret_name to repository..."
  RESPONSE=$(curl -s -X PUT \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/$secret_name" \
    -d "{\"encrypted_value\":\"$ENCRYPTED_VALUE\",\"key_id\":\"$KEY_ID\"}")

  if echo "$RESPONSE" | grep -q "error"; then
    echo "Error adding secret: $RESPONSE"
    exit 1
  fi

  echo "✓ Successfully added $secret_name"
}

echo "Adding EmailJS secrets to GitHub repository..."
echo ""

add_secret "PUBLIC_EMAILJS_PUBLIC_KEY" "$PUBLIC_EMAILJS_PUBLIC_KEY"
add_secret "PUBLIC_EMAILJS_SERVICE_ID" "$PUBLIC_EMAILJS_SERVICE_ID"
add_secret "PUBLIC_EMAILJS_TEMPLATE_ID" "$PUBLIC_EMAILJS_TEMPLATE_ID"

echo ""
echo "✓ All secrets added successfully!"
echo ""
echo "You can verify at: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
