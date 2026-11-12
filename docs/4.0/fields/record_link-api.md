---
license: community
outline: [2, 3]
guide: ./record_link.html
prev:
  text: "Record link"
  link: "./record_link.html"
next: false
---

# Record link API

Per-option reference for the Record link field provided by `avo-record_link_field` `0.0.2`. For installation, tasks, and computed-value examples, see the [Record link guide](./record_link.html).

Pass these options to a field declaration in your resource's `fields` method, for example in `app/avo/resources/comment.rb`:

```ruby
field :post, as: :record_link, use_resource: "BigPost", add_via_params: false
```

The field displays a record's resource title as a link on Index and Show views and is hidden on New and Edit views. Its value must be a record with a configured resource; missing records or resources can cause rendering errors. For shared options, including computed values and visibility, see [Field options](../field-options.html).

## Destination and navigation

<Option name="`use_resource`">

Selects the resource used for both the destination URL and the link's record title. When absent or blank, the resource is resolved from the linked record's model class.

```ruby
field :post, as: :record_link, use_resource: "BigPost"
```

- **Type:** `String` or `Symbol` naming a resource.
- **Default:** `nil`
- **Values:** A CamelCase resource name such as `"BigPost"`, or a fully qualified name such as `"Avo::Resources::BigPost"`.

:::warning Resource lookup
Names are passed to Avo's resource lookup without camelizing snake_case identifiers. `"big_post"` does not resolve to `Avo::Resources::BigPost`. An unresolved resource is not validated when the field is declared and can cause a rendering error.
:::

</Option>

<Option name="`add_via_params`">

Adds `via_resource_class` and `via_record_id` query parameters to the destination URL. The values identify the linked record's resource class and the linked record's `to_param`, respectively, not the record containing the field.

```ruby
field :post, as: :record_link, add_via_params: false
```

- **Type:** `Boolean`
- **Default:** `true`

Only literal `false` disables the parameters. `nil` and non-Boolean values, including `"false"`, fall back to the default `true`.

</Option>

## Link browsing context

<Option name="`target`">

Accepted and stored by the field, but has no effect on the rendered link in `avo-record_link_field` `0.0.2`.

```ruby
field :post, as: :record_link, target: "_blank"
```

- **Type:** `String` or `Symbol`; stored without coercion.
- **Default:** `nil`

:::warning Not forwarded to the link
Neither the Index nor Show component passes this value to the shared link component. Its template reads an unset target, so configuring `target` does not open a new tab or set another browsing context.
:::

</Option>
