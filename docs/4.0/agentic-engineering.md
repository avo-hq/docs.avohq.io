---
prompt: Use this page (${link}) to set up my AI coding agent to work with Avo — add the LLM docs context, install the Avo skills loader, and connect the MCP server.
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

The skills ship **inside the `avo` gem**, so they describe the version your app has locked rather than whatever version a globally-installed copy happened to be written for.

Install the loader that finds them with **`rails g avo:skills`**:

<CustomCode content="rails g avo:skills" />

That starts a short interactive installer. It explains each choice as you go and shows you exactly what it will do before writing anything. It:

- installs into this app, or into your home directory so one copy serves every Avo project
- sets up any of `.agents/skills`, `.claude/skills`, and `.cursor/skills`
- writes one real file and symlinks the others to it, so they cannot drift apart
- offers to remove skills left behind by an older, unversioned install

It writes one small markdown file. The skills themselves are never copied into your repo — the loader resolves them from the installed gem when a task actually needs them.

Skills are organized by **vertical** — a whole feature area, not a single task — so one skill covers creating, configuring, and troubleshooting that part of Avo. Together they span resources, fields, actions, filters, authorization, custom UI, i18n, performance, testing, and every paid add-on.

Paid add-on skills arrive with their gems — install `avo-kanban` and its skill comes with it. The loader lists what your app actually has, and names the add-on for anything it does not, so an agent never describes a feature you cannot use.

### Keeping them current

They are always current. The skills come from the gem your app has locked, so there is nothing to copy and nothing that can fall behind.

Update your Avo gems with `bin/rails avo:update` and the skills come with them. Use that task rather than `bundle update avo`, which moves core alone and leaves each add-on's skills on the version they were already pinned to.

### One loader for every project

Choose **This machine** when the installer asks where the loader should go.

The loader carries no version knowledge — it finds the app by walking up from the working directory and reads that app's `Gemfile.lock` — so a single copy serves every Avo project on the machine, each resolving its own version. Install once and you are done.

The per-app install is still worth it for a team: the loader is one small file you commit, so everyone gets it on `git pull` rather than each person installing it themselves.

## MCP server

For agents that support MCP, the [Context7](https://context7.com/) [MCP server](https://github.com/upstash/context7-mcp) serves up-to-date docs for many libraries, including Avo. The agent queries it for the exact docs it needs while building features, instead of relying on stale training data.

For example, to add it to Claude Code, run:

<CustomCode content="claude mcp add context7 -- npx -y @upstash/context7-mcp" />

Each editor's [setup page](#pick-your-tool) covers how to add it to that tool. Then write `use context7` at the end of your prompt.

## Suggested workflow

1. Set up your editor with the Avo LLM context — [see above](#code-editors-and-llm-setup).
2. Install the Avo skills loader — run `rails g avo:skills` in your app.
3. Describe what you want to build. The agent will follow the skill workflow and reference the docs automatically.
4. Optionally connect the [Context7 MCP server](#mcp-server) so the agent can query Avo's docs directly.
