---
outline: [2,3]
---

# Field Discovery

<VersionReq version="3.17.0">

`discover_columns` and `discover_associations` automatically detect and configure fields for your Avo resources based on your model's database structure.

```rb{6-7}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  # ...

  def fields
    discover_columns
    discover_associations
  end
end
```

## Options

<Option name="`only`">

Specify which fields should be discovered, excluding all others.

```rb{6-7}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  # ...

  def fields
    discover_columns only: [:title, :body, :published_at]
    discover_associations only: [:author, :comments]
  end
end
```

##### Default value

`nil`

#### Possible values

Array of symbols representing column or association names

</Option>

<Option name="`except`">

Specify which fields should be excluded from discovery.

```rb{6-7}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  # ...

  def fields
    discover_columns except: [:metadata, :internal_notes]
    discover_associations except: [:audit_logs]
  end
end
```

##### Default value

`nil`

#### Possible values

Array of symbols representing column or association names

</Option>

<Option name="`column_names_mapping`">

Override how specific column names are mapped to field types globally.

```rb{5-8}
# config/initializers/avo.rb
Avo.configure do |config|
  # ...

  config.column_names_mapping = {
    published_at: { field: :date_time, timezone: 'UTC' },
    role: { field: :select, enum: -> { User.roles } }
  }
end
```

##### Default value

`{}`

#### Possible values

Hash mapping column names to field configurations

</Option>

<Option name="`column_types_mapping`">

Override how database column types are mapped to field types globally.

```rb{5-8}
# config/initializers/avo.rb
Avo.configure do |config|
  # ...

  config.column_types_mapping = {
    jsonb: { field: :code, language: 'json' },
    decimal: { field: :number, decimals: 2 }
  }
end
```

##### Default value

`{}`

#### Possible values

Hash mapping database column types to field configurations

</Option>

## Examples

### Basic Discovery

```rb{6-7}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  # ...

  def fields
    discover_columns
    discover_associations
  end
end
```

### Custom Field Options

This will add the provided options to every discovered field or association. This is particularly useful when having duplicative configurations across many fields.

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

### Combining Manual and Discovered Fields

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

## Automatic Type Mapping

Field discovery maps database column types to Avo field types automatically.
e.g.

- `string` → `:text`
- `integer` → `:number`
- `float` → `:number`
- `datetime` → `:datetime`
- `boolean` → `:boolean`
- `json/jsonb` → `:code`

The full, up-to-date list can be found [here](https://github.com/avo-hq/avo/blob/main/lib/avo/mappings.rb)

## Association Discovery

The following associations are automatically configured:

- `belongs_to` → `:belongs_to`
- `has_one` → `:has_one`
- `has_many` → `:has_many`
- `has_one_attached` → `:file`
- `has_many_attached` → `:files`
- `has_rich_text` → `:trix`
- `acts-as-taggable-on :tags` → `:tags`

The full, up-to-date list can be found [here](https://github.com/avo-hq/avo/blob/main/lib/avo/mappings.rb)
