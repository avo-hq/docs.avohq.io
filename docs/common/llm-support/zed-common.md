---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/zed.webp" alt="Zed" class="no-border h-8 -mt-2 inline-block self-center"> Zed

Setup Zed to correctly generate Avo code based on your prompt.

## Quick use

In Thread chat type this before your prompt

<CustomCode :content="`@fetch ${$frontmatter.llmLink}`" />

Or in Text thread chat type this before your prompt

<CustomCode :content="`/fetch ${$frontmatter.llmLink}`" />

## Permanent setup

Zed reads the `AGENTS.md` file from your repository. Add a line pointing to Avo's docs:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

## MCP server

MCP is an API to communicate with AI models. You can add MCP servers and Zed will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

The easiest way is installing the Context7 extension: go to `Settings` → `AI` → `MCP Servers` → `Add Server` → `Install from Extensions` and pick Context7.

Or add it as a custom server in your `settings.json`:

```json
{
  "context_servers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "env": {}
    }
  }
}
```

Now you can ask the agent anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```
