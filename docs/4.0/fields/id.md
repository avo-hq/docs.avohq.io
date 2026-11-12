---
license: community
description: "The id field is used to show the record's id."
fieldTags: [display]
outline: [2, 3]
api_docs: ./id-api.html
---

# ID

The `id` field displays a record's identifier on the Index and Show views. It provides a sortable ID column and can turn each ID in the index table into a shortcut to that record's Show page.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id
  end
end
```

By default, the field is labeled "ID", is sortable, and is hidden on forms. It is always read-only. IDs render as plain text unless linking is enabled on the field or globally.

## Open records from the ID column

Set [`link_to_record`](./id-api.html#link_to_record) to `true` to make the ID in each index row link to the record's Show page. It does not turn the ID on the Show view into a link.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true
  end
end
```

To link every ID column without configuring each field, enable [`config.id_links_to_resource`](../customization-api.html#id_links_to_resource). Setting `link_to_record: false` on a field does not disable linking when that global setting is enabled.

## Disable sorting by ID

If readers should not sort the table by this column, set [`sortable`](../field-options-api.html#sortable) to `false`:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, sortable: false
  end
end
```

## Options reference

See the [ID API](./id-api.html) for the field's declaration, defaults, value behavior, and linking option. For shared configuration such as labels and visibility, see [Common field options](../field-options.html).
