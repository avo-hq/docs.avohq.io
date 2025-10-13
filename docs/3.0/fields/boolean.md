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

<Option name="`as_toggle`">

<VersionReq version="3.24.1" />

Render the field as a toggle on the form views.

#### Default value

`false`

</Option>

