---
version: '2.18'
license: community
field_type: 'time'
default_format: 'TT'
default_picker_format: 'H:i:S'
---

# Time

<Image src="/assets/img/fields/time.png" width="1674" height="402" alt="" />

The `Time` field is similar to the [DateTime](./date_time) field. It uses the time picker of flatpickr (without the calendar).

```ruby
field :starting_at,
  as: :time,
  picker_format: 'H:i',
  format: "HH:mm",
  relative: true,
  picker_options: {
    time_24hr: true
  }
```

## Options

<!-- @include: ./../common/date_all_common.md-->
<!-- @include: ./../common/date_time_time_common.md-->
