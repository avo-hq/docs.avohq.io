---
feedbackId: 833
license: addon
addon_link: https://avohq.io/addons/dashboards
outline: [2, 3]
api_docs: ./dashboards-api.html
---

# Dashboards

:::warning
You must manually require the `chartkick` gem in your `Gemfile`.

```ruby
# Create beautiful JavaScript charts with one line of Ruby
gem "chartkick"
```
:::

There comes the point in your app's life when you need to display the data in an aggregated form like a metric or chart. That's what Avo's Dashboards are all about.

## Generate a dashboard

Run `bin/rails g avo:dashboard my_dashboard` to get a shiny new dashboard.

```ruby
class Avo::Dashboards::MyDashboard < Avo::Dashboards::BaseDashboard
  self.id = 'my_dashboard'
  self.name = 'Dashy'
  self.description = 'The first dashboard'
  self.grid_cols = 3

  def cards
    card Avo::Cards::ExampleMetric
    card Avo::Cards::ExampleAreaChart
    card Avo::Cards::ExampleScatterChart
    card Avo::Cards::PercentDone
    card Avo::Cards::AmountRaised
    card Avo::Cards::ExampleLineChart
    card Avo::Cards::ExampleColumnChart
    card Avo::Cards::ExamplePieChart
    card Avo::Cards::ExampleBarChart
    divider label: "Custom partials"
    card Avo::Cards::ExampleCustomPartial
    card Avo::Cards::MapCard
  end
end
```

<Image src="/assets/img/4_0/dashboards/dashboard.webp" dark-src="/assets/img/4_0/dashboards/dashboard-dark.webp" width="2880" height="1800" alt="An Avo dashboard named Dashy with the sidebar visible, showing a viewport of its card grid — metrics, charts (area, scatter, line, column, pie, bar), Percent done and Amount raised." prompt="a dashboard overview page with its cards" />

## Settings

Each dashboard is a file. It holds information about itself like the `id`, `name`, `description`, and how many columns its grid has.

