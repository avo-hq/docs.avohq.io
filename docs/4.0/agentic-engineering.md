---
pageClass: skills-catalog
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

<VersionReq version="4.1.1" />

Skills are pre-built instruction sets that teach your agent how to perform specific Avo workflows. Instead of prompting from scratch each time, you install a skill and the agent follows a proven, repeatable process.

The skills ship **inside the `avo` gem**, so they describe the version your app has locked rather than whatever version a globally-installed copy happened to be written for.

Install the loader that finds them with **`rails g avo:skills`**:

<CustomCode content="rails g avo:skills" />

That starts a short interactive installer — one question per screen, all answered up front, with a summary of exactly what it will do before it writes anything (Avo 4.1.3 and later). It:

- installs into this app, or into your home directory so one copy serves every Avo project
- sets up any of `.agents/skills`, `.claude/skills`, and `.cursor/skills`
- writes one real file and symlinks the others to it, so they cannot drift apart
- offers to remove skills left behind by an older, unversioned install

It writes one small markdown file. The skills themselves are never copied into your repo — the loader resolves them from the installed gem when a task actually needs them.

Skills are organized by **vertical** — a whole feature area, not a single task — so one skill covers creating, configuring, and troubleshooting that part of Avo.

### Keeping them current

They are always current. The skills come from the gem your app has locked, so there is nothing to copy and nothing that can fall behind.

Update your Avo gems with `bin/rails avo:update` and the skills come with them. Use that task rather than `bundle update avo`, which moves core alone and leaves each add-on's skills on the version they were already pinned to.

### Core

| Skill                     | What it covers                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `avo-resources`           | generate and configure resources — title, includes, sorting, pagination, cover/avatar, array (non-DB) resources |
| `avo-fields`              | add and configure fields in `def fields` — pick the `as:` type, options, formatting, layout                     |
| `avo-associations`        | wire `belongs_to` / `has_many` / `has_one` / HABTM fields, polymorphism, STI, nested create-in-form             |
| `avo-actions`             | build actions that run Ruby on selected, single, or no records — bulk ops, forms, modals, responses             |
| `avo-filters`             | basic filters on the index — dynamic filters and scopes ship as their own add-on skills                         |
| `avo-index-views`         | control how the index renders — table styling, grid cards, map markers, view types                              |
| `avo-custom-fields`       | build a brand-new field type — generator plus its Edit/Show/Index view components                               |
| `avo-menu-icons`          | pick semantically appropriate Tabler icons and set them on resources and dashboards                             |

### Config & ops

| Skill                     | What it covers                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `avo-setup`               | install Avo, mount it, authenticate the private gem server, and set the license key            |
| `avo-update`              | bump the Avo gems and apply every upgrade-guide step for the versions crossed, with a log      |
| `avo-authentication`      | tell Avo who the current user is, gate access, and wire roles / profile / sign-out             |
| `avo-admin-config`        | global initializer knobs — app name, per-page, container width, density, home path             |
| `avo-performance`         | caching and stale-row fixes to make the admin fast                                             |
| `avo-testing`             | unblock the license check in the test suite and use Avo's test helpers                         |
| `avo-multitenancy`        | scope the admin per tenant — route- or session-based, with an account switcher                 |

### Customization

| Skill                     | What it covers                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `avo-branding-appearance` | make the admin look like the product — logo, favicon, color scheme, palettes, CSS re-skin, icons                         |
| `avo-navigation-search`   | per-resource search, breadcrumbs, keyboard shortcuts, and the auto-generated sidebar                                     |
| `avo-custom-ui`           | build custom pages, embedded panels, dynamic/nested forms, eject views, JS/Stimulus, Tailwind                            |
| `avo-i18n`                | translate and localize the admin — labels, locale switching, RTL                                                         |
| `avo-media-library`       | turn on the central asset browser and the picker inside rich-text editors                                                |
| `avo-controllers`         | override per-resource CRUD controller hooks and safely extend Avo's `ApplicationController`                              |
| `avo-engine-internals`    | engine plumbing for custom Ruby — `main_app`/`avo` helpers, `Avo::Current`, `ExecutionContext`, reserved names           |

### Add-ons

Separately-licensed gems (paid add-on or Enterprise). These skills ship inside their own gem, not inside `avo`.

| Skill                     | What it covers                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `avo-dashboards-cards`    | dashboards (grids of cards) and the six card types — metrics, charts, tables, lists                |
| `avo-notifications`       | in-app notifications — bell dropdown, levels, action buttons, optional realtime                    |
| `avo-rest-api`            | JSON REST API over every resource, with token auth and a per-token permission matrix               |
| `avo-forms-and-pages`     | model-agnostic forms (settings, imports, workflows) and sidebar page hierarchies                   |
| `avo-kanban`              | DB-backed drag-and-drop boards across resources                                                    |
| `avo-audit-logging`       | track who changed and viewed what — timeline, diffs, revert                                        |
| `avo-collaboration`       | comments, reactions, and an automatic change-log on a record                                       |
| `avo-authorization`       | restrict who sees and does what with Pundit policies — resources, actions, associations, files     |
| `avo-http-resource`       | back a resource with an external HTTP API instead of Active Record                                 |
| `avo-menu`                | build the sidebar with the menu editor DSL — sections, dividers, links, icons, per-user visibility |
| `avo-scopes`              | one-click segment tabs above the index, with counts and a default view                             |
| `avo-dynamic-filters`     | let end users build their own ad-hoc filters from a filters bar                                    |
| `avo-advanced-search`     | the <kbd>Cmd</kbd> + <kbd>K</kbd> global search palette, and type-to-search association pickers    |
| `avo-record-reordering`   | persistent up/down and drag-and-drop record ordering                                               |
| `avo-custom-controls`     | take over the show/edit/index/row button bars — relabel, remove, add links/actions/dropdowns       |

### Cross-cutting

| Skill                     | What it covers                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `avo-aware`               | keep the admin in sync when you change a Rails model, even when the request never mentions Avo |
| `avo-troubleshoot`        | diagnose a broken or misbehaving Avo app, organized by symptom                                 |

Paid add-on skills arrive with their gems — install `avo-kanban` and its skill comes with it. The loader lists what your app actually has, and names the add-on for anything it does not, so an agent never describes a feature you cannot use.

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
