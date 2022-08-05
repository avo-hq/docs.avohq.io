---
version: '2.0'
license: community
---

# Password

The `Password` field renders a `input[type="password"]` element for that field.

`Password` field is by default enforced to be shown only on **Form** views.

```ruby
field :password, as: :password, placeholder: 'secret',
```

Related:

- [Devise password optional](./../resources#devise-password-optional)