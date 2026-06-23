---
license: community
---

# Code

The `Code` field generates a code editor using [codemirror](https://codemirror.net/) package. This field is hidden on **Index** view.

```ruby
field :custom_css, as: :code, theme: 'dracula', language: 'css'
```

<Image src="/assets/img/4_0/fields/code/index.png" dark-src="/assets/img/4_0/fields/code/index-dark.png" width="1520" height="614" alt="An Avo edit-form card containing a code field: a CodeMirror editor in the dracula dark theme with line-number gutter, showing syntax-highlighted CSS (a .user-card rule with display, padding, border-radius and background properties)." prompt="todo" />

## Options

<Option name="`theme`">

Customize the color theme.

#### Default value

`material-darker`

#### Possible values

`material-darker`, `eclipse`, or `dracula`

Preview the themes here: [codemirror-themes](https://codemirror.net/demo/theme.html).
</Option>

<Option name="`language`">

Customize the syntax highlighting using the language method.

#### Default value

`javascript`

#### Possible values

`css`, `dockerfile`, `htmlmixed`, `javascript`, `markdown`, `nginx`, `php`, `ruby`, `sass`, `shell`, `sql`, `vue` or `xml`.
</Option>

<Option name="`height`">

Customize the height of the editor.

#### Default value

`auto`

#### Possible values

`auto`, or any value in pixels (eg `height: 250px`).
</Option>

<Option name="`tab_size`">

Customize the tab_size of the editor.

#### Default value

`2`

#### Possible values

Any integer value.
</Option>

<Option name="`indent_with_tabs`">

Customize the type of indentation.

#### Default value

`false`

#### Possible values

`true` or `false`
</Option>

<Option name="`line_wrapping`">

Customize whether the editor should apply line wrapping.

#### Default value

`true`

#### Possible values

`true` or `false`
</Option>
