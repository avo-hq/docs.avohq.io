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

All options can be static values or procs that are executed within Avo's execution context. When using procs, you have access to all the defaults that [`Avo::ExecutionContext`](../execution-context.html) provides plus:

- `record`
- `resource`
- `view`
- `field`

<Option name="`width`">

#### Default value

`40`

#### Possible values

Use any number to size the image, or a proc that returns a number.

#### Example with proc

```ruby
field :logo, as: :external_image, width: -> { view.index? ? 30 : 120 }
```
</Option>

<Option name="`height`">

#### Default value

`40`

#### Possible values

Use any number to size the image, or a proc that returns a number.

#### Example with proc

```ruby
field :logo, as: :external_image, height: -> { view.index? ? 30 : 120 }
```
</Option>

<Option name="`radius`">

#### Default value

`0`

#### Possible values

Use any number to set the radius value, or a proc that returns a number.

#### Example with proc

```ruby
field :logo, as: :external_image, radius: -> { view.index? ? 4 : 8 }
```
</Option>

<!-- @include: ./../common/link_to_record_common.md-->

## Conditional sizing based on view

You can use procs to set different image dimensions and styling based on the current view:

```ruby
field :logo, as: :external_image,
  width: -> { view.index? ? 40 : 150 },
  height: -> { view.index? ? 40 : 150 },
  radius: -> { view.index? ? 4 : 12 }
```

This example will display smaller, slightly rounded images on the index view (40x40px with 4px radius) and larger, more rounded images on the show view (150x150px with 12px radius).

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
