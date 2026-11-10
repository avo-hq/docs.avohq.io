---
license: community
outline: [2, 3]
guide: ./stars.html
prev:
  text: "Stars"
  link: "./stars.html"
next: false
---

# Stars API

Per-option reference for the Stars field. For tasks and examples, see the [Stars guide](./stars.html).

Pass these options to a field declaration in your resource's `fields` method, for example in `app/avo/resources/review.rb`:

```ruby
field :rating, as: :stars, max: 10
```

For options shared by all fields, see [Field options](../field-options.html).

## Rating scale

<Option name="`max`">

The number of stars rendered on Index, Show, Edit, and New views. Forms select whole-number ratings from `1` through this maximum; clicking the selected star again clears the rating to `0`.

```ruby
field :rating, as: :stars, max: 10
```

- **Type:** `Integer`
- **Default:** `5`; `nil` and `false` also fall back to `5`.
- **Values:** A positive integer for a usable rating scale.
- **Validation:** No positivity check or string-to-integer coercion. Rendering iterates over `1..max`; zero and negative integers render no stars, and incompatible types can raise during rendering.

:::warning Display limit, not model validation
`max` does not validate or clamp the stored value. Index and Show views fill each whole star whose number is less than or equal to the value: `3.7` fills three stars, and a value above `max` fills every star. An empty rating fills none. Forms submit the selected whole-number rating through a hidden input; clearing submits `0`, not `nil`.
:::

</Option>
