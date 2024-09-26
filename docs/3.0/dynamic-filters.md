---
feedbackId: 838
license: advanced
---

# Dynamic filters

The Dynamic filters make it so easy to add multiple, composable, and dynamic filters to the <Index /> view.

The first thing you need to do is add the `filterable: true` attribute to the fields you need to filter through. We use `ransack` behind the scenes so it's essential to configure the `ransackable_attributes` list to ensure that every filterable field is incorporated within it.


```ruby{4-6} [Fields]
class Avo::Resources::Project < Avo::BaseResource
  def fields
    field :name, as: :text
    field :status, as: :status, filterable: true
    field :stage, as: :badge, filterable: true
    field :country, as: :country, filterable: true
  end
end
```

Authorize ransackable_attributes
```ruby{3,11}
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

This will make Avo add this new "Filters" button to the <Index /> view of your resource.

When the user clicks the button, a new filters bar will appear below enabling them to add filters based on the attributes you marked as filterable.
The user can add multiple filters for the same attribute if they desire so.

## Filter types

The filter type determines the kind of input provided by the filter.

For instance, a [text](#text) type filter will render a text input field, while a [select](#select) type filter will render a dropdown menu with predefined options fetched from the field.

#### Conditions
Each filter type also offers a different set of conditions. Conditions specify how the input value should be applied to filter the data. For example, [text](#text) filters have conditions such as `Contains` or `Starts with`, while number filters include `=` (equals) or `>` (greater than).

#### Query
Avo uses the input value and the specified condition to build a Ransack query. The filter conditions and input values are translated into Ransack predicates, which are then used to fetch the filtered data.

For instance, in the text filter example above, the `Contains` condition and the input value `John` are translated into a Ransack query resulting into the SQL `LIKE` operator to find all records where the name contains `John`.

<Option name="Boolean">

### Conditions

 - Is true
 - Is false
 - Is null
 - Is not null
<div class="flex justify-between items-start flex-wrap">
    <Image src="/assets/img/dynamic_filter_boolean.png" width="241" height="176" alt="" />
    <Image src="/assets/img/dynamic_filter_boolean2.png" width="241" height="192" alt="" />
</div>

Test it on [avodemo](https://main.avodemo.com/avo/resources/users?filters[is_admin?][is_true][]=), check the [source code](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/user.rb#L38)
</Option>

<Option name="Date">

### Conditions

 - Is
 - Is not
 - Is on or before
 - Is on or after
 - Is within
- Is null
 - Is not null

<div class="flex justify-between items-start flex-wrap">
    <Image src="/assets/img/dynamic_filter_date3.png" width="340" height="500" alt="" />
    <Image src="/assets/img/dynamic_filter_date2.png" width="244" height="213" alt="" />
</div>

Test it on [avodemo](https://main.avodemo.com/avo/resources/teams?filters[created_at][lte][]=2024-07-02%2012%3A00), check the [source code](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/team.rb#L50)
</Option>

<Option name="Number">

### Conditions

 - `=` (equals)
 - `!=` (is different)
 - `>` (greater than)
 - `>=` (greater than or equal to)
 - `<` (lower than)
 - `<=` (lower than or equal to)
 - Is within <VersionReq version="3.10.11"/>
 - Is null
 - Is not null

<div class="flex justify-between items-start flex-wrap">
  <Image src="/assets/img/dynamic_filter_number.png" width="244" height="205" alt="" />
  <Image src="/assets/img/dynamic_filter_number2.png" width="244" height="234" alt="" />
</div>

Test it on [avodemo](https://main.avodemo.com/avo/resources/teams?filters[id][gte][]=2), check the [source code](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/team.rb#L27)
</Option>

<Option name="Select">

### Conditions

 - Is
 - Is not
 - Is null
 - Is not null

<div class="flex justify-between items-start flex-wrap">
  <Image src="/assets/img/dynamic_filter_select.png" width="244" height="204" alt="" />
  <Image src="/assets/img/dynamic_filter_select2.png" width="244" height="204" alt="" />
</div>

Test it on [avodemo](https://main.avodemo.com/avo/resources/courses?filters[country][is][]=USA), check the [source code](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/course.rb#L55)
</Option>

<Option name="Text">

### Conditions

 - Contains
 - Does not contain
 - Is
 - Is not
 - Starts with
 - Ends with
 - Is null
 - Is not null
 - Is present
 - Is blank

<div class="flex justify-between items-start flex-wrap">
  <Image src="/assets/img/dynamic_filter_text.png" width="244" height="203" alt="" />
  <Image src="/assets/img/dynamic_filter_text2.png" width="244" height="327" alt="" />
</div>

Test it on [avodemo](https://main.avodemo.com/avo/resources/users?filters[first_name][contains][]=Avo), check the [source code](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/user.rb#L33)
</Option>
<Option name="Tags">

### Conditions

 - Are
 - Contain
 - Overlap
 - Contained in ([`active_record_extended`](https://github.com/GeorgeKaraszi/ActiveRecordExtended) gem required)

:::warning
Contained in will not work when using the `acts-as-taggable-on` gem.
:::
<div class="flex justify-between items-start flex-wrap">
  <Image src="/assets/img/dynamic_filter_tags.png" width="244" height="204" alt="" />
  <Image src="/assets/img/dynamic_filter_tags2.png" width="244" height="204" alt="" />
</div>

Test it on [avodemo](https://main.avodemo.com/avo/resources/courses?filters[skills][array_contains][]=), check the [source code](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/course.rb#L46)

:::info
The source code uses custom dynamic filters DSL available <VersionReq version="3.10.0" />

Check how to do a more advanced configuration on the [custom dynamic filters](#custom-dynamic-filters) section.
:::

</Option>

## Options

You can have a few customization options available that you can add in your `avo.rb` initializer file.

```ruby
Avo.configure do |config|
  # Other Avo configurations
