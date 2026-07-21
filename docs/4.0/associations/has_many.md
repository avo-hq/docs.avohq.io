---
license: community
field_type: has_many
description: "Displays a panel with the associated records below the resource's fields on the Show view."
fieldTags: [associations]
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
<!-- @include: ./../common/associations_name_option_common.md-->
<!-- @include: ./../common/associations_description_option_common.md-->
<!-- @include: ./../common/associations_loading_option_common.md-->
<!-- @include: ./../common/associations_use_resource_option_common.md-->
<!-- @include: ./../common/associations_attach_using_option_common.md-->
<!-- @include: ./../common/associations_discreet_pagination_option_common.md-->
<!-- @include: ./../common/associations_hide_search_input_option_common.md-->
<!-- @include: ./../common/associations_hide_filter_button_option_common.md-->
<!-- @include: ./../common/associations_link_to_child_resource_common.md-->


<!-- @include: ./../common/associations_linkable_option_common.md-->

## Has Many Through

The `HasMany` association also supports the `:through` option.

```ruby{3}
field :members,
  as: :has_many,
  through: :memberships
```
<Option name="`attach_fields`">

If you have extra fields defined in the through table and would like to display them when attaching use the `attach_fields` option.

```ruby{4,5,6}
field :patrons,
  as: :has_many,
  through: :patronships,
  attach_fields: -> {
    field :review, as: :text
  }
```

:::warning
If the through model uses **polymorphism**, the type must be included as a hidden field:

```ruby{6}
field :patrons,
  as: :has_many,
  through: :patronships,
  attach_fields: -> {
    field :review, as: :text
    field :patronship_type, as: :hidden, default: "TheType"
  }
```
:::

<Image src="/assets/img/4_0/associations/has-many-attach-fields.webm" dark-src="/assets/img/4_0/associations/has-many-attach-fields-dark.webm" width="1080" height="600" alt="An Avo Team show view: clicking Attach team member on the Team members has_many through association opens a modal with the member dropdown and an extra Review text field from attach_fields." />
</Option>

<!-- @include: ./../common/show_on_edit_common.md-->
<!-- @include: ./../common/nested_common.md-->
<!-- @include: ./../common/scopes_common.md-->
<!-- @include: ./../common/show_hide_buttons_common.md-->
<!-- @include: ./../common/reloadable.md-->
<!-- @include: ./../common/association.md-->
