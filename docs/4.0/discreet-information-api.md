---
license: community
outline: [2, 3]
guide: ./discreet-information.html
prev:
  text: "Discreet Information"
  link: "./discreet-information.html"
next: false
---

# Discreet Information API

Per-option reference for `discreet_information`. For task-oriented documentation and worked examples, see the [Discreet Information guide](./discreet-information.html).

The option is set on the resource class and accepts a single item or an array of items. Each item is a preconfigured symbol or a `Hash` of the custom item options below:

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = [
    :timestamps,
    {
      # custom item options listed below
    }
  ]
end
```

- **Type:** Symbol, Hash, or Array of Symbols/Hashes
- **Default:** `nil` — nothing is rendered

## Preconfigured items

<Option name="`:id`" headingSize="3">

Displays the record's ID as a key-value pair labeled `ID`.

```ruby
self.discreet_information = :id
```

</Option>

<Option name="`:timestamps`" headingSize="3">

Displays an icon next to the record title. Hovering over it reveals the record's `created_at` and `updated_at` timestamps in a tooltip.

```ruby
self.discreet_information = :timestamps
```

If the record has neither a `created_at` nor an `updated_at` value, the item is omitted.

</Option>

<Option name="`:created_at`" headingSize="3">

Displays the record's `created_at` timestamp as a key-value pair. Omitted when the record has no `created_at` value.

```ruby
self.discreet_information = :created_at
```

</Option>

<Option name="`:updated_at`" headingSize="3">

Displays the record's `updated_at` timestamp as a key-value pair. Omitted when the record has no `updated_at` value.

```ruby
self.discreet_information = :updated_at
```

</Option>

## Custom item options

Every option below accepts a static value or a block. Blocks are evaluated in an [`ExecutionContext`](./execution-context) with access to `record`, `resource`, `view`, and the rest of the [common objects](./execution-context#common-objects).

<Option name="`as`" headingSize="3">

The type of representation for the item.

```ruby
self.discreet_information = {
  as: :badge,
  text: "Draft"
}
```

| Value        | Behavior                                                 |
| ------------ | -------------------------------------------------------- |
| `:text`      | Plain `text`, with an optional leading `icon` (default)  |
| `:icon`      | An icon only; pair with `icon` and a `title` tooltip     |
| `:badge`     | A badge containing `text`, with an optional leading `icon` |
| `:key_value` | A `key`/`value` pair                                     |

- **Type:** Symbol
- **Default:** `:text`

</Option>

<Option name="`text`" headingSize="3">

The text displayed by `:text` and `:badge` items.

```ruby
self.discreet_information = {
  as: :badge,
  text: -> { record.published_at ? "Published" : "Draft" }
}
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`title`" headingSize="3">

The body of the tooltip shown when hovering over the item.

```ruby
self.discreet_information = {
  title: -> { "Product is #{record.published_at ? "published" : "draft"}" }
}
```

You may return HTML, but don't forget to sanitize the output:

```ruby
self.discreet_information = {
  title: -> { sanitize("Product is <strong>#{record.published_at ? "published" : "draft"}</strong>", tags: %w[strong]) }
}
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`icon`" headingSize="3">

The icon displayed with the item.

```ruby
self.discreet_information = {
  icon: "tabler/outline/bulb"
}
```

- **Type:** String or Proc
- **Default:** `nil`
- **Values:** any [Tabler](https://tabler.io/icons), [Heroicon](https://heroicons.com), or [Avo](https://github.com/avo-hq/avo/tree/main/app/assets/svgs/avo) icon, e.g. `tabler/outline/cube`, `heroicons/outline/cube`, `avo/cube` — see the [Icons](./icons#libraries) documentation

</Option>

<Option name="`url`" headingSize="3">

Turns the item into a link pointing at this URL.

```ruby
self.discreet_information = {
  icon: "tabler/outline/external-link",
  url: -> { main_app.post_path record }
}
```

- **Type:** String or Proc
- **Default:** `nil` — the item is not a link

</Option>

<Option name="`target`" headingSize="3">

The `target` attribute of the link. Only relevant together with `url`.

```ruby
self.discreet_information = {
  url: -> { main_app.post_path record },
  target: :_blank
}
```

- **Type:** Symbol or String
- **Default:** `nil`
- **Values:** `:_blank`, `:_self`, `:_parent`, `:_top` — forwarded verbatim to the link

</Option>

<Option name="`data`" headingSize="3">

Data attributes attached to the item's wrapper element — the link when `url` is set, a plain element otherwise.

```ruby
self.discreet_information = {
  url: -> { main_app.post_path record },
  data: {turbo_frame: :some_frame}
}
```

- **Type:** Hash or Proc
- **Default:** `nil`

</Option>

<Option name="`key`" headingSize="3">

The key displayed by a `:key_value` item.

```ruby
self.discreet_information = {
  as: :key_value,
  key: "Status:",
  value: -> { record.published_at ? "published" : "draft" }
}
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`value`" headingSize="3">

The value displayed by a `:key_value` item.

```ruby
self.discreet_information = {
  as: :key_value,
  key: "Status:",
  value: -> { record.published_at ? "published" : "draft" }
}
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`visible`" headingSize="3">

Whether the item is rendered.

```ruby
self.discreet_information = {
  as: :badge,
  text: "Draft",
  visible: -> { record.published_at.nil? }
}
```

- **Type:** Boolean or Proc
- **Default:** `true` — omitting the option renders the item

</Option>