end

if defined?(Avo::DynamicFilters)
  Avo::DynamicFilters.configure do |config|
    config.button_label = "Advanced filters"
    config.always_expanded = true
  end
end
```

<Option name="`button_label`">
This will change the label on the expand label.
</Option>

<Option name="`always_expanded`">
You may opt-in to have them always expanded and have the button hidden.
</Option>

## Field to filter matching
On versions **lower** than <Version version="3.10.0" /> the filters are not configurable so each field will have a dedicated filter type. Check how to do a more advanced configuration on the [custom dynamic filters](#custom-dynamic-filters) section.

Field-to-filter matching in versions **lower** than <Version version="3.10.0" />:

```ruby
def field_to_filter(type)
  case type.to_sym
  when :boolean
    :boolean
  when :date, :date_time, :time
    :date
  when :id, :number, :progress_bar
    :number
  when :select, :badge, :country, :status
    :select
  when :text, :textarea, :code, :markdown, :password, :trix
    :text
  else
    :text
  end
end
```

## Caveats

At some point we'll integrate the [Basic filters](./basic-filters) into the dynamic filters bar. Until then, if you have both basic and dynamic filters on your resource you'll have two `Filters` buttons on your <Index /> view.

To mitigate that you can toggle the `always_expanded` option to true.

## Custom Dynamic Filters

<BetaStatus label="Beta" />
<VersionReq version="3.10.0" />

Dynamic filters are great but strict, as each field creates a specific filter type, each with its own icon and query. The query remains static, targeting only that particular field. Since version <Version version="3.10" />, dynamic filters have become customizable and, even better, can be declared without being bound to a field.

There are two ways to define custom dynamic filters: the field's `filterable` option and the `dynamic_filter` method.

### Defining custom dynamic filters

To start customizing a dynamic filter from the `filterable` option, change its value to a hash:

```ruby
field :first_name,
  as: :text,
  filterable: true # [!code --]
  filterable: { } # [!code ++]
```

From this hash, you can configure several options specified below.

Alternatively, you can define a custom dynamic filter using the `dynamic_filter` method, which should be called inside the `filters` method:

```ruby
def filters
  # ...
  dynamic_filter :first_name
  # ...
