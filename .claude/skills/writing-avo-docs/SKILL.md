---
name: writing-avo-docs
description: >-
  Write and edit Avo documentation pages following this repo's guide + reference
  (API) two-page model. Use whenever you're adding or editing a docs page under
  docs/ — documenting an Avo feature or config option, writing a how-to guide,
  building or updating an `-api.md` reference page, adding `<Option>` blocks,
  setting docs frontmatter (license, outline, api_docs, guide), cross-linking a
  guide to its API reference, or deciding whether a feature needs one page or
  two. Also use when the request mentions "document this feature", "write the
  docs for", "Avo docs", "the API page", "the reference page", "<Option>", or
  "config.<something>" in a documentation context. Reach for it even when the
  user just says "add docs for X" without naming the format — getting the
  structure, frontmatter, and cross-links right is the whole point.
---

# Writing Avo docs

This repo is the Avo documentation site (VitePress). Features are documented
with a **two-page model**: a task-oriented *guide* and an exhaustive *reference
(API)*. Your job is to produce pages that match that model exactly, so the docs
read consistently and a contributor can navigate the docs and the config side by
side.

The canonical, copy-paste spec lives in [`AGENTS.md`](../../../AGENTS.md) at the
repo root, and the reference implementation is the pair
[`docs/4.0/appearance.md`](../../../docs/4.0/appearance.md) (guide) and
[`docs/4.0/appearance-api.md`](../../../docs/4.0/appearance-api.md) (reference).
When a detail here is ambiguous, open those and match their shape — they are the
source of truth. This file is the operational summary so you can act without
re-reading everything each time.

## First decide: one page or two?

A feature's option surface determines the structure. Decide before you write:

- **Guide + reference (two pages)** when the feature has more than ~3 options,
  enums with multiple values, or validation rules worth stating precisely. The
  guide is `feature.md`; the reference is `feature-api.md`.
- **Guide only** when the feature has 0–3 simple options. Don't create an
  `-api.md` that would just restate the guide.
- **Never** create a reference page without a guide.

**One feature, one guide page, one API page.** Organize sub-topics with
`##`/`###` sections, not separate files — `appearance.md` covers logos,
palettes, persistence, and CSS overrides on a single page. The split that
matters is *guide vs. reference*, never *topic vs. topic*. A reader should be
able to paste the whole guide (or whole API page) into an LLM and get the full
picture of the feature in one shot; fanning it across files breaks that.

The one exception: a feature that's really an umbrella over distinct variants,
each with its own substantial option set (Views → table view, grid view, map
view). Then each variant gets its own page, the overview keeps only what's
common, and the overview's footer links to every sub-page in one line each. See
`AGENTS.md` for the footer pattern.

## Workflow

1. **Find the option surface.** Look at the actual config (`config.<feature>`)
   so you know every option, its type, default, allowed values, and what
   raises. Don't invent options — document what exists. If you're unsure of a
   default or a validation rule, find it in the source rather than guessing.
2. **Apply the decision rule** above to pick one page or two.
3. **Write the guide** (`feature.md`) — task-organized, plain English.
4. **Write the reference** (`feature-api.md`) if warranted — one `<Option>` per
   option.
5. **Wire them together** with frontmatter cross-links and option-to-anchor
   links.
6. **Run the checklist** at the bottom, then `yarn dev` and confirm the page
   renders and the guide ↔ reference callouts appear.

## The guide page (`feature.md`)

Write it the way you'd explain the feature to a colleague.

- **Open with** a one-paragraph description of what the feature is and does,
  then one realistic code block for the common case, then a sentence on what
  happens with no configuration (the defaults).
- **Organize around the reader's goal.** Phrase `##` headings as the thing they
  want to accomplish — `## Customize the logo`, `## Persist picks across
  devices` — not the machinery (`## Logos`, `## Persistence`). The config is
  incidental to the goal. Never structure the guide as a flat list of options.
- **Plain English, selective code.** Mention options conversationally ("provide
  `logo_dark` to render a different file in dark mode") without listing their
  type/default — that's the reference's job. Show code only for common cases;
  don't enumerate every permutation.
- **Use conditional imperatives** — "If you want cross-device persistence,
  switch to `:database`" — so a reader scans straight to their case.
- **Don't teach internals.** A guide gives directions to a goal; state what to
  do and link out for the rest.
- **Keep it skimmable.** Short sections; a reader solves their task without
  reading the whole page.
- Optionally close with a `## Full example` (every option at once) and/or an
  `## Options reference` summary table, as `appearance.md` does.

Frontmatter:

```yaml
---
license: pro          # community | pro
outline: [2, 3]       # h2 + h3 in the "On this page" panel; or `deep`
api_docs: ./feature-api.html   # link to the reference; omit if guide-only
---
```

## The reference page (`feature-api.md`)

This page is for *consulting*, not reading top to bottom.

- **Intro:** one sentence saying it's the per-option reference, a link back to
  the guide, and the canonical config snippet showing where options go.
- **Describe, don't instruct.** Neutral and factual — what each option is, its
  type, its behavior. No step-by-step recipes or "you should"; that's the
  guide. If you catch yourself writing how-to steps inside an `<Option>`, move
  them to the guide and link.
- **Mirror the feature's structure.** Group options under `##` headings (Theme
  selection, Custom palettes, Assets…) that follow how the feature is organized,
  ordered most- to least-commonly-touched.
