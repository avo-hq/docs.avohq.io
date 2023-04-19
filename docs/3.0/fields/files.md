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

:::option `view_type`
![](/assets/img/files_view_types.gif)

Set the default `view_type`.

#### Default

`grid`

#### Possible values

`grid`, `list`
:::

:::option `hide_view_type_switcher`
Option to hide the view type switcher component.

#### Default

`false`

#### Possible values

`true`, `false`
:::
