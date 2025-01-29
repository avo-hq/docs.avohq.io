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

<Option name="`min`">

Set the `min` attribute.

#### Default

`nil`

#### Possible values

Any number.
</Option>

<Option name="`max`">

Set the `max` attribute.

#### Default

`nil`

#### Possible values

Any number.
</Option>

<Option name="`step`">

Set the `step` attribute.

#### Default

`nil`

#### Possible values

Any number.
</Option>

## Examples

```ruby
field :age, as: :number, min: 0, max: 120, step: 5
```
