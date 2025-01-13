# Array Resources

## Overview

An **Array Resource** is a flexible resource that can be backed by an **array of hashes** or an **array of Active Record objects**. It is not constrained to an Active Record model and allows dynamic data handling.

## Creating an Array Resource

Generate an **Array Resource** using the `--array` flag:

```bash
bin/rails generate avo:resource Movie --array
```

This sets up a resource designed to work with an array of data.

## Defining the `records` Method

The `records` method serves as the fallback source for data in the resource. It returns an array of hashes or Active Record objects.

### Example

```ruby
def records
  [
    {
      id: 1,
      name: "The Shawshank Redemption",
      release_date: "1994-09-23"
    },
    {
      id: 2,
      name: "The Godfather",
      release_date: "1972-03-24",
      fun_fact: "The iconic cat in the opening scene was a stray found by director Francis Ford Coppola on the studio lot."
    },
    {
      id: 3,
      name: "Pulp Fiction",
      release_date: "1994-10-14"
    }
  ]
end
```

## Defining Fields

Array Resources use fields like any other Avo resource. Here’s an example for a `Movie` resource:

```ruby
class Avo::Resources::Movie < Avo::Resources::ArrayResource
  def records
    [
      {
        id: 1,
        name: "The Shawshank Redemption",
        release_date: "1994-09-23"
      },
      {
        id: 2,
        name: "The Godfather",
        release_date: "1972-03-24",
        fun_fact: "The iconic cat in the opening scene was a stray found by director Francis Ford Coppola on the studio lot."
      },
      {
        id: 3,
        name: "Pulp Fiction",
        release_date: "1994-10-14"
      }
    ]
  end

  def fields
    main_panel do
      field :id, as: :id
      field :name, as: :text
      field :release_date, as: :date
      field :fun_fact, only_on: :index, visible: -> { resource.record.fun_fact.present? } do
        record.fun_fact.truncate_words(10)
      end

      sidebar do
        field :fun_fact do
          record.fun_fact || "There is no register of a fun fact for #{record.name}"
        end
      end
    end
  end
end
```

## Using Array Resources as `has_many`

Array Resources can also be used as a `has_many` field by setting the `array: true` option. The data fetching follows this hierarchy:

1. **Field block**: If a block is provided, its return value will be used.
2. **Model method**: If the block is not provided, Avo will fetch the data using the associated model's method.
3. **`records` method**: If neither the block nor the model method exists, the `records` method in the resource will be used as a fallback.

### Example 1: Basic `has_many` Array with a Block

```ruby
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :attendees, as: :has_many, array: true do
      [
        { id: 1, name: "John Doe", role: "Software Developer", organization: "TechCorp" },
        { id: 2, name: "Jane Smith", role: "Data Scientist", organization: "DataPros" }
      ]
    end
  end
end
```

### Example 2: Fetching Data from the Model's Method

If no block is provided, Avo will attempt to call the model's method. For example:

```ruby
class Course < ApplicationRecord
  def attendees
    User.all.first(6) # Example fetching first 6 users
  end
end
```

In this case, when rendering the `attendees` field, Avo will use the `attendees` method on the `Course` model to fetch data.

### Example 3: Falling Back to the `records` Method

If neither the block nor the model's method exists, Avo will fall back to the `records` method defined in the resource. This is useful for providing a default dataset.

```ruby
class Avo::Resources::Attendee < Avo::Resources::ArrayResource
  def records
    [
      { id: 1, name: "Default Attendee", role: "Guest", organization: "DefaultOrg" }
    ]
  end
end
```

---

## Summary of Data Fetching Hierarchy

When using `has_many` with `array: true`, Avo will fetch data in the following order:
1. Use data returned by the **block** provided in the field.
2. Fetch data from the **associated model method** (e.g., `Course#attendees`).
3. Fall back to the **`records` method** defined in the resource.

This hierarchy provides maximum flexibility and ensures seamless integration with both dynamic and predefined datasets.
