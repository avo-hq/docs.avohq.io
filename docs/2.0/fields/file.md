---
version: '1.0'
license: community
---

# File

The `File` field is the fastest way to implement file uploads in a Ruby on Rails app using [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html).

Avo will use your application's Active Storage settings with any supported [disk services](https://edgeguides.rubyonrails.org/active_storage_overview.html#disk-service).

```ruby
field :avatar, as: :file, is_image: true
```

## Options

<!-- @include: ./../common/file_options_common.md-->
<!-- @include: ./../common/link_to_resource_common.md-->

<!-- @include: ./../common/file_other_common.md-->
