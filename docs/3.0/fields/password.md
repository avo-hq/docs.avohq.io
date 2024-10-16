---
version: '1.0'
license: community
---

# Password

The `Password` field renders a `input[type="password"]` element for that field. By default, it's visible only on the `Edit` and `New` views.

```ruby
field :password, as: :password
```

#### Reveal

<VersionReq version="3.13.7" class="mt-2" />

You can set the `reveal` to true to show an "eye" icon that toggles the password between hidden or visible.

**Related:**
- [Devise password optional](./../resources#devise-password-optional)

