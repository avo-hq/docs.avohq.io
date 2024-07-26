---
version: '1.0'
license: community
---

# Date

The `Date` field may be used to display date values.

```ruby
field :birthday,
  as: :date,
  first_day_of_week: 1,
  picker_format: "F J Y",
  format: "yyyy-LL-dd",
  placeholder: "Feb 24th 1955"
```

## Options

<Option name="`format`">
Format the date shown to the user on the `Index` and `Show` views.

#### Default

`yyyy-LL-dd`

#### Possible values

Use [`luxon`](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) formatting tokens.
</Option>
<Option name="`picker_format`">
Format the date shown to the user on the `Edit` and `New` views.

#### Default

`Y-m-d`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/formatting) formatting tokens.
</Option>

<Option name="`picker_options`">
Passes the options here to [flatpickr](https://flatpickr.js.org/).

#### Default

`{}`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/options) options.

:::warning
These options may override other options like `picker_options`.
:::

</Option>
<!-- @include: ./../common/date_date_time_common.md-->
