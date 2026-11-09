---
license: community
description: "The KeyValue field makes it easy to edit flat key-value pairs stored in JSON format in the database."
fieldTags: [structured]
outline: [2, 3]
api_docs: ./key_value-api.html
---

# KeyValue

The `KeyValue` field makes it easy to edit flat key-value pairs stored in `JSON` format in the database.

```ruby
# app/avo/resources/user.rb
field :meta, as: :key_value
```

By default, users can edit keys and values, add and delete rows, and reorder rows by dragging. Labels use Avo's translations, suggestions are off, and the field is hidden on the Index view.

<Image src="/assets/img/4_0/fields/key_value/index.webp" dark-src="/assets/img/4_0/fields/key_value/index-dark.webp" width="1976" height="468" alt="An Avo New (create) form card showing a KeyValue field with three editable key/value rows (environment: production, region: eu-west, tier: premium), each row with a drag handle and a delete button, plus an add-row button in the Key/Value header." prompt="from create page" />

## Customize the labels

Set <span id="key_label"></span>[`key_label`](./key_value-api.html#key_label) and <span id="value_label"></span>[`value_label`](./key_value-api.html#value_label) to rename the column headers. Use <span id="action_text"></span>[`action_text`](./key_value-api.html#action_text), <span id="delete_text"></span>[`delete_text`](./key_value-api.html#delete_text), and <span id="reorder_text"></span>[`reorder_text`](./key_value-api.html#reorder_text) to change the add, delete, and drag-handle tooltips.

```ruby
# app/avo/resources/user.rb
field :meta,
  as: :key_value,
  key_label: "Meta key",
  value_label: "Meta value",
  action_text: "New item",
  delete_text: "Remove item",
  reorder_text: "Move item"
```

## Suggest common keys and values

<VersionReq package="avo" version="4.3.1" />

If your users keep typing the same keys, pass <span id="suggestions"></span>[`suggestions`](./key_value-api.html#suggestions) to offer them in a dropdown as the user types. Give a hash to also suggest values for each key. Once a row has a key, its value input suggests that key's values. Users can pick with the mouse or the arrow keys and Enter.

```ruby
# app/avo/resources/user.rb
field :headers,
  as: :key_value,
  suggestions: {
    "Content-Type" => ["application/json", "text/html"],
    "Accept" => ["application/json", "*/*"],
    "Authorization" => []
  }
```

Suggestions are only hints. Nothing is added to the record unless the user picks or types it, so an ignored suggestion never saves as an empty entry like `{"Content-Type": ""}`.

If you only want to suggest keys, pass an array. If the suggestions depend on the record, pass a block.

```ruby
# app/avo/resources/user.rb
field :headers, as: :key_value, suggestions: ["Content-Type", "Accept"]
```

```ruby
# app/avo/resources/user.rb
field :headers, as: :key_value, suggestions: -> { record.default_headers }
```

Suggestions don't show on keys or values whose editing is disabled, and keys already used by another row aren't suggested again.

## Enforce restrictions

If users should only fill in values for existing keys, set <span id="disable_editing_keys"></span>[`disable_editing_keys`](./key_value-api.html#disable_editing_keys) to `true`. This also prevents adding rows. Set <span id="disable_deleting_rows"></span>[`disable_deleting_rows`](./key_value-api.html#disable_deleting_rows) to keep the existing rows in place.

```ruby
# app/avo/resources/user.rb
field :meta,
  as: :key_value,
  disable_editing_keys: true,
  disable_deleting_rows: true
```

To prevent changes to values instead, use <span id="disable_editing_values"></span>[`disable_editing_values`](./key_value-api.html#disable_editing_values). To prevent new rows without locking existing keys, use <span id="disable_adding_rows"></span>[`disable_adding_rows`](./key_value-api.html#disable_adding_rows).

Avo applies the row and value restrictions again when the form is saved, so editing the submitted value directly cannot bypass them.

To disable key and value editing, adding rows, and deleting rows together, set <span id="disabled"></span>[`disabled`](./key_value-api.html#disabled) to `true`.

```ruby
# app/avo/resources/user.rb
field :meta, as: :key_value, disabled: true
```

## Common field options

For options shared with other field types, see [Common field options](../field-options.html).
