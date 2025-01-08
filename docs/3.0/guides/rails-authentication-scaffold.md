# Authentication using Rails' scaffold

In essence, the [authentication scaffold](https://github.com/rails/rails/pull/52328) that Rails 8 comes with is custom authentication so we need to do a few things to ensure it's working properly with Avo.

## 1. Set the current user

The scaffold uses the `Current.user` thread-safe global to hold the current authenticated user so we need to tell Avo how to fetch them.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  # other pieces of configuration

  # tell Avo how to find the current authenticated user.
  config.current_user_method do
    Current.user
  end
end
```

## 2. Set the sign out link

The scaffold uses the `SessionsController` to sign out the user so the link should be `sessions_path`. We need to add that to Avo as well.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  # other pieces of configuration

  # tell Avo how to sign out the authenticated user.
  config.sign_out_path_name = :session_path
end
```

## 3. Ensure only authenticated users are allowed on Avo

Now, here comes the part which might seem unfamiliar but it's actually pretty standard.

The scaffold adds the `Authentication` concern to your `ApplicationController` which is great. We will add it to Avo's `ApplicationController` and also add the `before_action`, but instead of just appending it wil will prepend it so we can ensure it will be fired as soon as possible in the request lifecycle.

Since `require_authentication` runs in the Avo context, it's necessary to delegate the `new_session_path` to the `main_app` to ensure proper routing.

```ruby{4,5,8}
# app/controllers/avo/application_controller.rb
module Avo
  class ApplicationController < BaseApplicationController
    include Authentication
    delegate :new_session_path, to: :main_app

    # we are prepending the action to ensure it will be fired very early on in the request lifecycle
    prepend_before_action :require_authentication
  end
end
```

<!-- @include: ./../common/application_controller_eject_notice.md -->
