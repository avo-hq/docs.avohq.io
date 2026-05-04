---
license: pro
outline: [2, 3]
---

# Branding

Avo's branding feature lets you customize the look and feel of your admin panel — logos, colors, color scheme, and chart colors. It supports two modes: **static** (you choose the theme once) and **dynamic** (users can switch themes on the fly).

## Configuration

All branding options are configured through `config.branding` as a hash in your `config/initializers/avo.rb` file.

```ruby
Avo.configure do |config|
  config.branding = {
    logo: "my_company/logo.png",
    logomark: "my_company/logomark.png",
    favicon: "my_company/favicon.ico",
    neutral: :slate,
    accent: :blue
  }
end
```

## Logos

### Desktop logo

The `logo` option sets the main logo displayed in the sidebar on desktop screens.

```ruby
config.branding = {
  logo: "my_company/logo.png"
}
```

### Dark mode logo

Provide a `logo_dark` variant to display a different logo when the user is in dark mode.

```ruby
config.branding = {
  logo: "my_company/logo.png",
  logo_dark: "my_company/logo_dark.png"
}
```

### Mobile logomark

The `logomark` should be a square image used on smaller screens where the sidebar collapses.

```ruby
config.branding = {
  logomark: "my_company/logomark.png",
  logomark_dark: "my_company/logomark_dark.png"
}
```

### Favicon

Override the default favicon with your own `.ico` file. You can also provide a dark mode variant.

```ruby
config.branding = {
  favicon: "my_company/favicon.ico",
  favicon_dark: "my_company/favicon_dark.ico"
}
```

### Placeholder image

When a record doesn't have a cover image (e.g. in grid view), Avo shows a placeholder. You can customize it.

```ruby
config.branding = {
  placeholder: "my_company/placeholder.svg"
}
```

## Neutral theme

The neutral theme controls the base surface and border colors throughout the UI. You can set it using a predefined palette name or a custom color hash.

### Predefined palettes

Choose from one of the built-in neutral palettes:

```ruby
config.branding = {
  neutral: :slate
}
```

| Palette    | Description                           |
| ---------- | ------------------------------------- |
| `:slate`   | Cool blue-gray tones                  |
| `:stone`   | Warm gray with a slight brown tint    |
| `:gray`    | Pure neutral gray                     |
| `:zinc`    | Cool gray with a hint of blue         |
| `:neutral` | Perfectly balanced gray               |
| `:taupe`   | Warm gray with earthy undertones      |
| `:mauve`   | Gray with a subtle purple cast        |
| `:mist`    | Light, airy blue-gray                 |
| `:olive`   | Gray with green-yellow undertones     |

### Custom neutral colors

Pass a hash of shade values (using oklch or any CSS color format) for full control:

```ruby
config.branding = {
  neutral: {
    25 => "oklch(0.99 0.01 240)",
    50 => "oklch(0.97 0.01 240)",
    100 => "oklch(0.94 0.01 240)",
    200 => "oklch(0.88 0.02 240)",
    300 => "oklch(0.80 0.02 240)",
    400 => "oklch(0.68 0.02 240)",
    500 => "oklch(0.55 0.02 240)",
    600 => "oklch(0.45 0.02 240)",
    700 => "oklch(0.37 0.02 240)",
    800 => "oklch(0.27 0.02 240)",
    900 => "oklch(0.20 0.02 240)",
    950 => "oklch(0.14 0.02 240)"
  }
}
```

You can also provide separate light and dark scales:

```ruby
config.branding = {
  neutral: {
    light: {
      25 => "oklch(0.99 0.01 240)",
      50 => "oklch(0.97 0.01 240)",
      # ...
    },
    dark: {
      25 => "oklch(0.14 0.01 240)",
      50 => "oklch(0.18 0.01 240)",
      # ...
    }
  }
}
```

## Accent color

The accent color is used for interactive elements like buttons, links, and highlights. Like neutrals, you can use a predefined color or a custom hash.

### Predefined accent colors

```ruby
config.branding = {
  accent: :blue
}
```

Available accent colors: `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`.

### Custom accent colors

Provide three tokens — `color` (the main accent), `content` (text/icons on accent backgrounds), and `foreground` (alternative foreground):

```ruby
config.branding = {
  accent: {
    color: "oklch(0.6 0.2 260)",
    content: "oklch(0.9 0.05 260)",
    foreground: "oklch(1.0 0 0)"
  }
}
```

With light/dark variants:

```ruby
config.branding = {
  accent: {
    light: {
      color: "oklch(0.6 0.2 260)",
      content: "oklch(0.9 0.05 260)",
      foreground: "oklch(1.0 0 0)"
    },
    dark: {
      color: "oklch(0.7 0.2 260)",
      content: "oklch(0.3 0.05 260)",
      foreground: "oklch(0.1 0 0)"
    }
  }
}
```

