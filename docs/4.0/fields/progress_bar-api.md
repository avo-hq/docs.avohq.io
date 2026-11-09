---
license: community
outline: [2, 3]
guide: ./progress_bar.html
prev:
  text: "Progress bar"
  link: "./progress_bar.html"
next: false
---

# Progress bar API

Per-option reference for the `progress_bar` field. For examples, see the [Progress bar guide](./progress_bar.html).

Options are passed to the field declaration in an Avo resource, such as `app/avo/resources/project.rb`:

```ruby
field :progress, as: :progress_bar, max: 100, step: 1, display_value: false, value_suffix: nil
```

See [Common field options](../field-options.html) for settings shared with other fields.

## Range

<Option name="`max`">

The maximum value of the progress element on Index and Show and the range input on Edit and New. The minimum is fixed at 0.

```ruby
field :progress, as: :progress_bar, max: 150
```

- **Type:** Numeric
- **Default:** `100`
- **Validation:** Avo does not validate this option; it is forwarded to the HTML `max` attribute. A meaningful range requires a positive maximum.

</Option>

<Option name="`step`">

The increment for the range input on Edit and New. It has no effect on the progress element on Index and Show.

```ruby
field :progress, as: :progress_bar, step: 10
```

- **Type:** Numeric or String
- **Default:** `1`
- **Values:** A positive number, or `"any"` to allow any value within the range.
- **Validation:** Avo does not validate this option; it is forwarded to the HTML `step` attribute.

</Option>

:::warning Browser constraints are not model validations
The slider's range and step constraints are handled by the browser. They do not validate the stored value on the server; model validations must enforce any required limits.
:::

## Value label

<Option name="`display_value`">

Controls whether the numeric value is visible beside the progress bar on Index and Show and above the slider on Edit and New.

```ruby
field :progress, as: :progress_bar, display_value: true
```

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`value_suffix`">

Text appended directly to the displayed value, without an added separator. It is only rendered when `display_value` is enabled and does not affect the stored number or convert it to a percentage.

```ruby
field :progress, as: :progress_bar, value_suffix: "%"
```

- **Type:** String or `nil`
- **Default:** `nil`

</Option>
