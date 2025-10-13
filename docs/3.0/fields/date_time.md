---
version: '1.0'
license: community
field_type: 'date_time'
default_format: 'yyyy-LL-dd TT'
default_picker_format: 'Y-m-d H:i:S'
---

# DateTime

<Image src="/assets/img/fields/date-time.jpg" width="712" height="416" alt="DateTime field" />

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

<!-- @include: ./../common/date_all_common.md-->
<!-- @include: ./../common/date_date_time_common.md-->
<!-- @include: ./../common/date_time_time_common.md-->
