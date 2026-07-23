---
license: pro
outline: [2, 3]
guide: ./appearance.html
prev:
  text: "Appearance"
  link: "./appearance.html"
next: false
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
- **Context:** evaluated in Avo's execution context with `current_user` available (plus `params`, `request`, `view_context`, `main_app`)
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
- **Context:** evaluated in Avo's execution context with `current_user` available (plus `params`, `request`, `view_context`, `main_app`)
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

Path to the main logo shown in the top navbar. The navbar has a dark background in both color schemes, so use a file that reads well on dark surfaces.

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

## CSS variables

These are CSS custom properties, not `config.appearance` keys — some colors and layout details aren't worth routing through Ruby. Override them in an ejected `:head` partial; see [Applying overrides](./appearance.html#applying-overrides) in the guide for the how-to and a full worked example.

### Layout

| Variable                          | Default                        | Description                                                                                                                                            |
| --------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--color-navbar-background`       | `var(--color-avo-neutral-900)` | Global source for the top navbar background. Kept for compatibility. For full navbar palette changes, prefer the scoped `.top-navbar` variables below. |
| `--navbar-notch-enabled`          | `true`                         | Whether the inverted corner arches under the navbar render. Set to `false` to hide them when the navbar and content share a background.                |
| `--navbar-notch-radius`           | `1rem`                         | Radius of the navbar arches that fill the content panel's top corners. Set to `0` to flatten them.                                                     |
| `--main-content-radius`           | `var(--navbar-notch-radius)`   | Radius of the main content panel's top corners. Defaults to the notch radius so the panel and the navbar arches stay aligned; override to differ.      |
| `--color-sidebar-background`      | `var(--color-background)`      | Global source for the sidebar background. Kept for compatibility. For full sidebar palette changes, prefer the scoped `.avo-sidebar` variables below.  |
| `--color-main-content-background` | `var(--color-primary)`         | Background of the main content panel and the breadcrumb bar, which blends into it. Defaults to the primary surface; resolves per-scheme.               |
| `--color-main-content-border`     | `var(--border-color)`          | Color of the border between the sidebar and the main content panel. Tracks the shared app border color by default; override to restyle just it.        |

### Top navbar

The top navbar exposes a scoped palette contract on `.top-navbar`. Override these variables on `.top-navbar` so the navbar can change without leaking those colors into dropdown panels, popovers, or the main content.

| Variable                                           | Default                          | Description                                                                                           |
| -------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `--top-navbar-background`                          | `var(--color-navbar-background)` | Background color of the top navbar.                                                                   |
| `--top-navbar-content`                             | `var(--color-avo-neutral-300)`   | Text and icon color for navbar links and icon buttons.                                                |
| `--top-navbar-content-hover`                       | `var(--color-avo-neutral-50)`    | Text and icon color for hovered navbar links and icon buttons.                                        |
| `--top-navbar-control-background`                  | `var(--color-avo-neutral-800)`   | Background for navbar controls such as search, picker trigger, and hovered sidebar toggle.            |
| `--top-navbar-control-background-hover`            | `var(--color-avo-neutral-700)`   | Hover background for navbar controls.                                                                 |
| `--top-navbar-control-border`                      | `var(--color-avo-neutral-700)`   | Border color for navbar controls.                                                                     |
| `--top-navbar-control-content`                     | `var(--color-avo-neutral-50)`    | Main text color inside navbar controls, such as the search input value.                               |
| `--top-navbar-control-muted`                       | `var(--color-avo-neutral-400)`   | Muted text and icon color inside navbar controls, such as placeholders and search icons.              |
| `--top-navbar-control-shortcut-background`         | `var(--color-avo-neutral-700)`   | Background for shortcut badges inside navbar controls.                                                |
| `--top-navbar-control-shortcut-border`             | `var(--color-avo-neutral-600)`   | Border color for shortcut badges inside navbar controls.                                              |
| `--top-navbar-control-shortcut-content`            | `var(--color-avo-neutral-200)`   | Text color for shortcut badges inside navbar controls.                                                |
| `--top-navbar-active-background`                   | `var(--color-avo-neutral-950)`   | Background for active inline appearance switcher buttons.                                             |
| `--top-navbar-active-content`                      | `var(--color-avo-neutral-50)`    | Text and icon color for active inline appearance switcher buttons.                                    |
| `--top-navbar-start-notch-align-with-main-content` | `false`                          | Set to `true` to move the start notch to the `.main-content` start edge for a different rounded look. |

:::info
`--navbar-notch-enabled` is a boolean (`true` / `false`), read via a CSS style query rather than a raw `display` value. On browsers without style-query support the arches simply stay visible.

`--top-navbar-start-notch-align-with-main-content` is also a boolean (`true` / `false`) read via a CSS style query. On browsers without style-query support, the start notch keeps its default viewport edge position.
:::

### Sidebar

The sidebar exposes a scoped palette contract on `.avo-sidebar`, mirroring the top navbar. Override these on `.avo-sidebar` to recolor the sidebar without affecting the rest of the app. The defaults keep the sidebar tied to Avo's semantic surface and text tokens, so they track the chosen scheme automatically.

| Variable                              | Default                                                                | Description                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `--sidebar-background`                | `var(--color-sidebar-background)`                                      | Sidebar background color.                                                        |
| `--sidebar-border`                    | `var(--color-tertiary)`                                                | Border between the sidebar and the rest of the layout (mobile/`lg` edge border). |
| `--sidebar-content`                   | `var(--color-content)`                                                 | Main text color for active links, profile title, and status link.                |
| `--sidebar-content-secondary`         | `var(--color-content-secondary)`                                       | Muted text color for section headers, idle links, subitems, and hints.           |
| `--sidebar-link-hover-background`     | `color-mix(in oklab, var(--color-secondary), var(--color-content) 2%)` | Background of a hovered sidebar link.                                            |
| `--sidebar-link-active-background`    | `color-mix(in oklab, var(--color-secondary), var(--color-content) 5%)` | Background of the active sidebar link and the submenu bar/L-shape indicators.    |
| `--sidebar-focus-background`          | `var(--color-primary)`                                                 | Background applied to focus-visible sidebar headers, groups, and links.          |
| `--sidebar-profile-avatar-background` | `linear-gradient(...)` over `var(--color-tertiary)`                    | Background of the profile avatar wrapper.                                        |
| `--sidebar-profile-avatar-border`     | `var(--color-tertiary)`                                                | Border around the profile avatar wrapper.                                        |
| `--sidebar-profile-avatar-content`    | `var(--color-foreground)`                                              | Color of the profile avatar initials.                                            |
| `--sidebar-status-border`             | `var(--border-color)`                                                  | Border for the sidebar status section and its link.                              |

### Table

The index table reads its row hover and selection backgrounds from two variables. Override them to recolor the affordances you see when hovering a row or selecting one via the row checkboxes. The defaults are derived from the primary surface mixed with a little content color, so they track the chosen scheme automatically.

| Variable                     | Default                                                               | Description                                                         |
| ---------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `--color-table-row-hover`    | `color-mix(in oklab, var(--color-primary), var(--color-content) 5%)`  | Background of a hovered table row, and of selected rows.            |
| `--color-table-row-selected` | `color-mix(in oklab, var(--color-primary), var(--color-content) 12%)` | Background used for the shift-range highlight while selecting rows. |

### Focus ring

Avo draws a single, unified focus ring on every keyboard-focused element via `:focus-visible`. Override these variables to restyle every focus ring at once instead of touching individual components.

| Variable                       | Default                                                       | Description                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--focus-outline`              | `var(--focus-outline-width) solid var(--focus-outline-color)` | Ready-to-use `outline` shorthand composed from the width and color below. This is the value applied to focused elements.                                             |
| `--focus-outline-color`        | `var(--color-info)`                                           | Color of the focus ring. Defaults to the `info` semantic color, so it resolves automatically per scheme (light/dark).                                                |
| `--focus-outline-width`        | `2px`                                                         | Thickness of the focus ring.                                                                                                                                         |
| `--focus-outline-offset`       | `1px`                                                         | Gap between the element and its focus ring, used in the common case where the ring is drawn outside the element's bounds.                                            |
| `--focus-outline-offset-inset` | `-2px`                                                        | Negative offset for elements that must draw the ring _inside_ their bounds (sidebar items, dropdowns, pagination, etc.) so it isn't clipped by an overflow boundary. |

:::info
The focus ring also reacts to user accessibility settings: it thickens and switches to `currentColor` under `prefers-contrast: more`, and uses the system `Highlight` color under Windows High Contrast Mode (`forced-colors: active`). Those overrides win over your custom values by design.
:::

### Motion speed

Avo keeps the timing of small UI motions on three shared "speed" knobs so animations and transitions stay consistent and can be tuned in one place. Components reference these via `var(--speed-*)` rather than hardcoding their own durations (for example, the key/value field's row add and remove animations use `--speed-moderate`).

| Variable           | Default | Description                                                                      |
| ------------------ | ------- | -------------------------------------------------------------------------------- |
| `--speed-fast`     | `90ms`  | Snappy state flips — color, opacity, and fill swaps that shouldn't feel delayed. |
| `--speed-moderate` | `150ms` | Motion that travels or transforms — scale, slide, and pop animations.            |
| `--speed-slow`     | `200ms` | Larger or more deliberate transitions — panels and overlays.                     |

:::info
Set `--speed-fast`, `--speed-moderate`, and `--speed-slow` to `0ms` to effectively disable Avo's motion globally. Avo already drops these animations automatically when the visitor's system requests `prefers-reduced-motion: reduce`.
:::
