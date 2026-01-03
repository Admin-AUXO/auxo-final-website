# Sanity CMS Configuration & Best Practices

## Overview

This project uses Sanity CMS for content management, integrated with Astro v5. The content is managed through Sanity Studio and fetched via GROQ queries.

## Project Configuration

- **Project ID**: `4ddas0r0`
- **Dataset**: `production`
- **API Version**: `2025-01-03` (updated for latest features)
- **Studio Path**: `/studio` (development only)

## Directory Structure

```
schemas/
├── documents/          # Main document types
│   ├── homepage.ts
│   ├── services.ts
│   ├── serviceDetail.ts
│   ├── about.ts
│   ├── siteConfig.ts
│   ├── navigation.ts
│   └── footer.ts
├── objects/           # Reusable object types
│   ├── cta.ts
│   ├── hero.ts
│   └── navigationButton.ts
└── index.ts           # Schema exports

sanity-data/          # Local data backups (gitignored)
src/lib/sanity/       # Sanity client and utilities
```

## Schema Structure

Schemas follow Sanity v3+ best practices with organized folder structure:

- **Type Safety**: Uses `defineType` and `defineField` for type-safe schema definitions
- **Reusable Objects**: Common components (CTA, Hero, Navigation Button) defined once
- **Validation**: Required fields have validation rules
- **Descriptions**: Fields include helpful descriptions for content editors
- **Organization**: Documents and objects separated into dedicated folders

### Document Schemas

#### Homepage (`/schemas/documents/homepage.ts`)

Homepage content with sections: Hero, Problem-Solution, Services Intro, Tech Stack, Capabilities, Methodology, Final CTA.

#### Services (`/schemas/documents/services.ts`)

Services page with Hero, Stages, Impact (industries), Models (engagement types), and CTA sections.

#### Service Detail (`/schemas/documents/serviceDetail.ts`)

Individual service pages with Hero, Overview, Benefits, Process, Outcomes, and CTA sections.

#### About (`/schemas/documents/about.ts`)

About page with Hero, Mission, Purpose, Approach, Team, Partnership, Global, and CTA sections.

#### Site Config (`/schemas/documents/siteConfig.ts`)

Global site configuration including name, tagline, contact info, address, social links, and statistics.

#### Navigation & Footer

Navigation menu items and footer content sections.

### Object Schemas (Reusable)

- **CTA**: Call-to-action sections with title, description, highlights, and button
- **Hero**: Hero sections with title, subtitle, highlights, and CTA
- **Navigation Button**: Simple button components for navigation

## Data Flow

```
Sanity Studio → Sanity API → GROQ Queries → TypeScript Types → Astro Components
```

1. **Content Management**: Editors update content in Sanity Studio
2. **API Layer**: Content is stored in Sanity's hosted database
3. **Query Layer**: GROQ queries fetch specific content (defined in `src/lib/sanity/queries.ts`)
4. **Type Safety**: TypeScript interfaces ensure type safety (defined in `src/data/content/`)
5. **Rendering**: Astro components consume typed content

## Working with Sanity

### Local Development

1. **Start Dev Server**: `npm run dev`
2. **Access Studio**: Navigate to `http://localhost:4340/studio`
3. **Edit Content**: Make changes in the Studio UI
4. **See Changes**: Astro will auto-refresh with new content

### Data Backup & Restore

**Full Backup (with assets)**:
```bash
npm run sanity:backup
```

**Quick Backup (data only)**:
```bash
npm run sanity:backup:quick
```

**Restore Data**:
```bash
npm run sanity:restore
```

Backups are stored in `sanity-data/` directory and excluded from version control.

### TypeScript Type Generation

Generate TypeScript types from Sanity schemas:

```bash
npm run sanity:typegen
```

This extracts schema structure and generates type definitions for GROQ query results.

### Using the Sanity MCP

The Sanity MCP server is configured in `.mcp.json` and allows AI assistants like Claude Code to:

- Query content using GROQ
- Create and update documents
- Explore schema structure
- Manage datasets and API tokens

**MCP Configuration**:
```json
{
  "sanity": {
    "command": "npx",
    "args": ["-y", "@sanity/mcp-server"],
    "env": {
      "SANITY_PROJECT_ID": "${SANITY_PROJECT_ID}",
      "SANITY_DATASET": "${SANITY_DATASET}",
      "SANITY_API_TOKEN": "${SANITY_API_TOKEN}",
      "SANITY_API_VERSION": "${SANITY_API_VERSION}"
    }
  }
}
```

### Direct API Access

You can also interact with Sanity via the HTTP API:

**Fetch Data**:
```bash
curl -G "https://{projectId}.api.sanity.io/v{apiVersion}/data/query/{dataset}" \
  --data-urlencode 'query=*[_type=="homepage"]' \
  -H "Authorization: Bearer {token}"
```

**Update Data**:
```bash
curl -X POST "https://{projectId}.api.sanity.io/v{apiVersion}/data/mutate/{dataset}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "mutations": [{
      "patch": {
        "id": "homepage",
        "set": { "problem.line1": "New text" }
      }
    }]
  }'
```

## Best Practices

### 1. Schema Design

- **Use semantic field names**: `line1`, `line2` instead of `text1`, `text2`
- **Add descriptions**: Help editors understand field purpose
- **Validate required fields**: Prevent incomplete content
- **Use arrays for highlights**: Enables flexible text highlighting in UI

### 2. Query Optimization

- **Fetch only needed fields**: Reduces payload size
- **Use caching**: Implemented in `src/lib/sanity/cache.ts`
- **Batch queries**: Combine related queries with `Promise.all()`

### 3. Content Updates

- **Test locally first**: Use dev environment before production
- **Maintain type consistency**: Update TypeScript types when changing schemas
- **Update queries**: Ensure GROQ queries match schema structure

### 4. Type Safety

When adding/modifying schemas:

1. Update schema in `/schemas/`
2. Update TypeScript interface in `src/data/content/`
3. Update GROQ query in `src/lib/sanity/queries.ts`
4. Update component props/usage

### 5. Migration Strategy

When restructuring content (like moving from `valueProposition` to `line1`/`line2`):

1. Create new fields in schema
2. Deploy schema changes to Sanity
3. Migrate data using mutations
4. Update queries and types
5. Update components
6. Remove old fields (use `unset` in mutations)

## Environment Variables

Required in `.env`:

```env
SANITY_PROJECT_ID=4ddas0r0
SANITY_DATASET=production
SANITY_API_TOKEN=your_token_here
SANITY_API_VERSION=2025-01-03
```

## Resources

- [Sanity MCP Server Documentation](https://www.sanity.io/docs/compute-and-ai/mcp-server)
- [Sanity MCP Server GitHub](https://github.com/sanity-io/sanity-mcp-server)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Sanity Schema Reference](https://www.sanity.io/docs/schema-types)

## Troubleshooting

### Studio Not Loading

- Ensure React integration is properly configured in Astro
- Check that `NODE_ENV=development` is set
- Verify Sanity dependencies are installed

### Content Not Updating

- Clear Sanity cache: `rm -rf node_modules/.cache`
- Check API token permissions
- Verify query matches schema structure

### Type Errors

- Regenerate types after schema changes
- Check that all required fields are present in queries
- Verify TypeScript interfaces match schema structure
