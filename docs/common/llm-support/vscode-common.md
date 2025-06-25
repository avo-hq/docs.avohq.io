---
prev: false
next: false
---

# <img src="/assets/img/llm-support/vscode.webp" alt="VSCode" class="no-border h-8 -mt-2 inline-block self-center"> VSCode

Setup VSCode to correctly generate Avo code based on your prompt.

## Quick use

In chat window type this and VSCode will use Avo's llms.txt file to generate code.

<CustomCode :content="`#fetch ${$frontmatter.llmLink}`" />

## Project-level permanent setup

You can setup Avo's llms.txt file to your repo so Copilot can use it by default. (Read more at VSCode docs)

1. Run this command to save the llms.txt file to `.vscode/avo.md`

<CustomCode :content="`curl -L ${$frontmatter.llmLink} --create-dirs -o .vscode/avo.md`" />

2. Add this to `.vscode/settings.json`

```json
.vscode/settings.json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "file": "./.vscode/avo.md"
    }
  ]
}
```

## MCP server

MCP is a an API to communicate with AI models. You can add MCP servers and Copilot will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

1. Go to MCP settings in VSCode: `vscode://settings/mcp`

2. Click Edit in settings.json`

3. Add this:

```json
// settings.json
{
  "mcp": {
    "servers": {
     "Context7": {
       "type": "stdio",
       "command": "npx",
       "args": ["-y", "@upstash/context7-mcp@latest"]
     }
    }
  }
}
```

5. Now in Agent Mode you can ask AI anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```

