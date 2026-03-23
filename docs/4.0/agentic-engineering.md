# Agentic engineering

Avo is designed to work well with AI coding agents. This page covers the tools and setup that let you build Avo features faster by pairing with agents like Claude Code, Cursor, Windsurf, and others.

## LLM context

AI agents generate better code when they have up-to-date Avo documentation in their context. The [Code editors and LLM setup](/4.0/llm-support.html) page walks through how to wire up Avo's docs for each major editor and tool.

The short version: point your tool at `https://docs.avohq.io/4.0/llms-full.txt` — a compact, text version of the full Avo 4 docs — and the agent will have everything it needs to generate accurate resources, fields, actions, filters, and more.

## Skills

Skills are pre-built instruction sets that teach your agent how to perform specific Avo workflows. Instead of prompting from scratch each time, you install a skill and the agent follows a proven, repeatable process.

The [avo-hq/skills](https://github.com/avo-hq/skills) repository contains the official skill collection. Available skills include:

- **Add menu icons** — picks appropriate Tabler icons for every item in your `config.main_menu`
- **Build resources** — generates resources with the right fields, associations, and options
- **Write tests** — writes RSpec + Capybara specs that match Avo's test conventions
- **Create field types** — scaffolds complete custom field implementations

Skills work with Claude Code, Cursor, Windsurf, Goose, and any other agent that supports a skills/rules system. See the repo README for installation instructions for each tool.

## MCP server

For agents that support MCP, the [avo-mcp](/4.0/mcp.html) gem exposes your running Avo admin as a set of tools the agent can call directly — listing records, searching, running actions, and more. This is useful when you want the agent to inspect live data while building features.

## Suggested workflow

1. Set up your editor with the Avo LLM context — [see the guide](/4.0/llm-support.html).
2. Install the Avo skills from [github.com/avo-hq/skills](https://github.com/avo-hq/skills).
3. Describe what you want to build. The agent will follow the skill workflow and reference the docs automatically.
4. Optionally connect [avo-mcp](/4.0/mcp.html) so the agent can query your actual admin data.
