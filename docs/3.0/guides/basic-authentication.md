# Add Avo behind Basic Authentication

Because in Rails we commonly do that using a static function on the controller we need to [safely extend the controller](https://avohq.io/blog/safely-extend-a-ruby-on-rails-controller) to contain that function.

<img src="/assets/img/guides/basic-auth/basic-auth.gif" alt="Add Avo behind Basic Authentication" height="648" />

In actuality we will end up with something that behaves like this:

```ruby{2}
class Avo::ApplicationController < ::ActionController::Base
  http_basic_authenticate_with name: "adrian", password: "password"

  # More methods here
end
```

## Safely add it to Avo

We described the process in depth in [this article](https://avohq.io/blog/safely-extend-a-ruby-on-rails-controller) so let's get down to business.

1. Add the `BasicAuth` concern
1. The concern will prepend the basic auth method
1. `include` that concern to Avo's `ApplicationController`

:::warning
Ensure you restart the server after you extend the controller in this way.
:::

```ruby{8,20}
# app/controllers/concerns/basic_auth.rb
module BasicAuth
  extend ActiveSupport::Concern

  # Aiuthentication strategy came from this article
  # https://dev.to/kevinluo201/setup-a-basic-authentication-in-rails-with-http-authentication-388e
  included do
    http_basic_authenticate_with name: "adrian", password: "password"
  end
end

# config/initializers/avo.rb
Avo.configure do |config|
  # Avo configuration
end

# Add this to include it to Avo's ApplicationController
Rails.configuration.to_prepare do
  # Add basic authentication to Avo
  Avo::ApplicationController.include BasicAuth
end
```
