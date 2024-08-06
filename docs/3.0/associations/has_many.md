---
version: '1.0'
license: community
field_type: 'has_many'
---

# Has Many

By default, the `HasMany` field is visible only on the `Show` view. You will see a new panel with the model's associated records below the regular fields panel.

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
<!-- @include: ./../common/associations_hide_search_input_option_common.md-->
<!-- @include: ./../common/associations_link_to_child_resource_common.md-->

<!-- @include: ./../common/search_query_scope_common.md-->


<Option name="`linkable`">
You can add use this option to make the association title clickable. That link will open a new page with the same view.

This feature doesn't go deeper than this. It just helps you see the association table easier in a separate page.

<Image src="/assets/img/3_0/has_many/linkable.gif" width="1200" height="875" alt="" />
</Option>

## Has Many Through

The `HasMany` association also supports the `:through` option.

```ruby{3}
field :members,
  as: :has_many,
  through: :memberships
```
<Option name="`attach_fields`">

<VersionReq version="3.11" />

If you have extra fields defined in the through table and would like to display them when attaching use the `attach_fields` option.

```ruby{4,5,6}
field :patrons,
  as: :has_many,
  through: :patronships,
  attach_fields: -> {
    field :review, as: :text
  }
```

<Image src="/assets/img/3_0/has_many/attach-fields.gif" width="600" height="338" alt="" />
</Option>

<!-- @include: ./../common/show_on_edit_common.md-->
<!-- @include: ./../common/scopes_common.md-->
<!-- @include: ./../common/show_hide_buttons_common.md-->
<!-- @include: ./../common/reloadable.md-->
<!-- @include: ./../common/association.md-->
