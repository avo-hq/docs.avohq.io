---
license: community
outline: [2, 3]
api_docs: ./themes-api.html
---

# Themes

A theme is a named, finished look for Avo: a stylesheet drawn for one color scheme, and optionally a set of partial overrides and brand assets, bundled under one id. Avo discovers every installed theme, lists it in the appearance picker with a live preview tile, remembers each user's pick, and applies the theme's scheme, partials, and assets only while it is active. Themes come from three places — the eighteen Avo ships, `app/avo/themes/` in your app, and gems — and the picker treats them all the same.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.appearance = {
    theme: :coastal,                         # the default look
    themes: [:paper, :coastal, :monokai]     # what the picker offers, in this order within each group
  }
end
```

With no configuration at all, every install already has themes: the picker lists all eighteen built-ins, Paper (Avo's stock look) is the default, and each user's pick is remembered in a cookie.

Paper is the one theme that is a *base* rather than a look: on Paper the user picks a neutral, an accent, and a light/dark/auto scheme. Every other theme owns those three — it is drawn for one scheme and one palette, so while it is active the neutral, accent, and scheme pickers disappear, and the scheme follows the theme (pick Dracula and the interface goes dark, whatever the OS says). Pick Paper again and the pickers come back with the user's earlier choices intact, no reload needed.

:::tip Themes and add-ons
Themes work on core Avo only, but every add-on reads the same `var(--color-*)` tokens a theme redefines, so a theme re-skins dashboards, kanban boards, and the rest for free.
:::

## Pick a built-in theme

Open the appearance picker in the top navbar. The **Theme** section comes first: hover a row to preview it across the whole screen (scheme included), click to keep it. Themes are listed in three groups: **Light & dark** for the ones that leave the scheme picker open (Paper, and any theme whose [`lock`](./themes-api.html#lock) omits `:scheme`), then **Light**, then **Dark**. A group with no themes in it is not shown.

<Image prompt="The appearance picker open in the top navbar, showing the Theme section with its list of built-in themes, each row carrying a mini window preview tile and a title, with Coastal hovered" />

| Theme            | Id                 | Scheme | Looks like                                               |
| ---------------- | ------------------ | ------ | -------------------------------------------------------- |
| Paper            | `paper`            | yours  | Avo's stock look; pick your own neutral, accent, scheme  |
| Coastal          | `coastal`          | light  | Sand surfaces and a sand navbar, sea-glass accent        |
| Rose             | `rose`             | light  | Warm blush neutrals, deep rose navbar, rich rose accent  |
| Sunset           | `sunset`           | light  | Dusk purples, magenta accent, amber warnings             |
| Midnight         | `midnight`         | dark   | Cool near-black surfaces, electric indigo accent         |
| Monokai          | `monokai`          | dark   | Charcoal ground; pink, yellow, cyan, green accents       |
| Dracula          | `dracula`          | dark   | Purple-grey ground, purple and pink accents              |
| Nord             | `nord`             | dark   | Arctic blue-grey ground, frost accents                   |
| Solarized Light  | `solarized_light`  | light  | Cream base3 surfaces and a cream navbar, blue accent     |
| Solarized Dark   | `solarized_dark`   | dark   | Base03 surfaces, blue accent, the same sixteen colors    |
| Gruvbox Light    | `gruvbox_light`    | light  | Retro cream surfaces and a cream navbar, orange accent   |
| Gruvbox Dark     | `gruvbox_dark`     | dark   | Retro warm browns, orange accent                         |
| One Light        | `one_light`        | light  | Cool grey surfaces, blue accent                          |
| One Dark         | `one_dark`         | dark   | Blue-grey ground, blue and purple accents                |
| Catppuccin Latte | `catppuccin_latte` | light  | Pastel latte surfaces and a latte navbar, mauve accent   |
| Catppuccin Mocha | `catppuccin_mocha` | dark   | Pastel mocha ground, mauve accent                        |
| Tokyo Night Day  | `tokyo_night_day`  | light  | Soft blue-grey day surfaces, blue accent                 |
| Tokyo Night      | `tokyo_night`      | dark   | Deep navy, soft blue and cyan accents                    |

A look that exists in two schemes is two themes, one per published variant, so the picker says exactly what you get and no palette is stretched into a scheme it was never designed for. Four of the light themes keep a light navbar — the dark bar is Paper's choice, not a rule. See the [built-in themes table](./themes-api.html#built-in-themes) for the source of each palette.

## Set a default and trim the list

Pass [`theme`](./themes-api.html#theme) to choose the look a user lands on before they pick anything, and [`themes`](./themes-api.html#themes) to replace the offered list with just the ids you want, in the order you want them. The picker still groups them by scheme support (Light & dark, Light, Dark); your order applies inside each group.

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

Locking `:theme` hides the Theme section and forces the configured value. The scheme, neutral, and accent pickers then follow that theme: hidden if the theme owns them, open if it is Paper or another theme that leaves them open. To hide one of those for every theme, lock it in `config.appearance` too, as described in [Locking choices](./appearance.html#locking-choices).

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

Restart the server and Ocean is in the picker. Two files carry the whole theme. The name becomes the theme id: `Ocean`, `ocean_theme`, and `OceanTheme` all produce `ocean`. A theme is drawn for one scheme, light unless you pass `--scheme dark`; a look you want in both is two themes:

```bash
bin/rails generate avo:theme ocean_light
bin/rails generate avo:theme ocean_dark --scheme dark
```

### The theme class

The class is the manifest. Every attribute has a default derived from the class name, so a generated theme is complete before you touch it — the commented lines show the knobs that exist.

```ruby
# app/avo/themes/ocean.rb
class Avo::Themes::Ocean < Avo::BaseTheme
  self.title = "Ocean"
  self.description = "Deep blue surfaces, foam-white text."
  self.scheme = :light                          # or :dark; forced while the theme is active
  # self.id = :ocean                              # derived from the class name
  # self.stylesheet = "avo/themes/ocean"          # asset path, derived from the id
  # self.lock = [:neutral, :accent, :scheme]      # the pickers the theme owns; this is the default
  # self.appearance = { logo: "avo/themes/ocean/logo.svg" }
