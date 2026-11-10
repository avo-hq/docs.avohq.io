---
license: community
outline: [2, 3]
guide: ./textarea.html
prev:
  text: "Textarea"
  link: "./textarea.html"
next: false
---

# Textarea API

Per-option reference for the Textarea field. For examples and display guidance, see the [Textarea guide](./textarea.html).

Options are passed to the field declaration in an Avo resource:

```ruby
# app/avo/resources/post.rb
field :body, as: :textarea, rows: 10
```

For labels, placeholders, visibility, and other shared settings, see [Common field options](../field-options.html).

## Input size

<Option name="`rows`">

The number of visible rows in the textarea on the New and Edit views. This option does not affect the Show view.

```ruby
field :body, as: :textarea, rows: 10
```

- **Type:** `Integer`, or a value responding to `to_i`.
- **Default:** `5` when omitted or blank (including `nil`, `false`, and blank strings).
- **Values:** Positive integers represent valid HTML row counts.
- **Validation:** Avo converts nonblank values with `to_i` without checking positivity. A nonblank value without `to_i` raises `NoMethodError` during field initialization.

:::warning
Nonblank strings are converted with Ruby's `to_i`, not validated as numbers. For example, `"10"` becomes `10` and `"invalid"` becomes `0`; zero and negative values are passed to the textarea unchanged.
:::

</Option>
