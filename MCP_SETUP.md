# MCP Server Setup Guide

This project is configured with Model Context Protocol (MCP) servers to enhance AI assistant capabilities.

## Quick Start

1. **Install Claude Code CLI** (if not already installed):
   ```bash
   npm install -g @anthropic/claude-code
   ```

2. **Copy environment template** (optional):
   ```bash
   cp .env.example .env
   ```

3. **Add GitHub token to `.env`** (optional, only if using GitHub MCP):
   - `GITHUB_PERSONAL_ACCESS_TOKEN` - For GitHub operations (create at https://github.com/settings/tokens)

4. **Load MCP configuration**:
   ```bash
   claude mcp install mcp.json
   ```

## Available MCP Servers

### Core Development Tools

#### 1. Playwright (`@playwright/mcp`)
- **Purpose**: Browser automation and E2E testing
- **Use cases**: Run tests, debug test failures, capture screenshots
- **No setup required**: Works out of the box

#### 2. Filesystem (`@modelcontextprotocol/server-filesystem`)
- **Purpose**: Advanced file operations in project directory
- **Use cases**: Search across files, read multiple files efficiently
- **Scope**: Limited to current project directory

#### 3. Git (`@cyanheads/git-mcp-server`)
- **Purpose**: Git repository operations
- **Use cases**: Check status, create branches, view diffs, commit history
- **No setup required**: Uses local git installation

### Web & API Tools

#### 4. Fetch (`@modelcontextprotocol/server-fetch`)
- **Purpose**: Fetch and parse web content from URLs
- **Use cases**: Read documentation, fetch API data, parse HTML
- **No setup required**: Works with any public URL

#### 5. GitHub (`@modelcontextprotocol/server-github`)
- **Purpose**: GitHub API operations
- **Setup**: Requires `GITHUB_PERSONAL_ACCESS_TOKEN` in `.env`
- **Permissions needed**: `repo`, `workflow` (for full functionality)
- **Use cases**: PR management, issue tracking, workflow debugging

### Advanced Features

#### 6. Memory (`@modelcontextprotocol/server-memory`)
- **Purpose**: Persistent knowledge graph across conversations
- **Use cases**: Remember project patterns, user preferences, common fixes
- **No setup required**: Stores data locally

## Astro-Specific Use Cases

### With Fetch MCP
```bash
# Read Astro docs
"Fetch and summarize https://docs.astro.build/en/guides/integrations-guide/"

# Get GROQ reference
"Fetch https://www.sanity.io/docs/groq and explain array projection"
```

### With Playwright MCP
```bash
# Run tests
"Run Playwright tests for the contact form"

# Debug failing test
"Show me why the navigation test is failing"

# Capture screenshots
"Take a screenshot of the homepage in mobile viewport"
```

### With GitHub MCP
```bash
# Check workflow status
"Show me the status of the latest GitHub Actions deploy"

# Review PR
"List open PRs and show me the diff for PR #42"
```

### With Filesystem MCP
```bash
# Cross-file search
"Find all components that use the Lenis smooth scroll"

# Pattern detection
"Show me all files that import from @sanity/client"
```

## Testing MCP Configuration

```bash
# List installed servers
claude mcp list

# Test a specific server
claude mcp test playwright

# View server logs (if issues)
claude mcp logs github
```

## Troubleshooting

### "MCP server failed to start"
- Check that `npx` is available: `which npx`
- Verify Node.js version: `node --version` (requires >=20.19.0)
- Check `.env` file has required API keys

### "API key invalid"
- Verify GitHub token format (no quotes, no spaces)
- Check token permissions (needs `repo` scope)
- Ensure token is not expired

### "Command not found"
- Install Claude Code: `npm install -g @anthropic/claude-code`
- Restart terminal after installation

## Updating MCP Servers

MCP servers are installed via `npx -y`, so they auto-update to latest versions. To force update:

```bash
# Clear npx cache
rm -rf ~/.npm/_npx

# Reinstall configuration
claude mcp install mcp.json
```

## Security Notes

- **GitHub Token**: Never commit `.env` file to git (already in `.gitignore`)
- **Filesystem Access**: Scoped to project directory only
- **Token Permissions**: Use fine-grained tokens with minimal permissions (`repo` scope minimum)

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Claude Code MCP Guide](https://code.claude.com/docs/en/mcp)
- [Available MCP Servers](https://github.com/modelcontextprotocol/servers)
- [GitHub Token Creation](https://github.com/settings/tokens)
