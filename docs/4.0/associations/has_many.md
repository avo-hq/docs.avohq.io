---
license: community
field_type: has_many
description: "Displays a panel with the associated records below the resource's fields on the Show view."
fieldTags: [associations]
outline: [2, 3]
api_docs: ./has_many-api.html
---

# Has Many

The `has_many` field displays a model's associated records in a separate panel, with controls to browse, attach, create, and remove records according to the user's permissions.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :projects, as: :has_many
  end
end
```

By default, the panel appears below the regular fields on the Show view, loads lazily, and uses the resource inferred from the Rails association. If your app changes `config.resource_default_view` to `:edit`, the panel follows that setting. The attach modal uses a select input unless you enable another picker.

See the [association overview](../associations.html) for model setup and [shared field options](../field-options.html) for visibility and other common settings.

## Choose which records to display {#add-scopes-to-associations}

Use [`scope`](./has_many-api.html#scope) to narrow the association table, for example to show only approved comments. Build on `query`, which already includes the target resource's policy scope.

<DemoVideo demo-video="https://youtu.be/3ee9iq2CnzA" />

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :comments, as: :has_many, scope: -> { query.where(approved: true) }
  end
end
```

The block can also use the parent record to select the rows. It does not change which records appear in the attach picker.

<Image src="/assets/img/4_0/common/associations/scope.webp" dark-src="/assets/img/4_0/common/associations/scope-dark.webp" width="2144" height="696" alt="A User feedback association scoped to matching comments on a User show page." />

