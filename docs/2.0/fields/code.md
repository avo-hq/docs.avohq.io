---
version: '2.0'
license: community
---

# Code

<img :src="('/assets/img/fields/code.jpg')" alt="Code field" class="border mb-4" />

The `Code` field generates a code editor using [codemirror](https://codemirror.net/) package. This field is hidden on **Index** view.

```ruby
field :custom_css, as: :code, theme: 'dracula', language: 'css'
```

## Options

### `theme`

Customize the color theme.

#### Default value

`material-darker`

#### Possible values

`material-darker`, `eclipse`, or `dracula`

Preview the themes here: [codemirror-themes](https://codemirror.net/demo/theme.html).


### `language`

Customize the syntax highlighting using the language method.

#### Default value

`javascript`

#### Possible values

`css`, `dockerfile`, `htmlmixed`, `javascript`, `markdown`, `nginx`, `php`, `ruby`, `sass`, `shell`, `sql`, `vue` or `xml`.
