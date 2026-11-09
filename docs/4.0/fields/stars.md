---
license: community
description: "The stars field renders a star rating display on Index and Show views, and interactive clickable stars on Edit and New views."
fieldTags: [number]
outline: [2, 3]
---

# Stars

The `stars` field renders a star rating display on <Index /> and <Show /> views, and interactive clickable stars on <Edit /> and <New /> views. It's ideal for ratings, reviews, or any numeric value you want to represent visually as stars.

```ruby
# app/avo/resources/review.rb
class Avo::Resources::Review < Avo::BaseResource
  def fields
    field :rating, as: :stars
  end
end
```

By default, the field displays five stars. An empty rating displays no filled stars.

:::info
This field needs to be backed by a numeric column in your database (e.g., `integer`, `decimal`, or `float`).
:::

## Change the rating scale {#max}

Set `max` to a positive integer to change the number of stars. For example, use ten stars for a rating out of ten:

```ruby
# app/avo/resources/review.rb
field :rating, as: :stars, max: 10
```

The field displays whole stars, even when the database column supports decimals. Filled stars represent the current value, while unfilled stars show the remaining capacity up to the maximum.

:::warning
`max` controls the display, not model validation. Add model validations if stored ratings must stay within your chosen range.
:::

## Set or clear a rating

On <Edit /> and <New /> forms, click a star to select a whole-number rating from `1` to `max`. Click the currently selected star again to clear the rating to `0`. The selected numeric value is saved when the form is submitted.

## Configure shared field behavior {#options}

For options such as the field name, visibility, and help text, see [Field options](../field-options.html).
