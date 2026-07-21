# AGENTS.md — writing Avo docs

Operational rules for writing and editing documentation in this repo. Humans: the prose version is [`writing-docs.md`](./docs/contributing/writing-docs.md) (published at `/contributing/writing-docs.html`). This file is the precise, copy-paste version — follow it exactly.

The reference implementation for everything below is the pair
[`docs/4.0/appearance.md`](./4.0/appearance.md) (guide) and
[`docs/4.0/appearance-api.md`](./4.0/appearance-api.md) (reference).
When unsure, open them and match their structure.

## The model: guide + reference

A feature with a real configuration surface gets **two pages**:

| Page                | File             | Answers                     | Organized by | Style                           |
| ------------------- | ---------------- | --------------------------- | ------------ | ------------------------------- |
| **Guide**           | `feature.md`     | "How do I do X?"            | task         | plain English, selective code   |
| **Reference (API)** | `feature-api.md` | "What exactly is option Y?" | option       | exhaustive, one `<Option>` each |

Decision rule:

- **Both pages** when the feature has more than ~3 options, enums with multiple values, or validation rules worth stating precisely.
- **Guide only** (no `-api.md`) when the feature has 0–3 simple options. Don't create a reference page that would just restate the guide.
- Never create a reference page without a guide.

Do not duplicate content between the two beyond a small shared enum table where it genuinely helps the narrative. The guide links to the reference for the full truth.

**One page per feature.** Keep the whole feature on a single guide page and a single API page — organize sub-topics with `##`/`###` sections, not separate files. `appearance.md` covers logos, neutrals, accents, persistence, and CSS overrides on one page; it is not split into `appearance-logos.md`, `appearance-neutrals.md`, etc. The split that matters is _guide vs. reference_, never _topic vs. topic_. Reasons: related config reads better together, and a user can paste the entire page into an LLM and get the full picture of the feature in one shot — fanning it across files breaks that. Create a second file only when a sub-topic is genuinely a feature of its own.

**Exception — a feature with distinct variants that each carry their own options.** Some features are really an umbrella over several sub-features, each with a substantial, independent option set. Views are the canonical case: there's a general page covering what views are and what `index`/`show`/`edit` do in common, plus separate pages for each custom view type — table view, grid view, map view — because each has its own options. Give each variant its own page when it would otherwise bloat the overview or when its options stand on their own. When you do:

- The overview page describes the shared concept and keeps only what's common.
- At the **bottom of the overview page**, add a section that links to every sub-page and says, in one line each, what's there and when to go — e.g. _"For the table view's columns, ordering, and styling options, see [Table view](./table-view.html)."_ Don't leave the sub-pages discoverable only through the sidebar.
- Each sub-page links back to the overview (and follows the same guide/reference rules itself).

Footer pattern for the overview page:

```markdown
## View types

Each custom view type has its own options, documented on its own page:

- [Table view](./table-view.html) — column selection, ordering, and row styling for the default index layout.
- [Grid view](./grid-view.html) — card-based layout for image-heavy resources.
- [Map view](./map-view.html) — plot records geographically.
```

## Guide page (`feature.md`)

Rules:

1. **Open with**: a one-paragraph description of what the feature is and does, then a single realistic code block showing the common case, then a note about defaults (what happens if the user configures nothing).
2. **Organize around the user's goal**, using `##` headings, and `###` for sub-tasks. Phrase headings as the thing the reader wants to accomplish, not the machinery — `## Customize the logo`, `## Persist picks across devices`, not just `## Logos` / `## Persistence`. The config is incidental to the goal. Never structure the guide as a flat list of options.
3. **Write in plain English.** Mention options conversationally ("provide `logo_dark` to render a different file in dark mode") without listing their type/default — that belongs in the reference. Use conditional imperatives — "If you want cross-device persistence, switch to `:database`" — so a reader can scan for their case.
4. **Show code only for common cases.** Do not enumerate every permutation.
5. **Don't teach the internals.** A guide gives directions to a goal; it is not the place to explain how the feature works under the hood or to digress into background. State what to do, link out for the rest.
6. **Keep it skimmable.** A reader should solve their task without reading the whole page. Prefer short sections.
7. Optionally end with a `## Full example` block (every option set at once) and/or an `## Options reference` summary table. See `appearance.md` for both.

Frontmatter:

```yaml
---
license: add_on # community | addon_on
add_on_link: https://avohq.io/pricing-4?add_ons[]=http-resource
outline: [2, 3] # h2 + h3 in the "On this page" panel; or `deep`
api_docs: ./feature-api.html # link to the reference; omit if guide-only
---
```

If the `license` is `add_on`, add the `add_on_link` key with the link to the add-on page. Ensure the addon is split by `-` not `_`. Ask the user to check the link.

## Reference page (`feature-api.md`)

Rules:

