---
prev: /3.0/
---

# Installation


## Requirements

- Ruby on Rails >= 6.1
- Ruby >= 3.1
- `api_only` set to `false`. More [here](./guides/api-only-app).
- `propshaft` or `sprockets` gem
- Have the `secret_key_base` defined in  any of the following `ENV["SECRET_KEY_BASE"]`, `Rails.application.credentials.secret_key_base`, or `Rails.application.secrets.secret_key_base`

:::warning Zeitwerk autoloading is required.
When adding Avo to a Rails app that was previously a Rails 5 app you must ensure that it uses zeitwerk for autoloading and Rails 6.1 or higher defaults.

```ruby
# config/application.rb
config.autoloader = :zeitwerk
config.load_defaults 6.1 # 6.1 or higher, depending on your rails version
```
:::

## Installing Avo

### 1. One-command install

Use [this](https://railsbytes.com/public/templates/zyvsME) app template for a one-liner install process.

Run this command which will run all the required steps to install Avo in your app.

```
bin/rails app:template LOCATION='https://avohq.io/app-template'
```

### 2. Manual, step by step.

1. Add the appropiate Avo gem to the `Gemfile`

<!-- @include: ./common/avo_in_gemfile.md-->

:::info
Please use [this guide](./gem-server-authentication.html) to find the best authentication strategy for your use-case.
:::

2. Run `bundle install`.
3. Run `bin/rails generate avo:install` to generate the initializer and add Avo to the `routes.rb` file.
4. [Generate an Avo Resource](resources)

:::info
This will mount the app under `/avo` path. Visit the link to see the result.
:::

### 3. In popular Rails starter kits

We have integrations with the most popular starter kits.

#### Bullet Train

Avo comes pre-installed in all new Bullet Train applications.

I you have a Bullet Train app and you'd like to add Avo, please user [this template](https://avohq.io/templates/bullet-train).

```ruby
bin/rails app:template LOCATION=https://v3.avohq.io/templates/bullet-train.template
```

#### Jumpstart Pro

To install Avo in a Jumpstart Pro app use [this template](https://avohq.io/templates/jumpstart-pro).

```ruby
bin/rails app:template LOCATION=https://v3.avohq.io/templates/jumpstart-pro.template
```

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
  mount_avo at: '/'
end
```

## Next steps

Please follow the next steps to ensure your app is secured and you have access to all the features you need.

1. Set up [authentication](authentication.html#customize-the-current-user-method) and tell Avo who is your `current_user`. This step is required for the authorization feature to work.
1. Set up [authorization](authorization). Don't let your data be exposed. Give users access to the data they need to see.
1. Set up [licensing](licensing).
