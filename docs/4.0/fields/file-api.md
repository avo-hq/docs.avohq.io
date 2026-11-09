---
license: community
outline: [2, 3]
guide: ./file.html
prev:
  text: "File"
  link: "./file.html"
next: false
---

# File API

Per-option reference for the `file` field. For setup and worked examples, see the [File guide](./file.html).

Options are passed to the field declaration in an Avo resource, such as `app/avo/resources/user.rb`:

```ruby
field :avatar, as: :file, accept: "image/*", direct_upload: true
```

Shared options such as formatting, visibility, and read-only behavior are documented in [Common field options](../field-options.html).

## Uploads

<Option name="`accept`">

The HTML `accept` attribute on the file input. It filters the browser's file picker, not the server's upload handling.

```ruby
field :avatar, as: :file, accept: "image/*"
```

- **Type:** `String` or `nil`
- **Default:** `nil`
- **Values:** MIME types, wildcard MIME types such as `image/*` or `audio/*`, or file extensions, including comma-separated lists, as defined by the [HTML specification](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept).
- **Validation:** No server-side content-type or size validation is added by this option.

</Option>

<Option name="`direct_upload`">

Enables Active Storage direct uploads on the file input. Requires the application's Rails direct-upload setup and a storage service configured to accept those uploads.

```ruby
field :avatar, as: :file, direct_upload: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

## Attachment display

<Option name="`display_filename`">

Controls the filename caption below attachment previews on Show and forms, and the image lightbox caption. It does not hide the filename used for non-image, non-audio files on Index.

```ruby
field :avatar, as: :file, display_filename: false
```

- **Type:** `Boolean`
- **Default:** `true` (also when explicitly passed `nil`)

</Option>

<Option name="`lightbox`">

Enables the in-page lightbox for representable image attachments on Show. Forms retain plain thumbnails. Audio, video, and documents do not open in the image lightbox. The original-file link is included only when the user is authorized to download the attachment.

```ruby
field :avatar, as: :file, lightbox: false
```

- **Type:** `Boolean`
- **Default:** `true` (also when explicitly passed `nil`)

</Option>

<Option name="`link_to_record`">

Wraps image and audio previews on Index in a link to the record's Show page. It does not affect Show or form previews, or filename-only cells on Index.

```ruby
field :avatar, as: :file, link_to_record: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>
