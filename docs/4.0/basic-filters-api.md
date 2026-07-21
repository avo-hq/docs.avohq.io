---
feedbackId: 838
license: community
outline: [2, 3]
guide: ./basic-filters.html
prev:
  text: "Basic filters"
  link: "./basic-filters.html"
next: false
---

# Basic filters API

Per-option reference for basic filter classes. For task-oriented documentation and worked examples, see the [Basic filters guide](./basic-filters.html).

A basic filter is a class living in `app/avo/filters/` that inherits from one of five base classes, which determine the input the user sees and the shape of the value passed to `apply`:

| Base class | Input | Value shape in `apply` |
| --- | --- | --- |
| `Avo::Filters::BooleanFilter` | Checkboxes | `Hash` of `"option_id" => true/false` |
| `Avo::Filters::SelectFilter` | Dropdown | `String` (the selected option id) |
| `Avo::Filters::MultipleSelectFilter` | Multi-select | `Array` of `String`s |
| `Avo::Filters::TextFilter` | Text input | `String` |
| `Avo::Filters::DateTimeFilter` | flatpickr date/time picker | `String` (formatted date/time, or `"<start> to <end>"` in range mode) |

:::info
Filter values are serialized through the URL, so `apply` always receives strings — hashes arrive with stringified keys, regardless of how `options` declared them.
:::

## Class options

<Option name="`self.name`" headingSize="3">

The label displayed for the filter in the filters panel.

```ruby
self.name = "User names filter"
```

- **Type:** String or Proc
- **Default:** `"Filter"`

When given a block, it's evaluated through [`Avo::ExecutionContext`](./execution-context) and also has access to the registration [`arguments`](#arguments):

```ruby
self.name = -> { I18n.t("avo.filter.name") }
```

</Option>

<Option name="`self.button_label`" headingSize="3">

The label on the button that applies the filter.

```ruby
self.button_label = "Filter by user names"
```

- **Type:** String or Proc
- **Default:** `nil` — renders "Filter by \<name\>"

When given a block, it's evaluated through [`Avo::ExecutionContext`](./execution-context) and also has access to the registration [`arguments`](#arguments).

</Option>

<Option name="`self.visible`" headingSize="3">

Controls whether the filter shows up in the filters panel.

```ruby
self.visible = -> do
  current_user.admin?
end
```

- **Type:** Proc returning a boolean
- **Default:** `nil` — the filter is always visible

