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

## Why this matters

Without the prefix, Rails resolves helpers in the current context. Calling `posts_path` from inside Avo could fail (undefined method) or resolve to the wrong route if both Avo and your app define it. The `avo` and `main_app` proxies explicitly tell Rails which route set to use.

## Quick reference

| You want to link to… | Use this prefix |
| -------------------- | --------------- |
| Avo pages (resources, tools, dashboards, etc.) | `avo.` |
| Your main application routes | `main_app.` |

## Learn more

For the full picture on how Rails engines handle routing, see the [Rails Engines guide](https://guides.rubyonrails.org/engines.html#routes).
