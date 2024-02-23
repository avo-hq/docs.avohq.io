# Routing

We stick to Rails defaults in terms of routing just to make working with Avo as straighforward as possible.

## Avo's Engines

Avo's functionality is bundled in a few gems and most of them have their own engines. By default we mount the engines under Avo's routes using a configuration like this one.

```ruby
# Your app's routes.rb
Rails.application.routes.draw do
  mount Avo::Engine, at: Avo.configuration.root_path

  # other routes
end

# Avo's routes.rb
Avo::Engine.routes.draw do
  mount Avo::DynamicFilters::Engine, at: "/avo-dynamic_filters" if defined?(Avo::DynamicFilters::Engine)
  mount Avo::Dashboards::Engine, at: "/dashboards" if defined?(Avo::Dashboards::Engine)
  mount Avo::Pro::Engine, at: "/avo-pro" if defined?(Avo::Pro::Engine)

  # other routes
end
```

:::option `Avo.mount_engines` helper

In order to make mounting the engines easier we added the `Avo.mount_engines` helper which returns a block that can be run in any routing context.

```ruby
# The configuration above turns into
Avo::Engine.routes.draw do
  instance_exec(&Avo.mount_engines)

  # other routes
end
```
:::

Sometimes you might have more exotic use-cases so you'd like to customize those paths accordingly.

## Mount Avo under a `:locale` scope

Having a locale scope is a good way to set the locale for your users. Because of how Rails is mounting engines, that locale scope is not being applied to nested engines, so you'll need to nest them yourself.

```ruby
# This will work for Avo's routes but won't work for the nested engines.
Rails.application.routes.draw do
  scope ":locale" do
    mount Avo::Engine, at: Avo.configuration.root_path
  end
end
```

The fix here is to tell Avo not to mount the engines and have them mounted yourself.

::: code-group
```ruby [config/avo.rb]{3}
Avo.configure do |config|
  # Disable automatic engine mounting
  config.mount_avo_engines = false

  # other configuration
end
```

```ruby [config/routes.rb]{2-4,10-14}
Rails.application.routes.draw do
  scope ":locale" do
    mount Avo::Engine, at: Avo.configuration.root_path
  end

  # other routes
end

if defined? ::Avo
  Avo::Engine.routes.draw do
    scope ":locale" do
      instance_exec(&Avo.mount_engines)
    end
  end
end
```
:::
This will instruct Rails to add the locale scope to all Avo nested engines too.
