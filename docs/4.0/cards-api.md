---
license: pro
outline: [2, 3]
guide: ./cards.html
prev:
  text: "Cards"
  link: "./cards.html"
next: false
---

# Cards API

Per-option reference for cards. For task-oriented documentation and worked examples, see the [Cards guide](./cards.html).

Options are class attributes set on the card class. Unless noted, any option can also be a Proc — it is evaluated through [`Avo::ExecutionContext`](./execution-context), where you gain access to all its attributes plus `parent`, `resource`, `dashboard`, `card`, `arguments`, and `params`.

```ruby
# app/avo/cards/users_metric.rb
class Avo::Cards::UsersMetric < Avo::Cards::MetricCard
  self.id = "users_metric"
  self.label = "Users count"
  # options listed below
end
```

## Base settings

Available on every card type.

<Option name="`self.id`" headingSize="3">

The card's unique identifier. Used to build the card's Turbo frame and paths, so it must be unique across the parent.

```ruby
self.id = "users_metric"
```

- **Type:** String
- **Default:** `nil`
- **Required:** yes

</Option>

<Option name="`self.label`" headingSize="3">

The card's title, rendered at the top of the card.

```ruby
self.label = "Users count"
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`self.description`" headingSize="3">

Renders directly under the title as a subtitle. Use it for context that should always be visible at a glance.

```ruby
self.description = "Across all teams and workspaces"
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`self.discreet_description`" headingSize="3">

Renders a small info icon in the bottom-right corner of the card; hovering it shows the text as a tooltip. Use it for secondary context — methodology notes, data-source disclaimers, definitions.

```ruby
self.discreet_description = "Counts only active, non-deleted users."
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`self.cols`" headingSize="3">

How many columns of the parent's grid the card spans.

```ruby
self.cols = 2
```

- **Type:** Integer (or Proc returning one)
- **Default:** `1`
- **Values:** `1` to `6`

</Option>

<Option name="`self.rows`" headingSize="3">

How many rows of the parent's grid the card spans. On [table](#self.fields) and [list](#self.fields) cards it also caps the card's height — rows past the cap scroll inside the card.

```ruby
self.rows = 2
```

- **Type:** Integer (or Proc returning one)
- **Default:** `1`
- **Values:** `1` to `6`

</Option>

<Option name="`self.display_header`" headingSize="3">

Whether the card header (label and ranges dropdown) is rendered. Set it to `false` to let embedded content — a map, an iframe — fill the whole card flush to its edges.

```ruby
self.display_header = false
```

- **Type:** Boolean
- **Default:** `true`

</Option>

<Option name="`self.visible`" headingSize="3">

Controls whether the card renders. As a Proc it has access to `context`, `params`, `parent`, `dashboard` (nil when the parent is a resource), `resource` (nil when the parent is a dashboard), and `card`.

```ruby
self.visible = -> { current_user.admin? }
```

- **Type:** Boolean or Proc
- **Default:** `true`

</Option>

<Option name="`self.refresh_every`" headingSize="3">

Auto-refreshes the card on an interval. Pass a duration; Avo reloads the card in the background.

```ruby
self.refresh_every = 10.minutes
```

- **Type:** `ActiveSupport::Duration` (or seconds as an Integer)
- **Default:** `nil`

:::warning
On [table](#self.fields)/[list](#self.fields) cards a refresh reloads the whole card, resetting the scroll position of a tall table. Prefer it on short cards.
:::

</Option>

## Ranges

Let the user query data across different time ranges via a dropdown in the card header.

<Option name="`self.ranges`" headingSize="3">

The options shown in the range dropdown. The value is passed straight to Rails' [`options_for_select`](https://apidock.com/rails/v5.2.3/ActionView/Helpers/FormOptionsHelper/options_for_select), so it behaves like a `select_tag`. Integers are treated as a number of days; other strings (`"TODAY"`, `"MTD"`, `"ALL"`, …) are passed through as-is and it's up to your `query` to interpret them.

```ruby
self.ranges = {
  "7 days": 7,
  "30 days": 30,
  "Year to date": "YTD",
  All: "ALL"
}
```

- **Type:** Array or Hash
- **Default:** `[]`

</Option>

<Option name="`self.initial_range`" headingSize="3">

The range selected by default when the card first loads. Falls back to the first entry of [`ranges`](#self.ranges).

```ruby
self.initial_range = 30
```

- **Type:** matches a [`ranges`](#self.ranges) value
- **Default:** `nil`

</Option>

## Metric card

`Avo::Cards::MetricCard` displays a single big number returned from `query`/`result`.

<Option name="`self.prefix`" headingSize="3">

Text rendered before the value (e.g. a currency symbol).

```ruby
self.prefix = "$"
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`self.suffix`" headingSize="3">

