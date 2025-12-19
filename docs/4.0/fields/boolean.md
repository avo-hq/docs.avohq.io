---
version: '1.0'
license: community
---

# Boolean

The `Boolean` field renders a `input[type="checkbox"]` on **Form** views and a nice green `check` icon/red `X` icon on the **Show** and **Index** views.

<Image src="/assets/img/fields/boolean.jpg" width="790" height="356" alt="Boolean field" />

```ruby
field :is_published,
  as: :boolean,
  name: 'Published',
  true_value: 'yes',
  false_value: 'no'
```

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

<Image src="/assets/img/fields/boolean_nil_as_indeterminate.png" width="265" height="200" alt="nil_as_indeterminate option" />

#### Default value

`false`
</Option>

<Option name="`as_toggle`">

Render the field as a toggle on the form views.

#### Default value

`false`

</Option>
