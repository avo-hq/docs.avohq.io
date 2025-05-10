---
version: '3.17.0'
license: community
---

# Rhino

<Image src="/assets/img/fields/rhino/rhino-field.gif" alt="Rhino field" size="800x413" />

The wonderful [Rhino Editor](https://rhino-editor.vercel.app/) built by [Konnor Rogers](https://www.konnorrogers.com/) is available and fully integrated with Avo.

```ruby
field :body, as: :rhino
```

:::info
Add this line to your application's `Gemfile`:

```ruby
gem "avo-rhino_field"
```
:::

Rhino is based on [TipTap](https://tiptap.dev/) which is a powerful and flexible WYSIWYG editor.

It supports [ActiveStorage](https://guides.rubyonrails.org/active_storage_overview.html) file attachments, [ActionText](https://guides.rubyonrails.org/action_text_overview.html), and seamlessly integrates with the [Media Library](./../media-library).

## Options

<!-- @include: ./../common/field_options/always_show.md-->
