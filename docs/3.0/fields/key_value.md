---
version: '1.0'
license: community
---

# KeyValue

<img :src="('/assets/img/fields/key-value.jpg')" alt="KeyValue field" class="border mb-4" />

The `KeyValue` field makes it easy to edit flat key-value pairs stored in `JSON` format in the database.

```ruby
field :meta, as: :key_value
```

## Options

:::option `key_label`
Customize the label for the key header.

#### Default

`I18n.translate("avo.key_value_field.key")`

#### Possible values

Any string value.
:::

:::option `value_label`
Customize the label for the value header.

#### Default

`I18n.translate("avo.key_value_field.value")`

#### Possible values

Any string value.
:::

:::option `action_text`
Customize the label for the add row button tooltip.

#### Default

`I18n.translate("avo.key_value_field.add_row")`

#### Possible values

Any string value.
:::

:::option `delete_text`
Customize the label for the delete row button tooltip.

#### Default

`I18n.translate("avo.key_value_field.delete_row")`

#### Possible values

Any string value.
:::

:::option `disabled`
Toggle on/off the ability to disable editing keys, editing values, adding rows, and deleting rows for that field.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `disable_editing_keys`
Toggle on/off the ability to edit the keys for that field. Turning this off will allow the user to customize only the value fields.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `disable_editing_values`
Toggle on/off the ability to edit the values for that field. Turning this off will allow the user to customize only the key fields.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `disable_adding_rows`
Toggle on/off the ability to add new rows.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `disable_deleting_rows`
Toggle on/off the ability to delete rows from that field. Turning this on will prevent the user from deleting existing rows.

<!-- @include: ./../common/default_boolean_false.md-->
:::

## Customizing the labels

You can easily customize the labels displayed in the UI by mentioning custom values in `key_label`, `value_label`, `action_text`, and `delete_text` properties when defining the field.

```ruby
field :meta, # The database field ID
  as: :key_value, # The field type.
  key_label: "Meta key", # Custom value for key header. Defaults to 'Key'.
  value_label: "Meta value", # Custom value for value header. Defaults to 'Value'.
  action_text: "New item", # Custom value for button to add a row. Defaults to 'Add'.
  delete_text: "Remove item" # Custom value for button to delete a row. Defaults to 'Delete'.
```

## Enforce restrictions

You can enforce some restrictions by removing the ability to edit the field's key or value by setting `disable_editing_keys` or `disable_editing_values` to `true` respectively. If `disable_editing_keys` is set to `true`, be aware that this option will also disable adding rows as well. You can separately remove the ability to add a new row by setting `disable_adding_rows` to `true`. Deletion of rows can be enforced by setting `disable_deleting_rows` to `true`.

```ruby
field :meta, # The database field ID
  as: :key_value, # The field type.
 disable_editing_keys: false, # Option to disable the ability to edit keys. Implies disabling to add rows. Defaults to false.
  disable_editing_values: false, # Option to disable the ability to edit values. Defaults to false.
  disable_adding_rows: false, # Option to disable the ability to add rows. Defaults to false.
  disable_deleting_rows: false # Option to disable the ability to delete rows. Defaults to false.
```

Setting `disabled: true` enforces all restrictions by disabling editing keys, editing values, adding rows, and deleting rows collectively.
```ruby
field :meta, # The database field ID
  as: :key_value, # The field type.
  disabled: true, # Option to disable editing keys, editing values, adding rows, and deleting rows. Defaults to false.
```
`KeyValue` is hidden on the `Index` view.
