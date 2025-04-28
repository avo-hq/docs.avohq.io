# <img src="/assets/img/editor/claude.webp" alt="Claude" class="no-border h-8 -mt-2 inline-block self-center"> Claude

Setup Claude to correctly generate Avo code based on your prompt.

## Quick use

Copy and paste the file in the prompt and write your prompt.

```bash
https://avohq.io/llms.txt
```

## MCP server

MCP is a an API to communicate with AI models. You can add MCP servers and Claude will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

1. Go to Settings > Developer

2. Click `Edit Config` button

3. Add this to the config file:

```json
// claude_desktop_config.json
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

Now you can ask AI anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```
