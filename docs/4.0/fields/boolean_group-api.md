---
license: community
outline: [2, 3]
guide: ./boolean_group.html
prev:
  text: "Boolean Group"
  link: "./boolean_group.html"
next: false
---

# Boolean Group API

Per-option reference for the `boolean_group` field. For worked examples, see the [Boolean Group guide](./boolean_group.html).

Options are passed to the field declaration inside `def fields` in an Avo resource, such as `app/avo/resources/user.rb`:

```ruby
field :roles, as: :boolean_group, options: {admin: "Administrator"}
```

## Checkbox choices

<Option name="`options`">

Maps stored keys to checkbox labels. The same choices appear in the index and show popovers. A callable is evaluated when the choices are requested and must return a hash with the same structure.

```ruby
field :roles,
  as: :boolean_group,
  options: {admin: "Administrator", writer: "Writer"}
```

- **Type:** `Hash` mapping `String` or `Symbol` keys to `String` labels, or `Proc` / lambda returning that hash.
- **Default:** `{}`. Passing `nil` also uses `{}`.
- **Context:** Evaluated in an [`Avo::ExecutionContext`](../execution-context.html).
- **Locals:** `record`, `resource`, `view`, and `field`.
- **Validation:** No explicit type or return-value validation. The resolved value must support hash-style iteration for rendering and saving.

An empty hash renders no choices. Stored values are matched to configured keys with string/symbol equivalence. On save, checked choices become `true` and unchecked choices become `false`; stored keys not listed in `options` are preserved.

:::warning Unchecked choices are saved
Omitting a configured key from the submitted selection sets it to `false`; it does not preserve that key's previous value. Only keys outside `options` remain untouched.
:::

</Option>

## Shared field options

The field also accepts [common field options](../field-options.html), including labels, visibility, and read-only behavior.
