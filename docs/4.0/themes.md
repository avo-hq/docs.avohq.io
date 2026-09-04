---
license: community
outline: [2, 3]
api_docs: ./themes-api.html
---

# Themes

A theme is a named look for Avo: a stylesheet, and optionally a set of partial overrides and brand assets, bundled under one id. Avo discovers every installed theme, lists it in the appearance picker with a live preview tile, remembers each user's pick, and applies the theme's partials and assets only while it is active. Themes come from three places — the thirteen Avo ships, `app/avo/themes/` in your app, and gems — and the picker treats them all the same.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.appearance = {
    theme: :coastal,                         # the default look
    themes: [:paper, :coastal, :monokai]     # what the picker offers, in order
  }
end
```

With no configuration at all, every install already has themes: the picker lists all thirteen built-ins, Paper (Avo's stock look) is the default, and each user's pick is remembered in a cookie.

:::tip Themes and add-ons
Themes work on core Avo only, but every add-on reads the same `var(--color-*)` tokens a theme redefines, so a theme re-skins dashboards, kanban boards, and the rest for free.
:::

## Pick a built-in theme

Open the appearance picker in the top navbar. The **Theme** section sits above the neutral and accent pickers: hover a row to preview it across the whole screen, click to keep it.

<Image prompt="The appearance picker open in the top navbar, showing the Theme section with its list of built-in themes, each row carrying a mini window preview tile and a title, with Coastal hovered" />

| Theme       | Id            | Looks like                                            |
| ----------- | ------------- | ----------------------------------------------------- |
| Paper       | `paper`       | Avo's stock look: warm white surfaces, ink text       |
| Coastal     | `coastal`     | Sand neutrals, sea-glass and deep-ocean accents       |
| Rose        | `rose`        | Warm blush neutrals, rich rose accent                 |
| Sunset      | `sunset`      | Dusk purples, magenta-to-orange accents               |
| Midnight    | `midnight`    | Cool near-black surfaces, electric indigo accent      |
| Monokai     | `monokai`     | Charcoal ground; yellow, magenta, cyan, green accents |
| Dracula     | `dracula`     | Purple-grey ground, pink and purple accents           |
| Solarized   | `solarized`   | One sixteen-color palette, light and dark             |
| Nord        | `nord`        | Arctic blue-grey ground, frost accents                |
| Gruvbox     | `gruvbox`     | Retro warm browns and olive, orange accent            |
| One Dark    | `one_dark`    | Blue-grey ground, blue and purple accents             |
| Catppuccin  | `catppuccin`  | Pastel palette: Latte by day, Mocha by night          |
| Tokyo Night | `tokyo_night` | Deep navy, soft purple and cyan accents               |

Every theme styles both color schemes, so the light/dark switcher keeps working on top of any of them. The editor palettes are dark-native; where the upstream project publishes a light variant (Solarized, Gruvbox, One Dark, Catppuccin, Tokyo Night) Avo uses it, and where it doesn't (Monokai, Dracula, Nord) the light block keeps the accents and puts them on a light ground of the same hue family. See the [built-in themes table](./themes-api.html#built-in-themes) for which is which.

## Set a default and trim the list

Pass [`theme`](./themes-api.html#theme) to choose the look a user lands on before they pick anything, and [`themes`](./themes-api.html#themes) to replace the offered list with just the ids you want, in the order you want them.

```ruby
# config/initializers/avo.rb
config.appearance = {
  theme: :coastal,
  themes: [:paper, :coastal, :monokai]
}
```

The list may leave out `paper`. When it does, set `theme:` to one of the listed ids — otherwise Avo falls back to the first theme in the list. Ids that aren't installed are dropped from the list silently, so a theme gem you removed from the `Gemfile` doesn't break the picker.

If you want one theme and no picker at all, add `:theme` to [`lock`](./themes-api.html#lock):

```ruby
# config/initializers/avo.rb
config.appearance = {
  theme: :coastal,
  lock: [:theme]
}
```

Locking `:theme` hides the Theme section and forces the configured value. It doesn't touch the scheme, neutral, or accent pickers — lock those separately, as described in [Locking choices](./appearance.html#locking-choices).

## Keep the pick across reloads

A theme pick is persisted the same way as the scheme, neutral, and accent picks, through [`persistence`](./appearance-api.html#persistence). Nothing to set up for the default:

- **Cookie** (default) — the pick goes into the `avo.theme` cookie, scoped to the Avo mount point.
- **Database** — with `persistence: :database`, `:theme` joins the settings hash: `load_settings` may return it and `save_settings` receives it alongside `:color_scheme`, `:neutral`, and `:accent`. If you already persist appearance to a JSON column, theme persistence works with no migration.

```ruby
# config/initializers/avo.rb
config.appearance = {
  persistence: :database,
  load_settings: -> {
    current_user&.avo_preferences&.dig("appearance")&.symbolize_keys || {}
  },
  save_settings: -> {
    next unless current_user

    current_user.update!(
      avo_preferences: current_user.avo_preferences.to_h.deep_merge(
        "appearance" => settings.stringify_keys
      )
    )
  }
}
```

A stored value is honored only when it names a theme that is both installed and offered; anything else falls through to the configured default. See [Persist picks across devices](./appearance.html#persist-picks-across-devices) for the blocks and the column they need.

## Create a theme

Run the generator with the id you want:

```bash
bin/rails generate avo:theme ocean
      create  app/avo/themes/ocean.rb
      create  app/assets/stylesheets/avo/themes/ocean.css
