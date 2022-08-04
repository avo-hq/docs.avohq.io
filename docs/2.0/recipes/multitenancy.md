# Use route-level multitenancy

[[toc]]

Multitenancy is not a far-fetched concept, and you might need it when you reach a certain level with your app. Avo is ready to handle that.

This guide will show you **one way** of achieving that, but if can be changed if you have different needs.

## Prepare the Current model

We will use Rails' [`Current`](https://api.rubyonrails.org/classes/ActiveSupport/CurrentAttributes.html) model to hold the account.

```ruby{3}
# app/models/current.rb
class Current < ActiveSupport::CurrentAttributes
  attribute :account
end
```

## Add middleware to catch the account param

We're trying to fetch the account number from the `params` and see if we have an account with that ID in this middleware. If so, store it in the `Current.account` model, where we can use it throughout the app.

```ruby{18,21,23,25}
## Multitenant Account Middleware
#
# Included in the Rails engine if enabled.
#
# Used for setting the Account by the first ID in the URL like Basecamp 3.
# This means we don't have to include the Account ID in every URL helper.
# From JumpstartRails AccountMiddleware

class AccountMiddleware
  def initialize(app)
    @app = app
  end

  # http://example.com/12345/projects
  def call(env)
    request = ActionDispatch::Request.new env
    # Fetch the account id from the path
    _, account_id, request_path = request.path.split("/", 3)

    # Check if the id is a number
    if /\d+/.match?(account_id)
      # See if that account is present in the database.
      if (account = Account.find_by(id: account_id))
        # If the account is present, set the Current.account to that
        Current.account = account
      else
        # If not, redirect to the root path
        return [302, {"Location" => "/"}, []]
      end

      request.script_name = "/#{account_id}"
      request.path_info = "/#{request_path}"
    end

    @app.call(request.env)
  end
end
```

## Update the custom tools routes

By default, when generating [custom tools](custom-tools), we're adding them to the parent app's routes. Because we're declaring them there, the link helpers don't hold the account id in the params.

```ruby{2-4}
Rails.application.routes.draw do
  scope :avo do
    get "custom_page", to: "avo/tools#custom_page"
  end

  devise_for :users

  # Your routes

  authenticate :user, -> user { user.admin? } do
    mount Avo::Engine => Avo.configuration.root_path
  end
end
```

To fix that, we need to move them as if they were added to Avo's routes.

```ruby{13-18}
# config/routes.rb
Rails.application.routes.draw do
  devise_for :users

  # Your routes

  authenticate :user, -> user { user.admin? } do
    mount Avo::Engine => Avo.configuration.root_path
  end
end

# Move Avo custom tools routes to Avo engine
if defined? ::Avo
  Avo::Engine.routes.draw do
    # make sure you don't add the `avo/` prefix to the controller below
    get 'custom_page', to: "tools#custom_page"
  end
end
```

```ruby
# app/controllers/avo/tools_controller.rb
class Avo::ToolsController < Avo::ApplicationController
  def custom_page
    @page_title = "Your custom page"

    add_breadcrumb "Your custom page"
  end
end
```

## Retrieve and use the account

Throughout your app you can use `Current.account` or if you add it to Avo's [`context`](customization.html#context) object and use it from there.

```ruby{8}
# config/initializers/avo.rb
Avo.configure do |config|
  config.set_context do
    {
      foo: 'bar',
      user: current_user,
      params: request.params,
      account: Current.account
    }
  end
end
```

Check out [this PR](https://github.com/avo-hq/avodemo/pull/4) for how to update an app to support multitenancy.
