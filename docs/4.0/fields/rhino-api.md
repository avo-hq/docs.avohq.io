---
license: community
outline: [2, 3]
guide: ./rhino.html
prev:
  text: "Rhino"
  link: "./rhino.html"
next: false
---

# Rhino API

Per-option reference for the Rhino field provided by `avo-rhino_field`. For installation, ActionText setup, and examples, see the [Rhino guide](./rhino.html).

Pass options to a field declaration in your resource's `fields` method, for example in `app/avo/resources/post.rb`:

```ruby
field :body, as: :rhino, always_show: true
```

The gem registers the field as `:rhino` and hides it on the Index view by default. Form views render the editor; the Show view renders sanitized HTML. For options shared by fields, see [Field options](../field-options.html).

## Show view presentation

<Option name="`always_show`">

Keeps the full content visible on the Show view instead of making it collapsible. It does not change the editor on form views.

```ruby
field :body, as: :rhino, always_show: true
```

- **Type:** Boolean
- **Default:** `false`

:::warning Ruby truthiness
The option uses Ruby truthiness rather than parsing Boolean strings. Only `false` and `nil` leave the content collapsible; values such as `"false"` and `0` keep it fully visible.
:::

</Option>
