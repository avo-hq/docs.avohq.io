---
license: community
outline: [2, 3]
api_docs: ./time-api.html
field_type: time
default_format: TT
default_picker_format: H:i:S
description: "The Time field is similar to the DateTime field."
fieldTags: [date & time]
---

# Time

The `Time` field displays a time on Index and Show pages and provides a [flatpickr](https://flatpickr.js.org/) time picker without a calendar on New and Edit pages. Use it for a time of day; use [DateTime](./date_time) when the date matters too.

```ruby
# app/avo/resources/event.rb
field :starting_at,
  as: :time,
  picker_format: "H:i",
  format: "HH:mm",
  time_24hr: true
```

Without extra configuration, times use the browser's timezone, the display format is `TT`, and the picker format is `H:i:S`. The picker uses AM/PM selection by default.

<Image src="/assets/img/4_0/fields/time/form-picker.webp" dark-src="/assets/img/4_0/fields/time/form-picker-dark.webp" width="1520" height="280" alt="An Avo edit-form card containing a time field with the flatpickr time picker open, showing hours and minutes in 24-hour format without a calendar." prompt="time field on the edit form with the flatpickr time picker open showing hours and minutes without a calendar" />

## Change how times look

Set [`format`](./time-api.html#format) for Index and Show using [Luxon formatting tokens](https://moment.github.io/luxon/#/formatting?id=table-of-tokens). Set [`picker_format`](./time-api.html#picker_format) separately for New and Edit using [flatpickr tokens](https://flatpickr.js.org/formatting), as in the example above. To change it for every field at once, set [`config.time_format`](../customization.html#date-and-time-formats) in the initializer.

Enable [`time_24hr`](./time-api.html#time_24hr) for 24-hour picker controls. This does not change the Index or Show format.

## Keep the same clock time for everyone

If a time must stay fixed rather than shift with the viewer's timezone, set [`relative`](./time-api.html#relative) to `false`.

```ruby
# app/avo/resources/event.rb
field :starting_at, as: :time, relative: false
```

If everyone should instead see the time in one specific timezone, leave conversion enabled and set [`timezone`](./time-api.html#timezone):

```ruby
# app/avo/resources/event.rb
field :starting_at, as: :time, timezone: "America/Los_Angeles"
```

For a record-specific timezone, use `timezone: -> { record.timezone }`.

:::warning Time-only conversion
With `relative: true`, Avo uses today's date when converting the time from UTC. The timezone offset can therefore change with daylight saving time. Use DateTime for a timestamp tied to a particular date.
:::

## Customize the time picker

Pass additional [flatpickr options](https://flatpickr.js.org/options) through [`picker_options`](./time-api.html#picker_options). For example, restrict the hours offered by the picker:

```ruby
# app/avo/resources/event.rb
field :starting_at,
  as: :time,
  picker_options: { minTime: "09:00", maxTime: "17:00" }
```

These settings constrain the picker, not server-side model validation. See the reference for settings Avo controls separately.

To use flatpickr instead of the native mobile picker, set [`disable_mobile`](./time-api.html#disable_mobile) to `true`. See [flatpickr's mobile support](https://flatpickr.js.org/mobile-support/).

## Use common field options

The field also supports [common field options](../field-options.html), including `link_to_record` to link the Index value to the record.
