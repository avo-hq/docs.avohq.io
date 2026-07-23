---
license: community
outline: [2, 3]
api_docs: ./appearance-api.html
---

# Appearance

<RefactoredFromBranding />

The `appearance` configuration controls Avo's visual identity — logos, favicons, color scheme, neutral and accent palettes, and chart colors. By default the picker is exposed in the top navbar so users can switch theme on the fly, but every dimension can be locked, restricted, or fully overridden.

Configure everything through `config.appearance` in `config/initializers/avo.rb`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.appearance = {
    logo: "my_company/logo.png",
    logomark: "my_company/logomark.png",
    favicon: "my_company/favicon.ico",
    neutral: :slate,
    accent: :blue
  }
end
```

When `config.appearance` is omitted entirely, Avo ships with sensible defaults — the Avo logo, the built-in neutral and accent palettes, and an auto color scheme that follows the user's system preference.

## Customize the logo

### Desktop logo

[`logo`](./appearance-api.html#logo) is the main logo shown in the top navbar.

```ruby
config.appearance = {
  logo: "my_company/logo.png"
}
```

:::info Dark navbar
The top navbar has a dark background in both light and dark mode, so `logo` is always displayed on a dark surface. Pick a file that reads well on dark backgrounds.
:::

### Dark mode logo

Provide [`logo_dark`](./appearance-api.html#logo_dark) to render a different file when the user is in dark mode. When omitted, the light logo is used in both schemes.

```ruby
config.appearance = {
  logo: "my_company/logo.png",
  logo_dark: "my_company/logo-dark.png"
}
```

### Mobile logomark

[`logomark`](./appearance-api.html#logomark) is a compact, square mark used when the navbar collapses on smaller viewports. It also accepts a [dark variant](./appearance-api.html#logomark_dark).

```ruby
config.appearance = {
  logomark: "my_company/logomark.png",
  logomark_dark: "my_company/logomark-dark.png"
}
```

### Favicon

Override the [`favicon`](./appearance-api.html#favicon) — and optionally provide a [dark variant](./appearance-api.html#favicon_dark).

```ruby
config.appearance = {
  favicon: "my_company/favicon.ico",
  favicon_dark: "my_company/favicon-dark.ico"
}
```

### Placeholder image

When a record has no cover image (e.g. in the grid view), Avo falls back to a [`placeholder`](./appearance-api.html#placeholder). You can override it.

```ruby
config.appearance = {
  placeholder: "my_company/placeholder.svg"
}
```

## Set the default color scheme

[`scheme`](./appearance-api.html#scheme) controls the default color mode.

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

Unless the scheme is locked (see [Locking choices](#locking-choices)), users can change it themselves from the navbar switcher.

## Choose a neutral palette

The neutral palette drives surfaces, borders, and chrome throughout the UI.

### Preset

Pass a symbol to [`neutral`](./appearance-api.html#neutral) to select one of the built-in neutrals.

```ruby
config.appearance = {
  neutral: :slate
}
```

| Preset     | Description                        |
| ---------- | ---------------------------------- |
| `:brand`   | Your custom palette (see below)    |
| `:slate`   | Cool blue-gray tones               |
| `:stone`   | Warm gray with a slight brown tint |
| `:gray`    | Pure neutral gray                  |
| `:zinc`    | Cool gray with a hint of blue      |
| `:neutral` | Perfectly balanced gray            |
| `:taupe`   | Warm gray with earthy undertones   |
| `:mauve`   | Gray with a subtle purple cast     |
| `:mist`    | Light, airy blue-gray              |
| `:olive`   | Gray with green-yellow undertones  |

:::warning Symbols only
`neutral:` must be a Symbol — passing a String or a Hash raises an `ArgumentError`. Use [`neutral_colors:`](./appearance-api.html#neutral_colors) for full-color overrides.
:::

### Custom neutral palette

To define your own brand neutral, pass `neutral_colors:` with all 12 shades. The same palette is applied in both light and dark mode.

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

Values are passed through verbatim. Any string a CSS custom property accepts works — `oklch(...)`, `#hex`, `rgb(...)`, `hsl(...)`, `var(...)`.

