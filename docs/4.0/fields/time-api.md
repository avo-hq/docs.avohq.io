---
license: community
outline: [2, 3]
guide: ./time.html
prev:
  text: "Time"
  link: "./time.html"
next: false
---

# Time API

Per-option reference for the `:time` field. For tasks and examples, see the [Time guide](./time.html).

Options are passed to a field declaration in an Avo resource, such as `app/avo/resources/event.rb`:

```ruby
field :starting_at, as: :time
```

Shared options, including `link_to_record`, are covered in [common field options](../field-options.html).

## Display formatting

<Option name="`format`">

The format used on Index and Show pages. Locale-sensitive tokens use the page's locale.

```ruby
field :starting_at, as: :time, format: "HH:mm"
```

- **Type:** `String`
- **Default:** `"TT"`
- **Values:** [Luxon formatting tokens](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).

</Option>

<Option name="`picker_format`">

The visible input format on New and Edit pages. It does not change the submitted time format.

```ruby
field :starting_at, as: :time, picker_format: "H:i"
```

- **Type:** `String`
- **Default:** `"H:i:S"`
- **Values:** [flatpickr formatting tokens](https://flatpickr.js.org/formatting).

:::warning Different token systems
`format` uses Luxon tokens; `picker_format` uses flatpickr tokens. They are not interchangeable.
:::

</Option>

## Timezone conversion

<Option name="`relative`">

Controls whether the time is converted from UTC to the display timezone. This is timezone conversion, not relative wording such as "two hours ago".

```ruby
field :starting_at, as: :time, relative: false
```

| Value | Behavior |
| --- | --- |
| `true` | Displays and edits in the configured timezone, or the browser's timezone when none is configured; picker changes are converted back to UTC. |
| `false` | Displays the UTC clock time on Index and Show; the picker retains that clock time and submits it without applying a timezone offset. |

- **Type:** `Boolean`
- **Default:** `true`

:::warning Date used for conversion
For time-only values, Avo reparses the UTC clock time using today's date before converting it for display or editing. Offsets therefore follow today's daylight saving rules, not the date attached to the stored value.
:::

</Option>

<Option name="`timezone`">

The display timezone when `relative` is `true`. A block can return a different timezone for each record.

```ruby
field :starting_at, as: :time, timezone: -> { record.timezone }
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
field :starting_at, as: :time, time_24hr: true
```

| Value | Behavior |
| --- | --- |
| `false` | Uses AM/PM selection. |
| `true` | Uses 24-hour selection. |

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`disable_mobile`">

Disables flatpickr's native mobile picker fallback. See [flatpickr mobile support](https://flatpickr.js.org/mobile-support/).

```ruby
field :starting_at, as: :time, disable_mobile: true
```

| Value | Behavior |
| --- | --- |
| `false` | Allows a native mobile picker where flatpickr supports it. |
| `true` | Uses flatpickr on mobile too. |

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`picker_options`">

Additional [flatpickr options](https://flatpickr.js.org/options), applied on New and Edit pages. Avo fills `locale.weekdays` and `locale.months` from the app locale and merges a supplied `locale` over them. The Time field has no calendar.

```ruby
field :starting_at, as: :time, picker_options: { minTime: "09:00" }
```

- **Type:** `Hash`
- **Default:** `{}`
- **Values:** [flatpickr options](https://flatpickr.js.org/).
- **Validation:** These settings constrain the picker, not server-side model validation.

:::warning Avo-controlled settings
Avo sets `altFormat`, `disableMobile`, `locale.firstDayOfWeek`, `enableTime`, `enableSeconds`, `noCalendar`, and `dateFormat` after merging `picker_options`. Avo also supplies `defaultDate` when the field has a value. Those settings cannot be overridden through this Hash. Other options, including `time_24hr` and callbacks, are forwarded to flatpickr and can replace Avo's defaults.
:::

</Option>
