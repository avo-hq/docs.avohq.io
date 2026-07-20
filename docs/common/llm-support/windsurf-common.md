---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/windsurf.webp" alt="Windsurf" class="no-border h-8 -mt-2 inline-block"> Windsurf

Setup Windsurf to correctly generate Avo code based on your prompt.

## Quick use

In chat window type this and write your prompt.

<CustomCode :content="`@web ${$frontmatter.llmLink}`" />

## Permanent setup

Windsurf reads the `AGENTS.md` file from your repository. Add a line pointing to Avo's docs:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

## MCP server

MCP is an API to communicate with AI models. You can add MCP servers and Windsurf will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

1. Press <kbd>⌘ CMD</kbd>+<kbd>⇧ Shift</kbd>+<kbd>P</kbd> (or <kbd>⌃ Ctrl</kbd>+<kbd>⇧ Shift</kbd>+<kbd>P</kbd> on Windows)

2. Type `Windsurf: Configure MCP Servers`

3. Click `Add custom server`

4. Add this:

```json
// mcp_config.json
{
  "mcpServers": {
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp@latest"]
  }
  }
}
```

5. Fully quit and reopen Windsurf so the server loads.

Now you can ask AI anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```
