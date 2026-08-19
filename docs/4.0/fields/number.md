---
license: community
description: "Renders a number input element."
fieldTags: [number]
---

# Number

The `number` field renders a `input[type="number"]` element.

```ruby
field :age, as: :number
```

## Options

<Option name="`min`">

Set the `min` attribute.

#### Default value

`nil`

#### Possible values

Any number.
</Option>

<Option name="`max`">

Set the `max` attribute.

#### Default value

`nil`

#### Possible values

Any number.
</Option>

<Option name="`step`">

Set the `step` attribute.

#### Default value

`nil`

#### Possible values

Any number.
</Option>

<Option name="`format`">

Formats the value on the <Index /> and <Show /> views. Form inputs always keep the raw number.

#### Default value

`nil`

#### Possible values

`:delimited`, `:currency`, `:percentage`, or `:human`.
</Option>

## Formatting numbers

Use `format` for the common display formats provided by Rails:

```ruby
field :population, as: :number, format: :delimited
field :price, as: :number, format: :currency
field :margin, as: :number, format: :percentage
field :downloads, as: :number, format: :human
```

`format: :currency` uses `Avo.configuration.currency`. The other punctuation and wording come from Rails i18n, so delimiters and decimal separators follow the current locale.

On the <Index /> view, formatted numbers and their headers are end-aligned. Bare number fields remain unformatted and start-aligned, which is useful for identifier- or year-shaped values. All number columns use tabular figures so their digits line up between rows.

For formatting that these four values do not cover, use [`format_display_using`](../field-options.html#on-specific-views). Rails helpers are available directly inside the block:

```ruby
field :price_in_cents,
  as: :number,
  format_display_using: -> { number_to_currency(value / 100.0) }
```

`format_display_using` affects only <Index /> and <Show />, so the <Edit /> and <New /> inputs keep a valid raw numeric value. A custom display formatter takes precedence when it is combined with `format`.

## Examples

```ruby
field :age, as: :number, min: 0, max: 120, step: 5
```
