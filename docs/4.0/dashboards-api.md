---
license: addon
addon_link: https://avohq.io/addons/dashboards
outline: [2, 3]
guide: ./dashboards.html
prev:
  text: "Dashboards"
  link: "./dashboards.html"
next: false
---

# Dashboards API

Per-option reference for dashboards. For task-oriented documentation and worked examples, see the [Dashboards guide](./dashboards.html).

Options are class attributes set on the dashboard class. Any option can also be a Proc — it is evaluated through [`Avo::ExecutionContext`](./execution-context), where you gain access to all its attributes plus the `dashboard`.

```ruby
# app/avo/dashboards/dashy.rb
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"
  # options listed below

  def cards
    # register cards here
  end
end
```

## Identity and layout

<Option name="`self.id`" headingSize="3">

The dashboard's unique identifier. Used as the route param, so it must be unique across all dashboards.

```ruby
self.id = "dashy"
```

- **Type:** String
- **Default:** `nil`
- **Required:** yes

</Option>

<Option name="`self.name`" headingSize="3">

The title shown to the user at the top of the dashboard.

```ruby
self.name = "Dashy"
# or
self.name = -> { I18n.t("avo.dashboard_titles.dashy.name", default: "Dashy") }
```

- **Type:** String or Proc
- **Default:** `nil`

