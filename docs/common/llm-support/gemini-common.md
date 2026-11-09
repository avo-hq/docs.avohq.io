---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/gemini.webp" alt="Gemini CLI" class="no-border h-8 -mt-2 inline-block"> Gemini CLI

Set up Gemini CLI to use Avo's documentation.

## Quick use

Ask Gemini CLI to read the docs map and fetch the pages relevant to your task:

<CustomCode :content="`Read ${$frontmatter.llmLink} and use it as a reference for Avo code.`" />

## Gemini CLI

Gemini CLI reads the `GEMINI.md` file from your repository. Add a line pointing to Avo's docs:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

### MCP server

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

Add this to `.gemini/settings.json` in your project (or `~/.gemini/settings.json` to enable it globally):

```json
// .gemini/settings.json
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

## Gemini web app

For the web app, paste the docs map into your prompt and ask Gemini to read it before generating Avo code. If it cannot fetch the pages, attach the relevant Markdown files instead. The CLI configuration above does not configure the web app.

<CustomCode :content="`Read ${$frontmatter.llmLink} and use it as a reference for Avo code.`" />
