---
license: community
outline: [2, 3]
---

# Partials

Avo's layout leaves a handful of hooks in fixed places — inside `<head>`, before `</body>`, under the sidebar menu, in the profile menu, the navbar, and the footer. Each one is a partial you eject into your app, and whatever you put in it renders on every Avo screen. They are the surgical tool: you own a few lines of ERB while Avo keeps owning the layout around them.

```bash
bin/rails generate avo:eject --partial :scripts
```

```erb
<%# app/views/avo/partials/_scripts.html.erb %>
<% if Rails.env.production? %>
  <script defer data-domain="admin.example.com" src="https://plausible.io/js/script.js"></script>
<% end %>
```

Until you eject one, the five additive partials (`:pre_head`, `:head`, `:scripts`, `:sidebar_extra`, `:profile_menu_extra`) render nothing, and `:logo`, `:header`, and `:footer` render Avo's defaults.

## Pick the smallest surface

A partial is the right tool when you need **markup** in a fixed spot. When Ruby config or a CSS variable can express the change, that is the better tool — nothing to eject, nothing to keep in sync. Check those first, and reach for a partial long before you reach for the layout.

| You want to…                                                     | Reach for                                                                                     |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Change colors, radii, or the font                                | [`avo-overrides.css`](./theming.html#re-skin-with-css-variables) — no partial needed          |
| Swap the logo or favicon                                         | [`config.appearance`](./appearance.html#customize-the-logo)                                   |
| Add links to the sidebar, header, or profile menu                | The [menu editor](./menu-editor.html)                                                         |
| Add a meta tag, a font, analytics, a support widget              | A partial — this page                                                                         |
| Show a notice, a form, or a widget in the sidebar or profile menu | A partial — this page                                                                        |
| Rewrite the navbar or the page shell itself                      | [Eject the layout](./eject-views.html#eject-a-partial) — the last resort                      |

:::warning Prefer the empty partials
`:logo`, `:header`, and `:footer` are copies of Avo's markup, frozen at the version you ejected them from — later fixes to that markup won't reach your copy. The other five ship empty, so there is nothing in them to drift. Ejecting `app/views/layouts/avo/application.html.erb` freezes the entire page shell the same way; every hook on this page exists so you don't have to.
:::

## Where each partial renders

```bash
bin/rails generate avo:eject --partial :head
```

| Partial               | Renders                                                       | Ships as        | Good for                                                        |
| --------------------- | ------------------------------------------------------------- | --------------- | --------------------------------------------------------------- |
| `:pre_head`           | Inside `<head>`, **before** Avo's stylesheets and scripts     | empty           | Your own compiled CSS/JS, so Avo's defaults load after them     |
| `:head`               | Inside `<head>`, **after** Avo's assets and `avo-overrides.*` | empty           | Meta tags, `<link>` tags, styles that must win the cascade      |
| `:scripts`            | Before `</body>`                                              | empty           | Analytics, support widgets, any third-party embed               |
| `:sidebar_extra`      | Under the last sidebar section, above the profile             | empty           | Notices, forms, and widgets that aren't menu items              |
| `:profile_menu_extra` | In the profile dropdown, above **Sign out**                   | empty           | Forms and conditional items the menu editor can't express       |
| `:logo`               | The navbar logo slot                                          | Avo's logo link | A logo that has to be markup rather than an image               |
| `:header`             | The navbar's end slot                                         | The header menu | Markup next to the header links                                 |
| `:footer`             | Bottom of the main content panel                              | Avo's credit    | Version, environment, or account details                        |

Inside `<head>`, the order is `_pre_head` → Avo's CSS and JS → `avo-overrides.css` / `avo-overrides.js` → `_head` → the brand palette from `config.appearance`. Later wins the cascade; the [asset handling guide](./asset-handling.html#load-order-and-overriding-avo-s-styles) walks through it.

## Add analytics or a support widget

`:scripts` renders right before `</body>`, which is where most vendors ask for their snippet. Guard it with the environment so development and CI don't report:

```erb
<%# app/views/avo/partials/_scripts.html.erb %>
<% if Rails.env.production? %>
  <script defer data-domain="admin.example.com" src="https://plausible.io/js/script.js"></script>
<% end %>
```

Avo navigates with [Turbo](./customization.html#turbo), so the page loads once and later screens arrive without a full reload. A tracker that only fires on `load` counts one visit per session — listen for `turbo:load` to count each screen:

```erb
<%# app/views/avo/partials/_scripts.html.erb %>
<%= javascript_tag nonce: true do %>
  document.addEventListener("turbo:load", () => {
    gtag("event", "page_view", { page_location: location.href })
  })
<% end %>
```

`nonce: true` keeps the inline script working under a Content Security Policy. For a hosted script, allow its host in `script-src`.

## Add meta tags to `<head>`

`:head` sits after Avo's assets and is the spot for anything a page needs declared up front. An admin panel is rarely something you want indexed:

```erb
<%# app/views/avo/partials/_head.html.erb %>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#1e3a5f">
```

The favicon is not a partial job — set it with [`config.appearance`](./appearance.html#favicon). Fonts and stylesheet overrides land in `avo-overrides.css` first; the [theming guide](./theming.html#change-the-font) shows when a `<link>` in `:head` is the better fit.

## Load your own stylesheet or script

Use `:pre_head` so your assets load **before** Avo's and Avo's defaults still apply on top — the [asset handling guide](./asset-handling.html#manually-sprockets-or-propshaft) has the recipe, including why `javascript_include_tag` needs `defer: true`. The `avo:js:install` generator does the same through `:head` for importmap and esbuild apps.

## Show a notice in the sidebar

`:sidebar_extra` renders after the last menu section, so it inherits the sidebar's spacing and theme. Avo's sidebar components keep it looking native — a heading is enough for a notice:

```erb
<%# app/views/avo/partials/_sidebar_extra.html.erb %>
<% unless Rails.env.production? %>
  <div class="sidebar-section">
    <%= render Avo::Sidebar::HeadingComponent.new title: "#{Rails.env.titleize} environment", icon: "tabler/outline/flask" %>
  </div>
<% end %>
```

For links, `Avo::Sidebar::LinkComponent` takes `label`, `path`, `icon`, and `target`. Plain links belong in the [menu editor](./menu-editor.html) though, where they get `visible` blocks and active-state matching for free — keep the partial for content the menu can't hold.

## Add a form to the profile menu

Plain items go in [`config.profile_menu`](./menu-editor.html#profile-menu). `:profile_menu_extra` is for the rest: a form, or an item that depends on request state. It renders above **Sign out**, and `Avo::ProfileItemComponent` with a `method` renders a `button_to`, so it posts like the sign-out button does:

```erb
<%# app/views/avo/partials/_profile_menu_extra.html.erb %>
<% if session[:impersonated_user_id].present? %>
  <%= render Avo::ProfileItemComponent.new label: "Stop impersonating", path: main_app.stop_impersonating_path, method: :delete, icon: "tabler/outline/spy" %>
<% end %>
```

## Put something in the footer

`:footer` is one of the three that ship with markup. Keep Avo's wrapper — its classes handle color, size, and hiding when printing — and change the text:

```erb
<%# app/views/avo/partials/_footer.html.erb %>
<div class="text-center text-sm text-content-secondary <%= 'print:hidden' if Avo.configuration.hide_layout_when_printing %>">
  <%= Avo.configuration.app_name %> · Avo v<%= Avo::VERSION %> · Rails <%= Rails.version %> · <%= Rails.env %>
</div>
```

## Replace the logo or header markup

Swapping the image is [`config.appearance`](./appearance.html#customize-the-logo)'s job, dark variant included. Eject `:logo` only when the logo has to be markup — an inline SVG that follows `--top-navbar-content`, say. Keep the `logo-placeholder` link wrapper from Avo's copy so the navbar keeps sizing it.

The same goes for `:header`: [`config.header_menu`](./menu-editor.html#header-menu) already handles links, overflow, and conditional visibility. Eject the partial only for markup that isn't a link, and keep the `Avo::HeaderMenuComponent` wrapper with `render_header_menu_items` inside it so the configured links still render.

## Keep it surgical

- **One concern per partial.** Analytics in `:scripts`, meta tags in `:head`. It stays reviewable, and a later Avo upgrade never asks you to reconcile a hundred lines.
- **Guard in ERB, not in JavaScript.** `Rails.env`, `_current_user`, and `session` are all available, so a snippet meant for admins in production never reaches anyone else's browser.
- **Route helpers work as usual.** `avo.root_path` for Avo's routes, `main_app.` for your app's.
- **Everything renders on every screen.** Partials are per-layout, not per-resource. For UI that belongs to one resource, use a [resource tool](./resource-tools.html); for a whole screen, a [custom tool](./custom-tools.html).
