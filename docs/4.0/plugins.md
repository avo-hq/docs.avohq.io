---
license: community
outline: [2, 3]
---

# Plugins

## Overview

Plugins are a way to extend the functionality of Avo.

### Light layer

Avo exposes a light layer for extending it: two boot/request hooks you can use to extend the Rails app, plus a few Avo APIs to add scripts and stylesheets.

## Register the plugin

The way we do it is through an initializer. We mostly use the `engine.rb` file to register the plugin.

```ruby{8-15}
# lib/avo/feed_view/engine.rb
module Avo
  module FeedView
    class Engine < ::Rails::Engine
      isolate_namespace Avo::FeedView

      initializer "avo-feed-view.init" do
        # Avo will run this hook on boot time
        ActiveSupport.on_load(:avo_boot) do
          # Register the plugin
          Avo.plugin_manager.register :feed_view

          # Register the mounting point
          Avo.plugin_manager.mount_engine Avo::FeedView::Engine, at: "/feed_view"
        end
      end
    end
  end
end
```

This will add the plugin to a list of plugins which Avo will run the hooks on.

## Hook into Avo

```ruby
module Avo
  module FeedView
    class Engine < ::Rails::Engine
      isolate_namespace Avo::FeedView

      initializer "avo-feed-view.init" do
        ActiveSupport.on_load(:avo_boot) do
          Avo.plugin_manager.register :feed_view

          # Add some concerns
          Avo::Resources::Base.include Avo::FeedView::Concerns::FeedViewConcern

          # Remove some concerns
          Avo::Resources::Base.included_modules.delete(Avo::Concerns::SOME_CONCERN)

          # Add asset files to be loaded by Avo
          # These assets will be added to Avo's `application.html.erb` layout file
          Avo.asset_manager.add_javascript "/avo-dashboards-assets/avo_dashboards"
          Avo.asset_manager.add_stylesheet "/avo-kanban-assets/avo_kanban"
        end

        ActiveSupport.on_load(:avo_init) do
          # Run some code on each request
          Avo::FeedView::Current.something = VALUE
        end
      end
    end
  end
end
```

## Hooks

<Option name="`avo_boot`">

The `avo_boot` hook is called when the parent Rails application boots up. This is where you can register your scripts and stylesheets and also add your functionality to Avo.

We use it heavily to add our own concerns to the `Avo::BaseResource` and `Avo::BaseController` classes and even extend the `Avo::ApplicationController` class.

</Option>

<Option name="`avo_init`">

The `avo_init` hook is called on every request done inside Avo. You can use this hook to attach some code to the `Avo::App.context` object or do other things.

:::info
We don't use it as much in our plugins as we do in the `avo_boot` hook.
:::

</Option>

## Registration API

