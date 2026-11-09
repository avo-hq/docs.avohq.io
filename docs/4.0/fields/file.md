---
license: community
description: "The File field is the fastest way to implement file uploads in a Ruby on Rails app using Active Storage."
fieldTags: [attachments]
outline: [2, 3]
api_docs: ./file-api.html
---

# File

The `file` field uploads a single [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html) attachment and displays images, audio, and video using the appropriate preview or player. It uses your application's Active Storage settings, including supported [disk services](https://edgeguides.rubyonrails.org/active_storage_overview.html#disk-service).

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :avatar, as: :file
  end
end
```

By default, uploads pass through your server without a file-type filter. Filenames are visible, images open in a lightbox on the Show view, and index previews do not link to the record.

## Set up a single attachment

Configure Active Storage in your application and declare the attachment on your model:

```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_one_attached :avatar
end
```

Use the [Files field](./files.html) for multiple attachments.

<!-- @include: ./../common/files_gem_common.md-->

## Choose which files users can upload

Set [`accept`](./file-api.html#accept) to filter the browser's file picker:

```ruby
# app/avo/resources/user.rb
field :avatar, as: :file, accept: "image/*"
```

:::warning
The browser's filter does not validate uploads. Enforce file-type and size restrictions on the server.
:::

## Upload large files directly to storage

Enable [`direct_upload`](./file-api.html#direct_upload) to send files directly to your storage service rather than through your application server. Complete Rails' [direct upload setup](https://edgeguides.rubyonrails.org/active_storage_overview.html#direct-uploads), including any required storage CORS configuration.

```ruby
# app/avo/resources/user.rb
field :avatar, as: :file, direct_upload: true
```

<!-- @include: ./../common/file_other_common.md-->

## Customize the attachment preview

Hide the filename below Show and form previews with [`display_filename`](./file-api.html#display_filename). Disable [`lightbox`](./file-api.html#lightbox) if clicking an image on Show should not open a preview overlay:

```ruby
# app/avo/resources/user.rb
field :avatar, as: :file, display_filename: false, lightbox: false
```

The lightbox closes with Escape or a click outside the image. Its original-file link is available only when downloading is authorized. Audio and video keep their players; other files keep their file controls.

### Display a processed image variant

When using the `file` field to display an image, you can opt to show a processed variant of that image. This can be achieved using the [`format_using`](./../field-options.html#format-displayed-values) option.

```ruby
# app/avo/resources/user.rb
field :photo,
  as: :file,
  format_using: -> {
    value.variant(resize_to_limit: [150, 150]).processed.image
  }
```

### Link index previews to the record

Enable [`link_to_record`](./file-api.html#link_to_record) to make image and audio previews on Index link to the record's Show page. Other file types still display their filename on Index.

```ruby
# app/avo/resources/user.rb
field :avatar, as: :file, link_to_record: true
```

## Options reference

See the [File API](./file-api.html) for field-specific contracts and defaults, and [Common field options](../field-options.html) for shared configuration.
