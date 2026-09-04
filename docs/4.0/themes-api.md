---
license: community
outline: [2, 3]
guide: ./themes.html
prev:
  text: "Themes"
  link: "./themes.html"
next: false
---

# Themes API

Per-option reference for theme classes, the theme keys of `config.appearance`, the built-in themes, and the generators. For task-oriented documentation and worked examples, see the [Themes guide](./themes.html).

A theme is a class that inherits from `Avo::BaseTheme`. In the host app it lives in `app/avo/themes/` under the `Avo::Themes` namespace; in a gem it is `Avo::<Name>Theme::Theme`. Every attribute is set as a class-level assignment and has a default derived from the class name.

```ruby
# app/avo/themes/ocean.rb
class Avo::Themes::Ocean < Avo::BaseTheme
  self.title = "Ocean"
  # attributes listed below
end
```

A theme that subclasses another theme inherits every attribute the parent set.

## Theme class

<Option name="`self.id`">

The theme's identifier. It names the theme everywhere: the `avo-theme-<id>` class on `<html>`, the `avo.theme` cookie, the `:theme` settings key, and the `theme:` / `themes:` entries of `config.appearance`.

```ruby
class Avo::Themes::Ocean < Avo::BaseTheme
  self.id = :deep_ocean
end
```

- **Type:** Symbol (a String is converted)
- **Default:** derived from the class name — `Avo::Themes::Ocean` gives `:ocean`; a class named `Theme` derives from its parent module with the `Theme` suffix removed, so `Avo::OceanTheme::Theme` also gives `:ocean`. Multi-word names underscore: `Avo::Themes::TokyoNight` gives `:tokyo_night`.
- **Validation:** raises `ArgumentError` unless the value matches `/\A[a-z][a-z0-9_]*\z/`, and at derivation time when the class name cannot produce a valid id. Two registered themes with the same id raise at boot, naming both classes; the built-in ids are reserved.

</Option>

<Option name="`self.title`">

The label shown in the picker.

```ruby
class Avo::Themes::Ocean < Avo::BaseTheme
  self.title = "Deep Ocean"
end
```

- **Type:** String
- **Default:** the id titleized — `:tokyo_night` renders as "Tokyo Night". A blank value falls back to the default.

Installed themes are sorted by title after the built-ins when `themes:` is not set.

</Option>

<Option name="`self.description`">

Free-text description of the look.

```ruby
class Avo::Themes::Ocean < Avo::BaseTheme
  self.description = "Deep blue surfaces, foam-white text."
end
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`self.stylesheet`">

Asset-pipeline path of the theme's stylesheet. Avo links it in the theme slot of its layout, after `avo/application.css` and the inline brand override and before `avo-overrides.css`.

```ruby
class Avo::Themes::Ocean < Avo::BaseTheme
  self.stylesheet = "avo/themes/deep_ocean"
end
```

- **Type:** String — a path `stylesheet_link_tag` resolves — or `nil`
- **Default:** `"avo/themes/<id>"`, which maps to `app/assets/stylesheets/avo/themes/<id>.css` in the app or the gem
- **Values:** `nil` (or a blank string) means the theme ships no stylesheet of its own. The built-ins use this: their blocks compile into one file, `avo/themes.css`, which the layout links itself.

</Option>

<Option name="`self.views`">

Directory prepended to the view path while the theme is active. It mirrors Avo's `app/views` tree, so a partial at `<views>/avo/partials/_logo.html.erb` replaces `avo/partials/logo`. The directory is prepended ahead of the host app's `app/views`, per request, only when the theme is the current one.

```ruby
class Avo::Themes::Ocean < Avo::BaseTheme
  self.views = Rails.root.join("app/views/themes/ocean")
end
```

- **Type:** `Pathname` (a String is converted) or `nil`
- **Default:** `<root>/app/views/avo/themes/<id>` when that directory exists, `nil` otherwise. `<root>` is the engine root for a theme whose parent module defines an `Engine`, and `Rails.root` for a theme in the host app.
- **Values:** `nil` (or a blank value) disables partial overrides for the theme.

A theme with a views directory needs a full page render on switch; the picker performs a visit after persisting the pick instead of swapping the class on `<html>`.

</Option>

<Option name="`self.lock`">

Appearance pickers hidden while the theme is active. The configured `config.appearance` value for each locked dimension is forced.

```ruby
class Avo::Themes::Ocean < Avo::BaseTheme
  self.lock = [:neutral, :accent]
