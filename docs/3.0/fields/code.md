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

<Option name="`pretty_generated`">

Automatically format and parse JSON content plus display it in a prettified way.

#### Default value

`false`

#### Possible values

`true` or `false`

```ruby
field :body, as: :code, pretty_generated: true
```
The above is equivalent to:
```ruby
field :body, as: :code,
format_using: -> {
  value.blank? ? value : JSON.pretty_generate(value)
},
update_using: -> {
  JSON.parse(value)
}
```
</Option>