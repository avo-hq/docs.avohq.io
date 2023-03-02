---
feedbackId: 833
license: pro
version: '2.0'
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
class MyDashboard < Avo::Dashboards::BaseDashboard
  self.id = 'my_dashboard'
  self.name = 'Dashy'
  self.description = 'The first dashbaord'
  self.grid_cols = 3

  card ExampleMetric
  card ExampleAreaChart
  card ExampleScatterChart
  card PercentDone
  card AmountRaised
  card ExampleLineChart
  card ExampleColumnChart
  card ExamplePieChart
  card ExampleBarChart
  divider label: "Custom partials"
  card ExampleCustomPartial
  card MapCard
end
```

<img :src="('/assets/img/dashboards/dashboard.jpg')" alt="Avo Dashboard" class="border mb-4" />

## Settings

Each dashboard is a file. It holds information about itself like the `id`, `name`, `description`, and how many columns its grid has.

The `id` field has to be unique. The `name` is what the user sees in big letters on top of the page, and the `description` is some text you pass to give the user more details regarding the dashboard.

Using the ' grid_cols ' parameter, you may organize the cards in a grid with `3`, `4`, `5`, or `6` columns using the `grid_cols` parameter. The default is `3`.

## Cards

All cards have a few base settings and a few custom ones.

### Base settings

All cards have some standard settings like `id`, which must be unique, `label` and `description`. The `label` will be the title of your card, and `description` will show a tiny question mark icon on the bottom right with a tooltip with that description.

Each card has its own `cols` and `rows` settings to control the width and height of the card inside the dashboard grid. They can have values from `1` to `6`.

```ruby{2-7}
class UsersMetric < Avo::Dashboards::MetricCard
  self.id = 'users_metric'
  self.label = 'Users count'
  self.description = 'Users description'
  self.cols = 1
  self.rows = 1
  self.display_header = true
end
```

<img :src="('/assets/img/dashboards/users_metric.jpg')" alt="Avo Dashboard Metric" class="border mb-4" />

### Control the aggregation using ranges

You may also want to give the user the ability to query data in different ranges. You can control what's passed in the dropdown using the' ranges' attribute. The array passed here will be parsed and displayed on the card. All integers are transformed to days, and other string variables will be passed as they are.

You can also set a default range using the `initial_range` attribute.

```ruby{4,5}
class UsersMetric < Avo::Dashboards::MetricCard
  self.id = 'users_metric'
  self.label = 'Users count'
  self.initial_range = 30
  self.ranges = {
    "7 days": 7,
    "30 days": 30,
    "60 days": 60,
    "365 days": 365,
    Today: "TODAY",
    "Month to date": "MTD",
    "Quarter to date": "QTD",
    "Year to date": "YTD",
    All: "ALL"
  }
end
```

### Keep the data fresh

If this dashboard is something you keep on the big screen, you must keep the data fresh at all times. That's easy using `refresh_every`. You pass the number of seconds you need to be refreshed and forget about it. Avo will do it for you.

```ruby{3}
class UsersMetric < Avo::Dashboards::MetricCard
  self.id = 'users_metric'
  self.refresh_every = 10.minutes
end
```

### Hide the header

In cases where you need to embed some content that should fill the whole card (like a map, for example), you can choose to hide the label and ranges dropdown.

```ruby{3}
class UsersMetric < Avo::Dashboards::MetricCard
  self.id = 'users_metric'
  self.display_header = false
end
```
<img :src="('/assets/img/dashboards/map_card.jpg')" alt="Avo Dashboard Map card" class="border mb-4" />

### Override card options from the dashboard

We found ourselves in the position to add a few cards that were the same card but with a slight difference. Ex: Have one `Users count` card and another `Active users count` card. They both count users, but the latter has an `active: true` condition applied.

Before, we'd have to duplicate that card and modify the `query` method slightly but end up with duplicated boilerplate code.
For those scenarios, we created the `options` attribute. It allows you to send arbitrary options to the card from the parent.

```ruby{6-8}
class Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  card UsersCount
  card UsersCount, options: {
    active_users: true
  }
end
```

Now we can pick up that option in the card and update the query accordingly.

```ruby{9-11}
class UsersCount < Avo::Dashboards::MetricCard
  self.id = "users_metric"
  self.label = "Users count"

  # You have access to context, params, range, current dashboard, and current card
  def query
    scope = User

    if options[:active_users].present?
      scope = scope.active
    end

    result scope.count
  end
