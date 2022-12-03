---
version: '1.0'
license: community
---

# Hidden

There are scenarios where in order to be able to submit a form, an input should be present but inaccessible to the user. `Hidden` will render a `<input type="hidden" />` element on the page.

It's rendered only on the `Edit` and `New` views.

```ruby
field :group_id, as: :hidden
```
