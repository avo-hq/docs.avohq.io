---
license: community
outline: [2, 3]
guide: ./date_time.html
prev:
  text: "DateTime"
  link: "./date_time.html"
next: false
---

# DateTime API

Per-option reference for the `:date_time` field. For tasks and examples, see the [DateTime guide](./date_time.html).

Options are passed to a field declaration in an Avo resource, such as `app/avo/resources/event.rb`:

```ruby
field :starts_at, as: :date_time
```

Shared options, including `link_to_record`, are covered in [common field options](../field-options.html).

## Display formatting

<Option name="`format`">

The format used on Index and Show pages. Textual date parts use the page's locale.

```ruby
field :starts_at, as: :date_time, format: "dd LLL yyyy HH:mm"
```

- **Type:** `String`
- **Default:** `"yyyy-LL-dd TT"`
- **Values:** [Luxon formatting tokens](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).

</Option>

<Option name="`picker_format`">

The visible input format on New and Edit pages. It does not change the submitted timestamp format.

```ruby
field :starts_at, as: :date_time, picker_format: "d M Y H:i"
```

- **Type:** `String`
- **Default:** `"Y-m-d H:i:S"`
- **Values:** [flatpickr formatting tokens](https://flatpickr.js.org/formatting).

:::warning Different token systems
`format` uses Luxon tokens; `picker_format` uses flatpickr tokens. They are not interchangeable.
:::

</Option>

## Timezone conversion

<Option name="`relative`">

Controls whether the timestamp is converted from UTC to the display timezone. This is timezone conversion, not relative wording such as "two hours ago".

```ruby
field :starts_at, as: :date_time, relative: false
```

| Value | Behavior |
| --- | --- |
| `true` | Displays and edits in the configured timezone, or the browser's timezone when none is configured; picker changes are converted back to UTC. |
| `false` | Displays UTC on Index and Show; the picker retains the UTC clock time and submits it as UTC without applying a timezone offset. |

- **Type:** `Boolean`
- **Default:** `true`

</Option>

<Option name="`timezone`">

The display timezone when `relative` is `true`. A block can return a different timezone for each record.

```ruby
field :starts_at, as: :date_time, timezone: -> { record.timezone }
```

- **Type:** `String` or `Proc` / `Lambda` returning a timezone identifier or `nil`
- **Default:** `nil` (uses the browser's timezone)
- **Values:** Timezone identifiers understood by Luxon, such as `"America/Los_Angeles"` or `"UTC"`. See also Rails' [timezone documentation](https://api.rubyonrails.org/classes/ActiveSupport/TimeZone.html).
- **Context:** Blocks run in `Avo::ExecutionContext` with `record`, `resource`, and `view` available.

:::info
With `relative: false`, the configured timezone does not shift the displayed clock time. Avo normalizes `"UTC"` to `"Etc/UTC"` on form views for compatibility with Luxon.
:::

</Option>

## Picker controls

<Option name="`time_24hr`">

Controls the picker's hour selection. Index and Show formatting is controlled separately by `format`.

```ruby
field :starts_at, as: :date_time, time_24hr: true
```

| Value | Behavior |
| --- | --- |
| `false` | Uses AM/PM selection. |
| `true` | Uses 24-hour selection. |

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`first_day_of_week`">

The first weekday in the picker calendar, forwarded to flatpickr's `locale.firstDayOfWeek`. See [flatpickr localization](https://flatpickr.js.org/localization/).

```ruby
field :starts_at, as: :date_time, first_day_of_week: 0
```

| Value | Weekday |
| --- | --- |
| `0` | Sunday |
| `1` | Monday |
| `2` | Tuesday |
| `3` | Wednesday |
| `4` | Thursday |
| `5` | Friday |
| `6` | Saturday |

- **Type:** `Integer`
- **Default:** `1`
- **Validation:** Avo does not validate the weekday range; flatpickr expects `0` through `6`.

</Option>

<Option name="`disable_mobile`">

Disables flatpickr's native mobile picker fallback. See [flatpickr mobile support](https://flatpickr.js.org/mobile-support/).

```ruby
field :starts_at, as: :date_time, disable_mobile: true
```

| Value | Behavior |
| --- | --- |
| `false` | Allows a native mobile picker where flatpickr supports it. |
| `true` | Uses flatpickr on mobile too. |

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`picker_options`">

Additional [flatpickr options](https://flatpickr.js.org/options), applied on New and Edit pages. Avo fills `locale.weekdays` and `locale.months` from the app locale and merges a supplied `locale` over them.

```ruby
field :starts_at, as: :date_time, picker_options: { minDate: "today" }
```

- **Type:** `Hash`
- **Default:** `{}`
- **Values:** [flatpickr options](https://flatpickr.js.org/).
- **Validation:** These settings constrain the picker, not server-side model validation.

:::warning Avo-controlled settings
Avo sets `altFormat`, `disableMobile`, `locale.firstDayOfWeek`, `enableTime`, `enableSeconds`, `noCalendar`, and `dateFormat` after merging `picker_options`. Avo also supplies `defaultDate` when the field has a value. Those settings cannot be overridden through this Hash. Other options, including callbacks, are forwarded to flatpickr and can replace Avo's defaults.
:::

</Option>
