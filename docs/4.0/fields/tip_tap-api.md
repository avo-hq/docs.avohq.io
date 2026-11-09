---
license: community
betaStatus: Deprecated
outline: [2, 3]
guide: ./tip_tap.html
prev:
  text: "Tip Tap"
  link: "./tip_tap.html"
next: false
---

# Tip Tap API

Per-option reference for the deprecated TipTap field. For tasks and replacement guidance, see the [Tip Tap guide](./tip_tap.html).

Declare the field in your resource's `fields` method, for example in `app/avo/resources/post.rb`:

```ruby
field :body, as: :tiptap, always_show: true
```

The declaration uses `:tiptap`, not `:tip_tap`. The field is hidden on Index by default, edits HTML content, and renders sanitized HTML on Show. For shared options such as placeholder text, visibility, and help text, see [Field options](../field-options.html).

## Show presentation

<Option name="`always_show`">

Disables the collapsible content wrapper on Show so the full content remains visible. When false, the wrapper provides controls to expand and collapse long content. It does not change the editor or the stored value.

```ruby
field :body, as: :tiptap, always_show: true
```

- **Type:** Boolean
- **Default:** `false`
- **Validation:** No field-specific validation or Boolean coercion is performed.

:::warning Ruby truthiness
Only `false` and `nil` leave collapsing enabled. Values such as `"false"` and `0` disable collapsing. This option is not evaluated as a callback; passing a Proc makes it truthy without executing it.
:::

</Option>
