---
license: community
description: "Displays a link to another record."
fieldTags: [display, associations]
outline: [2, 3]
---

# Record link

The `record_link` field displays a link to another record on index and show views. The record can come from an association, a model method, or a computed field block.

```ruby
# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :post, as: :record_link
  end
end
```

By default, Avo reads `comment.post`, finds a resource for that record's model, and uses that resource's record title as the link text. Links include navigation parameters, and the field is hidden on new and edit forms.

## Install the field

Add the field's gem to your application, then run `bundle install`:

```ruby
# Gemfile
gem "avo-record_link_field"
```

:::warning
The value must be a record with [a resource configured](./../resources.html#overview). A missing record or resource is not rendered as an empty link and can cause a rendering error.
:::

<Image src="/assets/img/4_0/fields/record_link/show.webp" dark-src="/assets/img/4_0/fields/record_link/show-dark.webp" width="1520" height="212" alt="An Avo show-view card containing a record_link field that displays a clickable link to the related Post record." prompt="record link field pointing to a related record" />

## Link to an associated record

Name the field after an association or method that returns a record. For example, a comment that belongs to a post works with the field declaration above:

```ruby
# app/models/comment.rb
class Comment < ApplicationRecord
  belongs_to :post
end
```

A `has_one` association or a model method returning a record works too. The field displays the related resource's title, not the record's raw object representation.

## Choose which resource opens {#use_resource}

If you have [multiple resources for the same model](./../resources.html#use-multiple-resources-for-the-same-model), set `use_resource` to choose the destination and the title used for the link. Without it, Avo uses its model-to-resource lookup.

Use the resource's CamelCase name or its fully qualified name, not a snake_case identifier:

```ruby
# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :post, as: :record_link, use_resource: "BigPost"
    field :admin, as: :record_link, use_resource: "AdminUser"
    field :thumbnail, as: :record_link, use_resource: "Avo::Resources::TinyPhoto"
  end
end
```

## Leave navigation parameters out of the URL {#add_via_params}

As with the [`belongs_to` field](./../associations/belongs_to.html), Avo adds `via_resource_class` and `via_record_id` parameters to support back-button navigation. The URL can be shared with teammates to keep the same navigation context.

If you want a URL without those parameters, set `add_via_params: false`:

```ruby
# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :post, as: :record_link, add_via_params: false
  end
end
```

For a linked project with ID `40`, the default URL is similar to `https://example.com/avo/resources/projects/40?via_record_id=40&via_resource_class=Avo%3A%3AResources%3A%3AProject`. Disabling the parameters produces `https://example.com/avo/resources/projects/40`.

## Using computed values

If the destination isn't available as an association or method, return a record from a field block. The block can use `record` to access the current record:

```ruby
# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :post, as: :record_link do
      Post.find(42)
    end

    field :creator, as: :record_link, use_resource: "AdminUser", add_via_params: false do
      user_id = SomeService.new(comment: record).fetch_user_id
      User.find(user_id)
    end
  end
end
```

The first field links to a URL such as `https://example.com/avo/resources/posts/42`. For a user with ID `31`, the second links to `https://example.com/avo/resources/admin_users/31`. Omit `use_resource` to use the default user resource instead, such as `https://example.com/avo/resources/users/31`.

## Open links in another tab {#target}

:::warning
In `avo-record_link_field` `0.0.2`, `target` is accepted by the field but is not passed to its link component. Setting `target: :blank` does not open a new tab. Links use the browser's default browsing context.
:::

## Common field options {#options}

For shared configuration such as field names, visibility, and computed values, see [Common field options](../field-options.html).
