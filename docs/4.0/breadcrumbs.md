---
license: community
outline: [2, 3]
---

# Breadcrumbs

Avo builds a breadcrumb trail for every resource view automatically, using each record's avatar or initials for context, so users always know where they are and can step back up the hierarchy.

<Image src="/assets/img/4_0/breadcrumbs/breadcrumbs.webp" dark-src="/assets/img/4_0/breadcrumbs/breadcrumbs-dark.webp" width="1112" height="208" alt="Breadcrumbs" />

Out of the box the trail starts with a **Home** crumb linking to Avo's root path, followed by the crumbs Avo generates for the current resource and view. You rarely need to configure anything — the two things you can do are change where the trail starts (`config.set_initial_breadcrumbs`) and add your own crumbs on custom pages (`add_breadcrumb`).

## Change the starting breadcrumb

Every trail begins with the crumbs returned by `config.set_initial_breadcrumbs`. By default that's a single **Home** crumb:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.set_initial_breadcrumbs do
    add_breadcrumb title: "Home", path: avo.root_path, icon: "tabler/outline/home"
  end
end
```

Override it to point somewhere else, add more than one starting crumb, or leave the block empty to start every trail with no initial breadcrumbs:

```ruby
# config/initializers/avo.rb
config.set_initial_breadcrumbs do
  add_breadcrumb title: "Home", path: avo.root_path, icon: "tabler/outline/home"
  add_breadcrumb title: "Team", path: avo.resources_teams_path
end
```

The block runs in the controller context, so you can call [`add_breadcrumb`](#add-breadcrumb-options) as many times as you need and reference Avo's path helpers through the `avo` proxy.

:::warning
You're most probably linking to an internal Avo page, so you need to prefix the path using the `avo` dot as per Rails' engine rules. See [Rails engines and path helpers](./rails-engines-paths.html) for a full guide.
:::

## Add a breadcrumb

Call `add_breadcrumb` to push a crumb onto the trail. It's available in the `set_initial_breadcrumbs` block and in any Avo controller action — most commonly a [custom page](./custom-tools.html):

```ruby
add_breadcrumb title: "Home", path: avo.root_path
add_breadcrumb title: "Details"
```

Crumbs render in the order you add them, and the last one is shown as the current (unlinked) page when you omit its `path`.

### `add_breadcrumb` options

<Option name="`title`" headingSize="3">

The text shown for the breadcrumb.

```ruby
add_breadcrumb title: "Home"
add_breadcrumb title: "Details"
```

- **Type:** String
- **Default:** `nil`
- **Required:** yes — a crumb without a title has nothing to display

</Option>

<Option name="`path`" headingSize="3">

Turns the crumb into a link. Omit it to render the crumb as plain text — typically for the last, current-page crumb.

```ruby
add_breadcrumb title: "Posts", path: avo.posts_path
add_breadcrumb title: "Custom tool", path: avo.custom_tool_path
```

- **Type:** String
- **Default:** `nil`

:::warning
You're most probably linking to an internal Avo page, so you need to prefix the path using the `avo` dot as per Rails' engine rules. See [Rails engines and path helpers](./rails-engines-paths.html) for a full guide.
:::

</Option>

<Option name="`icon`" headingSize="3">

Renders an icon before the title. Accepts any icon Avo can resolve (the [tabler](https://tabler.io/icons) and [heroicons](https://heroicons.com) sets ship with Avo).

```ruby
add_breadcrumb title: "Home", icon: "tabler/outline/home"
add_breadcrumb title: "Details", icon: "heroicons/outline/information-circle"
```

- **Type:** String
- **Default:** `nil`
- **Values:** icon path strings, e.g. `"tabler/outline/home"`

</Option>

<Option name="`initials`" headingSize="3">

Shows a small square avatar with the given initials when no `avatar` is present. Useful for record crumbs where you want an abbreviated identifier (e.g. "JD" for John Doe).

```ruby
add_breadcrumb title: "John Doe", initials: "JD", path: user_path(@user)
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`avatar`" headingSize="3">

Shows an image avatar before the title. Avo sets this automatically on resource-record crumbs from the resource's avatar; you rarely pass it by hand.

```ruby
add_breadcrumb title: @resource.record_title, avatar: @resource.avatar
```

- **Type:** `Avo::Avatar` (an object whose `value` resolves to an image URL)
- **Default:** `nil`
- **Note:** takes precedence over `initials` when both are given

</Option>

## Breadcrumbs for custom pages

Add breadcrumbs to a [custom page](./custom-tools.html) from its controller action:

```ruby{3}
class Avo::ToolsController < Avo::ApplicationController
  def custom_tool
    add_breadcrumb title: "Custom tool", path: avo.custom_tool_path
  end
end
```
