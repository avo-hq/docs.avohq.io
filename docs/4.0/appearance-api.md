---
license: pro
outline: [2, 3]
guide: ./appearance.html
---

# Appearance API

Per-option reference for `config.appearance`. For task-oriented documentation and worked examples, see the [Appearance guide](./appearance.html).

All options are passed as a Hash to `config.appearance` in `config/initializers/avo.rb`:

```ruby
Avo.configure do |config|
  config.appearance = {
    # options listed below
  }
end
```

## Theme selection

<Option name="`scheme`">

The default color scheme.

```ruby
config.appearance = {
  scheme: :auto # :auto | :light | :dark
}
```

| Value    | Behavior                                       |
| -------- | ---------------------------------------------- |
| `:auto`  | Follows the user's system preference (default) |
| `:light` | Defaults to light mode                         |
| `:dark`  | Defaults to dark mode                          |

Unless locked, users can change the scheme from the navbar switcher.

- **Type:** Symbol — `:auto`, `:light`, or `:dark`
- **Default:** `:auto`
- **Lockable:** yes — list `:scheme` in `lock:` to hide the switcher

</Option>

<Option name="`neutral`">

The default neutral preset. Drives surfaces, borders, and chrome.

```ruby
config.appearance = {
  neutral: :slate
}
```

Available presets: `:brand`, `:slate`, `:stone`, `:gray`, `:zinc`, `:neutral`, `:taupe`, `:mauve`, `:mist`, `:olive`.

`:brand` selects the palette defined by `neutral_colors:` (see below).

