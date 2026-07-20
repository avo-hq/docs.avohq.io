---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/gemini.webp" alt="Gemini" class="no-border h-8 -mt-2 inline-block"> Gemini

Setup Gemini to correctly generate Avo code based on your prompt.

## Quick use

Paste the docs link before your prompt in a normal chat and Gemini will read the page (no Deep Research needed — that's a long-running research agent that outputs a report, not code):

<CustomCode :content="$frontmatter.llmLink" />

For example:

<CustomCode :content="`${$frontmatter.llmLink} create an Avo resource for a product model`" />

## Gemini CLI

Gemini CLI reads the `GEMINI.md` file from your repository. Add a line pointing to Avo's docs:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

### MCP server

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

Add this to `.gemini/settings.json` in your project (or `~/.gemini/settings.json` to enable it globally):

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

Now you can ask Gemini CLI anything about Avo, and write `use context7` at the end of your prompt.
