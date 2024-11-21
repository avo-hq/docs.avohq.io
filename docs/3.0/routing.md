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

<Option name="`Avo.mount_engines` helper">

In order to make mounting the engines easier we added the `Avo.mount_engines` helper which returns a block that can be run in any routing context.

```ruby
# The configuration above turns into
Avo::Engine.routes.draw do
  instance_exec(&Avo.mount_engines)

  # other routes
end
```
</Option>

Sometimes you might have more exotic use-cases so you'd like to customize those paths accordingly.

## Mount Avo under a scope

:::info
The `:locale` scope provided is just an example. If your objective is to implement a route scope for localization within Avo, there's a detailed recipe available (including this step). Check out [this guide](guides/localization-scope) for comprehensive instructions.

If your goal is adding another scope unrelated to localization, you're in the right place. This approach works for other types of scoped routing as well.
:::

In this example, we'll demonstrate how to add a `:locale` scope to your routes.

<!-- @include: ./common/mount_avo_under_locale_scope_common.md-->

:::info
To guarantee that the `locale` scope is included in the `default_url_options`, you must explicitly add it to the Avo configuration.

Check [this documentation section](customization.html#default_url_options) for details on how to configure `default_url_options` setting.
:::
