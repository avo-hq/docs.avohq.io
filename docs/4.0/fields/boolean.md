---
license: community
---

# Boolean

The `Boolean` field renders a `input[type="checkbox"]` on **Form** views and a nice green `check` icon/red `X` icon on the **Show** and **Index** views.

```ruby
field :is_published,
  as: :boolean,
  name: 'Published',
  true_value: 'yes',
  false_value: 'no'
```

<Image src="/assets/img/4_0/fields/boolean.png" dark-src="/assets/img/4_0/fields/boolean-dark.png" width="596" height="128" alt="Boolean field shown as a green check and a red X on the Index view" />

## Options

<Option name="`true_value`">

What should count as true. You can use `1`, `yes`, or a different value.

#### Default value

`[true, "true", "1"]`

</Option>
<Option name="`false_value`">

What should count as false. You can use `0`, `no`, or a different value.

#### Default value

`[false, "false", "0"]`
</Option>

<Option name="`nil_as_indeterminate`">

When `true`, `nil` values render as a gray minus-circle icon on **Show** and **Index** views instead of the default dash. This keeps the `nil` value intact while making it more visible.

<Image src="/assets/img/4_0/fields/boolean_nil_as_indeterminate.png" dark-src="/assets/img/4_0/fields/boolean_nil_as_indeterminate-dark.png" width="268" height="69" alt="Boolean field with nil_as_indeterminate showing a gray minus-circle icon" />

#### Default value

`false`
</Option>

<Option name="`as_toggle`">

Render the field as a toggle on the form views.

#### Default value

`false`

</Option>
