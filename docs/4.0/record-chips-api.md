---
license: addon
addon_link: https://avohq.io/addons/ai
outline: [2, 3]
guide: ./record-chips.html
prev:
  text: "Record chips"
  link: "./record-chips.html"
next: false
---

# Record chips API

Per-method reference for record chip declarations. For task-oriented documentation and examples, see the [Record chips guide](./record-chips.html).

Methods are declared on an Avo resource:

```ruby
class Avo::Resources::Project < Avo::BaseResource
  def chip
    background color: :violet
    part resource.avatar
    part resource.record_title
    part record.status, icon: "tabler/outline/circle-check", tone: :success
    dynamic_fields only: %i[owner due_at], limit: 2
  end

  def chip_tooltip
    record.summary
  end
end
```

:::warning Alpha API
The record chip DSL is alpha and may change before it stabilizes.
:::

## Chip declaration

<Option name="`chip`">

Declares the parts, background, and dynamic field insertion point for a resource's record chip. It is an ordinary resource instance method with `record`, `resource`, and the resource's delegated execution context available.

```ruby
def chip
  part resource.avatar
  part resource.record_title
end
```

- **Type:** Instance method
- **Default:** inherited implementation equivalent to `part resource.avatar`, then `part resource.record_title`
- **Validation:** overriding `chip` replaces the inherited declaration wholesale; no default parts are merged into it
- **Fallback:** if evaluation raises, the record still renders as a link instead of failing the answer
- **Context:** `view`, `params`, `request`, `context`, `current_user`, `view_context`, `main_app`, `avo`, `helpers`, and `t` are delegated by the resource; bare view helper calls are not implicitly forwarded

</Option>

<Option name="`part`">

Adds one ordered unit of content to the chip. Declaration order is render order. A part with no text and no icon is dropped.

```ruby
part record.status, icon: "tabler/outline/circle-check", tone: :success
```

- **Signature:** `part(text = nil, icon: nil, tone: nil)`
- **Type:** Method
- **Default:** no parts beyond those declared by the inherited `chip`
- **Rendering:** avatar objects render as pictures; all other non-empty values render as text

<Option name="`text`" headingSize="3">

The part's text value. Values are rendered as supplied, except avatar objects, which render as pictures.

```ruby
part record.status
```

- **Type:** Any object or `nil`
- **Default:** `nil`
- **Validation:** a part is dropped when both `text` and `icon` are empty

</Option>

<Option name="`icon`" headingSize="3">

An Avo icon rendered alone or beside the text.

```ruby
part icon: "tabler/outline/moon"
```

- **Type:** String or `nil`
- **Default:** `nil`
- **Values:** an [Avo icon](./icons.html) name

</Option>

<Option name="`tone`" headingSize="3">

The semantic text treatment for the part.

```ruby
part record.status, tone: :warning
```

| Value      | Behavior                         |
| ---------- | -------------------------------- |
| `:neutral` | Standard chip text               |
| `:muted`   | Secondary, lower-emphasis text   |
| `:success` | Positive or successful state     |
| `:warning` | Cautionary state                 |
| `:danger`  | Destructive or unsuccessful state|
| `:info`    | Informational state              |

- **Type:** Symbol or `nil`
- **Default:** `:neutral`
- **Values:** `:neutral`, `:muted`, `:success`, `:warning`, `:danger`, `:info`
- **Validation:** unknown values normalize to `:neutral`

</Option>

</Option>

## Background

<Option name="`background`">

Sets one background source for the whole chip and optionally controls its foreground direction.

```ruby
background gradient: [:indigo, "#c026d3", :rose], foreground: :light
```

- **Signature:** `background(color: nil, gradient: nil, image: nil, foreground: nil)`
- **Type:** Method
- **Default:** no background
- **Validation:** exactly one of `color`, `gradient`, or `image` is required
- **Contrast:** Avo selects or protects a foreground against a 4.5:1 contrast floor, adding a minimal scrim when needed

<Option name="`color`" headingSize="3">

A solid background color.

```ruby
background color: :violet
```

