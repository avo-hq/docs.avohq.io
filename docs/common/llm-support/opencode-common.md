---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/opencode.webp" alt="OpenCode" class="no-border h-8 -mt-2 inline-block self-center dark:hidden"> <img src="/assets/img/llm-support/opencode-dark.webp" alt="OpenCode" class="no-border h-8 -mt-2 self-center hidden dark:inline-block"> OpenCode

Setup OpenCode to correctly generate Avo code based on your prompt.

## Quick use

Paste the docs link in your prompt and ask OpenCode to read it before generating code.

<CustomCode :content="`Read ${$frontmatter.llmLink} and use it as a reference for Avo code.`" />

## Permanent setup

OpenCode reads the `AGENTS.md` file from your repository. Add a line pointing to Avo's docs:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

Or save the docs in your repo and reference the file from `AGENTS.md`:

<CustomCode :content="`curl -L ${$frontmatter.llmLink} --create-dirs -o docs/avo-docs-map.md`" />

## MCP server

MCP is an API to communicate with AI models. You can add MCP servers and OpenCode will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

Add this to your `opencode.json` config file:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "context7": {
      "type": "local",
      "command": ["npx", "-y", "@upstash/context7-mcp"]
    }
  }
}
```

Now you can ask OpenCode anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```
