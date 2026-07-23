# Rails engines and path helpers

When extending Avo or writing code that runs inside the Avo engine (e.g. custom tools, breadcrumbs, or controller overrides), you need to be aware of how Rails treats engines and their routes.

## The rule

Rails engines have **isolated routes**. When your code runs inside an engine, path helpers are resolved in that engine's context by default. To reference routes from another engine or the main application, you must use the appropriate routing proxy.

## Inside the Avo engine

When your code executes within Avo—for example in `Avo::ToolsController`, `Avo::ResourcesController`, or when configuring breadcrumbs in `avo.rb`—you're inside the Avo engine.

### Linking to Avo pages

Use the `avo` prefix for Avo's internal routes:

```ruby
avo.root_path
avo.resources_users_path
avo.custom_tool_path
avo.resource_path(resource: UserResource, record: @user)
```

### Linking to your main application

Use the `main_app` prefix for your application's routes:

```ruby
main_app.root_path
main_app.posts_path
main_app.user_path(@user)
```

### Linking to Avo add-ons

Avo isn't a single engine. Most add-ons ship their own engine with its own routes, mounted **inside** Avo's root path. Each one gets its own prefix, so a dashboard link is `avo_dashboards.dashboard_path`, not `avo.dashboard_path`.

| Add-on                               | Prefix                 | Mounted at                 | Example                                    |
| ------------------------------------ | ---------------------- | -------------------------- | ------------------------------------------ |
| Core                                 | `avo.`                 | `/avo`                     | `avo.resources_users_path`                 |
| [Dashboards](./dashboards)           | `avo_dashboards.`      | `/avo/dashboards`          | `avo_dashboards.dashboard_path(dashboard)` |
| [Kanban](./kanban-boards)            | `avo_kanban.`          | `/avo/boards`              | `avo_kanban.board_path(board)`             |
| [Collaboration](./collaboration)     | `avo_collaboration.`   | `/avo/collaboration`       | `avo_collaboration.entries_path`           |
| [Notifications](./notifications)     | `avo_notifications.`   | `/avo/notifications`       | `avo_notifications.notifications_path`     |
| [Dynamic filters](./dynamic-filters) | `avo_dynamic_filters.` | `/avo/avo-dynamic_filters` | `avo_dynamic_filters.fields_path`          |

The mount points are relative to your configured `root_path`. If you mounted Avo at `/admin`, dashboards live at `/admin/dashboards`.

:::warning
A prefix only exists when that gem is installed. Calling `avo_kanban.board_path` in an app without `avo-kanban` raises `NoMethodError`, so guard optional add-ons with `Avo.plugin_manager.installed?("avo-kanban")`.
:::

### Inside view components

ViewComponents don't have the routing proxies in scope directly — reach them through `helpers`:

```ruby
# In a ViewComponent
helpers.avo_dashboards.dashboard_path(dashboard)
helpers.avo.resources_users_path
helpers.main_app.posts_path
```

## Why this matters

Without the prefix, Rails resolves helpers in the current context. Calling `posts_path` from inside Avo could fail (undefined method) or resolve to the wrong route if both Avo and your app define it. The `avo` and `main_app` proxies explicitly tell Rails which route set to use.

## Quick reference

| You want to link to…                                       | Use this prefix                              |
| ---------------------------------------------------------- | -------------------------------------------- |
| Avo core pages (resources, tools, media library, etc.)     | `avo.`                                       |
| An Avo add-on's pages (dashboards, boards, notifications…) | that add-on's prefix, e.g. `avo_dashboards.` |
| Your main application routes                               | `main_app.`                                  |

Not sure which prefix an add-on uses? Run `rails routes` and look at the `Mounts` lines — each mounted engine is listed with the name you use as the prefix.

## Learn more

For the full picture on how Rails engines handle routing, see the [Rails Engines guide](https://guides.rubyonrails.org/engines.html#routes).
