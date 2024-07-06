---
version: '1.0'
license: community
---

# Heading

:::code-group
```ruby [Field id]
field :user_information, as: :heading
```

```ruby [Label]
field :some_id, as: :heading, label: "user information"
```

```ruby [Computed]
field :some_id, as: :heading do
  "user information"
end
```
:::


<Image src="/assets/img/fields/heading.png" width="821" height="230" alt="Heading field" />

The `Heading` field displays a header that acts as a separation layer between different sections.

`Heading` is not assigned to any column in the database and is only visible on the `Show`, `Edit` and `Create` views.

:::warning Computed heading
The computed fields are not rendered on form views, same with heading field, if computed syntax is used it will not be rendered on the form views. Use `label` in order to render it on **all** views.
:::

## Options

:::option `as_html`
The `as_html` option will render it as HTML.

```ruby
field :dev_heading, as: :heading, as_html: true do
  '<div class="underline uppercase font-bold">DEV</div>'
end
```

<!-- @include: ./../common/default_boolean_false.md -->
:::

:::option `label`
The content of `label` is the content displayed on the heading space.

```ruby
field :some_id, as: :heading, label: "user information"
```
:::
