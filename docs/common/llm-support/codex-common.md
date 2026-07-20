---
prev:
  text: Agentic engineering
  link: /4.0/agentic-engineering
next: false
---

# <img src="/assets/img/llm-support/codex.webp" alt="Codex" class="no-border h-8 -mt-2 inline-block self-center"> Codex

Setup OpenAI Codex to correctly generate Avo code based on your prompt.

## Quick use

Paste the docs link in your prompt and ask Codex to read it before generating code. Codex's web search returns snippets rather than full pages, so for reliable results run it with `--search` — or better, use the permanent setup below.

<CustomCode :content="`Read ${$frontmatter.llmLink} and use it as a reference for Avo code.`" />

## Permanent setup

Codex reads the `AGENTS.md` file from your repository. Add a line pointing to Avo's docs:

<CustomCode :content="`When working with Avo, use the docs at ${$frontmatter.llmLink} as a reference.`" />

Or save the docs in your repo and reference the file from `AGENTS.md`:

<CustomCode :content="`curl -L ${$frontmatter.llmLink} --create-dirs -o docs/avo-docs-map.md`" />

## MCP server

MCP is an API to communicate with AI models. You can add MCP servers and Codex will communicate with them to get more accurate results.

I suggest using [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) which provides many libraries including Avo's docs.

Run this command to add it:

<CustomCode content="codex mcp add context7 -- npx -y @upstash/context7-mcp" />

Or add it manually to `~/.codex/config.toml`:

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
```

Now you can ask Codex anything about Avo, and write `use context7` at the end of your prompt.

For example:

```bash
create a new Avo resource for a product model. use context7
```
