---
license: community
outline: [2, 3]
guide: ./date.html
prev:
  text: "Date"
  link: "./date.html"
next: false
---

# Date API

Per-option reference for the `Date` field; see the [Date guide](./date.html) for tasks and examples.

Options are passed to the field declaration in a resource's `fields` method, for example in `app/avo/resources/user.rb`:

```ruby
field :birthday, as: :date, format: "yyyy-LL-dd"
```

Shared options such as `placeholder` and `link_to_record` are covered in [common field options](../field-options.html).

## Date formatting

<Option name="`format`">

The date format used on index and show pages. Uses [Luxon formatting tokens](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).

```ruby
field :birthday, as: :date, format: "dd LLL yyyy"
```

- **Type:** `String`
- **Default:** `"yyyy-LL-dd"`

</Option>

<Option name="`picker_format`">

The visible date format on new and edit forms. Uses [flatpickr formatting tokens](https://flatpickr.js.org/formatting), independently of the index and show format.

```ruby
field :birthday, as: :date, picker_format: "F J Y"
```

- **Type:** `String`
- **Default:** `"Y-m-d"`

</Option>

## Calendar behavior

<Option name="`first_day_of_week`">

The first weekday in the picker calendar, following [flatpickr's localization](https://flatpickr.js.org/localization/).

```ruby
field :birthday, as: :date, first_day_of_week: 0
```

| Value | Behavior |
| --- | --- |
| `0` | Sunday first |
| `1` | Monday first |
| `2` | Tuesday first |
| `3` | Wednesday first |
| `4` | Thursday first |
| `5` | Friday first |
| `6` | Saturday first |

- **Type:** `Integer`
- **Default:** `1`
- **Values:** `0` through `6`
- **Validation:** Avo does not validate the weekday range before forwarding it to flatpickr.

</Option>

<Option name="`picker_options`">

Additional [flatpickr options](https://flatpickr.js.org/options). Avo supplies weekday and month names from the app locale and merges a supplied `locale` Hash over those names.

```ruby
field :birthday, as: :date, picker_options: {maxDate: "today"}
```

- **Type:** `Hash` with JSON-serializable flatpickr options
- **Default:** `{}`
- **Validation:** Avo does not validate flatpickr option names or values.

:::warning Option precedence
Avo sets `altFormat`, `disableMobile`, `locale.firstDayOfWeek`, `enableTime`, `enableSeconds`, and `noCalendar` after applying `picker_options`, so those entries cannot override Avo's settings. An existing field value also takes precedence over `defaultDate`. The `locale` override must be an object, not a flatpickr locale name string.
:::

</Option>

<Option name="`disable_mobile`">

Disables flatpickr's [native mobile picker fallback](https://flatpickr.js.org/mobile-support/), rather than disabling flatpickr itself.

```ruby
field :birthday, as: :date, disable_mobile: true
```

| Value | Behavior |
| --- | --- |
| `false` | Allows a native mobile picker when flatpickr supports it |
| `true` | Uses flatpickr on mobile too |

- **Type:** `Boolean`
- **Default:** `false`

</Option>
