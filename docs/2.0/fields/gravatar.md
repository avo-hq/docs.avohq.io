---
version: '2.0'
license: community
---

# Gravatar

The `Gravatar` field turns an email field from the database into an avatar image if it's found in the [Gravatar](https://en.gravatar.com/site/implement/images/) database.

```ruby
field :email,
  as: :gravatar,
  rounded: false,
  size: 60,
  default_url: 'some image url'
```

## Options
:::option `rounded`
Choose whether the rendered avatar should be rounded or not on the `Index` view.

On `Show`, the image is always a `square` and the size is `responsive`.

<!-- @include: ./common/default_boolean_true.md -->
:::

:::option `size`
Set the size of the avatar.

#### Default

`32`

#### Possible values

Any number in pixels. Keep in mind that the size will influence the `Index` table row height.
:::

:::option `default`
Set the default image if the email address was not found in Gravatar's database.

#### Default

`32`

#### Possible values

Any number in pixels. Keep in mind that the size will influence the `Index` table row height.
:::

<!--@include: ./common/link_to_resource_common.md-->

## Using computed values

You may also pass in a computed value.

```ruby
field :email, as: :gravatar do |model|
  "#{model.google_username}@gmail.com"
end
```
