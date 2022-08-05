---
version: '2.0'
license: community
---

# Markdown

<img :src="('/assets/img/fields/markdown.jpg')" alt="Trix field" class="border mb-4" />

The `Markdown` field renders a [SimpleMDE Markdown Editor](https://simplemde.com/) and is associated to a text or textarea column in the database.
`Markdown` field converts text within the editor in raw Markdown text and stores it back to database.

Markdown field is hidden from the **Index** view. By default, the Markdown field is not directly shown to the user on the **Show** view, instead being hidden under a _Show Content_ link, that displays the content. You can set Markdown to always display the content by setting `always_show` to `true`.

```ruby
field :description, as: :markdown, always_show: true
```

## Enable spell checker

You can also enable the spell checker using the `spell_checker: true` option.

```ruby
field :description, as: :markdown, spell_checker: true
```