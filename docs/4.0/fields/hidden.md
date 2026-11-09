---
license: community
description: "Renders a hidden input on the New and Edit views."
fieldTags: [utility]
outline: [2, 3]
---

# Hidden

The `hidden` field submits a value with a form without displaying an editable control. It renders an `<input type="hidden">` on the New and Edit views and does not appear on Index or Show.

```ruby
# app/avo/resources/post.rb
field :user_id, as: :hidden, default: -> { current_user.id }
```

Without a `default`, the input uses the record's existing attribute value. A default fills a `nil` value on New; it does not replace an existing value or fill a blank value on Edit. Hidden has no field-specific options. For shared settings such as `default`, `visible`, and HTML attributes, see [Common field options](../field-options.html).

:::warning Hidden is not access control
Hidden inputs can be inspected and changed in the browser or in a crafted request. Enforce ownership and other sensitive values on the server rather than trusting the submitted value.
:::

## Submit an existing attribute

If the record already has a value to submit, declare the field without a default:

```ruby
# app/avo/resources/user.rb
field :group_id, as: :hidden
```

## Let administrators choose the user

If administrators can choose a user while other users get their own ID as the initial value, make the association selector and the hidden field mutually exclusive. This prevents the hidden input from overriding an administrator's selection.

```ruby
# app/avo/resources/post.rb
field :user, as: :belongs_to, visible: -> { current_user.admin? }
field :user_id, as: :hidden, default: -> { current_user.id }, visible: -> { !current_user.admin? }
```

The `default` block can access `current_user`. Visibility controls which input Avo renders; server-side authorization must still enforce who can assign the user.
