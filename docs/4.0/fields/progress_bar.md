---
license: community
---

# Progress bar

The `ProgressBar` field renders a `progress` element on `Index` and `Show` views and and a `input[type=range]` element on `Edit` and `New` views.

```ruby
field :progress, as: :progress_bar
```
<Image src="/assets/img/4_0/fields/progress-index.png" dark-src="/assets/img/4_0/fields/progress-index-dark.png" width="288" height="144" alt="Progress bar custom field on index" />

## Options

<Option name="`max`">

Sets the maximum value of the progress bar.

#### Default

`100`

#### Possible values

Any number.
</Option>

<Option name="`step`">

Sets the step in which the user can move the slider on the `Edit` and `New` views.

#### Default

`1`

#### Possible values

Any number.
</Option>

<Option name="`display_value`">

Choose if the value is displayed on the `Edit` and `New` views above the slider.

<!-- @include: ./../common/default_boolean_true.md-->
</Option>

<Option name="`value_suffix`">

Set a string value to be displayed after the value above the progress bar.

#### Default

`nil`

#### Possible values

`%` or any other string.
</Option>

## Examples

```ruby
field :progress,
  as: :progress_bar,
  max: 150,
  step: 10,
  display_value: true,
  value_suffix: "%"
```

<Image src="/assets/img/4_0/fields/progress-edit.png" dark-src="/assets/img/4_0/fields/progress-edit-dark.png" width="951" height="58" alt="Progress bar custom field edit" />
