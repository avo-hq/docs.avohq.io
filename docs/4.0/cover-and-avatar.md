---
license: community
outline: [2, 3]
prompt: Use this page (${link}) to set up a cover photo and an avatar on my Avo resources. Look through my models for suitable image attachments or fields to use as the source for each. If you can't find a suitable field or attachment for the avatar or the cover photo, ask me which one to use instead of guessing.
---

# Cover and avatar

It's common for a record to have a visual representation. A user might have a headshot, a company might have a logo, or a product might have an image. Avo can display these in two ways:

- the **avatar** (`self.avatar`) — a small photo shown on the <Show /> and <Edit /> views and in the breadcrumbs
- the **cover** (`self.cover`) — a large banner image displayed at the top of the record

<Image src="/assets/img/4_0/avatar/avatar.webp" dark-src="/assets/img/4_0/avatar/avatar-dark.webp" alt="Record avatar on the Show view and in the breadcrumbs" width="2344" height="856" class="mt-8" />

## Add an avatar

Use the `avatar` option. It takes two arguments: [`visible_on`](#visible_on) and [`source`](#source).

```ruby
# app/avo/resources/user.rb
self.avatar = {
  visible_on: [:show, :forms],
  source: -> {
    if view.index?
      # We're on the index page and don't have a record to reference
      DEFAULT_IMAGE
    else
      # We have a record so we can reference its avatar
      record.avatar
    end
  }
}
```

When no avatar is configured (or the source is blank), Avo falls back to the record's initials in places like the breadcrumbs.

To also show the avatar as a column on the <Index /> view, add the [avatar field](./fields/avatar.html) to the resource.

## Add a cover photo

Use the `cover` option. It takes the same [`visible_on`](#visible_on) and [`source`](#source) arguments, plus a [`size`](#size).

You can point it to an Active Storage field or a custom path.

```ruby
# app/avo/resources/post.rb
self.cover = {
  size: :md, # :sm, :md, :lg, or :full
  visible_on: [:show, :forms], # can be :show, :index, :edit, or a combination [:show, :index]
  source: -> {
    if view.index?
      # We're on the index page and don't have a record to reference
      DEFAULT_IMAGE
    else
      # We have a record so we can reference its cover photo
      record.cover_photo
    end
  }
}
```

:::warning Renamed in Avo 4
These options were called `profile_photo` and `cover_photo` in Avo 3. See the [upgrade guide](./avo-3-avo-4-upgrade.html#renamed-profile-photo-to-avatar).
:::

## Options

Both `avatar` and `cover` accept `visible_on` and `source`. `size` applies only to `cover`.

<Option name="`visible_on`">

This controls where the photo should be displayed.

It defaults to the <Show />, <Edit />, and <New /> views, but you can change that to be displayed on the <Index /> view or a combination of views.

- **Type:** Symbol or Array of Symbols
- **Default:** `[:show, :forms]`
- **Values:** one [view](./views.html#common-visible-on-configuration-values) or a combination of them using an array — `:show`, `:edit`, `:new`, `:index`, `:forms`, `:display`, `[:show, :edit]`

</Option>

<Option name="`source`">

This controls what should be displayed as the image.

You can call a field on the `record` using a `Symbol`:

```ruby
self.cover = {
  source: :cover_photo # this will run `record.cover_photo`
}
```

Or use a block to compute your own value:

```ruby
self.cover = {
  source: -> {
    if view.index?
      # We're on the index page and don't have a record to reference
      DEFAULT_IMAGE
    else
      # We have a record so we can reference its cover photo
      record.cover_photo
    end
  }
}
```

`source` is called on every view, so you can use a conditional to display the image on the <Index /> view too.

- **Type:** Symbol or Proc
- **Default:** `nil`

:::info
When `source` is a `Symbol`, nothing is displayed for new (unpersisted) records — use a block if you want a placeholder there. On the <Edit /> view, Avo reads the persisted attachment so a failed update with a direct upload doesn't render a temporary value.
:::

</Option>

<Option name="`size`">

Only for `cover`. This represents the height of the cover photo.

- **Type:** Symbol
- **Default:** `:md`
- **Values:** `:sm`, `:md`, `:lg`, or `:full` (no height cap)

</Option>
