---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/cline.webp" alt="Cline" class="no-border h-8 -mt-2 inline-block self-center"> Cline

Set up [Cline](https://cline.bot/) to use Avo's documentation, skills, and MCP tools.

## Quick use

Ask Cline to read the docs map and fetch the pages relevant to your task:

<CustomCode :content="`Read ${$frontmatter.llmLink} and use it as a reference for Avo code.`" />

## Permanent setup

Cline reads `AGENTS.md` from your repository. Add this instruction and check that the rule is enabled in Cline's Rules panel:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

## Skills

For Avo 4 apps, run `rails g avo:skills` and choose a **per-app** install in `.claude/skills`. Cline reads project skills from that directory, even if you do not use Claude Code. Check that the loader is enabled in Cline's Skills panel.

See [Skills](/4.0/agentic-engineering.html#skills) for Avo's installer and [Cline's skills documentation](https://docs.cline.bot/customization/skills) for its supported directories.

## MCP server

MCP (Model Context Protocol) connects coding agents to external tools and context. Add [Context7](https://context7.com/) so Cline can look up Avo's docs while working.

In the Cline extension, open **MCP Servers → Configure → Configure MCP Servers**. Add this entry to the configuration file:

```json
// cline_mcp_settings.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Confirm that Context7's tools appear, then ask Cline to `use context7` when generating Avo code. The empty `autoApprove` list keeps tool calls subject to approval.

For Cline CLI, run `cline mcp` and add a local server with command `npx` and arguments `-y` and `@upstash/context7-mcp@latest`. See [Cline's MCP documentation](https://docs.cline.bot/mcp/mcp-overview) for the CLI wizard and configuration paths.
