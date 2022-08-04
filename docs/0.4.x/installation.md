---
prev: /0.4.x/
---

# Installation

[[toc]]


## Requirements

- Ruby on Rails > 6.0
- Ruby > 2.6

## Installing Avo

1. Add `gem 'avo'` to your `Gemfile`
1. Run `bundle install`.
1. Run `bin/rails generate avo:install` to generate the initializer and add Avo to the `routes.rb` file.
1. [Generate an Avo Resource](resources)

## Authorization

You probably would not want to allow anyone access to Avo. If you're using [devise](https://github.com/heartcombo/devise) in your app, use this block to filter out requests to it in your `routes.rb` file.

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

### `authorize_with` method

Alternatively you can user the `authorize_with` config attribute. It takes a block and evaluates it in Avo's `ApplicationController` as a `before_action`.

```ruby
Avo.configure do |config|
  config.authenticate_with do
    authenticate_admin_user
  end
end
```

### Customize the `current_user` method

If you're not using [devise](https://github.com/heartcombo/devise) for authentication you may customize the `current_user` method to something else. The `current_user_method` key takes a block parameter (shorthand or full block).

```ruby
Avo.configure do |config|
  config.current_user_method(&:current_admin)
end
```

Using the block notation:

```ruby
Avo.configure do |config|
  config.current_user_method do
    current_admin
  end
end
```

### Adding the license key

After you purchase an Avo license add it to your `config/initializers/avo.rb` file along with changing the license type from `community` to `pro`.

```ruby{2-3}
Avo.configure do |config|
  config.license = 'pro'
  config.license_key = '************************' # or use ENV['AVO_LICENSE_KEY']
end
```