---
version: '1.0'
license: community
field_type: 'has_one'
---

:::warning
It's important to set the `inverse_of` as often as possible to your model's association attribute.
:::

# Has One

The `HasOne` association shows the unfolded view of your `has_one` association. It's like peaking on the `Show` view of that associated record. The user can also access the `Attach` and `Detach` buttons.

```ruby
field :admin, as: :has_one
```

<Image src="/assets/img/associations/has-one.jpg" width="919" height="824" alt="Has one" />

## Options

<!-- @include: ./../common/associations_searchable_option_common.md-->
<!-- @include: ./../common/associations_attach_scope_option_common.md-->

<!-- @include: ./../common/show_on_edit_common.md-->
<!-- @include: ./../common/nested_common.md-->
