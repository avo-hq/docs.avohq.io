---
license: community
description: "Renders a password input element."
fieldTags: [text]
outline: [2, 3]
---

# Password

The `Password` field renders an `input[type="password"]` element for entering a password on forms.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :password, as: :password
  end
end
```

By default, the field appears only on the New and Edit views, and the input masks its contents without a reveal button.

## Let users check their password {#revealable}

Set `revealable: true` to add an eye button that toggles the input between masked and visible text. Leave it unset or use `false` to keep the input masked. Disabled inputs cannot be revealed with the button.

```ruby
# app/avo/resources/user.rb
field :password, as: :password, revealable: true
```

## Configure shared field behavior {#options}

For options such as the field name, placeholder, visibility, and help text, see [Field options](../field-options.html).

## Related

- [Devise password optional](./../resources-api#self.devise_password_optional)
