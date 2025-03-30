---
version: '1.0'
license: community
---

# EasyMDE

:::info
Before Avo 3.17 this field was called `markdown`. It was renamed to `easy_mde` so we can add our own implementation with `markdown`.
:::

<Image src="/assets/img/fields/easy_mde.jpg" width="906" height="421" alt="Trix field" />

The `easy_mde` field renders a [EasyMDE Markdown Editor](https://github.com/Ionaru/easy-markdown-editor) and is associated with a text or textarea column in the database.
`easy_mde` field converts text within the editor into raw Markdown text and stores it back in the database.

```ruby
field :description, as: :easy_mde
```

:::info
The `easy_mde` field is hidden from the **Index** view.
:::

## Options

<Option name="`always_show`">

By default, the content of the `easy_mde` field is not visible on the `Show` view, instead, it's hidden under a `Show Content` link that, when clicked, displays the content. You can set `easy_mde` to always display the content by setting `always_show` to `true`.

<!-- @include: ./../common/default_boolean_false.md-->
</Option>

<Option name='`image_upload`'>

If set to `true`, the editor will allow image uploads which will be uploaded using the direct uploads URL at `/rails/active_storage/direct_uploads`

### Default

`false`

### Possible values

`true` or `false`.

</Option>

<Option name="`height`">

Sets the value of the editor

### Default

`auto`

#### Possible values

`auto` or any number in pixels.
</Option>

<Option name="`spell_checker`">

Toggles the editor's spell checker option.

```ruby
field :description, as: :easy_mde, spell_checker: true
```

<!-- @include: ./../common/default_boolean_false.md-->
</Option>

<!-- ## Enable spell checker -->