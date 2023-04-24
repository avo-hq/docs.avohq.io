# Upgrade guide

:::warning
The 2.x to 3.0 Upgrade is a work in progress
:::

## Upgrade from 2.x to 3.0

### Moved some globals to Avo::Current

Rename the follwing
- `Avo::App.context`      -> `Avo::Current.context`
- `Avo::App.current_user` -> `Avo::Current.current_user`
- `Avo::App.params`       -> `Avo::Current.params`
- `Avo::App.request`      -> `Avo::Current.request`
- `Avo::App.view_context` -> `Avo::Current.view_context`
- `Avo::Dashboards` -> `AvoDashboards`

- [  ] reverse disabled and readonly

## Rename Avo classes

We are falling more in line with how Rails and zeitwerk autoloads classes. We do this to avoidsome issues like class conflicts and difficult to remember naming schemes.

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
class ExportAction < Avo::BaseResource
end

# After
# /app/avo/actions/export.rb
class Avo::Actions::Export < Avo::BaseResource
end
```

```ruby [Filters]
# Before
# /app/avo/filters/name_filter.rb
class NameFilter < Avo::BaseResource
end

# After
# /app/avo/filters/name.rb
class Avo::Filters::Name < Avo::BaseResource
end
```

```ruby [Dashboards]
# Before
# /app/avo/dashboards/sales_dashboard.rb
class SalesDashboard < Avo::BaseResource
end

# After
# /app/avo/dashboards/sales.rb
class Avo::Dashboards::Sales < Avo::BaseResource
end
```

```ruby [Cards]
# Before
# /app/avo/cards/users_count_card.rb
class UsersCountCard < Avo::BaseResource
end

# After
# /app/avo/cards/users_count.rb
class Avo::Cards::UsersCount < Avo::BaseResource
end
```

```ruby [Resource tools]
# Before
# /app/avo/resource_tools/comments_resource_tool.rb
class CommentsResourceTool < Avo::BaseResource
end

# After
# /app/avo/resource_tools/comments.rb
class Avo::ResourceTools::Comments < Avo::BaseResource
end
```
:::

To think
