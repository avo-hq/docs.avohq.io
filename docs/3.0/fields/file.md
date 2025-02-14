---
version: '1.0'
license: community
---

# File

<!-- @include: ./../common/files_gem_common.md-->

The `File` field is the fastest way to implement file uploads in a Ruby on Rails app using [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html).

Avo will use your application's Active Storage settings with any supported [disk services](https://edgeguides.rubyonrails.org/active_storage_overview.html#disk-service).

```ruby
field :avatar, as: :file, is_image: true
```

<!-- @include: ./../common/file_other_common.md-->

## Variants

When using the `file` field to display an image, you can opt to show a processed variant of that image. This can be achieved using the [`format_using`](./../field-options.html#fields-formatter) option.

### Example:

```ruby{3-5}
field :photo,
  as: :file,
  format_using: -> {
    value.variant(resize_to_limit: [150, 150]).processed.image
  }
```

## Options

<!-- @include: ./../common/file_options_common.md-->
<!-- @include: ./../common/link_to_record_common.md-->
