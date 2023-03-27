---
prev: /2.0/
---

# Installation


## Requirements

- Ruby on Rails >= 6.0
- Ruby >= 2.7
- `api_only` set to `false`. More [here](./recipes/api-only-app).
- `propshaft` or `sprockets` gem
- Have the `secret_key_base` defined in  any of the following `ENV["SECRET_KEY_BASE"]`, `Rails.application.credentials.secret_key_base`, or `Rails.application.secrets.secret_key_base`

:::warning Zeitwerk autoloading is required.
When adding Avo to a Rails app that was previously a Rails 5 app you must ensure that it uses zeitwerk for autoloading and Rails 6 defaults.
```ruby
# config/application.rb
config.autoloader = :zeitwerk
config.load_defaults 6.0
```

More on this [here](https://github.com/avo-hq/avo/issues/1096).
:::

## Installing Avo

Use [this](https://railsbytes.com/public/templates/zyvsME) RailsBytes template for a one-liner install process.

`rails app:template LOCATION='https://avohq.io/app-template'`

**OR**

Take it step by step.

1. Add `gem 'avo'` to your `Gemfile`
1. Run `bundle install`.
1. Run `bin/rails generate avo:install` to generate the initializer and add Avo to the `routes.rb` file.
1. [Generate an Avo Resource](resources)

:::info
This will mount the app under `/avo` path. Visit that link to see the result.
:::

## Install from GitHub

You may also install Avo from GitHub but when you do that you must compile the assets yourself. You do that using the `rake avo:build-assets` command.
When pushing to production, make sure you build the assets on deploy time using this task.

```ruby
# Rakefile
Rake::Task["assets:precompile"].enhance do
  Rake::Task["avo:build-assets"].execute
end
```

:::info
If you don't have the `assets:precompile` step in your deployment process, please adjust that with a different step you might have like `db:migrate`.
:::

## Next steps

Please follow the next steps to ensure your app is secured and you have access to all the features you need.

1. Set up [authentication](authentication.html#customize-the-current-user-method) and tell Avo who is your `current_user`. This step is required for the authorization feature to work.
1. Set up [authorization](authorization). Don't let your data be exposed. Give users access to the data they need to see.
1. Set up [licensing](licensing).
