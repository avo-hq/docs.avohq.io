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

The [avo-hq/skills](https://github.com/avo-hq/skills) repository contains the official skill collection. Install all of them with:

<CustomCode content="npx skills add avo-hq/skills" />

Or install just one, for example:

<CustomCode content="npx skills add avo-hq/avo-menu-icons" />

Skills are organized by **vertical** — a whole feature area, not a single task — so one skill covers creating, configuring, and troubleshooting that part of Avo.

### Core

- `avo-resources` — generate and configure resources — title, includes, sorting, pagination, cover/avatar, array (non-DB) resources
- `avo-fields` — add and configure fields in `def fields` — pick the `as:` type, options, formatting, layout
- `avo-associations` — wire `belongs_to` / `has_many` / `has_one` / HABTM fields, searchable pickers, polymorphism, STI
- `avo-actions` — build actions that run Ruby on selected, single, or no records — bulk ops, forms, modals, responses
- `avo-filters` — filter and segment the index — basic filters, dynamic filters, and scopes
- `avo-index-views` — control how the index renders — table styling, grid cards, map markers, view types
- `avo-menu-icons` — auto-populate menu items with semantically appropriate Tabler icons

### Config & ops

- `avo-setup` — install Avo, mount it, authenticate the private gem server, and set the license key
- `avo-update` — bump the Avo gems and apply every upgrade-guide step for the versions crossed, with a log
- `avo-authentication` — tell Avo who the current user is, gate access, and wire roles / profile / sign-out
- `avo-authorization` — restrict who sees and does what with Pundit policies — resources, actions, associations, files
- `avo-admin-config` — global initializer knobs — app name, per-page, container width, density, home path
- `avo-performance` — caching and stale-row fixes to make the admin fast
- `avo-testing` — unblock the license check in the test suite and use Avo's test helpers

### Customization

- `avo-branding-appearance` — make the admin look like the product — logo, favicon, color scheme, palettes, CSS re-skin, icons
- `avo-navigation-search` — menus, breadcrumbs, keyboard shortcuts, per-resource search, and the <kbd>Cmd</kbd> + <kbd>K</kbd> global search palette
- `avo-custom-ui` — build custom pages, embedded panels, dynamic/nested forms, eject views, JS/Stimulus, Tailwind
- `avo-custom-fields` — build a brand-new field type — generator plus its Edit/Show/Index view components
- `avo-i18n` — translate and localize the admin — labels, locale switching, RTL
- `avo-multitenancy` — scope the admin per tenant — route- or session-based, with an account switcher
- `avo-record-reordering` — persistent up/down and drag-and-drop record ordering
- `avo-custom-controls` — take over the show/edit/index/row button bars — relabel, remove, add links/actions/dropdowns
- `avo-controllers` — override per-resource CRUD controller hooks and safely extend Avo's `ApplicationController`
- `avo-engine-internals` — engine plumbing for custom Ruby — `main_app`/`avo` helpers, `Avo::Current`, `ExecutionContext`, reserved names

### Add-ons

Separately-licensed gems (paid add-on or Enterprise). `avo-media-library` is Community but off by default.

- `avo-dashboards-cards` — dashboards (grids of cards) and the six card types — metrics, charts, tables, lists
- `avo-notifications` — in-app notifications — bell dropdown, levels, action buttons, optional realtime
- `avo-rest-api` — JSON REST API over every resource, with token auth and a per-token permission matrix
- `avo-forms-and-pages` — model-agnostic forms (settings, imports, workflows) and sidebar page hierarchies
- `avo-kanban` — DB-backed drag-and-drop boards across resources
- `avo-audit-logging` — track who changed and viewed what — timeline, diffs, revert
- `avo-collaboration` — comments, reactions, and an automatic change-log on a record
- `avo-media-library` — central asset browser and a picker inside rich-text editors
- `avo-http-resource` — back a resource with an external HTTP API instead of Active Record

### Cross-cutting

- `avo-aware` — keep the admin in sync when you change a Rails model, even when the request never mentions Avo
- `avo-troubleshoot` — diagnose a broken or misbehaving Avo app, organized by symptom

Skills work with Claude Code, Cursor, Windsurf, Goose, and any other agent that supports a skills/rules system. See the [repo README](https://github.com/avo-hq/skills) for installation instructions for each tool.

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
