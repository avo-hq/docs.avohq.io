---
version: '3.16.2'
license: community
betaStatus: beta
demoVideo: https://youtu.be/wnWvzQyyo6A?t=1030
---

# Array

The `Array` field in allows you to display and manage structured array data. This field supports flexibility in fetching and rendering data, making it suitable for various use cases.

:::warning Important
To use the `Array` field, you must create a resource specifically for it. Refer to the [Array Resource documentation](../array-resources) for detailed instructions.

For example, to use `field :attendees, as: :array`, you can generate an array resource by running the following command:

```bash
rails generate avo:resource Attendee --array
```

This step ensures the proper setup of your array field within the Avo framework.
:::

### Example 1: Array field with a block

You can define array data directly within a block. This is useful for static or pre-configured data:

```ruby{3-8}
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :attendees, as: :array do
      [
        { id: 1, name: "John Doe", role: "Software Developer", organization: "TechCorp" },
        { id: 2, name: "Jane Smith", role: "Data Scientist", organization: "DataPros" }
      ]
    end
  end
end
```

### Example 2: Array field fetching data from the model's method

If no block is defined, Avo will attempt to fetch data by calling the corresponding method on the model:

```ruby
class Course < ApplicationRecord
  def attendees
    User.all.first(6) # Example fetching first 6 users
  end
end
```

Here, the `attendees` field will use the `attendees` method from the `Course` model to render its data dynamically.

### Example 3: Fallback to the `records` method

If neither the block nor the model's method exists, Avo will fall back to the `records` method defined in the resource used to render the array field. This is useful for providing a default dataset.

When neither a block nor a model's method is defined, Avo will fall back to the `records` method in the resource used to render the field. This is a handy fallback for providing default datasets:

```ruby
class Avo::Resources::Attendee < Avo::Resources::ArrayResource
  def records
    [
      { id: 1, name: "Default Attendee", role: "Guest", organization: "DefaultOrg" }
    ]
  end
end
```

## Summary of Data Fetching Hierarchy

When using `has_many` with `array: true`, Avo will fetch data in the following order:
1. Use data returned by the **block** provided in the field.
2. Fetch data from the **associated model method** (e.g., `Course#attendees`).
3. Fall back to the **`records` method** defined in the resource.

This hierarchy provides maximum flexibility and ensures seamless integration with both dynamic and predefined datasets.

