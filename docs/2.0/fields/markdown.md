---
version: '2.0'
license: community
---

# Markdown

<img :src="('/assets/img/fields/markdown.jpg')" alt="Trix field" class="border mb-4" />

The `Markdown` field renders a [SimpleMDE Markdown Editor](https://simplemde.com/) and is associated to a text or textarea column in the database.
`Markdown` field converts text within the editor in raw Markdown text and stores it back to database.

Markdown field is hidden from the **Index** view.


```ruby
field :description, as: :markdown
```

## Options

:::option `always_show`

By default, the content of the `Markdown` field is not visible on the `Show` view, instead it's hidden under a `Show Content` link, that, when clicked, displays the content. You can set Markdown to always display the content by setting `always_show` to `true`.

<!--@include: ./common/default_boolean_false.md-->
:::

:::option `height`
Sets the value of the editor

#### Default

`auto`


#### Possible values

`auto` or any number in pixels.
:::

:::option `spell_checker`
Toggles the editors spell checker option.

```ruby
field :description, as: :markdown, spell_checker: true
```

<!--@include: ./common/default_boolean_false.md-->
:::

## Enable spell checker