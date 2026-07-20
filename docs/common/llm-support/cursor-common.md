---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/cursor.webp" alt="Cursor" class="no-border h-8 -mt-2 inline-block self-center"> Cursor

Setup Cursor to correctly generate Avo code based on your prompt.

## Quick use

Paste the docs link in the chat window with your prompt and Cursor's web search will fetch it.

<CustomCode :content="`Read ${$frontmatter.llmLink} and use it as a reference for Avo code.`" />

## Custom docs

1. In the chat window type `@Docs`
2. Choose `Add new doc`
3. Paste this: `{{$frontmatter.llmLink}}`
4. Now in chat window you can type `@Docs` and choose `Avo` to provide Avo's docs to Cursor.

## Project-level permanent setup

Cursor reads the `AGENTS.md` file from your repository. Add a line pointing to Avo's docs:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

Or save the docs in your repo and reference the file from `AGENTS.md`:

<CustomCode :content="`curl -L ${$frontmatter.llmLink} --create-dirs -o docs/avo-docs-map.md`" />

## MCP server

MCP is an API to communicate with AI models. You can add MCP servers and Cursor will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

Add this to `.cursor/mcp.json` in your project (or `~/.cursor/mcp.json` to enable it globally):

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "Context7": {
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
