---
license: community
description: "Renders the EasyMDE Markdown editor, storing raw Markdown in the database."
fieldTags: [rich text]
outline: [2, 3]
---

# EasyMDE

The `easy_mde` field provides an [EasyMDE Markdown editor](https://github.com/Ionaru/easy-markdown-editor) for a text column in your database. Use it to write descriptions, notes, or other long-form content and store the raw Markdown rather than HTML.

```ruby
# app/avo/resources/post.rb
field :description, as: :easy_mde
```

By default, the spell checker is off, long content is collapsed on the Show view, and the field is hidden from the Index view.

:::info
Before Avo 3.17 this field was called `markdown`. It was renamed to `easy_mde` to make room for Avo's own `markdown` implementation.
:::

<Image src="/assets/img/4_0/fields/easy_mde/form.webp" dark-src="/assets/img/4_0/fields/easy_mde/form-dark.webp" width="1520" height="978" alt="An Avo create-form card containing an easy_mde field: the EasyMDE Markdown editor with its toolbar (bold, italic, heading, lists, link and preview controls) above a text area pre-filled with sample Markdown — a Release notes document with a heading, bold text, a bullet list and a link." prompt="from create page" />

## Enable spell checking {#spell_checker}

If you want spelling suggestions while editing, set `spell_checker` to `true`.

```ruby
# app/avo/resources/post.rb
field :description, as: :easy_mde, spell_checker: true
```

## Display the full content on Show

By default, the Show view collapses long content into a short, faded preview. Readers can expand it with More content and collapse it again with Less content. If you want the full content visible immediately, set `always_show` to `true`.

```ruby
# app/avo/resources/post.rb
field :description, as: :easy_mde, always_show: true
```

The Show view displays a read-only editor without the toolbar or status bar.

## Adjust the editor height {#height}

Drag the resize handle on New and Edit forms to change the editor height.

:::warning
The `height` option is accepted by the field and defaults to `"auto"`, but the current editor integration does not apply it. Passing a pixel height does not set the editor's initial height.
:::

## Use common field options

See [Common field options](../field-options.html) for shared settings such as labels, help text, placeholders, and visibility.