```

Restart the server and Ocean is in the picker. Two files carry the whole theme. The name becomes the theme id: `Ocean`, `ocean_theme`, and `OceanTheme` all produce `ocean`.

### The theme class

The class is the manifest. Every attribute has a default derived from the class name, so a generated theme is complete before you touch it — the commented lines show the knobs that exist.

```ruby
# app/avo/themes/ocean.rb
class Avo::Themes::Ocean < Avo::BaseTheme
  self.title = "Ocean"
  self.description = "Deep blue surfaces, foam-white text."
  # self.id = :ocean                              # derived from the class name
  # self.stylesheet = "avo/themes/ocean"          # asset path, derived from the id
  # self.lock = [:neutral, :accent]               # hide the pickers the theme owns
  # self.appearance = { logo: "avo/themes/ocean/logo.svg" }
end
```

[`title`](./themes-api.html#self.title) is the picker label and [`description`](./themes-api.html#self.description) is free text for your own records. Leave [`id`](./themes-api.html#self.id) alone unless the class name can't produce the id you want; it's what the cookie, the `themes:` list, and the CSS class all use.

### The stylesheet

The generated CSS file lists every public token Avo exposes, grouped the way the [CSS variables reference](./appearance-api.html#css-variables) is, each commented out. Uncomment what you want to change:

```css
/* app/assets/stylesheets/avo/themes/ocean.css */
@layer base {
  .avo-theme-ocean {
    --color-avo-neutral-50: oklch(97% 0.02 240);
    --color-avo-neutral-900: oklch(28% 0.06 240);
    --color-accent: oklch(62% 0.14 220);
    --color-accent-content: oklch(52% 0.14 220);
    --color-accent-foreground: var(--color-white);
    --color-brand-accent: oklch(62% 0.14 220);
    --color-navbar-background: oklch(24% 0.07 240);
    --radius-card: 1.25rem;
  }

  .avo-theme-ocean.dark,
  .dark .avo-theme-ocean {
    --color-accent: oklch(74% 0.12 220);
    --color-accent-content: oklch(80% 0.10 220);
    --color-accent-foreground: oklch(20% 0.06 240);
  }
}
```

Two things about that shape are load-bearing, so keep them:

- **Rules are scoped to `.avo-theme-ocean`, not `:root`.** Every installed theme loads on every page and only the class on `<html>` decides which one applies. That is what makes hovering a row in the picker preview the theme instantly, and what lets the picker's preview tile render your real colors with no extra work. Keep both dark selectors: `.avo-theme-ocean.dark` is the page and `.dark .avo-theme-ocean` is the tile.
- **Everything sits in `@layer base`.** Avo's defaults live below it, in `@layer theme`, and the user-pickable neutral and accent classes live above it, in `@layer components`. A theme therefore replaces Avo's defaults, and a user's neutral or accent pick still wins on top of it — the same slot a [brand palette](./appearance-api.html#neutral_colors) in `config.appearance` uses. Your app's `avo-overrides.css` and `:head` partial are unlayered and keep beating everything, theme included.

Light values carry into dark. The dark block only overrides what it re-sets, so a token you declare once applies in both schemes until the dark block says otherwise. Set the neutral scale and the accent in the light block, then re-set in the dark block only what needs to differ — that's usually the accent and a couple of surfaces.

:::tip Neutral and accent picks still apply
Because a theme sits below the user's picks, someone can still choose `slate` or `orange` on top of Ocean. If the theme should own the whole palette, hide those pickers while it's active:

```ruby
# app/avo/themes/ocean.rb
class Avo::Themes::Ocean < Avo::BaseTheme
  self.lock = [:neutral, :accent]
