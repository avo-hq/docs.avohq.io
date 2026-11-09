---
license: community
outline: [2, 3]
guide: ./code.html
prev:
  text: "Code"
  link: "./code.html"
next: false
---

# Code API

Per-option reference for the Code field. For worked examples, see the [Code guide](./code.html).

Options are passed to the field declaration in an Avo resource:

```ruby
# app/avo/resources/user.rb
field :custom_css, as: :code, language: "css"
```

For options common to all fields, see [shared field options](../field-options.html).

## Syntax and colors

<Option name="`language`">

The CodeMirror syntax-highlighting mode.

```ruby
field :custom_css, as: :code, language: "css"
```

- **Type:** `String` or `Symbol` (converted to a string).
- **Default:** `"javascript"`.
- **Values:** Bundled modes are listed below.
- **Validation:** Avo does not validate mode names. Blank values use the default.

| Value | Behavior |
| --- | --- |
| `css` | CSS highlighting |
| `dockerfile` | Dockerfile highlighting |
| `htmlmixed` | HTML with embedded CSS and JavaScript |
| `javascript` | JavaScript highlighting |
| `markdown` | Markdown highlighting |
| `nginx` | Nginx configuration highlighting |
| `php` | PHP highlighting |
| `ruby` | Ruby highlighting |
| `sass` | Sass highlighting |
| `shell` | Shell script highlighting |
| `sql` | SQL highlighting |
| `vue` | Vue single-file component highlighting |
| `xml` | XML highlighting |
| `yaml` | YAML highlighting |

</Option>

<Option name="`theme`">

The CodeMirror theme used in light mode. Dark mode always uses `monokai`, including when the user switches modes while the editor is open.

```ruby
field :custom_css, as: :code, theme: "monokai"
```

- **Type:** `String` or `Symbol` (converted to a string).
- **Default:** `"default"`.
- **Validation:** Avo does not validate theme names. Blank values use the default.

| Value | Behavior |
| --- | --- |
| `default` | CodeMirror's default light theme |
| `monokai` | Bundled dark theme, also usable in light mode |

:::warning Additional themes
Only `default` and `monokai` have styles bundled with Avo. Other names are forwarded to CodeMirror but need separately loaded theme styles.
:::

</Option>

## Display

<Option name="`always_show`">

Controls whether the Show view displays the full content or a collapsed, faded preview with **More content** and **Less content** controls.

```ruby
field :custom_css, as: :code, always_show: true
```

- **Type:** `Boolean`.
- **Default:** `false`.

| Value | Behavior |
| --- | --- |
| `false` | Collapsible preview on Show |
| `true` | Full content on Show |

</Option>

<Option name="`height`">

The editor height on Show. Edit and New use the [resizable viewport](../fields.html#resizable-editors) instead and ignore this option.

```ruby
field :custom_css, as: :code, height: "250px"
```

- **Type:** `String` (nonblank inputs are converted to strings).
- **Default:** `"auto"`.
- **Values:** `"auto"` or a CSS height such as `"250px"`.
- **Validation:** Avo does not validate CSS values. Blank values use the default; numeric inputs do not acquire a `px` unit.

</Option>

<Option name="`line_wrapping`">

Controls line wrapping in the editor.

```ruby
field :custom_css, as: :code, line_wrapping: true
```

- **Type:** `Boolean`.
- **Default:** `true`.

| Value | Behavior |
| --- | --- |
| `true` | Wraps long lines |
| `false` | Currently falls back to `true` and also wraps long lines |

:::warning False does not disable wrapping
The current field initialization treats `false` as blank and replaces it with the default `true`.
:::

</Option>

## Indentation

<Option name="`tab_size`">

The width of a tab character in the editor.

```ruby
field :custom_css, as: :code, tab_size: 4
```

- **Type:** `Integer`.
- **Default:** `2`.
- **Validation:** Avo does not enforce a numeric type or range; the value is forwarded to CodeMirror through a data attribute. Blank values use the default.

</Option>

<Option name="`indent_with_tabs`">

Controls whether indentation uses tabs rather than spaces.

```ruby
field :custom_css, as: :code, indent_with_tabs: true
```

- **Type:** `Boolean`.
- **Default:** `false`.

| Value | Behavior |
| --- | --- |
| `false` | Indents with spaces |
| `true` | Indents with tabs |

</Option>

## JSON values

<Option name="`pretty_generated`">

Installs default formatting and saving callbacks for JSON columns. Display and form values pass through `JSON.pretty_generate`; submitted values pass through `JSON.parse`. Blank values pass through unchanged. Explicit `format_using` and `update_using` callbacks override the respective defaults.

```ruby
field :metadata, as: :code, language: "javascript", pretty_generated: true
```

- **Type:** `Boolean`.
- **Default:** `false` (disabled when omitted).
- **Validation:** Nonblank invalid JSON raises `JSON::ParserError` during parsing; this option does not provide an inline JSON validation error.

| Value | Behavior |
| --- | --- |
| `false` | Does not install JSON callbacks |
| `true` | Installs JSON callbacks unless explicitly provided |

</Option>
