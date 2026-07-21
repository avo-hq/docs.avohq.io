---
license: community
description: "The Files field is similar to File and enables you to upload multiple files at once using the same easy-to-use Active Storage implementation."
fieldTags: [attachments]
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

<Option name="`view_type`">

<Image src="/assets/img/4_0/fields/files/view-type.webm" dark-src="/assets/img/4_0/fields/files/view-type-dark.webm" width="1200" height="301" alt="An Avo show-view card for a files field: an animation toggling between grid view (thumbnail tiles) and list view (file rows) using the view-type switcher." prompt="gif to see the difference between grid and list view types" />

Set the default `view_type`.

#### Default value

`grid`

#### Possible values

`grid`, `list`
</Option>

<Option name="`hide_view_type_switcher`">

Option to hide the view type switcher component.

#### Default value

`false`

#### Possible values

`true`, `false`
</Option>