- **Type:** Symbol or String
- **Default:** `nil`
- **Values:** `:red`, `:orange`, `:amber`, `:yellow`, `:lime`, `:green`, `:emerald`, `:teal`, `:cyan`, `:sky`, `:blue`, `:indigo`, `:violet`, `:purple`, `:fuchsia`, `:pink`, `:rose`, or a three- or six-digit hex color

</Option>

<Option name="`gradient`" headingSize="3">

A 135-degree gradient containing two or more colors.

```ruby
background gradient: [:indigo, "#c026d3", :rose]
```

- **Type:** Array of Symbols and/or Strings
- **Default:** `nil`
- **Values:** two or more palette names or three- or six-digit hex colors accepted by `color`
- **Validation:** requires at least two colors

</Option>

<Option name="`image`" headingSize="3">

An image behind the chip content.

```ruby
background image: resource.cover
```

- **Type:** Avo photo, Active Storage-backed photo, image URL, or `nil`
- **Default:** `nil`

</Option>

<Option name="`foreground`" headingSize="3">

Requests a light or dark foreground. Avo still adjusts the background enough to preserve contrast.

```ruby
background image: resource.cover, foreground: :light
```

- **Type:** Symbol or `nil`
- **Default:** `nil` (selected automatically)
- **Values:** `:light`, `:dark`

</Option>

</Option>

## Tooltip

<Option name="`chip_tooltip`">

Returns the text shown when the chip is hovered.

```ruby
def chip_tooltip
  record.summary
end
```

- **Type:** Instance method returning text or `nil`
- **Default:** the record title
- **Fallback:** a blank return value or an exception falls back to the record title without removing the chip

</Option>

## Dynamic fields

<Option name="`dynamic_fields`">

Allows the assistant to select answer-relevant Avo fields requested by the query. Their current values are resolved at render time, formatted and labeled by their Avo fields, rendered with the muted treatment, and inserted exactly where this call appears among declared parts.

```ruby
dynamic_fields only: %i[population continent], limit: 2
```

- **Signature:** `dynamic_fields(enabled = true, only: nil, except: nil, limit: 3)`
- **Type:** Method
- **Default:** disabled when not declared; `enabled` defaults to `true` when declared
- **Fallback:** if no requested fields are permitted or available, the declared chip is unchanged
- **Deduplication:** a dynamic value is omitted when its formatted value matches a declared text part
- **Authorization:** resource authorization, field policy, and `visible:` take precedence; unknown fields and arbitrary methods are ignored
- **Resolution:** values are live-resolved on every render, including streaming and reload contexts

<Option name="`enabled`" headingSize="3">

Enables or explicitly disables dynamic field selection. Passing `false` supports conditional Ruby without removing the declaration.

```ruby
dynamic_fields current_user.can_view_order_details?
```

- **Type:** Boolean
- **Default:** `true` when `dynamic_fields` is called
- **Values:** `true`, `false`

</Option>

<Option name="`only`" headingSize="3">

Restricts selection to the named Avo fields.

```ruby
dynamic_fields only: %i[population continent]
```

- **Type:** Symbol, String, Array of Symbols or Strings, or `nil`
- **Default:** `nil` (all readable fields are eligible)
- **Validation:** mutually exclusive with `except`

</Option>

<Option name="`except`" headingSize="3">

Excludes named Avo fields from selection.

```ruby
dynamic_fields except: %i[internal_notes]
```

- **Type:** Symbol, String, Array of Symbols or Strings, or `nil`
- **Default:** `nil`
- **Validation:** mutually exclusive with `only`

</Option>

<Option name="`limit`" headingSize="3">

Caps how many dynamic values the assistant may add.

```ruby
dynamic_fields limit: 2
```

- **Type:** Integer
- **Default:** `3`
- **Values:** `1`, `2`, `3`
- **Validation:** raises unless the value is an Integer from `1` through the global maximum of `3`

</Option>

</Option>

## Record resolution and layout

Record references resolve through the viewer's policy, the record's `to_param`, and the resource's `find_record_method`. Missing or unauthorized references render as plain label text. A set of records renders as full-width rows; records used within prose render inline.
