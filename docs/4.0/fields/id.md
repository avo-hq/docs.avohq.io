---
version: '1.0'
license: community
---

# ID

The `id` field is used to show the record's id. By default, it's visible only on the `Index` and `Show` views. That is a good field to add the `link_to_record` option to make it a shortcut to the record `Show` page.

```ruby
field :id, as: :id
```

## Options

<!-- @include: ./../common/link_to_record_common.md-->

