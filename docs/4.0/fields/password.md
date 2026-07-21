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

## Options

<Option name="`revealable`">

Show an "eye" icon next to the input that toggles the password between hidden and visible.

#### Default value

`false`

#### Possible values

`true` or `false`

```ruby
field :password, as: :password, revealable: true
```
</Option>

## Related

- [Devise password optional](./../resources-api#self.devise_password_optional)
