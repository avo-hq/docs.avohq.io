---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/claude.webp" alt="Claude" class="no-border h-8 -mt-2 inline-block self-center"> Claude

Setup Claude Code and the Claude app to correctly generate Avo code based on your prompt.

## Quick use

Paste the link in the prompt and write your prompt. Claude will fetch the docs pages it needs from the map.

<CustomCode :content="$frontmatter.llmLink" />

## Claude Code

Claude Code reads the `CLAUDE.md` file from your repository. Add a line pointing to Avo's docs:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

Or save the docs in your repo and reference the file from `CLAUDE.md`:

<CustomCode :content="`curl -L ${$frontmatter.llmLink} --create-dirs -o docs/avo-docs-map.md`" />

To add the [Context7](https://context7.com/) MCP server to Claude Code, run:

<CustomCode content="claude mcp add context7 -- npx -y @upstash/context7-mcp" />

## MCP server in the Claude app

MCP is an API to communicate with AI models. You can add MCP servers and Claude will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

1. Go to Settings > Developer

2. Click `Edit Config` button

3. Add this to the config file:

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

4. Fully quit and reopen the Claude app so the server loads.

Now you can ask AI anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```
