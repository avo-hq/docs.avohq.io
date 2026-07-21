---
outline: [2, 3]
license: community
betaStatus: Beta
demoVideo: "https://youtu.be/wnWvzQyyo6A?t=1475"
api_docs: ./field-discovery-api.html
---

# Field Discovery

Typically you [declare each field explicitly](./fields.html) in your resource. Field discovery is the alternative: `discover_columns` and `discover_associations` inspect your model's database columns and associations and configure the fields for you.

```rb{4-5}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    discover_columns
    discover_associations
  end
end
```

Called with no arguments, discovery maps every column and association using Avo's [default mappings](./field-discovery-api.html#default-mappings) — `string` columns become [`text`](./fields/text.html) fields, `belongs_to` associations become [`belongs_to`](./associations/belongs_to.html) fields, and so on. Rails enums are detected automatically and rendered as [`select`](./fields/select.html) fields, and sensitive columns like `encrypted_password` or `password_digest` are [never discovered](./field-discovery-api.html#ignored-columns).

<div class="aspect-video">
  <iframe width="100%" height="100%" src="https://www.youtube.com/embed/wnWvzQyyo6A?start=1475" title="Avo 3.17 - Media Library, new Markdown field &amp; the Array Adapter" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## Scope which fields are discovered

If you only want a few fields discovered, pass [`only`](./field-discovery-api.html#only). To discover everything except a few, pass [`except`](./field-discovery-api.html#except).

```rb{6-7}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  # ...

  def fields
    discover_columns only: [:title, :body, :published_at]
    discover_associations except: [:audit_logs]
  end
end
```

:::info
Rich text bodies and tags are discovered by `discover_columns`, while attachments and regular associations are discovered by `discover_associations`. Scope them from the matching method — `discover_associations only: [:tags]` has no effect.
:::

## Pass options to every discovered field

Any other keyword argument is [forwarded to every discovered field](./field-discovery-api.html#field_options). This is useful when you'd otherwise repeat the same option across many fields.

```rb{6-7}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  # ...

  def fields
    discover_columns help: "Automatically discovered fields"
    discover_associations searchable: false
  end
end
```

## Combine manual and discovered fields

Discovery plays nicely with explicit declarations — fields render in the order they're defined. Use `except` to avoid declaring a field twice.

```rb{6,8-9,11}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  # ...

  def fields
    field :custom_field, as: :text

    discover_columns except: [:custom_field]
    discover_associations

    field :another_custom_field, as: :boolean
  end
end
```

## Override how columns map to fields

Avo decides each column's field type by checking, in order: the model's Rails enums, the column's name, then the column's database type. You can override the last two globally from the initializer.

If a column *name* should always get a specific field, add it to [`column_names_mapping`](./field-discovery-api.html#column_names_mapping):

```rb{5-8}
# config/initializers/avo.rb
Avo.configure do |config|
  # ...

  config.column_names_mapping = {
    published_at: {field: :date_time},
    body: {field: :markdown}
  }
end
```

If a database *type* should map to a different field, use [`column_types_mapping`](./field-discovery-api.html#column_types_mapping):

```rb{5-8}
# config/initializers/avo.rb
Avo.configure do |config|
  # ...

  config.column_types_mapping = {
    jsonb: {field: :code, language: "json"},
    decimal: {field: :number, decimals: 2}
  }
end
```

Both merge on top of [Avo's built-in mappings](./field-discovery-api.html#default-mappings), so you only list the entries you want to change. Everything besides the `field` key is passed to the field as options.
