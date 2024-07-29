---
version: '1.0'
license: community
---

# Badge

The `Badge` field is used to display an easily recognizable status of a record.

<img :src="('/assets/img/fields/badge.jpg')" alt="Badge field" class="border mb-4" />

```ruby
field :stage,
  as: :badge,
  options: {
    info: [:discovery, :idea],
    success: :done,
    warning: 'on hold',
    danger: :cancelled,
    neutral: :drafting
  } # The mapping of custom values to badge values.
```

## Description

By default, the badge field supports five value types: `info` (blue), `success` (green), `danger` (red), `warning` (yellow) and `neutral` (gray). We can choose what database values are mapped to which type with the `options` parameter.

The `options` parameter is a `Hash` that has the state as the `key` and your configured values as `value`. The `value` param can be a symbol, string, or array of symbols or strings.

The `Badge` field is intended to be displayed only on **Index** and **Show** views. In order to update the value shown by badge field you need to use another field like [Text](#text) or [Select](#select), in combination with `hide_on: index` and `hide_on: show`.


## Options

<Option name="`options`">

The options should be a hash with the keys of one of the five available types (`info`, `success`, `warning`, `danger`, `neutral`) and the values matching your record's database values.

#### Default value

`{ info: :info, success: :success, danger: :danger, warning: :warning, neutral: :neutral }`

Below is an example of how you can use two fields in that combination.
</Option>

## Examples

```ruby
field :stage, as: :select, hide_on: [:show, :index], options: { 'Discovery': :discovery, 'Idea': :idea, 'Done': :done, 'On hold': 'on hold', 'Cancelled': :cancelled, 'Drafting': :drafting }, placeholder: 'Choose the stage.'
field :stage, as: :badge, options: { info: [:discovery, :idea], success: :done, warning: 'on hold', danger: :cancelled, neutral: :drafting }
```

