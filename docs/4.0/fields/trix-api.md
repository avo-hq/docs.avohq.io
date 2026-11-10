---
license: community
outline: [2, 3]
guide: ./trix.html
prev:
  text: "Trix"
  link: "./trix.html"
next: false
---

# Trix API

Per-option reference for the Trix field. For setup and worked examples, see the [Trix guide](./trix.html).

Pass these options to the field declaration in `app/avo/resources/post.rb`:

```ruby
field :body, as: :trix, attachment_key: :trix_attachments
```

Shared options are documented in [Common field options](../field-options.html).

## Content display

<Option name="`always_show`">

Displays the full content on Show instead of a collapsed preview with an expand link.

```ruby
field :body, as: :trix, always_show: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

## File attachments

<Option name="`attachment_key`">

Names the model's Active Storage attachment association. Uploads are attached to that record and require the record to be saved first. Action Text attributes do not require this option.

```ruby
field :body, as: :trix, attachment_key: :trix_attachments
```

- **Type:** `Symbol` or `String`
- **Default:** `nil`
- **Values:** The name of a model association declared with `has_many_attached`.
- **Validation:** An upload with an unresolved attachment association raises `ActionController::BadRequest`.

</Option>

<Option name="`attachments_disabled`">

Hides the attachment toolbar controls and rejects dropped files. An explicit Boolean overrides the automatic default.

```ruby
field :body, as: :trix, attachments_disabled: true
```

- **Type:** `Boolean` or `nil`
- **Default:** `nil` (automatic): resolves to `false` for Action Text attributes or a nonblank `attachment_key`, and `true` otherwise.
- **i18n key:** `avo.this_field_has_attachments_disabled` ("This field has attachments disabled.")
- **i18n key:** `avo.you_cant_upload_new_resource` ("You can't upload files into the Trix editor until you save the resource.")

:::warning
With a plain column and no `attachment_key`, setting this to `false` uploads blobs without attaching them to a record. Purging unattached blobs can delete those files. See [attachments without an association](./trix.html#attachments-without-an-attachment-key).
:::

</Option>

## Attachment metadata

<Option name="`hide_attachment_filename`">

Clears the filename attribute on newly uploaded attachments in the editor.

```ruby
field :body, as: :trix, hide_attachment_filename: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`hide_attachment_filesize`">

Clears the filesize attribute on newly uploaded attachments in the editor.

```ruby
field :body, as: :trix, hide_attachment_filesize: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`hide_attachment_url`">

Clears the attachment's `href` attribute on new uploads. The uploaded file's `url` attribute remains available for rendering the attachment.

```ruby
field :body, as: :trix, hide_attachment_url: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>
