---
license: community
description: "Renders a number input element."
fieldTags: [number]
outline: [2, 3]
api_docs: ./number-api.html
---

# Number

The `number` field renders an `input[type="number"]` element in forms and displays numeric values on the <Index /> and <Show /> views.

```ruby
# app/avo/resources/user.rb
field :age, as: :number
```

By default, values are unformatted and Avo sets no minimum, maximum, or step constraint.

## Limit the input range

<span id="min"></span>
<span id="max"></span>
<span id="step"></span>

For a bounded value such as an age, set [`min`](./number-api.html#min) and [`max`](./number-api.html#max). Set [`step`](./number-api.html#step) to control valid increments:

```ruby
# app/avo/resources/user.rb
field :age, as: :number, min: 0, max: 120, step: 5
```

These are browser input constraints, not model validations. Add model validations when the limits must also be enforced on the server. Leaving `step` unset lets the browser apply its default step behavior; it does not enable arbitrary decimal input.

## Formatting numbers

<span id="format"></span>

Use [`format`](./number-api.html#format) for the common display formats provided by Rails:

```ruby
# app/avo/resources/statistic.rb
field :population, as: :number, format: :delimited
field :margin, as: :number, format: :percentage
field :downloads, as: :number, format: :human
```

The punctuation and wording come from Rails i18n, so delimiters and decimal separators follow the current locale.

There is no `:currency` format. For monetary values use the [`money`](./money) field, which handles the currency itself, or reach for `format_display_using` below.

On the <Index /> view, formatted numbers and their headers are end-aligned. Bare number fields remain unformatted and start-aligned, which is useful for identifier- or year-shaped values. All number columns use tabular figures so their digits line up between rows.

For formatting that these three values do not cover, use [`format_display_using`](../field-options.html#on-specific-views). Rails helpers are available directly inside the block:

```ruby
# app/avo/resources/product.rb
field :price_in_cents,
  as: :number,
  format_display_using: -> { number_to_currency(value / 100.0) }
```

`format_display_using` affects only <Index /> and <Show />, so the <Edit /> and <New /> inputs keep a valid raw numeric value. A custom display formatter takes precedence when it is combined with `format`.

## Link a number to its record

On the <Index /> view, set `link_to_record: true` to make the displayed number a link to the record. See [common field options](../field-options.html) for linking, placeholders, and shared display formatters.
