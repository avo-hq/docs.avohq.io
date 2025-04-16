# Icons

Avo provides a collection of SVG icons organized into two directories: [`avo`](https://github.com/avo-hq/avo/tree/main/app/assets/svgs/avo) and [`heroicons`](https://github.com/avo-hq/avo/tree/main/app/assets/svgs/heroicons) ([check heroicons](https://heroicons.com/)). These icons are easily accessible using the [`svg` method](https://github.com/avo-hq/avo/blob/main/app/helpers/avo/application_helper.rb#L63).

To render an icon in your application, use the svg method. This method allows you to specify the icon's path and class.

Examples:
```ruby
# in a View Component
helpers.svg("avo/editor-strike")

# in a Rails helper
svg("heroicons/outline/magnifying-glass-circle", class: "block h-6 text-gray-600")
```

```erb
<%= svg 'avo/bell.svg', class: "h-4" %>
```

There are some places where Avo have custom DSL accepting the `icon` option. There you only need to specify the `icon`'s path (`avo/...` or `heroicons/...`). Behind the scenes Avo applies the [`svg` method](https://github.com/avo-hq/avo/blob/main/app/helpers/avo/application_helper.rb#L63).

## Avo icons

Avo uses a [set of custom icons](https://github.com/avo-hq/avo/tree/main/app/assets/svgs/avo) which you can use yourself with this notation: `avo/ICON_NAME`.

#### Example:

```erb
<%= svg "avo/bell.svg", class: "h-4" %>
```

## Using heroicons

Avo uses the delightful [`heroicons` library](https://heroicons.com/) which is kept up to date by the team.

Heroicons come in 4 variants `outline`, `solid`, `mini`, and `micro`.

You can use these icons with this notation: `heroicons/VARIANT/ICON_NAME`.
We usually use the `outline` variant.

#### Examples:


```erb
<%= svg "heroicons/outline/academic-cap.svg" %>

<%= svg "heroicons/mini/arrow-path-rounded-square.svg" %>
```
