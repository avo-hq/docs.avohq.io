Using a locale scope is an effective way to set the locale for your users.

### Only Avo engine

On the community plan, the only requirement is to wrap the Avo engine mount within the scope.

:::warning
This will work for Avo's engine routes but won't work for any of the nested engines.

If you're using `avo-pro`, `avo-advanced` or any other Avo engine check the next section.
:::

```ruby{4-6}
# config/routes.rb

Rails.application.routes.draw do
  scope ":locale" do
    mount Avo::Engine, at: Avo.configuration.root_path
  end
end
```

### Avo engine and nested engines

Because of how Rails is mounting engines, that locale scope is not being applied to nested engines like `avo-advanced`, `avo-pro`, etc.

The fix here is to tell Avo not to mount the engines and have them mounted yourself.

```ruby {5}
# config/avo.rb

Avo.configure do |config|
  # Disable automatic engine mounting
  config.mount_avo_engines = false
end
```

Once automatic engine mounting is disabled, the next step is to mount the Avo engine and its nested engines within the locale scope.

```ruby {4-6,9-15}
# config/routes.rb

Rails.application.routes.draw do
  scope ":locale" do
    mount Avo::Engine, at: Avo.configuration.root_path
  end
end

if defined? ::Avo
  Avo::Engine.routes.draw do
    scope "(:locale)" do # Take note of the parentheses
      instance_exec(&Avo.mount_engines)
    end
  end
end
```

:::warning
Take note of the parentheses around the `(:locale)` scope when mounting the engines. These parentheses are essential to ensure proper functionality.
:::

This will instruct Rails to add the locale scope to all Avo nested engines too.

:::info
To guarantee that the `locale` scope is included in the `default_url_options`, you must explicitly add it to the Avo configuration.

Check [this documentation section](./customization.html#default_url_options) for details on how to configure `default_url_options` setting.
:::
