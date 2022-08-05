---
version: '2.0'
license: community
---

# Trix

<img :src="('/assets/img/fields/trix.jpg')" alt="Trix field" class="border mb-4" />

The `Trix` field renders a [WYSIWYG Trix Editor](https://trix-editor.org/) and is associated to a `string` or `text` column in the database.
`Trix` field converts text within the editor in HTML and stores it back to database.

Trix field is hidden from **Index** view. By default, the Trix field is not directly visible to the user on the **Show** view, instead being hidden under a **Show Content** link, that triggers the visibility of the content. You can set Trix to always display the content by setting `always_show` to `true`.

```ruby
field :body, as: :trix, always_show: true
```

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
