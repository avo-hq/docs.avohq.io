# <img src="/assets/img/llms/windsurf.webp" alt="Windsurf" class="no-border h-8 -mt-2 inline-block"> Windsurf

Setup Windsurf to correctly generate Avo code based on your prompt.

## Quick use

In chat window type this and write your prompt.

```bash
@web https://docs.avohq.io/3.0/llms-full.txt
```

## MCP server

MCP is a an API to communicate with AI models. You can add MCP servers and Windsurf will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

1. Press <kbd>⌘ CMD</kbd>+<kbd>⇧ Shift</kbd>+<kbd>P</kbd> (or <kbd>⌃ Ctrl</kbd>+<kbd>⇧ Shift</kbd>+<kbd>P</kbd> on Windows)

2. Type `Windsurf: MCP Configuration Panel`

3. Click `Add custom server +`

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

Now you can ask AI anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```
