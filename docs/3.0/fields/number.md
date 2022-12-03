---
version: '1.0'
license: community
---

# Number

The `number` field renders a `input[type="number"]` element.

```ruby
field :age, as: :number
```

## Options

:::option `min`
Set the `min` attribute.

#### Default

`nil`

#### Possible values

Any number.
:::

:::option `max`
Set the `max` attribute.

#### Default

`nil`

#### Possible values

Any number.
:::

:::option `step`
Set the `step` attribute.

#### Default

`nil`

#### Possible values

Any number.
:::

## Examples

```ruby
field :age, as: :number, min: 0, max: 120, step: 5
```
