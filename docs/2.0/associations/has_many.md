---
version: '1.0'
license: community
---

# Has Many

The `HasMany` field is visible, by default, only on the `Show` view. You will see a new panel with the model's associated records below the regular fields panel.

```ruby
field :projects, as: :has_many
```

## Options
<!-- @include: ./../common/associations_searchable_option_common.md-->
<!-- @include: ./../common/associations_attach_scope_option_common.md-->
<!-- @include: ./../common/associations_scope_option_common.md-->
<!-- @include: ./../common/associations_description_option_common.md-->
<!-- @include: ./../common/associations_use_resource_option_common.md-->
<!-- @include: ./../common/associations_discreet_pagination_option_common.md-->

## Has Many Through

The `HasMany` association also supports the `:through` option.

```ruby{3}
field :members,
  as: :has_many,
  through: :memberships
```

## Overview
<!-- @todo -->

<!-- <img :src="('/assets/img/associations/has-many-table.jpg')" alt="Has many table" class="border mb-4" />

Here you may attach more records by clicking the "Attach" button.

<img :src="('/assets/img/associations/has-many-attach-modal.jpg')" alt="Has many attach" class="border mb-4" />

In a similar fashion, you may detach a model using the detach button.

<img :src="('/assets/img/associations/has-many-detach.jpg')" alt="Has many detach" class="border mb-4" /> -->

<!-- @include: ./../common/show_on_edit_common.md-->
<!-- @include: ./../common/scopes_common.md-->
<!-- @include: ./../common/show_hide_buttons_common.md-->
