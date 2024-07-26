---
version: '3.10'
license: community
---

# Cover and Profile photos

<Image src="/assets/img/3_0/cover-and-profile-photo/cover-and-profile-photo.png" alt="Cover and Profile Photos" width="2560 " height=" 1876" class="mt-8" />

It's common to want to display the information in different ways than just "key" and "value". That's why Avo has rich fields like [`key_value`](./fields/key_value), [`trix`](./fields/trix), [`tip_tap`](./fields/tip_tap), [`files`](./fields/files), and more.

Avo now also has the Cover and Profile photo areas where you can customize the experience even more.
The APIs used are pretty similar and easy to use.

## Profile photo

The `profile_photo` option takes two arguments: `visible_on` and `source`.

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

<Option name="`visible_on`">
This controls where the cover photo should be displayed.

It defaults to the <Show />, <Edit />, and <New /> views, but you can change that to be displayed to the <Index /> view or a combination of views.

##### Optional

`true`

##### Default value

`[:show, :forms]`

#### Possible values

You may choose one view or a combination of them using an array.

`:show`, `:edit`, `:new`, `:index`, `:forms`, `:display`, `[:show, :edit]`;
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

## Cover photo

The `cover_photo` option takes three arguments: `size`, `visible_on`, and `source`.

```ruby
self.cover_photo = {
  size: :md, # :sm, :md, :lg
  visible_on: [:show, :forms], # can be :show, :index, :edit, or a combination [:show, :index]
  source: -> {
    if view.index?
      # We're on the index page and don't have a record to reference
      DEFAULT_IMAGE
    else
      # We have a record so we can reference it's cover_photo
      record.cover_photo
    end
  }
}
```

<Option name="`size`">
This represents the height of the cover photo. It can be small, medium or large.

##### Optional

`true`

##### Default value

`:md`

#### Possible values

`:sm`, `:md`, or `:lg`
</Option>

<Option name="`visible_on`">
This controls where the cover photo should be displayed.

It defaults to the <Show />, <Edit />, and <New /> views, but you can change that to be displayed to the <Index /> view or a combination of views.

##### Optional

`true`

##### Default value

`[:show, :forms]`

#### Possible values

You may choose one view or a combination of them using an array.

`:show`, `:edit`, `:new`, `:index`, `:forms`, `:display`, `[:show, :edit]`;
</Option>

<Option name="`source`">
This controls what should be displayed as the image.

You can call a field on the record using a `Symbol`, or you can open a block where you have access to the `record` and add your own value.

##### Default value

`nil`

#### Possible values

You can call a field on the `record` using a symbol.

```ruby
self.cover_photo = {
  source: :cover_photo # this will run `record.cover_photo`
}
```

Use a block to compute your own value.

```ruby
self.cover_photo = {
  source: -> {
    if view.index?
      # We're on the index page and don't have a record to reference
      DEFAULT_IMAGE
    else
      # We have a record so we can reference it's cover_photo
      record.cover_photo
    end
  }
}
```
</Option>
