---
license: community
field_type: time
default_format: TT
default_picker_format: H:i:S
---

# Time


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

<Image src="/assets/img/4_0/fields/time/form-picker.png" dark-src="/assets/img/4_0/fields/time/form-picker-dark.png" width="1520" height="280" alt="An Avo edit-form card containing a time field with the flatpickr time picker open, showing hours and minutes in 24-hour format without a calendar." prompt="time field on the edit form with the flatpickr time picker open showing hours and minutes without a calendar" />

## Options

<!-- @include: ./../common/date_all_common.md-->
<!-- @include: ./../common/date_time_time_common.md-->
