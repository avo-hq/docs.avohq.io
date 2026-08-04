---
license: community
field_type: has_one
description: "Displays the associated record's fields unfolded on the Show view."
fieldTags: [associations]
---

# Has One

The `HasOne` association shows the unfolded view of your `has_one` association. It's like peaking on the `Show` view of that associated record. The user can also access the `Attach` and `Detach` buttons.

```ruby
field :admin, as: :has_one
```

<Image src="/assets/img/4_0/associations/has-one-panel.webp" dark-src="/assets/img/4_0/associations/has-one-panel-dark.webp" width="2344" height="1764" alt="An Avo Team show view with the admin has_one association panel titled Admin, showing the unfolded child user record with its Id and user information fields plus the Detach control." />

## Options

<!-- @include: ./../common/associations_searchable_option_common.md-->
<!-- @include: ./../common/associations_attach_scope_option_common.md-->
<!-- @include: ./../common/associations_description_option_common.md-->
<!-- @include: ./../common/associations_loading_option_common.md-->
<!-- @include: ./../common/associations_use_resource_option_common.md-->
<!-- @include: ./../common/associations_linkable_option_common.md-->

## Has One Through

The `HasOne` association also works when the underlying Rails association goes through a join model. There's no `through` option on the field — Avo reads it off the association itself.

```ruby
# app/models/team.rb
class Team < ApplicationRecord
  has_one :admin_membership, -> { where level: :admin }, class_name: "TeamMembership"
  has_one :admin, through: :admin_membership, source: :user
end
```

```ruby
# app/avo/resources/team.rb
field :admin, as: :has_one
```

`Attach` and `Detach` operate on the join record for you, always through the association itself, so any scope you put on it is respected:

- **Attaching** creates the join record through the association, which stamps the scope's attributes on it — the example above writes `level: "admin"` without you having to say so.
- **Attaching over an existing record** replaces the join record instead of adding a second one, matching how Rails treats a singular association.
- **Detaching** destroys only the join record the association points at. Other join rows linking the same two records — a `level: "member"` row for the same user, say — are left alone.

:::info
Because a singular association owns exactly one join record, detaching is checked against the record named in the URL. If the page you're looking at is stale and someone else has attached a different record in the meantime, the detach is a no-op rather than removing whatever happens to be attached now.
:::

<Option name="`attach_fields`">

<VersionReq version="4.0.25" />

If the join model has extra columns you want to fill in while attaching, declare them with `attach_fields` and they'll show up in the attach modal.

```ruby{3,4,5}
field :admin,
  as: :has_one,
  attach_fields: -> {
    field :notes, as: :text
  }
```

The values land on the join record (`TeamMembership` above), alongside anything the association's scope writes. When you attach over an existing record, the fields are written to the same join row that gets replaced.

:::warning
`attach_fields` only persists on a `has_one :through` association. On a plain `has_one` there's no join record to write to, so the fields have nowhere to land.
:::
</Option>

<!-- @include: ./../common/show_on_edit_common.md-->
<!-- @include: ./../common/nested_common.md-->
<!-- @include: ./../common/reloadable.md-->
