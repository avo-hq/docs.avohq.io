---
prev: /2.0/
---

# Installation


## Requirements

- Ruby on Rails >= 6.0
- Ruby >= 2.7
- `api_only` set to `false`. More [here](./recipes/api-only-app).

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

## Next steps

Please follow the next steps to ensure your app is secured and you have access to all the features you need.

1. Set up [authentication](authentication.html#customize-the-current-user-method) and tell Avo who is your `current_user`. This step is required for the authorization feature to work.
1. Set up [authorization](authorization). Don't let your data be exposed. Give users access to the data they need to see.
1. Set up [licensing](licensing).