## Color scheme

Set the color scheme with `scheme`:

```ruby
config.branding = {
  scheme: :auto # :auto | :light | :dark
}
```

| Value    | Behavior                                                     |
| -------- | ------------------------------------------------------------ |
| `:auto`  | Follows the user's system preference (default)               |
| `:light` | Always starts in light mode                                  |
| `:dark`  | Always starts in dark mode                                   |

Users can always toggle between light, dark, and auto using the color scheme switcher in the sidebar.

## Static vs. dynamic mode

### Static mode (default)

In static mode, you lock the neutral theme and accent color in the initializer. Users can still switch between light/dark/auto, but they cannot change the color palette.

```ruby
config.branding = {
  mode: :static,
  neutral: :stone,
  accent: :emerald
}
```

### Dynamic mode

In dynamic mode, users get a theme picker in the sidebar that lets them choose their own neutral theme and accent color. Their preferences are persisted either in localStorage or in the database.

```ruby
config.branding = {
  mode: :dynamic
}
```

#### Persistence

By default, theme preferences are stored in the browser's localStorage. To persist them in the database instead (so preferences follow users across devices), configure the `persistence`, `load_settings`, and `save_settings` options:

```ruby
config.branding = {
  mode: :dynamic,
  persistence: :database, # [!code focus]
  load_settings: ->(current_user) { # [!code focus]
    current_user.theme_settings || {} # [!code focus]
  }, # [!code focus]
  save_settings: ->(settings:, current_user:) { # [!code focus]
    current_user.update!(theme_settings: settings) # [!code focus]
  } # [!code focus]
}
```

The `settings` hash contains up to three keys: `color_scheme` (light/dark/auto), `neutral` (theme name), and `accent` (accent color name).

:::info
When using database persistence, add a `theme_settings` JSON column (or similar) to your users table.
:::

## Chart colors

Customize the colors used in dashboard charts by passing an array of hex colors:

```ruby
config.branding = {
  chart_colors: ["#0B8AE2", "#34C683", "#FFBE4F", "#FF7676", "#2AB1EE"]
}
```

:::warning
Chart colors must be hex values. They are forwarded directly to Chart.js.
:::

## Full example

```ruby
Avo.configure do |config|
  config.branding = {
    # Logos
    logo: "my_company/logo.png",
    logo_dark: "my_company/logo_dark.png",
    logomark: "my_company/logomark.png",
    logomark_dark: "my_company/logomark_dark.png",
    favicon: "my_company/favicon.ico",
    placeholder: "my_company/placeholder.svg",

    # Theme
    mode: :dynamic,
    neutral: :slate,
    accent: :blue,
    scheme: :auto,

    # Chart colors
    chart_colors: ["#0B8AE2", "#34C683", "#FFBE4F", "#FF7676"],

    # Database persistence
    persistence: :database,
    load_settings: ->(current_user) {
      current_user.theme_settings || {}
    },
    save_settings: ->(settings:, current_user:) {
      current_user.update!(theme_settings: settings)
    }
  }
end
```

## Options reference

| Option           | Type                        | Default                 | Description                                          |
| ---------------- | --------------------------- | ----------------------- | ---------------------------------------------------- |
| `mode`           | `:static` `:dynamic`       | `:static`               | Whether users can switch themes                      |
| `scheme`         | `:auto` `:light` `:dark`   | `:auto`                 | Color scheme                                         |
| `neutral`        | Symbol or Hash              | `nil`                   | Neutral palette — predefined name or custom colors   |
| `accent`         | Symbol or Hash              | `nil`                   | Accent color — predefined name or custom tokens      |
| `persistence`    | `:localstorage` `:database` | `:localstorage`        | Where to store user theme preferences                |
| `logo`           | String                      | `"avo/logo.png"`        | Desktop logo path                                    |
| `logo_dark`      | String                      | `nil`                   | Desktop logo for dark mode                           |
| `logomark`       | String                      | `"avo/logomark.png"`    | Mobile logo path                                     |
| `logomark_dark`  | String                      | `nil`                   | Mobile logo for dark mode                            |
| `favicon`        | String                      | `"avo/favicon.ico"`     | Favicon path                                         |
| `favicon_dark`   | String                      | `nil`                   | Favicon for dark mode                                |
| `placeholder`    | String                      | `"avo/placeholder.svg"` | Missing image placeholder                            |
| `chart_colors`   | Array                       | 10 default hex colors   | Colors used in dashboard charts                      |
| `load_settings`  | Proc                        | `nil`                   | Lambda to load theme settings from database          |
| `save_settings`  | Proc                        | `nil`                   | Lambda to save theme settings to database            |
