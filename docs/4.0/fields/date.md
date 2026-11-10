---
license: community
outline: [2, 3]
api_docs: ./date-api.html
default_format: yyyy-LL-dd
default_picker_format: Y-m-d
description: "The Date field may be used to display date values."
fieldTags: [date & time]
---

# Date

The `Date` field displays date values on index and show pages and provides a calendar picker on new and edit forms.

```ruby
# app/avo/resources/user.rb
field :birthday,
  as: :date,
  first_day_of_week: 1,
  picker_format: "F J Y",
  format: "yyyy-LL-dd",
  placeholder: "Feb 24th 1955"
```

Without additional options, dates display as `yyyy-LL-dd`, the picker displays `Y-m-d`, and the calendar starts on Monday. Mobile browsers can use their native date picker.

## Change how dates appear

Use [`format`](./date-api.html#format) for dates on index and show pages and [`picker_format`](./date-api.html#picker_format) for the visible input on new and edit forms. They use different token systems: [Luxon](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) for display and [flatpickr](https://flatpickr.js.org/formatting) for the picker.

```ruby
# app/avo/resources/user.rb
field :birthday, as: :date, format: "dd LLL yyyy", picker_format: "d M Y"
```

## Start the calendar on Sunday

Set [`first_day_of_week`](./date-api.html#first_day_of_week) to `0` for Sunday, or keep the default for Monday. The numbering follows [flatpickr's localization options](https://flatpickr.js.org/localization/).

```ruby
# app/avo/resources/user.rb
field :birthday, as: :date, first_day_of_week: 0
```

## Customize the calendar

Pass [flatpickr options](https://flatpickr.js.org/options) through [`picker_options`](./date-api.html#picker_options), for example to limit the selectable dates. Weekday and month names come from the app locale; a `locale` Hash in `picker_options` can override them.

```ruby
# app/avo/resources/user.rb
field :birthday, as: :date, picker_options: {maxDate: "today"}
```

## Use the same picker on mobile

By default, [flatpickr uses native mobile pickers](https://flatpickr.js.org/mobile-support/) when possible. Set [`disable_mobile`](./date-api.html#disable_mobile) to `true` to disable that native fallback and show flatpickr on mobile too.

```ruby
# app/avo/resources/user.rb
field :birthday, as: :date, disable_mobile: true
```

## Link dates to their records

Set `link_to_record: true` to make a date on the index page link to its record. See [common field options](../field-options.html) for this option, placeholders, and other shared field behavior.

For every date-specific option and its default, see the [Date API](./date-api.html).
