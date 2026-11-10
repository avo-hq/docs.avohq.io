---
license: community
description: "Displays an image from a URL stored in the database."
fieldTags: [assets]
outline: [2, 3]
api_docs: ./external_image-api.html
---

# External image

The `external_image` field displays an image from a URL stored in the database or returned by a computed field. It renders the image on the Index and Show views, and provides a text input for the URL on forms.

```ruby
# app/avo/resources/company.rb
field :logo, as: :external_image
```

By default, the image has a height of 40 pixels, square corners, and no link to the record. Blank values render no image. On Show, images also have a maximum width of 340 pixels.

## Adjust the image for each view

<span id="height"></span>
<span id="radius"></span>

Set [`height`](./external_image-api.html#height) and [`radius`](./external_image-api.html#radius) to change the image size and rounded corners. Use procs when the Index and Show views need different styling:

```ruby
# app/avo/resources/company.rb
field :logo, as: :external_image,
  height: -> { view.index? ? 40 : 150 },
  radius: -> { view.index? ? 4 : 12 }
```

These procs run in [Avo's execution context](../execution-context.html), with access to `record`, `resource`, `view`, and `field`.

<span id="width"></span>

:::info Width behavior
The field accepts [`width`](./external_image-api.html#width), but the standard Index and Show image templates do not apply it. Set the height to resize the image; do not rely on `width` to produce a square thumbnail.
:::

## Open the record from an image

Enable [`link_to_record`](./external_image-api.html#link_to_record) to make the Index image a link to the record. It does not add a link on Show.

```ruby
# app/avo/resources/company.rb
field :logo, as: :external_image, link_to_record: true
```

## Use computed values

Another common scenario is to use a value from your database and create a new URL using a computed value.

```ruby
# app/avo/resources/company.rb
field :logo, as: :external_image do
  "//logo.clearbit.com/#{URI.parse(record.url).host}?size=180"
rescue
  nil
end
```

## Show the image on grid cards

For a [grid view](../grid-view.html), set the card's `cover_url` to the image URL. Grid covers are configured separately from the field's sizing options.

```ruby
# app/avo/resources/company.rb
self.grid_view = {
  card: -> do
    {
      cover_url: "//logo.clearbit.com/#{URI.parse(record.url).host}?size=180",
      title: record.name
    }
  rescue
    { cover_url: nil, title: record.name }
  end
}
```

## Reference and shared options

See the [External image API](./external_image-api.html) for field-specific contracts and [common field options](../field-options.html) for settings shared with other fields.
