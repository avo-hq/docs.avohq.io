---
license: community
outline: [2, 3]
api_docs: ./discreet-information-api.html
---

# Discreet Information

Sometimes you need some information available on the record page, but not necessarily front-and-center. The `discreet_information` resource option renders one or more small items — icons with tooltips, badges, links, or key-value pairs — next to the record title, without using up a whole field.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = [
    :timestamps,
    {
      as: :badge,
      text: -> { record.published_at ? "Published" : "Draft" },
      icon: -> { "heroicons/outline/#{record.published_at ? "eye" : "eye-slash"}" }
    }
  ]

  # fields and other resource configuration
end
```

By default the option is unset and nothing is rendered. You can pass a single item or an array of items; each item is either a preconfigured symbol or a `Hash` describing a custom item.

## Show the record's ID

Use the [`:id`](./discreet-information-api.html#:id) preconfigured item to display the current record's ID as a key-value pair, saving a field slot.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = :id
end
```

<!-- TODO: Add ss-->

## Show timestamps without using a field

The reason we built this feature was that we wanted a place to display the `created_at` and `updated_at` timestamps without dedicating a whole field to them.

Set the option to [`:timestamps`](./discreet-information-api.html#:timestamps) and an icon is added next to the title. Hovering over it reveals both timestamps in a tooltip.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = :timestamps
end
```

<!-- TODO: Add ss-->

If the record has neither a `created_at` nor an `updated_at` value, the item is omitted.

If you'd rather show a single timestamp as a visible key-value pair instead of a tooltip, use [`:created_at`](./discreet-information-api.html#:created_at) or [`:updated_at`](./discreet-information-api.html#:updated_at).

## Add a custom item

Pass a `Hash` to take full control of an item. Pick the representation with [`as`](./discreet-information-api.html#as) — `:text` (default), `:icon`, `:badge`, or `:key_value` — then set the options that type uses: [`text`](./discreet-information-api.html#text) for text and badge items, [`icon`](./discreet-information-api.html#icon), [`title`](./discreet-information-api.html#title) for the tooltip, or [`key`](./discreet-information-api.html#key) and [`value`](./discreet-information-api.html#value) for key-value items.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    as: :badge,
    text: -> { record.published_at ? "Published" : "Draft" },
    title: -> { "Product is #{record.published_at ? "published" : "draft"}" },
    icon: "tabler/outline/bulb"
  }
end
```

Every option accepts a static value or a block. Blocks run in an [`ExecutionContext`](./execution-context), so you have access to `record`, `resource`, and the rest of the [common objects](./execution-context#common-objects).

## Turn an item into a link

If you want an item to navigate somewhere, add a [`url`](./discreet-information-api.html#url). Use [`target`](./discreet-information-api.html#target) to control where it opens and [`data`](./discreet-information-api.html#data) to set data attributes on the item.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    as: :badge,
    text: "View on site",
    url: -> { main_app.post_path record },
    target: :_blank
  }
end
```

## Show an item conditionally

Set [`visible`](./discreet-information-api.html#visible) to a boolean or a block if an item should only appear in certain conditions.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    as: :badge,
    text: "Draft",
    visible: -> { record.published_at.nil? }
  }
end
```

## Full example

Here's a possible full configuration for the discreet information area, mixing preconfigured and custom items.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = [
    :id,
    :timestamps,
    :created_at,
    :updated_at,
    {
      as: :badge,
      text: "label",
      title: -> { sanitize("View <strong>#{record.name}</strong> on site", tags: %w[strong]) },
      icon: -> { "heroicons/outline/arrow-top-right-on-square" },
      url: -> { main_app.root_url },
      target: :_blank
    },
    {
      as: :text,
      text: -> { "Simple text #{record.id}" },
      title: -> { sanitize("View <strong>#{record.name}</strong> on site", tags: %w[strong]) },
      icon: -> { "tabler/outline/external-link" },
      url: -> { main_app.root_url },
      visible: true
    },
    {
      as: :badge,
      text: "Test",
      visible: false
    },
    {
      as: :key_value,
      key: "Key",
      value: "Value"
    },
    {
      as: :icon,
      icon: "tabler/outline/cube-3d-sphere",
      title: -> { Time.now }
    }
  ]

  # fields and other resource configuration
end
```
