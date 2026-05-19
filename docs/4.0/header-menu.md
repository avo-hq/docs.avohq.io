---
license: pro
outline: [2, 3]
version: "4.0"
---

# Header menu

The header menu is the row of links rendered in Avo's top navigation bar. By default it shows a single link to your `app_name`. You can replace that with a list of your own links — typically used for surfacing documentation, status, billing, or external destinations. Links that don't fit collapse into a "more" dropdown automatically.

## Configuration

Set `header_menu` in your initializer. The DSL is flat — only `link` items render.

```ruby{3-7}
# config/initializers/avo.rb
Avo.configure do |config|
  config.header_menu = -> {
    link "Docs", path: "https://docs.avohq.io"
    link "GitHub", path: "https://github.com/avo-hq/avo"
    link "Support", path: "https://avohq.io/help"
  }
end
```

## `link` options

<Option name="`name`">

The label rendered inside the `<a>` tag. Required.

```ruby
link "Docs", path: "/docs"
```

</Option>

<Option name="`path`">

The URL the link points to. May be passed positionally for brevity:

```ruby
# These two are equivalent
link "Docs", path: "/docs"
link "Docs", "/docs"
```

</Option>

<Option name="`target`">

Standard anchor target. Use `:_blank` for external links — Avo automatically renders an external-link icon next to them.

```ruby
link "Docs", path: "https://docs.avohq.io", target: :_blank
```

</Option>

<Option name="`method`">

Use a non-GET HTTP method when the link is clicked. Works through Turbo.

```ruby
link "Sign out", path: main_app.destroy_user_session_path, method: :delete
```

</Option>

<Option name="`params`">

Extra query parameters appended to the link's path.

```ruby
link "Drafts", path: avo.resources_posts_path, params: { status: "draft" }
```

</Option>

<Option name="`visible`">

Boolean or block that decides whether the link renders. The block has access to `current_user`, `context`, `params`, and `view_context`.

```ruby
link "Admin tools", path: "/avo/tools", visible: -> {
  current_user.admin?
}
```

</Option>

## Examples

A realistic mix combining several options:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.header_menu = -> {
    # Positional path
    link "Home", "/"

    # External link — :_blank gets an external-link icon automatically
    link "Docs", path: "https://docs.avohq.io", target: :_blank

    # Internal link with query params
    link "Drafts", path: avo.resources_posts_path, params: { status: "draft" }

    # Non-GET request via Turbo
    link "Sign out", path: main_app.destroy_user_session_path, method: :delete

    # Conditional — only renders for admins
    link "Admin tools", path: "/avo/tools", visible: -> {
      current_user.admin?
    }
  }
end
```

