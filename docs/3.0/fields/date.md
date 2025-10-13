---
version: '1.0'
license: community
default_format: 'yyyy-LL-dd'
default_picker_format: 'Y-m-d'
---

# Date

The `Date` field may be used to display date values.

```ruby
field :birthday,
  as: :date,
  first_day_of_week: 1,
  picker_format: "F J Y",
  format: "yyyy-LL-dd",
  placeholder: "Feb 24th 1955"
```

## Options

<!-- @include: ./../common/date_all_common.md-->
<!-- @include: ./../common/date_date_time_common.md-->
