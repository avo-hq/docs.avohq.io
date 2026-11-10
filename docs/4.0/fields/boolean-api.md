---
license: community
outline: [2, 3]
guide: ./boolean.html
prev:
  text: "Boolean"
  link: "./boolean.html"
next: false
---

# Boolean API

Per-option reference for the Boolean field. For tasks and examples, see the [Boolean guide](./boolean.html).

Pass these options to a field declaration in your resource's `fields` method, for example in `app/avo/resources/post.rb`:

```ruby
field :is_published, as: :boolean, as_toggle: true
```

For options shared by all fields, see [Field options](../field-options.html).

## Interpret stored values

<Option name="`true_value`">

An additional value recognized as true, alongside the strings `"true"` and `"1"`. Present values are compared against those three values; a nonmatching present value resolves to false. Blank values, including `nil` and `false`, are returned unchanged.

```ruby
field :is_published, as: :boolean, true_value: "yes"
```

- **Type:** Any object; used when Rails considers it present.
- **Default:** `true`

:::warning Blank values and form submissions
A blank configuration value, such as `nil`, `false`, or `""`, falls back to `true`. Matching does not coerce types: the integer `1` is not the string `"1"`. This option changes value interpretation, not the checkbox's submitted values (`"1"` and `"0"`).
:::

</Option>

<Option name="`false_value`">

Stored as the field's configured false value, but not consulted when resolving values for display. Present values outside the true-value set resolve to false regardless of this option. It does not change the checkbox's unchecked submission value (`"0"`).

```ruby
field :is_published, as: :boolean, false_value: "no"
```

- **Type:** Any object; used when Rails considers it present.
- **Default:** `false`

Blank configuration values fall back to `false`.

</Option>

## Control presentation

<Option name="`nil_as_indeterminate`">

Displays `nil` as a gray minus-circle icon on Index and Show views rather than a dash. It does not change the stored value or the form control.

```ruby
field :is_published, as: :boolean, nil_as_indeterminate: true
```

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`as_toggle`">

Styles the checkbox as a toggle on form views. Index and Show icons are unchanged.

```ruby
field :is_published, as: :boolean, as_toggle: true
```

- **Type:** Boolean
- **Default:** `false`

:::warning Ruby truthiness
Both presentation flags use Ruby truthiness rather than parsing Boolean strings. Only `false` and `nil` disable them; values such as `"false"` and `0` enable them.
:::

</Option>
