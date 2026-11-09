---
license: community
description: "The Avatar field is a field that displays a user's avatar or initials."
fieldTags: [assets]
outline: [2, 3]
api_docs: ./avatar-api.html
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

Without an avatar source, the field falls back to initials derived from the record's title. The field is index-only by default.

<Image src="/assets/img/4_0/fields/avatar/index.webp" dark-src="/assets/img/4_0/fields/avatar/index-dark.webp" width="1776" height="758" alt="An Avo index table with three columns — ID, an Avatar column showing each user's square avatar thumbnail, and Name — illustrating the avatar field rendered on the Index view." prompt="index page" />

## Choose the avatar image

Configure the image with the resource's [`self.avatar`](../resources-api.html#self.avatar) setting. In the example above, `source: :avatar` reads the image from `record.avatar`, such as an Active Storage attachment. For computed sources and resource-level avatar placement, see [Cover and avatar](../cover-and-avatar.html#add-an-avatar).

## Label the avatar column

If you want a heading above the avatars instead of a blank header, supply the shared [`name`](../field-options-api.html#name) option:

```ruby
# app/avo/resources/user.rb
field :avatar, as: :avatar, name: "Avatar"
```

## Configure shared field behavior

See [Shared field options](../field-options.html) for options common to fields. The [Avatar API](./avatar-api.html) documents the field's defaults, image source, and fallback behavior.
