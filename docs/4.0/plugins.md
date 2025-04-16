---
betaStatus: Beta
---

# Plugins

:::warning
This feature is in beta and we might change the API as we develop it.

These docs are in beta too, so please [ask for more information](https://github.com/avo-hq/avo/discussions) when you need it.
:::

## Overview

Plugins are a way to extend the functionality of Avo.

### Light layer

We are in the early days of the plugin system and we're still figuring out the best way to do it. This is why we have a light layer that you can use to extend the functionality of Avo.

This means we provide two hooks that you can use to extend the functionality of the Rails app, and a few Avo APIs to add scrips and stylesheets.

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
          Avo.asset_manager.add_javascript "/avo-advanced-assets/avo_advanced"
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

## Avo `AssetManager`

We use the `AssetManager` to add our own asset files (JavaScript and CSS) to be loaded by Avo. They will be added in the `<head>` section of Avo's layout file.

It has two methods:

<Option name="`add_javascript`">

```ruby
Avo.asset_manager.add_javascript "/avo-kanban-assets/avo_kanban"
```

This snippet will add the `/avo-kanban-assets/avo_kanban.js` file to the `<head>` section of Avo's layout file.

</Option>

<Option name="`add_stylesheet`">

```ruby
Avo.asset_manager.add_stylesheet "/avo-kanban-assets/avo_kanban"
```

This snippet will add the `/avo-kanban-assets/avo_kanban.css` file to the `<head>` section of Avo's layout file.

</Option>

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
