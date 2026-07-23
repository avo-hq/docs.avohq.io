---
license: community
description: "The Gravatar field turns an email field from the database into an avatar image if it's found in the Gravatar database."
fieldTags: [assets]
---

# Gravatar

The `Gravatar` field turns an email field from the database into an avatar image if it's found in the [Gravatar](https://en.gravatar.com/site/implement/images/) database.

```ruby
field :email,
  as: :gravatar,
  rounded: false,
  size: 60,
  default: 'some image url'
```

## Options
<Option name="`rounded`">

Choose whether the rendered avatar should be rounded or not on the `Index` view.

On `Show`, the image is always a `square,` and the size is `responsive`.

<!-- @include: ./../common/default_boolean_true.md -->
</Option>

<Option name="`size`">

Set the size of the avatar.

#### Default value

`32`

#### Possible values

Any number in pixels. Remember that the size will influence the `Index` table row height.
</Option>

<Option name="`default`">

Set the default image URL to display when the email address is not found in Gravatar's database.

#### Default value

Empty string (`""`), which makes Gravatar serve its own default avatar.

#### Possible values

Any image URL as a string.
</Option>

<!-- @include: ./../common/link_to_record_common.md-->

## Using computed values

You may also pass in a computed value.

```ruby
field :email, as: :gravatar do
  "#{record.google_username}@gmail.com"
end
```