- **One `<Option>` block per option**, using the template below.
- Use `:::warning` / `:::info` callouts for sharp edges (type coercion, values
  forwarded verbatim to a third party, etc.).

`<Option>` template:

````markdown
<Option name="`option_name`">

Short description of what this option does (1–3 sentences).

```ruby
config.feature = {
  option_name: value
}
```

- **Type:** String / Symbol / Array of Strings / Hash with keys … / Proc
- **Default:** `nil`
- **Values:** allowed values when not obvious from the type
- **Validation:** what raises and when

</Option>
````

Include whichever contract lines apply — Type and Default almost always; Values
for enums (often as a `| Value | Behavior |` table); Validation when something
raises; plus feature-specific flags like `**Lockable:** yes — …`. The `name`
prop is wrapped in backticks so it renders as code.

Frontmatter:

```yaml
---
license: pro
outline: [2, 3]
guide: ./feature.html   # link back to the guide
---
```

## Cross-linking the two pages

Two mechanisms, both required.

**1. Frontmatter callouts.** `PageHeader.vue` renders a callout from each key —
set both directions:

- Guide → `api_docs: ./feature-api.html` ("Looking for every option? See the
  full API reference →")
- Reference → `guide: ./feature.html` ("How-to guides and worked examples →")

The keys are exactly `api_docs` and `guide` (not `guide_docs`). The value is
used verbatim as the link `href`; a relative `./feature.html` is typical.

**2. Option → anchor links.** Whenever the guide names an option that has an
`<Option>` block in the reference, link the option name to that block. Each
`<Option name="`opt`">` produces the anchor `#opt` (the name with backticks and
`?{}!` stripped):

```markdown
Provide [`logo_dark`](./appearance-api.html#logo_dark) to render a different file in dark mode.
```

Link the first prominent mention of each option, not every repeat. An option
with no `<Option>` entry stays a plain code span.

## File path on top of snippets

When a snippet maps to a real file the reader edits, the first line is a comment
naming that file, in the language's own comment syntax, using the full path from
the app root:

| Language | First-line comment |
| --- | --- |
| Ruby | `# config/initializers/avo.rb` |
| CSS | `/* app/assets/stylesheets/application.css */` |
| JS | `// app/assets/javascript/application.js` |
| ERB | `<%# app/views/avo/partials/_head.html.erb %>` |

Apply it in **guides** for any snippet that goes into a real file. **Skip it in
the reference** — those `config.feature = { … }` blocks are illustrative
fragments of the initializer, and the intro already says everything lives in
`config/initializers/avo.rb`; repeating the path on every `<Option>` is noise.
Also skip it for shell commands, REPL sessions, and syntax-only fragments.

## House style

- Code samples must be real and copy-pasteable — no `...` placeholders inside
  runnable Ruby.
- Code spans for option names, values, symbols, and types: `:auto`,
  `logo_dark`, `ArgumentError`.
- Enum/lookup data goes in Markdown tables, not prose.
- Callouts use VitePress containers: `:::warning`, `:::info`, `:::tip`,
  `:::danger`.
- Components available (in `docs/.vitepress/theme/components/`):
  `<Option name="`x`">…</Option>`, `<Demo link="…" label="…" />`.

## Checklist before you finish

- [ ] Structure matches the decision rule (guide-only vs guide + reference).
- [ ] Guide is task-organized, plain English, skimmable; opens with description
      + common-case code + defaults note.
- [ ] Reference has one `<Option>` per real option with Type + Default (+ Values
      / Validation where relevant), grouped to mirror the feature.
- [ ] Frontmatter sets `license` and cross-links both pages (`api_docs` ↔
      `guide`).
- [ ] Guide links each mentioned option to its `#anchor` in the reference.
- [ ] No needless duplication between the two pages.
- [ ] Snippets that map to a real file carry the path as a top-line comment;
      reference snippets don't.
- [ ] Sharp edges and validation are called out with `:::warning` / `:::info`.
- [ ] `yarn dev` renders the page and shows the guide ↔ reference callouts.
