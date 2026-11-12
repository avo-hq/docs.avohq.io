---
license: community
outline: [2, 3]
guide: ./heading.html
prev:
  text: "Heading"
  link: "./heading.html"
next: false
---

# Heading API

Per-option reference for the `Heading` field. For tasks and worked examples, see the [Heading guide](./heading.html).

Options are passed to the field declaration in a resource's `fields` method, for example in `app/avo/resources/user.rb`:

```ruby
field :user_information, as: :heading, label: "User information", as_html: false
```

## Heading content

<Option name="`label`">

The heading text when no computed block is supplied. A block's return value takes precedence over `label`; headings declared with a block are hidden on new and edit views, even when a label is also supplied.

```ruby
field :user_information, as: :heading, label: "Contact details"
```

- **Type:** `String`
- **Default:** `id.to_s.humanize` (for example, `"User information"` for `:user_information`)
- **Fallback:** `nil` and `false` use the humanized field ID; an empty string remains empty.

</Option>

<Option name="`as_html`">

Renders the heading value as sanitized HTML when enabled. Otherwise, the value is rendered as escaped text with uppercase styling. This applies to both labels and computed values.

```ruby
field :user_information, as: :heading,
  label: "<strong>User information</strong>",
  as_html: true
```

- **Type:** `Boolean`
- **Default:** `false`

:::warning Sanitized HTML
HTML is passed through Rails' `sanitize` helper, not rendered unchanged. The option is not type-validated: blank values become `false`, while nonblank values such as the string `"false"` enable HTML rendering. Pass `true` or `false`.
:::

</Option>

## Common field options

For shared visibility, styling, and other field settings, see [Common field options](../field-options.html).
