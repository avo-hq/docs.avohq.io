---
license: community
description: "Renders a password input element."
fieldTags: [text]
---

# Password

The `Password` field renders a `input[type="password"]` element for that field. By default, it's visible only on the `Edit` and `New` views.

```ruby
field :password, as: :password
```

#### Revealable

You can set the `revealable` to true to show an "eye" icon that toggles the password between hidden or visible.

**Related:**
- [Devise password optional](./../resources-api#self.devise_password_optional)
