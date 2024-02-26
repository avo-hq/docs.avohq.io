## Authorization

:::info
Please ensure you have the `upload_{FIELD_ID}?`, `delete_{FIELD_ID}?`, and `download_{FIELD_ID}?` methods set on your model's **Pundit** policy. Otherwise, the input and download/delete buttons will be hidden.
:::

**Related:**
 - [Attachment pundit policies](./../authorization.html#attachments)

<!-- ## Deprecated options

The `is_image`, `is_audio`, and `is_video` options are deprecated in favor of letting Active Storage figure out the type of the attachment. If Active Storage detects a file as an image, Avo will display it as an image. Same for audio and video files. -->
