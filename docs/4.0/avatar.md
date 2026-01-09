---
license: community
---

# Record Avatar

It's common that a record has a visual representation. A user might have a headshot, a company might have a logo, or a product might have an image. Avo now has a way to display these visual representations in the app using the `avatar` configuration.

The avatar will be visible in multiple places in the app like the <Show /> and <Edit /> views, and the new breadcrumbs.

<!-- <Image src="/assets/img/3_0/cover-and-profile-photo/cover-and-profile-photo.png" alt="Cover and Profile Photos" width="2560 " height=" 1876" class="mt-8" /> -->

## Configuration

The `profile_photo` option takes two arguments: [`visible_on`](views.html#common-visible-on-configuration-values) and `source`.

```ruby
self.profile_photo = {
  visible_on: [:show, :forms],
  source: -> {
    if view.index?
      # We're on the index page and don't have a record to reference
      DEFAULT_IMAGE
    else
      # We have a record so we can reference it's profile_photo
      record.profile_photo
    end
  }
}
```

<Option name="`visible_on`">

This controls where the cover photo should be displayed.

It defaults to the <Show />, <Edit />, and <New /> views, but you can change that to be displayed to the <Index /> view or a combination of views.
| | |
| --------------- | ------- |
| Required | `false` |
| Default value | `[:show, :forms]` |
| Possible values | You may choose one [view](./views.html#common-visible-on-configuration-values) or a combination of them using an array. <br> `:show`, `:edit`, `:new`, `:index`, `:forms`, `:display`, `[:show, :edit]` |

##### Optional

`true`

##### Default value

#### Possible values

</Option>

<Option name="`source`">

This controls what should be displayed as the image.

You can call a field on the record using a `Symbol`, or you can open a block where you have access to the `record` and add your own value.

##### Default value

`nil`

#### Possible values

You can call a field on the `record` using a symbol.

```ruby
self.profile_photo = {
  source: :profile_photo # this will run `record.profile_photo`
}
```

Use a block to compute your own value.

```ruby
self.profile_photo = {
  source: -> {
    if view.index?
      # We're on the index page and don't have a record to reference
      DEFAULT_IMAGE
    else
      # We have a record so we can reference it's profile_photo
      record.profile_photo
    end
  }
}
```

</Option>
