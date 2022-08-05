---
version: '2.0'
license: community
---

# Select

The `Select` field renders a `select` field.

```ruby
field :type, as: :select, options: { 'Large container': :large, 'Medium container': :medium, 'Tiny container': :tiny }, display_with_value: true, placeholder: 'Choose the type of the container.'
```

We can configure it using the `options` attribute, which is a `Hash` with the `key` as the label and the `value` as the database value.

On **Index**, **Show** and **Edit** views you may want to display the values and not the labels of the options. You may change that by setting `display_value` to `true`.

The Select field also supports Active Record [enums](https://edgeapi.rubyonrails.org/classes/ActiveRecord/Enum.html). For that to work you only need switch `options` with `enum`.

```ruby
# app/models/project.rb
class Project < ApplicationRecord
  enum type: { 'Large container': 'large', 'Medium container': 'medium', 'Tiny container': 'small' }
end

# app/avo/resources/project_resource.rb
class ProjectResource < Avo::BaseResource
  field :type, as: :select, enum: ::Project.types, display_with_value: true, placeholder: 'Choose the type of the container.'
  # other fields go here
end
```

## Computed options

You may want to computed the values for your select field. You can use a lambda for that. That lambda gives you access to the `model`, `resource`, `view`, and `field` properties that you can pull data off.

```ruby
# app/avo/resources/project_resource.rb
class ProjectResource < Avo::BaseResource
  field :type, as: :select, options: ->(model: model, resource: resource, view: view, field: field) { model.get_types_from_the_database.map { |type| [type.name, type.id] } }, placeholder: 'Choose the type of the container.'
end
```

The output value must be a supported [`options_for_select`](https://apidock.com/rails/ActionView/Helpers/FormOptionsHelper/options_for_select) value.

## Include blank

The `Select` field also has the `include_blank` option. This can have three values.

If it's set to `false` (default) it will not show any blank option, but only the options you configured.

If it's set to `true` and you have a `placeholder` value assigned, it will use that placeholder string as the first option.

If it's a string `include_blank: "No country"`, the `No country` string will appear as the first option in the `<select>` and it will set the value empty or `nil` depending on your settings.