To display the same association more than once, use different field IDs and point [`for_attribute`](./has_many-api.html#for_attribute) at the original association:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :comments, as: :has_many
    field :approved_comments, as: :has_many,
      for_attribute: :comments,
      scope: -> { query.where(approved: true) }
  end
end
```

## Help users attach records

Use [`attach_scope`](./has_many-api.html#attach_scope) to limit the attach picker, independently of the panel's rows. For example, offer only members not already assigned to this team:

```ruby
# app/avo/resources/team.rb
class Avo::Resources::Team < Avo::BaseResource
  def fields
    field :members, as: :has_many,
      attach_scope: -> { query.where.not(team_id: parent.id) }
  end
end
```

Build on `query` to preserve the policy scope. A fresh relation can widen that scope, and the attach save accepts exactly the records returned by the block.

For large collections, enable [`searchable`](./has_many-api.html#searchable) and follow [Searchable associations](./searchable.html) to configure the target resource's search. For selecting several records without server-side search, set [`attach_using`](./has_many-api.html#attach_using) to `:checkbox_list`. Its inline search only filters records already loaded, subject to the global association lookup limit. Customize rows through the target resource's [`self.search[:item]`](../search-api.html#item), using its title, description, image or avatar URL, image format, and image alt values. The picker uses the [CheckboxList](../fields/checkbox_list.html) presentation.

### Run code after attaching or detaching {#attach-detach-hooks}

<VersionReq package="avo" version="4.3.11" />

Use [`before_attach`](./has_many-api.html#before_attach) or [`before_detach`](./has_many-api.html#before_detach) to reject a change by raising a regular error. Use [`after_attach`](./has_many-api.html#after_attach) and [`after_detach`](./has_many-api.html#after_detach) for notifications or audit entries after the transaction commits.

```ruby
# app/avo/resources/team.rb
class Avo::Resources::Team < Avo::BaseResource
  def fields
    field :members, as: :has_many,
      after_attach: -> { Rails.logger.info "#{current_user&.id} added #{record.id} to #{parent.id}" }
  end
end
```

These hooks run only through the association's Attach and Detach controls, not through Create, nested forms, deletes, actions, API calls, or model code. See the [hook contracts](./has_many-api.html#attach-detach-hooks) for transaction and error behavior.

## Attach through a join model {#has-many-through}

Avo recognizes `has_many :through` from the Rails model's reflection; a `through:` option on the Avo field is not needed. Attach and detach respect a scope on the through association:

```ruby
# app/models/team.rb
class Team < ApplicationRecord
  has_many :admin_memberships, -> { where(level: :admin) }, class_name: "TeamMembership"
  has_many :admins, through: :admin_memberships, source: :user
end
```

Attaching a user stamps `level: "admin"` on the join record. Detaching removes that row without touching a `level: "member"` row linking the same records.

If the join model has extra attributes, declare them with [`attach_fields`](./has_many-api.html#attach_fields):

```ruby
# app/avo/resources/store.rb
class Avo::Resources::Store < Avo::BaseResource
  def fields
    field :patrons, as: :has_many,
      attach_fields: -> {
        field :review, as: :text
      }
  end
end
```

<VersionReq package="avo" version="4.3.5" />

The fields describe the **join record**, so an association the join model declares belongs there too. With the join model declaring `belongs_to :referrer, class_name: "User", optional: true`, a `belongs_to` among the fields renders its usual picker in the attach modal and writes the join record's own foreign key:

```ruby{6}
field :patrons,
  as: :has_many,
  through: :patronships,
  attach_fields: -> {
    field :review, as: :text
    field :referrer, as: :belongs_to
  }
```

The picker offers what the target resource's [policy scope](./../authorization.html#limit-which-records-a-user-sees) holds, narrowed by that field's own [`attach_scope`](./belongs_to-api.html#attach_scope). A value matching no record there fails the whole attach, naming the field (`Referrer is invalid`), and writes nothing: no join record is created.

:::warning
If the through model uses polymorphism, include the required type as a hidden field inside `attach_fields`, for example `field :patronship_type, as: :hidden, default: "TheType"`. Extra attach fields persist only for a through association.
:::

<Image src="/assets/img/4_0/associations/has-many-attach-fields.webm" dark-src="/assets/img/4_0/associations/has-many-attach-fields-dark.webm" width="1080" height="600" alt="An Attach team member modal with an extra Review text field from attach_fields." />

## Customize the panel

Change [`name`](./has_many-api.html#name) for a custom panel title, and add [`description`](./has_many-api.html#description) for explanatory text below it.

<Image src="/assets/img/4_0/associations/associations-custom-label.webp" dark-src="/assets/img/4_0/associations/associations-custom-label-dark.webp" width="2144" height="1122" alt="An association panel with its custom title highlighted." />

<Image src="/assets/img/4_0/common/associations/description-option.webp" dark-src="/assets/img/4_0/common/associations/description-option-dark.webp" width="2140" height="790" alt="An association panel with explanatory text highlighted beneath its title." />

<span id="remembering-an-opened-frame"></span>

For a heavy collection, set [`loading`](./has_many-api.html#loading) to `:manual`. Users see a Load button instead of fetching the table immediately. An opened frame is remembered for 15 minutes by default; change [`auto_load_for`](./has_many-api.html#auto_load_for) to adjust this sliding window, or set it to `0` or `nil` to show the placeholder again on every visit. Failed requests display an inline Retry button. Global defaults live in [`config.associations`](../customization.html#associations).

:::warning
A callable description runs even on the manual placeholder. Avoid queries there, or branch on `loading_type`:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :orders, as: :has_many, loading: :manual,
      description: -> { loading_type == :manual ? "Orders" : "#{query.count} orders" }
  end
end
```
:::

Add [`reloadable`](./has_many-api.html#reloadable) for a reload icon, or [`linkable`](./has_many-api.html#linkable) for an icon that opens the association table on its own page in a new tab.

<Image src="/assets/img/4_0/common/associations/reloadable.webp" dark-src="/assets/img/4_0/common/associations/reloadable-dark.webp" width="2140" height="132" alt="An association header with its reload icon highlighted." />

<Image src="/assets/img/4_0/associations/has-many-linkable.webp" dark-src="/assets/img/4_0/associations/has-many-linkable-dark.webp" width="1107" height="1003" alt="A Memberships association panel with its open-in-new-tab icon highlighted." />

Set [`per_page`](./has_many-api.html#per_page) for a different page size, [`discreet_pagination`](./has_many-api.html#discreet_pagination) to hide pagination details on a single page, [`hide_search_input`](./has_many-api.html#hide_search_input) to hide table search, or [`hide_filter_button`](./has_many-api.html#hide_filter_button) to hide filters. These controls affect the table, not the attach picker.

If deleting a child changes a parent counter or total, enable [`refresh_on_destroy`](./has_many-api.html#refresh_on_destroy) to reload the whole page instead of only the association table. The URL and success message are preserved.

## Choose the resource for associated records

Set [`use_resource`](./has_many-api.html#use_resource) when the association should use a different Avo resource. For STI rows, use [`link_to_child_resource`](./has_many-api.html#link_to_child_resource) to route links to the matching child resource. See [STI association setup](../associations.html#link-to-child-resource-when-using-sti), including configuring `self.model_class` on child resources.

## Show the panel while editing {#show-on-edit-screens}

Add `show_on: :edit` to display the association panel on Edit as well as the default view. This still renders the show component, not an inline association editor. See [field visibility](../field-options.html).

## Edit children with their parent {#nested-in-forms}

Install `avo-nested` to enable nested forms:

```ruby
# Gemfile
gem "avo-nested", source: "https://packager.dev/avo-hq/"
```

Run `bundle install`; see [Gem server authentication](../gem-server-authentication.html) if needed. Configure Rails nested attributes on the parent model and enable [`nested`](./has_many-api.html#nested) on the field:

```ruby
# app/models/book.rb
class Book < ApplicationRecord
  has_many :authors
  accepts_nested_attributes_for :authors, allow_destroy: true
end
```

```ruby
# app/avo/resources/book.rb
class Avo::Resources::Book < Avo::BaseResource
  def fields
    field :authors, as: :has_many, nested: { on: :forms, limit: 2 }
  end
end
```

The child resource's edit fields appear within the parent form. `nested: true` enables both New and Edit; use `on: :new` or `on: :edit` to restrict it. The limit hides Add when reached, rather than validating a database constraint.

### Delete children when saving the form

<VersionReq package="avo-nested" version="4.3.3" />

Unsaved rows can always be removed. Existing rows get Delete only when the model enables `allow_destroy: true`. Confirmation marks the row for deletion, dims it, and offers Undo; the record is destroyed only when the parent form saves. Translate the confirmation and pending notice through `avo.nested.mark_for_deletion_confirmation` and `avo.nested.pending_deletion` in your [locale files](../i18n.html).

### Authorize nested changes {#authorization}

Existing children must be inside the child resource's [policy scope](../authorization-api.html#Scope) and pass [`update?`](../authorization-api.html#update), both before and after submitted values are assigned. Rows outside the scope or initially denied updates are skipped; a refusal after assigning submitted values prevents the save. A deletion must pass [`destroy?`](../authorization-api.html#destroy); refusal prevents the save. New children need both the child policy's [`create?`](../authorization-api.html#create) and the parent policy's [`create_authors?`](../authorization-api.html#create_association); refusal prevents the save and the parent check also hides Add.

With [`explicit_authorization`](../authorization-api.html#explicit_authorization) enabled, define the parent's association creation method explicitly:

```ruby
# app/policies/book_policy.rb
class BookPolicy < ApplicationPolicy
  def create_authors?
    user.admin?
  end
end
```

## Control association actions {#show-hide-buttons}

Use [association policy methods](../authorization.html#authorize-association-controls) to control attach, detach, create, destroy, and action controls. Hiding a search or filter control is not authorization.

<Image src="/assets/img/4_0/common/associations/authorization.webp" dark-src="/assets/img/4_0/common/associations/authorization-dark.webp" width="2140" height="790" alt="An association panel with its header controls and row actions highlighted." />

## Options reference {#options}

See the [Has Many API](./has_many-api.html) for every association-specific option and callback contract, [shared field options](../field-options.html) for common field settings, and [Searchable associations](./searchable.html) for picker configuration.

| Option | Purpose |
| --- | --- |
| <span id="scope"></span>[`scope`](./has_many-api.html#scope) | Filter listed rows. |
| <span id="attach_scope"></span><span id="attach-scope"></span>[`attach_scope`](./has_many-api.html#attach_scope) | Filter attach choices. |
| <span id="searchable"></span>[`searchable`](./has_many-api.html#searchable) | Search-as-you-type picker. |
| <span id="attach_using"></span><span id="attach-using"></span>[`attach_using`](./has_many-api.html#attach_using) | Checkbox-list attach picker. |
| <span id="attach_fields"></span><span id="attach-fields"></span>[`attach_fields`](./has_many-api.html#attach_fields) | Extra join-model fields. |
| <span id="name"></span>[`name`](./has_many-api.html#name) | Panel title. |
| <span id="description"></span>[`description`](./has_many-api.html#description) | Panel explanatory text. |
| <span id="loading"></span>[`loading`](./has_many-api.html#loading) | Lazy or manual frame loading. |
| <span id="use_resource"></span><span id="use-resource"></span><span id="default-4"></span>[`use_resource`](./has_many-api.html#use_resource) | Choose an Avo resource. |
| <span id="link_to_child_resource"></span><span id="link-to-child-resource"></span>[`link_to_child_resource`](./has_many-api.html#link_to_child_resource) | STI row links. |
| <span id="linkable"></span>[`linkable`](./has_many-api.html#linkable) | Open the table in another tab. |
| <span id="Reloadable"></span><span id="reloadable"></span>[`reloadable`](./has_many-api.html#reloadable) | Reload the frame. |
| <span id="for_attribute"></span><span id="for-attribute"></span>[`for_attribute`](./has_many-api.html#for_attribute) | Reuse a model association. |
| <span id="per_page"></span><span id="per-page"></span>[`per_page`](./has_many-api.html#per_page) | Association page size. |
| <span id="discreet_pagination"></span><span id="discreet-pagination"></span>[`discreet_pagination`](./has_many-api.html#discreet_pagination) | Hide single-page pagination details. |
| <span id="hide_search_input"></span><span id="hide-search-input"></span>[`hide_search_input`](./has_many-api.html#hide_search_input) | Hide table search. |
| <span id="hide_filter_button"></span><span id="hide-filter-button"></span>[`hide_filter_button`](./has_many-api.html#hide_filter_button) | Hide table filters. |
| <span id="refresh_on_destroy"></span><span id="refresh-on-destroy"></span>[`refresh_on_destroy`](./has_many-api.html#refresh_on_destroy) | Reload the page after deletion. |
| <span id="nested"></span>[`nested`](./has_many-api.html#nested) | Edit children within the parent form. |
