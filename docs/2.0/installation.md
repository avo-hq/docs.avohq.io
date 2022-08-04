---
prev: /1.0/
---

# Installation

[[toc]]


## Requirements

- Ruby on Rails >= 6.0
- Ruby >= 2.7

## Installing Avo

1. Add `gem 'avo'` to your `Gemfile`
1. Run `bundle install`.
1. Run `bin/rails generate avo:install` to generate the initializer and add Avo to the `routes.rb` file.
1. [Generate an Avo Resource](resources)

**OR**

Run this command inside your rails app.

`rails app:template LOCATION='https://avohq.io/app-template'`


## Next steps

Please follow the next steps to ensure your app is safely secured and you have access to all the features you need.

1. Set up [authentication](authentication.html#customize-the-current-user-method) and tell Avo who is your `current_user`. This step is required for the authorization feature to work.
1. Set up [authorization](authorization). Don't let your data be exposed. Give users access to the data they need to see.
1. Set up [licensing](licensing).