end
```

[`title`](./themes-api.html#self.title) is the picker label and [`description`](./themes-api.html#self.description) is free text for your own records. [`scheme`](./themes-api.html#self.scheme) is the scheme the stylesheet is drawn for; Avo puts the interface in that scheme whenever the theme is active. Leave [`id`](./themes-api.html#self.id) alone unless the class name can't produce the id you want; it's what the cookie, the `themes:` list, and the CSS class all use.

### The stylesheet

The generated CSS file lists every public token Avo exposes, grouped the way the [CSS variables reference](./appearance-api.html#css-variables) is, each commented out. Uncomment what you want to change:

```css
/* app/assets/stylesheets/avo/themes/ocean.css */
@layer base {
  .avo-theme-ocean {
    --color-avo-neutral-50: oklch(97% 0.02 240);
    --color-avo-neutral-900: oklch(28% 0.06 240);
    --color-background: var(--color-avo-neutral-50);
    --color-primary: var(--color-white);
    --color-accent: oklch(62% 0.14 220);
    --color-accent-content: oklch(52% 0.14 220);
    --color-accent-foreground: var(--color-white);
    --color-brand-accent: oklch(62% 0.14 220);
    --color-navbar-background: oklch(24% 0.07 240);
    --radius-card: 1.25rem;
  }
}
```

Three things about that shape are load-bearing, so keep them:

- **One block, one scheme.** The theme is drawn for its `scheme`, and Avo forces that scheme on `<html>` while the theme is active, so there is no `.dark` twin to keep in sync. A look wanted in both schemes is two themes, exactly as the built-ins do it (Solarized Light and Solarized Dark).
- **Rules are scoped to `.avo-theme-ocean`, not `:root`.** Every installed theme loads on every page and only the class on `<html>` decides which one applies. That is what makes hovering a row in the picker preview the theme instantly, and what lets the picker's preview tile render your real colors with no extra work. The tile can sit on a page in the other scheme, so set the foundations (`--color-background`, `--color-primary`, the navbar) explicitly instead of relying on Avo deriving them from the neutral scale.
- **Everything sits in `@layer base`.** Avo's defaults live below it, in `@layer theme`, and the user-pickable neutral and accent classes live above it, in `@layer components`. A theme therefore replaces Avo's defaults — the same slot a [brand palette](./appearance-api.html#neutral_colors) in `config.appearance` uses. Your app's `avo-overrides.css` and `:head` partial are unlayered and keep beating everything, theme included.

:::tip The navbar does not have to be dark, and the content does not have to be a card
Avo's stock look has a dark navbar in both schemes and draws the content as a raised card next to the sidebar, and it is easy to read both as rules. They are not.

- `--color-navbar-background` plus the `--color-navbar-content` and `--color-navbar-control-*` tokens recolor the whole bar: make it a light band with dark ink (Coastal, Solarized Light, Gruvbox Light, and Catppuccin Latte do), a tint of the accent, or the same color as the page.
- The seam between the sidebar and the content is three tokens: `--color-sidebar-background`, `--color-main-content-background`, and `--color-main-content-border`. Give the first two one value and make the border `transparent` for a flush look, and set `--navbar-notch-enabled: false` so the navbar's corner arches go with it (Nord does this). Or keep the card and just tint it.

Decide both per theme; they change the feel more than any accent does. A picker where every tile has the same dark strip is a picker of accent colors.
:::

:::tip A theme owns its pickers
By default a theme locks the neutral, accent, and scheme pickers ([`lock`](./themes-api.html#self.lock) is `[:neutral, :accent, :scheme]`): they are hidden while it is active, and the user's picks for them are set aside, not lost. This is what keeps a theme looking like its screenshot. Paper unlocks all three, which is why it behaves as a base. Unlock a dimension on your own theme only if the stylesheet handles it — dropping `:scheme` means adding a `.avo-theme-ocean.dark, .dark .avo-theme-ocean { … }` block and styling both schemes:

```ruby
# app/avo/themes/ocean.rb
class Avo::Themes::Ocean < Avo::BaseTheme
  self.lock = [:accent]   # the user picks a neutral and a scheme on top of Ocean
