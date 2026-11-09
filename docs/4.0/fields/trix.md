---
license: community
demo: https://trix.avodemo.com/
description: "Renders the Trix WYSIWYG editor, storing its HTML content in a string or text column."
fieldTags: [rich text, attachments]
outline: [2, 3]
api_docs: ./trix-api.html
---

# Trix

The `Trix` field renders a [WYSIWYG editor](https://trix-editor.org/) and stores the resulting HTML in a `string` or `text` database column. It also supports [ActiveStorage](https://guides.rubyonrails.org/active_storage_overview.html) file attachments, [ActionText](https://guides.rubyonrails.org/action_text_overview.html), and the [Media Library](./../media-library).

```ruby
# app/avo/resources/post.rb
field :body, as: :trix
```

By default, the field is hidden on Index and shows a collapsed preview on Show. Attachments are enabled for Action Text attributes, but disabled for plain columns unless configured otherwise.

<Image src="/assets/img/4_0/fields/trix/form.webp" dark-src="/assets/img/4_0/fields/trix/form-dark.webp" width="1520" height="588" alt="An Avo edit-form card with a Trix WYSIWYG editor showing the formatting toolbar above a text area with sample body content." prompt="trix editor on the edit form with toolbar and sample body content" />

For shared settings such as visibility, placeholder text, and read-only behavior, see [Common field options](../field-options.html).

## Show the full content

If you want the full content visible on Show without an expand link, set [`always_show`](./trix-api.html#always_show) to `true`.

```ruby
# app/avo/resources/post.rb
field :body, as: :trix, always_show: true
```

## Attach files to a saved record {#file-attachments}

:::warning
You must manually require the `activestorage` and `image_processing` gems in your `Gemfile`.

```ruby
# Gemfile
gem "activestorage"
gem "image_processing"
```
:::

<span id="attachment_key"></span>

Trix supports drag-and-drop file attachments. If you store HTML in a plain column and want uploads attached to the record through Active Storage, set [`attachment_key`](./trix-api.html#attachment_key) to the name of the model's attachment association.

```ruby
# app/avo/resources/post.rb
field :body, as: :trix, attachment_key: :trix_attachments
```

Declare the matching association on the model:

```ruby
# app/models/post.rb
class Post < ApplicationRecord
  has_many_attached :trix_attachments
end
```

Now, when you upload a file in the Trix field, Avo will create an Active Record attachment. Because the file is attached to the record, uploads with an `attachment_key` work only once the record is saved.

### Attachments without an `attachment_key`

On a plain column you can also enable attachments without an association. Avo uploads the file to Active Storage and stores its URL in the HTML, without attaching it to the record. This works on the `New` form too.

```ruby
# app/avo/resources/post.rb
field :body, as: :trix, attachments_disabled: false
```

:::warning
These blobs aren't attached to any record, so a job that purges unattached blobs (`ActiveStorage::Blob.unattached`) deletes them.
:::

## Disable attachments

<span id="attachments_disabled"></span>

If you want a text-only editor, set [`attachments_disabled`](./trix-api.html#attachments_disabled) to `true`. This hides the attachments button (paperclip icon) and rejects file drops.

```ruby
# app/avo/resources/post.rb
field :body, as: :trix, attachments_disabled: true
```

## Remove attachment attributes

<span id="hide_attachment_filename"></span>
<span id="hide_attachment_filesize"></span>
<span id="hide_attachment_url"></span>

If you do not want attachment metadata in the document, use [`hide_attachment_filename`](./trix-api.html#hide_attachment_filename), [`hide_attachment_filesize`](./trix-api.html#hide_attachment_filesize), and [`hide_attachment_url`](./trix-api.html#hide_attachment_url).

```ruby
# app/avo/resources/post.rb
field :body, as: :trix,
  attachment_key: :trix_attachments,
  hide_attachment_filename: true,
  hide_attachment_filesize: true,
  hide_attachment_url: true
```

## Active Storage

For plain database columns, use Active Storage either [with a record association](#file-attachments) or [without an association](#attachments-without-an-attachment-key).

## Use Action Text {#action-text}

If your model uses Action Text, declare its rich text attribute and use the same name for the Trix field. No `attachment_key` is required.

```ruby
# app/models/post.rb
class Post < ApplicationRecord
  has_rich_text :body
end
```

Uploads work on the `New` form, before the record is saved, and any file type is stored as an Action Text attachment. Avo renders those attachments with your app's `active_storage/blobs/_blob.html.erb` partial, just like your app does.

## Demo app

We prepared a [demo](https://trix.avodemo.com/) to showcase Trix's abilities to work with Action Text and Active Storage.

## Translate upload alerts {#javascript-alert-messages}

You can customize the javascript alert messages for various actions in the Trix editor. Below are the default messages that can be translated or modified:

```yml
# config/locales/avo.en.yml
en:
  avo:
    this_field_has_attachments_disabled: This field has attachments disabled.
    you_cant_upload_new_resource: You can't upload files into the Trix editor until you save the resource.
```

Refer to the [default](https://github.com/avo-hq/avo/blob/main/lib/generators/avo/templates/locales/avo.en.yml) for more details.
