# Upgrade guide

:::warning
The 2.x to 3.0 Upgrade is a work in progress. We'll add more instructions here after each release.
:::

## Upgrade from 2.x to 3.0.pre.1

:::option Ensure you meet the requirements
Avo now requires Ruby 3.0 and Rails 6.1.
:::

## Use the "automatic" upgrade tool

:::danger The upgrade tool

 - is experimental
 - doesn't cover all the required paces
 - might produce unwanted artifacts

**Back-up your code before using the tool.**
:::

To use the upgrade tool add `gem 'avo_upgrade'` to your `Gemfile` and run `bundle install`.

```ruby
group :development do
  gem "avo_upgrade"
end
```

Next you should run the `bin/rails avo:upgrade:2_to_3` command and go throught the process.

Ideally, you'd run the command with a clean tree and then make the last adjustments manually. The command will tell you what those the last adjustments are that you have to do manually.

## Upgrade steps

Each paragraph will guide you through the upgrade process for each individual change.

:::option Update your `Gemfile`
Add the gems to your `Gemfile`

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
:::

:::option Moved some globals from `Avo::App` to `Avo::Current`

We'll probably change these in the stable release.

### Actions to take

Rename the following:

- `Avo::App.context`      -> `Avo::Current.context`
- `Avo::App.current_user` -> `Avo::Current.current_user`
- `Avo::App.params`       -> `Avo::Current.params`
- `Avo::App.request`      -> `Avo::Current.request`
- `Avo::App.view_context` -> `Avo::Current.view_context`
:::

:::option Renamed `model` to `record`

The `model` naming is a bit off. You never know if you're mentioning the model class or the instantiated database record, so we changed it to `record` (Pundit calls it a record too). One of the places you'll see it the most is when you reference it off of the `resource` (`resource.model`).

### Actions to take

Rename `resource.model` to `resource.record`.

You might have the `model` referenced in other places too. Try to replace it with `record`.
If you find it in other places, please send them our way so we can have a consistent API. Thank you!
:::

:::option Install the extra repos

We split Avo into a few repositories to make the base pacakge lighter, open source, and more manageable.

We'll have a better way to do this in stable.

### Actions to take

Add the following gems to your `Gemfile`.

```ruby
gem "avo"
gem "avo_pro"
gem "avo_advanced"
gem "avo_filters"
gem "avo_menu"
gem "avo_dashboards"
```
:::

::::option Rename Avo configuration classes

We are falling more in line with how Rails and zeitwerk autoloads classes. We do this to avoidsome issues like class conflicts and difficult to remember naming schemes.

The old naming scheme: `{NAME}{TYPE}` (`UserResource`)
The new naming scheme: `Avo::{TYPE}::Name` (`Avo::Resources::User`)

### Actions to take

Rename the following classes:

::: code-group

```ruby [Resources]
# Before
# /app/avo/resources/user_resource.rb
class UserResource < Avo::BaseResource
end

# After
# /app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
end
```

```ruby [Actions]
# Before
# /app/avo/actions/export_action.rb
class ExportAction < Avo::BaseAction
end

# After
# /app/avo/actions/export.rb
class Avo::Actions::Export < Avo::BaseAction
end
```

```ruby [Filters]
# Before
# /app/avo/filters/name_filter.rb
class NameFilter < Avo::BaseFilter
end

# After
# /app/avo/filters/name.rb
class Avo::Filters::Name < Avo::BaseFilter
end
```

```ruby [Dashboards]
# Before
# /app/avo/dashboards/sales_dashboard.rb
class SalesDashboard < Avo::BaseResource
end

# After
# /app/avo/dashboards/sales.rb
class Avo::Dashboards::Sales < AvoDashboards::BaseDashboard
end
```

```ruby [Cards]
# Before
# /app/avo/cards/users_count_card.rb
class UsersCountCard < Avo::MetricCard
end

# After
# /app/avo/cards/users_count.rb
class Avo::Cards::UsersCount < Avo::MetricCard
end
```

```ruby [Resource tools]
# Before
# /app/avo/resource_tools/comments_resource_tool.rb
class CommentsResourceTool < Avo::BaseResource
end

# After
# /app/avo/resource_tools/comments.rb
class Avo::ResourceTools::Comments < Avo::BaseResourceTool
end
```
:::
::::

:::option Use the `def fields` API
We are introducing a new API for declaring fields. This brings many improvements from easier maintenance, better control, better composition, and more.

```ruby
# Before
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  field :id, as: :id, filterable: true
  field :name, as: :text, sortable: true, show_on: :preview, filterable: true
  field :logo, as: :external_image, hide_on: :show, as_avatar: :rounded
  field :created_at, as: :date_time, filterable: true
end

# After
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, filterable: true
    field :name, as: :text, sortable: true, show_on: :preview, filterable: true
    field :logo, as: :external_image, hide_on: :show, as_avatar: :rounded do
      if record.url
        "//logo.clearbit.com/#{URI.parse(record.url).host}?size=180"
      end
    end
    field :created_at, as: :date_time, filterable: true
  end
end
```

This will enable us to provide request specific data to the field configuration like `current_user` and `params` and will enable you to have better composition.

