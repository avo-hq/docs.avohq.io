---
license: community
---

# EasyMDE

:::info
Before Avo 3.17 this field was called `markdown`. It was renamed to `easy_mde` so we can add our own implementation with `markdown`.
:::

<Image src="/assets/img/4_0/fields/easy_mde/form.png" dark-src="/assets/img/4_0/fields/easy_mde/form-dark.png" width="1520" height="978" alt="An Avo create-form card containing an easy_mde field: the EasyMDE Markdown editor with its toolbar (bold, italic, heading, lists, link and preview controls) above a text area pre-filled with sample Markdown — a Release notes document with a heading, bold text, a bullet list and a link." prompt="from create page" />

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

<Option name="`height`">

Sets the value of the editor

#### Default

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
