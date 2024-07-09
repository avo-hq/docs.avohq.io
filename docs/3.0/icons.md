# Icons

Avo provides a collection of SVG icons organized into two directories: [`avo`](https://github.com/avo-hq/avo/tree/feature/allow_actions_to_render_turbo_streams/app/assets/svgs/avo) and [`heroicons`](https://github.com/avo-hq/avo/tree/feature/allow_actions_to_render_turbo_streams/app/assets/svgs/heroicons) ([check heroicons](https://heroicons.com/)). These icons are easily accessible using the [`svg` method](https://github.com/avo-hq/avo/blob/feature/allow_actions_to_render_turbo_streams/app/helpers/avo/application_helper.rb#L63).

To render an icon in your application, use the svg method. This method allows you to specify the icon's path and class.

Examples:
```ruby
helpers.svg("avo/editor-strike")
```
```ruby
helpers.svg("heroicons/outline/magnifying-glass-circle", class: "block h-6 text-gray-600")
```

There are some places where Avo have custom DSL accepting the `icon` option. There you only need to specify the `icon`'s path (`avo/...` or `heroicons/...`). Behind the scenes Avo applies the [`svg` method](https://github.com/avo-hq/avo/blob/feature/allow_actions_to_render_turbo_streams/app/helpers/avo/application_helper.rb#L63).
