# Breadcrumbs

Avo has a pretty advanced breadcrumbs system.

It will use the resource avatar or initials to display the breadcrumb and context.

![Breadcrumbs](/assets/img/breadcrumbs.png)

It has minimal configuration options but you will have the oportunity to interact with it in a few places like the `avo.rb` config file or in the controller actions when you want to add breadcrumbs to a [custom tool](./custom-tools.html).

## API

## `add_breadcrumb`

This method is used to add a breadcrumb to the stack.
It takes the following arguments:

### Options

<Option name="`title`">

Sets the title of the breadcrumb.

```ruby
add_breadcrumb title: "Home"
add_breadcrumb title: "Details"
```

| Option          | Value   |
| --------------- | ------- |
| Required        | `true`  |
| Default value   | `nil`   |
| Possible values | Strings |

</Option>

<Option name="`path`">

This sets the link of the breadcrumb.

```ruby
add_breadcrumb title: "Posts", path: avo.posts_path
add_breadcrumb title: "Custom tool", path: avo.custom_tool_path
```

:::warning
You're most probably linking to an internal Avo page, so you need to prefix the path using the `avo` dot as per Rails' engine rules. See [Rails engines and path helpers](./rails-engines-paths.html) for a full guide.
:::

| Option          | Value   |
| --------------- | ------- |
| Required        | `false` |
| Default value   | `nil`   |
| Possible values | Strings |

</Option>

<Option name="`icon`">

Sets the icon of the breadcrumb.

```ruby
add_breadcrumb title: "Home", icon: "heroicons/outline/home"
add_breadcrumb title: "Details", icon: "heroicons/outline/information-circle"
```

| Option          | Value                                          |
| --------------- | ---------------------------------------------- |
| Required        | `false`                                        |
| Default value   | `nil`                                          |
| Possible values | Icon strings (e.g. `"heroicons/outline/home"`) |

</Option>

<Option name="`initials`">

Sets the initials displayed in the breadcrumb avatar when no icon is present. Useful for resource records where you want to show abbreviated identifiers (e.g. "JD" for a user named John Doe).

```ruby
add_breadcrumb title: "John Doe", initials: "JD", path: user_path(@user)
add_breadcrumb title: "Post #123", initials: "P123", path: post_path(@post)
```

| Option          | Value   |
| --------------- | ------- |
| Required        | `false` |
| Default value   | `nil`   |
| Possible values | Strings |

</Option>

It returns the breadcrumb object.

```ruby
add_breadcrumb title: "Home", path: root_path
```

## Breadcrumbs for custom pages

You can add breadcrumbs to custom pages in the controller action.

```ruby{3}
class Avo::ToolsController < Avo::ApplicationController
  def custom_tool
    add_breadcrumb title: "Custom tool", path: avo.custom_tool_path
  end
end
```
