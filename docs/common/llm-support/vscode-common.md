---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/vscode.webp" alt="VSCode" class="no-border h-8 -mt-2 inline-block self-center"> VSCode

Setup VSCode to correctly generate Avo code based on your prompt.

## Quick use

In chat window type this and VSCode will use Avo's docs map to generate code.

<CustomCode :content="`#fetch ${$frontmatter.llmLink}`" />

## Project-level permanent setup

Copilot automatically applies the `.github/copilot-instructions.md` file to every chat request. Add a line pointing to Avo's docs:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

Or save the docs in your repo and reference the file from `.github/copilot-instructions.md`:

<CustomCode :content="`curl -L ${$frontmatter.llmLink} --create-dirs -o docs/avo-docs-map.md`" />

VSCode also reads the `AGENTS.md` file from your workspace root, if you prefer the cross-tool standard.

## MCP server

MCP is an API to communicate with AI models. You can add MCP servers and Copilot will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

Create a `.vscode/mcp.json` file in your project (or run the `MCP: Add Server` command from the Command Palette) with this content:

```json
// .vscode/mcp.json
{
  "servers": {
    "Context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

Now in Agent Mode you can ask AI anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```
