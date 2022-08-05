---
version: '2.0'
license: community
---

# Progress bar

The `ProgressBar` field renders a `progress` element on `index` and `show` views and and a `input[type=range]` element on forms.

```ruby
field :progress, as: :progress_bar
```
<img :src="('/assets/img/custom-fields/progress-index.jpg')" alt="Progress bar custom field on index" class="border mb-4" />

The field takes four options. The `max` option sets the maximum value and `step` for the stepping interval.

Using the `display_value` option you can choose to show the value above the progress bar. You can even add the `%` suffix using the `value_suffix` option.

```ruby
field :progress, as: :progress_bar, max: 150, step: 10, display_value: true, value_suffix: "%"
```

<img :src="('/assets/img/custom-fields/progress-edit.jpg')" alt="Progress bar custom field edit" class="border mb-4" />
