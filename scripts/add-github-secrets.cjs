#!/usr/bin/env node

const https = require('https');
const crypto = require('crypto');

const REPO_OWNER = 'Admin-AUXO';
const REPO_NAME = 'auxo-final-website';
const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

const secrets = {
  PUBLIC_EMAILJS_PUBLIC_KEY: process.env.PUBLIC_EMAILJS_PUBLIC_KEY,
  PUBLIC_EMAILJS_SERVICE_ID: process.env.PUBLIC_EMAILJS_SERVICE_ID,
  PUBLIC_EMAILJS_TEMPLATE_ID: process.env.PUBLIC_EMAILJS_TEMPLATE_ID,
};

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_PERSONAL_ACCESS_TOKEN not set');
  process.exit(1);
}

function httpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function getPublicKey() {
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${REPO_OWNER}/${REPO_NAME}/actions/secrets/public-key`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'AUXO-Secrets-Script',
      'Accept': 'application/vnd.github.v3+json',
    },
  };

  const response = await httpsRequest(options);
  if (response.statusCode !== 200) {
    throw new Error(`Failed to get public key: ${JSON.stringify(response.body)}`);
  }
  return response.body;
}

function encryptSecret(publicKey, secretValue) {
  const sodium = (() => {
    try {
      return require('tweetsodium');
    } catch (e) {
      return null;
    }
  })();

  if (sodium) {
    const messageBytes = Buffer.from(secretValue);
    const keyBytes = Buffer.from(publicKey, 'base64');
    const encryptedBytes = sodium.seal(messageBytes, keyBytes);
    return Buffer.from(encryptedBytes).toString('base64');
  }

  throw new Error('tweetsodium not installed. Run: npm install --save-dev tweetsodium');
}

async function addSecret(secretName, secretValue, publicKey, keyId) {
  if (!secretValue) {
    console.log(`⚠️  Skipping ${secretName} (empty value)`);
    return;
  }

  console.log(`Adding ${secretName}...`);

  const encryptedValue = encryptSecret(publicKey, secretValue);

  const options = {
    hostname: 'api.github.com',
    path: `/repos/${REPO_OWNER}/${REPO_NAME}/actions/secrets/${secretName}`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'AUXO-Secrets-Script',
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
  };

  const data = {
    encrypted_value: encryptedValue,
    key_id: keyId,
  };

  const response = await httpsRequest(options, data);

  if (response.statusCode === 201 || response.statusCode === 204) {
    console.log(`✓ Successfully added ${secretName}`);
  } else {
    console.error(`✗ Failed to add ${secretName}:`, response.body);
  }
}

async function main() {
  console.log('Adding EmailJS secrets to GitHub repository...\n');

  try {
    const { key, key_id } = await getPublicKey();
    console.log('✓ Retrieved repository public key\n');

    for (const [name, value] of Object.entries(secrets)) {
      await addSecret(name, value, key, key_id);
    }

    console.log('\n✓ All secrets added successfully!');
    console.log(`\nVerify at: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/secrets/actions`);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('tweetsodium')) {
      console.log('\nInstalling tweetsodium...');
      const { execSync } = require('child_process');
      execSync('npm install --save-dev tweetsodium', { stdio: 'inherit' });
      console.log('\nPlease run this script again.');
    }
    process.exit(1);
  }
}

main();
