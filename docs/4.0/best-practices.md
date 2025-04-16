# Best practices

Due of the dynamic nature of Ruby, Rails, and Avo, you might be tempted to do a few things differently than how we envisioned them to be done.
It's ok if you want to keep doing them like that, but they might not be the most the optimum way of running Avo.

Here's a collection of best practices that we'd like you to know about.

## Avoiding `n+1` using `self.includes`

`n+1` issues happen, but they are pretty simple to mitigate using Avo.

Each resource has the `self.includes` option that helps you eager-load associations.

:::info Detailed documentation
[`self.includes`](resources.html#self_includes)
:::

## Avoid using `if/else` statements in `def fields`

You might be tempted to using `if/else` statements inside the `def fields` method.
This practice is discouraged and we'll try to explain why here.

Because of checks Avo makes during the request lifecycle, we need to know exactly which fields you have defined for your resource, no matter if they should be hidden or not to a user or in a certain scenario.

The alternative is to use the [`visible`](./field-options.html#field-visibility) field option which will add the field on the list, but keep it hidden from the user based on the computed value.

### Example:

```ruby
# Scenario 1
def fields
  if params[:special_case].present?
    field :special_field, as: :text
  else
    field :regular_field, as: :text
  end
end

# Scenario 2
def fields
  field :special_field, as: :text, visible: -> { params[:special_case].present? }
  field :regular_field, as: :text, visible: -> { params[:special_case].present? }
end
```

In the first scenario, where we use the `if/else` statements, depending on how the `params` are set, the fields list will be `[special_field]` or `[regular_field]`, but never both.
This will lead to many issues like filters not being visible, params not being properly permitted, and more.

In the second scenario, the field list will always be `[special_field, regular_field]` with different visibility rules.
Now Avo will know they are both there and set up the request and UI properly.

So, please use the `visibility` option and avoid `if/else` in `def fields` whenever possible.

## Add an index on the `created_at` column

Avo, by default, sorts the the record on the <Index /> view by the `created_at` attribute, so it's a good idea to add an index for that column.

```ruby
# Example migration
class AddIndexOnUsersCreatedAt < ActiveRecord::Migration[7.1]
  def change
    add_index :users, :created_at
  end
end
```