- **Type:** Symbol
- **Default:** `nil` (Avo's built-in neutral)
- **Lockable:** yes — list `:neutral` in `lock:` to hide the picker

:::warning Symbols only
Passing a String or a Hash to `neutral:` raises an `ArgumentError`. Use [`neutral_colors:`](#neutral_colors) for full-color overrides.
:::

</Option>

<Option name="`accent`">

The default accent preset. Drives interactive emphasis — buttons, links, focus states, selected rows.

```ruby
config.appearance = {
  accent: :blue
}
```

Available presets: `:brand`, `:red`, `:orange`, `:amber`, `:yellow`, `:lime`, `:green`, `:emerald`, `:teal`, `:cyan`, `:sky`, `:blue`, `:indigo`, `:violet`, `:purple`, `:fuchsia`, `:pink`, `:rose`.

`:brand` selects the palette defined by `accent_colors:` (see below).

- **Type:** Symbol
- **Default:** `nil` (Avo's built-in accent)
- **Lockable:** yes — list `:accent` in `lock:` to hide the picker

:::warning Symbols only
Passing a String or a Hash to `accent:` raises an `ArgumentError`. Use [`accent_colors:`](#accent_colors) for full-color overrides.
:::

</Option>

## Custom palettes

<Option name="`neutral_colors`">

A custom 12-shade neutral palette. The same palette is applied in both light and dark mode — dark mode reuses the same scale but maps surfaces to different shades.

```ruby
config.appearance = {
  neutral: :brand,
  neutral_colors: {
    25  => "oklch(98.5% 0.005 60)",
    50  => "oklch(97%   0.008 60)",
    100 => "oklch(93%   0.012 60)",
    200 => "oklch(86%   0.015 60)",
    300 => "oklch(76%   0.015 60)",
    400 => "oklch(63%   0.014 60)",
    500 => "oklch(53%   0.013 60)",
    600 => "oklch(48%   0.012 60)",
    700 => "oklch(43%   0.011 60)",
    800 => "oklch(39%   0.010 60)",
    900 => "oklch(28%   0.008 60)",
    950 => "oklch(20%   0.005 60)"
  }
}
```

- **Type:** Hash with all 12 keys: `25`, `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950`
- **Default:** `nil`
- **Values:** any string a CSS custom property accepts — `oklch(...)`, `#hex`, `rgb(...)`, `hsl(...)`, `var(...)`
- **Validation:** raises `ArgumentError` if any shade is missing or `nil`

Setting `neutral_colors:` only defines the palette — pair it with `neutral: :brand` (or list `"brand"` in `neutrals:`) to make it selectable.

</Option>

<Option name="`accent_colors`">

A custom three-token accent palette. The same palette is applied in both light and dark mode.

```ruby
config.appearance = {
  accent: :brand,
  accent_colors: {
    color:      "oklch(55% 0.2 280)", # button bg, link color
    content:    "oklch(45% 0.2 280)", # hover, soft variants
    foreground: "oklch(99% 0 0)"      # text on accent backgrounds
  }
}
```

- **Type:** Hash with three keys: `:color`, `:content`, `:foreground`
- **Default:** `nil`
- **Values:** any string a CSS custom property accepts
- **Validation:** raises `ArgumentError` if any token is missing or `nil`

`neutral_colors:` and `accent_colors:` are independent — set one, the other, both, or neither.

</Option>

## Picker control

<Option name="`neutrals`">

Restrict which neutral presets appear in the picker.

```ruby
config.appearance = {
  neutrals: %w[brand slate stone olive]
}
```

- **Type:** Array of Strings (preset names without the leading colon)
- **Default:** all built-in neutrals — `%w[brand slate stone gray zinc neutral taupe mauve mist olive]`

</Option>

<Option name="`accents`">

Restrict which accent presets appear in the picker.

```ruby
config.appearance = {
  accents: %w[brand blue indigo violet]
}
```

- **Type:** Array of Strings (preset names without the leading colon)
- **Default:** all built-in accents

</Option>

<Option name="`lock`">

Force one or more configured values and hide the corresponding switchers.

```ruby
config.appearance = {
  scheme: :light,
  neutral: :slate,
  accent: :blue,
  lock: [:scheme, :neutral, :accent] # any subset
}
```

| Key in `lock:` | Effect                                                |
| -------------- | ----------------------------------------------------- |
| `:scheme`      | Hides the light/dark/auto switcher                    |
| `:neutral`     | Hides the neutral picker; forces the configured value |
| `:accent`      | Hides the accent picker; forces the configured value  |

- **Type:** Array of Symbols, any subset of `[:scheme, :neutral, :accent]`
- **Default:** `[]`

A value not listed in `lock:` is treated as a default — users can override it via the switcher.

</Option>

<Option name="`picker_layout`">

Layout of the appearance switcher in the top navbar.

```ruby
config.appearance = {
  picker_layout: :inline # :inline | :dropdown
}
```

| Value       | Behavior                                                                       |
| ----------- | ------------------------------------------------------------------------------ |
| `:inline`   | Renders inline on `lg` and up, auto-collapses to a dropdown on smaller screens |
| `:dropdown` | Always renders as a compact dropdown                                           |

- **Type:** Symbol — `:inline` or `:dropdown`
- **Default:** `:inline`
- **Validation:** raises `ArgumentError` for any other value

</Option>

## Persistence

<Option name="`persistence`">

Where unlocked user picks are stored.

```ruby
config.appearance = {
  persistence: :cookie # :cookie | :database
}
```

| Value       | Behavior                                                                |
| ----------- | ----------------------------------------------------------------------- |
| `:cookie`   | Persisted in a cookie scoped to the Avo mount point (default)           |
| `:database` | Persisted via `load_settings`/`save_settings` blocks (see below)        |

- **Type:** Symbol — `:cookie` or `:database`
- **Default:** `:cookie`

</Option>

<Option name="`load_settings`">

Block that returns the current user's saved appearance settings. Called on every page render in database persistence mode.

```ruby
load_settings: -> {
  current_user&.avo_preferences&.dig("appearance")&.symbolize_keys || {}
}
```

- **Type:** Proc / Lambda
- **Default:** `nil`
- **Context:** evaluated in a controller context — `current_user` and other controller helpers are available
- **Return:** a Hash with any subset of `:color_scheme`, `:neutral`, `:accent`. Missing keys fall back to the configured defaults.

</Option>

<Option name="`save_settings`">

Block called whenever the user picks a new scheme, neutral, or accent. Receives a `settings` local — a **partial** Hash containing only the keys the user just changed.

```ruby
save_settings: -> {
  next unless current_user

  current_user.update!(
    avo_preferences: current_user.avo_preferences.to_h.deep_merge(
      "appearance" => settings.stringify_keys
    )
  )
}
```

- **Type:** Proc / Lambda
- **Default:** `nil`
- **Context:** evaluated in a controller context — `current_user` and other controller helpers are available
- **Locals:** `settings` — partial Hash with whichever of `:color_scheme`, `:neutral`, `:accent` changed. It contains only the changed keys, so callers merge it into existing preferences rather than overwriting them.

You'll need a JSON or JSONB column on whichever model backs `current_user`:

```ruby
class AddAvoPreferencesToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :avo_preferences, :jsonb, default: {}
  end
end
```

</Option>

## Assets

<Option name="`logo`">

Path to the main logo shown in the top navbar.

```ruby
config.appearance = {
  logo: "my_company/logo.png"
}
```

- **Type:** String — asset path resolvable by the Rails asset pipeline
- **Default:** `"avo/logo.png"`

</Option>

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

<Option name="`logomark`">

Path to the compact, square logo used when the navbar collapses on smaller viewports.

```ruby
config.appearance = {
  logomark: "my_company/logomark.png"
}
```

- **Type:** String
- **Default:** `"avo/logomark.png"`

</Option>

<Option name="`logomark_dark`">

Path to the dark-mode variant of the compact logo. When omitted, `logomark` is used in both schemes.

```ruby
config.appearance = {
  logomark_dark: "my_company/logomark-dark.png"
}
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`favicon`">

Path to the favicon.

```ruby
config.appearance = {
  favicon: "my_company/favicon.ico"
}
```

- **Type:** String
- **Default:** `"avo/favicon.ico"`

</Option>

<Option name="`favicon_dark`">

Path to the dark-mode favicon variant.

```ruby
config.appearance = {
  favicon_dark: "my_company/favicon-dark.ico"
}
```

- **Type:** String
- **Default:** `"avo/favicon-dark.ico"`

</Option>

<Option name="`placeholder`">

Path to the image used when a record has no cover image (e.g. in the grid view).

```ruby
config.appearance = {
  placeholder: "my_company/placeholder.svg"
}
```

- **Type:** String
- **Default:** `"avo/placeholder.svg"`

</Option>

## Charts

<Option name="`chart_colors`">

Colors used in dashboard charts. Forwarded directly to Chart.js.

```ruby
config.appearance = {
  chart_colors: ["#0B8AE2", "#34C683", "#FFBE4F", "#FF7676", "#2AB1EE"]
}
```

- **Type:** Array of hex Strings
- **Default:** 10 built-in hex colors (`#0B8AE2`, `#34C683`, `#FFBE4F`, `#FF7676`, `#2AB1EE`, `#34C6A8`, `#EC8CFF`, `#80FF91`, `#FFFC38`, `#1BDBE8`)

:::warning
Chart colors must be hex values — `oklch(...)` and other CSS color forms are not accepted by Chart.js.
:::

</Option>
