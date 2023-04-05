## Authorization

:::info
Please ensure you have the `upload_{field_id}?`, `delete_{field_id}?`, and `download_{field_id}?` methods set on your model's **pundit** policy. Otherwise, the input and download/delete buttons will be hidden.
:::

Related:
 - [Attachment pundit policies](./../authorization.html#attachments)

## Deprecated options

The `is_image`, `is_audio`, and `is_video` options are deprecated in favor of letting Active Storage figure out the type of the attachment. If Active Storage detects a file as an image, Avo will display it as an image. Same for audio and video files.
