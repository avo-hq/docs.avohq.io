---
license: community
description: "The Avatar field is a field that displays a user's avatar or initials."
fieldTags: [assets]
outline: [2, 3]
---

# Avatar

The `Avatar` field adds a small, square avatar column to the <Index /> view. It displays the resource's configured avatar image, or the record's initials when no image is available.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.title = :name
  self.avatar = { source: :avatar }

  def fields
    field :avatar, as: :avatar
    field :name, as: :text
  end
end
```

Without an avatar source, the field falls back to initials derived from the record's title. The field is index-only by default, and its column header is blank unless you supply `name`.

<Image src="/assets/img/4_0/fields/avatar/index.webp" dark-src="/assets/img/4_0/fields/avatar/index-dark.webp" width="1776" height="758" alt="An Avo index table with three columns — ID, an Avatar column showing each user's square avatar thumbnail, and Name — illustrating the avatar field rendered on the Index view." prompt="index page" />

## Choose the avatar image

Configure the image with the resource's [`self.avatar`](../cover-and-avatar.html#add-an-avatar) setting. In the example above, `source: :avatar` reads the image from `record.avatar`, such as an Active Storage attachment. The field displays that resource avatar; its field identifier does not select the image source.

If the image source is blank, Avo displays the record's initials instead. If no initials are available either, it renders an empty avatar placeholder.

## Label the avatar column

If you want a heading above the avatars, supply the shared [`name`](../field-options.html#name) option:

```ruby
# app/avo/resources/user.rb
field :avatar, as: :avatar, name: "Avatar"
```

## Configure shared field behavior

The avatar field has no field-specific options. See [Shared field options](../field-options.html) for options common to fields. Image size and shape are fixed by the avatar field and are not configurable field options.
