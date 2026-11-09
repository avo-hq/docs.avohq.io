---
license: community
outline: [2, 3]
guide: ./external_image.html
prev:
  text: "External image"
  link: "./external_image.html"
next: false
---

# External image API

Per-option reference for `external_image` fields. For tasks and examples, see the [External image guide](./external_image.html).

Pass options to the field declaration in a resource's `fields` method in `app/avo/resources/company.rb`:

```ruby
field :logo, as: :external_image, height: 80
```

See also [common field options](../field-options.html).

## Image sizing

`width`, `height`, and `radius` accept static values or procs evaluated in [Avo's execution context](../execution-context.html), with `record`, `resource`, `view`, and `field` available. An omitted value, `nil`, or `false` (including a proc result) falls back to the option's default. These options have no field-level numeric validation.

<Option name="`height`">

The image height and CSS maximum height on Index and Show. Numeric values are interpreted as pixels. Strings ending in `px` are also supported by the maximum-height style.

```ruby
field :logo, as: :external_image, height: 80
```

- **Type:** `Numeric`, `String`, or `Proc` returning either
- **Default:** `40`

</Option>

<Option name="`radius`">

The CSS border radius on Index and Show, in pixels. The value is interpolated with a `px` suffix.

```ruby
field :logo, as: :external_image, radius: 8
```

- **Type:** `Numeric` or `Proc` returning a number
- **Default:** `0`

</Option>

<Option name="`width`">

The width value exposed by the field.

```ruby
field :logo, as: :external_image, width: 80
```

- **Type:** `Numeric` or `Proc` returning a number
- **Default:** `40`

:::warning
The standard Index and Show image templates do not use this value. Setting it does not change their rendered image width. Show images have a fixed CSS maximum width of 340 pixels.
:::

</Option>

## Record navigation

<Option name="`link_to_record`">

Wraps the Index image in a link to the record. The Show image remains unlinked. This option is checked for presence, not evaluated as a proc.

```ruby
field :logo, as: :external_image, link_to_record: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>
