---
license: community
field_type: belongs_to
description: "Lets the user select an associated record from a belongs_to association."
fieldTags: [associations]
outline: [2, 3]
api_docs: ./belongs_to-api.html
---

# Belongs to

The `belongs_to` field lets users select an associated record on a form and follow a link to that record on index and show pages.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :user, as: :belongs_to
  end
end
```

By default, Avo infers the target resource from the Rails association, labels records with the target resource's title, and renders a dropdown on new and edit forms. Creation links are available when the target resource's policy permits them.

## View and change the associated record {#overview}

On index and show pages, the link displays the target resource's [`self.title`](../resources-api.html#self.title).

<Image src="/assets/img/4_0/associations/belongs-to-index.webp" dark-src="/assets/img/4_0/associations/belongs-to-index-dark.webp" width="1834" height="558" alt="Comments index table with ID and User columns, the User cell showing a belongs_to link to the associated record." />

<Image src="/assets/img/4_0/associations/belongs-to-show.webp" dark-src="/assets/img/4_0/associations/belongs-to-show-dark.webp" width="1440" height="212" alt="Post show view with a User belongs_to field linking to the associated user record inside a complete card." />

On new and edit forms, users choose a record from a dropdown.

<Image src="/assets/img/4_0/associations/belongs-to-edit.webp" dark-src="/assets/img/4_0/associations/belongs-to-edit-dark.webp" width="1440" height="284" alt="Post edit form with the User belongs_to dropdown showing available records inside a complete card." />

To hide the creation link, set [`can_create: false`](./belongs_to-api.html#can_create). To send index cell clicks to the current record instead of the associated record, set [`link_to_record: true`](./belongs_to-api.html#link_to_record); show links still open the association.

## Search a large set of records {#searchable}

Enable [`searchable`](./belongs_to-api.html#searchable) to replace the dropdown with a search-as-you-type picker. This requires the [Searchable associations add-on and search configuration](./searchable.html).

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :user, as: :belongs_to, searchable: true
  end
end
```

The standard dropdown is capped by [`config.associations[:lookup_list_limit]`](../associations.html) (1,000 by default). The current selection remains available even when it falls outside that list.

## Choose among different model types {#polymorphic-belongs-to}

For a Rails polymorphic association, provide both [`polymorphic_as`](./belongs_to-api.html#polymorphic_as) and [`types`](./belongs_to-api.html#types). Each model type needs an Avo resource.

```ruby
# app/models/comment.rb
class Comment < ApplicationRecord
  belongs_to :commentable, polymorphic: true
end

# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :body, as: :textarea
    field :commentable, as: :belongs_to,
      polymorphic_as: :commentable, types: [::Post, ::Project]
  end
end
```

<span id="polymorphic_help"></span>

### Explain the two dropdowns {#polymorphic-help}

The first dropdown selects a type, and the second selects a record. Use [`polymorphic_help`](./belongs_to-api.html#polymorphic_help) for the first dropdown and the shared [`help`](../field-options.html#help) option for the second.

```ruby
# app/avo/resources/review.rb
class Avo::Resources::Review < Avo::BaseResource
  def fields
    field :reviewable, as: :belongs_to,
      polymorphic_as: :reviewable,
      types: [::Post, ::Project, ::Team],
      polymorphic_help: "Choose the type of record to review",
      help: "Choose the record you need."
  end
end
```

<Image src="/assets/img/4_0/associations/polymorphic-help.webp" dark-src="/assets/img/4_0/associations/polymorphic-help-dark.webp" width="1440" height="1422" alt="New review form with a polymorphic Reviewable belongs_to field showing the type dropdown, record dropdown, polymorphic_help and help text inside a complete card." />

## Limit which records users can select {#belongs-to-attach-scope}

<DemoVideo demo-video="https://youtu.be/Eex8CiinQZ8?t=6" />

Use [`attach_scope`](./belongs_to-api.html#attach_scope) to narrow the dropdown or searchable picker. For example, exclude admins from a post's user selection:

```ruby
# app/models/user.rb
class User < ApplicationRecord
  scope :non_admins, -> { where "(roles->>'admin')::boolean != true" }
end

# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :user, as: :belongs_to, attach_scope: -> { query.non_admins }
  end
end
```

The callback exposes `query` and `parent`, the record being edited. On a new form, `parent` is an unsaved record. When creation starts through another association, Avo pre-fills that association, so a new post created through a category can use `parent.category_id` in its scope.

:::warning
Build on `query` to retain the resource's policy scope. Returning a fresh relation can widen access. Saving also checks the submitted record against the returned scope; records outside it are refused.
:::

## Change the association when arriving through a parent {#allow-detaching-via-the-association}

When a form is opened through its parent association, Avo normally disables the field pointing back to that parent. Set [`allow_via_detaching`](./belongs_to-api.html#allow_via_detaching) to let users change it. Shared `readonly` and `disabled` settings still take precedence.

```ruby
# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :commentable, as: :belongs_to,
      polymorphic_as: :commentable,
      types: [::Post, ::Project],
      allow_via_detaching: true
  end
end
```

## Choose a different resource

Use [`use_resource`](./belongs_to-api.html#use_resource) when the same model has multiple Avo resources. For STI associations, [`link_to_child_resource`](./belongs_to-api.html#link_to_child_resource) selects the resource for the associated record's concrete class. See the [association STI guide](../associations.html#link-to-child-resource-when-using-sti).

## Options reference {#options}

See the [Belongs to API](./belongs_to-api.html) for every field-specific option, [shared field options](../field-options.html) for labels, help, placeholders, visibility and form state, and the [associations guide](../associations.html) for shared association behavior.

| Option | Purpose |
| ------ | ------- |
| <span id="allow_via_detaching"></span><span id="allow-via-detaching"></span>[`allow_via_detaching`](./belongs_to-api.html#allow_via_detaching) | Change an association opened through a parent. |
| <span id="attach_scope"></span><span id="attach-scope"></span>[`attach_scope`](./belongs_to-api.html#attach_scope) | Limit eligible records. |
| <span id="polymorphic_as"></span><span id="polymorphic-as"></span>[`polymorphic_as`](./belongs_to-api.html#polymorphic_as) | Identify a polymorphic association. |
| <span id="types"></span>[`types`](./belongs_to-api.html#types) | List its model types. |
| [`polymorphic_help`](./belongs_to-api.html#polymorphic_help) | Explain the type dropdown. |
| <span id="use_resource"></span><span id="use-resource"></span>[`use_resource`](./belongs_to-api.html#use_resource) | Override resource inference. |
| <span id="can_create"></span><span id="can-create"></span>[`can_create`](./belongs_to-api.html#can_create) | Control creation links. |
| <span id="link_to_record"></span><span id="link-to-record"></span>[`link_to_record`](./belongs_to-api.html#link_to_record) | Link index cells to the current record. |
| <span id="link_to_child_resource"></span><span id="link-to-child-resource"></span>[`link_to_child_resource`](./belongs_to-api.html#link_to_child_resource) | Resolve STI child resources. |
| [`target`](./belongs_to-api.html#target) | Set the show link's Turbo Frame. |
