---
version: '2.0'
license: community
---

# Gravatar

The `Gravatar` field should be linked to an email field from the database, displaying the avatar image assigned to that email address in the [Gravatar](https://en.gravatar.com/site/implement/images/) database. By default, it uses the `email` field, but if the email address is stored in another column, you can specify that column.

```ruby
field :email, as: :gravatar, rounded: false, size: 60, default_url: 'some image url'
```

You may also pass in a computed value.

```ruby
field :email, as: :gravatar do |model|
  "#{model.google_username}@gmail.com"
end
```

## Customization

On **Index**, by default, the image is `rounded` and has size of `40 px`, but it can be changed by setting `rounded` to `false` and by specifying the `size` (in pixels) in field declaration.

On **Show**, the image is always `squared` and the size is `responsive`.

You can customize the image shown when gravatar is not found by changing the `default_url` attribute to a custom image URL.
