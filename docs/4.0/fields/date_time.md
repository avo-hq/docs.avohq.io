---
license: community
field_type: date_time
default_format: "yyyy-LL-dd TT"
default_picker_format: "Y-m-d H:i:S"
---

# DateTime

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

<Image src="/assets/img/4_0/fields/date-time.webp" dark-src="/assets/img/4_0/fields/date-time-dark.webp" width="536" height="390" alt="DateTime field" />

## Options

<!-- @include: ./../common/date_all_common.md-->
<!-- @include: ./../common/date_date_time_common.md-->
<!-- @include: ./../common/date_time_time_common.md-->
