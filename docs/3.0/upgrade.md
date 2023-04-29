# Upgrade guide

:::warning
The 2.x to 3.0 Upgrade is a work in progress. We'll add more instructions here after each release.
:::

## Upgrade from 2.x to 3.0.pre.1

### Readonly and disabled swap

We noticed that readonly and disabled concepts was swapped. That's fixed now, you should swap `disabled` and `readonly` options of your fields.

### Moved some globals to Avo::Current
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

:::option Use the `AvoDashboards` module
Because we moved some pieces of functionality to their own gems, all the `Avo::Dashboards` classes moved to `AvoDashboards`

### Actions to take

Rename `Avo::Dashboards` to `AvoDashboards`

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

<!-- :::option Swap `disabled` and `readonly` field options

We received some feedback in v2.x that the `disabled` field option does not protect against DOM field manipulation when the form is suubmitted, so we introduced the `readonly` option that protects against that.

After a short [research](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly) we soon found out that HTML does it the other way around. `disabled` protects against that and `readonly` doesn't.
So, we are switching them to better comply with the standards.
::: -->
