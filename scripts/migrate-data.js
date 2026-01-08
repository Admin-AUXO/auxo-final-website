import { createClient } from '@sanity/client';

const token = process.env.SANITY_API_TOKEN;
if (!token) {
  console.error('❌ SANITY_API_TOKEN required');
  process.exit(1);
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '4ddas0r0',
  dataset: process.env.SANITY_DATASET || 'production',
  token,
  useCdn: false,
  apiVersion: '2024-01-01',
});

const fieldChecks = {
  about: (d) => ['hero', 'mission', 'purpose', 'approach', 'team', 'partnership', 'global', 'cta'].filter(f => !d[f]),
  homepage: (d) => ['hero', 'valueProposition', 'featuredServices', 'techStack', 'capabilities', 'methodology', 'finalCta'].filter(f => !d[f]),
  services: (d) => ['hero', 'serviceOfferings', 'impact', 'engagementModels', 'cta'].filter(f => !d[f])
};

async function checkDocuments() {
  try {
    const docs = await client.fetch(`*[_type in ["about", "homepage", "services"]]{_id,_type}`);
    if (docs.length === 0) {
      console.log('✅ No documents found');
      return;
    }
    const issues = [];
    for (const doc of docs) {
      const full = await client.fetch(`*[_id == $id][0]`, { id: doc._id });
      const missing = fieldChecks[doc._type]?.(full) || [];
      if (missing.length > 0) issues.push({ ...doc, missing });
    }
    if (issues.length === 0) {
      console.log('✅ All documents compatible');
    } else {
      console.log(`⚠️  ${issues.length} document(s) with missing optional fields:`);
      issues.forEach(i => console.log(`  ${i._type} (${i._id}): ${i.missing.join(', ')}`));
    }
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

checkDocuments();