Text rendered after the value (e.g. `%`).

```ruby
self.suffix = "%"
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`self.format`" headingSize="3">

Formats the value returned by `result` before display. The block runs through [`Avo::ExecutionContext`](./execution-context) with `value` (the raw result) in scope and Rails' `NumberHelper` plus `Avo::ApplicationHelper` mixed in, so helpers like `number_to_currency` and `number_to_social` are available directly.

```ruby
self.format = -> { number_to_social value, start_at: 1_000 }
```

- **Type:** Proc
- **Default:** `-> { number_to_social value.to_i, start_at: 10_000 }`

</Option>

## Chartkick card

`Avo::Cards::ChartkickCard` renders a chart via the [chartkick](https://github.com/ankane/chartkick) gem, which you must add to your `Gemfile`.

<Option name="`self.chart_type`" headingSize="3">

The kind of chart to render.

```ruby
self.chart_type = :area_chart
```

- **Type:** Symbol
- **Default:** `nil`
- **Values:** `:line_chart`, `:pie_chart`, `:column_chart`, `:bar_chart`, `:area_chart`, `:scatter_chart`

</Option>

<Option name="`self.chart_options`" headingSize="3">

Extra [chartkick options](https://github.com/ankane/chartkick#options) merged on top of Avo's defaults — use it for anything not covered by [`flush`](#self.flush), [`legend`](#self.legend), and friends. As a Proc it has access to `parent`, `arguments`, and `result_data`.

```ruby
self.chart_options = {
  library: { plugins: { legend: { display: true } } }
}
```

- **Type:** Hash or Proc returning a Hash
- **Default:** `{}`

:::info
The class attribute is `chart_options`. `chartkick_options` is the internal, read-only method that merges your `chart_options` into Avo's defaults — you don't set it.
:::

</Option>

<Option name="`self.flush`" headingSize="3">

Offsets chartkick's built-in padding so the chart sits flush inside the card. Set it to `false` to render the chart with its default padding and unlock [`scale`](#self.scale), [`legend`](#self.legend), [`legend_on_left`](#self.legend_on_left), and [`legend_on_right`](#self.legend_on_right).

```ruby
self.flush = false
```

- **Type:** Boolean
- **Default:** `true`

</Option>

<Option name="`self.legend`" headingSize="3">

Shows the chart legend. Takes effect once [`flush`](#self.flush) is `false`.

```ruby
self.legend = true
```

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`self.scale`" headingSize="3">

Shows the chart's axis scales. Takes effect once [`flush`](#self.flush) is `false`.

```ruby
self.scale = true
```

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`self.legend_on_left`" headingSize="3">

Positions the legend on the left. Takes effect once [`flush`](#self.flush) is `false`.

```ruby
self.legend_on_left = true
```

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`self.legend_on_right`" headingSize="3">

Positions the legend on the right. Takes effect once [`flush`](#self.flush) is `false`.

```ruby
self.legend_on_right = true
```

- **Type:** Boolean
- **Default:** `false`

</Option>

## Partial card

`Avo::Cards::PartialCard` renders a custom partial.

<Option name="`self.partial`" headingSize="3">

Path to the partial that renders the card's body.

```ruby
self.partial = "avo/cards/map_card"
```

- **Type:** String
- **Default:** `nil`

</Option>

## HTML card

<VersionReq version="4.1" />

`Avo::Cards::HtmlCard` builds its body from Ruby instead of a partial file. It has no extra class attributes — you implement a `body` method.

<Option name="`body`" headingSize="3">

Instance method returning the card's content. Every view helper (`tag`, `safe_join`, `link_to`, `number_to_currency`, `render`, `main_app`, …) is available directly on the card. The return value is resolved by shape:

| Return value | Rendered as |
| --- | --- |
| `ActiveSupport::SafeBuffer` (tag helpers, explicit `render`) | passed through untouched |
| `String` | compiled as an inline ERB template, with `card` as a local |
| anything else (a component instance, a `{partial:}` hash) | passed to `render` |

```ruby
def body
  tag.div class: "px-4 py-2" do
    tag.strong(number_to_currency(149.99))
  end
