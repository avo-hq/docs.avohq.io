# Authentication

[[toc]]

## Customize the `current_user` method

By default, Avo will not assume your authentication provider (the `current_user` method returns `nil`). That means Avo won't be able to retrieve the current user. You have to tell it how to get it.

### Using devise

For [devise](https://github.com/heartcombo/devise), you should set it to `current_user`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_method = :current_user
end
```

### Use a different authenticator

If you're using some other authentication provider, you may customize the `current_user` method to something else.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_method = :current_admin
end
```

If you get the current user from some other object like `Current.user`, you may pass a block to the `current_user_method` key.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_method do
    Current.user
  end
end
```

## Customize the sign out link

The sign-out menu item on the bottom sidebar (when you click the three dots) can be customized using the `current_user_resource_name`. If you follow the `User` -> `current_user` convention, you might have a `destroy_current_user_session_path` that logs the user out.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_resource_name = :user
end
```

But if you have a different type of user, `current_admin`, you need a `destroy_current_admin_path`.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_resource_name = :admin
end
```

If your app does not respond to the destroy session path (`destroy_current_user_session_path`) the link will be hidden.

## Filter out requests

You probably do not want to allow Avo access to everybody. If you're using [devise](https://github.com/heartcombo/devise) in your app, use this block to filter out requests to it in your `routes.rb` file.

```ruby
authenticate :user do
  mount Avo::Engine => '/avo'
end
```

You may also add custom user validation such as `user.admin?` to only permit a subset of users to your Avo instance.

```ruby
authenticate :user, -> user { user.admin? } do
  mount Avo::Engine => '/avo'
end
```

Check out more examples of authentication on [sidekiq's authentication section](https://github.com/mperham/sidekiq/wiki/Monitoring#authentication).

## `authenticate_with` method

Alternatively you can user the `authenticate_with` config attribute. It takes a block and evaluates it in Avo's `ApplicationController` as a `before_action`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authenticate_with do
    authenticate_admin_user
  end
end
```

Note that Avo's `ApplicationController` does not inherit from your app's `ApplicationController`, so any protected methods you defined there would not work, and you would need to write out the authentication logic explicitly in the block. For example, if you store your `user_id` in the session hash, then you can do:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authenticate_with do
    redirect_to '/' unless session[:user_id] == 1 # hard code user ids here
  end
end
```

## Authorization

When you share access to Avo with your clients or large teams, you may want to restrict access to a resource or a subset of resources. To do that, you should set up your authorization rules (policies). Check out the [authorization page](authorization) for details on how to set that up.