end
```

| Value      | Effect                                                   |
| ---------- | -------------------------------------------------------- |
| `:neutral` | Hides the neutral picker; the theme's neutral scale wins |
| `:accent`  | Hides the accent picker; the theme's accent wins         |

- **Type:** Array of Symbols (a single Symbol is wrapped)
- **Default:** `[]`
- **Validation:** raises `ArgumentError` for any value other than `:neutral` and `:accent`. The scheme switcher cannot be locked from a theme, and locking the theme dimension itself is a `config.appearance` concern — see [`lock`](#lock) below.

</Option>

<Option name="`self.appearance`">

Brand assets merged over `config.appearance` while the theme is active. Readers that render the logo, favicon, placeholder, and chart colors use the merged view; every other appearance key is read from `config.appearance` unchanged.

```ruby
class Avo::Themes::Ocean < Avo::BaseTheme
  self.appearance = {
    logo: "avo/themes/ocean/logo.svg",
    logo_dark: "avo/themes/ocean/logo-dark.svg",
    favicon: "avo/themes/ocean/favicon.ico",
    chart_colors: %w[#1B6F9E #2AB1EE #34C6A8 #E9C46A]
  }
end
```

- **Type:** Hash with any subset of the keys `logo`, `logo_dark`, `logomark`, `logomark_dark`, `favicon`, `favicon_dark`, `placeholder`, `chart_colors` (String keys are symbolized)
- **Default:** `{}`
- **Values:** the same values the matching [`config.appearance` asset options](./appearance-api.html#assets) accept — asset paths, and an Array of hex Strings for `chart_colors`
- **Validation:** raises `ArgumentError` for any other key. Colors belong in the stylesheet; `scheme`, `neutral`, `accent`, `neutral_colors`, `accent_colors`, `lock`, `persistence`, `theme`, and `themes` stay with the host app.

A theme with a non-empty `appearance` needs a full page render on switch, like one with a views directory.

</Option>

<Option name="`self.attribution`">

Credit for a palette reused under its license. Rendered nowhere in the UI; the built-ins list theirs in the gem's `NOTICE` file.

```ruby
class Avo::Themes::Ocean < Avo::BaseTheme
  self.attribution = "Palette adapted from the Ocean color scheme, MIT."
end
```

- **Type:** String
- **Default:** `nil`

</Option>

## Appearance options

These keys are set on `config.appearance` in `config/initializers/avo.rb`, alongside the options on the [Appearance API](./appearance-api.html) page.

<Option name="`theme`">

The default theme: the one a request lands on when the user has no valid pick, and the forced value when `:theme` is locked.

```ruby
config.appearance = {
  theme: :coastal
}
```

- **Type:** Symbol — a theme id
- **Default:** `nil` — the first offered theme, which is `:paper` unless `themes:` reorders or omits it
- **Validation:** raises `ArgumentError` at boot when the value is not a Symbol. Whether the id is installed is checked per request, not at boot, because gems register their themes after the initializer runs; an id that is not installed falls back to the default above.
- **Lockable:** yes — list `:theme` in `lock:` to hide the picker

</Option>

<Option name="`themes`">

The theme ids the picker offers, in order. Replaces the discovered list.

```ruby
config.appearance = {
  themes: [:paper, :coastal, :monokai]
}
```

- **Type:** Array of Symbols (Strings are converted)
- **Default:** `nil` — every installed theme: the built-ins in the order of the [table below](#built-in-themes), then local and gem themes sorted by title
- **Values:** ids of installed themes. Ids that are not installed are dropped from the list at render time rather than raising. The list may omit `:paper`.

A persisted pick that names a theme outside this list is ignored and the request falls back to `theme:`.

</Option>

<Option name="`lock`">

The `:theme` entry of the appearance [`lock`](./appearance-api.html#lock) list. Hides the Theme section of the picker and forces `theme:` for every user.

```ruby
config.appearance = {
  theme: :coastal,
  lock: [:theme]
}
```

- **Type:** Array of Symbols, any subset of `[:scheme, :neutral, :accent, :theme]`
- **Default:** `[]`

When `theme:` names a theme that is not installed, the locked value falls back to the first offered theme.

</Option>

## Built-in themes

Thirteen themes ship with Avo, under `Avo::BuiltinThemes`. Their stylesheet blocks compile into one file, `avo/themes.css`, so `stylesheet` is `nil` on each. Every built-in styles both schemes; the light block column says where the light values come from.

| Id            | Title       | Light block                               |
| ------------- | ----------- | ----------------------------------------- |
| `paper`       | Paper       | Avo's defaults — Paper has no stylesheet  |
| `coastal`     | Coastal     | Authored by Avo                           |
| `rose`        | Rose        | Authored by Avo                           |
| `sunset`      | Sunset      | Authored by Avo                           |
| `midnight`    | Midnight    | Authored by Avo                           |
| `monokai`     | Monokai     | Derived from the dark palette             |
| `dracula`     | Dracula     | Derived from the dark palette             |
| `solarized`   | Solarized   | Upstream Solarized Light                  |
| `nord`        | Nord        | Derived from the dark palette             |
| `gruvbox`     | Gruvbox     | Upstream Gruvbox Light                    |
| `one_dark`    | One Dark    | Upstream One Light                        |
| `catppuccin`  | Catppuccin  | Upstream Latte (Mocha in dark)            |
| `tokyo_night` | Tokyo Night | Upstream Day (Night in dark)              |

"Derived" means the light block keeps the palette's accents and places them on a light ground of the same hue family; the dark block is the faithful one. The editor palettes are reused under their licenses (MIT, and the freely reused 2006 Monokai values), credited in each class's `attribution` and in the gem's `NOTICE`.

Built-in ids are reserved: a local or gem theme with one of these ids raises at boot.

## Generators

### `avo:theme`

Creates a theme: the class and its stylesheet, with every public token listed and commented out in the CSS.

```bash
bin/rails generate avo:theme NAME [--gem] [--path DIR]
```

| Flag     | Effect                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _(none)_ | A local theme: `app/avo/themes/<name>.rb` and `app/assets/stylesheets/avo/themes/<name>.css`                                                                                                                                                                                                                                                                                                                                                                                       |
| `--gem`  | A publishable gem instead: `avo-<name>_theme/` with the gemspec, `lib/avo/<name>_theme.rb`, `lib/avo/<name>_theme/version.rb`, `lib/avo/<name>_theme/engine.rb`, `lib/avo/<name>_theme/theme.rb` (`Avo::<Name>Theme::Theme`, with `self.id` pinned to `<name>`), the stylesheet at `app/assets/stylesheets/avo/themes/<name>.css`, an asset manifest for Sprockets, empty `app/assets/images/avo/themes/<name>/` and `app/views/avo/themes/<name>/` directories, a `README.md` with the install line and the `gem build` / `gem push` steps, and a `NOTICE`. Prints the `Gemfile` line with `path:` for local development. |
| `--path` | With `--gem`, the directory the gem is written into, relative to the app root. Defaults to the app root, so the gem lands at `<app>/avo-<name>_theme/`; `--path ../` puts it beside the app.                                                                                                                                                                                                                                                                                       |

`NAME` is underscored and stripped of a trailing `_theme` to form the id — `Ocean`, `ocean_theme`, and `OceanTheme` all give `ocean` — and the result must match `/\A[a-z][a-z0-9_]*\z/`. The gemspec pins `avo >= <major>.<minor>` of the Avo version that generated it.

### `avo:eject --theme`

The [eject generator](./eject-views.html) copies a partial into a theme's views directory instead of `app/views/`.

```bash
bin/rails generate avo:eject --partial :logo --theme ocean
```

| Flag      | Effect                                                                                                                                                                                                                                       |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--theme` | The id of an installed theme. The partial is written under that theme's views directory — `app/views/avo/themes/<id>/` for a local theme, the gem's `app/views/avo/themes/<id>/` for a gem theme — at the same path it has inside Avo. |

`--theme` combines with `--partial` only, and only with views: components, controllers, and the `:avo_overrides_css` / `:avo_overrides_js` / `:asset_overrides` templates are loaded by the app, not by a theme, so the generator declines them with a message rather than ejecting.

## Cookie and settings keys

| Key         | Where                                           | Holds                                                                                                                                   |
| ----------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `avo.theme` | Cookie, scoped to the Avo mount point           | The picked theme id under cookie persistence. Set by the picker; read on every request.                                                |
| `:theme`    | The settings Hash under `persistence: :database` | The picked theme id. [`load_settings`](./appearance-api.html#load_settings) may return it and [`save_settings`](./appearance-api.html#save_settings) receives it in the partial `settings` Hash, alongside `:color_scheme`, `:neutral`, and `:accent`. |

A stored value is honored only when it matches the id format and names a theme that is both installed and offered. Anything else is ignored and the request falls back to [`theme`](#theme).
