<Option name="`time_24hr`">

Displays time picker in 24-hour mode or AM/PM selection.

<!-- @include: ./../common/default_boolean_false.md -->
</Option>

<Option name="`relative`">

If `true`, the time will be relative to the configured `timezone`. If the timezone is not configured, the browser's timezone will be used.

If `false`, the time will be displayed as absolute in UTC and not change based on the browser's or configured timezone.

<!-- @include: ./../common/default_boolean_true.md -->
</Option>

<Option name="`timezone`">

Select in which timezone the values should be cast.

:::warning
This option is only taken into account if the `relative` option is `true`.
:::

#### Default

If nothing is selected, the browser's timezone will be used.

#### Possible values

[TZInfo identifiers](https://api.rubyonrails.org/classes/ActiveSupport/TimeZone.html).

```ruby-vue{1,3}
field :start, as: :{{ $frontmatter.field_type }}, relative: true, timezone: "EET"
# Or
field :start, as: :{{ $frontmatter.field_type }}, relative: true, timezone: -> { record.timezone }
```
</Option>
