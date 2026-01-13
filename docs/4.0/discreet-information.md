---
license: community
---

# Discreet Information

Sometimes you need to have some information available on the record page, but not necesarily front-and-center.
This is where the `discreet_information` option is handy. You can use it to display one or more pieces of information.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = [
    :id,
    :timestamps,
    :created_at,
    :updated_at,
    {
      title: -> { sanitize("Product is <strong>#{record.published_at ? "published" : "draft"}</strong>", tags: %w[strong]) },
      icon: -> { "heroicons/outline/#{record.published_at ? "eye" : "eye-slash"}" }
    },
    {
      text: -> { record.published_at ? "🚀" : "😬" },
      url: -> { "https://avohq.io" },
      target: :_blank
    }
  ]
end
```

## Preconfigured options

Avo comes pre-configured with the `:id`, `:timestamps`, `:created_at`, and `:updated_at` types. You can use them as is, or you can add more to your liking.

<Option name="`:id`">

To save field space, you can use the discreet information area to display the current record's id using the `:id` option.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = :id

  # fields and other resource configuration
end
```

<!-- TODO: Add ss-->

</Option>

<Option name="`:timestamps`">

The reason why we built this feature was that we wanted a place to display the `created_at` and `updated_at` timestamps but didn't want to use up a whole field for it.

Set the option to the `:timestamps` value and a new icon will be added next to the title. When the user hovers over the icon, they will see the record's `created_at` and `updated_at` timestamps.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = :timestamps

  # fields and other resource configuration
end
```

<!-- TODO: Add ss-->

If the record doesn't have the `created_at` or `updated_at` attributes, they will be ommited.

You can alternatively use `:created_at` or `:updated_at` to display the timestamps as a key-value pair.

</Option>
<Option name="`:created_at`">

The `:created_at` option will display the `created_at` timestamp as a key-value pair.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = :created_at
end
```

<!-- TODO: Add ss-->

</Option>

<Option name="`:updated_at`">

The `:updated_at` option will display the `updated_at` timestamp as a key-value pair.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = :updated_at
end
```

<!-- TODO: Add ss-->

</Option>

## API

You may fully customize the discreet information item by taking control of different options.
To do that, you can set it to a `Hash` with various keys.

All options can take an [`ExecutionContext`](./execution-context) block where you have access to the `record`, `resource` and the rest of the [common objects](./execution-context#common-objects).

| Option             | Description                                                                    | Possible values                                             |
| ------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| [:as](#as)         | The type of representation you want to display                                 | `:badge`, `:key_value`                                      |
| [:title](#title)   | What you want displayed as a tooltip                                           |                                                             |
| [:url](#url)       | The url you want to redirect to                                                |                                                             |
| [:target](#target) | The link target you want to redirect to                                        | `:blank`, `:self`, `:parent`, `:top`                        |
| [:icon](#icon)     | The icon you want to display. Any Tabler, Heroicon or Avo icon you need        | `tabler/outline/cube`, `heroicons/outline/cube`, `avo/cube` |
| [:text](#text)     | The text you want to in a badge type                                           |                                                             |
| [:key](#key)       | The string value you want to display in the `key` field of a `:key_value` type |                                                             |
| [:value](#value)   | The value you want to display in the `value` field of a `:key_value` type      |                                                             |
| [:data](#data)     | The data you want to pass to the url                                           | `{ turbo_frame: :some_frame }`                              |

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    title: -> { "Product is #{record.published_at ? "published" : "draft"}" },
    icon: -> { "heroicons/outline/#{record.published_at ? "eye" : "eye-slash"}" }
    url: -> { main_app.post_path record }
    target: :_blank
  }
end
```

<Option name="`as`">

The `as` option specifies the type of representation. Possible values right now are `:text` (default), `:badge` and `:key_value`.

```ruby{7}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    title: -> { "Product is #{record.published_at ? "published" : "draft"}" },
    icon: "tabler/outline/bulb",
    url: -> { main_app. },
    as: :badge
  }
end
```

</Option>

<Option name="`title`">

Use the `title` option to set the body of the tooltip.

```ruby{4}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    title: -> { "Product is #{record.published_at ? "published" : "draft"}" },
  }
end
```

You may return HTML for that tooltip but don't forget to sanitize the output.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    title: -> { sanitize("Product is <strong>#{record.published_at ? "published" : "draft"}</strong>", tags: %w[strong]) },
  }
end
```

</Option>

<Option name="`url`">

The `url` option will transform the item into a link.

```ruby{6}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    title: -> { "Product is #{record.published_at ? "published" : "draft"}" },
    icon: "tabler/outline/bulb",
    url: -> { main_app.post_path record }
  }
end
```

</Option>

<Option name="`target`">

The `target` option will set the link target.

```ruby{7}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    title: -> { "Product is #{record.published_at ? "published" : "draft"}" },
    icon: "tabler/outline/bulb",
    url: -> { main_app.post_path record },
    target: :_blank
  }
end
```

</Option>

<Option name="`icon`">

The `icon` option will set the icon for the item.

```ruby{4}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    icon: "tabler/outline/bulb",
  }
end
```

You can use any [Tabler](https://tabler.io/icons), [Heroicon](https://heroicons.com) or [Avo](https://github.com/avo-hq/avo/tree/main/app/assets/svgs/avo) icon as described in the [Icons](./icons#libraries) documentation.

</Option>

<Option name="`text`">

The `text` option will set the text for the item in a `:badge` type.

```ruby{4}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    text: "Product is #{record.published_at ? "published" : "draft"}",
    as: :badge
  }
end
```

</Option>

<Option name="`key`">

The `key` option will set the key for the item in a `:key_value` type.

```ruby{4}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    key: "Status:",
    value: -> { record.published_at ? "published" : "draft" },
    as: :key_value
  }
end
```

</Option>

<Option name="`value`">

The `value` option will set the value for the item in a `:key_value` type.

```ruby{5}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    key: "Status:",
    value: -> { record.published_at ? "published" : "draft" },
    as: :key_value
  }
end
```

</Option>

## Possible full configuration

Here's a possible full configuration for the discreet information area.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = [
    :id,
    :timestamps,
    :created_at,
    :updated_at,
    {
      text: "label",
      as: :badge,
      title: -> { sanitize("View <strong>#{record.name}</strong> on site", tags: %w[strong]) },
      icon: -> { "heroicons/outline/arrow-top-right-on-square" },
      url: -> { main_app.root_url },
      target: :_blank
    },
    {
      text: -> { "Simple text #{record.id}" },
      as: :text,
      title: -> { sanitize("View <strong>#{record.name}</strong> on site", tags: %w[strong]) },
      icon: -> { "tabler/outline/external-link" },
      url: -> { main_app.root_url },
      visible: true
    },
    {
      text: "Test",
      as: :badge,
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