Everything a plugin contributes is registered through `Avo.plugin_manager`, from inside the [`avo_boot`](#hooks) hook so it runs once on boot. The one exception is `register_configuration`, which has to run before the app's initializers — see [Let apps configure your plugin](#let-apps-configure-your-plugin).

<Option name="`register(name, priority: 10)`">

Adds the plugin to Avo's plugin list so its hooks run and other plugins can detect it. See [Register the plugin](#register-the-plugin) above. A lower `priority` runs earlier.

```ruby
Avo.plugin_manager.register :feed_view
```

</Option>

<Option name="`register_view_type(name, component:, icon:, active_icon:, translation_key: nil)`">

Registers a new index view type (alongside the built-in table/grid/map views). This one has its own guide with a full example — see [Custom view types](./custom-view-types).

</Option>

<Option name="`register_field(method_name, klass)`">

Registers a custom field type so apps can use it in their resources by the `method_name` you give it. Use this when your plugin *ships* a field type in a gem — it's the plugin-author counterpart to [Custom fields](./custom-fields), which covers defining a field inside your own app.

```ruby
# method_name is what apps call in their `fields` block: `field :price, as: :money`
Avo.plugin_manager.register_field :money, Avo::MoneyField::Fields::MoneyField
```

</Option>

<Option name="`register_menu_item(name, &block)`">

Registers a custom menu DSL method that apps can then call inside `config.main_menu` / `config.profile_menu`. The block is evaluated in the menu builder's context, so it can call `link`, `resource`, `section`, and the other [menu builder](./menu-editor) methods.

This delegates to the `avo-menu` package; it's a no-op when that isn't installed, so you can register unconditionally.

```ruby
Avo.plugin_manager.register_menu_item :feed do
  link "Feed", path: "/avo/feed"
end
```

</Option>

<Option name="`register_configuration(name, klass)`">

Adds a `config.<name>` namespace to `Avo::Configuration`, backed by an instance of `klass`, so apps configure your plugin from their own `config/initializers/avo.rb`. See [Let apps configure your plugin](#let-apps-configure-your-plugin) for the full pattern.

```ruby
Avo.plugin_manager.register_configuration :feed_view, Avo::FeedView::Configuration
```

Unlike the rest of this API, it must run *before* the app's initializers — from an engine initializer ordered `before: :load_config_initializers`, not from the `avo_boot` hook.

</Option>

<Option name="`installed?(name)`">

Returns whether a plugin registered under `name` is present. Use it to make your plugin adapt to what else is installed.

```ruby
if Avo.plugin_manager.installed?(:avo_menu)
  # wire up menu integration
end
```

</Option>

<Option name="`mount_engine(klass, at:)`">

Mounts your engine's routes inside Avo at the given path. See the [Register the plugin](#register-the-plugin) example above.

```ruby
Avo.plugin_manager.mount_engine Avo::FeedView::Engine, at: "/feed_view"
```

</Option>

## Let apps configure your plugin

Register a configuration namespace and your plugin's settings live on Avo's own configuration object, so an app configures it from the same `config/initializers/avo.rb` it already uses for everything else — no second initializer, no extra constant to remember.

Start with a plain configuration class. It's yours, so it can hold defaults, coerce values, or fall back to environment variables.

```ruby
# lib/avo/feed_view/configuration.rb
module Avo
  module FeedView
    class Configuration
      attr_accessor :items_per_page
      attr_writer :api_key

      def initialize
        @items_per_page = 25
      end

      # Falling back to an env var keeps deployments that never touch the
      # initializer working.
      def api_key
        @api_key || ENV["AVO_FEED_VIEW_API_KEY"]
      end
    end
  end
end
```

Register it under a namespace from an engine initializer:

```ruby
# lib/avo/feed_view/engine.rb
module Avo
  module FeedView
    class Engine < ::Rails::Engine
      isolate_namespace Avo::FeedView

      initializer "avo-feed-view.register_configuration", before: :load_config_initializers do
        Avo.plugin_manager.register_configuration :feed_view, Avo::FeedView::Configuration
      end
    end
  end
end
```

Apps now set your options alongside Avo's:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.feed_view.items_per_page = 50
end
```

And your plugin reads them back off `Avo.configuration`:

```ruby
Avo.configuration.feed_view.items_per_page # => 50
```

:::warning
Register the configuration from an engine initializer ordered `before: :load_config_initializers` (or at require time) — **not** from the `avo_boot` hook. The app's `config/initializers/avo.rb` reads the accessor while initializers run, which is before Avo boots, so registering any later blows up in the app's own initializer.
:::

Namespaces are exclusive. `register_configuration` raises an `ArgumentError` if the name collides with a method `Avo::Configuration` already defines, or with a namespace another plugin took first. Re-registering the same name with the same class is fine, so a boot that happens more than once is harmless.

Instances are memoized per configuration object, which means replacing `Avo.configuration` resets your plugin's config along with everything else — useful when you need a clean slate in tests.

## Add asset files

Plugins load their own JavaScript and CSS through Avo's [`AssetManager`](./asset-manager.html), which injects them into the `<head>` of Avo's layout. It exposes `add_javascript`, `add_stylesheet`, and `register_stimulus_controller` — see the [Asset manager](./asset-manager.html) guide for details.

## Using a middleware to surface asset files

One tricky thing to do with Rails Engines is to expose some asset files to the parent Rails app.
The way we do it is by using a middleware that will serve the files from the Engine's `app/assets/builds` directory.

So `app/assets/builds/feed_view.js` from the `feed_view` engine will be served by the parent Rails app at `/feed-view-assets/feed_view.js` with the following middleware added to your `engine.rb` file.

```ruby
module Avo
  module FeedView
    class Engine < ::Rails::Engine
      isolate_namespace Avo::FeedView

      initializer "avo-feed-view.init" do
        ActiveSupport.on_load(:avo_boot) do
          Avo.plugin_manager.register :feed_view
        end
      end

      config.app_middleware.use(
        Rack::Static,
        urls: ["/feed-view-assets"], # 👈 This is the path where the files will be served
        root: root.join("app", "assets", "builds") # 👈 This is the path where the files are located
      )
    end
  end
end
```

:::info
Avo doesn't compile the assets in any way, but just adds them to the layout file. This means that the assets should be compiled and ready for the browser to use them.

We use [`jsbundling-rails`](https://github.com/rails/jsbundling-rails)  with `esbuild` to compile the assets before packaging them in the `gem` file.

Please check out [the scripts](https://github.com/avo-hq/avo/blob/main/package.json) we use.
:::

## Create your own plugin

We don't yet have a generator for that but what we do is to create a new Rails Engine and add the plugin to it.

1. Run `rails plugin new feed-view`
1. Add the plugin to the `engine.rb` file
1. Register the plugin to the `lib/avo/feed_view/engine.rb` file
1. Optionally add assets
1. Add the plugin to your app's `Gemfile` using the `path` option to test it out

For a full example of a plugin that registers a new index view type, see [Custom view types](./custom-view-types).