end
```

- **Type:** instance method
- **Required:** yes — raises `NotImplementedError` if undefined

:::warning
Inline template strings go through ActionView, so interpolated ERB values are HTML-escaped as usual. Never build the template string itself from user input — pass dynamic values through ERB tags or `locals:`, not Ruby string interpolation.
:::

</Option>

## Data cards (table & list)

<VersionReq version="4.1" />

`Avo::Cards::TableCard` and `Avo::Cards::ListCard` both inherit from `Avo::Cards::DataCard`: you declare columns with `fields` and return records from `query`. The table card renders a `<table>` with column headers; the list card renders a `<ul>` with no headers, the first field as each row's primary content and the rest trailing at the end edge.

The records you return must have an Avo resource registered for their model — cells render through it using the same components as the resource `<Index />` view.

<Option name="`self.fields`" headingSize="3">

Instance method declaring the card's columns, using the same `field` DSL as resources. Each field becomes one cell per row; every field type and option (`format_using`, `link_to_record`, badge `options:`, computed blocks, …) behaves as it does on an index table.

```ruby
def fields
  field :name, as: :text, name: "User", link_to_record: true
  field :active, as: :badge, options: {success: "Active"} do
    record.active? ? "Active" : "Inactive"
  end
end
```

- **Type:** instance method
- **Note:** an invalid field configuration raises `ArgumentError`

</Option>

<Option name="`self.query`" headingSize="3">

Instance method returning the records, wrapped in `result`. There is no pagination or sorting — cap the row count with `limit`. The selected [`range`](#self.ranges) is available as `range`.

```ruby
def query
  result User.order(created_at: :desc).limit(10)
end
```

- **Type:** instance method

</Option>

<Option name="`self.row_url`" headingSize="3">

When set, every row becomes a link. The block runs per row with `record` in scope and returns either a URL string or a Hash — following the same semantics as [discreet information](./resources-api#self.discreet_information).

```ruby
self.row_url = -> {
  {url: record_path(record), target: :_blank, tooltip: "View #{record.name}"}
}
```

- **Type:** Proc
- **Default:** `nil`
- **Returns:** a URL String, or `{url:, target:, tooltip:}` (each value may itself be a Proc receiving `record`)
- **Values:** `url` accepts `http`, `https`, `mailto`, and relative URLs; anything else (e.g. `javascript:`) is ignored

</Option>

<Option name="`self.density`" headingSize="3">

Vertical spacing of the rows.

```ruby
self.density = :tight
```

- **Type:** Symbol (or Proc returning one)
- **Default:** the global [`config.density`](./customization-api.html#density), or `:normal`
- **Values:** `:tight`, `:normal`, `:relaxed`

</Option>

<Option name="`self.empty_message`" headingSize="3">

Message shown when `query` returns no rows.

```ruby
self.empty_message = "No sign-ups this week"
```

- **Type:** String or Proc
- **Default:** the translated `avo.no_item_found`

</Option>

## Registration overrides

When you register a card on a parent you can override its settings inline, without editing the card class. This is how you reuse one card class with different labels, ranges, or queries.

<Option name="`card`" headingSize="3">

Registers a card on a dashboard or resource. Every keyword overrides the card's own attribute for that registration.

```ruby
def cards
  card Avo::Cards::UsersCount,
    label: "Active users",
    description: "Active users count",
    cols: 2,
    rows: 2,
    visible: -> { true },
    refresh_every: 2.minutes,
    chart_options: {library: {plugins: {legend: {display: true}}}},
    arguments: {active_users: true}
end
```

- **Overridable keys:** `label`, `description`, `discreet_description`, `cols`, `rows`, `refresh_every`, `visible`, `chart_options`, `arguments`

</Option>

<Option name="`arguments`" headingSize="3">

Arbitrary data forwarded from the registration to the card, readable as `arguments` inside the card's methods. Use it to parameterize one card class instead of duplicating it.

```ruby
# on the parent
card Avo::Cards::UsersCount, arguments: {active_users: true}

# in the card
def query
  scope = User
  scope = scope.active if arguments[:active_users].present?
  result scope.count
end
```

- **Type:** Hash
- **Default:** `{}`

</Option>

## Dividers

Separate cards with a divider, declared in the `cards` method.

<Option name="`divider`" headingSize="3">

Adds a divider between cards. With a `label` it shows text; with `invisible: true` it adds spacing but draws no line or label.

```ruby
def cards
  card Avo::Cards::ExampleColumnChart
  divider label: "Custom partials"
  card Avo::Cards::MapCard
end
```

- **`label`:** String — text shown on the divider. Default `nil`.
- **`invisible`:** Boolean — when `true`, renders no border or label. Default `false`.
- **`visible`:** Boolean or Proc — conditionally show the divider. Default `true`. As a Proc it has access to `context`, `params`, `parent`, `dashboard`, and `resource`.

</Option>
