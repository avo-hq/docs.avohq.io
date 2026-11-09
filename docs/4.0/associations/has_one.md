---
license: community
field_type: has_one
description: "Displays the associated record's fields unfolded on the Show view."
fieldTags: [associations]
outline: [2, 3]
api_docs: ./has_one-api.html
---

# Has One

The `has_one` field displays the associated record's Show view as an unfolded panel on its parent's page. Users can attach or create a record when the association is empty, and detach an existing record, subject to authorization.

```ruby
# app/avo/resources/team.rb
class Avo::Resources::Team < Avo::BaseResource
  def fields
    field :admin, as: :has_one
  end
end
```

By default, the panel is hidden on forms, uses the resource inferred from the Rails association, and loads lazily. The attach modal uses a standard select unless searchable associations are enabled.

<Image src="/assets/img/4_0/associations/has-one-panel.webp" dark-src="/assets/img/4_0/associations/has-one-panel-dark.webp" width="2344" height="1764" alt="An Avo Team show view with the admin has_one association panel titled Admin, showing the unfolded child user record with its Id and user information fields plus the Detach control." />

## Choose which records users can attach

<span id="attach_scope"></span>
<span id="attach-scope"></span>
Use [`attach_scope`](./has_one-api.html#attach_scope) to narrow the attach picker. Build on `query` to retain the user's policy scope; `parent` is the team being edited. Saving also checks the resulting scope, so an ID outside it is refused.

```ruby
# app/avo/resources/team.rb
field :admin, as: :has_one,
  attach_scope: -> { query.where.not(team_id: parent.id) }
```

<span id="searchable"></span>
For a search-as-you-type picker, enable [`searchable`](./has_one-api.html#searchable) and configure the target resource's search. See [Searchable associations](./searchable.html) for the add-on requirements, query setup, and per-field overrides.

Use [association policy methods](../authorization.html#authorize-association-controls) to control who can attach, detach, or create a record. A scope filters candidates; it does not replace those permission checks.

## React to an attach or detach {#attach-detach-hooks}

<VersionReq package="avo" version="4.3.11" />

Use [`before_attach`](./has_one-api.html#before_attach) or [`before_detach`](./has_one-api.html#before_detach) to reject a change, and [`after_attach`](./has_one-api.html#after_attach) or [`after_detach`](./has_one-api.html#after_detach) for side effects after it commits.

```ruby
# app/avo/resources/team.rb
field :admin, as: :has_one,
  before_attach: -> {
    raise "This user is archived" if record.try(:archived?)
  },
  after_attach: -> {
    Rails.logger.info "User #{current_user&.id} attached #{record.id} to team #{parent.id}"
  }
```

Raise a regular error to stop a change; a false return value does not stop it. After-hook failures cannot undo a saved change. These hooks run only for the association's Attach and Detach operations, not nested forms, Create, deletes, or changes from application code. See the reference for replacement behavior and callback locals.

## Customize the association panel

### Explain the association {#description}

Set [`description`](./has_one-api.html#description) to explain the association on its manual-loading placeholder. In the current Has One components, the loaded record's header uses the target resource's description instead. The collection panel below illustrates association-description styling.

```ruby
# app/avo/resources/team.rb
field :admin, as: :has_one, description: "The user responsible for this team."
```

<Image src="/assets/img/4_0/common/associations/description-option.webp" dark-src="/assets/img/4_0/common/associations/description-option-dark.webp" width="2140" height="790" alt="An Avo has_many association titled User feedback with its description highlighted below the panel title." />

### Choose the associated resource {#use_resource}

<span id="use-resource"></span>
If several resources represent the same model, set [`use_resource`](./has_one-api.html#use_resource) to the resource class, or its fully qualified class name as a string.

```ruby
# app/avo/resources/team.rb
field :admin, as: :has_one, use_resource: Avo::Resources::User
```

### Open the associated record {#linkable}

Enable [`linkable`](./has_one-api.html#linkable) to add an icon that opens the associated record's Show page in a new tab. The image below illustrates the same control on a collection panel.

<Image src="/assets/img/4_0/associations/has-many-linkable.webp" dark-src="/assets/img/4_0/associations/has-many-linkable-dark.webp" width="1107" height="1003" alt="An Avo Team show page with the Memberships panel's open-in-new-tab icon highlighted." />

The [`linkable`](./has_one-api.html#linkable) control also accepts a callable, for example to show it only for administrators.

```ruby
# app/avo/resources/team.rb
field :admin, as: :has_one, linkable: true
```

<span id="reloadable"></span>
:::info
Although the field accepts [`reloadable`](./has_one-api.html#reloadable), the current Has One Show header does not render a reload icon. The image below shows the reload control on a collection association, not a Has One panel.
:::

<Image src="/assets/img/4_0/common/associations/reloadable.webp" dark-src="/assets/img/4_0/common/associations/reloadable-dark.webp" width="2140" height="132" alt="An Avo association header with the reload icon highlighted." />

## Load an expensive panel on demand {#loading}

Set [`loading`](./has_one-api.html#loading) to `:manual` to show a Load button instead of fetching the associated record's panel immediately. Failed requests show an inline Retry button. An empty `has_one` still shows its attach/create state.

```ruby
# app/avo/resources/team.rb
field :admin, as: :has_one, loading: :manual
```

### Remember an opened panel {#remembering-an-opened-frame}

Manual frames remember being opened for 15 minutes by default. Change the sliding window with `loading: { mode: :manual, auto_load_for: 5.minutes }`, or use `auto_load_for: 0` or `nil` to show the placeholder on every visit. Global defaults live in [`config.associations`](../customization.html#associations).

:::warning
A callable description runs even on the manual placeholder. Keep it cheap: the Has One description receives `loading_type` (`:manual` on the placeholder, otherwise `nil`), but no `query` local. Do not copy a collection-counting description into this field.
:::

## Attach through a join model {#has-one-through}

The field also works when the Rails association goes through a join model. There is no `through` option on the field; Avo reads it from the association.

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

- **Attaching** creates the join record through the association, which stamps the scope's attributes on it. The example above writes `level: "admin"` without you having to say so.
- **Attaching over an existing record** replaces the join record instead of adding a second one, matching how Rails treats a singular association.
- **Detaching** destroys only the join record the association points at. Other join rows linking the same two records, such as a `level: "member"` row for the same user, are left alone.

:::info
Because a singular association owns exactly one join record, detaching is checked against the record named in the URL. If the page you're looking at is stale and someone else has attached a different record in the meantime, the detach is a no-op rather than removing whatever happens to be attached now.
:::

### Collect extra join attributes {#attach_fields}

<span id="attach-fields"></span>
<VersionReq package="avo" version="4.0.25" />

If the join model has extra columns to fill in while attaching, declare them with [`attach_fields`](./has_one-api.html#attach_fields) to show them in the attach modal.

```ruby
# app/avo/resources/team.rb
field :admin,
  as: :has_one,
  attach_fields: -> {
    field :notes, as: :text
  }
```

The values land on the join record (`TeamMembership` above), alongside anything the association's scope writes. When you attach over an existing record, the fields are written to the same join row that gets replaced.

<VersionReq package="avo" version="4.3.5" />

Because the fields describe the join record, an association the join model declares works here too. With `TeamMembership` declaring `belongs_to :invited_by, class_name: "User", optional: true`, a `belongs_to` among the fields renders its usual picker and writes the join record's own foreign key:

```ruby{5}
field :admin,
  as: :has_one,
  attach_fields: -> {
    field :notes, as: :text
    field :invited_by, as: :belongs_to
  }
```

The picker offers what the target resource's [policy scope](./../authorization.html#limit-which-records-a-user-sees) holds, narrowed by that field's own [`attach_scope`](./belongs_to-api.html#attach_scope). A value matching no record there fails the whole attach, naming the field, and writes nothing.

:::warning
`attach_fields` only persists on a `has_one :through` association. On a plain `has_one` there's no join record to write to, so the fields have nowhere to land.
:::

## Show the panel while editing {#show-on-edit-screens}

Use the shared [`show_on`](../field-options-api.html#show_on) option to display the Show panel on the parent's Edit page. This does not embed the child's edit form.

```ruby
# app/avo/resources/team.rb
field :admin, as: :has_one, show_on: :edit
```

## Edit the child in the parent form {#nested-in-forms}

<span id="nested"></span>
Enable [`nested`](./has_one-api.html#nested) to create or edit the child alongside its parent. This requires the `avo-nested` gem and Rails nested attributes on the parent model.

```ruby
# Gemfile
gem "avo-nested", source: "https://packager.dev/avo-hq/"
```

Run `bundle install`. See [Gem server authentication](../gem-server-authentication.html) if packager.dev access is not configured.

```ruby
# app/models/team.rb
class Team < ApplicationRecord
  has_one :admin, class_name: "User"
  accepts_nested_attributes_for :admin, allow_destroy: true
end
```

```ruby
# app/avo/resources/team.rb
field :admin, as: :has_one, nested: true
```

To nest in only one form, use `nested: { on: :new }` or `nested: { on: :edit }`. The child uses its resource's edit fields.

### Remove a nested record

<VersionReq package="avo-nested" version="4.3.3" />

Unsaved children can be removed immediately. Existing children get a Delete button when the parent model sets `allow_destroy: true`. Confirmation marks the child for deletion, with an Undo link; saving the parent destroys it. The confirmation and pending notice use `avo.nested.mark_for_deletion_confirmation` and `avo.nested.pending_deletion`; see [i18n](../i18n.html).

### Authorize nested changes {#authorization}

With authorization enabled, existing children must be inside the child resource's policy scope. A child denied `update?` before assigning attributes is skipped; denial after assigning submitted attributes prevents saving. Deletion requires `destroy?`; refusal prevents saving. New children require both the child's `create?` and the parent's `create_admin?`; refusal prevents saving, and the parent permission also controls the Add button.

With [`explicit_authorization`](../authorization-api.html#explicit_authorization), define the parent's `create_admin?` to allow new children. See [association authorization](../authorization.html#authorize-association-controls).

## Options {#options}

See the [Has One API](./has_one-api.html) for every association-specific option and [shared field options](../field-options.html) for labels, visibility, and other common field configuration. For the overall association workflow, see [Associations](../associations.html).
