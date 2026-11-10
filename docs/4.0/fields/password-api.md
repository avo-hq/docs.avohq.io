---
license: community
outline: [2, 3]
guide: ./password.html
prev:
  text: "Password"
  link: "./password.html"
next: false
---

# Password API

Per-option reference for the Password field. For tasks and examples, see the [Password guide](./password.html).

Declare the field in your resource's `fields` method, for example in `app/avo/resources/user.rb`:

```ruby
field :password, as: :password
```

For options shared by fields, including placeholders, autocomplete, visibility, and value formatting, see [Field options](../field-options.html).

## Field-specific options

<Option name="`revealable`">

Adds an eye button that toggles the input between `password` and `text` types. The input starts masked. The button does not toggle a disabled input.

```ruby
field :password, as: :password, revealable: true
```

- **Type:** Boolean
- **Default:** `false`

:::warning Ruby truthiness
This option does not parse Boolean strings. Blank values fall back to `false`; nonblank values use Ruby truthiness, so `"false"` and `0` enable the reveal button.
:::

</Option>

## View and value behavior

| View | Default behavior |
| --- | --- |
| New / Edit | Renders an `input[type="password"]`, with its value set to the field's resolved value. |
| Index / Show | Hidden. |

The field does not automatically clear its value before rendering. It inherits value resolution and formatting from the base field. Shared `autocomplete` configuration is passed to the input without a password-specific default.

Submissions follow the normal field assignment path: the submitted value is passed to the model attribute setter, or through the shared `update_using` callback when configured. The Password field does not hash, encrypt, validate, or automatically discard blank values.

The resource-level [`self.devise_password_optional`](../resources-api.html#self.devise_password_optional) setting defaults to `false`. When enabled, Avo removes both `password` and `password_confirmation` parameters if both are blank; when either is present, both remain subject to normal submission handling.

:::warning Masking is not storage security
An input's value remains available in the page even when masked. Binding a stored secret or password digest exposes that value to the browser. Password hashing and validation are the model or authentication library's responsibility.
:::
