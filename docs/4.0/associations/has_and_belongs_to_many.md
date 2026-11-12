---
license: community
field_type: has_and_belongs_to_many
description: "Displays and manages the records of a has_and_belongs_to_many association."
fieldTags: [associations]
outline: [2, 3]
api_docs: ./has_and_belongs_to_many-api.html
---

# Has And Belongs To Many

The `has_and_belongs_to_many` field displays related records in an association table and lets users create, attach, and detach them. It works similarly to [`has_many`](./has_many.html), but the Rails association stores links in a join table without a separate join model.

```ruby
# app/avo/resources/team.rb
class Avo::Resources::Team < Avo::BaseResource
  def fields
    field :users, as: :has_and_belongs_to_many
  end
end
```

With no extra options, Avo infers the related resource, uses a select input for attaching records, and lazy-loads the table. The field appears on the configured default resource view (normally Show), not as an editable form input. Configure the Rails association and join table first; see the [associations overview](../associations.html).

## Choose records to attach

<span id="searchable"></span>
<span id="attach_using"></span>
<span id="attach-using"></span>
For large collections, enable [`searchable`](./has_and_belongs_to_many-api.html#searchable) and follow the [Searchable associations guide](./searchable.html) to configure the target resource's search query. For selecting several loaded records at once, use [`attach_using`](./has_and_belongs_to_many-api.html#attach_using) instead:

```ruby
# app/avo/resources/team.rb
field :users, as: :has_and_belongs_to_many, attach_using: :checkbox_list
```

The checkbox list includes client-side search over the loaded records and respects the association lookup limit. Configure the target resource's [`self.search[:item]`](../search-api.html#item) to add row titles, descriptions, images, or avatars, using the same presentation as the [CheckboxList field](../fields/checkbox_list.html).

<span id="attach_scope"></span>
<span id="attach-scope"></span>
If only some users may be attached, narrow [`attach_scope`](./has_and_belongs_to_many-api.html#attach_scope). For example, exclude users already on the team:

```ruby
# app/avo/resources/team.rb
field :users, as: :has_and_belongs_to_many,
  attach_scope: -> { query.where.not(id: parent.users.select(:id)) }
```

Build on `query` to retain the user's [policy scope](../authorization.html#limit-which-records-a-user-sees). The attach save accepts only records returned by this scope. This does not filter the existing association table.

## Filter the displayed records {#add-scopes-to-associations}

<DemoVideo demo-video="https://youtu.be/3ee9iq2CnzA" />

<span id="scope"></span>
Use [`scope`](./has_and_belongs_to_many-api.html#scope) to narrow the records shown in the panel, independently of the attach picker:

```ruby
# app/avo/resources/team.rb
field :users, as: :has_and_belongs_to_many,
  scope: -> { query.where(active: true) }
```

The relation already includes the associated resource's policy scope. The callback also exposes `parent`, `resource`, and `parent_resource`; see the API for their meanings.

<Image src="/assets/img/4_0/common/associations/scope.webp" dark-src="/assets/img/4_0/common/associations/scope-dark.webp" width="2144" height="696" alt="An association table filtered to matching records." />

## React to attaches and detaches {#attach-detach-hooks}

<VersionReq package="avo" version="4.3.11" />

Use [`before_attach`](./has_and_belongs_to_many-api.html#before_attach) or [`before_detach`](./has_and_belongs_to_many-api.html#before_detach) to reject a change, and [`after_attach`](./has_and_belongs_to_many-api.html#after_attach) or [`after_detach`](./has_and_belongs_to_many-api.html#after_detach) for notifications or audit entries:

```ruby
# app/avo/resources/team.rb
field :users, as: :has_and_belongs_to_many,
  after_attach: -> {
    Rails.logger.info "#{current_user&.id} attached user #{record.id} to team #{parent.id}"
  }
```

The before hooks run inside the change's transaction. Raise a regular error to reject the change; returning `false` does not stop it. After hooks run after commit, so their errors cannot undo the change. Detaching removes the join row, not the associated user.

:::warning
These hooks run only through the association's Attach and Detach controls, not through nested forms, Create, Delete, actions, or model code. Do not raise `ActiveRecord::Rollback`: Rails swallows it and the reason is not shown. Rescue errors in after hooks if a failed side effect should not fail the response.
:::

## Customize the panel

<span id="name"></span>
<span id="description"></span>
Give the table a clearer [`name`](./has_and_belongs_to_many-api.html#name) and [`description`](./has_and_belongs_to_many-api.html#description):

```ruby
# app/avo/resources/team.rb
field :users, as: :has_and_belongs_to_many,
  name: "Team members",
  description: "Users who can access this team."
```

<Image src="/assets/img/4_0/associations/associations-custom-label.webp" dark-src="/assets/img/4_0/associations/associations-custom-label-dark.webp" width="2144" height="1122" alt="An association panel with its custom title highlighted." />

<Image src="/assets/img/4_0/common/associations/description-option.webp" dark-src="/assets/img/4_0/common/associations/description-option-dark.webp" width="2140" height="790" alt="An association description highlighted beneath the panel title." />

<span id="per_page"></span>
<span id="per-page"></span>
<span id="discreet_pagination"></span>
<span id="discreet-pagination"></span>
<span id="hide_search_input"></span>
<span id="hide-search-input"></span>
<span id="hide_filter_button"></span>
<span id="hide-filter-button"></span>
Set [`per_page`](./has_and_belongs_to_many-api.html#per_page) for this table's page size, or [`discreet_pagination`](./has_and_belongs_to_many-api.html#discreet_pagination) to hide pagination details when there is only one page. Hide table controls with [`hide_search_input`](./has_and_belongs_to_many-api.html#hide_search_input) and [`hide_filter_button`](./has_and_belongs_to_many-api.html#hide_filter_button). These controls are separate from the attach picker's search.

<span id="linkable"></span>
Enable [`linkable`](./has_and_belongs_to_many-api.html#linkable) to open the association table on its own page in a new tab.

<Image src="/assets/img/4_0/associations/has-many-linkable.webp" dark-src="/assets/img/4_0/associations/has-many-linkable-dark.webp" width="1107" height="1003" alt="The open-in-new-tab icon highlighted beside an association title." />

## Defer or refresh the table

<span id="loading"></span>
Set [`loading`](./has_and_belongs_to_many-api.html#loading) to manual if the table is expensive and users do not always need it:

```ruby
# app/avo/resources/team.rb
field :users, as: :has_and_belongs_to_many,
  loading: { mode: :manual, auto_load_for: 5.minutes }
```

The placeholder offers a Load button and an inline Retry button if the fetch fails. Once opened, the frame is remembered in a per-record, per-frame cookie; return visits within the sliding window refresh that window. Set `auto_load_for: 0` or `nil` to show the placeholder on every visit. See [global association defaults](../customization.html#associations).

### Keep descriptions cheap {#remembering-an-opened-frame}

The description also renders on the manual placeholder. Avoid querying the database there, or branch on `loading_type`:

```ruby
# app/avo/resources/team.rb
field :users, as: :has_and_belongs_to_many, loading: :manual,
  description: -> { loading_type == :manual ? "Team members" : "#{query.count} members" }
```

<span id="Reloadable"></span>
<span id="reloadable"></span>
<span id="refresh_on_destroy"></span>
<span id="refresh-on-destroy"></span>
Enable [`reloadable`](./has_and_belongs_to_many-api.html#reloadable) for an icon that refreshes only the table. If deleting an associated record changes a parent counter or total, use [`refresh_on_destroy`](./has_and_belongs_to_many-api.html#refresh_on_destroy) to refresh the entire page after deletion.

<Image src="/assets/img/4_0/common/associations/reloadable.webp" dark-src="/assets/img/4_0/common/associations/reloadable-dark.webp" width="2140" height="132" alt="The reload icon highlighted beside an association title." />

## Choose a different resource or association

<span id="use_resource"></span>
<span id="use-resource"></span>
<span id="link_to_child_resource"></span>
<span id="link-to-child-resource"></span>
Set [`use_resource`](./has_and_belongs_to_many-api.html#use_resource) when the related model has more than one Avo resource. For STI links, [`link_to_child_resource`](./has_and_belongs_to_many-api.html#link_to_child_resource) chooses the child resource when available; see [STI associations](../associations.html#link-to-child-resource-when-using-sti).

<span id="for_attribute"></span>
<span id="for-attribute"></span>
Use [`for_attribute`](./has_and_belongs_to_many-api.html#for_attribute) to show the same Rails association under multiple field IDs, for example with separate scopes:

```ruby
# app/avo/resources/team.rb
field :users, as: :has_and_belongs_to_many
field :active_users, as: :has_and_belongs_to_many,
  for_attribute: :users, scope: -> { query.where(active: true) }
```

## Show the table on edit screens {#show-on-edit-screens}

Add `show_on: :edit` to render the association table on Edit as well. This is still the Show component, not a nested form. See [shared field visibility options](../field-options.html).

## Edit related records in the parent form {#nested-in-forms}

<span id="nested"></span>
For creation and editing in the same form, use [`nested`](./has_and_belongs_to_many-api.html#nested). This requires the `avo-nested` gem and Rails nested attributes:

```ruby
# Gemfile
gem "avo-nested", source: "https://packager.dev/avo-hq/"
```

Run `bundle install`; see [Gem server authentication](../gem-server-authentication.html) if the private source is not configured.

```ruby
# app/models/team.rb
class Team < ApplicationRecord
  has_and_belongs_to_many :users
  accepts_nested_attributes_for :users, allow_destroy: true
end
```

```ruby
# app/avo/resources/team.rb
field :users, as: :has_and_belongs_to_many,
  nested: { on: :forms, limit: 5 }
```

The nested form uses the child resource's edit fields. The limit hides Add when reached. `nested: true` enables both New and Edit; use `on: :new` or `on: :edit` for only one.

With `avo-nested` >= `4.3.3`, existing rows offer Delete only when `allow_destroy: true`. Delete asks for confirmation and marks the row pending with Undo until the parent form is saved. Saving removes only the join row; the user record is kept. Unsaved rows can always be removed. Translate these messages through `avo.nested.mark_for_deletion_confirmation` and `avo.nested.pending_deletion`; see [i18n](../i18n.html).

### Authorize nested changes {#authorization}

With authorization enabled, existing records must be inside the child's policy scope. Updates require the child's `update?` both before and after assigning submitted values: a refusal before assignment skips the row, while a refusal after assignment prevents saving. Deletions require `destroy?`, and refusal prevents saving. New rows require both the child's `create?` and the parent's `create_users?`; refusal prevents saving. The parent policy also controls whether Add is visible. With explicit authorization enabled, define `create_users?` on the parent policy to permit new nested rows. See [authorization](../authorization.html) and the [nested forms guide](../guides/add-nested-fields-to-forms.html).

## Control association buttons {#show-hide-buttons}

Use [association policy methods](../authorization.html#authorize-association-controls) to control Attach, Detach, Create, Destroy, and action buttons. Hiding a button is not a replacement for authorization.

<Image src="/assets/img/4_0/common/associations/authorization.webp" dark-src="/assets/img/4_0/common/associations/authorization-dark.webp" width="2140" height="790" alt="Association header controls and row actions highlighted." />

## Options reference {#options}

See the [Has And Belongs To Many API](./has_and_belongs_to_many-api.html) for all association-specific options and callback locals. General options such as visibility and labels are covered in [shared field options](../field-options.html).
