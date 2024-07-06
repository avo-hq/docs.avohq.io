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

:::option `true_value`

What should count as true. You can use `1`, `yes`, or a different value.

#### Default value

`[true, "true", "1"]`

:::
:::option `false_value`

What should count as false. You can use `0`, `no`, or a different value.

#### Default value

`[false, "false", "0"]`
:::