The block is evaluated through [`Avo::ExecutionContext`](./execution-context) with `resource`, `parent_resource`, `params`, and [`arguments`](#arguments) passed in, on top of the context's own `current_user`, `context`, `request`, and `view_context`.

</Option>

<Option name="`self.empty_message`" headingSize="3">

The message shown in the panel when [`options`](#options) returns an empty collection.

```ruby
self.empty_message = "Please select a country to view options."
```

- **Type:** String
- **Default:** `nil` — falls back to the localized `avo.no_options_available` ("No options available")

</Option>

## Instance methods

<Option name="`apply`" headingSize="3">

The only required method. Called when Avo fetches records for the <Index /> view; must return the (modified) query.

```ruby
def apply(request, query, value)
  query.where("LOWER(name) LIKE ?", "%#{value}%")
end
```

- **`request`** — the current request object, from which you can read `params`
- **`query`** — the Active Record relation Avo built to fetch the records; chain conditions onto it
- **`value`** / **`values`** — the user's choice(s), shaped per the [base class table](#basic-filters-api) above

</Option>

<Option name="`options`" headingSize="3">

Defines the choices offered to the user (checkbox filters, select filters, and multiple select filters). Returns a `Hash` of option id to label.

```ruby
def options
  {
    published: "Published",
    unpublished: "Unpublished"
  }
end
```

- **Default:** none — checkbox and select filters render empty (showing the [`empty_message`](#self.empty_message)) without it

The method body can run any Ruby — database queries, API calls. Inside it you have access to the [runtime objects](#runtime-objects) below, including [`applied_filters`](#applied_filters) for building filters that depend on each other.

</Option>

<Option name="`default`" headingSize="3">

The filter's pre-applied state on page load. Return the same shape `apply` expects for the filter type.

```ruby
def default
  {is_featured: true}
end
```

- **Default:** `nil` — no pre-applied state

Also settable as a class attribute (`self.default = {is_featured: true}`). Symbols are fine — the value is stringified before reaching `apply`. The same [runtime objects](#runtime-objects) are available as in `options`.

</Option>

<Option name="`react`" headingSize="3">

A hook for changing this filter's value in response to other filters. It runs after all filters are applied; return the new value for this filter (same shape `apply` expects), or `nil` to leave it unchanged.

```ruby
def react
  if applied_filters["Avo::Filters::CourseCountry"].present? && applied_filters["Avo::Filters::CourseCity"].blank?
    {"New York" => true}
  end
end
```

- **Default:** not defined — no reaction

See [React to other filters](./basic-filters.html#react-to-other-filters) for a worked example.

</Option>

## Runtime objects

These are available inside `apply`, `options`, `default`, and `react`.

<Option name="`applied_filters`" headingSize="3">

A `Hash` of the currently applied basic filters, keyed by filter class name (as a string), holding each filter's current value.

```ruby
applied_filters
# => {
#   "Avo::Filters::CourseCountry" => {
#     "USA" => true,
#     "Japan" => false
#   }
# }
```

</Option>

<Option name="`arguments`" headingSize="3">

The `arguments` hash passed when [registering the filter](#filter). Defaults to `{}`.

</Option>

<Option name="`params` / `request` / `view_context` / `current_user`" headingSize="3">

The current request's params, the request object, the Rails view context, and the current user, as configured by [`current_user_method`](./authentication.html#customize-the-current-user-method).

</Option>

## Date time filter options

Options specific to `Avo::Filters::DateTimeFilter`.

<Option name="`self.type`" headingSize="3">

The kind of input the picker renders.

```ruby
self.type = :date
```

- **Type:** Symbol
- **Default:** `:date_time`

| Value | Behavior |
| --- | --- |
| `:date_time` | Date and time selection |
| `:date` | Date selection only |
| `:time` | Time selection only (no calendar) |

<Image src="/assets/img/4_0/filters/datetime-date.webp" dark-src="/assets/img/4_0/filters/datetime-date-dark.webp" class="mt-2" width="1618" height="1207" alt="Avo date time filter with type date showing the Birthday filter and flatpickr calendar with a date selected, over the Users index table." />

</Option>

<Option name="`self.mode`" headingSize="3">

Whether the user picks a single value or a range.

```ruby
self.mode = :single
```

- **Type:** Symbol
- **Default:** `:range`

| Value | Behavior |
| --- | --- |
| `:range` | Start and end selection; `value` arrives as `"2024-08-13 to 2024-08-16"` — split with `value.split(" to ")` |
| `:single` | One date/time; `value` arrives as a single formatted string |

<Image src="/assets/img/4_0/filters/datetime-range.webp" dark-src="/assets/img/4_0/filters/datetime-range-dark.webp" class="mt-2" width="1618" height="1207" alt="Avo date time filter in range mode showing the Birthday filter and a selected date range in flatpickr, over the Users index table." />

</Option>

<Option name="`picker_format`" headingSize="3">

The [flatpickr format string](https://flatpickr.js.org/formatting/) used to serialize the picked value — which determines the format of `value` in `apply`.

- **Default:** derived from [`self.type`](#self.type)

| `self.type` | Default format |
| --- | --- |
| `:date` | `"Y-m-d"` |
| `:date_time` | `"Y-m-d H:i:S"` |
| `:time` | `"H:i:S"` |

Override the method to change it:

```ruby
def picker_format
  "Y-m-d"
end
```

</Option>

<Option name="`picker_options`" headingSize="3">

The full option hash handed to [flatpickr](https://flatpickr.js.org/options/). Override and merge onto `super` to customize the picker:

```ruby
def picker_options(value)
  super.merge({minuteIncrement: 3})
end
```

- **Default:** computed from [`self.type`](#self.type) and [`self.mode`](#self.mode) — sets `defaultDate`, `enableTime`, `enableSeconds`, `time_24hr`, `noCalendar`, `mode`, `dateFormat`, and `minuteIncrement`

:::warning
The returned hash is forwarded verbatim to flatpickr in the browser. Overriding keys like `mode` or `dateFormat` changes the value your `apply` method receives.
:::

</Option>

## Registration

<Option name="`filter`" headingSize="3">

Registers a filter class on a resource, inside the resource's `filters` method.

```ruby
def filters
  filter Avo::Filters::Published
  filter Avo::Filters::Name, arguments: {case_insensitive: true}
end
```

- **`arguments`** — optional `Hash` made available in the filter's `apply` and `options` methods and in the `self.name`, `self.button_label`, and `self.visible` blocks. Default: `{}`

</Option>

## URL encoding helpers

Basic filter state travels in the `encoded_filters` URL param as Base64-encoded JSON. These helpers convert between the two representations — useful for [linking to pre-filtered views](./basic-filters.html#link-to-a-pre-filtered-view).

<Option name="`encode_filter_params`" headingSize="3">

Rails view helper that encodes a filters hash into the serialized state Avo understands. Available in views and off `view_context`.

```ruby
encode_filter_params({"Avo::Filters::Name" => "Apple"})
# => "eyJBdm86OkZpbHRlcnM6Ok5hbWUiOiJBcHBsZSJ9\n"
```

</Option>

<Option name="`decode_filter_params`" headingSize="3">

Rails view helper that decodes the `encoded_filters` param back into a hash. Available in views and off `view_context`.

```ruby
decode_filter_params(params[:encoded_filters])
# => {"Avo::Filters::Name" => "Apple"}
```

</Option>

<Option name="`Avo::Filters::BaseFilter.encode_filters`" headingSize="3">

Standalone class method with the same behavior as `encode_filter_params`, usable anywhere.

```ruby
redirect_to avo.resources_users_path(
  encoded_filters: Avo::Filters::BaseFilter.encode_filters({"Avo::Filters::Name" => "Apple"})
)
```

</Option>

<Option name="`Avo::Filters::BaseFilter.decode_filters`" headingSize="3">

Standalone class method with the same behavior as `decode_filter_params`, usable anywhere.

```ruby
Avo::Filters::BaseFilter.decode_filters(params[:encoded_filters])
# => {"Avo::Filters::Name" => "Apple"}
```

</Option>
