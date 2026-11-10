---
license: community
outline: [2, 3]
guide: ./money.html
prev:
  text: "Money"
  link: "./money.html"
next: false
---

# Money API

Per-option reference for the Money field. For installation and worked examples, see the [Money guide](./money.html).

Options are passed to the field declaration in `app/avo/resources/product.rb`:

```ruby
field :price, as: :money, currencies: %w[EUR USD RON PEN]
```

## Currency selection

<Option name="`currencies`">

The choices shown in the currency dropdown. The record's current currency determines the selected choice.

```ruby
field :price, as: :money, currencies: %w[EUR USD RON PEN]
```

- **Type:** Array of Strings (ISO currency codes).
- **Default:** `[]` (no choices).
- **Validation:** No field-level currency-code or inclusion validation. Choices are passed to Rails' `options_for_select`; the dropdown is not a model validation.

</Option>

<Option name="`enable_currency`">

Controls whether the currency selector is rendered and whether saving the field assigns the submitted currency to the record. When disabled, only the amount is assigned; the currency column is left untouched.

```ruby
field :price, as: :money, enable_currency: false
```

- **Type:** Boolean.
- **Default:** `true`.
- **Values:** `true` or `false`. `nil` and non-Boolean values fall back to `true`.

</Option>

## Currency storage

<Option name="`currency_suffix`">

The suffix appended to the field ID to form the currency attribute name. For `price`, `"_currency"` targets `price_currency`. This name is used by the selector and by currency assignment when saving.

```ruby
field :price, as: :money, currency_suffix: "_currency_code"
```

- **Type:** String or Symbol.
- **Default:** `MoneyRails::Configuration.currency_column[:postfix]` when `MoneyRails` is defined (normally `"_currency"`); otherwise `:_currency`.
- **Validation:** No field-level suffix validation. The generated attribute name must match the model's currency attribute; enabling currency assignment requires its setter.

</Option>

## Common field options

For inherited configuration, see [Common field options](../field-options.html).