To localize this, prefer the `avo.dashboard_translations.<class_path>.name` key — see [Localization](./dashboards.html#localization). A Proc remains the fallback and is resolved on every render in the requesting user's locale. Note the namespace: core defines `avo.dashboards` as a *string* (the sidebar heading), so nesting keys under it replaces that string with a Hash and breaks the heading. Use `avo.dashboard_titles.*` or any other namespace.

</Option>

<Option name="`self.description`" headingSize="3">

Subtitle rendered under the dashboard name for extra context.

```ruby
self.description = "Key metrics at a glance"
```

- **Type:** String or Proc
- **Default:** `nil`

Like `self.name`, a Proc is resolved per request, so `-> { I18n.t("avo.dashboard_titles.dashy.description", default: "Key metrics at a glance") }` follows the user's locale. See [Localization](./dashboards.html#localization).

</Option>

<Option name="`self.grid_cols`" headingSize="3">

How many columns the card grid has.

```ruby
self.grid_cols = 4
```

- **Type:** Integer
- **Default:** `3`
- **Values:** `3`, `4`, `5`, or `6` — any other value falls back to `3`

</Option>

## Filters and ranges

<Option name="`def filters`" headingSize="3">

Declares the dashboard's filter bar. Each `filter` call adds one input, and cards read the values through `filters[:id]`. See [Filters](./dashboards#filters).

```ruby
def filters
  filter :range, type: :button_group, options: {"7D" => 7, "30D" => 30}, default: 30
  filter :active_only, type: :boolean, label: "Active only"
  filter :signed_up_after, type: :date
end
```

- **`type`:** `:button_group`, `:boolean`, `:date`, `:date_time`, `:date_range`, `:select` or `:chips`
- **`label`:** defaults to the humanized id
- **`options`:** `:button_group`, `:select` and `:chips`. A Hash of `label => value`, an Array of values, or a block
- **`default`:** the value cards get when nothing is picked. A value or a block
- **`visible`:** a block. A hidden filter ignores its URL value, so cards get its `default`
- **`include_blank`:** `:select` only. The label of an empty first option
- **`as_toggle`:** `:boolean` only. Renders a toggle instead of a checkbox. Default `false`

A filter named `:range` sets each card's [`range`](./cards#ranges) instead of `filters[:range]`.

</Option>

<Option name="`self.global_ranges`" headingSize="3">

**Deprecated**, removed in Avo 5. Use `filter :range, type: :button_group, options: [...]` in [`def filters`](./dashboards#filters) instead; it does the same thing. Setting it logs a warning.

Shorthand for `filter :range, type: :button_group, options: global_ranges`. Clicking a button reloads every card with that value as its [`range`](./cards#ranges), so pick values your cards' `query` already handles. Each button's label comes from the `avo.<value>` translation key, falling back to the humanized value.

```ruby
self.global_ranges = [7, 30, 60, 365]
```

- **Type:** Array of Integers or Strings
- **Default:** `[]` (no global range bar)

</Option>

<Option name="`self.refresh_button`" headingSize="3">

Renders a control next to the dashboard's title that reloads every card at once. Cards reload in place, so the page never navigates and each card keeps its selected range.

```ruby
self.refresh_button = true
```

- **Type:** Boolean
- **Default:** `false`

:::info
Off by default because refreshing a dashboard runs every card's query at once. The [per-card control](./cards-api.html#self.refresh_button) is a separate opt-in under the same name — setting one does not set the other.
:::

</Option>

## Header controls

<Option name="`self.controls`" headingSize="3">

<VersionReq package="avo-dashboards" version="4.3.4" />

Declares native header controls using `avo-custom_controls`. The block collects controls in declaration order; its HTML return value is not rendered.

```ruby
self.controls = -> {
  link_to "Home", main_app.root_path
  partial "avo/dashboards/controls", locals: {dashboard: dashboard}
  action Avo::Actions::ClearQueue
  actions_list
  refresh_button
}
```

- **Type:** Proc or `nil`
- **Default:** `nil`
- **Requires:** `avo-custom_controls` installed and `enabled_feature?("avo-custom_controls")` enabled on the license.
- **Context:** `dashboard`, `current_user`, `params`, `request`, `view_context`, `helpers`, `main_app`, and `avo` are available, including inside lists.
- **Inheritance:** inherited; assigning `nil` removes inherited controls.
- **Controls:** `link_to`, `list`, `divider`, `partial`, `action`, `actions_list`, `refresh_button`, and `default_controls`, which adds the actions dropdown and follows `self.refresh_button`. Lists cannot contain partials, nested lists, the actions dropdown, or the refresh button. Default resource buttons are unavailable.

The block replaces the whole header: `self.refresh_button` is ignored once it runs, unless the block calls `default_controls`. Without the gem or the license the block never runs and `self.refresh_button` works as usual. Dashboard authorization runs before evaluation. See the [header controls guide](./dashboards.html#add-header-controls) for forms and endpoint authorization.

</Option>

<Option name="`actions`" headingSize="3">

<VersionReq package="avo-dashboards" version="4.3.4" />

Declares the actions a dashboard can run. They render in an Actions dropdown in the header, unless `self.controls` takes the header over.

```ruby
def actions
  action Avo::Actions::ClearQueue, arguments: {queue: "mailers"}
  divider
  action Avo::Actions::Reindex, icon: "tabler/outline/refresh"
end
```

- **Signature:** `action(klass, arguments: {}, icon: nil)` and `divider(label: nil)`
- **Handle:** `handle` receives `dashboard:`, and no records.
- **Authorization:** the dashboard's `self.authorize` and the action's `authorize` both have to pass.
- **Fields:** every field type except `belongs_to` and `trix`, which need a resource.

See the [actions guide](./dashboards.html#run-actions-from-the-header).

</Option>

## Visibility and authorization

<Option name="`self.visible`" headingSize="3">

Controls whether the dashboard appears in the sidebar and can be reached. As a Proc it is evaluated through [`Avo::ExecutionContext`](./execution-context), so you have access to `params`, `current_user`, `context`, and `dashboard`.

```ruby
self.visible = -> { current_user.admin? }
```

- **Type:** Boolean or Proc
- **Default:** `true`

:::info
A dashboard that fails [`authorize`](#self.authorize) is treated as not visible regardless of this option.
:::

</Option>

<Option name="`self.authorize`" headingSize="3">

Authorization gate for the dashboard. Return a falsy value to deny access. Evaluated through [`Avo::ExecutionContext`](./execution-context), with access to `current_user`, `params`, `request`, `context`, and `view_context`.

```ruby
self.authorize = -> { current_user.is_admin? }
```

- **Type:** Proc
- **Default:** `-> { true }`

</Option>
