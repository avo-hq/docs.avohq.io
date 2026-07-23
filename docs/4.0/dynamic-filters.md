---
feedbackId: 838
license: addon
addon_link: https://avohq.io/addons/dynamic-filters
outline: [2, 3]
api_docs: ./dynamic-filters-api.html
---

# Dynamic filters

Dynamic filters let users compose their own filtering on the <Index /> view. You declare which fields are filterable; Avo renders a filters bar where the user picks an attribute, a condition (`Contains`, `Is`, `>=`, `Is null`, …), and a value — and can stack as many conditions as they need. Queries are built with [Ransack](https://github.com/activerecord-hackery/ransack) behind the scenes.

```ruby{4-6}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  def fields
    field :name, as: :text
    field :status, as: :status, filterable: true
    field :stage, as: :badge, filterable: true
    field :country, as: :country, filterable: true
  end
end
```

With no further configuration, each filterable field gets a [filter type inferred from its field type](./dynamic-filters-api#field-to-filter-mapping), a humanized label, a default icon, and that type's [default conditions](./dynamic-filters-api#filter-types-and-their-conditions). The filters bar is always visible on the resources where at least one field is filterable.

## Authorize the attributes for Ransack

Since Ransack builds the queries, every filterable attribute must be present in the model's `ransackable_attributes` list:

```ruby{3,11}
# app/models/project.rb
class Project < ApplicationRecord
  def self.ransackable_attributes(auth_object = nil)
    ["status", "stage", "country"] # the array items should be strings not symbols
  end
end

# Or authorize ALL attributes at once

class Project < ApplicationRecord
  def self.ransackable_attributes(auth_object = nil)
    authorizable_ransackable_attributes
  end
end
```

:::warning
Ensure the array items are strings, not symbols.
:::

## How conditions combine

When multiple filters are applied:

- Filters on the **same attribute** are combined with `OR`
- Filters on **different attributes** are combined with `AND`

For example, two filters on `name` (one for "John", one for "Jane") find records where the name is either "John" `OR` "Jane". A filter on `name` for "John" plus a filter on `status` for "active" finds records where the name is "John" `AND` the status is "active".

## Filter types

The filter type determines the input the user sees and the conditions they can choose from. A [text](./dynamic-filters-api#text) filter renders a text input with conditions like `Contains` or `Starts with`; a [number](./dynamic-filters-api#number) filter renders a number input with `=`, `>`, `<=`, and so on.

There are eight types: [`:boolean`](./dynamic-filters-api#boolean), [`:date`](./dynamic-filters-api#date), [`:date_time`](./dynamic-filters-api#date), [`:time`](./dynamic-filters-api#date), [`:number`](./dynamic-filters-api#number), [`:select`](./dynamic-filters-api#select), [`:text`](./dynamic-filters-api#text), and [`:tags`](./dynamic-filters-api#tags). Each type's conditions, icons, and quirks are cataloged in the [API reference](./dynamic-filters-api.html#filter-types-and-their-conditions).

Avo picks the type automatically from the field type — a `boolean` field gets a boolean filter, a `badge` field gets a select filter, and so on, falling back to text. The full mapping is in the [API reference](./dynamic-filters-api#field-to-filter-mapping), and you can always override it with the [`type`](./dynamic-filters-api#type) option.

## Customize a filter

The automatic filters are deliberately strict — one filter per field, targeting that field's column with default conditions. When you need more control, or a filter that isn't bound to a field at all, define a custom dynamic filter. There are two equivalent ways:

**1. Turn the field's `filterable` option into a hash:**

```ruby
field :first_name,
  as: :text,
  filterable: true # [!code --]
  filterable: {label: "Name", icon: "avo/font"} # [!code ++]
```

**2. Call `dynamic_filter` inside the resource's `filters` method** — no field required:

```ruby
def filters
  dynamic_filter :first_name, label: "Name", icon: "avo/font"
end
```

Every option — [`label`](./dynamic-filters-api#label), [`icon`](./dynamic-filters-api#icon), [`type`](./dynamic-filters-api#type), [`conditions`](./dynamic-filters-api#conditions), [`query`](./dynamic-filters-api#query), [`query_attributes`](./dynamic-filters-api#query_attributes), [`options`](./dynamic-filters-api#options), [`suggestions`](./dynamic-filters-api#suggestions), and the rest — works as a key in the `filterable` hash and as a keyword argument to `dynamic_filter` alike. The [API reference](./dynamic-filters-api.html) documents them all.

:::info Filters order
Filters defined with `dynamic_filter` respect their definition order and render first in the list. Filters declared through the field's `filterable` option follow, sorted by label.
:::

:::warning Custom filter IDs
When a `dynamic_filter`'s ID doesn't match a database column, point it at the real column(s) with [`query_attributes`](./dynamic-filters-api#query_attributes):

```ruby
# The filter ID is custom_population, but it should query the population column.
dynamic_filter :custom_population, query_attributes: :population
```
:::

### Restrict or rename the conditions

Pass a [`conditions`](./dynamic-filters-api#conditions) hash to replace the type's default conditions, or an empty hash (`{}`) to hide the conditions dropdown entirely and always use the type's first default condition:

```ruby{3}
dynamic_filter :last_name,
  type: :select,
  conditions: {},
  options: User.pluck(:last_name).compact
```

### Write a custom query

By default, the chosen condition is applied to the filter's attribute via Ransack. Take over with the [`query`](./dynamic-filters-api#query) option:

```ruby{6-13}
dynamic_filter :first_name,
  conditions: {
    case_sensitive: "Is (case sensitive)",
    not_case_sensitive: "Is (case insensitive)"
  }.invert,
  query: -> {
    case filter_param.condition.to_sym
    when :case_sensitive
      query.where("name = ?", filter_param.value)
    when :not_case_sensitive
      query.where("LOWER(name) = ?", filter_param.value.downcase)
    end
  }
```

Inside the block you get `query`, `filter_param` (the filter's id, condition, and value), and everything on [`Avo::ExecutionContext`](./execution-context).

### Filter across multiple columns or associations

[`query_attributes`](./dynamic-filters-api#query_attributes) accepts several columns — the condition applies to any of them (`OR`):

```ruby
dynamic_filter :name,
  type: :text,
  query_attributes: [:first_name, :last_name]
```

Prefix an attribute with the association name to filter through a `belongs_to` (a Ransack feature):

```ruby
dynamic_filter label: "User (email & first_name)",
  icon: "heroicons/solid/users",
  query_attributes: [:user_email, :user_first_name]
```

### Offer suggestions or fetch values from an API

Text and tags filters can suggest values as the user types — a static array, a proc, or, for tags filters, a [`fetch_values_from`](./dynamic-filters-api#fetch_values_from) URL that queries your own endpoint:

```ruby
dynamic_filter :first_name, suggestions: ["Avo", "Cado"]
```

See [`suggestions`](./dynamic-filters-api#suggestions) and [`fetch_values_from`](./dynamic-filters-api#fetch_values_from) for the accepted shapes, and the endpoint contract for API-backed suggestions.

### Apply instantly, without the Apply button

For select filters, combine [`apply_on_select`](./dynamic-filters-api#apply_on_select) and [`render_apply_button`](./dynamic-filters-api#render_apply_button) to filter as soon as the user picks a value:

```ruby{3-4}
dynamic_filter :category,
  type: :select,
  apply_on_select: true,
  render_apply_button: false
```

### Humanize the filter pills

Applied filters render as pills like "Is active **is true**". When raw values or auto-generated condition labels read poorly, override them with [`humanized_value`](./dynamic-filters-api#humanized_value) and [`humanized_condition`](./dynamic-filters-api#humanized_condition):

```ruby{4-11}
field :is_capital,
  as: :boolean,
  filterable: {
    humanized_value: -> {
      case filter.condition
      when "is_true"
        "yes"
      when "is_false"
        "no"
      end
    }
  }
```

## Configure the filters bar

The bar itself is configured globally in the initializer — the toggle button's label, whether the bar starts expanded, and the URL param it reads from:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  # Other Avo configurations
end

if defined?(Avo::DynamicFilters)
  Avo::DynamicFilters.configure do |config|
    config.button_label = "Advanced filters"
    config.always_expanded = false
  end
end
```

See [`button_label`](./dynamic-filters-api#button_label), [`always_expanded`](./dynamic-filters-api#always_expanded), and [`param_key`](./dynamic-filters-api#param_key) in the API reference.

## Caveats

At some point we'll integrate the [basic filters](./basic-filters) into the dynamic filters bar. Until then, if a resource has both basic and dynamic filters **and** you've set [`always_expanded`](./dynamic-filters-api#always_expanded) to `false`, you'll see two `Filters` buttons on the <Index /> view. The default (`always_expanded = true`) avoids this, since the dynamic filters bar renders directly without its own toggle button.

## Guides & Tutorials

<Option name="How to filter associations">

Learn how to effectively filter records based on their associations in Avo. This video tutorial demonstrates how to set up and use dynamic filters to query records through the attributes of their associations, enabling powerful and flexible data filtering capabilities.

<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.loom.com/embed/d8bd49086d014d77a3013796c8480339?sid=aaaec555-b19f-429b-b0a7-e998a2d2128e" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

#### `belongs_to` example

```ruby{5-11,16-18}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  # Using field's filterable option
  def fields
    field :user,
      as: :belongs_to,
      filterable: {
        label: "User (email & first_name)",
        icon: "heroicons/solid/users",
        query_attributes: [:user_email, :user_first_name]
      }
  end

  # OR using dynamic_filter method
  def filters
    dynamic_filter label: "User (email & first_name)",
      icon: "heroicons/solid/users",
      query_attributes: [:user_email, :user_first_name]
  end
end
```

#### `has_many` example

```ruby{19-22}
# app/avo/resources/author.rb
class Avo::Resources::Author < Avo::BaseResource
  self.record_selector = false

  def fields
    field :preview, as: :preview
    field :book_list, only_on: :preview do
      tag.div do
        tag.ul do
          safe_join(
            record.books.map do |book|
              tag.li("#{book.title} (#{book.genre})")
            end
          )
        end
      end
    end

    field :name, filterable: true
    # Filter the books by title and genre
    field :books, as: :has_many, filterable: {
      query_attributes: [:books_title, :books_genre]
    }
  end
end
```
</Option>

<Option name="Composable filters">

When you have multiple fields that require similar filtering logic, you can create reusable filter helpers to avoid code duplication. This is particularly useful when working with JSON columns, complex queries, or any scenario where multiple fields share the same filtering pattern.

This guide demonstrates four different approaches to create composable filters, each with its own benefits and use cases.

### The problem: repetitive filter code

Before diving into the solutions, let's look at a common problem where filter logic is repeated across multiple fields:

```ruby
# app/avo/resources/feedback.rb
class Avo::Resources::Feedback < Avo::BaseResource
  def fields
    field :company_size, filterable: {
      type: :select,
      options: -> { Feedback.pluck(Arel.sql("answers->>'company_size'")).uniq },
      query: -> { query.where(Arel.sql("answers->>'company_size' = '#{filter_param.value}'")) }
    }

    field :company_industry, filterable: {
      type: :select,
      options: -> { Feedback.pluck(Arel.sql("answers->>'company_industry'")).uniq },
      query: -> { query.where(Arel.sql("answers->>'company_industry' = '#{filter_param.value}'")) }
    }

    field :title, filterable: {
      type: :select,
      options: -> { Feedback.pluck(Arel.sql("answers->>'title'")).uniq },
      query: -> { query.where(Arel.sql("answers->>'title' = '#{filter_param.value}'")) }
    }

    field :description, filterable: {
      type: :select,
      options: -> { Feedback.pluck(Arel.sql("answers->>'description'")).uniq },
      query: -> { query.where(Arel.sql("answers->>'description' = '#{filter_param.value}'")) }
    }
  end
end
```

As you can see, the same filtering logic is repeated for each field, which violates the DRY (Don't Repeat Yourself) principle and makes the code harder to maintain.

### Method 1: helper method with field configuration

This approach extracts the common filtering logic into a helper method that returns the filterable configuration hash. It's the most straightforward refactoring and maintains the existing field-based approach.

```ruby
# app/avo/resources/feedback.rb
class Avo::Resources::Feedback < Avo::BaseResource
  def filterable_helper(field_name)
    {
      type: :select,
      options: -> { Feedback.pluck(Arel.sql("answers->>'#{field_name}'")).uniq },
      query: -> { query.where(Arel.sql("answers->>'#{field_name}' = '#{filter_param.value}'")) }
    }
  end

  def fields
    field :company_size, filterable: filterable_helper(:company_size)
    field :company_industry, filterable: filterable_helper(:company_industry)
    field :title, filterable: filterable_helper(:title)
    field :description, filterable: filterable_helper(:description)
  end
end
```

**Benefits:**
- Simple refactoring that maintains the existing field structure
- Easy to understand and implement
- Minimal changes to existing code

**Best for:** Quick refactoring of existing resources with repetitive filter logic.

:::warning
When you're using this approach within a `with_options` block, you need to allow the extra args that are passed to the helper method.

```ruby
def filterable_helper(field_name, **args)
  # ...
end
```
:::

### Method 2: separate fields and filters with helper

This approach separates the field definitions from the filter definitions using the `dynamic_filter` method. The helper method now directly creates the dynamic filter instead of returning a configuration hash.

```ruby
# app/avo/resources/feedback.rb
class Avo::Resources::Feedback < Avo::BaseResource
  def fields
    field :company_size
    field :company_industry
    field :title
    field :description
  end

  def filterable_helper(field_name)
    dynamic_filter field_name,
      type: :select,
      options: -> { Feedback.pluck(Arel.sql("answers->>'#{field_name}'")).uniq },
      query: -> { query.where(Arel.sql("answers->>'#{field_name}' = '#{filter_param.value}'")) }
  end

  def filters
    filterable_helper(:company_size)
    filterable_helper(:company_industry)
    filterable_helper(:title)
    filterable_helper(:description)
  end
end
```

**Benefits:**
- Clear separation between field definitions and filter logic
- Uses the more flexible `dynamic_filter` method
- Filters can be defined independently of fields

**Best for:**

- Resources where you want to maintain clean separation between display fields and filtering logic.
- Dynamic filters that are common across multiple resources.

### Method 3: programmatic filter generation

This approach uses Ruby's array iteration to programmatically generate multiple filters with the same logic. It's the most concise and reduces the code to its essential elements.

```ruby
# app/avo/resources/feedback.rb
class Avo::Resources::Feedback < Avo::BaseResource
  def fields
    field :company_size
    field :company_industry
    field :title
    field :description
  end

  def filters
    [:company_size, :company_industry, :title, :description].map do |field_name|
      dynamic_filter field_name,
        type: :select,
        options: -> { Feedback.pluck(Arel.sql("answers->>'#{field_name}'")).uniq },
        query: -> { query.where(Arel.sql("answers->>'#{field_name}' = '#{filter_param.value}'")) }
    end
  end
end
```

**Benefits:**
- Most concise code
- Easy to add or remove filterable fields by modifying the array
- Clearly shows which fields share the same filtering logic

**Best for:** Resources with many fields that share identical filtering logic, especially when the list of filterable fields might change frequently.

### Method 4: custom DSL with method override

This approach creates a custom DSL by overriding the `field` method to intercept a special symbol (`:by_answer`). This provides the cleanest syntax at the field level while hiding the complexity in the method override.

```ruby
# app/avo/resources/feedback.rb
class Avo::Resources::Feedback < Avo::BaseResource
  def fields
    field :company_size, filterable: :by_answer
    field :company_industry, filterable: :by_answer
    field :title, filterable: :by_answer
    field :description, filterable: :by_answer
  end

  def field(field_name, **args, &block)
    if args[:filterable] == :by_answer
      args[:filterable] = {
        type: :select,
        options: -> { Feedback.pluck(Arel.sql("answers->>'#{field_name}'")).uniq },
        query: -> { query.where(Arel.sql("answers->>'#{field_name}' = '#{filter_param.value}'")) }
      }
    end

    super(field_name, **args, &block)
  end
end
```

**Benefits:**
- Creates a clean, semantic DSL
- Hides complexity while maintaining readable field definitions
- Easy to extend with additional filter types
- Most maintainable for resources with many similar filterable fields

**Best for:** Resources where you want to create a custom, reusable filtering pattern that feels natural and integrated with Avo's field DSL.

### Choosing the right approach

- **Method 1** for quick refactoring of existing code
- **Method 2** when you want clear separation between fields and filters
- **Method 3** when you have many fields with identical filtering logic
- **Method 4** when you want to create a clean, reusable DSL for your team

All approaches achieve the same goal of eliminating code duplication while providing different levels of abstraction and maintainability.

</Option>