end
```

That gives you an extra layer of control without code duplication and the best developer experience.

#### Control the base settings from the parent

Evidently, you don't want to show the same `label`, `description`, and other details for that second card from the first card;. Therefore, you can control the `label`, `description`, `cols`, `rows`, and `refresh_every` options from the parent declaration.

```ruby{7-11}
class Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  card UsersCount
  card UsersCount,
    label: "Active users",
    description: "Active users count",
    cols: 2,
    rows: 2,
    refresh_every: 2.minutes,
    options: {
      active_users: true
    }
end
```

## Card visibility

<VersionReq version="2.28" />

It's common to show the same dashboard to multiple types of users (admins, regular users). In that scenario you might want to hide some cards for the regular users and show them just to the admins.

You can use the `visible` option to do that. It can be a `boolean` or a `block` where you can access the `params`, `current_user`, `context`, `parent`, and `card` object.

```ruby{4-6}
class UsersCount < Avo::Dashboards::MetricCard
  self.id = "users_metric"
  self.label = "Users count"
  self.visible = -> do
    # You have access to context, params, parent (the current dashboard), and current card
    true
  end

  def query
    result User.count
  end
end
```

You may also control the visibility from the dashboard class.

```ruby
class Dashy < Avo::Dashboards::BaseDashboard
  self.name = "Dashy"

  card UsersCount, visible: -> { true }
end
```

## Card types

You can add three types of cards to your dashboard: `metric`, `chartkick`, and `partial`.

### Metric card

The metric card is your friend when you only need to display a simple significant number on your dashboard. Generate one run `bin/rails g avo:card:metric users_metric`.

<img :src="('/assets/img/dashboards/users_metric.jpg')" alt="Avo Dashboard Metric" class="border mb-4" />

#### Calculate results

To calculate your result, you may use the `query` method. After you run your query, use the `result` method to store the value that will be displayed on the card.

In the `query` method you have access to a few variables like `context` (the [App context](./customization#context)), `params` (the request params), `range` (the range that was requested), `dashboard` (the current dashboard the card is on), and current `card`.

```ruby{13-34,36}
class UsersMetric < Avo::Dashboards::MetricCard
  self.id = 'users_metric'
  self.label = 'Users count'
  self.description = 'Some tiny description'
  self.cols = 1
  # self.rows = 1
  # self.initial_range = 30
  # self.ranges = [7, 30, 60, 365, 'TODAY', 'MTD', 'QTD', 'YTD', 'ALL']
  # self.prefix = '$'
  # self.suffix = '%'
  # self.refresh_every = 10.minutes

  def query
    from = Date.today.midnight - 1.week
    to = DateTime.current

    if range.present?
      if range.to_s == range.to_i.to_s
        from = DateTime.current - range.to_i.days
      else
        case range
        when 'TODAY'
          from = DateTime.current.beginning_of_day
        when 'MTD'
          from = DateTime.current.beginning_of_month
        when 'QTD'
          from = DateTime.current.beginning_of_quarter
        when 'YTD'
          from = DateTime.current.beginning_of_year
        when 'ALL'
          from = Time.at(0)
        end
      end
    end

    result User.where(created_at: from..to).count
  end
end
```

#### Decorate the data using `prefix` and `suffix`

Some metrics might want to add a `prefix` or a `suffix` to display the data better.

```ruby{3,4}
class UsersMetric < Avo::Dashboards::MetricCard
  self.id = 'users_metric'
  self.prefix = '$'
  self.suffix = '%'
end
```

<img :src="('/assets/img/dashboards/prefix-suffix.jpg')" alt="Avo Dashboard Prefix & suffix" class="border mb-4" />

### Chartkick card

A picture is worth a thousand words. So maybe a chart a hundred? Who knows? But creating charts in Avo is very easy with the help of the [chartkick](https://github.com/ankane/chartkick) gem.

You start by running `bin/rails g avo:card:chartkick users_chart`.

```ruby
class UserSignups < Avo::Dashboards::ChartkickCard
  self.id = 'user_signups'
  self.label = 'User signups'
  self.chart_type = :area_chart
  self.description = 'Some tiny description'
  self.cols = 2
  # self.rows = 1
  # self.chart_options = { library: { plugins: { legend: { display: true } } } }
  # self.flush = true
  # self.legend = false
  # self.scale = false
  # self.legend_on_left = false
  # self.legend_on_right = false

  def query
    points = 16
    i = Time.new.year.to_i - points
    base_data =
      Array
        .new(points)
        .map do
          i += 1
          [i.to_s, rand(0..20)]
        end
        .to_h

    data = [
      { name: 'batch 1', data: base_data.map { |k, v| [k, rand(0..20)] }.to_h },
      { name: 'batch 2', data: base_data.map { |k, v| [k, rand(0..40)] }.to_h },
      { name: 'batch 3', data: base_data.map { |k, v| [k, rand(0..10)] }.to_h }
    ]

    result data
  end
