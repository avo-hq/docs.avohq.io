---
version: '1.0'
license: community
---

# Has One

The `HasOne` association shows the unfolded view of your `has_one` association. It's like peaking on the `Show` view of that associated record. The user also has access the `Attach` and `Detach` buttons.

```ruby
field :admin, as: :has_one
```

<img :src="('/assets/img/associations/has-one.jpg')" alt="Has one" class="border mb-4" />

## Options

<!-- @include: ./../common/associations_searchable_option_common.md-->
<!-- @include: ./../common/associations_attach_scope_option_common.md-->

:::option
#### Default

`false`

#### Possible values

`true`, `false`
:::

<!-- @include: ./../common/show_on_edit_common.md-->