end
```

Each option specified below can be used as a key in the hash definition or as a keyword argument in the method definition.

:::info Filters order
The filter order is computed. Dynamic filters defined by the `dynamic_filter` method will respect the definition order and will be rendered first in the filter list. Filters declared using the field's `filterable` option will be sorted by label.
:::

:::warning Custom Dynamic Filter IDs
When using a custom dynamic filter, the generated filter ID may not directly correspond to a database column. In such cases, you should use the [`query_attributes`](#query_attributes) option to specify which database columns the filter should apply to.

For example, consider a `City` model with a `population` column in the database:
```ruby
# The filter ID is custom_population
# However, the filter should apply the query to the population attribute.
dynamic_filter :custom_population, query_attributes: :population
```
:::
<Option name="`label`">

Customize filter's label

##### Default value

Field's / filter's ID humanized.

#### Possible values

Any string
</Option>


<Option name="`icon`">

Customize filter's icon. Check [icons documentation](./icons)

##### Default value

Boolean filter - `heroicons/outline/check-circle`<br>
Calendar filter - `heroicons/outline/calendar-days`<br>
Number filter - `heroicons/outline/hashtag`<br>
Select filter - `heroicons/outline/arrow-down-circle`<br>
Tags filter - `heroicons/outline/tag`<br>
Text filter - `avo/font`<br>

#### Possible values

Any icon from [avo](https://github.com/avo-hq/avo/tree/feature/allow_actions_to_render_turbo_streams/app/assets/svgs/avo) or [heroicons](https://heroicons.com/).
</Option>

<Option name="`type`">

Customize filter's type

##### Default value

Computed from field using [`field_to_filter` method](#field-to-filter-matching).

#### Possible values

- [`:boolean`](#boolean)<br>
- [`:date`](#date)<br>
- [`:number`](#number)<br>
- [`:select`](#select)<br>
- [`:text`](#text)<br>
- [`:tags`](#tags)<br>
</Option>

<Option name="`query`">

:::info
<VersionReq version="3.11.8" /> the default filtering system is no longer applied when a `query` is specified on a dynamic filter.
:::

Customize filter's query

##### Default value

Applies the condition to the field's attribute. For example, if the field is `first_name`, the condition is `contains`, and the value is `Bill`, the query will restrict to all records where the first name contains `Bill`.

#### Possible values

Any lambda function.

Within the function, you have access to `query` and `filter_param` as well as all attributes of [`Avo::ExecutionContext`](execution-context).

`filter_param` is an Avo object that stores the filter's `id`, the applied `condition` and the `value`.

Usage example:

```ruby {6-13,19-26}
# Using field's filterable option
field :first_name,
  as: :text,
  filterable: {
    # ...
    query: -> {
      case filter_param.condition.to_sym
      when :case_sensitive
        query.where("name = ?", filter_param.value)
      when :not_case_sensitive
        query.where("LOWER(name) = ?", filter_param.value.downcase)
      end
    }
    # ...
  }

# Using dynamic_filter method
dynamic_filter :first_name,
  query: -> {
    case filter_param.condition.to_sym
    when :case_sensitive
      query.where("name = ?", filter_param.value)
    when :not_case_sensitive
      query.where("LOWER(name) = ?", filter_param.value.downcase)
    end
  }
```
</Option>

<Option name="`conditions`">

Customize filter's conditions

##### Default value

Check default conditions for each filter type above on this page.

#### Possible values

A hash with the desired key-values.

Usage example:
```ruby {6-9,15-18}
# Using field's filterable option
field :first_name,
  as: :text,
  filterable: {
    # ...
    conditions: {
      case_sensitive: "Case sensitive",
      not_case_sensitive: "Not case sensitive"
    }.invert
    # ...
  }

# Using dynamic_filter method
dynamic_filter :first_name,
  conditions: {
    case_sensitive: "Case sensitive",
    not_case_sensitive: "Not case sensitive"
  }.invert
```
</Option>

<Option name="`query_attributes`">

Customize filter's query attributes

##### Default value

Field's / filter's id

#### Possible values

Any model DB column(s). Use an array of symbols for multiple columns or a single symbol for a single column. If your model has DB columns like `first_name` and `last_name`, you can combine both on a single filter:

```ruby {6,13}
# Using field's filterable option
field :name,
  as: :text,
  filterable: {
    # ...
    query_attributes: [:first_name, :last_name]
    # ...
  }

# Using dynamic_filter method
dynamic_filter :name,
  type: :text,
  query_attributes: [:first_name, :last_name]
```

You can also add query attributes for a `belongs_to` association. For example, with a model that belongs to `User`:

```ruby {7,13}
# Using field's filterable option
field :user,
  as: :belongs_to,
  filterable: {
    label: "User (email & first_name)",
    icon: "heroicons/solid/users",
    query_attributes: [:user_email, :user_first_name]
  }

# Using dynamic_filter method
dynamic_filter label: "User (email & first_name)",
  icon: "heroicons/solid/users",
  query_attributes: [:user_email, :user_first_name]
```

This is possible due to a Ransack feature. To use it, you need to add the association name before the attribute.
</Option>

<Option name="`suggestions`">
Suggestions work on filters that provide text input, enhancing the user experience by offering relevant options. This functionality is especially useful in scenarios where users might need guidance or where the filter values are numerous or complex.

##### Default value

`nil`

:::info
<VersionReq version="3.11.8" /> on `tags` fields the `suggestions` are fetched from the field.
:::

#### Possible values

- Array of strings
```ruby {6,12}
# Using field's filterable option
field :first_name,
  as: :text,
  filterable: {
    # ...
    suggestions: ["Avo", "Cado"]
    # ...
  }

# Using dynamic_filter method
dynamic_filter :first_name,
  suggestions: ["Avo", "Cado"]
```

- Proc that returns an array of strings
```ruby {6,12}
# Using field's filterable option
field :first_name,
  as: :text,
  filterable: {
    # ...
    suggestions: -> { ["Avo", "Cado", params[:extra_suggestion]] }
    # ...
  }