end
```

<img :src="('/assets/img/dashboards/chartkick.jpg')" alt="Chartkick card" class="border mb-4" />

#### Chart types

Using the `self.chart_type` class attribute, you can change the chart type. Supported types are `line_chart`, `pie_chart`, `column_chart`, `bar_chart`, `area_chart`, and `scatter_chart`.


#### Customize chart

Because the charts are being rendered with padding initially, we offset that before rendering to make the chart look good on the card. To disable that, you can set `self.flush = false`. That will set the chart loose for you to customize further.

After you set `flush` to `false`, you can add/remove the `scale` and `legend`. You can also place the legend on the left or right using `legend_on_left` and `legend_on_right`.

These are just some of the predefined options we provide out of the box, but you can send different [chartkick options](https://github.com/ankane/chartkick#options) to the chart using `chart_options`.

If you'd like to use [Groupdate](https://github.com/ankane/groupdate), [Hightop](https://github.com/ankane/hightop), and [ActiveMedian](https://github.com/ankane/active_median) you should require them in your `Gemfile`. Only `chartkick` is required by default.

`chart.js` is supported for the time being. So if you need support for other types, please reach out or post a PR (🙏 PRs are much appreciated).

### Partial card

You can use a partial card to add custom content to a card. Generate one by running `bin/rails g avo:card:partial custom_card`. That will create the card class and the partial for it.

```ruby{5}
class ExampleCustomPartial < Avo::Dashboards::PartialCard
  self.id = "users_custom_card"
  self.cols = 1
  self.rows = 4
  self.partial = "avo/cards/custom_card"
  # self.display_header = true
end
```
<img :src="('/assets/img/dashboards/custom_partial_card.jpg')" alt="Custom partial card" class="border mb-4" />

You may embed a piece of content from another app using an iframe. You can hide the header using the `self.display_header = false` option. That will render the embedded content flush to the container.

```ruby{5}
# app/avo/cards/map_card.rb
class MapCard < Avo::Dashboards::PartialCard
  self.id = "map_card"
  self.label = "Map card"
  self.partial = "avo/cards/map_card"
  self.display_header = false
  self.cols = 2
  self.rows = 4
end
```

```html
<!-- app/views/avo/cards/_map_card.html.erb -->
<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d17991.835132857846!2d-73.98926852562143!3d40.742050491245955!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sro!4v1647079626880!5m2!1sen!2sro" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
```

<img :src="('/assets/img/dashboards/map_card.jpg')" alt="Avo Dashboard Map card" class="border mb-4" />

## Dividers

You may want to separate the cards. You can use dividers to do that.

```ruby{16}
class Dashy < Avo::Dashboards::BaseDashboard
  self.id = 'dashy'
  self.name = 'Dashy'
  self.description = 'The first dashbaord'
  self.grid_cols = 3

  card ExampleMetric
  card ExampleAreaChart
  card ExampleScatterChart
  card PercentDone
  card AmountRaised
  card ExampleLineChart
  card ExampleColumnChart
  card ExamplePieChart
  card ExampleBarChart
  divider label: "Custom partials"
  card ExampleCustomPartial
  card MapCard
end
```

<img :src="('/assets/img/dashboards/divider.jpg')" alt="Avo Dashboard Divider" class="border mb-4" />

Dividers can be a simple line between your cards or have some text on them that you control using the `label` option.
When you don't want to show the line, you can enable the `invisible` option, which adds the divider but does not display a border or label.


## Dividers visibility

<VersionReq version="2.28" />

You might want to conditionally show/hide a divider based on a few factors. You can do that using the `visible` option.

```ruby
class Dashy < Avo::Dashboards::BaseDashboard
  self.name = "Dashy"

  card UsersCount, visible: -> {
    # You have access to context, params, parent (the current dashboard)
    true
  }
end
```

## Dashboards visibility

You might want to hide specific dashboards from certain users. You can do that using the `visible` option. The option can be a boolean `true`/`false` or a block where you have access to the `params`, `current_user`, `context`, and `dashboard`.

If you don't pass anything to `visible`, the dashboard will be available for anyone.

```ruby{5-11}
class ComplexDash < Avo::Dashboards::BaseDashboard
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

  card UsersCount
end
```

## Dashboards authorization

<VersionReq version="2.22" />

You can set authorization rules for dashboards using the `authorize` block.

```ruby{3-6}
class Dashy < Avo::Dashboards::BaseDashboard
  self.id = 'dashy'
  self.authorization = -> do
    # You have access to current_user, params, request, context, adn view_context.
    current_user.is_admin?
  end
end
```
