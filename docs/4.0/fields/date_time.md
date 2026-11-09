---
license: community
outline: [2, 3]
api_docs: ./date_time-api.html
field_type: date_time
default_format: "yyyy-LL-dd TT"
default_picker_format: "Y-m-d H:i:S"
description: "Displays date and time values, with configurable format, timezone, and picker options."
fieldTags: [date & time]
---

# DateTime

The `DateTime` field displays a date and time on Index and Show pages and provides a calendar with a time picker on New and Edit pages. Use it for timestamps such as when a member joined or an event starts.

```ruby
# app/avo/resources/user.rb
field :joined_at,
  as: :date_time,
  time_24hr: true
```

Without extra configuration, dates and times use the browser's timezone, the display format is `yyyy-LL-dd TT`, and the picker format is `Y-m-d H:i:S`. The picker uses AM/PM selection unless you enable 24-hour mode.

<Image src="/assets/img/4_0/fields/date-time.webp" dark-src="/assets/img/4_0/fields/date-time-dark.webp" width="536" height="390" alt="DateTime field" />

## Change how dates and times look

Set [`format`](./date_time-api.html#format) to change Index and Show output with [Luxon formatting tokens](https://moment.github.io/luxon/#/formatting?id=table-of-tokens). Set [`picker_format`](./date_time-api.html#picker_format) separately for New and Edit using [flatpickr tokens](https://flatpickr.js.org/formatting).

```ruby
# app/avo/resources/user.rb
field :joined_at,
  as: :date_time,
  format: "dd LLL yyyy HH:mm",
  picker_format: "d M Y H:i",
  time_24hr: true
```

Enable [`time_24hr`](./date_time-api.html#time_24hr) for 24-hour picker controls. It does not change the Index or Show format.

## Display times in a specific timezone

If everyone needs to see an event in the same timezone, provide [`timezone`](./date_time-api.html#timezone). Use a timezone identifier such as `America/Los_Angeles` rather than relying on an abbreviation.

```ruby
# app/avo/resources/event.rb
field :starts_at, as: :date_time, timezone: "America/Los_Angeles"
```

For a record-specific timezone, use a block:

```ruby
# app/avo/resources/event.rb
field :starts_at, as: :date_time, timezone: -> { record.timezone }
```

If the timestamp must keep its UTC clock time instead of converting to a local time, set [`relative`](./date_time-api.html#relative) to `false`.

```ruby
# app/avo/resources/event.rb
field :starts_at, as: :date_time, relative: false
```

:::info
With `relative: false`, Index and Show display UTC, and the picker keeps the UTC clock time without applying a timezone offset. A configured timezone does not shift that clock time.
:::

## Customize the calendar

Use [`first_day_of_week`](./date_time-api.html#first_day_of_week) to change the calendar's starting weekday. To use flatpickr instead of the native mobile picker, set [`disable_mobile`](./date_time-api.html#disable_mobile) to `true`; see [flatpickr's mobile support](https://flatpickr.js.org/mobile-support/).

```ruby
# app/avo/resources/event.rb
field :starts_at,
  as: :date_time,
  first_day_of_week: 0,
  disable_mobile: true,
  picker_options: { minDate: "today" }
```

Pass additional calendar settings through [`picker_options`](./date_time-api.html#picker_options). These customize the picker, not model validation. See the reference for settings Avo controls separately.

## Use common field options

The field also supports [common field options](../field-options.html), including [`link_to_record`](../field-options-api.html#link_to_record) to link the Index value to the record.
