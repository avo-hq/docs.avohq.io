---
license: pro
outline: [2, 3]
---

# Header menu

The header menu is the row of links rendered in Avo's top navigation bar. By default it shows a single link to your `app_name`. You can replace that with a list of your own links — typically used for surfacing documentation, status, billing, or external destinations. Links that don't fit collapse into a "more" dropdown automatically.

## Configuration

Set `header_menu` in your initializer. The DSL is flat — only `link_to` items render.

```ruby{3-7}
# config/initializers/avo.rb
Avo.configure do |config|
  config.header_menu = -> {
    link_to "Docs", path: "https://docs.avohq.io"
    link_to "GitHub", path: "https://github.com/avo-hq/avo"
    link_to "Support", path: "https://avohq.io/help"
  }
end
```

## `link_to` options

<Option name="`name`">

The label rendered inside the `<a>` tag. Required.

```ruby
link_to "Docs", path: "/docs"
```

</Option>

<Option name="`path`">

The URL the link points to. May be passed positionally for brevity:

```ruby
# These two are equivalent
link_to "Docs", path: "/docs"
link_to "Docs", "/docs"
```

</Option>

<Option name="`target`">

Standard anchor target. Use `:_blank` for external links — Avo automatically renders an external-link icon next to them.

```ruby
link_to "Docs", path: "https://docs.avohq.io", target: :_blank
```

</Option>

<Option name="`method`">

Use a non-GET HTTP method when the link is clicked. Works through Turbo.

```ruby
link_to "Sign out", path: main_app.destroy_user_session_path, method: :delete
```

</Option>

<Option name="`params`">

Extra query parameters appended to the link's path.

```ruby
link_to "Drafts", path: avo.resources_posts_path, params: { status: "draft" }
```

</Option>

<Option name="`visible`">

Boolean or block that decides whether the link renders. The block has access to `current_user`, `context`, `params`, and `view_context`.

```ruby
link_to "Admin tools", path: "/avo/tools", visible: -> {
  current_user.admin?
}
```

</Option>

<Option name="`title`">

Hover tooltip shown via the native `title` attribute. Tooltips are **opt-in** — Avo doesn't auto-generate one from the link's label, so leaving `title` unset means no tooltip appears (including when the label is truncated in the overflow popover). Set it explicitly when you want a tooltip — typically for short labels that benefit from a longer description, or as the full text behind an intentionally truncated label.

```ruby
link_to "Docs", path: "/docs", title: "Open the documentation site"
```

</Option>

## Examples

A realistic mix combining several options:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.header_menu = -> {
    # Positional path
    link_to "Home", "/"

    # External link — :_blank gets an external-link icon automatically
    link_to "Docs", path: "https://docs.avohq.io", target: :_blank

    # Internal link with query params
    link_to "Drafts", path: avo.resources_posts_path, params: { status: "draft" }

    # Non-GET request via Turbo
    link_to "Sign out", path: main_app.destroy_user_session_path, method: :delete

    # Conditional — only renders for admins
    link_to "Admin tools", path: "/avo/tools", visible: -> {
      current_user.admin?
    }
  }
end
```

