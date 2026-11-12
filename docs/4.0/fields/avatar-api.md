---
license: community
outline: [2, 3]
guide: ./avatar.html
prev:
  text: "Avatar"
  link: "./avatar.html"
next: false
---

# Avatar API

Reference for the `Avatar` field's declaration and display behavior. For setup examples, see the [Avatar guide](./avatar.html).

Declare the field inside the resource's `fields` method in `app/avo/resources/user.rb`:

```ruby
field :avatar, as: :avatar
```

## Field-specific options

The avatar field has no field-specific options. Inherited options are documented in the [Field options API](../field-options-api.html); task-oriented examples are in [Shared field options](../field-options.html).

## Display defaults

| Behavior | Default |
| --- | --- |
| Visibility | Index-only. See the shared [`only_on`](../field-options-api.html#only_on) visibility option. |
| Column heading | Blank unless the shared [`name`](../field-options-api.html#name) option is supplied. |
| Image presentation | Small, square avatar. Size and shape are fixed, not field options. |

The field has an index renderer; it is not an image upload control.

## Image source and fallbacks

The field displays the resource avatar configured through [`self.avatar`](../resources-api.html#self.avatar), not the value selected by the field identifier. The resource-level [`source`](../cover-and-avatar.html#source) setting determines the image. It is not an option passed to `field`.

| Available content | Rendered result |
| --- | --- |
| Resource avatar source returns a nonblank value | Avatar image. |
| Image source is missing or blank, and the record has initials | Initials derived from the record title: the first letters of its words, limited to two characters and uppercased. |
| Neither an image nor initials are available | Empty avatar placeholder. |

The avatar column reads the resource's image source independently of the resource avatar's [`visible_on`](../cover-and-avatar.html#visible_on) setting. That setting controls resource-level avatar placement, not the visibility of this field's index column.
