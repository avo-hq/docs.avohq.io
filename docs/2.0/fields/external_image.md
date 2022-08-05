---
version: '2.0'
license: community
---

# External image

You may have a field in the database that has the URL to an image and you want to display that in Avo. This is where the `ExternalImage` field comes in to help.

It will take the value and insert it into an `image_tag`.

```ruby
field :logo, as: :external_image
```

## Options

### `width`

#### Default value

`40`

#### Possible values

Use any number to size the image.

---
### `height`

#### Default value

`40`

#### Possible values

Use any number to size the image.

---

### `radius`

It takes three options `:width`, `:height` and `:radius` that get used to show the image on the **Index** view.

You may also pass in a computed value or pass it as the grid `:cover` position.

```ruby
cover :logo, as: :external_image, link_to_resource: true do |model|
  if model.url.present?
    "//logo.clearbit.com/#{URI.parse(model.url).host}?size=180"
  end
end
```