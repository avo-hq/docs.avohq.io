## Displaying images

Avo displays an attachment straight from storage — PNG, JPEG, GIF, WebP, AVIF, and everything else browsers know how to paint.

Four formats they don't get converted first: `image/heic` and `image/heif` (what an iPhone shoots by default), `image/tiff`, and `image/vnd.adobe.photoshop`. Avo displays those through an Active Storage variant, which renders them as PNG. Only Safari decodes HEIC, so the original would be a broken image in Chrome, Edge, and Firefox.

:::warning
Converting needs an image processor installed — [libvips](https://github.com/libvips/libvips) built with `libheif`, or ImageMagick with the HEIC delegate. Without one the variant can't be processed and the image won't render. See [Active Storage's requirements](https://guides.rubyonrails.org/active_storage_overview.html#requirements).
:::

## Authorization

:::info
Please ensure you have the `upload_{FIELD_ID}?`, `delete_{FIELD_ID}?`, and `download_{FIELD_ID}?` methods set on your model's **Pundit** policy. Otherwise, the input and download/delete buttons will be hidden.
:::

**Related:**
 - [Attachment pundit policies](./../authorization.html#attachments)
