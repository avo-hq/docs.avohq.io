---
license: community
outline: [2, 3]
guide: ./table-view.html
prev:
  text: "Table view"
  link: "./table-view.html"
next: false
---

# Table view API

Per-option reference for the table view. For task-oriented documentation and worked examples, see the [Table view guide](./table-view.html).

Row controls options live in `config/initializers/avo.rb` (globally) or on the resource class; row styling lives on the resource class:

```ruby
Avo.configure do |config|
  config.resource_row_controls_config = { placement: :right }
end

class Avo::Resources::User < Avo::BaseResource
  self.row_controls_config = { placement: :left }
  self.table_view = { row_options: { class: "bg-blue-50" } }
end
```

## Row controls

<Option name="`resource_row_controls_config`" headingSize="3">

Global default for row controls across all resources. Individual resources override it with [`row_controls_config`](#row_controls_config).

```ruby
Avo.configure do |config|
  config.resource_row_controls_config = {
    placement: :right,
    float: false,
    show_on_hover: false
  }
end
```

- **Type:** Hash with keys [`placement`](#placement), [`float`](#float), [`show_on_hover`](#show_on_hover)
- **Default:** `{ placement: :right, float: false, show_on_hover: false }`

</Option>

<Option name="`row_controls_config`" headingSize="3">

Per-resource row controls configuration. Merged over [`resource_row_controls_config`](#resource_row_controls_config), so you only need to set the keys you want to change.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.row_controls_config = {
    placement: :left
  }
end
```

- **Type:** Hash with keys [`placement`](#placement), [`float`](#float), [`show_on_hover`](#show_on_hover)
- **Default:** `{}` (falls back to the global configuration)

</Option>

<Option name="`placement`" headingSize="3">

The position of the row controls within the row.

- **Type:** Symbol
- **Default:** `:right`
- **Values:**

| Value | Behavior |
| --- | --- |
| `:right` | Controls on the right side of the row |
| `:left` | Controls on the left side of the row |
| `:both` | Controls on both sides of the row |

:::warning
`float` and `show_on_hover` are designed to function optimally when `placement` is `:right`. Avo does not restrict their usage with `:left` or `:both`, but the applied styles are intended for `:right` and unexpected behavior may occur with other placements.
:::

</Option>

<Option name="`float`" headingSize="3">

Whether the row controls float over the row (sticky to the row end, with a gradient fade) instead of occupying their own column.

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`show_on_hover`" headingSize="3">

Whether the row controls are hidden until the row is hovered.

- **Type:** Boolean
- **Default:** `false`

</Option>

## Row styling

<Option name="`table_view`" headingSize="3">

Resource class attribute holding table view configuration. Currently supports one key: [`row_options`](#row_options).

```ruby
class Avo::Resources::Message < Avo::BaseResource
  self.table_view = {
    row_options: { class: "bg-blue-50" }
  }
end
```

- **Type:** Hash
- **Default:** `nil`

</Option>

<Option name="`row_options`" headingSize="3">

HTML attributes applied to the `<tr>` element of each record on the <Index /> view and in `has_many` association tables.

Each value may be static or a Proc; the whole hash itself may also be a Proc returning a hash. Procs are evaluated once per row, per render, through `Avo::ExecutionContext` with access to `record`, `resource`, `view` (`:index` on the main index, `:has_many` inside an association panel), and the standard defaults (`current_user`, `params`, `request`, view helpers).

Returning `nil` or `false` from a value omits that attribute (for `class:`, it leaves Avo's classes untouched).

- **Type:** Hash, or Proc returning a Hash
- **Default:** `nil`
- **Values:** [`class`](#class), [`data`](#data), [`style`](#style), and [other passthrough HTML attributes](#other-html-attributes) — see below
- **Validation:** raises `ArgumentError` if the top level doesn't resolve to a Hash, if a [denied key](#denied-attributes) is set, or if a value has an unsupported type. Errors raise outside production; in production the violation is logged via `Avo.logger` and the row falls back to Avo's default attributes.

</Option>

### Supported keys

<Option name="`class`" headingSize="4">

CSS classes appended to Avo's row classes. Because they're appended **after** Avo's, they win at equal CSS specificity. Avo never strips its own utility classes (notably `cursor-pointer` when click-to-view is enabled).

```ruby
class: "bg-yellow-50"                                            # String
class: -> { record.flagged? ? ["ring-2", "ring-red-300"] : [] }  # Array
class: -> { { "opacity-60" => record.archived? } }               # Hash
```

- **Type:** String, Symbol, Array, or Hash of `class => Boolean` pairs (like Rails' `class_names` helper); `nil`/`false` to skip
- **Validation:** any other type raises `ArgumentError`

</Option>

<Option name="`data`" headingSize="4">

A hash of `data-*` attributes, deep-merged with Avo's existing data attributes:

- `data-controller` and `data-action` are **token-concatenated** — your Stimulus identifiers are added alongside Avo's, never replacing them.
- [Reserved keys](#reserved-data-keys) are protected — attempts to set them are ignored with a warning in development and test.
- Other keys pass through, subject to the same [value coercion](#style) as any attribute.

```ruby
data: -> { { test_id: "message-#{record.id}", controller: "highlightable" } }
```

- **Type:** Hash; `nil`/`false` to skip
- **Validation:** any other type raises `ArgumentError`

</Option>

<Option name="`style`" headingSize="4">

Inline CSS style string. Passed through to the `<tr>`, HTML-escaped by Rails.

```ruby
style: -> { "border-left: 4px solid #{record.priority_color};" }
```

- **Type:** String, Symbol, or Integer (Symbols and Integers are converted to strings); `nil`/`false` to omit
- **Validation:** any other type — including `true` — raises `ArgumentError`. Convert booleans with `.to_s`.

</Option>

#### Other HTML attributes

Any other HTML attribute (`title`, `aria-label`, …) is passed through unchanged, except the [denied attributes](#denied-attributes) below. Values are HTML-escaped by Rails' `content_tag` and follow the same coercion rules as [`style`](#style).

```ruby
title: -> { "Created #{time_ago_in_words(record.created_at)} ago" }
"aria-label": -> { "Message from #{record.role}" }
```

### Reserved data keys

Avo owns these `data-*` keys on `<tr>`. Attempts to set them are ignored; in development and test a warning is logged via `Avo.logger`.

`index`, `component_name`, `resource_name`, `record_id`, `resource_id`, `visit_path`, `reorder_target`

### Denied attributes

Some attributes are off-limits because Avo owns them or they break behavior:

| Attribute | Reason |
|---|---|
| `id` | Avo emits `<tr id="...">` for tests and Stimulus targeting |
| `role` | The implicit `role="row"` on `<tr>` inside `<table>` is canonical; overriding breaks screen-reader semantics |
| `aria-selected` | Owned by Avo's row-selection state |
| `on*` event handlers (`onclick`, `onmouseover`, …) | Use Stimulus actions via `data: { action: "..." }` instead |
| `tabindex`, `contenteditable`, `draggable` | Conflict with Avo's keyboard navigation and selection |

Setting any of these raises `ArgumentError` listing the supported keys. In production, the row falls back to Avo's defaults and the violation is logged via `Avo.logger` instead.
