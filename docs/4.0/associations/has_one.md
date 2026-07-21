---
license: community
field_type: has_one
description: "Displays the associated record's fields unfolded on the Show view."
fieldTags: [associations]
---

:::warning
It's important to set the `inverse_of` as often as possible to your model's association attribute.
:::

# Has One

The `HasOne` association shows the unfolded view of your `has_one` association. It's like peaking on the `Show` view of that associated record. The user can also access the `Attach` and `Detach` buttons.

```ruby
field :admin, as: :has_one
```

<Image src="/assets/img/4_0/associations/has-one-panel.webp" dark-src="/assets/img/4_0/associations/has-one-panel-dark.webp" width="2344" height="1764" alt="An Avo Team show view with the admin has_one association panel titled Admin, showing the unfolded child user record with its Id and user information fields plus the Detach control." />

## Options

<!-- @include: ./../common/associations_searchable_option_common.md-->
<!-- @include: ./../common/associations_attach_scope_option_common.md-->
<!-- @include: ./../common/associations_loading_option_common.md-->

<!-- @include: ./../common/show_on_edit_common.md-->
<!-- @include: ./../common/nested_common.md-->