`neutral: :brand` then selects your custom palette by default. Users can still pick another preset unless you lock the choice.

## Choose an accent palette

The accent palette drives interactive emphasis — primary buttons, links, focus states, selected rows.

### Preset

Pass a symbol to [`accent`](./appearance-api.html#accent) to pick a built-in accent.

```ruby
config.appearance = {
  accent: :blue
}
```

Available accents: `:brand`, `:red`, `:orange`, `:amber`, `:yellow`, `:lime`, `:green`, `:emerald`, `:teal`, `:cyan`, `:sky`, `:blue`, `:indigo`, `:violet`, `:purple`, `:fuchsia`, `:pink`, `:rose`.

:::warning Symbols only
`accent:` must be a Symbol. Use [`accent_colors:`](./appearance-api.html#accent_colors) for full-color overrides.
:::

### Custom accent palette

To define your own brand accent, pass `accent_colors:` with all three tokens. The same palette is applied in both light and dark mode (matching how the built-in `.accent-theme-*` classes work).

- `color` — the main accent (button background, link color)
- `content` — subtle UI on the accent (hover surfaces, soft variants)
- `foreground` — text and icons rendered on top of the accent color

```ruby
config.appearance = {
  accent: :brand,
  accent_colors: {
    color:      "oklch(55% 0.2 280)",
    content:    "oklch(45% 0.2 280)",
    foreground: "oklch(99% 0 0)"
  }
}
```

`accent_colors` and `neutral_colors` are independent — set one, the other, both, or neither.

## Restricting picker options

By default, the navbar picker exposes the full list of presets. To trim it down, pass [`neutrals:`](./appearance-api.html#neutrals) and/or [`accents:`](./appearance-api.html#accents).

```ruby
config.appearance = {
  neutrals: %w[brand mist olive],
  accents: %w[brand red orange pink rose]
}
```

Only the listed entries appear in the picker. The default value (`neutral:` / `accent:`) should usually be one of them.

## Locking choices

By default, users can change the scheme, neutral, and accent themselves. To force one or more values and hide their switchers, list them in [`lock:`](./appearance-api.html#lock).

```ruby
config.appearance = {
  scheme: :light,
  neutral: :slate,
  accent: :blue,
  lock: [:scheme, :neutral, :accent] # any subset of these three
}
```

| Key in `lock:` | Effect                                                |
| -------------- | ----------------------------------------------------- |
| `:scheme`      | Hides the light/dark/auto switcher                    |
| `:neutral`     | Hides the neutral picker; forces the configured value |
| `:accent`      | Hides the accent picker; forces the configured value  |

A value not listed in `lock:` is treated as a **default** — users can override it.

## Persist picks across devices

User picks are persisted across page loads via the [`persistence`](./appearance-api.html#persistence) setting. By default they go into a cookie; for cross-device persistence, switch to the database.

### Cookie (default)

```ruby
config.appearance = {
  persistence: :cookie
}
```

No setup required. Picks are stored in a cookie scoped to the Avo mount point.

### Database

Switch to `:database` and provide [`load_settings`](./appearance-api.html#load_settings) and [`save_settings`](./appearance-api.html#save_settings) blocks. Both blocks run through Avo's execution context with `current_user` made available, so you can read and write per-user preferences. Request data is reachable through `params`, `request`, `view_context`, and `main_app` if you need it.

```ruby
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

#### How the blocks receive data

- `load_settings` should return a Hash with any subset of `:color_scheme`, `:neutral`, `:accent`. Missing keys fall back to the configured defaults.
- `save_settings` receives a `settings` local — a **partial** Hash containing only the keys the user just changed. Always merge into existing preferences rather than overwriting them.

#### Required schema

You'll need a JSON or JSONB column on whichever model backs `current_user`. A typical migration:

```ruby
class AddAvoPreferencesToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :avo_preferences, :jsonb, default: {}
  end
end
```

The column name is up to you — `load_settings` and `save_settings` just need to read and write the same place.

## Change the switcher layout

[`picker_layout`](./appearance-api.html#picker_layout) controls how the appearance switcher renders in the top navbar.

```ruby
config.appearance = {
  picker_layout: :inline # :inline (default) or :dropdown
}
```

| Value       | Behavior                                                                       |
| ----------- | ------------------------------------------------------------------------------ |
| `:inline`   | Renders inline on `lg` and up, auto-collapses to a dropdown on smaller screens |
| `:dropdown` | Always renders as a compact dropdown                                           |

## Customize chart colors

Customize the colors used in dashboard charts with [`chart_colors`](./appearance-api.html#chart_colors) — pass an array of hex values.

```ruby
config.appearance = {
  chart_colors: ["#0B8AE2", "#34C683", "#FFBE4F", "#FF7676", "#2AB1EE"]
}
```

:::warning
Chart colors are forwarded directly to Chart.js, so they must be hex values.
:::

## CSS customization

Some colors and layout details aren't set through `config.appearance` — it doesn't make sense to route them through Ruby. Instead, the top navbar palette, sidebar background, table row affordances, focus ring, motion speeds, and more are exposed as CSS custom properties you can override.

The full list of variables, with defaults and descriptions, lives in the [CSS variables reference](./appearance-api.html#css-variables). The rest of this section shows how to apply overrides.

### Applying overrides

[Eject](./eject-views.html#prepared-templates) the `:head` partial and add a `<style>` block in `app/views/avo/partials/_head.html.erb`. Avo renders that partial after its bundled stylesheets, so your variables take precedence.

```bash
bin/rails generate avo:eject --partial :head
```

```erb
<%# app/views/avo/partials/_head.html.erb - append in the file %>
<style>
  :root {
    --color-navbar-background: #1e3a5f;
    --navbar-notch-enabled: false;
    --navbar-notch-radius: 0;
    --color-sidebar-background: #f5f7fa;
    --color-main-content-background: #ffffff;
    --color-main-content-border: #d6dbe2;
    --color-table-row-hover: #eef4fb;
    --color-table-row-selected: #dbe5f0;
  }

  .top-navbar {
    --top-navbar-background: var(--color-navbar-background);
    --top-navbar-content: #dbeafe;
    --top-navbar-content-hover: #ffffff;
    --top-navbar-control-background: #16324f;
    --top-navbar-control-background-hover: #25476c;
    --top-navbar-control-border: #31597f;
    --top-navbar-control-content: #ffffff;
    --top-navbar-control-muted: #9fc1df;
    --top-navbar-control-shortcut-background: #25476c;
    --top-navbar-control-shortcut-border: #42698f;
    --top-navbar-control-shortcut-content: #dbeafe;
    --top-navbar-active-background: #071426;
    --top-navbar-active-content: #ffffff;
    --top-navbar-start-notch-align-with-main-content: true;
  }

  .avo-sidebar {
    --sidebar-background: #f5f7fa;
    --sidebar-border: #d6dbe2;
    --sidebar-content: #16324f;
    --sidebar-content-secondary: #5b7089;
    --sidebar-link-hover-background: #e8edf3;
    --sidebar-link-active-background: #dbe5f0;
    --sidebar-focus-background: #ffffff;
    --sidebar-profile-avatar-background: #ffffff;
    --sidebar-profile-avatar-border: #d6dbe2;
    --sidebar-profile-avatar-content: #16324f;
    --sidebar-status-border: #d6dbe2;
  }

  .dark {
    --color-navbar-background: #0b1a2b;
    --color-sidebar-background: #11161c;
    --color-main-content-background: #161b22;
    --color-main-content-border: #2a3441;
    --color-table-row-hover: #1b2531;
    --color-table-row-selected: #243140;
  }

  .dark .top-navbar {
    --top-navbar-control-background: #10243a;
    --top-navbar-control-background-hover: #183555;
    --top-navbar-control-border: #25476c;
    --top-navbar-active-background: #020617;
  }

  .dark .avo-sidebar {
    --sidebar-background: #11161c;
    --sidebar-border: #2a3441;
    --sidebar-link-hover-background: #1b2531;
    --sidebar-link-active-background: #243140;
    --sidebar-focus-background: #161b22;
  }
</style>
```

Set light-mode values on `:root` and dark-mode-specific values on `.dark` when you need them to differ.

## Full example

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.appearance = {
    # Assets
    logo: "my_company/logo.png",
    logo_dark: "my_company/logo-dark.png",
    logomark: "my_company/logomark.png",
    logomark_dark: "my_company/logomark-dark.png",
    favicon: "my_company/favicon.ico",
    favicon_dark: "my_company/favicon-dark.ico",
    placeholder: "my_company/placeholder.svg",

    # Theme defaults
    scheme: :auto,
    neutral: :slate,
    accent: :blue,

    # Picker restriction
    neutrals: %w[brand slate stone olive],
    accents:  %w[brand blue indigo violet],

    # Lock what users can't change
    lock: [:scheme],

    # Switcher layout
    picker_layout: :inline,

    # Chart colors
    chart_colors: ["#0B8AE2", "#34C683", "#FFBE4F", "#FF7676"],

    # Cross-device persistence
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
end
```

## Options reference

| Option           | Type                     | Default                  | Description                                                 |
| ---------------- | ------------------------ | ------------------------ | ----------------------------------------------------------- |
| `scheme`         | `:auto` `:light` `:dark` | `:auto`                  | Default color scheme                                        |
| `neutral`        | Symbol                   | `nil`                    | Default neutral preset                                      |
| `accent`         | Symbol                   | `nil`                    | Default accent preset                                       |
| `neutral_colors` | Hash of 12 shades        | `nil`                    | Full 12-shade brand neutral override                        |
| `accent_colors`  | Hash of 3 tokens         | `nil`                    | Three-token brand accent override                           |
| `neutrals`       | Array of Strings         | All built-in presets     | Subset of neutrals exposed to the picker                    |
| `accents`        | Array of Strings         | All built-in presets     | Subset of accents exposed to the picker                     |
| `lock`           | Array of Symbols         | `[]`                     | Any of `:scheme`, `:neutral`, `:accent`                     |
| `persistence`    | `:cookie` `:database`    | `:cookie`                | Where unlocked user picks are stored                        |
| `load_settings`  | Proc                     | `nil`                    | Block returning a Hash of saved settings (database mode)    |
| `save_settings`  | Proc                     | `nil`                    | Block called with a partial `settings` Hash (database mode) |
| `picker_layout`  | `:inline` `:dropdown`    | `:inline`                | Navbar switcher layout                                      |
| `logo`           | String                   | `"avo/logo.png"`         | Desktop logo path                                           |
| `logo_dark`      | String                   | `nil`                    | Desktop logo for dark mode                                  |
| `logomark`       | String                   | `"avo/logomark.png"`     | Compact logo path                                           |
| `logomark_dark`  | String                   | `nil`                    | Compact logo for dark mode                                  |
| `favicon`        | String                   | `"avo/favicon.ico"`      | Favicon path                                                |
| `favicon_dark`   | String                   | `"avo/favicon-dark.ico"` | Favicon for dark mode                                       |
| `placeholder`    | String                   | `"avo/placeholder.svg"`  | Missing image placeholder                                   |
| `chart_colors`   | Array of hex Strings     | 10 default colors        | Colors used in dashboard charts                             |
