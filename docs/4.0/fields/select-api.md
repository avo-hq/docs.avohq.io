---
license: community
outline: [2, 3]
guide: ./select.html
prev:
  text: "Select"
  link: "./select.html"
next: false
---

# Select API

Per-option reference for the Select field. For tasks and worked examples, see the [Select guide](./select.html).

Options are passed to a field declaration in `app/avo/resources/project.rb`:

```ruby
field :container_size, as: :select, options: { "Large container" => "large" }
```

For options common to all fields, including `placeholder`, see [Common field options](../field-options.html).

## Choice sources

:::warning Conflicting or missing sources
Use one of `options`, `grouped_options`, or `enum`. Avo does not validate their exclusivity or infer choices from a model enum. An unconfigured field can fail when it tries to look up a label or render choices.
:::

<Option name="`options`">

The ungrouped choices. Hash keys are labels and values are submitted values. A directly supplied Hash is converted to `ActiveSupport::HashWithIndifferentAccess`; a Hash returned by a callable is not converted.

```ruby
field :container_size, as: :select, options: { "Large container" => "large", "Tiny container" => "tiny" }
```

- **Type:** `Hash`, `Array`, or `Proc` / `Lambda` returning either.
- **Default:** `nil` (a nonblank `enum` supplies choices when `options` is not a Hash).
- **Values:** Hash of label/value pairs, Array of values, or Array of label/value pairs supported by Rails' [`options_for_select`](https://apidock.com/rails/ActionView/Helpers/FormOptionsHelper/options_for_select).
- **Context:** Callables run in an [ExecutionContext](../execution-context.html) with `record`, `resource`, `view`, and `field`.
- **Validation:** No explicit shape validation. Non-Array results follow Hash-specific rendering paths.

:::info Array display
Array choices are passed to Rails without label/value transformation. Index and show views display the stored value, not the label from an array pair; multiple values are joined with `", "`. `display_value` has no effect on arrays.
:::

</Option>

<Option name="`grouped_options`">

Choices organized into labeled HTML option groups. Nonblank grouped choices take precedence in the edit dropdown.

```ruby
field :country, as: :select, grouped_options: {
  "North America" => [["United States", "US"], ["Canada", "CA"]],
  "Europe" => [["Denmark", "DK"], ["Germany", "DE"]]
}
```

- **Type:** `Hash`, `Array`, or `Proc` / `Lambda` returning either.
- **Default:** `nil`.
- **Values:** Grouped structures accepted by Rails' [`grouped_options_for_select`](https://api.rubyonrails.org/classes/ActionView/Helpers/FormOptionsHelper.html#method-i-grouped_options_for_select).
- **Context:** Callables run in an [ExecutionContext](../execution-context.html) with `record`, `resource`, `view`, and `field`.
- **Validation:** No explicit shape validation; dropdown choices are passed to the Rails helper.

For index and show views, an outer Hash supports resolving values to labels. Each group can contain a label/value Hash, an Array of label/value pairs, or an Array of simple values. Matching compares string representations. Unknown values fall back to their string representation, and multiple labels are joined with `", "`.

:::warning Outer Array display
An outer Array renders groups in the dropdown, but index and show views fall back to `value.to_s` rather than resolving labels. This also applies when `multiple` is enabled.
:::

</Option>

<Option name="`enum`">

An Active Record enum mapping. By default, both dropdown labels and submitted values use enum keys. Read-only views display the current enum key.

```ruby
field :container_size, as: :select, enum: ::Project.container_sizes
```

- **Type:** `Hash` (including the `ActiveSupport::HashWithIndifferentAccess` returned by an Active Record enum).
- **Default:** `nil`.
- **Values:** A mapping such as `{ "large" => "large", "medium" => "medium", "tiny" => "small" }`.
- **Validation:** No explicit validation that the mapping belongs to the model. This option is not evaluated as a callable.

With `display_value: true`, the mapping is inverted for the dropdown: mapped values become labels and enum keys remain submitted values. Index and show views look up the mapped value using the record's enum key. For integer-backed enums, the displayed value can therefore be an integer.

</Option>

## Display and selection

<Option name="`display_value`">

Controls whether choices display labels or their mapped values. It does not change the stored value.

```ruby
field :container_size, as: :select, options: { "Large container" => "large" }, display_value: true
```

| Choice source | `false` | `true` |
| --- | --- | --- |
| `options` Hash | Displays Hash keys | Displays Hash values in the dropdown and the stored value in read-only views |
| `options` Array | Displays the supplied choices in the dropdown and stored values in read-only views | Same behavior; ignored |
| `enum` | Displays enum keys | Displays mapped enum values |
| `grouped_options` Hash | Resolves labels in read-only views | Resolves mapped values in read-only views; dropdown labels are unchanged |
| `grouped_options` Array | Displays `value.to_s` in read-only views | Same behavior; dropdown labels are unchanged |

- **Type:** `Boolean`.
- **Default:** `false`.
- **Values:** `true`, `false`.

</Option>

<Option name="`include_blank`">

Controls the empty-valued choice passed to Rails' select helper. An explicit value overrides the field's `include_blank` translation.

```ruby
field :container_size, as: :select, options: ["large", "tiny"], include_blank: "No type"
```

| Value | Behavior |
| --- | --- |
| `nil` | No explicit blank choice requested |
| `false` | Disables the blank choice |
| `true` | Uses the field's resolved placeholder as the blank label |
| `String` | Uses that string as the blank label |

- **Type:** `Boolean`, `String`, or `nil`.
- **Default:** The field's `include_blank` translation, or `nil` when absent.
- **i18n key:** Resource-scoped or shared field translation's `include_blank` entry, resolved through the field's `translation_key`; see [field translations](../field-options.html).
- **i18n key:** `avo.choose_an_option` ("Choose an option"), the Select field's default placeholder when `include_blank: true`.

For `true`, placeholder resolution honors an explicit `placeholder`, then a placeholder translation, then `avo.choose_an_option` ("Choose an option"). If the resolved placeholder is `nil` or `false`, the blank label falls back to a dash. A placeholder alone is not a blank choice. Model casting determines how an empty submitted value is stored.

</Option>

<Option name="`multiple`">

Enables multiple selections and permits an array parameter for the field. Blank array entries are removed before assignment to the model.

```ruby
field :categories, as: :select, options: ["news", "tutorials"], multiple: true
```

- **Type:** `Boolean` or `nil`.
- **Default:** `nil` (single selection).
- **Values:** `true` enables multiple selections; `false` and `nil` use a single selection.
- **Validation:** Avo does not configure array persistence; the model attribute must accept the submitted array.

</Option>
