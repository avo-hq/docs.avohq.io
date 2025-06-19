---
version: '1.0'
license: community
---

# Select

The `Select` field renders a `select` field.

```ruby
field :type, as: :select, options: { 'Large container': :large, 'Medium container': :medium, 'Tiny container': :tiny }, display_value: true, placeholder: 'Choose the type of the container.'
```

<Option name="`options`">

A `Hash` representing the options that should be displayed in the select. The keys represent the labels, and the values represent the value stored in the database.

The options get cast as `ActiveSupport::HashWithIndifferentAccess` objects if they are a `Hash`.

#### Default

`nil`

#### Possible values

- `{ 'Large container': :large, 'Medium container': :medium, 'Tiny container': :tiny }` or any other `Hash`.
- A lambda function that returns a `Hash` (computed options)

### Computed options

You may want to compute the values on the fly for your `Select` field. You can use a lambda for that where you have access to the `record`, `resource`, `view`, and `field` properties where you can pull data off.

```ruby{5-7}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  field :type,
    as: :select,
    options: -> do
      record.get_types_from_the_database.map { |type| [type.name, type.id] }
    end,
    placeholder: 'Choose the type of the container.'
end
```

The output value must be a supported [`options_for_select`](https://apidock.com/rails/ActionView/Helpers/FormOptionsHelper/options_for_select) value.
</Option>

<Option name="`grouped_options`">

When you need to organize your select options into groups, you can use `grouped_options` instead of `options`. This creates optgroups in the select field, making it easier for users to navigate large sets of options.

The `grouped_options` supports the same data structures as Rails' [`grouped_options_for_select`](https://api.rubyonrails.org/classes/ActionView/Helpers/FormOptionsHelper.html#method-i-grouped_options_for_select) helper.

#### Default

`nil`

#### Possible values

You can use either **Array syntax** or **Hash syntax**:

**Array syntax:**
```ruby
field :country,
  as: :select,
  grouped_options: [
    ['North America', [['United States', 'US'], 'Canada']],
    ['Europe', ['Denmark', 'Germany', 'France']]
  ]
```

**Hash syntax:**
```ruby
field :country,
  as: :select,
  grouped_options: {
    'North America' => [['United States', 'US'], 'Canada'],
    'Europe' => ['Denmark', 'Germany', 'France']
  }
```

### Computed grouped options

Just like with regular options, you can compute grouped options dynamically using a lambda:

```ruby
field :country,
  as: :select,
  grouped_options: -> do
    {
      'North America' => Country.north_american.map { |c| [c.name, c.code] },
      'Europe' => Country.european.map { |c| [c.name, c.code] },
      'Asia' => Country.asian.map { |c| [c.name, c.code] }
    }
  end
```

:::warning
You should use either `options`, `grouped_options`, or `enum` - not multiple at the same time.
:::

</Option>

<Option name="`enum`">

Set the select options as an Active Record [enum](https://edgeapi.rubyonrails.org/classes/ActiveRecord/Enum.html). You may use `options` or `enum`, not both.

```ruby{3,10}
# app/models/project.rb
class Project < ApplicationRecord
  enum type: { 'Large container': 'large', 'Medium container': 'medium', 'Tiny container': 'small' }
end

# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  field :type,
    as: :select,
    enum: ::Project.types,
    display_value: true,
    placeholder: 'Choose the type of the container.'
end
```

#### Default

`nil`

#### Possible values

`Post::statuses` or any other `enum` stored on a model.
</Option>

<Option name="`display_value`">

You may want to display the values from the database and not the labels of the options. You may configure this behaviour by setting `display_value` to `true`. Note that this setting has no effect if an array of options is provided.

```ruby{5}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  field :type,
    as: :select,
    display_value: true
end
```

<!-- @include: ./../common/default_boolean_false.md-->
</Option>

<Option name="`include_blank`">

The `Select` field also has the `include_blank` option. That can have three values.

If it's set to `false` (default), it will not show any blank option but only the options you configured.

If it's set to `true` and you have a `placeholder` value assigned, it will use that placeholder string as the first option.

If it's a string `include_blank: "No country"`, the `No country` string will appear as the first option in the `<select>` and will set the value empty or `nil` depending on your settings.

```ruby{5}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  field :type,
    as: :select,
    include_blank: 'No type'
end
```

#### Default

`nil`

#### Possible values

`nil`, `true`, `false`, or a string to be used as the first option.
</Option>

<Option name="`multiple`">

<VersionReq version="3.17.3" />

If it's set to `false` (default), it will only allow selecting a single option from the list.

If it's set to `true`, it will enable multiple selections, allowing users to choose more than one option at a time.

```ruby{5}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  field :categories,
    as: :select,
    multiple: true
end
```

#### Default

`false`

#### Possible values

`true` or `false`

</Option>
