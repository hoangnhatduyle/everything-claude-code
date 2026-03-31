# Everything Claude Code (ECC) — Complete Installation Guide

A step-by-step guide to install every feature of ECC for Claude Code and Cursor.

---

## Prerequisites

- **Node.js** >= 18 installed
- **Git** installed
- **Claude Code** extension in Cursor (or Claude Code CLI)
- (Optional) API keys for MCP servers you want to use

---

## Step 1: Clone the Repository & Install Dependencies

```bash
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code
npm install
```

This installs the required dependencies (`ajv`, `sql.js`, `@iarna/toml`, etc.).

---

## Step 2: Install ECC for Claude Code (Global)

This installs agents, skills, commands, hooks, and rules to `~/.claude/` — applies to all projects.

### Linux / macOS / WSL

```bash
node scripts/ecc.js install --profile full
```

### Windows PowerShell

```powershell
node scripts\ecc.js install --profile full
```

### What this installs

| Component | Count | Location |
|-----------|-------|----------|
| Agents | 28 | `~/.claude/agents/` |
| Skills | 125+ | `~/.claude/skills/` |
| Commands | 60+ | `~/.claude/commands/` |
| Hooks | 20+ | `~/.claude/hooks.json` |
| Rules | 12 language sets + common | `~/.claude/rules/` |

---

## Step 3: Install ECC for Cursor (Per-Project)

If you also want Cursor's native AI to benefit, run this **inside each project directory**:

```bash
cd /path/to/your/project
node /path/to/everything-claude-code/scripts/ecc.js install --target cursor --profile full
```

This installs to `.cursor/` inside your project.

> **Note:** Claude Code running inside Cursor reads from `~/.claude/` (Step 2), not `.cursor/`. Step 2 is for Claude Code; this step is for Cursor's own AI features. Both can coexist.

---

## Step 4: Install the Claude Code Plugin (Optional — CLI Users)

If you use the Claude Code CLI (`claude` command in terminal), install ECC as a plugin for tighter integration:

```
/plugin marketplace add affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code
```

Run these commands from within Claude Code CLI. This gives you plugin-level integration (skills visible in `/plugins`, etc.).

> Skip this if you only use Claude Code inside Cursor.

---

## Step 5: Configure MCP Servers

This is the most impactful step after the base install. MCP servers give Claude Code superpowers — GitHub integration, web search, live docs, browser testing, etc.

### Where to add MCP config

Edit (or create) `~/.claude.json` and add an `mcpServers` section.

### Recommended Tier 1: Free, No API Key (Enable These)