end
```

[`lock`](./themes-api.html#self.lock) on a theme takes only `:neutral` and `:accent` — the scheme switcher always works, and locking the theme itself is the host app's call through `config.appearance`.
:::

### Fonts and images a theme uses

Reference files the theme ships from the stylesheet the way you would in `avo-overrides.css`: `@font-face` for typefaces, `url()` for backgrounds. A local theme keeps them under `app/assets/`; a gem theme ships them in its own `app/assets/`. Under a strict Content Security Policy, allow the source in `font-src` for self-hosted fonts, exactly as [Change the font](./theming.html#change-the-font) describes.

## Override partials

A theme can replace any Avo partial while it's active — the logo, the header, the sidebar extras, anything under `app/views/avo`. Eject the partial into the theme with the `--theme` flag:

```bash
bin/rails generate avo:eject --partial :logo --theme ocean
      create  app/views/avo/themes/ocean/avo/partials/_logo.html.erb
```

The theme's views directory mirrors Avo's `app/views` tree, so `app/views/avo/themes/ocean/avo/partials/_logo.html.erb` is what `render partial: "avo/partials/logo"` finds — in layouts, in partials, and inside ViewComponents. It applies per request, per user: two admins on two themes see two logos from one process.

While a theme is active, its directory goes **ahead of `app/views`**. A partial the theme ships beats one you ejected into the app; if you want to customize a themed partial, eject it into the theme with `--theme` instead. Every view [prepared template](./eject-views.html#prepared-templates) (`:logo`, `:header`, `:head`, `:scripts`, and the rest) and any `app/views` path the eject generator accepts works with `--theme`; the `:avo_overrides_css` / `:avo_overrides_js` templates don't, since stylesheets and scripts are loaded by the app, not by a theme.

:::info Switching reloads the page
A CSS-only theme switches by swapping a class on `<html>`. A theme with a views directory or brand assets needs the server to render again, so picking it — or leaving it — does a full page visit after the pick is saved. Hover preview still works, since it only touches the class.
:::

Themes override partials only. ViewComponents are Ruby classes and can't be swapped by view path; to customize one, [eject the component](./eject-views.html#eject-a-component) at the app level as usual.

## Bundle brand assets

Set [`appearance`](./themes-api.html#self.appearance) on the theme to carry the logo, favicon, placeholder, and chart colors that go with the look. They're laid over `config.appearance` only while the theme is active — a company theme is the whole brand, colors and marks, in one unit.

```ruby
# app/avo/themes/ocean.rb
class Avo::Themes::Ocean < Avo::BaseTheme
  self.appearance = {
    logo: "avo/themes/ocean/logo.svg",
    logo_dark: "avo/themes/ocean/logo-dark.svg",
    favicon: "avo/themes/ocean/favicon.ico",
    placeholder: "avo/themes/ocean/placeholder.svg",
    chart_colors: %w[#1B6F9E #2AB1EE #34C6A8 #E9C46A]
  }
end
```

Put the files under `app/assets/images/avo/themes/ocean/` and reference them by asset path, as you would for `config.appearance`. Only the asset keys are allowed — `logo`, `logo_dark`, `logomark`, `logomark_dark`, `favicon`, `favicon_dark`, `placeholder`, and `chart_colors`. Anything else raises at boot: colors belong in the stylesheet, and scheme, locks, persistence, and the offered list stay with the host app.

## Ship a theme as a gem

Themes travel as plain gems. There's no registry and no approval — `gem "avo-ocean_theme"` in a `Gemfile` is the entire install. Generate the gem shape with `--gem`:

```bash
bin/rails generate avo:theme ocean --gem
      create  avo-ocean_theme/avo-ocean_theme.gemspec
      create  avo-ocean_theme/lib/avo/ocean_theme.rb
      create  avo-ocean_theme/lib/avo/ocean_theme/version.rb
      create  avo-ocean_theme/lib/avo/ocean_theme/engine.rb
      create  avo-ocean_theme/lib/avo/ocean_theme/theme.rb
      create  avo-ocean_theme/app/assets/stylesheets/avo/themes/ocean.css
      create  avo-ocean_theme/app/assets/config/avo-ocean_theme_manifest.js
      create  avo-ocean_theme/app/assets/images/avo/themes/ocean/.keep
      create  avo-ocean_theme/app/views/avo/themes/ocean/.keep
      create  avo-ocean_theme/README.md
      create  avo-ocean_theme/NOTICE
```

The gem is a minimal Rails engine, written into your app's root by default — pass [`--path ../`](./themes-api.html#generators) to put it beside the app instead. It follows the field-gem naming convention: gem `avo-ocean_theme`, namespace `Avo::OceanTheme`, and the theme class `Avo::OceanTheme::Theme`, which pins the id so the picker sees it as `ocean`.

```ruby
# lib/avo/ocean_theme/theme.rb
module Avo
  module OceanTheme
    class Theme < Avo::BaseTheme
      self.id = :ocean
      self.title = "Ocean"
      self.description = "Deep blue surfaces, foam-white text."
    end
  end
end
```

The stylesheet, partial overrides (`app/views/avo/themes/ocean/`), and brand assets (`app/assets/images/avo/themes/ocean/`) live at the same paths as in a local theme, just inside the gem. Propshaft serves engine assets with no registration; on Sprockets the generated engine adds the manifest to `precompile`. Avo's layout links the stylesheet itself, so the gem never touches `Avo.asset_manager`.

### Develop it locally

Point your app at the checkout with `path:` while you work on it — the generator prints this line with the right path:

```ruby
# Gemfile
gem "avo-ocean_theme", path: "avo-ocean_theme"
```

Restart the server after `bundle install` and the theme appears in the picker, exactly like a local one.

### Publish it

Build and push to rubygems.org like any gem:

```bash
cd avo-ocean_theme
gem build avo-ocean_theme.gemspec
gem push avo-ocean_theme-0.1.0.gem
```

Fill in the author, homepage, and license in the gemspec first. The generated `README.md` already carries the install line and a place for a screenshot; `NOTICE` is where palette attributions go if you reused one, and `lib/avo/ocean_theme/version.rb` holds the version to bump before each release.

### Install someone else's theme

Add the gem and restart — that's it:

```ruby
# Gemfile
gem "avo-ocean_theme"
```

The theme shows up in the picker after the built-ins, sorted by title with any other installed theme. To make it the default or the only choice, use [`theme:`](./themes-api.html#theme) and [`themes:`](./themes-api.html#themes) as above.

:::warning One id per theme
Two installed themes with the same id — a gem's `Avo::OceanTheme::Theme` and your own `app/avo/themes/ocean.rb`, say — raise at boot with both class names in the message. Set `self.id` on one of them, or pick a different name. The built-in ids are taken too.
:::

## Let an AI agent do it

A theme is one Ruby class and one plain CSS file of well-named variables, which is exactly what a coding agent handles well. Run the generator, then hand the agent this page and a look. Copy a prompt below and paste it into your coding agent:

::: code-group

```text [Coastal]
Use the Avo themes guide at https://docs.avohq.io/4.0/themes.html. Run `bin/rails generate avo:theme coastal_pro` and build a coastal theme — soft sand neutrals, sea-glass and deep-ocean accents — by uncommenting and setting tokens in app/assets/stylesheets/avo/themes/coastal_pro.css only. Keep the .avo-theme-coastal_pro scoping and the @layer base wrapper, set the full neutral scale and the accent in the light block, and re-set only the accent and surfaces that need to differ in the dark block. Set a title and description in app/avo/themes/coastal_pro.rb.
```

```text [Rose]
Use the Avo themes guide at https://docs.avohq.io/4.0/themes.html. Run `bin/rails generate avo:theme blush` and build a rose theme — warm blush neutrals and a rich rose accent — by uncommenting and setting tokens in app/assets/stylesheets/avo/themes/blush.css only. Keep the .avo-theme-blush scoping and the @layer base wrapper, set the full neutral scale and the accent in the light block, and re-set only the accent and surfaces that need to differ in the dark block. Set a title and description in app/avo/themes/blush.rb.
```

```text [80's Sunset]
Use the Avo themes guide at https://docs.avohq.io/4.0/themes.html. Run `bin/rails generate avo:theme neon_sunset` and build an 80's sunset theme — dusk purples and hot magenta-to-orange accents — by uncommenting and setting tokens in app/assets/stylesheets/avo/themes/neon_sunset.css only. Keep the .avo-theme-neon_sunset scoping and the @layer base wrapper, set the full neutral scale and the accent in the light block, and re-set only the accent and surfaces that need to differ in the dark block. Set a title and description in app/avo/themes/neon_sunset.rb.
```

```text [Ship it as a gem]
Use the Avo themes guide at https://docs.avohq.io/4.0/themes.html. Run `bin/rails generate avo:theme forest --gem` and build a forest theme — deep green surfaces, moss neutrals, and an amber accent — in the generated gem's app/assets/stylesheets/avo/themes/forest.css only. Keep the .avo-theme-forest scoping and the @layer base wrapper, set the full neutral scale and the accent in the light block, and re-set only what needs to differ in the dark block. Add the gem to my Gemfile with the path: option, then tell me the gem build and gem push commands.
```

:::

Coastal, Rose, and Sunset already ship as built-ins, so the first three prompts are for a look of your own in that direction; for the stock ones, `theme: :coastal` is the whole job.

## Full example

```ruby
# app/avo/themes/ocean.rb
class Avo::Themes::Ocean < Avo::BaseTheme
  self.id = :ocean
  self.title = "Ocean"
  self.description = "Deep blue surfaces, foam-white text."
  self.stylesheet = "avo/themes/ocean"
  self.views = Rails.root.join("app/views/avo/themes/ocean")
  self.lock = [:neutral, :accent]
  self.appearance = {
    logo: "avo/themes/ocean/logo.svg",
    logo_dark: "avo/themes/ocean/logo-dark.svg",
    logomark: "avo/themes/ocean/logomark.svg",
    logomark_dark: "avo/themes/ocean/logomark-dark.svg",
    favicon: "avo/themes/ocean/favicon.ico",
    favicon_dark: "avo/themes/ocean/favicon-dark.ico",
    placeholder: "avo/themes/ocean/placeholder.svg",
    chart_colors: %w[#1B6F9E #2AB1EE #34C6A8 #E9C46A]
  }
  self.attribution = "Palette adapted from the Ocean color scheme, MIT."
end
```

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.appearance = {
    theme: :ocean,
    themes: [:ocean, :paper, :midnight],
    lock: [:scheme]
  }
end
```
