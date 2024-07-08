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

There are a few types of filters available for you to use out of the box.

:::option Boolean

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
:::

:::option Date

### Conditions

 - Is
 - Is not
 - Is on or before
 - Is on or after
 - Is within
- Is null
 - Is not null

<div class="flex justify-between items-start flex-wrap">
  <div>
    <Image src="/assets/img/dynamic_filter_date.png" width="244" height="213" alt="" />
    <Image src="/assets/img/dynamic_filter_date2.png" width="244" height="213" alt="" />
  </div>
  <div>
    <Image src="/assets/img/dynamic_filter_date3.png" width="340" height="500" alt="" />
  </div>
</div>

Test it on [avodemo](https://main.avodemo.com/avo/resources/teams?filters[created_at][lte][]=2024-07-02%2012%3A00), check the [source code](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/team.rb#L50)
:::

:::option Has many

This filter will give you options from the database.

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
  <Image src="/assets/img/dynamic_filter_has_many.png" width="244" height="204" alt="" />
  <Image src="/assets/img/dynamic_filter_has_many2.png" width="244" height="330" alt="" />
</div>

Test it on [avodemo](https://main.avodemo.com/avo/resources/teams?filters[memberships][contains][]=), check the [source code](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/team.rb#L75)
:::

:::option Number

### Conditions

 - `=` (equals)
 - `!=` (is different)
 - `>` (greater than)
 - `>=` (greater than or equal to)
 - `<` (lower than)
 - `<=` (lower than or equal to)

<div class="flex justify-between items-start flex-wrap">
  <Image src="/assets/img/dynamic_filter_number.png" width="244" height="205" alt="" />
  <Image src="/assets/img/dynamic_filter_number2.png" width="244" height="234" alt="" />
</div>

Test it on [avodemo](https://main.avodemo.com/avo/resources/teams?filters[id][gte][]=2), check the [source code](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/team.rb#L27)
:::

:::option Select

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
:::

:::option Text

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
:::
::::option Tags

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

Test it on [avodemo](https://main.avodemo.com/avo/resources/courses?filters[skills][array_contains][]=), check the [source code](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/course.rb#L42)

::::

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

:::option `button_label`
This will change the label on the expand label.
:::

:::option `always_expanded`
You may opt-in to have them always expanded and have the button hidden.
:::

## Field to filter matching

At the moment the filters are not configurable so each field will have a dedicated filter type. We will have a more advanced configuration in the future.

The current field-to-filter matching is done like so:

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
:::option `label`

Customize filter's label

##### Default value

Field's / filter's ID humanized.

#### Possible values

Any string
:::


:::option `icon`

Customize filter's icon

##### Default value

Array filter - `heroicons/outline/circle-stack`<br>
Boolean filter - `heroicons/outline/check-circle`<br>
Calendar filter - `heroicons/outline/calendar-days`<br>
Has many filter - `avo/arrow-up-right`<br>
Number filter - `heroicons/outline/hashtag`<br>
Select filter - `heroicons/outline/arrow-down-circle`<br>
Tags filter - `heroicons/outline/tag`<br>
Text filter - `avo/font`<br>

#### Possible values

Any icon from [heroicons](https://heroicons.com/).
:::

:::option `type`

Customize filter's type

##### Default value

Computed from field.

#### Possible values

- `:array`<br>
- `:boolean`<br>
- `:calendar`<br>
- `:has_many`<br>
- `:number`<br>
- `:select`<br>
- `:tags`<br>
- `:text`<br>
:::

:::option `query`

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
:::

:::option `conditions`

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
    conditions: -> {
      case_sensitive: "Case sensitive",
      not_case_sensitive: "Not case sensitive"
    }.invert
    # ...
  }

# Using dynamic_filter method
dynamic_filter :first_name,
  conditions: -> {
    case_sensitive: "Case sensitive",
    not_case_sensitive: "Not case sensitive"
  }.invert
```
:::

:::option `query_attributes`

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
:::
