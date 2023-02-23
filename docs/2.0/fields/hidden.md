---
version: '1.0'
license: community
---

# Hidden

There are scenarios where in order to be able to submit a form, an input should be present but inaccessible to the user. An example of this might be where you want to set a field by default without the option to change, or see it. `Hidden` will render a `<input type="hidden" />` element on the `Edit` and `New` page.

> Hidden will only render on the `Edit` and `New` views.

### Example usage:
```ruby
# Basic
field :group_id, as: :hidden

# With default
field :user_id, as: :hidden, default: -> { current_user.id }

# If the current_user is a admin 
# 1. Allow them to see and select a user.
# 2. Remove the user_id field to prevent user_id it from overriding the user selection.
# Otherwise set the user_id to the current user and hide the field.
field :user, as: :belongs_to, visible: -> (resource:) { context[:current_user].admin? }
field :user_id, as: :hidden, default: -> { current_user.id }, visible: -> (resource:) { !context[:current_user].admin? }
```
