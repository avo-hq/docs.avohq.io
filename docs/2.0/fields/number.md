---
version: '2.0'
license: community
---

# Number

The `number` field renders a `input[type="number"]` element and has the `min`, `max`, and `step` options.

```ruby
field :age, as: :number, min: 0, max: 120, step: 5
```