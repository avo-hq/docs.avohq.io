---
version: '3.28'
license: community
---

# Stars

The `stars` field renders a star rating display on <Index /> and <Show /> views, and interactive clickable stars on <Edit /> and <New /> views. It's ideal for ratings, reviews, or any numeric value you want to represent visually as stars.

```ruby
field :rating, as: :stars
```

:::info
This field needs to be backed by a numeric column in your database (e.g., `integer`, `decimal`, or `float`).
:::

## Options

<Option name="`max`">

Sets the maximum number of stars to display.

#### Default

`5`

#### Possible values

Any positive integer.
</Option>

## Examples

```ruby
field :rating, as: :stars
```

```ruby
field :rating, as: :stars, max: 10
```

The field stores a numeric value (e.g., `0` to `5` for a 5-star rating). On edit forms, users can click on stars to set the rating. Filled stars represent the current value, while unfilled stars show the remaining capacity up to the maximum.

