---
license: community
outline: [2, 3]
guide: ./number.html
prev:
  text: "Number"
  link: "./number.html"
next: false
---

# Number API

Per-option reference for the `number` field. For examples and tasks, see the [Number guide](./number.html).

Options are passed to the field declaration in an Avo resource's `fields` method:

```ruby
field :age, as: :number, min: 0, max: 120, step: 5
```

For shared options such as `link_to_record`, `placeholder`, and `format_display_using`, see [common field options](../field-options.html).

## Input constraints

<Option name="`min`">

Sets the number input's `min` attribute on forms.

```ruby
field :age, as: :number, min: 0
```

- **Type:** `Numeric` or numeric `String`, converted to `Float` when present.
- **Default:** `nil` (attribute omitted).
- **Validation:** No Avo range validation; the attribute supplies a browser constraint, not a model validation.

</Option>

<Option name="`max`">

Sets the number input's `max` attribute on forms.

```ruby
field :age, as: :number, max: 120
```

- **Type:** `Numeric` or numeric `String`, converted to `Float` when present.
- **Default:** `nil` (attribute omitted).
- **Validation:** No Avo range validation; the attribute supplies a browser constraint, not a model validation.

</Option>

<Option name="`step`">

Sets the number input's `step` attribute on forms. Fractional steps allow decimal increments.

```ruby
field :weight, as: :number, step: 0.1
```

- **Type:** `Numeric` or numeric `String`, converted to `Float` when present.
- **Default:** `nil` (attribute omitted; the browser's default step applies).
- **Validation:** No Avo step validation; valid increments are checked by the browser.

</Option>

:::warning Numeric coercion
Blank `min`, `max`, and `step` values become `nil`. Present values are converted with `to_f`, not strictly parsed or validated. Non-numeric strings, including `step: "any"`, become `0.0`; the HTML `"any"` step value is not supported by these options.
:::

## Display formatting

<Option name="`format`">

Formats values on the <Index /> and <Show /> views without changing form inputs. On the <Index /> view, a configured format also end-aligns the column and its header. All number cells use tabular figures.

```ruby
field :population, as: :number, format: :delimited
```

| Value | Behavior |
| ----- | -------- |
| `nil` | Displays the value without a built-in formatter; index cells and headers remain start-aligned. |
| `:delimited` | Uses Rails `number_with_delimiter`. |
| `:percentage` | Uses Rails `number_to_percentage` with `strip_insignificant_zeros: true`. |
| `:human` | Uses Rails `number_to_human`. |

Rails i18n controls punctuation and wording. Shared custom formatters such as `format_display_using` take precedence over this built-in formatting.

- **Type:** `Symbol` or `String`, normalized with `to_sym`, or `nil`.
- **Default:** `nil`.
- **Values:** `:delimited`, `:percentage`, `:human`, or their string equivalents; `nil` disables formatting.
- **Validation:** An unsupported symbol or string raises `ArgumentError` when the field is initialized. Values that do not support `to_sym` raise `NoMethodError`.

</Option>
