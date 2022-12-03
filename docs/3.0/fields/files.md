---
version: '1.0'
license: community
---

# Files

<!-- @include: ./../common/files_gem_common.md-->

The `Files` field is similar to [`File`](./file) and enables you to upload multiple files at once using the same easy-to-use [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html) implementation.

```ruby
field :documents, as: :files
```

## Options
<!-- @include: ./../common/file_options_common.md-->

<!-- @include: ./../common/file_other_common.md-->
