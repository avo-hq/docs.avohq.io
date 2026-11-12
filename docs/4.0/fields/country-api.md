---
license: community
outline: [2, 3]
guide: ./country.html
prev:
  text: "Country"
  link: "./country.html"
next: false
---

# Country API

Per-option reference for the `Country` field. For setup and worked examples, see the [Country guide](./country.html).

Options are passed to the field declaration in `app/avo/resources/user.rb`:

```ruby
field :country, as: :country
```

<Option name="`display_code`">

Controls whether country codes or country names appear in the dropdown and on Index and Show views. The stored value remains the country code in either case. Dropdown entries remain sorted by country name.

```ruby
field :country, as: :country, display_code: true
```

| Value | Behavior |
| --- | --- |
| `false` | Displays country names. |
| `true` | Displays country codes. |

- **Type:** `Boolean`
- **Default:** `false`

:::warning
This option is not strictly validated or coerced to a Boolean. A nonblank value such as the string `"false"` enables code display.
:::

</Option>

<Option name="`default`">

<VersionReq package="avo" version="4.3.1" />

The [`default`](../field-options-api.html#default) value is the country **code**, the same value the database stores, not the country's name.

```ruby
field :country, as: :country, default: "SE" # opens the form on Sweden
```

- **Type:** `String` (an [ISO 3166-1](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) alpha-2 code), or a block returning one
- **Default:** `nil`

</Option>

<Option name="`include_blank`">

Controls the first, empty option passed to Rails' select helper. An omitted option uses the field's `include_blank` translation, falling back to `nil` when no translation is present. An explicit `nil` bypasses that translation lookup.

```ruby
field :country, as: :country, include_blank: "No country selected"
```

| Value | Behavior |
| --- | --- |
| `nil` | Leaves blank-option handling to Rails' select helper. |
| `true` | Adds an empty option labeled with the field's resolved placeholder, or an em dash if the placeholder is `nil`. |
| `false` | Does not explicitly add a blank option. |
| A string | Adds an empty option with that string as its label. |

- **Type:** `Boolean`, `String`, or `nil`
- **Default:** The field's `include_blank` translation, or `nil` when absent.
- **i18n key:** `avo.choose_a_country` ("Choose a country") supplies the default placeholder used when this option is `true`.

The placeholder can be overridden through [common field options](../field-options.html). This option does not enforce model-level presence validation.

</Option>

## Common field options

For labels, help text, placeholders, visibility, and other shared behavior, see [Common field options](../field-options.html).
