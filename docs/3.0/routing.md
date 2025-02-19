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

Check [this documentation section](customization.html#default_url_options) for details on how to configure `default_url_options` setting.
:::

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