The [`id`](dashboards-api#self.id) field has to be unique. The [`name`](dashboards-api#self.name) is what the user sees in big letters on top of the page, and the [`description`](dashboards-api#self.description) is some text you pass to give the user more details regarding the dashboard.

Both `name` and `description` accept a Proc, evaluated through [`Avo::ExecutionContext`](execution-context) with access to all its attributes plus the `dashboard` — which is how you [localize them](#localization):

```ruby
self.name = -> { I18n.t("avo.dashboard_titles.dashy", default: "Dashy") }
```

Use the [`grid_cols`](dashboards-api#self.grid_cols) parameter to organize the cards in a grid of `3`, `4`, `5`, or `6` columns. The default is `3`.

## Filters

Render a filter bar above the cards with `def filters`. Every card reloads with the new values when one changes, and the values stay in the page URL, so a reload or a shared link keeps them.

```ruby
class Avo::Dashboards::Sales < Avo::Dashboards::BaseDashboard
  self.id = "sales"

  def filters
    filter :range, type: :button_group, options: {"7D" => 7, "30D" => 30, "1Y" => 365}, default: 30
    filter :active_only, type: :boolean, label: "Active only", as_toggle: true
    filter :signed_up_after, type: :date
    filter :since, type: :date_time
    filter :period, type: :date_range, default: -> { 30.days.ago.to_date..Date.current }
    filter :country, type: :select, options: -> { Country.pluck(:name, :code) }, include_blank: "All countries"
    filter :plans, type: :chips, options: {"Free" => "free", "Pro" => "pro", "Team" => "team"}
    filter :internal_only, type: :boolean, visible: -> { current_user.admin? }
  end

  def cards
    card Avo::Cards::UsersCount
  end
end
```

Cards read the values through `filters`, already cast to the filter's type and with the `default` applied:

```ruby
class Avo::Cards::UsersCount < Avo::Cards::MetricCard
  def query
    scope = User.where(created_at: range.to_i.days.ago..)
    scope = scope.where(active: true) if filters[:active_only]
    scope = scope.where(created_at: filters[:signed_up_after]..) if filters[:signed_up_after]
    scope = scope.where(created_at: filters[:period]) if filters[:period]
    scope = scope.where(country: filters[:country]) if filters[:country]
    scope = scope.where(plan: filters[:plans]) if filters[:plans].present?

    result scope.count
  end
end
```

| Type            | Renders                       | `filters[:id]` holds                                        |
| --------------- | ----------------------------- | ----------------------------------------------------------- |
| `:button_group` | One radio per option          | The picked option's value, as declared                      |
| `:boolean`      | A checkbox, or a toggle       | `true` or `false`                                           |
| `:date`         | A date picker                 | A `Date`                                                    |
| `:date_time`    | A date and time picker        | An `ActiveSupport::TimeWithZone`, in `Time.zone`            |
| `:date_range`   | Two date pickers (from, to)   | A `Range` of `Date`s; open-ended when one side is empty     |
| `:select`       | A dropdown                    | The picked option's value, as declared                      |
| `:chips`        | One checkbox per option       | An `Array` of the picked values; `[]` when all are cleared  |

Each filter is a pill showing its current pick; clicking it opens a dropdown with the input. A `:boolean` filter toggles in place instead. Every type returns the `default` when nothing is picked.

| Option           | What it does                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `label`          | Defaults to the humanized id                                                              |
| `options`        | `:button_group`, `:select` and `:chips`. A Hash of `label => value`, an Array of values, or an Array of `[label, value]` pairs |
| `default`        | What cards get when nothing is picked                                                     |
| `visible`        | Hides the filter. A hidden filter ignores its URL value, so cards always get its `default` |
| `include_blank`  | `:select` only. Adds an empty first option with this label                                |
| `as_toggle`      | `:boolean` only. Renders a toggle instead of a checkbox, like the boolean field's option  |

`options`, `default` and `visible` also take a block, run per request with `current_user`, `params` and `dashboard` in scope. Array values label themselves through the `avo.<value>` translation key, falling back to the humanized value.

### The `range` filter

A filter named `:range` sets each card's [`range`](cards#ranges), the same value the card's own range dropdown sets. A card's `query` reads it through `range` and its dropdown shows the pick, so use values the cards already handle.

:::warning
`self.global_ranges` is deprecated and will be removed in Avo 5. It still renders a `:range` button group and logs a warning. Move it to `def filters`:

```ruby
self.global_ranges = [7, 30, 60, 365] # [!code --]
def filters # [!code ++]
  filter :range, type: :button_group, options: [7, 30, 60, 365] # [!code ++]
end # [!code ++]
```
:::

## Localization

The shortest path is a locale key. Avo resolves `avo.dashboard_translations.<class_path>.{name,description}` before falling back to the class attribute, the same way it does for [resources and actions](./i18n.html#localizing-scopes-cards-and-dashboards):

```yaml
# config/locales/avo.sv.yml
sv:
  avo:
    dashboard_translations:
      dashy:
        name: Instrumentpanel
        description: Nyckeltal
```

```ruby
# app/avo/dashboards/dashy.rb
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"           # the fallback when no translation is present
  # Optional. Defaults to avo.dashboard_translations.dashy
  # self.translation_key = "avo.dashboard_translations.dashy"
end
```

Note the namespace: `avo.dashboard_translations`, **not** a subtree under `avo.dashboards` — see the warning below for why that distinction matters.

### Or assign a callable

The class attribute stays available and still resolves per request:

A dashboard's `name` and `description` accept a callable, resolved on **every render** in the requesting user's locale. Assign a lambda that calls `I18n.t`:

```ruby{4-5}
# app/avo/dashboards/dashy.rb
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = -> { I18n.t("avo.dashboard_titles.dashy.name", default: "Dashy") }
  self.description = -> { I18n.t("avo.dashboard_titles.dashy.description", default: "Key metrics") }
end
```

```yaml
# config/locales/avo.dashboards.sv.yml
sv:
  avo:
    dashboard_titles:
      dashy:
        name: Instrumentpanel
        description: Nyckeltal
```

The key paths are spelled in full above on purpose: the lookups are `avo.dashboard_titles.dashy.name` and `avo.dashboard_titles.dashy.description`.

Your dashboard's [cards](./cards.html#localization) are localized the same way.

:::danger Do not nest keys under `avo.dashboards`
Avo core defines **`avo.dashboards` as a single string** — it is the "Dashboards" heading above the dashboard list in the sidebar. Adding `avo.dashboards.dashy.name` to your locale file replaces that string with a Hash, and the sidebar heading breaks:

```ruby
I18n.t("avo.dashboards")
# => "Dashboards"

# after your locale file adds avo.dashboards.dashy.name:
I18n.t("avo.dashboards")
# => {dashy: {name: "Dashy"}}   ← the sidebar heading now renders a Hash
```

Use any other namespace — `avo.dashboard_titles.*` above, or one of your own outside `avo` entirely. Earlier versions of this page suggested `avo.dashboards.dashy.name`; if you followed it, move those keys.
:::

:::warning Always pass a String `default:`
Under a locale your app has not translated, a lookup with no `default:` renders `Translation missing: …` as the dashboard title, and Avo does not fall back to English for you unless you have configured `config.i18n.fallbacks`.
:::

Because the callable re-resolves per request — which is what makes it follow the locale — keep it cheap. An `I18n.t` lookup is fine; a query is not.

## Refresh every card at once

A card can carry [its own refresh control](cards#refresh-a-card-on-demand). A dashboard can also carry a single control that refreshes all of them together — useful on a screen someone leaves up all day. Turn it on with [`refresh_button`](dashboards-api#self.refresh_button):

```ruby{4}
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"
  self.refresh_button = true

  def cards
    card Avo::Cards::UsersCount
  end
end
```

The control appears next to the dashboard's title and reloads each card in place, so the page never navigates — scroll position and every card's selected range survive the refresh.

It's off by default, as the [per-card control](cards-api#self.refresh_button) is. Refreshing a whole dashboard runs every card's query at once, so it's worth opting in deliberately on dashboards with expensive cards.

Setting it here does not turn on the per-card controls; the two are independent, and a dashboard button reloads every card whether or not the cards carry one.

## Add header controls

<VersionReq package="avo-dashboards" version="4.3.4" />

Install `avo-custom_controls` alongside `avo-dashboards`, with a license that enables custom controls. Assign [`self.controls`](./dashboards-api.html#self.controls) to declare links, dropdowns, and partials in the native header:

```ruby
# app/avo/dashboards/operations.rb
class Avo::Dashboards::Operations < Avo::Dashboards::BaseDashboard
  self.id = "operations"
  self.name = "Operations"
  self.controls = -> {
    link_to "Home", main_app.root_path
    list label: "More" do
      link_to "Admin home", avo.root_path
      divider
      link_to "Application home", main_app.root_path
    end
    partial "avo/dashboards/operations_controls", locals: {dashboard: dashboard}
    refresh_button
  }
end
```

Controls are absent by default. The block uses the existing custom-controls collector, not an HTML return value. `list` takes keyword options such as `label:`, not a positional label. See [custom controls](./custom-controls-api.html#link_to) for link and list options.

The block replaces the whole header, so [`self.refresh_button`](./dashboards-api.html#self.refresh_button) is ignored once it runs. Call [`refresh_button`](./custom-controls-api.html#refresh_button) to place the button, or `default_controls` to follow `self.refresh_button`. Without the gem or the license the block never runs and `self.refresh_button` works as usual.

Use a [`partial`](./custom-controls-api.html#partial) for normal Rails forms. The header is meant for small controls, so keep them compact. For example, let users reload the dashboard for a period:

```erb
<%# app/views/avo/dashboards/_operations_controls.html.erb %>
<%= form_with url: avo_dashboards.dashboard_path(dashboard), method: :get, class: "flex items-center gap-2" do |form| %>
  <%= form.select :period, [["Today", "today"], ["This week", "week"]], {selected: params[:period]}, "aria-label": "Period", class: input_classes("w-auto mb-0", size: :sm) %>
  <%= render(Avo::ButtonComponent.new(type: :submit, size: :sm)) { "Apply" } %>
<% end %>
```

Cards must read and validate these parameters themselves. The refresh button reloads cards without submitting the form.

:::warning
Dashboard authorization runs before controls evaluation. Default resource buttons are unavailable on dashboards. For writes, use Rails forms with CSRF protection and application-owned endpoints that perform their own authorization. Hiding a control does not authorize its endpoint.
:::

## Run actions from the header

<VersionReq package="avo-dashboards" version="4.3.4" />

A dashboard can run [actions](./actions.html) of its own, with no resource behind it. Declare them in `actions`:

```ruby{5-8}
# app/avo/dashboards/operations.rb
class Avo::Dashboards::Operations < Avo::Dashboards::BaseDashboard
  self.id = "operations"
  self.name = "Operations"

  def actions
    action Avo::Actions::ClearQueue
    divider
    action Avo::Actions::Reindex, arguments: {full: true}
  end
end
```

They appear in an Actions dropdown in the header and open in the usual modal. With `avo-custom_controls` you choose the placement instead: `actions_list` renders that dropdown, and [`action`](./custom-controls-api.html#action) renders one as its own button, whether or not `actions` lists it. `default_controls` adds the dropdown and follows `self.refresh_button`.

```ruby
self.controls = -> {
  action Avo::Actions::ClearQueue, label: "Clear", icon: "tabler/outline/trash"
  actions_list
  refresh_button
}
```

An action belongs to the dashboard that declares it, so there's nothing to select and it's always enabled. Its `handle` receives `dashboard:`, and no records:

```ruby
class Avo::Actions::ClearQueue < Avo::BaseAction
  self.name = "Clear queue"

  def fields
    field :reason, as: :text
  end

  def handle(fields:, dashboard:, **)
    ClearQueueJob.perform_later(dashboard: dashboard.id, reason: fields[:reason])
    succeed "Queue cleared"
  end
end
```

Running one requires the dashboard's [`self.authorize`](./dashboards-api.html#self.authorize) and the action's own `authorize` to pass.

:::warning
`belongs_to` and `trix` fields need a resource, so they don't work in a dashboard action's modal yet. Use a `select` instead of `belongs_to`, and a `textarea` instead of `trix`.
:::

## Cards

Dashboards host cards — metrics, charts, tables, lists, and custom content. You declare them in the `cards` method, as shown in the [generated dashboard](#generate-a-dashboard) above.

Cards aren't dashboard-specific; the same card classes render on resources too. For everything about building and configuring them, see the [Cards guide](cards.html) and the [Cards API reference](cards-api.html).

You can also drop a [`divider`](cards.html#dividers) between cards to group them, as the generated dashboard does with `divider label: "Custom partials"`.

### Override card arguments from the dashboard

We found ourselves in the position to add a few cards that were the same card but with a slight difference. Ex: Have one `Users count` card and another `Active users count` card. They both count users, but the latter has an `active: true` condition applied.

Before, we'd have to duplicate that card and modify the `query` method slightly but end up with duplicated boilerplate code.
For those scenarios, we created the [`arguments`](cards-api#arguments) attribute. It allows you to send arbitrary arguments to the card from the parent.

```ruby{7-9}
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  def cards
    card Avo::Cards::UsersCount
    card Avo::Cards::UsersCount, arguments: {
      active_users: true
    }
  end
end
```

Now we can pick up that option in the card and update the query accordingly.

```ruby{9-11}
class Avo::Cards::UsersCount < Avo::Cards::MetricCard
  self.id = "users_metric"
  self.label = "Users count"

  # You have access to context, params, range, current parent, and current card
  def query
    scope = User

    if arguments[:active_users].present?
      scope = scope.active
    end

    result scope.count
  end
end
```

That gives you an extra layer of control without code duplication and the best developer experience.

#### Control the base settings from the parent

Evidently, you don't want to show the same `label`, `description`, and other details for that second card from the first card.
Therefore, you can control the `label`, `description`, `cols`, `rows`, `visible`, and `refresh_every` arguments from the parent declaration. See [registration overrides](cards-api#card) for the full list.

```ruby{8-16}
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  def cards
    card Avo::Cards::UsersCount
    card Avo::Cards::UsersCount,
      label: "Active users",
      description: "Active users count",
      cols: 2,
      rows: 2,
      visible: -> { true },
      refresh_every: 2.minutes,
      arguments: {
        active_users: true
      }
  end
end
```

## Dashboards visibility

You might want to hide specific dashboards from certain users. You can do that using the [`visible`](dashboards-api#self.visible) option. The option can be a boolean `true`/`false` or a block where you have access to the `params`, `current_user`, `context`, and `dashboard`.

If you don't pass anything to `visible`, the dashboard will be available for anyone.

```ruby{5-11}
class Avo::Dashboards::ComplexDash < Avo::Dashboards::BaseDashboard
  self.id = "complex_dash"
  self.name = "Complex dash"
  self.description = "Complex dash description"
  self.visible = -> do
    current_user.is_admin?
    # or
    params[:something] == 'something else'
    # or
    context[:your_param] == params[:something_else]
  end

  def cards
    card Avo::Cards::UsersCount
  end
end
```

## Dashboards authorization

You can set authorization rules for dashboards using the [`authorize`](dashboards-api#self.authorize) block.

```ruby{3-6}
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = 'dashy'
  self.authorize = -> do
    # You have access to current_user, params, request, context, and view_context.
    current_user.is_admin?
  end
end
```

A dashboard that fails `authorize` also refuses its cards' own URLs, not only the dashboard page.