```ruby
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  def admin_fields
    field :created_at, as: :date_time, filterable: true
  end

  def fields
    field :id, as: :id, filterable: true
    field :name, as: :text, sortable: true, show_on: :preview, filterable: true
    field :logo, as: :external_image, hide_on: :show, as_avatar: :rounded do
      if record.url
        "//logo.clearbit.com/#{URI.parse(record.url).host}?size=180"
      end
    end

    # request-time data
    if current_user.is_admin?
      # better composition
      admin_fields
    end
  end
end
```

### Actions to take

Wrap all field declarations in `resources` and `actions` in a `def fields` method.
:::

:::option `tool` is declared inside the `def fields` method
In Avo 3 you'll be able to insert resource tools in-between fields, tabs and panels, so now, the `tool`s must be called inside the `fields` method.

### Actions to take

```ruby{8,17}
# Before
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_resource: true, sortable: false
    field :email, as: :gravatar, link_to_resource: true, as_avatar: :circle, only_on: :index
  end

  tool Avo::ResourceTools::UserTool
end

# After
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_resource: true, sortable: false
    field :email, as: :gravatar, link_to_resource: true, as_avatar: :circle, only_on: :index

    tool Avo::ResourceTools::UserTool
  end
end

```
:::

:::option Use the `AvoDashboards` module
Because we moved some pieces of functionality to their own gems, all the `Avo::Dashboards` classes moved to `AvoDashboards`

### Actions to take

Rename `Avo::Dashboards` to `AvoDashboards`
:::

:::option Wrap all `card` definitions inside a `def cards`method
After the `def fields` refactor we did the same in dashboard files. Instead of declaring the cards in the class directly, you should do it in the `def cards` method.

```ruby{6-8,16-20}
# Before
class Avo::Dashboards::Dashy < AvoDashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  card Avo::Cards::ExampleMetric, visible: -> { true }
  card Avo::Cards::ExampleAreaChart
  card Avo::Cards::ExampleScatterChart
end

# After
class Avo::Dashboards::Dashy < AvoDashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  def cards
    card Avo::Cards::ExampleMetric, visible: -> { true }
    card Avo::Cards::ExampleAreaChart
    card Avo::Cards::ExampleScatterChart
  end
end
```
:::

:::option Remove block (lambda) arguments

All block arguments are removed from Avo. We did this in order to make blocks more consistent and to improve future compatibility. All the arguments that were previously available as arguments, are present inside the block.

We don't have a complete list of blocks but we'll try to give you a few examples:

 - Field options: `visible`, `readonly`, `disabled`, `format_using`, etc.
 - Resource options: `resolve_query_scope`, `search_query`, `find_record_method`, etc.
 - Actions, Dashboards, and Cards `self.visible`
 - anything that you are passing as a block should be without arguments

**We might have missed some, so please send them our way when you find more.** Thank you!

### Actions to take

Remove the arguments from blocks

```ruby
# Before
self.visible = ->(resource:) {}

# After
self.visible = -> {}

# Before
field :name, as: :text, default: ->(resource:) {something}, format_using: ->(value:) {}, visible: ->(resource:) {}

# After
field :name, as: :text, default: -> {something}, format_using: -> {}, visible: -> {}
```
:::

:::option Swap `disabled` and `readonly` field options

We received some feedback in v2.x that the `disabled` field option does not protect against DOM field manipulation when the form is submitted, so we introduced the `readonly` option that protects against that.

After a short [research](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly) we soon found out that HTML does it the other way around. `disabled` protects against that and `readonly` doesn't.
So, we are switching them to better comply with the standards.

:::

:::option Removed `index_text_align` option
Same behavior from `index_text_align` can be achieved using `html` option.

### Actions to take
Replace `index_text_align` with `html` option:

```ruby
# Before
field :users_required, as: :number, index_text_align: :right

# After
field :users_required, as: :number, html: {index: {wrapper: {classes: "text-right"}}}
```
:::

:::option Renamed `scope` to `query` in the `search_query` block
### Actions to take
Replace `scope.` with `query.` in `search_query` in every resource.

```ruby
# Before
self.search_query = -> do
  scope.order(created_at: :desc).ransack(id_eq: params[:q], m: "or").result(distinct: false)
end

# After
self.search_query = -> do
  query.order(created_at: :desc).ransack(id_eq: params[:q], m: "or").result(distinct: false)
end
```
:::

:::option Renamed `resolve_query_scope` to `index_query` in resources
The new method name `index_query` speaks more about what it does and the rest of the changes brings it more inline with the other APIs

### Actions to take

- rename `resolve_query_scope` to `index_query`
- remove the `(model_class:)` block argument
- rename `model_class` inside the block to `query`

```ruby
# Before
self.resolve_query_scope = ->(model_class:) do
  model_class.order(last_name: :asc)
end

# After
self.index_query = -> do
  query.order(last_name: :asc)
end
```
:::

:::option Removed `resolve_find_scope` in favor of `find_record_method`
The new `find_record_method` method works better as it enables you to use custom find matchers.

### Actions to take

- rename `resolve_query_scope` to `index_query`
- remove the `(model_class:, id:, params:)` block arguments
- rename `model_class` inside the block to `query`
- add the `.find` matcher

```ruby
# Before
self.resolve_find_scope = ->(model_class:) do
  model_class.friendly
end

# After
self.find_record_method = -> do
  query.friendly.find id
end
```
:::


