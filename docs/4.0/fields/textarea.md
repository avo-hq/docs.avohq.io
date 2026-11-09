---
license: community
outline: [2, 3]
description: "The textarea field renders a textarea element."
fieldTags: [text]
---

# Textarea

The `textarea` field provides a multiline text input on forms and displays the saved text with line breaks on the Show view.

```ruby
# app/avo/resources/post.rb
field :body, as: :textarea
```

By default, the input has five rows on the New and Edit views, and the field is hidden on the [Index](../views#index) view.

## Give longer text more room {#rows}

Set `rows` to a positive integer to change the input's visible height on the New and Edit views.

```ruby
# app/avo/resources/post.rb
field :body, as: :textarea, rows: 10
```

If `rows` is omitted or blank, Avo uses `5`. Nonblank values are converted to integers with `to_i`; Avo does not validate that the result is positive.

## Show the field on the index

The field has no built-in Index component. Follow the [Generating a custom component for a field](../guides/generating-components-for-fields.html) guide to add one before making the field visible there.

## Configure shared field behavior

For labels, placeholders, visibility, and other shared settings, see [Common field options](../field-options.html).
