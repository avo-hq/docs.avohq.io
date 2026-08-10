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

## Global ranges

Cards each carry their own [range dropdown](cards#ranges), but you can also render a row of range buttons at the top of the dashboard that update every card at once. Pass the day counts you want as [`global_ranges`](dashboards-api#self.global_ranges):

```ruby{4}
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"
  self.global_ranges = [7, 30, 60, 365]

  def cards
    card Avo::Cards::UsersCount
  end
end
```

Each entry's button label resolves the `avo.<value>` translation key, falling back to the humanized value — so `"three_days"` reads "Three days" with no translation at all. Avo ships no key for any value, so add your own under `avo.<value>` when the humanized form isn't what you want. The default is an empty array (no global range bar).

## Localization

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
