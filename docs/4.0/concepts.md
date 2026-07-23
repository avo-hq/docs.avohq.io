---
outline: [2, 3]
---

# Concepts

Avo is built from a handful of small systems that show up on almost every screen — the breadcrumb trail, tooltips, icons, the controller behind each resource. This section explains **how those pieces work and fit together**, so when you customize one you know what you're reaching into.

These aren't step-by-step guides. Read a concept page when you're curious how something behaves or where to hook in — each one links out to the reference and how-to details when you're ready to change something.

## What's here

- **[Breadcrumbs](./breadcrumbs.html)** — how Avo builds the trail from your resource hierarchy, and where to change where it starts.
- **[Tooltips](./tooltips.html)** — the tippy.js primitive Avo wires up for you, and how to add your own with two attributes.
- **[Icons](./icons.html)** — the icon libraries Avo ships with and how the `svg` helper resolves them.
- **[Resource controllers](./controllers.html)** — the controller Avo generates per resource, and the hooks you can override.
- **[How pages are rendered](./how-pages-are-rendered.html)** — the path from request to rendered screen, and how Avo picks the view component for each page.
- **[Rails engines and path helpers](./rails-engines-paths.html)** — why path helpers behave differently inside the Avo engine, and the `avo.` / `main_app.` prefixes.

## What belongs here

A page lands in Concepts when it describes a system that spans the whole admin, rather than a single resource or field. If a topic only affects one resource, it lives in that resource's own docs; the deeper plumbing you rarely touch lives under [Internals](./internals.html).
