---
version: '1.0'
license: community
---

# External image

You may have a field in the database that has the URL to an image, and you want to display that in Avo. That is where the `ExternalImage` field comes in to help.

It will take that value, insert it into an `image_tag`, and display it on the `Index` and `Show` views.

```ruby
field :logo, as: :external_image
```

## Options

:::option `width`

#### Default value

`40`

#### Possible values

Use any number to size the image.
:::

:::option `height`
#### Default value

`40`

#### Possible values

Use any number to size the image.
:::

:::option `radius`
#### Default value

`0`

#### Possible values

Use any number to set the radius value.
:::

<!-- @include: ./../common/link_to_record_common.md-->

## Use computed values

Another common scenario is to use a value from your database and create a new URL using a computed value.

```ruby
field :logo, as: :external_image do
  "//logo.clearbit.com/#{URI.parse(record.url).host}?size=180"
rescue
  nil
end
```

## Use in the Grid `cover` position

Another common place you could use it is in the grid `:cover` position.

```ruby
cover :logo, as: :external_image, link_to_record: true do
  "//logo.clearbit.com/#{URI.parse(record.url).host}?size=180"
rescue
  nil
end
```