Add these to your `~/.claude.json` — they work immediately with no signup:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp", "--browser", "chrome"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "token-optimizer": {
      "command": "npx",
      "args": ["-y", "token-optimizer-mcp"]
    }
  }
}
```

| Server | What it gives you |
|--------|------------------|
| `context7` | Live, up-to-date framework/library documentation (powers the `/docs` command) |
| `sequential-thinking` | Chain-of-thought reasoning for complex problems |
| `playwright` | Browser automation for E2E testing (powers `/e2e` command) |
| `memory` | Persistent memory across sessions |
| `token-optimizer` | 95%+ context reduction via deduplication |

### Recommended Tier 2: Free, Need API Key

Add these if you have (or create) accounts for the services:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**How to get your GitHub PAT:**
1. Go to github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Create a new token with `repo`, `read:org`, and `read:user` scopes
3. Replace `ghp_your_token_here` with your actual token

### Tier 3: Paid Services (Enable If You Use Them)

Only add these if you have active accounts:

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "your_key_here"
      }
    },
    "exa-web-search": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server"],
      "env": {
        "EXA_API_KEY": "your_key_here"
      }
    },
    "fal-ai": {
      "command": "npx",
      "args": ["-y", "fal-ai-mcp-server"],
      "env": {
        "FAL_KEY": "your_key_here"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=your_project_ref"]
    },
    "browserbase": {
      "command": "npx",
      "args": ["-y", "@browserbasehq/mcp-server-browserbase"],
      "env": {
        "BROWSERBASE_API_KEY": "your_key_here"
      }
    },
    "confluence": {
      "command": "npx",
      "args": ["-y", "confluence-mcp-server"],
      "env": {
        "CONFLUENCE_BASE_URL": "https://your-domain.atlassian.net/wiki",
        "CONFLUENCE_EMAIL": "your@email.com",
        "CONFLUENCE_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

| Service | Key to obtain | Where to get it |
|---------|--------------|-----------------|
| Firecrawl | `FIRECRAWL_API_KEY` | [firecrawl.dev](https://firecrawl.dev) |
| Exa | `EXA_API_KEY` | [exa.ai](https://exa.ai) |
| fal.ai | `FAL_KEY` | [fal.ai](https://fal.ai) |
| Supabase | Project ref | [supabase.com](https://supabase.com) (per-project) |
| Browserbase | `BROWSERBASE_API_KEY` | [browserbase.com](https://browserbase.com) |
| Confluence | URL + Email + Token | Your Atlassian admin panel |

### Tier 4: HTTP-Based (No Install, Just Add URL)

These connect to cloud services via HTTP — no npm packages needed:

```json
{
  "mcpServers": {
    "vercel": {
      "type": "http",
      "url": "https://mcp.vercel.com"
    },
    "cloudflare-docs": {
      "type": "http",
      "url": "https://docs.mcp.cloudflare.com/mcp"
    },
    "clickhouse": {
      "type": "http",
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

> Only add Vercel/Cloudflare/ClickHouse if you use those platforms.

### Tier 5: Advanced / Local (Optional)

```json
{
  "mcpServers": {
    "devfleet": {
      "type": "http",
      "url": "http://localhost:18801/mcp"
    },
    "insaits": {
      "command": "python3",
      "args": ["-m", "insa_its.mcp_server"]
    },
    "magic": {
      "command": "npx",
      "args": ["-y", "@magicuidesign/mcp@latest"]
    }
  }
}
```

| Server | What it gives you | Prerequisite |
|--------|------------------|-------------|
| `devfleet` | Multi-agent orchestration in isolated worktrees | Must run devfleet server locally |
| `insaits` | AI-to-AI security monitoring (OWASP MCP Top 10) | `pip install insa-its` |
| `magic` | Magic UI component generation | None |

### Important: Keep ≤10 MCP Servers Enabled

Each MCP server adds tool definitions to your context, eating tokens. With all 23 enabled, your 200K context shrinks to ~70K.

**My recommended starter set (6 servers):**
1. `context7` — live docs
2. `sequential-thinking` — reasoning
3. `playwright` — E2E testing
4. `github` — PR/issue operations
5. `memory` — persistent memory
6. `token-optimizer` — context compression

Disable per-project what you don't need by adding to your project's `.claude/settings.json`:
```json
{
  "disabledMcpServers": ["supabase", "railway", "vercel", "confluence"]
}
```

---

## Step 6: Set Environment Variables

Create a `.env` file in your project root, or set system-wide:

### Required (for MCP servers you enabled)

```bash
# Only set the ones for servers you enabled in Step 5
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
FIRECRAWL_API_KEY=your_key_here
EXA_API_KEY=your_key_here
FAL_KEY=your_key_here
```

### Optional (ECC behavior)

```bash
# Package manager preference (auto-detected if not set)
CLAUDE_PACKAGE_MANAGER=npm

# Hook strictness: minimal | standard (default) | strict
ECC_HOOK_PROFILE=standard

# Token optimization (recommended)
MAX_THINKING_TOKENS=10000
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50
CLAUDE_CODE_SUBAGENT_MODEL=haiku
```

### Setting Environment Variables

**WSL / Linux / macOS** — Add to `~/.bashrc` or `~/.zshrc`:
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_your_token_here"
export ECC_HOOK_PROFILE="standard"
```

**Windows PowerShell** — Add to your profile (`$PROFILE`):
```powershell
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "ghp_your_token_here"
$env:ECC_HOOK_PROFILE = "standard"
```

**Windows System** — Settings → System → Advanced → Environment Variables

---

## Step 7: Configure Hook Profile (Optional)

ECC hooks fire automatically during Claude Code sessions. Three profiles available:

| Profile | Behavior | Best for |
|---------|----------|----------|
| `minimal` | Essential lifecycle + safety only | Low token overhead, maximum speed |
| `standard` | Balanced quality + safety (default) | Most users |
| `strict` | Additional reminders + guardrails | High-stakes projects, production code |

To change:
```bash
export ECC_HOOK_PROFILE=strict
```

To disable specific hooks:
```bash
export ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"
```

---

## Step 8: Configure Token Optimization (Recommended)

Add to `~/.claude/settings.json`:

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50",
    "CLAUDE_CODE_SUBAGENT_MODEL": "haiku"
  }
}
```

| Setting | Default | Recommended | Savings |
|---------|---------|-------------|---------|
| Model | opus | **sonnet** | ~60% cost reduction |
| MAX_THINKING_TOKENS | 31,999 | **10,000** | ~70% hidden cost reduction |
| CLAUDE_AUTOCOMPACT_PCT_OVERRIDE | 95% | **50%** | Healthier sessions |
| CLAUDE_CODE_SUBAGENT_MODEL | same model | **haiku** | ~80% cheaper subagents |

> Use **opus** only when you need complex reasoning (architecture decisions, multi-file refactors). Sonnet handles 90% of daily coding.

---

## Step 9: Multi-Model Commands (Optional)

The `/multi-*` commands (`/multi-workflow`, `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`) orchestrate across Claude + Codex + Gemini.

**Requirements:**
1. Install `codeagent-wrapper` to `~/.claude/bin/` (external tool, not part of ECC)
2. OpenAI API key (for Codex backend)
3. Google AI API key (for Gemini frontend)

> Skip this entirely if you don't want to pay for OpenAI/Google APIs. All other ECC features work without this.

---

## Step 10: Verify Installation

### Run the doctor

```bash
# From the ECC repo directory
node scripts/ecc.js doctor
```

This checks for missing files, drifted content, version mismatches, and path issues. Green = healthy.

### Run the test suite

```bash
node tests/run-all.js
```

All tests should pass.

### Verify from Claude Code

Open Claude Code and try:
- Type `/` — you should see 60+ commands in the autocomplete
- Type `/plan Test the installation` — should invoke the planner agent
- Type `/docs React hooks` — should use Context7 MCP for live docs (if configured)

### Check installed components

```bash
node scripts/ecc.js list-installed
```

Expected output should show `full` profile with all 19 modules.

---

## Post-Install: Ongoing Maintenance

### Check for drift

```bash
node scripts/ecc.js doctor
```

Run periodically to catch files that were accidentally modified or deleted.

### Repair drifted files

```bash
node scripts/ecc.js repair
```

Restores any files that changed since install.

### Update ECC

```bash
cd /path/to/everything-claude-code
git pull
npm install
node scripts/ecc.js install --profile full
```

Re-running install overwrites managed files with the latest versions.

### Uninstall ECC

```bash
node scripts/ecc.js uninstall
```

Removes all ECC-managed files and restores any previous content that was backed up.

---

## Quick Reference: What You Should Have After Install

```
~/.claude/
├── agents/              ← 28 specialized AI agents
├── commands/            ← 60+ slash commands (/tdd, /plan, /code-review, etc.)
├── rules/               ← Coding rules (common + 12 languages)
│   ├── common/          ← Security, testing, git workflow, coding style
│   ├── typescript/      ← TS/JS specific rules
│   ├── python/          ← Python specific rules
│   ├── rust/            ← Rust specific rules
│   ├── golang/          ← Go specific rules
│   ├── java/            ← Java specific rules
│   ├── kotlin/          ← Kotlin specific rules
│   ├── cpp/             ← C++ specific rules
│   ├── csharp/          ← C# specific rules
│   ├── swift/           ← Swift specific rules
│   ├── php/             ← PHP specific rules
│   └── perl/            ← Perl specific rules
├── skills/              ← 125+ domain knowledge documents
├── hooks.json           ← 20+ lifecycle automations
├── ecc/
│   └── install-state.json  ← Tracks what was installed (for doctor/repair/uninstall)
└── ... (your existing files untouched)

~/.claude.json           ← MCP server configurations (Step 5)
```

---

## Troubleshooting

### "Cannot find module 'ajv'"
Run `npm install` in the everything-claude-code directory first.

### Commands don't show up in Claude Code
Make sure you ran install without `--target` (defaults to `claude`), not just `--target cursor`.

### MCP servers not connecting
- Check `~/.claude.json` for valid JSON (no trailing commas)
- Verify API keys are set correctly
- Run `/mcp` in Claude Code to see server status
- Check that `npx` works in your terminal

### Hooks not firing
- Check `ECC_HOOK_PROFILE` isn't set to `minimal` (which disables most hooks)
- Verify `~/.claude/hooks.json` exists and is valid JSON

### Doctor reports errors
```bash
node scripts/ecc.js repair        # fix drifted/missing files
node scripts/ecc.js doctor        # verify again
```

### Want to start fresh
```bash
node scripts/ecc.js uninstall     # remove everything
node scripts/ecc.js install --profile full  # reinstall
```