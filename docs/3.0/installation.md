---
prev: /3.0/
---

# Installation


## Requirements

- Ruby on Rails >= 6.1
- Ruby >= 3
- `api_only` set to `false`. More [here](./recipes/api-only-app).
- `propshaft` or `sprockets` gem
- Have the `secret_key_base` defined in  any of the following `ENV["SECRET_KEY_BASE"]`, `Rails.application.credentials.secret_key_base`, or `Rails.application.secrets.secret_key_base`

:::warning Zeitwerk autoloading is required.
When adding Avo to a Rails app that was previously a Rails 5 app you must ensure that it uses zeitwerk for autoloading and Rails 6.1 defaults.

```ruby
# config/application.rb
config.autoloader = :zeitwerk
config.load_defaults 6.1
```
:::

## Installing Avo
<!--
Use [this](https://railsbytes.com/public/templates/zyvsME) RailsBytes template for a one-liner install process.

`rails app:template LOCATION='https://avohq.io/app-template'`

**OR** -->

Take it step by step.

1. Add the Avo gems to the `Gemfile`

```ruby
source "https://#{ENV["AVO_GEM_TOKEN"]}@packager.fly.dev/avo-hq-beta/" do
  gem "avo", "3.0.0.pre3"
  gem "avo_pro"
  gem "avo_advanced"
  gem "avo_filters"
  gem "avo_menu"
  gem "avo_dashboards"
end
```

:::info
Please use [this guide](./gemfile-environment-variables.html) to find the best authentication strategy for your use-case.
:::

2. Run `bundle install`.
3. Run `bin/rails generate avo:install` to generate the initializer and add Avo to the `routes.rb` file.
4. [Generate an Avo Resource](resources)

:::info
This will mount the app under `/avo` path. Visit the link to see the result.
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

## Mount Avo to a subdomain

You can use the regular `host` constraint in the `routes.rb` file.

```ruby
constraint host: 'avo' do
  mount Avo::Engine, at: '/'
end
```

## Next steps

Please follow the next steps to ensure your app is secured and you have access to all the features you need.

1. Set up [authentication](authentication.html#customize-the-current-user-method) and tell Avo who is your `current_user`. This step is required for the authorization feature to work.
1. Set up [authorization](authorization). Don't let your data be exposed. Give users access to the data they need to see.
1. Set up [licensing](licensing).
