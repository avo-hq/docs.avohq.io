---
feedbackId: 838
---

# Filters

Filters allow you to better scope the index queries for records you are looking for.

## Defining filters

Avo has two types of filters available at the moment [Boolean filter](#boolean-filter) and [Select filter](#select-filter).

<img :src="('/assets/img/filters.png')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

### Filter values

Because the filters get serialized back and forth, the final `value`/`values` in the `apply` method will be stringified or have the keys stringified if they are hashes. You can declare them as regular hashes (with the keys symbolized) in the `options` method, but they will get stringified in the end.

## Boolean Filter

You generate one running `bin/rails generate avo:filter featured_filter`, creating a filter configuration file.

```ruby
class FeaturedFilter < Avo::Filters::BooleanFilter
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
class FeaturedFilter < Avo::Filters::BooleanFilter
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

## Select Filter

Select filters are similar to Boolean ones. For example, you generate one running `rails generate avo:filter published_filter --select`.

The most significant difference from the **Boolean filter** is in the `apply` method. You only get back one `value` attribute, which represents which entry from the `options` method is selected.

A finished, select filter might look like this.

```ruby
class PublishedFilter < Avo::Filters::SelectFilter
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
class PublishedFilter < Avo::Filters::SelectFilter
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

## Multiple select filter

You may also use a multiple select filter.

```ruby
class PostStatusFilter < Avo::Filters::MultipleSelectFilter
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

## Dynamic options

The select filter can also take dynamic options:

```ruby{15-17}
class AuthorFilter < Avo::Filters::SelectFilter
  self.name = 'Author'

  def apply(request, query, value)
    query = query.where(author_id: value) if value.present?
    query
  end

  # Example `applied_filters`
  # applied_filters = {
  #   "CourseCountryFilter" => {
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

## Text Filter

You can add complex text filters to Avo by running `rails generate avo:filter name_filter --text`.

```ruby
class NameFilter < Avo::Filters::TextFilter
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

## Default value

You may set default values for the `options` you set. For example you may set which option to be selected for the [select filter](#select_filter) and which checkboxes to be set for the [boolean filter](#boolean_filter).

In the `default` method you have access to the `request`, `params`, [`context`](./customization#context), `view_context`, and `current_user` objects.

## Registering filters

To add a filter to one of your resources, you need to declare it on the resource using the `filter` method to which you pass the filter class.

```ruby{8}
class PostResource < Avo::BaseResource
  self.title = :name
  self.search = :id

  field :id, as: :id
  # other fields

  filter PublishedFilter
end
```

## Dynamic filter options

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio" />

You might want to compose more advanced filters, like when you have two filters, one for the country and another for cities, and you'd like to have the cities one populated with cities from the selected country.

Let's take the `CourseResource` as an example.

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

```ruby{3-4}
# app/avo/resources/course_resource.rb
class CourseResource < Avo::BaseResource
  filter CourseCountryFilter
  filter CourseCityFilter
end
```

The country filter is pretty straightforward. Set the query so the `country` field to be one of the selected countries and the `options` are the available countries as `Hash`.

```ruby{6,10}
# app/avo/filters/course_country_filter.rb
class CourseCountryFilter < Avo::Filters::BooleanFilter
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

The `options` method gets the selected countries from the countries filter (`CourseCountryFilter`) and formats them to a `Hash`.

```ruby{6,10}
# app/avo/filters/course_city_filter.rb
class CourseCityFilter < Avo::Filters::BooleanFilter
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
  #   "CourseCountryFilter" => {
  #     "USA" => true,
  #     "Japan" => true,
  #     "Spain" => false,
  #     "Thailand" => false,
  #   }
  # }
  def countries
    if applied_filters["CourseCountryFilter"].present?
      # Fetch the value of the countries filter
      applied_filters["CourseCountryFilter"]
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

The `countries` method above will check if the `CourseCountryFilter` has anything selected. If so, get the names of the chosen ones. This way, you show only the cities from the selected countries and not all of them.

## React to filters

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio?t=219" />

Going further with the example above, a filter can react to other filters. For example, let's say that when a user selects `USA` from the list of countries, you want to display a list of cities from the USA (that's already happening in `options`), and you'd like to select the first one on the list. You can do that with the `react` method.

```ruby{13-28}
# app/avo/filters/course_city_filter.rb
class CourseCityFilter < Avo::Filters::BooleanFilter
  self.name = "Course city filter"

  def apply(request, query, values)
    query.where(city: values.select { |city, selected| selected }.keys)
  end

  def options
    cities_for_countries countries
  end

  # applied_filters = {
  #   "CourseCountryFilter" => {
  #     "USA" => true,
  #     "Japan" => true,
  #     "Spain" => false,
  #     "Thailand" => false,
  #   }
  # }
  def react
    # Check if the user selected a country
    if applied_filters["CourseCountryFilter"].present? && applied_filters["CourseCityFilter"].blank?
      # Get the selected countries, get their cities, and select the first one.
      selected_countries = applied_filters["CourseCountryFilter"].select do |name, selected|
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
  #   "CourseCountryFilter" => {
  #     "USA" => true,
  #     "Japan" => true,
  #     "Spain" => false,
  #     "Thailand" => false,
  #   }
  # }
  def countries
    if applied_filters["CourseCountryFilter"].present?
      # Fetch the value of the countries filter
      applied_filters["CourseCountryFilter"]
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
  if applied_filters["CourseCountryFilter"].present? && applied_filters["CourseCityFilter"].blank?
    # Get the selected countries, get their cities, and select the first one.
    selected_countries = applied_filters["CourseCountryFilter"]
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

Besides checking if the countries filter is populated (`applied_filters["CourseCountryFilter"].present?`), we also want to allow the user to customize the cities filter further, so we need to check if the user has added a value to that filter (`applied_filters["CourseCityFilter"].blank?`).
If these conditions are true, the country filter has a value, and the user hasn't selected any values from the cities filter, we can react to it and set a value as the default one.

<img :src="('/assets/img/filters/dynamic-options.gif')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

Of course, you can modify the logic and return all kinds of values based on your needs.

## Empty message text

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio?t=347" />

There might be times when you will want to show a message to the user when you're not returning any options. You may customize that message using the `empty_message` option.

<img :src="('/assets/img/filters/empty-message.gif')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

```ruby{4}
# app/avo/filters/course_city_filter.rb
class CourseCityFilter < Avo::Filters::BooleanFilter
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

```ruby{2}
class CourseResource < Avo::BaseResource
  self.keep_filters_panel_open = true

  field :id, as: :id
  field :name, as: :text
  field :country, as: :select, options: Course.countries.map { |country| [country, country] }.to_h
  field :city, as: :select, options: Course.cities.values.flatten.map { |country| [country, country] }.to_h
  field :links, as: :has_many, searchable: true, placeholder: "Click to choose a link"

  filter CourseCountryFilter
  filter CourseCityFilter
end
```

<img :src="('/assets/img/filters/keep-filters-panel-open.gif')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

## Visibility

You may want to manipulate your filter visibility on screens. You can do that using the `self.visible` attribute.

Inside the visible block you can acces the following variables:
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
  end
```

## Filters arguments

Filters can have different behaviors according to their host resource. In order to achieve that, arguments must be passed like on the example below:

```ruby{9-11}
class FishResource < Avo::BaseResource
  self.title = :name

  field :id, as: :id
  field :name, as: :text
  field :user, as: :belongs_to
  field :type, as: :text, hide_on: :forms

  filter NameFilter, arguments: {
    case_insensitive: true
  }
end
```

Now, the arguments can be accessed inside `NameFilter` ***`apply` method*** and on the ***`visible` block***!

```ruby{4-6,8-14}
class NameFilter < Avo::Filters::TextFilter
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

<Option name="`decode_filter_params`">

Decodes the `filters` param. This Rails helper can be used anywhere in a view or off the `view_context`.

#### Usage

```ruby
# in a view
decode_filter_params params[:filters] # {"NameFilter"=>"Apple"}

# Or somewhere in an Avo configuration file

class DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    filters = view_context.decode_filter_params(params[:filters])

    do_something_important_with_the_filters filters
  end
end
```
</Option>

<Option name="`encode_filter_params`">

Encodes a `filters` object into a serialized state that Avo understands. This Rails helper can be used anywhere in a view or off the `view_context`.

#### Usage

```ruby
# in a view
filters = {"NameFilter"=>"Apple"}
encode_filter_params filters # eyJOYW1lRmlsdGVyIjoiQXBwbGUifQ==

# Or somewhere in an Avo configuration file

class DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    do_something_important

    redirect_to avo.resources_users_path(filters: view_context.decode_filter_params({"NameFilter"=>"Apple"}))
  end
end
```
</Option>

### Standalone helpers

<Option name="`Avo::Filters::BaseFilter.decode_filters`">

Decodes the `filters` param. This standalone method can be used anywhere.

#### Usage

```ruby
class DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    filters = Avo::Filters::BaseFilter.decode_filters(params[:filters])

    do_something_important_with_the_filters filters
  end
end
```
</Option>

<Option name="`Avo::Filters::BaseFilter.encode_filters`">

Encodes a `filters` object into a serialized state that Avo understands. This standalone method can be used anywhere.

#### Usage

```ruby
class DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    do_something_important

    redirect_to avo.resources_users_path(filters: Avo::Filters::BaseFilter.encode_filters({"NameFilter"=>"Apple"}))
  end
end
```
</Option>

## Persistent filters

By default, when a user visits an <Index /> view of a resource the filters payload will be empty, so they will be set on their [default values](#default-value).
