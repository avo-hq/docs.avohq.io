---
license: community
---

# Cover

Sometimes you may have a large main image for a record. That's usually called the cover photo.

By default it's displayed on the <Show /> and <Edit /> views but you can change that to be displayed on the <Index /> view or a combination of views.

It has three sizes available: small, medium, and large and you can set it to an Active Storage field or a custom path.

<!-- Screenshot here -->

## Configuration

The `cover` option takes three arguments: `size`, [`visible_on`](views.html#common-visible-on-configuration-values), and `source`.

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

Source is being called on every view, so you can use a conditional to display a cover image on the <Index /> view too.

</Option>
