---
version: '1.0'
license: community
---

# Markdown

<Image src="/assets/img/fields/markdown.jpg" width="906" height="421" alt="Trix field" />

The `Markdown` field renders a [EasyMDE Markdown Editor](https://github.com/Ionaru/easy-markdown-editor) and is associated with a text or textarea column in the database.
`Markdown` field converts text within the editor into raw Markdown text and stores it back in the database.

The Markdown field is hidden from the **Index** view.


```ruby
field :description, as: :markdown
```

## Options

<Option name="`always_show`">

By default, the content of the `Markdown` field is not visible on the `Show` view, instead, it's hidden under a `Show Content` link that, when clicked, displays the content. You can set Markdown to always display the content by setting `always_show` to `true`.

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
field :description, as: :markdown, spell_checker: true
```

<!-- @include: ./../common/default_boolean_false.md-->
</Option>

<!-- ## Enable spell checker -->
