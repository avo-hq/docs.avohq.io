---
license: community
description: "The Code field generates a code editor using codemirror package."
fieldTags: [structured]
outline: [2, 3]
api_docs: ./code-api.html
---

# Code

The `Code` field provides a [CodeMirror](https://codemirror.net/) editor for source code and structured text, with syntax highlighting and line numbers. It is hidden on the **Index** view and read-only on **Show**.

```ruby
# app/avo/resources/user.rb
field :custom_css, as: :code, language: "css"
```

Without extra configuration, the editor highlights JavaScript, uses the default theme in light mode and Monokai in dark mode, and displays a collapsed preview on **Show**.

<Image src="/assets/img/4_0/fields/code/index.webp" dark-src="/assets/img/4_0/fields/code/index-dark.webp" width="1520" height="614" alt="An Avo edit-form card containing a code field: a CodeMirror editor in the dracula dark theme with line-number gutter, showing syntax-highlighted CSS (a .user-card rule with display, padding, border-radius and background properties)." prompt="todo" />

## Highlight the right language {#language}

Set [`language`](./code-api.html#language) to match the stored code. The example above highlights CSS; the [reference](./code-api.html#language) lists all bundled language modes.

## Choose the editor colors {#theme}

Use [`theme`](./code-api.html#theme) to select the light-mode colors. Avo bundles `default` and `monokai`; other theme names need their own styles. Dark mode always uses `monokai`.

```ruby
# app/avo/resources/user.rb
field :custom_css, as: :code, language: "css", theme: "monokai"
```

## Display more code on Show {#always_show}

Set [`always_show`](./code-api.html#always_show) to keep the content expanded rather than showing a short, faded preview with a **More content** link. <span id="height"></span>Use [`height`](./code-api.html#height) to set the editor height on **Show**.

```ruby
# app/avo/resources/user.rb
field :custom_css, as: :code, language: "css", always_show: true, height: "250px"
```

On **Edit** and **New**, the editor uses a [resizable viewport](../fields.html#resizable-editors) instead. Its height comes from the viewport default or the user's last resized height, not `height`.

## Control indentation {#indent_with_tabs}

For tab-indented code, enable [`indent_with_tabs`](./code-api.html#indent_with_tabs) and <span id="tab_size"></span>set [`tab_size`](./code-api.html#tab_size) to the desired tab width.

```ruby
# app/avo/resources/user.rb
field :custom_css, as: :code, language: "css", indent_with_tabs: true, tab_size: 4
```

<span id="line_wrapping"></span>

:::warning Line wrapping
Lines wrap by default. Although the field accepts [`line_wrapping`](./code-api.html#line_wrapping), passing `false` currently still enables wrapping.
:::

## Edit a JSON column {#pretty_generated}

Enable [`pretty_generated`](./code-api.html#pretty_generated) for a JSON column to display indented JSON and parse the edited text back to a JSON value on save.

```ruby
# app/avo/resources/user.rb
field :metadata, as: :code, language: "javascript", pretty_generated: true
```

Custom `format_using` and `update_using` callbacks take precedence over these JSON defaults. See [shared field options](../field-options.html) for formatting, saving, visibility, and other common behavior.
