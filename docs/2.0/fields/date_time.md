---
version: '1.0'
license: community
---

# DateTime

<img :src="('/assets/img/fields/date-time.jpg')" alt="DateTime field" class="border mb-4" />

The `DateTime` field is similar to the Date field with two new attributes. `time_24hr` tells flatpickr to use 24 hours format and `timezone` to tell it in what timezone to display the time. By default, it uses your browser's timezone.

```ruby
field :joined_at,
  as: :date_time,
  name: "Joined at",
  picker_format: "Y-m-d H:i:S",
  format: "yyyy-LL-dd TT",
  time_24hr: true,
  timezone: "PST"
```

## Options

:::option `format`

Format the date shown to the user on the `Index` and `Show` views.

#### Default

`yyyy-LL-dd TT`

#### Possible values

Use [`luxon`](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) formatting tokens.
:::
:::option `picker_format`
Format the date shown to the user on the `Edit` and `New` views.

#### Default

`Y-m-d H:i:S`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/formatting) formatting tokens.
:::
:::option `time_24hr`
Displays time picker in 24-hour mode or AM/PM selection.

<!-- @include: ./../common/default_boolean_false.md -->
:::
:::option `timezone`
Select in which timezone the values should be cast.

#### Default

If nothing is selected, the browser's timezone will be used.

#### Possible values

[TZInfo identifiers](https://api.rubyonrails.org/classes/ActiveSupport/TimeZone.html).
:::

:::option `picker_options`;
Passes the options here to [flatpickr](https://flatpickr.js.org/).

#### Default

`{}`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/options) options.

:::warning
These options may override other options like `picker_options`.
:::

::::
<!-- @include: ./../common/date_date_time_common.md-->