1. **Intro**: one sentence stating this is the per-option reference, a link back to the guide, and the canonical config snippet showing where options go.
2. **Describe, don't instruct.** Reference is for _consulting_, not reading top-to-bottom. Keep the tone neutral and factual — state what each option is, its type, and its behavior. No step-by-step recipes, opinions, or "you should" — that's the guide's job. If you catch yourself writing how-to steps in an `<Option>`, move them to the guide and link.
3. **Mirror the feature's structure.** Group options under `##` section headings (Theme selection, Custom palettes, Picker control, Assets, Charts…) that follow how the feature itself is organized, so a reader can navigate the docs and the config in parallel. Within that, order sections from most- to least-commonly-touched.
4. **One `<Option>` block per option.** Inside each:
  - A short description (1–3 sentences).
  - A minimal `ruby` code block showing just that option.
  - For enums, a `| Value | Behavior |` table.
  - A bullet list of the contract — include whichever apply:
    - `**Type:**` — e.g. `String`, `Symbol`, `Array of Strings`, `Hash with keys ...`, `Proc / Lambda`.
    - `**Default:**` — the actual default in a code span, or `nil`.
    - `**Values:**` — allowed values when not obvious from the type.
    - `**Validation:**` — what raises and when (e.g. "raises `ArgumentError` if any shade is missing").
    - Any feature-specific flag (e.g. `**Lockable:** yes — ...`, `**Context:** evaluated in a controller context`, `**Locals:** ...`).
5. Use `:::warning` / `:::info` callouts for sharp edges (type coercion, things forwarded verbatim to a third party, etc.).

`<Option>` template:

````markdown
<Option name="`option_name`">

Short description of what this option does.

```ruby
config.feature = {
  option_name: value
}
```

- **Type:** ...
- **Default:** `...`
- **Values:** ...

</Option>
````

The `name` prop is wrapped in backticks to render as code (`<Option name="`option_name`">`). Without backticks it renders as plain text — use that for non-code option names only.

Frontmatter:

```yaml
---
license: pro
outline: [2, 3]
guide: ./feature.html # link back to the guide
---
```

## Cross-linking

The two pages link to each other through two frontmatter keys; `PageHeader.vue` renders a callout for each. Always set both directions:

- Guide → `api_docs: ./feature-api.html` — URL of the reference page. Renders the "Looking for every option? See the full API reference →" callout.
- Reference → `guide: ./feature.html` — URL of the guide page. Renders the "How-to guides and worked examples → See the guides" callout.

The keys are exactly `api_docs` and `guide` (not `guide_docs`). The value is passed straight to the link `href` — use a relative `./feature.html`/`./feature-api.html`, though any URL works.

**Link every mentioned option to its API entry.** Whenever the guide names an option that has an `<Option>` block in the reference, link the option name to that block. Each `<Option name="`opt`">` produces an anchor `#opt` (the name with backticks and `?{}!` stripped), so the target is `./feature-api.html#opt`:

```markdown
Provide [`logo_dark`](./appearance-api.html#logo_dark) to render a different file in dark mode.
```

Do this for the first, prominent mention of each option in the guide (don't link every repeat occurrence). If an option has no `<Option>` entry, leave it as a plain code span.

## File path on top of snippets

When a snippet maps to a real file, the first line is a comment naming that file, in the language's own comment syntax. Use the full path from the app root.

| Language | Comment  | Example first line                             |
| -------- | -------- | ---------------------------------------------- |
| Ruby     | `#`      | `# Gemfile` · `# config/initializers/avo.rb`   |
| CSS      | `/* */`  | `/* app/assets/stylesheets/application.css */` |
| JS       | `//`     | `// app/assets/javascript/application.js`      |
| ERB      | `<%# %>` | `<%# app/views/avo/partials/_head.html.erb %>` |

Apply it:

- **Guides and tutorials** — yes, for any snippet that goes into a real file the reader edits.
- **Reference (API)** — usually skip. The `config.feature = { ... }` blocks are fragments of the initializer, and the page intro already states they live in `config/initializers/avo.rb`. Adding `# config/initializers/avo.rb` to every `<Option>` snippet is noise.
- **Skip** when there is no real file: shell commands, REPL sessions, or syntax-only fragments.

## House style

- Code samples must be real and copy-pasteable — no `...` placeholders inside runnable Ruby unless clearly a comment.
- Refer to config as `config.<thing>` and to files by path (`config/initializers/avo.rb`).
- Use code spans for option names, values, symbols, and types: `:auto`, `logo_dark`, `ArgumentError`.
- Use VitePress containers for callouts: `:::warning`, `:::info`, `:::tip`, `:::danger`.
- Enum/lookup data goes in Markdown tables, not prose.
- One feature, one guide page. Split large guides by task with `##` headings rather than creating many files.

## Available components

(Defined in `docs/.vitepress/theme/components/`.)

- `<Option name="`x`">…</Option>` — reference option block.
- `<Demo link="https://avodemo.com" label="See the demo" />` — `label` optional.
- `:::warning` / `:::info` / `:::tip` / `:::danger` — callouts.

## Before you finish

- [ ] Guide is task-organized, plain English, skimmable.
- [ ] Reference has one `<Option>` per option with Type + Default (+ Values/Validation where relevant).
- [ ] Frontmatter cross-links both pages (`api_docs` ↔ `guide`) and sets `license`.
- [ ] No needless duplication between guide and reference.
- [ ] Code samples are real. Snippets that map to a real file carry the path as a top-line comment. Sharp edges are called out.
- [ ] Run `yarn dev` and confirm the page renders and the guide↔reference callouts appear.
