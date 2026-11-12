---
license: community
outline: [2, 3]
guide: ./lexxy.html
prev:
  text: "Lexxy"
  link: "./lexxy.html"
next: false
---

# Lexxy API

Per-option reference for the Lexxy field. For setup and worked examples, see the [Lexxy guide](./lexxy.html).

Options are passed to the field declaration in an Avo resource:

```ruby
field :body, as: :lexxy, always_show: true, markdown: false
```

Shared options such as `placeholder`, `html`, `readonly`, and `disabled` are covered in [Common field options](../field-options.html). Read-only or disabled fields use the display component on edit forms.

## Content display and attachments

<Option name="`always_show`">

Displays the full content on the `Show` view instead of a collapsed preview with expansion controls.

```ruby
field :body, as: :lexxy, always_show: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`attachments_disabled`">

Disables attachments, including uploads through the toolbar, paste, and drag and drop. Also hides the Media Library button.

```ruby
field :body, as: :lexxy, attachments_disabled: true
```

- **Type:** `Boolean` or `nil`
- **Default:** `nil`, resolved to `false` for Action Text attributes and `true` otherwise.
- **Values:** `true` disables attachments; `false` enables them; `nil` uses attribute detection.

:::warning Plain columns
Enabling attachments on a plain column can leave orphaned blobs: Lexxy relies on Action Text to associate uploaded blobs with the saved record.
:::

</Option>

## Editor configuration

These options are forwarded to Lexxy as element attributes. Avo converts snake_case names to dashed names, leaves Strings unchanged, converts Symbols to Strings, and JSON-encodes other values. It does not validate their types or contents. See the [Lexxy documentation](https://lexxy.dev/docs/) for the upstream configuration contract.

All editor options are unset by default in Avo (`nil`, with no attribute emitted). The effective defaults below describe Lexxy's built-in `default` preset; global `Lexxy.configure` settings and a selected preset can change them.

<Option name="`preset`">

Selects a named preset registered with `Lexxy.configure`.

```ruby
field :body, as: :lexxy, preset: "default"
```

- **Type:** `String` or `Symbol`
- **Default:** `nil` in Avo; Lexxy selects `"default"`.
- **Values:** A registered preset name.

</Option>

<Option name="`markdown`">

Controls Markdown shortcuts. Shortcuts also require rich text to be enabled.

```ruby
field :body, as: :lexxy, markdown: false
```

- **Type:** `Boolean`
- **Default:** `nil` in Avo; `true` in Lexxy's default preset.

</Option>

<Option name="`rich_text`">

Controls rich text editing. Disabling it also disables the rich text toolbar and Markdown shortcuts.

```ruby
field :body, as: :lexxy, rich_text: false
```

- **Type:** `Boolean`
- **Default:** `nil` in Avo; `true` in Lexxy's default preset.

</Option>

<Option name="`multi_line`">

Controls whether the editor accepts multiple lines.

```ruby
field :body, as: :lexxy, multi_line: false
```

- **Type:** `Boolean`
- **Default:** `nil` in Avo; `true` in Lexxy's default preset.

</Option>

<Option name="`headings`">

Sets the heading tags available in the heading menu.

```ruby
field :body, as: :lexxy, headings: ["h2", "h3"]
```

- **Type:** `Array of Strings`
- **Default:** `nil` in Avo; `["h2", "h3", "h4"]` in Lexxy's default preset.

</Option>

<Option name="`toolbar`">

Controls toolbar visibility, configuration, or selection of an external toolbar by element ID.

```ruby
field :body, as: :lexxy, toolbar: false
```

| Value | Behavior |
| --- | --- |
| `false` | Hides the toolbar. |
| `true` | Uses a toolbar inside the editor or creates the default toolbar. |
| `Hash` | Configures the generated toolbar through Lexxy's toolbar settings. |
| `String` | Selects an existing toolbar by its HTML element ID. |

- **Type:** `Boolean`, `Hash`, or `String`
- **Default:** `nil` in Avo; `{upload: "both"}` in Lexxy's default preset.

</Option>

<Option name="`highlight`">

Configures text and background highlight palettes through Lexxy's `buttons` and `permit` settings. This is text highlighting, not code syntax highlighting.

```ruby
field :body, as: :lexxy, highlight: {buttons: {color: ["red"]}}
```

- **Type:** `Hash`
- **Default:** `nil` in Avo; Lexxy's built-in text/background color palettes with empty additional `permit` lists.

</Option>

<Option name="`permitted_attachment_types`">

Restricts accepted attachment content types. The restriction only applies when attachments are enabled.

```ruby
field :body, as: :lexxy, permitted_attachment_types: ["image/png", "image/jpeg"]
```

- **Type:** `Array of Strings`, whitespace-separated `String`, or `nil`
- **Default:** `nil` in Avo and Lexxy, allowing all content types when attachments are enabled.
- **Values:** Exact MIME types; Lexxy compares content types against the list, not wildcard patterns.

:::warning Client-side restriction
This option filters content types in the editor. It is not a substitute for server-side upload validation.
:::

</Option>
