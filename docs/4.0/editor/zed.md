# <img src="/assets/img/editor/zed.webp" alt="Zed" class="no-border h-8 -mt-2 inline-block self-center"> Zed

Setup Zed to correctly generate Avo code based on your prompt.

## Quick use

In Thread chat type this before your prompt

```bash
@fetch https://avohq.io/llms-full.txt
```

Or in Text thread chat type this before your prompt

```bash
/fetch https://avohq.io/llms-full.txt
```

## MCP server

MCP is a an API to communicate with AI models. You can add MCP servers to your code editor and Cursor will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

1. Press⌘ CMD+⇧ Shift+P(or⌃ Ctrl+⇧ Shift+Pon Windows)

2. Type `agent: add context server`

3. Add this name and server:

```bash
# name
context7
```

```bash
# server
npx -y @upstash/context7-mcp@latest
```

Now in Agent Mode you can ask AI anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```
