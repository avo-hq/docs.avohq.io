---
license: community
description: "Renders a password input element."
fieldTags: [text]
outline: [2, 3]
api_docs: ./password-api.html
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

Set [`revealable: true`](./password-api.html#revealable) to add an eye button that toggles the input between masked and visible text. Leave it unset or use `false` to keep the input masked. Disabled inputs cannot be revealed with the button.

```ruby
# app/avo/resources/user.rb
field :password, as: :password, revealable: true
```

## Keep stored credentials out of the form

Use the field with a model password setter, such as the one provided by your authentication library. Masking only changes how the input looks; it does not encrypt or hash the submitted value. Password storage and validation belong to the model.

:::warning Input values
The input receives the field's resolved value. Do not bind it to a stored password digest or return an existing secret through a computed value or formatter: masked text is still present in the page and can be inspected or revealed.
:::

## Allow updates without changing a Devise password

If an empty password should leave a Devise user's password unchanged, enable [`self.devise_password_optional`](../resources-api.html#self.devise_password_optional) on the resource. Avo then removes both `password` and `password_confirmation` from the submitted parameters when both are blank.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.devise_password_optional = true

  def fields
    field :password, as: :password
    field :password_confirmation, as: :password
  end
end
```

## Configure shared field behavior {#options}

See the [Password API](./password-api.html) for the reveal option and value-submission behavior. For options such as the field name, placeholder, visibility, and help text, see [Field options](../field-options.html).

## Related

- [Devise password optional](../resources-api.html#self.devise_password_optional)
