---
license: community
outline: [2, 3]
---

# Theming

Theming is how you make Avo look like your product — its colors, surfaces, logos, and chrome.

**The fastest way to theme Avo is to let an AI agent do it for you.** Everything Avo exposes for theming is plain, well-structured text — Ruby config, CSS variables, ERB — which is exactly what an LLM handles well. Point your coding agent at this guide, describe the look you want, and it can produce a complete, coherent theme far faster than hand-tuning values one at a time. Skip to the [ready-made prompts →](#let-an-ai-agent-do-it)

:::tip Hand your agent these pages
Theming and customizing draws on a handful of Avo surfaces. Give your agent any of these (or read them yourself) — together they're the full toolbox:

- [Custom CSS & styling](./tailwindcss-integration.html) — the [TailwindCSS integration](./tailwindcss-integration.html) and the [`avo-overrides.css` / `avo-overrides.js`](./tailwindcss-integration.html#override-styles-and-scripts-avo-overrides-css-avo-overrides-js) no-build escape hatch
- [JavaScript & Stimulus](./javascript.html) — add behavior to any screen
- [Asset handling](./asset-handling.html) — load your own CSS/JS through the app pipeline
- [Ejecting views](./eject-views.html) — copy Avo's markup into your app and rewrite it
- [Custom tools](./custom-tools.html) & [Resource tools](./resource-tools.html) — build entirely new UI you style yourself
- [`Avo::ApplicationController`](./avo-application-controller.html) — hook into Avo's controller layer
- [Plugins](./plugins.html) — package styles, scripts, and behavior as a reusable extension
- [Internals](./internals.html) — the lower-level building blocks Avo exposes
:::

## Do it by hand

Everything the agent does, you can do yourself. Avo gives you a ladder of approaches, from a few lines of Ruby to full CSS control — pick the one that matches how far you want to go.

| You want to…                                          | Reach for                                                            | Build step |
| ----------------------------------------------------- | ------------------------------------------------------------------- | ---------- |
| Swap logos, pick a color scheme and accent/neutral    | [Appearance config](#recolor-with-the-appearance-config)            | none       |
| Re-skin the whole UI by overriding colors and radii   | [CSS variables](#re-skin-with-css-variables)                        | none       |
| Restyle specific components (navbar, sidebar, tables) | [Component CSS variables](#fine-tune-specific-components)           | none       |
| Style your own custom tools, fields, or pages         | [Tailwind & custom CSS](#style-your-custom-ui)                       | Tailwind   |
| Rewrite a view's markup outright                      | [Eject a view for full control](#eject-a-view-for-full-control)      | none       |

Most apps only ever touch the first two rows. Start there and go deeper only when you hit something the higher layer can't express — the further down you go, the more you own.

## Recolor with the appearance config

The fastest way to brand Avo is [`config.appearance`](./appearance.html) — set your logos, default color scheme, and pick a neutral and accent palette (built-in presets or your own brand colors), all from Ruby with no build step.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.appearance = {
    logo: "my_company/logo.png",
    neutral: :slate,
    accent: :blue
  }
end
```

This covers the palette that drives most of the interface. For everything it deliberately leaves out — navbar background, sidebar surfaces, table row affordances, focus rings, motion — drop to CSS variables below. See the [Appearance guide](./appearance.html) for the full palette, logo, persistence, and locking options.

## Re-skin with CSS variables

Avo's entire look is driven by CSS custom properties, so overriding a handful of variables re-skins the whole interface — no `@apply`, no build step. The quickest surface for this is `avo-overrides.css`: an empty file Avo ships and loads on every screen, **after** its own stylesheet, so your rules win the cascade.

Eject it into your app, then override whatever you like:

```bash
rails g avo:eject --partial :avo_overrides_css
```

```css
/* app/assets/stylesheets/avo-overrides.css */
:root {
  --color-accent: var(--color-fuchsia-500);
  --color-accent-content: var(--color-fuchsia-600);
  --radius-card: 1.5rem;
}

.dark {
  --color-accent: var(--color-fuchsia-400);
}
```

Set light-mode values on `:root` and dark-mode-specific values on `.dark` when you need them to differ.

### Let an AI agent do it

Because it's plain, well-named CSS variables in a single file, this is the surface where an LLM shines — hand it this guide and a vibe, and it can write a complete, coherent theme in one shot. Copy a prompt below (pick a theme in the tabs) and paste it into your coding agent:

::: code-group

```text [Coastal]
Use the Avo theming guide at https://docs.avohq.io/4.0/theming.html and
reskin my Avo app to a coastal theme — soft sand neutrals, sea-glass and
deep-ocean accents. Override CSS variables in
app/assets/stylesheets/avo-overrides.css only, with matching :root and
.dark values.
```

```text [Rose]
Use the Avo theming guide at https://docs.avohq.io/4.0/theming.html and
reskin my Avo app to a rose theme — warm blush neutrals and a rich rose
accent. Override CSS variables in app/assets/stylesheets/avo-overrides.css
only, with matching :root and .dark values.
```

```text [80's Sunset]
Use the Avo theming guide at https://docs.avohq.io/4.0/theming.html and
reskin my Avo app to an 80's sunset theme — dusk purples and hot magenta-to-
orange accents. Override CSS variables in
app/assets/stylesheets/avo-overrides.css only, with matching :root and
.dark values.
```

:::

:::tip
`avo-overrides.css` is served as-is — it is **not** run through the Tailwind build. For custom utility classes (`@apply`, arbitrary values) in your own UI, use the [TailwindCSS integration](./tailwindcss-integration.html) instead.
:::

## Fine-tune specific components

Individual components expose their own variables — the top navbar palette, sidebar background, table row hover/selected states, focus ring, and more. Override them in `avo-overrides.css` (above) or, if you'd rather keep theming next to the rest of your `<head>`, [eject the `:head` partial](./eject-views.html#prepared-templates):

```bash
bin/rails generate avo:eject --partial :head
```

```erb
<%# app/views/avo/partials/_head.html.erb - append in the file %>
<style>
  .top-navbar {
    --top-navbar-background: #1e3a5f;
    --top-navbar-content: #dbeafe;
  }

  .avo-sidebar {
    --sidebar-background: #f5f7fa;
    --sidebar-border: #d6dbe2;
  }
</style>
```

Avo renders the `:head` partial after its bundled stylesheets, so these take precedence too. The full list of component variables, with defaults and descriptions, lives in the [CSS variables reference](./appearance-api.html#css-variables).

### Set a background image

The main content panel takes a solid color from [`--color-main-content-background`](./appearance-api.html#css-variables). For an **image or gradient** instead, there's no config option — set `background-image` on `.main-content` in `avo-overrides.css`. It layers over that color, so keep an opaque image or leave the color as the fallback for any area the image doesn't cover:

```css
/* app/assets/stylesheets/avo-overrides.css */
.main-content {
  background-image: url("/my-background.png"); /* a file in public/, or a full URL */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Or a gradient — no asset needed: */
/* .main-content { background-image: linear-gradient(135deg, #dbeafe, #fce7f3); } */
```

Scope a different image per scheme with `.dark .main-content { background-image: … }`.

## Style your custom UI

Theming variables cover Avo's own screens. When you build [custom tools](./custom-tools.html), [custom fields](./custom-fields.html), or [resource tools](./resource-tools.html), you're writing your own markup — style it with Tailwind utility classes or your own CSS:

- **Tailwind classes in custom UI** — the [TailwindCSS integration](./tailwindcss-integration.html) compiles utility classes used in your extension points, so classes that aren't in Avo's precompiled bundle still work.
- **Your own stylesheets and scripts** — [Asset handling](./asset-handling.html) covers loading custom CSS/JS through your app's pipeline; the [JavaScript guide](./javascript.html) covers adding behavior with Stimulus.

## Eject a view for full control

When even CSS can't express what you need — you want to change the markup itself, not just its styling — [eject the view or partial](./eject-views.html) into your app and rewrite it. This is the deepest level of control Avo offers.

```bash
bin/rails generate avo:eject --component Avo::Views::ResourceIndexComponent
```

:::warning You own ejected views from here on
An ejected file is a **frozen copy** of Avo's markup at the moment you generated it. Avo no longer controls it, so improvements and fixes shipped in later versions **won't reach your copy** — you're accountable for reviewing Avo's changes on each upgrade and porting anything you want into your ejected file. Prefer the [CSS-variable](#re-skin-with-css-variables) and [Tailwind](#style-your-custom-ui) layers above whenever they can do the job; reach for ejecting only when they genuinely can't.
:::
