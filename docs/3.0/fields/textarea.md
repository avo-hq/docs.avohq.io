---
version: '1.0'
license: community
---

# Textarea

The `textarea` field renders a `<textarea />` element.

```ruby
field :body, as: :textarea
```

## Options


<Option name="`rows`">
Set the number of rows visible in the `Edit` and `New` views.

```ruby
field :body, as: :textarea, rows: 5
```

#### Default

`5`

#### Possible values

Any integer.
</Option>
