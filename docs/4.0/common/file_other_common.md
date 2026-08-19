## Displaying images

Avo displays an attachment browsers can paint — PNG, JPEG, GIF, and anything else listed in `Rails.application.config.active_storage.web_image_content_types` — straight from storage.

Every other format Active Storage counts as an image (HEIC and HEIF straight off an iPhone, TIFF, PSD) is displayed through an Active Storage variant, which renders it as PNG. Only Safari decodes HEIC, so the original would be a broken image in Chrome, Edge, and Firefox.

:::warning
Converting needs an image processor installed — [libvips](https://github.com/libvips/libvips) built with `libheif`, or ImageMagick with the HEIC delegate. Without one the variant can't be processed and the image won't render. See [Active Storage's requirements](https://guides.rubyonrails.org/active_storage_overview.html#requirements).
:::

## Authorization

:::info
Please ensure you have the `upload_{FIELD_ID}?`, `delete_{FIELD_ID}?`, and `download_{FIELD_ID}?` methods set on your model's **Pundit** policy. Otherwise, the input and download/delete buttons will be hidden.
:::

**Related:**
 - [Attachment pundit policies](./../authorization.html#attachments)
