---
version: '1.0'
license: community
outline: [2,3]
---

# Textarea

The `textarea` field renders a `<textarea />` element.

:::tip
By default, the `textarea` field don't have a component for the [Index](../views#index) view. For this reason, on the [Index](../views#index) view the field is not even visible.

Follow the [Generating a custom component for a field](../guides/generating-components-for-fields.html) guide to add a component to the index view for this field.
:::

```ruby
field :body, as: :textarea
```

## Options


<Option name="`rows`" headingSize="3">

Set the number of rows visible in the `Edit` and `New` views.

```ruby
field :body, as: :textarea, rows: 5
```

#### Default

`5`

#### Possible values

Any integer.
</Option>
