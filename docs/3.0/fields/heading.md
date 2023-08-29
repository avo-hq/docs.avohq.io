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


<img :src="('/assets/img/fields/heading.png')" alt="Heading field" class="border mb-4" />

The `Heading` field displays a header that acts as a separation layer between different sections.

`Heading` is not assigned to any column in the database and is only visible on the `Show`, `Edit` and `Create` views.

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

