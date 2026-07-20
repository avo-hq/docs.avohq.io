---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/jetbrains.webp" alt="JetBrains" class="no-border h-8 -mt-2 inline-block self-center"> JetBrains IDEs

Setup JetBrains AI Assistant and Junie to correctly generate Avo code based on your prompt in RubyMine and other JetBrains IDEs.

## Quick use

Use the `/web` command in the AI chat to make it fetch the docs, then write your prompt.

<CustomCode :content="`/web Read ${$frontmatter.llmLink} and use it as a reference for Avo code.`" />

## Permanent setup

Junie reads the `.junie/AGENTS.md` file from your repository (the older `.junie/guidelines.md` still works too). Add a line pointing to Avo's docs:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

Or save the docs in your repo and reference the file from `.junie/AGENTS.md`:

<CustomCode :content="`curl -L ${$frontmatter.llmLink} --create-dirs -o docs/avo-docs-map.md`" />

For the AI Assistant chat, add the same line to a project rules file under `.aiassistant/rules/`.

## MCP server

MCP is an API to communicate with AI models. You can add MCP servers and the AI Assistant will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

1. Go to `Settings` → `Tools` → `AI Assistant` → `Model Context Protocol (MCP)`

2. Open the command menu in the top-left corner of the MCP dialog and choose `As JSON`

3. Paste this:

```json
{
  "mcpServers": {
    "Context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

Now you can ask the AI Assistant anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```
