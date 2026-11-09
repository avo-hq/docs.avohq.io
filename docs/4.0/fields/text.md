---
license: community
description: "Renders a text input element."
fieldTags: [text]
outline: [2, 3]
---

# Text

The `Text` field displays a single-line value and renders a regular `<input type="text" />` element on forms.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :title, as: :text
  end
end
```

By default, values are displayed as escaped text, without links or HTML rendering. `as_html` and `link_to_record` are off, and `protocol` is unset.

## Link to an email address or phone number {#protocol}

Set `protocol` to turn the value into a link on the Index and Show views. For example, `:mailto` opens an email client and `:tel` creates a phone link. A string can supply another protocol; pass the name without the colon. The link destination is built as `protocol:value`.

```ruby
# app/avo/resources/user.rb
field :email,
  as: :text,
  protocol: :mailto
```

<DemoVideo demo-video="https://www.youtube.com/watch?v=MfryUtcXqvU&t=662s" />

## Link to the record

Set `link_to_record: true` to make the value link to the record on the Index view. It does not add a link on the Show view.

```ruby
# app/avo/resources/post.rb
field :title, as: :text, link_to_record: true
```

## Render HTML in a value {#as_html}

Set `as_html: true` to render the value as HTML on the Index and Show views. This is useful for custom markup, such as a link to another record or website.

```ruby
# app/avo/resources/post.rb
field :title, as: :text, as_html: true do
  '<a href="https://avohq.io">Avo</a>'
end
```

:::warning
`as_html` renders the value without escaping or sanitizing it. Only render trusted HTML, or sanitize untrusted content before returning it.
:::

When options are combined, HTML rendering takes precedence over `protocol`, and `protocol` takes precedence over `link_to_record`. These options do not change the text input on forms.

## Customize the label and input

Use [common field options](../field-options.html) to set a label, placeholder, required indicator, read-only input, or value formatting.

```ruby
# app/avo/resources/post.rb
field :title,
  as: :text,
  name: "Post title",
  required: true,
  readonly: true,
  placeholder: "My shiny new post",
  format_display_using: -> { value.to_s.truncate(30) }
```
