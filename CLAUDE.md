# CLAUDE.md

This repo holds the Avo documentation site (VitePress).

**When writing or editing docs, follow [`AGENTS.md`](./AGENTS.md).** It defines how we document a feature: the guide + reference (API) two-page model, the `<Option>` reference format, required frontmatter, and cross-linking rules.

Humans who want the short version: read [`writing-docs.md`](./docs/contributing/writing-docs.md) (published at `/contributing/writing-docs.html`).

Reference example to copy: [`docs/4.0/appearance.md`](./4.0/appearance.md) (guide) and [`docs/4.0/appearance-api.md`](./4.0/appearance-api.md) (reference).

**No blur in code blocks.** Don't use the `[!code focus]` marker — it blurs every unfocused line, which we don't want. Emphasize lines with highlights instead (`[!code highlight]`, or `[!code ++]` / `[!code --]` for diffs). If you think a specific block genuinely needs focus/blur, don't add it silently — point it out and ask.

**The Concepts sidebar section is a curated static list**, not a dynamic one. It lives in `.vitepress/config.js` (the `text: "Concepts"` block). Add a page by hand as `{ text, link }`, keeping the flat `/4.0/<page>.html` URL so nothing breaks — don't move pages into a `concepts/` folder and don't convert the section to the dynamic `getFiles()` pattern (that would change URLs and break inbound links, and it loses the custom titles/order). Only list pages that describe a system spanning the whole admin (breadcrumbs, tooltips, icons, resource controllers…); anything scoped to a single resource or field stays in its own docs.

Running the site locally and component details: [`readme.md`](./readme.md).
