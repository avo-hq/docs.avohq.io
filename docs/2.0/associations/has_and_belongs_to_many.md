---
version: '1.0'
license: community
---

# Has And Belongs To Many

The `HasAndBelongsToMany` association works similarly to [`HasMany`](./has_many).

```ruby
field :users, as: :has_and_belongs_to_many
```

## Options
<!-- @include: ./../common/associations_searchable_option_common.md-->
<!-- @include: ./../common/associations_attach_scope_option_common.md-->
<!-- @include: ./../common/associations_scope_option_common.md-->
<!-- @include: ./../common/associations_description_option_common.md-->
<!-- @include: ./../common/associations_use_resource_option_common.md-->
<!-- @include: ./../common/associations_discreet_pagination_option_common.md-->
<!-- @include: ./../common/show_on_edit_common.md-->

### Searchable `has_many`

<div class="flex gap-2 mt-2">
  <VersionReq version="1.25" />
  <LicenseReq license="pro" title="Searchable associations are available as a pro feature" />
</div>


Similar to [`belongs_to`](./belongs_to#searchable-belongs-to), the `has_many` associations support the `searchable` option.


<!-- @include: ./../common/scopes_common.md-->
<!-- @include: ./../common/show_hide_buttons_common.md-->
