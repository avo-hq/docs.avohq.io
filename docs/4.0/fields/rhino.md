---
license: community
description: "Renders the Rhino WYSIWYG editor, based on TipTap, with ActionText and Media Library support."
fieldTags: [rich text, attachments]
---

# Rhino

<Image src="/assets/img/4_0/fields/rhino/form.webp" dark-src="/assets/img/4_0/fields/rhino/form-dark.webp" width="1520" height="604" alt="An Avo edit-form card with a Rhino WYSIWYG editor showing the formatting toolbar above a text area with sample content." prompt="an exemple" />

The wonderful [Rhino Editor](https://rhino-editor.vercel.app/) built by [Konnor Rogers](https://www.konnorrogers.com/) is available and fully integrated with Avo.

```ruby
field :body, as: :rhino
```

Rhino is based on [TipTap](https://tiptap.dev/) which is a powerful and flexible WYSIWYG editor.

It supports [ActiveStorage](https://guides.rubyonrails.org/active_storage_overview.html) file attachments, [ActionText](https://guides.rubyonrails.org/action_text_overview.html), and seamlessly integrates with the [Media Library](./../media-library).

## Options

<!-- @include: ./../common/field_options/always_show.md-->
