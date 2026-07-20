---
prompt: Use this page (${link}) to set up my AI coding agent to work with Avo — add the LLM docs context, install the Avo skills, and connect the MCP server.
---

# Agentic engineering

Avo is designed to work well with AI coding agents. This page covers the tools and setup that let you build Avo features faster by pairing with agents like Claude Code, Cursor, Windsurf, and others.

## Code editors and LLM setup

AI agents generate better code when they have up-to-date Avo documentation in their context. Point your tool at <code><a href="https://docs.avohq.io/4.0/docs-map.md" target="_blank">https://docs.avohq.io/4.0/docs-map.md</a></code> — a map of every Avo 4 docs page and its headings, with links — and the agent will fetch exactly the pages it needs to generate accurate resources, fields, actions, filters, and more.

<CustomCode content="https://docs.avohq.io/4.0/docs-map.md" />

### Pick your tool

<EditorList version="4.0" />

## Skills

Skills are pre-built instruction sets that teach your agent how to perform specific Avo workflows. Instead of prompting from scratch each time, you install a skill and the agent follows a proven, repeatable process.

The [avo-hq/skills](https://github.com/avo-hq/skills) repository contains the official skill collection. Available skills include:

- **Add menu icons** — picks appropriate Tabler icons for every item in your `config.main_menu`
- **Build resources** — generates resources with the right fields, associations, and options
- **Write tests** — writes RSpec + Capybara specs that match Avo's test conventions
- **Create field types** — scaffolds complete custom field implementations

Skills work with Claude Code, Cursor, Windsurf, Goose, and any other agent that supports a skills/rules system. See the repo README for installation instructions for each tool.

## MCP server

For agents that support MCP, the [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) serves up-to-date docs for many libraries, including Avo. The agent queries it for the exact docs it needs while building features, instead of relying on stale training data.

For example, to add it to Claude Code, run:

<CustomCode content="claude mcp add context7 -- npx -y @upstash/context7-mcp" />

Each editor's [setup page](#pick-your-tool) covers how to add it to that tool. Then write `use context7` at the end of your prompt.

## Suggested workflow

1. Set up your editor with the Avo LLM context — [see above](#code-editors-and-llm-setup).
2. Install the Avo skills from [github.com/avo-hq/skills](https://github.com/avo-hq/skills).
3. Describe what you want to build. The agent will follow the skill workflow and reference the docs automatically.
4. Optionally connect the [Context7 MCP server](#mcp-server) so the agent can query Avo's docs directly.
