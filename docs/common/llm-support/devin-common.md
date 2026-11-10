---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/devin.webp" alt="Devin Desktop" class="no-border h-8 -mt-2 inline-block self-center"> Devin Desktop

Set up Devin Local in [Devin Desktop](https://www.windsurf.com/), formerly Windsurf, to use Avo's documentation, skills, and MCP tools.

## Quick use

Ask the agent to read the docs map and fetch the pages relevant to your task:

<CustomCode :content="`Read ${$frontmatter.llmLink} and use it as a reference for Avo code.`" />

## Permanent setup

Devin Local reads `AGENTS.md` from your repository. Add this instruction:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

## Skills

For Avo 4 apps, run `rails g avo:skills` and choose `.agents/skills`. Devin Local reads that directory, so it can discover the Avo skills loader. See [Skills](/4.0/agentic-engineering.html#skills) for the full setup.

## MCP server

MCP (Model Context Protocol) connects coding agents to external tools and context. Add [Context7](https://context7.com/) so Devin Local can look up Avo's docs while working.

In the Agents window, open **Customize → MCPs**. For a project-level setup, add the following to `.devin/mcp_config.json`:

```json
// .devin/mcp_config.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

Refresh the server list, confirm Context7 is enabled, and ask the agent to `use context7` when generating Avo code. Review tool calls when prompted.

See [Devin Local customizations](https://docs.devin.ai/desktop/devin-local/customizations) for user-level configuration and legacy Windsurf settings.
