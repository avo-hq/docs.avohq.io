## Authorization

:::info
Please ensure you have the `upload_attachments?`, `delete_attachments?`, and `download_attachments?` methods set on your model's **pundit** policy. Otherwise, the input and download/delete buttons will be hidden.
:::

Related:
 - [Attachment pundit policies](./../authorization.html#upload-attachments)

## Deprecated options

The `is_image`, `is_audio`, and `is_video` options are deprecated in favor of letting Active Storage figure out the type of the attachment. If Active Storage detects a file as an image, Avo will display it as an image. Same for audio and video files.
