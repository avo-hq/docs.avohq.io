---
license: community
outline: [2, 3]
guide: ./easy_mde.html
prev:
  text: "EasyMDE"
  link: "./easy_mde.html"
next: false
---

# EasyMDE API

Per-option reference for the `easy_mde` field. For tasks and examples, see the [EasyMDE guide](./easy_mde.html).

Options are passed to the field declaration in an Avo resource, such as `app/avo/resources/post.rb`:

```ruby
field :description, as: :easy_mde, spell_checker: true
```

The field stores raw Markdown and is hidden from Index by default. Shared options are documented in [Common field options](../field-options.html).

## Editing

<Option name="`spell_checker`">

Controls EasyMDE's spell checker through its `spellChecker` setting.

```ruby
field :description, as: :easy_mde, spell_checker: true
```

- **Type:** `Boolean`
- **Default:** `false`
- **Values:** `true`, `false`
- **Validation:** No Boolean type validation. Blank values fall back to `false`; other values are forwarded unchanged to EasyMDE.

</Option>

<Option name="`height`">

Accepted height setting, serialized with the field's editor options. Present values are converted to strings; blank values fall back to `"auto"`.

```ruby
field :description, as: :easy_mde, height: 300
```

- **Type:** `String` / `Numeric` (converted to `String`)
- **Default:** `"auto"`
- **Validation:** No height format or range validation.

:::warning Not applied by the editor
The current JavaScript integration does not read this option, so neither a pixel height nor `"auto"` configures the editor's initial height. New and Edit forms provide a resize handle independently of this option.
:::

</Option>

## Show content

<Option name="`always_show`">

Controls whether the Show view allows long content to collapse into a short, faded preview. When `true`, the full content remains visible. The Show editor is read-only and has no toolbar or status bar regardless of this setting.

```ruby
field :description, as: :easy_mde, always_show: true
```

- **Type:** `Boolean`
- **Default:** `false`
- **Values:** `true`, `false`
- **Validation:** No Boolean type validation. Blank values fall back to `false`; any other Ruby-truthy value prevents collapsing.

</Option>
