---
license: community
description: "The Gravatar field turns an email field from the database into an avatar image if it's found in the Gravatar database."
fieldTags: [assets]
outline: [2, 3]
api_docs: ./gravatar-api.html
---

# Gravatar

The `Gravatar` field turns an email field from the database into an avatar image if it's found in the [Gravatar](https://en.gravatar.com/site/implement/images/) database.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :email, as: :gravatar
  end
end
```

By default, the field is labeled "Avatar" and displays a round, 32-pixel image on the index view. On the show view, it displays a square, 340-pixel image. It is hidden on new and edit forms. When no matching avatar exists, Gravatar serves its own default image.

## Adjust avatars in the index table

<span id="rounded"></span>
<span id="size"></span>

Set [`rounded`](./gravatar-api.html#rounded) to `false` for square avatars, and use [`size`](./gravatar-api.html#size) to change their dimensions. Larger avatars increase the table row height. Neither setting changes the show view.

```ruby
# app/avo/resources/user.rb
field :email, as: :gravatar, rounded: false, size: 60
```

To open the record when someone clicks its index avatar, enable [`link_to_record`](./gravatar-api.html#link_to_record).

```ruby
# app/avo/resources/user.rb
field :email, as: :gravatar, link_to_record: true
```

## Display a fallback image

<span id="default"></span>

Provide a [`default`](./gravatar-api.html#default) image URL for email addresses without a Gravatar. This fallback applies on both index and show views.

```ruby
# app/avo/resources/user.rb
field :email, as: :gravatar, default: "https://example.com/images/avatar.png"
```

## Build the email address from the record

Use a computed value when the email address is not stored directly in the field's attribute.

```ruby
# app/avo/resources/user.rb
field :email, as: :gravatar do
  "#{record.google_username}@gmail.com"
end
```

For shared field configuration, see [Common field options](../field-options.html).
