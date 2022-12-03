# Use Avo in an `api_only` Rails app

**After Avo version 2.9 👇**

The `api_mode` might not be supported. The reason for that is that Rails does not generate some paths for the [`resource` route helper](https://guides.rubyonrails.org/routing.html#resource-routing-the-rails-default). Most important being the `new` and `edit` paths. That's because APIs don't have the `new` path (they have the `create` path).

But you're probably safer using Rails with `api_only` disabled (`config.api_only = false`).

**Pre Avo version 2.9 👇**

You might have an api-only Rails app where you'd like to use Avo. In my early explorations I found that it needs the `::ActionDispatch::Flash` middleware for it to properly work.

So, add it in your `application.rb` file.

```ruby{18}
require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module RailApi
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true
    config.middleware.use ::ActionDispatch::Flash
  end
end
```
