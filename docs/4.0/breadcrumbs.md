# Breadcrumbs

Avo has a pretty advanced breadcrumbs system.

It will use the resource avatar or initials to display the breadcrumb and context.

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

</Option>

<Option name="`path`">

This sets the link of the breadcrumb.

```ruby
add_breadcrumb title: "Posts", path: main_app.posts_path
add_breadcrumb title: "Custom tool", path: avo.custom_tool_path
```

|                 |         |
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

</Option>

- `title`: The title of the breadcrumb.
- `path`: The path of the breadcrumb.
- `icon`: The icon of the breadcrumb.
- `initials`: The initials of the breadcrumb.

It returns the breadcrumb object.

```ruby
add_breadcrumb "Home", root_path
```

```ruby
add_breadcrumb title: "Home", path: root_path
```
