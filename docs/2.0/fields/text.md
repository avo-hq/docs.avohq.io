---
version: '2.0'
license: community
---

# Text

The `Text` field renders a regular `text` `input`.

```ruby
field :title, as: :text
```

## Display data as HTML

You may want to display some information as HTML. Maybe a link to another record.
You may use `as_html: true` attribute.

```ruby
field :title, as: :text, as_html: true do |&args|
  '<a href="https://avohq.io">Avo</a>'
end
```

You may customize it with as many options as you need.

```ruby
field :title, # The database field ID
  as: :text, # The field type
  name: 'Post title', # The label you want displayed
  required: true, # Display it as required
  readonly: true, # Display it disabled
  as_html: true # Should the output be parsed as html
  placeholder: 'My shiny new post', # Update the placeholder text
  format_using: -> (value) { value.truncate 3 } # Format the output
```

## Protocol

You may have fields that can be rendered better than just as text. For that Avo provides the `protocol` option that prepends what you give it to that field. For example you can make a text field a `mailto` link very quick.


```ruby
field :email, as: :text, protocol: :mailto
```

<DemoVideo demo-video="https://www.youtube.com/watch?v=MfryUtcXqvU&t=662s" />

