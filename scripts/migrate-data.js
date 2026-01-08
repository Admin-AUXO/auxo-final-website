import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID || '4ddas0r0';
const dataset = process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error('❌ SANITY_API_TOKEN environment variable is required');
  console.log('Please set SANITY_API_TOKEN in your .env file');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function checkDocuments() {
  try {
    console.log('Checking existing documents for schema compatibility...\n');
    
    const documents = await client.fetch(`
      *[_type in ["about", "homepage", "services"]]{
        _id,
        _type
      }
    `);
    
    console.log(`Found ${documents.length} documents to check\n`);
    
    if (documents.length === 0) {
      console.log('✅ No documents found. Migration not needed.');
      return;
    }
    
    const issues = [];
    
    for (const doc of documents) {
      const fullDoc = await client.fetch(`*[_id == $id][0]`, { id: doc._id });
      
      if (doc._type === 'about') {
        const missing = checkAboutFields(fullDoc);
        if (missing.length > 0) {
          issues.push({ id: doc._id, type: 'about', missing });
        }
      } else if (doc._type === 'homepage') {
        const missing = checkHomepageFields(fullDoc);
        if (missing.length > 0) {
          issues.push({ id: doc._id, type: 'homepage', missing });
        }
      } else if (doc._type === 'services') {
        const missing = checkServicesFields(fullDoc);
        if (missing.length > 0) {
          issues.push({ id: doc._id, type: 'services', missing });
        }
      }
    }
    
    if (issues.length === 0) {
      console.log('✅ All documents are compatible with the deployed schema.');
      console.log('✅ No data migration required.\n');
      return;
    }
    
    console.log(`⚠️  Found ${issues.length} document(s) with missing optional fields:\n`);
    issues.forEach(issue => {
      console.log(`  ${issue.type} (${issue.id}):`);
      issue.missing.forEach(field => {
        console.log(`    - Missing: ${field}`);
      });
      console.log('');
    });
    
    console.log('ℹ️  These are optional fields. Documents will work, but you may want to add them in Sanity Studio.');
    console.log('ℹ️  Schema deployment completed successfully.\n');
    
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
    process.exit(1);
  }
}

function checkAboutFields(doc) {
  const missing = [];
  if (!doc.hero) missing.push('hero');
  if (!doc.mission) missing.push('mission');
  if (!doc.purpose) missing.push('purpose');
  if (!doc.approach) missing.push('approach');
  if (!doc.team) missing.push('team');
  if (!doc.partnership) missing.push('partnership');
  if (!doc.global) missing.push('global');
  if (!doc.cta) missing.push('cta');
  return missing;
}

function checkHomepageFields(doc) {
  const missing = [];
  if (!doc.hero) missing.push('hero');
  if (!doc.valueProposition) missing.push('valueProposition');
  if (!doc.featuredServices) missing.push('featuredServices');
  if (!doc.techStack) missing.push('techStack');
  if (!doc.capabilities) missing.push('capabilities');
  if (!doc.methodology) missing.push('methodology');
  if (!doc.finalCta) missing.push('finalCta');
  return missing;
}

function checkServicesFields(doc) {
  const missing = [];
  if (!doc.hero) missing.push('hero');
  if (!doc.serviceOfferings) missing.push('serviceOfferings');
  if (!doc.impact) missing.push('impact');
  if (!doc.engagementModels) missing.push('engagementModels');
  if (!doc.cta) missing.push('cta');
  return missing;
}

checkDocuments().catch(console.error);
