# Routing

We stick to Rails defaults in terms of routing just to make working with Avo as straightforward as possible.

Avo's functionality is distributed across multiple gems, each encapsulating its own engine. By default, these engines are mounted under Avo's scope within your Rails application.

Each engine registers itself with Avo.

### Default Mounting Behavior

When the `mount_avo` method is invoked, Avo and all the associated engines are mounted at a common entry point. By default, this mounting point corresponds to `Avo.configuration.root_path`, but you can customize it using the `at` argument:

```ruby{4,7}
# config/routes.rb
Rails.application.routes.draw do
  # Mounts Avo at Avo.configuration.root_path
  mount_avo

  # Mounts Avo at `/custom_path` instead of the default
  mount_avo at: "custom_path"
end
```

If no custom path is specified, Avo is mounted at the default configuration root path.

## Mount Avo under a scope

In this example, we'll demonstrate how to add a `:locale` scope to your routes.

The `:locale` scope is just an example. If your objective is to implement a route scope for localization within Avo, there's a detailed recipe available. Check out [this guide](guides/multi-language-urls) for comprehensive instructions.

```ruby{4-6}
# config/routes.rb

Rails.application.routes.draw do
  scope ":locale" do
    mount_avo
  end
end
```


:::info
To guarantee that the `locale` scope is included in the `default_url_options`, you must explicitly add it to the Avo configuration.

Check [this documentation section](customization-api.html#default_url_options) for details on how to configure `default_url_options` setting.
:::

## Mount Avo under a nested path

You may need to mount Avo under a nested path, something like `/uk/admin`. In order to do that, you need to consider a few things.

1. Move the engine mount point below any route for custom tools.

```ruby{7,10}
# config/routes.rb
Rails.application.routes.draw do
  # other routes

  authenticate :user, ->(user) { user.is_admin? } do
    scope :uk do
      scope :admin do
        get "dashboard", to: "avo/tools#dashboard" # custom tool added before engine
      end

      mount_avo # engine mounted last
    end
  end
end
```

2. The `root_path` configuration should only be the last path segment.

```ruby
# 🚫 Don't add the scope to the root_path
Avo.configure do |config|
  config.root_path = "/uk/admin"
end

# ✅ Do this instead
Avo.configure do |config|
  config.root_path = "/admin"
end
```

3. Use full paths for other configurations.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.home_path = "/uk/admin/dashboard"

  config.set_initial_breadcrumbs do
    add_breadcrumb "Dashboard", "/uk/admin/dashboard"
  end
end
```

## Serve Avo from a custom `map` in `config.ru`

If you serve your Rails app under a prefix through a custom `map` block in `config.ru`, set `prefix_path` to that mapping's prefix so Avo generates correct paths.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.prefix_path = "/internal"
end
```

## Namespaced resource routes

A [namespaced resource](./resources.html#namespaced-resources) like `Avo::Resources::Galaxy::Planet` gets a slash-joined route path derived from its class name — `galaxy/planets` in this case. Avo generates and mounts these routes for you, so there's nothing to configure by hand.

## Add your own routes

You may want to add your own routes inside Avo so you can access different custom actions that you might have set in the Avo resource controllers.

You can do that in your app's `routes.rb` file by opening up the Avo routes block and append your own.

```ruby
# routes.rb
Rails.application.routes.draw do
  mount_avo

  # your other app routes
end

if defined? ::Avo
  Avo::Engine.routes.draw do
    # new route in new controller
    put "switch_accounts/:id", to: "switch_accounts#update", as: :switch_account

    scope :resources do
      # append a route to a resource controller
      get "courses/cities", to: "courses#cities"
    end
  end
end

# app/controllers/avo/switch_accounts_controller.rb
class Avo::SwitchAccountsController < Avo::ApplicationController
  def update
    session[:tenant_id] = params[:id]

    redirect_back fallback_location: root_path
  end
end
```
