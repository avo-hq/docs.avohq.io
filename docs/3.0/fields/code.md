---
version: '1.0'
license: community
---

# Code

<Image src="/assets/img/fields/code.jpg" width="1552" height="716" alt="Code field" />

The `Code` field generates a code editor using [codemirror](https://codemirror.net/) package. This field is hidden on **Index** view.

```ruby
field :custom_css, as: :code, theme: 'dracula', language: 'css'
```

## Options

:::option `theme`

Customize the color theme.

#### Default value

`material-darker`

#### Possible values

`material-darker`, `eclipse`, or `dracula`

Preview the themes here: [codemirror-themes](https://codemirror.net/demo/theme.html).
:::

:::option `language`
Customize the syntax highlighting using the language method.

#### Default value

`javascript`

#### Possible values

`css`, `dockerfile`, `htmlmixed`, `javascript`, `markdown`, `nginx`, `php`, `ruby`, `sass`, `shell`, `sql`, `vue` or `xml`.
:::

:::option `height`
Customize the height of the editor.

#### Default value

`auto`

#### Possible values

`auto`, or any value in pixels (eg `height: 250px`).
:::

:::option `tab_size`
Customize the tab_size of the editor.

#### Default value

`2`

#### Possible values

Any integer value.
:::

:::option `indent_with_tabs`
Customize the type of indentation.

#### Default value

`false`

#### Possible values

`true` or `false`
:::

:::option `line_wrapping`
Customize whether the editor should apply line wrapping.

#### Default value

`true`

#### Possible values

`true` or `false`
:::
