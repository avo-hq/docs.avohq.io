# Icons

You can use SVG icons from one of the three provided [libraries](#libraries) or your own.

## How to use

These icons are easily accessible using the [`svg` method](https://github.com/avo-hq/avo-icons/blob/main/lib/avo/icons/helpers.rb#L11).
To render an icon in your application, use the svg method. This method allows you to specify the icon's path and class.

Examples:

```ruby
# in a View Component
helpers.svg("avo/editor-strike")

# in a Rails helper
svg("heroicons/outline/magnifying-glass-circle", class: "block h-6 text-gray-600")
```

```erb
# In an erb file
<%= svg 'avo/bell.svg', class: "h-4" %>
```

There are some places where Avo have custom DSL accepting the `icon` option.
In those cases you only need to specify the `icon`'s path (`avo/avocado`, `tabler/outline/bell`, or `heroicons/micro/device-phone-mobile`).
Avo applies the [`svg` method](https://github.com/avo-hq/avo-icons/blob/main/lib/avo/icons/helpers.rb#L11) behind the scenes.

```ruby
self.row_controls = -> do
  action Avo::Actions::PublishPost, label: "Publish", icon: "tabler/outline/book-upload"
end
```

## Libraries

### 1. The Avo icons

Located in the [`avo`](https://github.com/avo-hq/avo/tree/main/app/assets/svgs/avo) directory.
Use them with this notation: `avo/ICON_NAME`.

These are the custom icons that Avo uses throughout the app and don't come from any of the two supported libraries.

:::warning
These icons are considered private API. We may remove or change them without notice. Use at your own risk.
:::

```erb
<%= svg "avo/avocado.svg", class: "h-4" %>
```

### 2. Tabler

[Tabler](https://tabler.io/icons) is considered the official icon library for Avo. It's huge, modern and well maintained.

The icons are provided by the [`avo-icons`](https://github.com/avo-hq/avo-icons) gem.
You can use these icons with this notation: `tabler/ICON_NAME`.

#### Example:

```erb
<%= svg "tabler/outline/bell.svg", class: "h-4" %>
```

### 3. Heroicons

Up to version 4 we used to consider [`heroicons`](https://heroicons.com/) the official icon library for Avo. While we still love it, it's quite limited and we've outgrown it.
We'll continue to support it but we recommend you to use Tabler icons instead.

The heroicons are provided by the [`avo-icons`](https://github.com/avo-hq/avo-icons) gem.

Heroicons come in 4 variants `outline`, `solid`, `mini`, and `micro`.

You can use these icons with this notation: `heroicons/VARIANT/ICON_NAME`.
We usually use the `outline` variant.

#### Examples:

```erb
<%= svg "heroicons/outline/academic-cap.svg" %>

<%= svg "heroicons/mini/arrow-path-rounded-square.svg" %>
```

## Use your own icons

You can use your own icons by placing them in the `app/assets/svgs` directory and then calling the `svg` method with the path to the icon.

```ruby
# app/assets/svgs/cat.svg
svg "cat.svg", class: "h-4"

# app/assets/svgs/my-icons/cat.svg
svg "my-icons/cat.svg", class: "h-4"

```
