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
self.name = -> { I18n.t("avo.dashboards.dashy.name") }
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`self.description`" headingSize="3">

Subtitle rendered under the dashboard name for extra context.

```ruby
self.description = "Key metrics at a glance"
```

- **Type:** String or Proc
- **Default:** `nil`

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

## Ranges

<Option name="`self.global_ranges`" headingSize="3">

Renders a row of range buttons at the top of the dashboard that update every card's range at once. Each entry is a number of days; its button label comes from the `avo.<days>` translation key.

```ruby
self.global_ranges = [7, 30, 60, 365]
```

- **Type:** Array of Integers
- **Default:** `[]` (no global range bar)

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
