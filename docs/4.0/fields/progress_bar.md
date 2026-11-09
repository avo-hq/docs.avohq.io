---
license: community
description: "Renders a progress bar on the Index and Show views and a range slider on the Edit and New views."
fieldTags: [number]
outline: [2, 3]
api_docs: ./progress_bar-api.html
---

# Progress bar

The `progress_bar` field displays a number as a progress bar on Index and Show views and lets users change it with a range slider on Edit and New views.

```ruby
# app/avo/resources/project.rb
field :progress, as: :progress_bar
```

By default, the range runs from 0 to 100 with increments of 1, and the numeric value is hidden.

<Image src="/assets/img/4_0/fields/progress_bar/index.webp" dark-src="/assets/img/4_0/fields/progress_bar/index-dark.webp" width="1776" height="758" alt="An Avo index table with ID, Name and Progress columns where each row shows a progress bar with its percentage value." prompt="progress bar on the index table" />

## Set the range and slider increments {#options}

<span id="max"></span>
<span id="step"></span>

If your values use a scale other than 100, set [`max`](./progress_bar-api.html#max). Use [`step`](./progress_bar-api.html#step) to control the slider increments on Edit and New. The minimum is fixed at 0.

## Show the value and its units {#examples}

<span id="display_value"></span>
<span id="value_suffix"></span>

Enable [`display_value`](./progress_bar-api.html#display_value) to show the number beside the bar on Index and Show and above the slider on Edit and New. Add [`value_suffix`](./progress_bar-api.html#value_suffix) for units such as `%`; the suffix is only visible when the value is displayed and does not change the stored number.

```ruby
# app/avo/resources/project.rb
field :progress,
  as: :progress_bar,
  max: 150,
  step: 10,
  display_value: true,
  value_suffix: "%"
```

<Image src="/assets/img/4_0/fields/progress_bar/form.webp" dark-src="/assets/img/4_0/fields/progress_bar/form-dark.webp" width="1520" height="256" alt="An Avo edit-form card containing a progress_bar field showing the value above a range slider configured with max 150, step 10 and a percent suffix." prompt="progress bar slider with max, step and suffix on edit form" />

For shared settings such as visibility and read-only behavior, see [Common field options](../field-options.html).
