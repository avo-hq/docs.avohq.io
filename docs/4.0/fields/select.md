---
license: community
description: "Renders a select dropdown with configurable options."
fieldTags: [choice]
outline: [2, 3]
api_docs: ./select-api.html
---

# Select

The Select field renders a dropdown for choosing a value from a list. Choices can come from a label-to-value mapping, a model enum, or grouped options.

```ruby
# app/avo/resources/project.rb
field :container_size,
  as: :select,
  options: { "Large container" => "large", "Medium container" => "medium", "Tiny container" => "tiny" }
```

Supply a choice source for each field; Avo does not infer one from the model. By default, the field allows a single selection and displays labels rather than stored values. It does not add a blank choice unless configured or supplied by a translation.

## Define the available choices {#options}

Use [`options`](./select-api.html#options) to map the labels people see to the values your model stores. An array of strings can also serve as a list where labels and values are identical. For Rails-compatible option structures, see [`options_for_select`](https://apidock.com/rails/ActionView/Helpers/FormOptionsHelper/options_for_select).

### Compute choices for the current record {#computed-options}

If the choices depend on the record or request, use a lambda. It runs in an [ExecutionContext](../execution-context.html) with `record`, `resource`, `view`, and `field` available. Account for new records as well as persisted ones.

```ruby
# app/avo/resources/project.rb
field :container_size,
  as: :select,
  options: -> do
    { "Large container" => "large", "Medium container" => "medium", "Tiny container" => "tiny" }
  end
```

The lambda can return an array of label/value pairs when choices come from database records, such as `ContainerType.order(:name).pluck(:name, :id)` if your application defines that model.

<span id="grouped_options"></span>

## Organize choices into groups {#grouped-options}

Use [`grouped_options`](./select-api.html#grouped_options) to break a long list into labeled groups. Both Hash and Array structures accepted by Rails' [`grouped_options_for_select`](https://api.rubyonrails.org/classes/ActionView/Helpers/FormOptionsHelper.html#method-i-grouped_options_for_select) helper work in the dropdown.

```ruby
# app/avo/resources/project.rb
field :country,
  as: :select,
  grouped_options: {
    "North America" => [["United States", "US"], ["Canada", "CA"]],
    "Europe" => [["Denmark", "DK"], ["Germany", "DE"], ["France", "FR"]]
  }
```

Prefer the Hash form when you want index and show views to resolve stored values to labels. With an outer Array, those views display the stored value instead.

```ruby
# app/avo/resources/project.rb
field :country,
  as: :select,
  grouped_options: [
    ["North America", [["United States", "US"], "Canada"]],
    ["Europe", ["Denmark", "Germany", "France"]]
  ]
```

### Compute grouped choices {#computed-grouped-options}

If groups change dynamically, provide a lambda returning the same grouped structure. It has the same execution context as computed choices.

```ruby
# app/avo/resources/project.rb
field :country,
  as: :select,
  grouped_options: -> do
    {
      "North America" => [["United States", "US"], ["Canada", "CA"]],
      "Europe" => [["Denmark", "DK"], ["Germany", "DE"], ["France", "FR"]]
    }
  end
```

:::warning Choose one source
Use only one of `options`, `grouped_options`, or `enum` per field. Avo does not reject conflicting sources, and they can produce inconsistent dropdown and display values.
:::

## Use a model enum {#enum}

Pass your Active Record [enum](https://edgeapi.rubyonrails.org/classes/ActiveRecord/Enum.html) mapping to [`enum`](./select-api.html#enum). Avo uses enum keys as submitted values so Rails can assign the attribute.

```ruby
# app/models/project.rb
class Project < ApplicationRecord
  enum :container_size, { large: "large", medium: "medium", tiny: "small" }
end
```

```ruby
# app/avo/resources/project.rb
field :container_size,
  as: :select,
  enum: ::Project.container_sizes,
  display_value: true,
  placeholder: "Choose the type of the container.",
  include_blank: true
```

<span id="display_value"></span>

## Display stored values instead of labels {#display-value}

Set [`display_value`](./select-api.html#display_value) to show the values from a Hash instead of its labels. For example, the first example would display `large` rather than `Large container`, in both the dropdown and read-only views. This does not change which value the field stores.

For an enum, it displays the mapped value (`small` in the enum example) instead of the enum key (`tiny`). Array choices ignore this setting. See the reference for grouped-choice behavior.

<span id="include_blank"></span>

## Let users clear a selection {#include-blank}

Set [`include_blank`](./select-api.html#include_blank) to `true` to add an empty-valued choice labeled with the field's [`placeholder`](../field-options-api.html#placeholder). Without a custom placeholder or translation, the label is "Choose an option". Supply a string instead to give the blank choice its own label.

```ruby
# app/avo/resources/project.rb
field :container_size,
  as: :select,
  options: { "Large container" => "large", "Tiny container" => "tiny" },
  include_blank: "No type"
```

Whether an empty value is persisted as an empty string or `nil` depends on your model's attribute type and application logic. A placeholder alone does not add a blank choice.

## Allow more than one selection {#multiple}

Enable [`multiple`](./select-api.html#multiple) when the model attribute accepts an array of values. Ensure your model can persist that array, for example with a PostgreSQL array column. Avo removes blank entries on submission.

```ruby
# app/avo/resources/project.rb
field :categories,
  as: :select,
  options: { "News" => "news", "Tutorials" => "tutorials" },
  multiple: true
```

## Common field options

For labels, visibility, placeholders, and other shared settings, see [Common field options](../field-options.html).
