---
version: '1.0'
license: community
demo: https://trix.avodemo.com/
---

# Trix

```ruby
field :body, as: :trix
```

The `Trix` field renders a [WYSIWYG Editor](https://trix-editor.org/) and can be associated with a `string` or `text` column in the database. The value stored in the database will be the editor's resulting `HTML` content.

<Image src="/assets/img/fields/trix.jpg" width="877" height="193" alt="Trix field" />

Trix field is hidden from the `Index` view.

## Options

<Option name="`always_show`">

By default, the content of the `Trix` field is not visible on the `Show` view; instead, it's hidden under a `Show Content` link that, when clicked, displays the content. You can set Markdown to display the content by setting `always_show` to `true`.

<!-- @include: ./../common/default_boolean_false.md-->
</Option>

<Option name="`attachments_disabled`">

Hides the attachments button from the Trix toolbar.

<!-- @include: ./../common/default_boolean_false.md-->
</Option>

<Option name="`hide_attachment_filename`">

Hides the attachment's name from the upload output in the field value.

<!-- @include: ./../common/default_boolean_false.md-->
</Option>

<Option name="`hide_attachment_filesize`">

Hides the attachment size from the upload output in the field value.

<!-- @include: ./../common/default_boolean_false.md-->
</Option>

<Option name="`hide_attachment_url`">

Hides the attachment URL from the upload output in the field value.

<!-- @include: ./../common/default_boolean_false.md-->
</Option>

<Option name="`attachment_key`">

Enables file attachments.

#### Default

`nil`

#### Possible values

`nil`, or a symbol representing the `has_many_attachments` key on the model.
</Option>

## File attachments

<!-- @include: ./../common/files_gem_common.md-->

Trix supports drag-and-drop file attachments. To enable **Active Storage** integration, you must add the `attachment_key` option to your Trix field.

```ruby
field :body, as: :trix, attachment_key: :trix_attachments
```

That `attachment_key` has to have the same name as the model.

```ruby{2}
class Post < ApplicationRecord
  has_many_attached :trix_attachments
end
```

Now, when you upload a file in the Trix field, Avo will create an Active Record attachment.

## Disable attachments

You may want to use Trix only as a text editor and disable the attachments feature. Adding the `attachments_disabled` option will hide the attachments button (paperclip icon).

```ruby
field :body, as: :trix, attachments_disabled: true
```

## Remove attachment attributes

By default, Trix will add some meta-data in the editor (filename, filesize, and URL) when adding an attachment. You might not need those to be present in the document. You can hide them using `hide_attachment_filename`, `hide_attachment_filesize`, and `hide_attachment_url`.

## Active Storage

Trix integrates seamlessly with Active Storage. When you use it with a plain database column on a record table (not with Action Text) you have to set the `attachment_key` option (documented above).

## Action Text

Trix integrates seamlessly with Action Text. It will automatically work with Action Text as well and it won't require you to add an `attachment_key`.

## Demo app

We prepared a [demo](https://trix.avodemo.com/) to showcase Trix's abilities to work with Action Text and Active Storage.

## Javascript Alert Messages

<VersionReq version="3.13.8" />

You can customize the javascript alert messages for various actions in the Trix editor. Below are the default messages that can be translated or modified:

```yml
avo:
  this_field_has_attachments_disabled: This field has attachments disabled.
  you_cant_upload_new_resource: You can't upload files into the Trix editor until you save the resource.
  you_havent_set_attachment_key: You haven't set an `attachment_key` to this Trix field.
```

Refer to the [default](https://github.com/avo-hq/avo/blob/main/lib/generators/avo/templates/locales/avo.en.yml) for more details.
