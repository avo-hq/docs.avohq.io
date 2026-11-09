---
license: community
outline: [2, 3]
guide: ./id.html
prev:
  text: "ID"
  link: "./id.html"
next: false
---

# ID API

Per-option reference for the ID field. For tasks and examples, see the [ID guide](./id.html).

Declare the field in your resource's `fields` method, for example in `app/avo/resources/user.rb`:

```ruby
field :id, as: :id
```

## Defaults and value behavior

The ID field reads the declared attribute through the shared field value pipeline. With the declaration above, it displays the record's `id`; it does not generate or assign an identifier. Shared value overrides and display formatters still apply.

| Behavior | Default |
| --- | --- |
| Label | `"ID"`, unless a custom `name` is supplied |
| Sorting | Enabled (`sortable: true`) |
| Views | Displayed on Index and Show; hidden on forms |
| Read-only | Always enabled; `readonly: false` is overridden |
| Index rendering | Plain text unless field-level or global linking is enabled |
| Show rendering | The field value, without a record link |

For shared configuration, including `name`, `sortable`, visibility, and value formatting, see [Field options](../field-options.html).

## Record linking

<Option name="`link_to_record`">

Makes the displayed value on Index link to the record's Show page. It does not affect the Show view.

```ruby
field :id, as: :id, link_to_record: true
```

- **Type:** Boolean, interpreted using Ruby truthiness after blank values fall back to `false`.
- **Default:** `false`

The Index component enables linking when either this option or [`config.id_links_to_resource`](../customization-api.html#id_links_to_resource) is truthy. The global setting defaults to `false`; setting this field option to `false` does not override an enabled global setting.

:::warning Boolean strings
The option does not parse Boolean strings. A nonblank string such as `"false"` enables linking.
:::

</Option>
