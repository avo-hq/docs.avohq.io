# Upgrade guide

[[toc]]

## Upgrade from 2.10 to 2.11

### Avo uses the `locale` configuration from the initializer

In 2.11 a change was pushed so Avo uses the `locale` configuration option from the `avo.rb` initializer.

```ruby{2}
Avo.configure do |config|
  config.locale = :en # default is nil
end
```

So if you get locale-related crashes after an update make sure the locale is set to a valid locale or set it to `nil` if you want to fallback to what you have configured in your app.

### Change the `format` option in the date time and date fields

One of the features of the date time field is to show the value in the browser's time zone. We can't know that until we load the page, hence we are going to parse and format the date on the browser side.

Avo uses luxon to do that so you'll have to change the tokens to match. Use this list of tokens [here](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).

## Upgrade from 2.8 to 2.9

### Avo generates paths based on the resource name not the model name

We made this change so you get more predictable paths. You really shouldn't have to do anything. You will be affected only if you have hardcoded paths towards Avo.
For example, if you have a `SubscriptionResource` with `self.model_class = Pay::Subscription`, the resource path before was `/avo/resurces/pay_subscriptions` and now it's going to be `/avo/resurces/subscriptions`. the path will be build following the resource class, not the model class.

Get more information on [this ticket](https://github.com/avo-hq/avo/pull/953).

### Actions are visible on the Edit view

We changed the way we display [Actions](actions). Now they will be visible on the `Edit` view too. You my disable that using the `visible` option on each action.

```ruby
self.visible = -> (resource:, view:) { view.in?([:index, :show]) }
```

### Eject translation files

Before 2.9 [we were loading](https://github.com/avo-hq/avo/pull/960/files#diff-3d269fbd54784c3eeb51983191c4565230a00b86e352c58b493282c916a18018L20) the translation directory in the engine file so your translation files would get less important and wouldn't load for those languages we provided. We fixed that by removing Avo's directory

To fix this, eject the files we provide out of the box using `bin/rails generate avo:locales`.

## Upgrade from 2.7 to 2.8

### Pass the `resource` to the `show_field_wrapper` in custom fields

When we added the Stimulus JS integration we used the field wrappers to add the HTML attributes. The fields generator didn't pass the `resource` to the field wrapper so all fields generated before don't have it and you need to add it manually. `resource: @resource, ` to `show_field_wrapper`.

```erb{2,7}
<!-- Before -->
<%= show_field_wrapper field: @field, index: @index do %>
  <%= @field.value %>
<% end %>

<!-- After -->
<%= show_field_wrapper field: @field, resource: @resource, index: @index do %>
  <%= @field.value %>
<% end %>
```

### Changed the way the `ranges` option is processed

We no longer process the `ranges` option to cast integers as days. The `ranges` option is passed to the [`options_for_select`](https://apidock.com/rails/v5.2.3/ActionView/Helpers/FormOptionsHelper/options_for_select) helper, so it behaves more like a regular `select_tag`.

```ruby{6,13-23}
# Before
class UsersMetric < Avo::Dashboards::MetricCard
  self.id = 'users_metric'
  self.label = 'Users count'
  self.initial_range = 30
  self.ranges = [7, 30, 60, 365, 'TODAY', 'MTD', 'QTD', 'YTD', 'ALL']
end

# After
class UsersMetric < Avo::Dashboards::MetricCard
  self.id = 'users_metric'
  self.label = 'Users count'
  self.initial_range = 30
  self.ranges = {
    "7 days": 7,
    "30 days": 30,
    "60 days": 60,
    "365 days": 365,
    Today: "TODAY",
    "Month to date": "MTD",
    "Quarter to date": "QTD",
    "Year to date": "YTD",
    All: "ALL"
  }
end
```

## Upgrade from 2.5 to 2.6

### Change the way the cards run their queries

We made a change to the way you build your queries in cards. Instead of using the `query` block, you can use the query method.

The change should be straightforward and shouldn't really impact the logic of your card. You'll have access to all the same data as before.

```ruby{11-14,16-19}
class AmountRaised < Avo::Dashboards::MetricCard
  self.id = "amount_raised"
  self.label = "Amount raised"
  # self.description = "Some description"
  # self.cols = 1
  # self.initial_range = 30
  # self.prefix = ""
  # self.suffix = ""

  # Before
  query do
    result 9001
  end

  # Current
  def query
    result 9001
  end
end
```

## Upgrade from 2.4 to 2.5

### Change the way the scope is declared in associations

We changed how we add scopes to associations to make the API more flexible and extendable. You have to append `query.` to the scope.

Also, you now have access to a few more pieces of information inside that block. You can use the `parent`, which is the actual parent record (`User` in the example below) of that association.

```ruby{16,22}
# app/models/comment.rb
class Comment < ApplicationRecord
  belongs_to :user, optional: true

  scope :starts_with, -> (prefix) { where('LOWER(body) LIKE ?', "#{prefix}%") }
end

# app/models/user.rb
class User < ApplicationRecord
  has_many :comments
end

# app/avo/resources/user_resource.rb
class UserResource < Avo::BaseResource
  # Version before v2.5.0
  field :comments, as: :has_many, scope: -> { starts_with :a }
end

# app/avo/resources/user_resource.rb
class UserResource < Avo::BaseResource
  # Version after v2.5.0
  field :comments, as: :has_many, scope: -> { query.starts_with :a }
end
```

## Upgrade from 1.x to 2.0

### Update the gem

Run `bundle update avo` to update your gem. If you have a Pro license, follow [this guide](https://docs.avohq.io/2.0/licensing.html#upgrade-your-1-0-license-to-2-0) to update your license.

### Update your sidebar & profile partials

We changed some of the remaining partials to `view_component`s.

### View components

Renamed the following view components:

- `NavigationLinkComponent` to `SidebarItemComponent`.
- `NavigationHeadingComponent` to `SidebarHeadingComponent`.

### Translations

We added the following tags:

 - `avo.details`

Removed the following tags:

- `avo.resource_details`
- `avo.update_item`

### Controllers

Renamed `RelationsController` to `AssociationsController`
