---
prev: false
next: false
---

# <img src="/assets/img/llm-support/cursor.webp" alt="Cursor" class="no-border h-8 -mt-2 inline-block self-center"> Cursor

Setup Cursor to correctly generate Avo code based on your prompt.

## Quick use

  In chat window type this and Cursor will use Avo's llms.txt file to generate code.

<CustomCode :content="`@web ${$frontmatter.llmLink}`" />

## Permanent setup

1. Press <kbd>⌘ CMD</kbd>+<kbd>⇧ Shift</kbd>+<kbd>P</kbd>. Or if it's Windows, press <kbd>⌃ Ctrl</kbd>+<kbd>⇧ Shift</kbd>+<kbd>P</kbd>.
2. Type `Add new custom docs`
3. Add this: `{{$frontmatter.llmLink}}`
4. Now in chat window you can type `@docs` and choose `Avo` to provide Avo's docs to Cursor.

## Project-level permanent setup

You can setup Avo's llms.txt file to your repo so Cursor can use it by default. (Read more at Cursor docs)

Run this command to save the llms.txt file to `.cursor/rules/avohq.mdc`

<CustomCode :content="`curl -L ${$frontmatter.llmLink} --create-dirs -o .cursor/rules/avo.mdc`" />

## MCP server

MCP is a an API to communicate with AI models. You can add MCP servers and Cursor will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

1. Go to Cursor settings <kbd>⌘ CMD</kbd>+<kbd>⇧ Shift</kbd>+<kbd>J</kbd> (or <kbd>⌃ Ctrl</kbd>+<kbd>⇧ Shift</kbd>+<kbd>J</kbd> on Windows)

2. Click MCP from the left sidebar

3. Click Add new global MCP server

4. Add this:

```json
// .cursor/mcp.json
{
  "mcpServers": {
   "Context7": {
     "type": "stdio",
     "command": "npx",
     "args": ["-y", "@upstash/context7-mcp@latest"]
   }
  }
}
```

5. Now in Agent Mode you can ask AI anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```
