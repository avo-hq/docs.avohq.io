---
version: '1.0'
license: community
---

# Text

The `Text` field renders a regular `<input type="text" />` element.

```ruby
field :title, as: :text
```
## Options

<Option name="`as_html`">
Displays the value as HTML on the `Index` and `Show` views. Useful when you need to link to another record.

```ruby
field :title, as: :text, as_html: true do
  '<a href="https://avohq.io">Avo</a>'
end
```

<!-- @include: ./../common/default_boolean_false.md-->
</Option>


<Option name="`protocol`">
Render the value with a protocol prefix on the `Index` and `Show` views. So, for example, you can make a text field a `mailto` link very quickly.

```ruby{3}
field :email,
  as: :text,
  protocol: :mailto
```

<DemoVideo demo-video="https://www.youtube.com/watch?v=MfryUtcXqvU&t=662s" />

#### Default

`nil`

#### Possible values

`mailto`, `tel`, or any other string value you need to pass to it.
</Option>

<!-- @include: ./../common/link_to_record_common.md-->

## Customization

You may customize the `Text` field with as many options as you need.

```ruby
field :title, # The database field ID
  as: :text, # The field type
  name: 'Post title', # The label you want displayed
  required: true, # Display it as required
  readonly: true, # Display it disabled
  as_html: true # Should the output be parsed as html
  placeholder: 'My shiny new post', # Update the placeholder text
  format_using: -> { value.truncate 3 } # Format the output
```
