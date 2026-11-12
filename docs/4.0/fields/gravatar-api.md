---
license: community
outline: [2, 3]
guide: ./gravatar.html
prev:
  text: "Gravatar"
  link: "./gravatar.html"
next: false
---

# Gravatar API

Per-option reference for the Gravatar field. For tasks and examples, see the [Gravatar guide](./gravatar.html).

Options are passed to the field declaration in `app/avo/resources/user.rb`:

```ruby
field :email, as: :gravatar, rounded: false, size: 60
```

For shared options such as `name` and computed values, see [Common field options](../field-options.html).

## Index display

<Option name="`rounded`">

Controls whether the index avatar is round. The show avatar is always square.

```ruby
field :email, as: :gravatar, rounded: false
```

- **Type:** Boolean
- **Default:** `true`

</Option>

<Option name="`size`">

Sets the index avatar's width and height in pixels and the image size requested from Gravatar. Larger values increase the table row height. The show view always requests and renders a 340-pixel image, independently of this option.

```ruby
field :email, as: :gravatar, size: 60
```

- **Type:** Integer (nonblank input is converted with `to_i`)
- **Default:** `32`
- **Validation:** Avo does not validate the range before forwarding the size to Gravatar.

</Option>

<Option name="`link_to_record`">

Wraps the index avatar in a link to the record. Does not affect the show avatar.

```ruby
field :email, as: :gravatar, link_to_record: true
```

- **Type:** Boolean
- **Default:** `false`

</Option>

## Fallback image

<Option name="`default`">

The fallback image URL for an email address with no matching Gravatar, on both index and show views. Avo URL-encodes the value before including it in the Gravatar request.

```ruby
field :email, as: :gravatar, default: "https://example.com/images/avatar.png"
```

- **Type:** String
- **Default:** `""` (Gravatar's own default avatar)

:::info
The fallback is fetched by Gravatar, so its URL must be publicly accessible. Avo does not validate the URL or host the fallback image.
:::

</Option>
