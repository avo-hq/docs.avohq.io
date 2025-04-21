# Display and Edit Join Table Fields in `has_many :through` Associations

A common scenario in Rails is using a [`has_many :through`](../associations/has_many#has-many-through) association to connect two models via a join model that contains extra fields. In Avo, you might want to display and edit attributes from the join table directly in your resource views (index, show, edit). This guide demonstrates how to achieve that.

## Example Models

```ruby
class Store < ApplicationRecord
  has_one :location

  has_many :patronships, class_name: :StorePatron
  has_many :patrons, through: :patronships, class_name: :User, source: :user
end

class User < ApplicationRecord
  has_many :patronships, class_name: :StorePatron
  has_many :stores, through: :patronships

  # Needed to make the field editable in Avo
  attr_accessor :review
end

# Join Table
class StorePatron < ApplicationRecord
  belongs_to :store
  belongs_to :user

  validates :review, presence: true
end
```

## Displaying Join Table Fields

You can display a join table attribute (like `review`) on the index or show view of the related resource by adding the field in your resource file and using `format_using` to fetch the correct value from the join table.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :review,
      format_using: -> {
        # Fetch the review from the StorePatron join table
        record.patronships.find_by(store_id: params[:via_record_id])&.review
      }
  end
end
```

This will show the `review` field from the join table when viewing users from the context of a store.

## Editing Join Table Fields

To allow editing, you need to:

1. Add a writer for the field to the model (e.g., `attr_accessor :review` or a custom setter).
2. Use the `update_using` option to update the join record.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    if params[:resource_name] == 'stores' || params[:via_resource_class] == 'Avo::Resources::Store'
      field :review,
        update_using: -> {
          # Update the review in the StorePatron join table
          patronship = record.patronships.find_by(user_id: record.id.to_i)
          patronship.update(review: value)
        },
        format_using: -> {
          record.patronships.find_by(user_id: record.id.to_i)&.review
        }
    end
  end
end
```

**Note:**
- The field will only render on the form if the model has a writer for it.
- You may need to adjust the logic for finding the join record depending on your association direction.

## Conditional Display Based on Parent Resource

You can use the `params` to control when the field is shown or editable. For example:

```ruby
# We use different params to detect the navigation context:
# - `resource_name` identifies when users access through the index table
# - `via_resource_class` identifies when users click to view or edit the resource
if params[:resource_name] == 'stores' || params[:via_resource_class] == 'Avo::Resources::Store'
  # field
end
```

In this example, the `review` field is only visible/editable on User when the resource is accessed from the `Store` resource.

```ruby
# app/avo/resources/store.rb
class Avo::Resources::Store < Avo::BaseResource
  def fields
    field :patrons,
      as: :has_many,
      through: :patronships,
      translation_key: "patrons",
      attach_fields: -> {
        # Add the review field to the attach form
        field :review, as: :text
      }
  end
end


# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    # Only show when accessed from the Store resource
    if params[:resource_name] == 'stores' || params[:via_resource_class] == 'Avo::Resources::Store'
      field :review,
        format_using: -> {
          # Fetch the review from the StorePatron join table
          record.patronships.find_by(user_id: record.id.to_i)&.review
        }
    end
  end
end
```

## Gotchas & Tips

- Computed fields (using a block) do not render on forms. Use `format_using` and provide a writer on the model.
- Avo checks for a writer method to decide if a field is editable.
- If the form fails to save, your join field may revert to its original value — consider validations and persistence carefully.