# Using dynamic_filter method
dynamic_filter :first_name,
  suggestions: -> { ["Avo", "Cado", params[:extra_suggestion]] }
```


- Array of hashes with the keys `value`, `label` and optionally an `avatar`
<VersionReq version="3.11.8" />
:::warning Applicable only to filters with type tags.
:::

:::code-group
```ruby {6-13,19-26} [Direct assign]
# Using field's filterable option
field :tags,
  as: :tags,
  filterable: {
    # ...
    suggestions: [
      {
        value: 1,
        label: 'one',
        avatar: 'https://images.unsplash.com/photo-1560363199-a1264d4ea5fc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop',
      },
      # ...
    ]
    # ...
  }

# Using dynamic_filter method
dynamic_filter :tags,
  suggestions: [
    {
      value: 1,
      label: 'one',
      avatar: 'https://images.unsplash.com/photo-1560363199-a1264d4ea5fc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop',
    },
    # ...
  ]
```

```ruby {6-15,21-30} [Proc]
# Using field's filterable option
field :tags,
  as: :tags,
  filterable: {
    # ...
    suggestions: -> {
      [
        {
          value: 1,
          label: 'one', # or params[:something]
          avatar: 'https://images.unsplash.com/photo-1560363199-a1264d4ea5fc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop',
        },
        # ...
      ]
    }
    # ...
  }

# Using dynamic_filter method
dynamic_filter :tags,
  suggestions: -> {
    [
      {
        value: 1,
        label: 'one', # or params[:something]
        avatar: 'https://images.unsplash.com/photo-1560363199-a1264d4ea5fc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop',
      },
      # ...
    ]
  }
```
:::

</Option>

<Option name="`fetch_values_from`">

<VersionReq version="3.13" />

:::warning
This option is compatible **only** with `tags` filters.
:::

In some cases, you may need to retrieve values dynamically from an API. The `fetch_values_from` option allows you to provide a URL from which the filter will suggest values, functioning similarly to the `fetch_values_from` option in the tags field.

When a user searches for a record, the filter's input will send a request to the server to fetch records that match the query.

##### Default value

`nil`

:::info
If you're using a `filterable` field the `fetch_values_from` are fetched from the field.

```ruby
field :tags, as: :tags,
  fetch_values_from: -> { "/avo-filters/resources/cities/tags" }
  filterable: true
```
:::

#### Possible values

- String
```ruby
fetch_values_from: "/avo-filters/resources/cities/tags"
```

- Proc that evaluates to a string.
```ruby
fetch_values_from: -> { "/avo-filters/resources/cities/tags" }
```

The string should resolve to an endpoint that returns an array of objects with the keys `value`, `label` and optionally `avatar`.

::: code-group
```ruby{3-19} [app/controllers/avo/skills_controller.rb]
class Avo::CitiesController < Avo::ResourcesController
  def tags
    render json: [
      {
        value: 1,
        label: "one",
        avatar: "https://images.unsplash.com/photo-1560363199-a1264d4ea5fc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop"
      },
      {
        value: 2,
        label: "two",
        avatar: "https://images.unsplash.com/photo-1567254790685-6b6d6abe4689?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop"
      },
      {
        value: 3,
        label: "three",
        avatar: "https://images.unsplash.com/photo-1560765447-da05a55e72f8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop"
      }
    ]
  end
end
```

```ruby{5-11} [config/routes.rb]
Rails.application.routes.draw do
  # your routes...
end

if defined? ::Avo
  Avo::Engine.routes.draw do
    scope :resources do
      get "cities/tags", to: "cities#tags"
    end
  end
end
```
:::

</Option>

<Option name="`options`">
<VersionReq version="3.10.10" />

Customize the options **for select type filters**. **This is available only for select type filters** and determines the options visible in the select dropdown.

##### Default value

Fetched from field if bond to a field or `[]`

#### Possible values

An array or hash where the key-value pairs represent the options.

- If a hash is provided, the key is the option label and the value is the option value.
- If an array is provided, the array elements are used as both the option value and the option label.

##### Usage examples
###### Array
```ruby{3}
dynamic_filter :version,
  type: :select,
  options: ["Label 1", "Label 2"]
```

###### Hash (with invert)
```ruby{3-6}
dynamic_filter :version,
  type: :select,
  options: {
    value_1: "Label 1",
    value_2: "Label 2"
  }.invert
```

###### Hash (without invert)
```ruby{3-6}
dynamic_filter :version,
  type: :select,
  options: {
    "Label 1" => :value_1,
    "Label 2" => :value_2
  }
```
</Option>
