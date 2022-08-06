---
version: '2.0'
license: community
---

# Trix

```ruby
field :body, as: :trix
```

The `Trix` field renders a [WYSIWYG Editor](https://trix-editor.org/) and can be associated to a `string` or `text` column in the database. The value stored in the database will be the resulting `HTML` content from the editor.


<img :src="('/assets/img/fields/trix.jpg')" alt="Trix field" class="border mb-4" />

Trix field is hidden from the `Index` view.

## Options

:::option `always_show`
By default, the content of the `Trix` field is not visible on the `Show` view, instead it's hidden under a `Show Content` link, that, when clicked, displays the content. You can set Markdown to always display the content by setting `always_show` to `true`.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `attchments_disabled`
Hides the attachments button from the Trix toolbar.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `hide_attachment_filename`
Hides the name of the attachment from the upload output in the field value.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `hide_attachment_filesize`
Hides the size of the attachment from the upload output in the field value.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `hide_attachment_url`
Hides the URL of the attachment from the upload output in the field value.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `attachment_key`
Enables file attachments.

#### Default

`nil`

#### Possible values

`nil`, or a symbol representing the `has_many_attachments` key on the model.
:::


## File attachments

Trix supports drag-and-drop file attachments. To enable **Active Storage** integration, you have to add the `attachment_key` option to your Trix field.

```ruby
field :body, as: :trix, attachment_key: :trix_attachments
```

That `attachment_key` has to have the same name as on the model.

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

When adding an attachment, by default, Trix will add some meta-data in the editor (filename, filesize, and url). You might not need those to be present in the document. You can hide them using `hide_attachment_filename`, `hide_attachment_filesize`, and `hide_attachment_url`.
