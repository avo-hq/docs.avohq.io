---
license: community
description: "The Files field is similar to File and enables you to upload multiple files at once using the same easy-to-use Active Storage implementation."
fieldTags: [attachments]
outline: [2, 3]
api_docs: ./files-api.html
---

# Files

The `Files` field is similar to [`File`](./file) and enables you to upload multiple files at once using the same easy-to-use [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html) implementation.

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  def fields
    field :documents, as: :files
  end
end
```

By default, Avo shows a file count on the index and a grid of attachments on the show and edit pages, with a grid/list switcher and filenames. Images open in a lightbox on the show page; direct uploads are off and the file picker has no file-type restriction.

## Set up multiple attachments

Back the field with an Active Storage association:

```ruby
# app/models/project.rb
class Project < ApplicationRecord
  has_many_attached :documents
end
```

Uploads are added to the existing attachments when the record saves. A failed validation does not attach the newly selected files.

:::warning
Require `activestorage` and `image_processing` in your `Gemfile`.

```ruby
# Gemfile
gem "activestorage"
gem "image_processing"
```
:::

## Control which files users upload

Use [`accept`](./files-api.html#accept) to filter the file picker. It is a browser hint, not server-side validation; validate attachments in your model if the restriction must be enforced.

```ruby
# app/avo/resources/project.rb
field :documents, as: :files, accept: "image/*,application/pdf"
```

For large files, enable [`direct_upload`](./files-api.html#direct_upload) to upload directly to your storage service rather than sending the file through your application server. Configure [Active Storage direct uploads](https://edgeguides.rubyonrails.org/active_storage_overview.html#direct-uploads) for your service first.

```ruby
# app/avo/resources/project.rb
field :documents, as: :files, direct_upload: true
```

## Choose where uploads are stored

Active Storage stores every upload under a random key. Set [`key`](./files-api.html#key) to choose the key yourself, so the files in your bucket can be found by name. <VersionReq package="avo" version="4.4.4" />

```ruby
# app/avo/resources/project.rb
field :documents,
  as: :files,
  key: -> { "projects/#{SecureRandom.base36(8)}/#{ActiveStorage::Filename.new(file.original_filename).sanitized}" }
```

The block gets the `record`, the `resource`, the `field` and the uploaded `file`. The block runs once per file, so each file gets its own key. If it returns `nil` or an empty string, the file keeps a random key.

:::warning
- **Keys are unique.** A key that is already taken fails the save. Replacing a file with one of the same name counts, because the old file still exists at that moment. Put something that changes per upload in the key, like the random segment above.
- **New records have no id yet.** On the New page `record.id` and `record.to_param` are `nil`, so don't build the key from them.
- **`file.original_filename` comes from the browser.** Sanitize it before it goes into a key, as above.
- **Only files uploaded through the form get the key.** With [`direct_upload`](./files-api.html#direct_upload), or a file picked from the Media Library, the file is already stored when the form is sent, so it keeps its key.
:::

## Choose how attachments appear

<span id="view_type"></span>

Set [`view_type`](./files-api.html#view_type) to start with a list instead of a grid.

<span id="hide_view_type_switcher"></span>

To remove the switcher, add [`hide_view_type_switcher`](./files-api.html#hide_view_type_switcher).

```ruby
# app/avo/resources/project.rb
field :documents, as: :files, view_type: :list, hide_view_type_switcher: true
```

<Image src="/assets/img/4_0/fields/files/view-type.webm" dark-src="/assets/img/4_0/fields/files/view-type-dark.webm" width="1200" height="301" alt="An Avo show-view card for a files field: an animation toggling between grid view (thumbnail tiles) and list view (file rows) using the view-type switcher." prompt="gif to see the difference between grid and list view types" />

For a cleaner image grid, hide captions with [`display_filename`](./files-api.html#display_filename). List rows still show their filenames.

```ruby
# app/avo/resources/project.rb
field :documents, as: :files, display_filename: false
```

### Preview images in place

On the show page, clicking an image opens an in-page lightbox. Use the arrow buttons or arrow keys to cycle through the field's images, and press <kbd>Esc</kbd> or click outside the image to close it. The lightbox links to the original file in a new tab when downloads are authorized. Non-image files retain their players and download controls.

Set [`lightbox`](./files-api.html#lightbox) to `false` to leave image thumbnails non-interactive. Form thumbnails never open the lightbox.

```ruby
# app/avo/resources/project.rb
field :documents, as: :files, lightbox: false
```

### Display images from phones and design tools

Avo serves browser-friendly images such as PNG, JPEG, GIF, WebP, and AVIF directly from storage. For variable attachments with content types `image/heic`, `image/heif`, `image/tiff`, or `image/vnd.adobe.photoshop`, it uses an Active Storage variant rendered as PNG. This lets browsers without native support display them too.

:::warning
Conversion needs an image processor installed: [libvips](https://github.com/libvips/libvips) built with `libheif`, or ImageMagick with the HEIC delegate for HEIC images. Without a suitable processor the variant cannot be processed. See [Active Storage's requirements](https://guides.rubyonrails.org/active_storage_overview.html#requirements).
:::

## Authorize uploads, downloads, and deletion

Ensure your model's Pundit policy permits `upload_documents?`, `download_documents?`, and `delete_documents?` for the corresponding controls to appear. Replace `documents` with your field's ID.

See [Attachment pundit policies](./../authorization.html#authorize-file-attachments) for policy examples.

## Configure shared field behavior

For labels, visibility, read-only behavior, and other options shared by all fields, see [Common field options](../field-options.html). For the attachment-specific contracts, see the [Files API reference](./files-api.html).
