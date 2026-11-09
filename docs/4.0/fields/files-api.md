---
license: community
outline: [2, 3]
guide: ./files.html
prev:
  text: "Files"
  link: "./files.html"
next: false
---

# Files API

Per-option reference for the `:files` field. For setup and worked examples, see the [Files guide](./files.html).

Options are passed to the field declaration in an Avo resource, such as `app/avo/resources/project.rb`:

```ruby
field :documents, as: :files
```

These options are specific to multiple attachments. See [Common field options](../field-options.html) for the options shared by all fields.

## Upload input

<Option name="`accept`">

The file input's HTML `accept` attribute. It accepts MIME types, file extensions, and comma-separated combinations as described in the [HTML specification](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept).

```ruby
field :documents, as: :files, accept: "image/*,application/pdf"
```

- **Type:** `String` or `nil`
- **Default:** `nil` (no file-type filter)
- **Validation:** Not validated by Avo; passed to the file input.

:::warning
`accept` filters the browser's file picker; it does not enforce attachment content types on the server.
:::

</Option>

<Option name="`direct_upload`">

Enables Active Storage direct uploads for the multiple-file input. Requires a configured Active Storage direct-upload service.

```ruby
field :documents, as: :files, direct_upload: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

## Attachment layout

<Option name="`view_type`">

The initial attachment layout on show and edit pages. A valid `view_type` request parameter takes precedence over this setting.

```ruby
field :documents, as: :files, view_type: :list
```

| Value | Behavior |
| --- | --- |
| `:grid` | Thumbnail tiles with previews for images, audio, and video. |
| `:list` | File rows with filenames, sizes, and attachment controls. |

- **Type:** `Symbol`
- **Default:** `:grid`
- **Values:** `:grid`, `:list`
- **Validation:** No declaration-time validation. An unsupported layout can raise `NameError` when the attachment viewer resolves its component.

</Option>

<Option name="`hide_view_type_switcher`">

Hides the grid/list switcher above the attachments. This does not prevent a valid `view_type` request parameter from selecting a layout.

```ruby
field :documents, as: :files, hide_view_type_switcher: true
```

- **Type:** `Boolean` or `nil`
- **Default:** `nil` (switcher visible)

</Option>

<Option name="`display_filename`">

Controls filename captions beneath grid previews and in the lightbox. List rows always display their filenames.

```ruby
field :documents, as: :files, display_filename: false
```

- **Type:** `Boolean`
- **Default:** `true` (also used when explicitly set to `nil`)

</Option>

## Image preview

<Option name="`lightbox`">

Enables the in-page image lightbox on the show page for representable image attachments. Edit-page thumbnails are not lightbox triggers. Audio, video, and documents retain their existing players and controls; the original-file link in the lightbox respects download authorization.

```ruby
field :documents, as: :files, lightbox: false
```

- **Type:** `Boolean`
- **Default:** `true` (also used when explicitly set to `nil`)

</Option>