end
```

Locking the theme dimension itself is the host app's call through `config.appearance`.
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
      self.scheme = :light
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
Use the Avo themes guide at https://docs.avohq.io/4.0/themes.html. Run `bin/rails generate avo:theme coastal_pro` and build a light coastal theme — soft sand neutrals, sea-glass and deep-ocean accents — by uncommenting and setting tokens in app/assets/stylesheets/avo/themes/coastal_pro.css only. Keep the .avo-theme-coastal_pro scoping and the @layer base wrapper, set the full neutral scale, the foundations, and the accent, and give the navbar a look of its own with the --color-navbar-* tokens: it can be a light sand band with dark ink, it does not have to be dark. Decide the sidebar/content seam too (--color-sidebar-background, --color-main-content-background, --color-main-content-border, --navbar-notch-enabled): a flush single-ground layout or the raised content card. Set a title and description in app/avo/themes/coastal_pro.rb.
```

```text [Rose]
Use the Avo themes guide at https://docs.avohq.io/4.0/themes.html. Run `bin/rails generate avo:theme blush` and build a light rose theme — warm blush neutrals and a rich rose accent — by uncommenting and setting tokens in app/assets/stylesheets/avo/themes/blush.css only. Keep the .avo-theme-blush scoping and the @layer base wrapper, set the full neutral scale, the foundations, and the accent, and pick a navbar treatment that suits the look (a deep rose bar, a blush band, or the page color) using the --color-navbar-* tokens, then decide whether the content sits as a raised card or flush with the sidebar (--color-sidebar-background, --color-main-content-background, --color-main-content-border, --navbar-notch-enabled). Set a title and description in app/avo/themes/blush.rb.
```

```text [80's Sunset, dark]
Use the Avo themes guide at https://docs.avohq.io/4.0/themes.html. Run `bin/rails generate avo:theme neon_sunset --scheme dark` and build a dark 80's sunset theme — dusk purples and hot magenta-to-orange accents — by uncommenting and setting tokens in app/assets/stylesheets/avo/themes/neon_sunset.css only. Keep the .avo-theme-neon_sunset scoping and the @layer base wrapper, set the full neutral scale, the dark foundations (background, primary, secondary, tertiary, content), and the accent, and try a navbar that is a tint of the accent rather than plain black; make the sidebar and content flush (one background, --color-main-content-border transparent, --navbar-notch-enabled false) if that reads better than the raised card. Set a title and description in app/avo/themes/neon_sunset.rb.
```

```text [Ship it as a gem]
Use the Avo themes guide at https://docs.avohq.io/4.0/themes.html. Run `bin/rails generate avo:theme forest --scheme dark --gem` and build a dark forest theme — deep green surfaces, moss neutrals, and an amber accent — in the generated gem's app/assets/stylesheets/avo/themes/forest.css only. Keep the .avo-theme-forest scoping and the @layer base wrapper, set the full neutral scale, the dark foundations, and the accent, and choose the navbar colors and the sidebar/content seam deliberately (--color-navbar-* tokens; --color-sidebar-background, --color-main-content-background, --color-main-content-border, --navbar-notch-enabled). Add the gem to my Gemfile with the path: option, then tell me the gem build and gem push commands.
```

:::

Coastal, Rose, and Sunset already ship as built-ins, so the first three prompts are for a look of your own in that direction; for the stock ones, `theme: :coastal` is the whole job. Each prompt makes one theme for one scheme; ask for a second run with the other `--scheme` if you want the pair.

## Full example

```ruby
# app/avo/themes/ocean.rb
class Avo::Themes::Ocean < Avo::BaseTheme
  self.id = :ocean
  self.title = "Ocean"
  self.description = "Deep blue surfaces, foam-white text."
  self.scheme = :dark
  self.stylesheet = "avo/themes/ocean"
  self.views = Rails.root.join("app/views/avo/themes/ocean")
  self.lock = [:neutral, :accent, :scheme]
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
    themes: [:ocean, :paper, :midnight]
  }
end
```
