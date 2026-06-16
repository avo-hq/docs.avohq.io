---
title: Writing Avo docs
outline: [2, 3]
---

# Writing Avo docs

How we document a feature. Read this before adding or editing a docs page.

> For the agent-facing version of these rules (templates, checklists, exact frontmatter), see [`AGENTS.md`](https://github.com/avo-hq/docs.avohq.io/blob/main/AGENTS.md) in the repo. This page is the short, human version.

## The two-page model

Most features that have real configuration get **two pages**:

- **The guide** — `feature.md`. Task-oriented, plain English. Explains what the feature does and walks through how to do the common things, with code. It does **not** try to be exhaustive about every option and every value.
- **The reference (API)** — `feature-api.md`. One entry per option, exhaustive: type, default, possible values, validation, gotchas. Organized by option, not by task.

The canonical example is [`appearance.md`](/4.0/appearance.html) (guide) and [`appearance-api.md`](/4.0/appearance-api.html) (reference). When in doubt, copy their shape.

Why split? The two pages answer two different questions. The guide answers _"how do I customize the logo?"_ — a reader skims, finds the section, copies the snippet, leaves. The reference answers _"what exactly can `logo_dark` be, and what's the default?"_ — a reader looks up one option and wants the full truth about it. Cramming both into one page makes the guide bloated and the reference hard to scan.

Not every feature needs both. A small feature with one or two options can be a single guide page. Split once the option surface is big enough that the reference would clutter the narrative.

### Prefer one page per feature

Keep the whole feature on **one guide page and one API page** — don't fan its sub-topics out into separate files. Appearance covers logos, neutrals, accents, persistence, CSS overrides, and more, but it's still a single `appearance.md` with `##` sections, not `appearance-logos.md` + `appearance-neutrals.md` + …

Two reasons:

- **It reads better.** Related configuration lives together; the reader scrolls instead of hunting across pages.
- **It's LLM-friendly.** A user can paste the entire guide (or the entire API page) into an LLM and it has the full picture of the feature in one shot. Splitting the same content across five pages breaks that.

So the split we care about is *guide vs. reference*, not *topic vs. topic*. Use `##`/`###` sections to organize a long page — reach for a second file only when a sub-topic is genuinely its own feature.

**When a feature does span multiple pages, link them from the parent.** Some features are an umbrella over several variants that each have their own options — Views is the classic example: a general page about what views are and what `index`/`show`/`edit` do, plus separate pages for the custom view types (table view, grid view, map view) because each carries its own options. That's a fair reason to split. When you do, add a section at the **bottom of the overview page** that links to each sub-page and says in one line what's there and why you'd go: *"For the table view's column and styling options, see [Table view](./table-view.html)."* Don't make the sub-pages reachable only through the sidebar — point at them explicitly, and have each sub-page link back.

## What goes in the guide

Write in plain English, the way you'd explain it to a colleague. Lead with what the feature is and a single realistic example, then organize by **task** (`## Customize the logo`, `## Set the default color scheme`, `## Persist picks across devices`), not by listing options one after another.

```ruby
config.appearance = {
  logo: "my_company/logo.png"
}
```

A few rules of thumb:

- Frame sections around what the reader wants to accomplish, not the machinery. `## Customize the logo` beats `## Logos`; the config is incidental to the goal.
- Show code for the common cases. Don't document every permutation — that's the reference's job.
- It's fine to mention options conversationally ("provide `logo_dark` to render a different file in dark mode") without spelling out their type and default.
- Reach for conditional imperatives — "If you want cross-device persistence, switch to `:database`" — so a reader can scan straight to their case.
- Don't teach the internals. A guide gives directions to a goal; it's not the place to explain how the feature works under the hood. State what to do and link out for the rest.
- Keep it skimmable. A reader should find the answer to their task without reading the whole page.
- You can repeat a small enum table (e.g. the `:auto | :light | :dark` values) in the guide where it helps the narrative — but the authoritative list lives in the reference.

Don't make the reader wade through 5,000 words before they learn how to do the thing.

## What goes in the reference (API)

One `<Option>` block per option, grouped under `##` section headings (Theme selection, Custom palettes, Assets, …). Each option states the precise contract:

````markdown
<Option name="`logo_dark`">

Path to the dark-mode variant of the main logo. When omitted, `logo` is used in both schemes.

```ruby
config.appearance = {
  logo_dark: "my_company/logo-dark.png"
}
```

- **Type:** String
- **Default:** `nil`

</Option>
````

Include whichever of these apply to the option: **Type**, **Default**, **Values** (or a table for enums), **Validation** (what raises and when), and any flags like "Lockable". Use `:::warning` / `:::info` callouts for sharp edges (e.g. "Symbols only — passing a String raises `ArgumentError`").

The reference is for *consulting*, not reading cover to cover, so keep the tone neutral and factual: describe what each option is and how it behaves, don't instruct. Step-by-step recipes and "you should" advice belong in the guide. Group the options so their sections mirror how the feature itself is structured — the reader should be able to navigate the docs and the config side by side.

## Wiring the two pages together

Cross-link them through two frontmatter keys — `PageHeader` turns each into a callout at the top of the page automatically.

- **`api_docs:`** goes on the **guide**. Its value is the URL of the reference page. Renders a *"Looking for every option? See the full API reference →"* callout.
- **`guide:`** goes on the **reference**. Its value is the URL of the guide page. Renders a *"How-to guides and worked examples → See the guides"* callout.

(The key is `guide`, not `guide_docs`.) The value is used verbatim as the link `href`, so a relative `./feature.html` is typical, but any URL works.

On the guide (`feature.md`):

```yaml
---
license: pro
outline: [2, 3]
api_docs: ./feature-api.html
---
```

On the reference (`feature-api.md`):

```yaml
---
license: pro
outline: [2, 3]
guide: ./feature.html
---
```

`license:` is `community` or `pro`. `outline: [2, 3]` shows `h2`/`h3` in the "On this page" panel (use `deep` to go further).

### Link options to their API entry

Whenever the guide mentions an option that has its own `<Option>` entry in the reference, link the option name to that entry. Each `<Option>` becomes an anchor named after the option, so the target is `./feature-api.html#option_name`:

```markdown
Provide [`logo_dark`](./appearance-api.html#logo_dark) to render a different file in dark mode.
```

So when you talk about the logo in the guide and there's a `logo` entry in the API, link it: `[`logo`](./appearance-api.html#logo)`. This lets a reader jump straight from the narrative to the full contract for that one option.

## Put the file path on top of snippets

When a code snippet maps to a real file, name that file in a comment on the first line — in the language's own comment syntax. It tells the reader exactly where the code goes.

```ruby
# Gemfile
gem "avo"
```

```css
/* app/assets/stylesheets/application.css */
.avo-custom { color: rebeccapurple; }
```

```js
// app/assets/javascript/application.js
import "avo"
```

```erb
<%# app/views/avo/partials/_head.html.erb %>
<style>...</style>
```

Where this applies:

- **Guides and tutorials** — yes, almost always. The reader is following along and needs to know which file to open.
- **The reference (API)** — usually not. Those `config.feature = { ... }` snippets are illustrative fragments of the initializer, not standalone files; the intro already says everything lives in `config/initializers/avo.rb`.

Skip it when there is no real file — a one-line shell command, a REPL session, or a fragment shown purely to illustrate syntax.

## Checklist

- [ ] Guide reads top-to-bottom in plain English, organized by task.
- [ ] Reference has one `<Option>` per option with type, default, and values.
- [ ] Frontmatter cross-links the pages (`api_docs` ↔ `guide`).
- [ ] Code samples are real and copy-pasteable.
- [ ] Snippets that map to a real file carry the path as a top-line comment.
- [ ] Sharp edges and validation rules are called out.

## Further reading

- [Diátaxis](https://diataxis.fr/) — the guide/reference distinction we lean on.
- [Rules for software tutorials](https://refactoringenglish.com/chapters/rules-for-software-tutorials/).
- [`readme.md`](https://github.com/avo-hq/docs.avohq.io/blob/main/readme.md) — running the docs site locally and component reference.
