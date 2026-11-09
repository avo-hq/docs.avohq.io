---
license: community
outline: [2, 3]
guide: ./key_value.html
prev:
  text: "KeyValue"
  link: "./key_value.html"
next: false
---

# KeyValue API

Per-option reference for the `KeyValue` field. For tasks and worked examples, see the [KeyValue guide](./key_value.html).

Options are passed to the field declaration in an Avo resource, such as `app/avo/resources/user.rb`:

```ruby
field :meta, as: :key_value,
  key_label: "Meta key",
  value_label: "Meta value"
```

For shared configuration, see [Common field options](../field-options.html). The field is hidden on the Index view by default.

## Labels and tooltips

<Option name="`key_label`">

The key column header and key input placeholder.

```ruby
field :meta, as: :key_value, key_label: "Meta key"
```

- **Type:** `String`
- **Default:** `I18n.translate("avo.key_value_field.key")`
- **i18n key:** `avo.key_value_field.key` ("Key")

</Option>

<Option name="`value_label`">

The value column header and value input placeholder.

```ruby
field :meta, as: :key_value, value_label: "Meta value"
```

- **Type:** `String`
- **Default:** `I18n.translate("avo.key_value_field.value")`
- **i18n key:** `avo.key_value_field.value` ("Value")

</Option>

<Option name="`action_text`">

The add-row button tooltip.

```ruby
field :meta, as: :key_value, action_text: "New item"
```

- **Type:** `String`
- **Default:** `I18n.translate("avo.key_value_field.add_row")`
- **i18n key:** `avo.key_value_field.add_row` ("Add row")

</Option>

<Option name="`delete_text`">

The delete-row button tooltip.

```ruby
field :meta, as: :key_value, delete_text: "Remove item"
```

- **Type:** `String`
- **Default:** `I18n.translate("avo.key_value_field.delete_row")`
- **i18n key:** `avo.key_value_field.delete_row` ("Delete row")

</Option>

<Option name="`reorder_text`">

The drag-handle tooltip for reordering rows.

```ruby
field :meta, as: :key_value, reorder_text: "Move item"
```

- **Type:** `String`
- **Default:** `I18n.translate("avo.key_value_field.reorder_row")`
- **i18n key:** `avo.key_value_field.reorder_row` ("Reorder row")

</Option>

## Editing restrictions

Restrictions apply in forms and are enforced again on submission. For new records without a stored value, submission restrictions use the field's computed default as the starting value.

<Option name="`disabled`">

Disables key editing, value editing, adding rows, and deleting rows together. When `true`, it overrides the individual restriction options, even if they are explicitly `false`.

```ruby
field :meta, as: :key_value, disabled: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`disable_editing_keys`">

Disables key inputs and forces `disable_adding_rows` to `true`, regardless of its supplied value. Submitted keys not present in the stored data are discarded; deletion of existing keys is controlled separately by `disable_deleting_rows`.

```ruby
field :meta, as: :key_value, disable_editing_keys: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`disable_editing_values`">

Disables value inputs. On submission, values for retained keys are restored from stored data; new keys receive an empty string. Adding and deleting rows remain controlled by their respective options.

```ruby
field :meta, as: :key_value, disable_editing_values: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`disable_adding_rows`">

Prevents adding rows. On submission, keys not present in stored data are discarded. This is also enabled by `disable_editing_keys: true` or `disabled: true`.

```ruby
field :meta, as: :key_value, disable_adding_rows: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`disable_deleting_rows`">

Prevents deleting rows. On submission, stored entries missing from the submitted data are restored.

```ruby
field :meta, as: :key_value, disable_deleting_rows: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

## Suggested entries

<Option name="`suggestions`">

<VersionReq package="avo" version="4.3.1" />

Keys, and optionally values per key, offered as hints while editing. Suggestions are not saved unless picked or typed, and do not restrict which keys or values are accepted.

```ruby
field :headers, as: :key_value, suggestions: {
  "Content-Type" => ["application/json", "text/html"],
  "Accept" => ["application/json"]
}
```

| Value | Behavior |
| --- | --- |
| `Array` | Suggests keys only, for example `["Content-Type", "Accept"] |
| `Hash` | Maps suggested keys to their suggested values |
| `Proc` / `Lambda` | Evaluated to obtain an Array or Hash |
| `nil` or another result type | No suggestions |

- **Type:** `Array`, `Hash`, `Proc` / `Lambda`, or `nil`
- **Default:** `nil`
- **Context:** Blocks have access to `record`, `resource`, and `view`.
- **Normalization:** Keys are converted to strings. Hash values are wrapped in arrays and each value is converted to a string; `nil` becomes an empty array.
- **Display:** Form views only. Suggestions are hidden for disabled inputs, and keys used by another row are excluded from key suggestions.

:::info Suggestions are not validation
Suggestions do not create entries automatically or limit the submitted data to the listed choices. Enforce allowed keys and values with model validation when needed.
:::

</Option>
