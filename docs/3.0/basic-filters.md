---
feedbackId: 838
---

# Filters

Filters allow you to better scope the index queries for records you are looking for.

Each filter is configured in a class with a few dedicated [methods and options](#filter-options). To use a filter on a resource you must [register it](#register-filters) and it will be displayed on the <Index /> view.

## Filter options

:::option `self.name`

`self.name` is what is going to be displayed to the user in the filters panel.
:::

:::option `self.visible`

You may want to show/hide the filter in some scenarios. You can do that using the `self.visible` attribute.

Inside the visible block you can acces the following variables and you should return a boolean (`true`/`false`).

```ruby
  self.visible = -> do
    #   You have access to:
    #   block
    #   context
    #   current_user
    #   params
    #   parent_model
    #   parent_resource
    #   resource
    #   view
    #   view_context
    true
  end
```
:::

:::option `self.empty_message`
There might be times when you will want to show a message to the user when you're not returning any options.

More on this in the [Empty message guide](#empty-message-text).
:::
:::option `options`
Some filters allow you to pass options to the user. For example on the [select filter](#select_filter) you can set the options in the dropdown, and on the [boolean filter](#boolean_filter) you may set the checkbox values.
Each filter type has their own `options` configuration explained below.

In the `options` method you have access to the `request`, `params`, [`context`](./customization#context), `view_context`, and `current_user` objects.
:::

:::option `apply`
The `apply` method is what is going to be run when Avo fetches the records on the <Index /> view.

It recieves the `request` form which you can get all the `params` if you need them, it gets the `query` which is the query Avo made to fetch the records. It's a regular [Active Record](https://guides.rubyonrails.org/active_record_querying.html) which you can manipulate.

It also receives the `values` variable which holds the actual choices the user made on the front-end for the [options](#options) you set.
:::

:::option `default`
You may set default values for the `options` you set. For example you may set which option to be selected for the [select filter](#select_filter) and which checkboxes to be set for the [boolean filter](#boolean_filter).

In the `default` method you have access to the `request`, `params`, [`context`](./customization#context), `view_context`, and `current_user` objects.
:::

:::option `react`
This is a hook in which you can change the value of the filter based on what other filters have for values.

More on this in the [React to filters guide](#react-to-filters)
:::

## Register filters

In order to use a filter you must register it on a `Resource` using the `filter` method inside the `filters` method.

```ruby{9}
class Avo::Resources::Post < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id
  end

  def filters
    filter Avo::Filters::Published
  end
end
```

## Filter types

Avo has several types of filters available [Boolean filter](#boolean_filter), [Select filter](#select_filter), [Multiple select filter](#multiple_select_filter) and [Text filter](#text_filter).

<img :src="('/assets/img/filters.png')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

### Filter values

Because the filters get serialized back and forth, the final `value`/`values` in the `apply` method will be stringified or have the stringified keys if they are hashes. You can declare them as regular hashes in the `options` method, but they will get stringified.

:::option Boolean Filter

The boolean filter is a filter where the user can filter the records using one or more checkboxes.

To generate one run:

```bash
bin/rails generate avo:filter featured
```
or
```bash
bin/rails generate avo:filter featured --type boolean
```

Here's a sample filter

```ruby
class Avo::Filters::Featured < Avo::Filters::BooleanFilter
  self.name = 'Featured filter'

  # `values` comes as a hash with stringified keys
  # Eg:
  # {
  #   'is_featured': true
  # }
  def apply(request, query, values)
    return query if values['is_featured'] && values['is_unfeatured']

    if values['is_featured']
      query = query.where(is_featured: true)
    elsif values['is_unfeatured']
      query = query.where(is_featured: false)
    end

    query
  end

  def options
    {
      is_featured: "Featured",
      is_unfeatured: "Unfeatured"
    }
  end

  # Optional method to set the default state.
  # def default
  #   {
  #     is_featured: true
  #   }
  # end
end
```

Each filter file comes with a `name`, `apply`, and `options` methods.

The `name` method lets you set the name of the filter.

The `apply` method is responsible for filtering out the records by giving you access to modify the `query` object. The `apply` method also gives you access to the current `request` object and the passed `values`. The `values` object is a `Hash` containing all the configured `options` with the option name as the key and `true`/`false` as the value.

```ruby
# Example values payload
{
  'is_featured': true,
  'is_unfeatured': false,
}
```

The `options` method defines the available values of your filter. They should return a `Hash` with the option id as a key and option label as value.

### Default value

You can set a default value to the filter, so it has a predetermined state on load. To do that, return the state you desire from the `default` method.

```ruby{23-27}
class Avo::Filters::Featured < Avo::Filters::BooleanFilter
  self.name = 'Featured status'

  def apply(request, query, values)
    return query if values['is_featured'] && values['is_unfeatured']

    if values['is_featured']
      query = query.where(is_featured: true)
    elsif values['is_unfeatured']
      query = query.where(is_featured: false)
    end

    query
  end

  def options
    {
      is_featured: "Featured",
      is_unfeatured: "Unfeatured"
    }
  end

  def default
    {
      is_featured: true
    }
  end
end
```
:::

:::option Select Filter

Select filters are similar to Boolean ones but they give the user a dropdown with which to filter the values.

```bash
rails generate avo:filter published --type select
```

The most significant difference from the **Boolean filter** is in the `apply` method. You only get back one `value` attribute, which represents which entry from the `options` method is selected.

A finished, select filter might look like this.

```ruby
class Avo::Filters::Published < Avo::Filters::SelectFilter
  self.name = 'Published status'

  # `value` comes as a string
  # Eg: 'published'
  def apply(request, query, value)
    case value
    when 'published'
      query.where.not(published_at: nil)
    when 'unpublished'
      query.where(published_at: nil)
    else
      query
    end
  end

  def options
    {
      published: "Published",
      unpublished: "Unpublished"
    }
  end

  # Optional method to set the default state.
  # def default
  #   :published
  # end
end
```

### Default value

The select filter supports setting a default too. That should be a string or symbol with the select item. It will be stringified by Avo automatically.

```ruby{22-24}
class Avo::Filters::Published < Avo::Filters::SelectFilter
  self.name = 'Published status'

  def apply(request, query, value)
    case value
    when 'published'
      query.where.not(published_at: nil)
    when 'unpublished'
      query.where(published_at: nil)
    else
      query
    end
  end

  def options
    {
      'published': 'Published',
      'unpublished': 'Unpublished',
    }
  end

  def default
    :published
  end
end
```
:::

:::option Multiple select filter

You may also use a multiple select filter.

```bash
rails generate avo:filter post_status --type multiple_select
```

```ruby
class Avo::Filters::PostStatus < Avo::Filters::MultipleSelectFilter
  self.name = "Status"

  # `value` comes as an array of strings
  # Ex: ['admins', 'non_admins']
  def apply(request, query, value)
    if value.include? 'admins'
      query = query.admins
    end

    if value.include? 'non_admins'
      query = query.non_admins
    end

    query
  end

  def options
    {
      admins: "Admins",
      non_admins: "Non admins",
    }
  end

  # Optional method to set the default state.
  # def default
  #   ['admins', 'non_admins']
  # end
end
```

<img :src="('/assets/img/multiple-select-filter.png')" alt="Avo multiple select filter" style="width: 300px;" class="border mb-4" />

### Dynamic options

The select filter can also take dynamic options:

```ruby{15-17}
class Avo::Filters::Author < Avo::Filters::SelectFilter
  self.name = 'Author'

  def apply(request, query, value)
    query = query.where(author_id: value) if value.present?
    query
  end

  # Example `applied_filters`
  # applied_filters = {
  #   "Avo::Filters::CourseCountryFilter" => {
  #     "USA" => true,
  #     "Japan" => true,
  #     "Spain" => false,
  #     "Thailand" => false,
  #   }
  # }
  def options
    # Here you have access to the `applied_filters` object too
    Author.select(:id, :name).each_with_object({}) { |author, options| options[author.id] = author.name }
  end
end
```
:::

:::option Text Filter

You can add complex text filters to Avo using the Text filter

```bash
rails generate avo:filter name --type text
```

```ruby
class Avo::Filters::Name < Avo::Filters::TextFilter
  self.name = "Name filter"
  self.button_label = "Filter by name"

  # `value` comes as text
  # Eg: 'avo'
  def apply(request, query, value)
    query.where('LOWER(name) LIKE ?', "%#{value}%")
  end

  # def default
  #   'avo'
  # end
end
```
:::

## Dynamic filter options

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio" />

You might want to compose more advanced filters, like when you have two filters, one for the country and another for cities, and you'd like to have the cities one populated with cities from the selected country.

Let's take the `Avo::Resources::Course` as an example.

```ruby{3-5,7-14}
# app/models/course.rb
class Course < ApplicationRecord
  def self.countries
    ["USA", "Japan", "Spain", "Thailand"]
  end

  def self.cities
    {
      USA: ["New York", "Los Angeles", "San Francisco", "Boston", "Philadelphia"],
      Japan: ["Tokyo", "Osaka", "Kyoto", "Hiroshima", "Yokohama", "Nagoya", "Kobe"],
      Spain: ["Madrid", "Valencia", "Barcelona"],
      Thailand: ["Chiang Mai", "Bangkok", "Phuket"]
    }
  end
end
```

We will create two filters—one for choosing countries and another for cities.

```ruby{4-5}
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def filters
    filter Avo::Filters::CourseCountryFilter
    filter Avo::Filters::CourseCityFilter
  end
end
```

The country filter is pretty straightforward. Set the query so the `country` field to be one of the selected countries and the `options` are the available countries as `Hash`.

```ruby{6,10}
# app/avo/filters/course_country.rb
class Avo::Filters::CourseCountry < Avo::Filters::BooleanFilter
  self.name = "Course country filter"

  def apply(request, query, values)
    query.where(country: values.select { |country, selected| selected }.keys)
  end

  def options
    Course.countries.map { |country| [country, country] }.to_h
  end
end
```

The cities filter has a few more methods to manage the data better, but the gist is the same. The `query` makes sure the records have the city value in one of the cities that have been selected.

The `options` method gets the selected countries from the countries filter (`Avo::Filters::CourseCountryFilter`) and formats them to a `Hash`.

```ruby{6,10}
# app/avo/filters/course_city.rb
class Avo::Filters::CourseCity < Avo::Filters::BooleanFilter
  self.name = "Course city filter"

  def apply(request, query, values)
    query.where(city: values.select { |city, selected| selected }.keys)
  end

  def options
    cities_for_countries countries
  end

  private

  # Get a hash of cities for certain countries
  # Example payload:
  # countries = ["USA", "Japan"]
  def cities_for_countries(countries_array = [])
    countries_array
      .map do |country|
        # Get the cities for this country
        Course.cities.stringify_keys[country]
      end
      .flatten
      # Prepare to transform to a Hash
      .map { |city| [city, city] }
      # Turn to a Hash
      .to_h
  end

  # Get the value of the selected countries
  # Example payload:
  # applied_filters = {
  #   "Avo::Filters::CourseCountryFilter" => {
  #     "USA" => true,
  #     "Japan" => true,
  #     "Spain" => false,
  #     "Thailand" => false,
  #   }
  # }
  def countries
    if applied_filters["Avo::Filters::CourseCountryFilter"].present?
      # Fetch the value of the countries filter
      applied_filters["Avo::Filters::CourseCountryFilter"]
        # Keep only the ones selected
        .select { |country, selected| selected }
        # Pluck the name of the coutnry
        .keys
    else
      # Return empty array
      []
    end
  end
end
```

<img :src="('/assets/img/filters/dynamic-options.png')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

The `countries` method above will check if the `Avo::Filters::CourseCountryFilter` has anything selected. If so, get the names of the chosen ones. This way, you show only the cities from the selected countries and not all of them.

## React to filters

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio?t=219" />

Going further with the example above, a filter can react to other filters. For example, let's say that when a user selects `USA` from the list of countries, you want to display a list of cities from the USA (that's already happening in `options`), and you'd like to select the first one on the list. You can do that with the `react` method.

```ruby{21-36}
# app/avo/filters/course_city.rb
class Avo::Filters::CourseCity < Avo::Filters::BooleanFilter
  self.name = "Course city filter"

  def apply(request, query, values)
    query.where(city: values.select { |city, selected| selected }.keys)
  end

  def options
    cities_for_countries countries
  end

  # applied_filters = {
  #   "Avo::Filters::CourseCountryFilter" => {
  #     "USA" => true,
  #     "Japan" => true,
  #     "Spain" => false,
  #     "Thailand" => false,
  #   }
  # }
  def react
    # Check if the user selected a country
    if applied_filters["Avo::Filters::CourseCountryFilter"].present? && applied_filters["Avo::Filters::CourseCityFilter"].blank?
      # Get the selected countries, get their cities, and select the first one.
      selected_countries = applied_filters["Avo::Filters::CourseCountryFilter"].select do |name, selected|
        selected
      end

      # Get the first city
      cities = cities_for_countries(selected_countries.keys)
      first_city = cities.first.first

      # Return the first city as selected
      [[first_city, true]].to_h
    end
  end

  private

  # Get a hash of cities for certain countries
  # Example payload:
  # countries = ["USA", "Japan"]
  def cities_for_countries(countries_array = [])
    countries_array
      .map do |country|
        # Get the cities for this country
        Course.cities.stringify_keys[country]
      end
      .flatten
      # Prepare to transform to a Hash
      .map { |city| [city, city] }
      # Turn to a Hash
      .to_h
  end

  # Get the value of the selected countries
  # Example `applied_filters` payload:
  # applied_filters = {
  #   "Avo::Filters::CourseCountryFilter" => {
  #     "USA" => true,
  #     "Japan" => true,
  #     "Spain" => false,
  #     "Thailand" => false,
  #   }
  # }
  def countries
    if applied_filters["Avo::Filters::CourseCountryFilter"].present?
      # Fetch the value of the countries filter
      applied_filters["Avo::Filters::CourseCountryFilter"]
        # Keep only the ones selected
        .select { |country, selected| selected }
        # Pluck the name of the coutnry
        .keys
    else
      # Return empty array
      []
    end
  end
end
```

After all, filters are applied, the `react` method is called, so you have access to the `applied_filters` object.
Using the applied filter payload, you can return the value of the current filter.

```ruby
def react
  # Check if the user selected a country
  if applied_filters["Avo::Filters::CourseCountryFilter"].present? && applied_filters["Avo::Filters::CourseCityFilter"].blank?
    # Get the selected countries, get their cities, and select the first one.
    selected_countries = applied_filters["Avo::Filters::CourseCountryFilter"]
      .select do |name, selected|
        selected
      end

    # Get the first city
    cities = cities_for_countries(selected_countries.keys)
    first_city = cities.first.first

    # Return the first city selected as a Hash
    [[first_city, true]].to_h
  end
end
```

Besides checking if the countries filter is populated (`applied_filters["Avo::Filters::CourseCountryFilter"].present?`), we also want to allow the user to customize the cities filter further, so we need to check if the user has added a value to that filter (`applied_filters["Avo::Filters::CourseCountryFilter"].blank?`).
If these conditions are true, the country filter has a value, and the user hasn't selected any values from the cities filter, we can react to it and set a value as the default one.

<img :src="('/assets/img/filters/dynamic-options.gif')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

Of course, you can modify the logic and return all kinds of values based on your needs.

## Empty message text

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio?t=347" />

There might be times when you will want to show a message to the user when you're not returning any options. You may customize that message using the `empty_message` option.

<img :src="('/assets/img/filters/empty-message.gif')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

```ruby{4}
# app/avo/filters/course_city.rb
class Avo::Filters::CourseCity < Avo::Filters::BooleanFilter
  self.name = "Course city filter"
  self.empty_message = "Please select a country to view options."

  def apply(request, query, values)
    query.where(city: values.select { |city, selected| selected }.keys)
  end

  def options
    if countries.present?
      []
    else
      ["Los Angeles", "New York"]
    end
  end

  private

  def countries
    # logic to fetch the countries
  end
end
```

## Keep filters panel open

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio?t=374" />

There are scenarios where you wouldn't want to close the filters panel when you change the values. For that, you can use the `keep_filters_panel_open` resource option.

More on this on the [`keep_filters_panel_open` resource option](./resources#self_keep_filters_panel_open).

## Filter arguments

Filters can have different behaviors according to their host resource. In order to achieve that, arguments must be passed like on the example below:

```ruby{12-14}
class Avo::Resources::Fish < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id
    field :name, as: :text
    field :user, as: :belongs_to
    field :type, as: :text, hide_on: :forms
  end

  def filters
    filter Avo::Filters::NameFilter, arguments: {
      case_insensitive: true
    }
  end
end
```

Now, the arguments can be accessed inside `Avo::Filters::NameFilter` ***`apply` method***, ***`options` method*** and on the ***`visible` block***!

```ruby{4-6,8-14}
class Avo::Filters::Name < Avo::Filters::TextFilter
  self.name = "Name filter"
  self.button_label = "Filter by name"
  self.visible = -> do
    arguments[:case_insensitive]
  end

  def apply(request, query, value)
    if arguments[:case_insensitive]
      query.where("LOWER(name) LIKE ?", "%#{value.downcase}%")
    else
      query.where("name LIKE ?", "%#{value}%")
    end
  end
end
```

## Manually create encoded URLs

You may want to redirect users to filtered states of the <Index /> view from other places in your app. In order to create those filtered states you may use these helpers functions or Rails helpers.


### Rails helpers

:::option `decode_filter_params`

Decodes the `filters` param. This Rails helper can be used anywhere in a view or off the `view_context`.

#### Usage

```ruby
# in a view
decode_filter_params params[:filters] # {"NameFilter"=>"Apple"}

# Or somewhere in an Avo configuration file

class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    filters = view_context.decode_filter_params(params[:filters])

    do_something_important_with_the_filters filters
  end
end
```
:::

:::option `encode_filter_params`

Encodes a `filters` object into a serialized state that Avo understands. This Rails helper can be used anywhere in a view or off the `view_context`.

#### Usage

```ruby
# in a view
filters = {"NameFilter"=>"Apple"}
encode_filter_params filters # eyJOYW1lRmlsdGVyIjoiQXBwbGUifQ==

# Or somewhere in an Avo configuration file

class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    do_something_important

    redirect_to avo.resources_users_path(filters: view_context.decode_filter_params({"NameFilter"=>"Apple"}))
  end
end
```
:::

### Standalone helpers

:::option `Avo::Filters::BaseFilter.decode_filters`

Decodes the `filters` param. This standalone method can be used anywhere.

#### Usage

```ruby
class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    filters = Avo::Filters::BaseFilter.decode_filters(params[:filters])

    do_something_important_with_the_filters filters
  end
end
```
:::

:::option `Avo::Filters::BaseFilter.encode_filters`

Encodes a `filters` object into a serialized state that Avo understands. This standalone method can be used anywhere.

#### Usage

```ruby
class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    do_something_important

    redirect_to avo.resources_users_path(filters: Avo::Filters::BaseFilter.encode_filters({"NameFilter"=>"Apple"}))
  end
end
```
:::
