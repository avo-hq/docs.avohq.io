---
version: '2.0'
license: community
---

# KeyValue

<img :src="('/assets/img/fields/key-value.jpg')" alt="KeyValue field" class="border mb-4" />

The `KeyValue` field allows you to edit flat key-value pairs stored in `JSON` format in the database.

```ruby
field :meta, as: :key_value
```

## Customizing the labels

You can easily customize the labels displayed in the UI by mentioning custom values in `key_label`, `value_label`, `action_text`, and `delete_text` properties when defining the field.

```ruby
field :meta, # The database field ID
  as: :key_value, # The field type.
  key_label: 'Meta key', # Custom value for key header. Defaults to 'Key'.
  value_label: 'Meta value', # Custom value for value header. Defaults to 'Value'.
  action_text: 'New item', # Custom value for button to add a row. Defaults to 'Add'.
  delete_text: 'Remove item' # Custom value for button to delete a row.. Defaults to 'Delete'.
```

## Enforce restrictions

You can enforce some restrictions by removing the ability to edit the field's key, by setting `disable_editing_keys` to `true`. Be aware that this option will also disable adding rows as well. You can separately remove the ability to add a new row by setting `disable_adding_rows` to `true`. Deletion of rows can be enforced by setting `disable_deleting_rows` to `true`.

```ruby
field :meta, # The database field ID
  as: :key_value, # The field type.
  disable_editing_keys: false, # Option to disable the ability to edit keys. Implies disabling to add rows. Defaults to false.
  disable_adding_rows: false, # Option to disable the ability to add rows. Defaults to false.
  disable_deleting_rows: false # Option to disable the ability to delete rows. Defaults to false.
```

`KeyValue` is hidden on **Index** view.