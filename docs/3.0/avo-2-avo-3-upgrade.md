# Upgrade guide

The upgrade process from Avo 2 to Avo 3 has quite a few steps, but you'll soon figure out that the API hasn't changed all that much. We moved a few things around and made others more consistent.

Depending on how you use Avo you might not need to do all the steps.

:::warning
The [`show_controls`](./customizable-controls) feature has been moved from the Pro to the Advanced tier.

The `show_controls` feature was in beta since launch. We introduced options for the <Index />, and <Edit /> views, and for the row controls.

Based on how much it took to build the feature, the maintenance perspective and the value it brings we have decided that it's best suited for the Advanced tier.
:::

## Upgrade from 2.x to 3.x

:::info Ensure you meet the technical requirements
Avo now requires Ruby 3.1 and Rails 6.1
:::

:::info Ensure you have a token for `Pro` or `Advanced` versions.
Avo 3 requires a new v3 license key. Your v2 license key won't work. Please purchase and Avo 3 license from [avohq.io/pricing](https://avohq.io/pricing).
:::

:::info Upgrade from a v2 license to a v3 license

~~Because we switched Stripe accounts, the subscription upgrade process is not an automated one.~~

We upgraded all Avo 2 Pro licenses to Avo 3 Pro licenses without any cost additions.

If you had an Avo 2 license, you received an email about that and instructions on next steps.

Thank you for being an awesome customer!
:::

## Use the automatic upgrade tool

:::danger The upgrade tool

 - is experimental
 - doesn't cover all the required steps
 - might produce unwanted artifacts

**Back-up your code before using the tool.**
:::

To use the upgrade tool add `gem 'avo_upgrade'` to your `Gemfile` and run `bundle install`.

```ruby
group :development do
  gem "avo_upgrade"
end
```

Next you should run the `bin/rails avo:upgrade:2_to_3` command and go through the process.

Ideally, you'd run the command with a clean tree and then make the last adjustments manually. The command will tell you what those the last adjustments are that you have to do manually.

When that command finished you can safely remove `gem "avo_upgrade"` from your `Gemfile`.

## Upgrade steps

Each paragraph will guide you through the upgrade process for each individual change.

Most of these steps are breaking changes so you'll need to apply them if you're using the feature.

<Option name="Update your `Gemfile`">
The Avo gem comes in three flavors now. Community, Pro, or Advanced.

You should add the one you use in your `Gemfile`. If you use Pro or Advanced you don't have to add `avo` too. Each gem adds their own dependencies.

Add only one of the ones below.

<!-- @include: ./common/avo_in_gemfile.md-->

:::warning
If you want to install `avo-pro` or `avo-advanced` please ensure you have a [valid Avo 3 license](https://avohq.io/pricing) and you [take the required steps to authenticate](./gem-server-authentication) with `packager.dev`.
:::
</Option>

<Option name="The status field changed behavior">
Before, for the status you'd set the `failed` and `loading` states and everything else fell under `success`. That felt unnatural. We needed a `neutral` state.
Now we changed the field so you'll set the `failed`, `loading`, and `success` values and the rest fall under `neutral`.

```ruby
# Before
field :status,
  as: :status,
  failed_when: :failed,
  loading_when: :loading

# After
field :status,
  as: :status,
  failed_when: :failed,
  loading_when: :loading
  success_when: :deployed # specify the success state
```
</Option>

<Option name="`heading` has become a field type">
Before, a heading used the `heading` method with a text string or HTML string as an argument.
Now, it is a field type with an ID. It supports rendering as text and as HTML.

### Actions to take

Rename `heading` to `field`. Give the field an ID and add the `as: :heading` argument.

```ruby
# Before
heading 'User Information'

# After
field :user_information, as: :heading
# or...
field :some_id, as: :heading, label: 'User Information'

# Before
heading '<div class="underline uppercase font-bold">User Information</div>', as_html: true

# After
field :some_id, as: :heading, as_html: true do
  '<div class="underline uppercase font-bold">User Information</div>'
end
```
</Option>

<Option name="Moved some globals from `Avo::App` to `Avo::Current`">

### Actions to take

Rename the following:

- `Avo::App.context`      -> `Avo::Current.context`
- `Avo::App.params`       -> `Avo::Current.params`
- `Avo::App.request`      -> `Avo::Current.request`
- `Avo::App.view_context` -> `Avo::Current.view_context`
- `Avo::App.current_user` -> `Avo::Current.user`

Make note of the `current_user` to `user` rename.
</Option>

<Option name="Renamed `model` to `record` across all configuration files">

The `model` naming is a bit off. You never know if you're mentioning the model class or the instantiated database record, so we changed it to `record` (Pundit calls it a record too). One of the places you'll see it the most is when you reference it off of the `resource` (`resource.model`).

### Actions to take

Rename `resource.model` to `resource.record`.

You might have the `model` referenced in other places too. Try to replace it with `record`.
If you find it in other places, please send them our way so we can update this doc for a more consistent API. Thank you!
</Option>

<Option name="Remove block (lambda) arguments">

All block arguments are removed from Avo. We did this in order to make blocks more consistent and to improve future compatibility. All the arguments that were previously available as arguments, are present inside the block.

We don't have a complete list of blocks but we'll try to give you a few examples:

 - Field options: `visible`, `readonly`, `disabled`, `format_using`, etc.
 - Select field `options` option
 - Resource options: `index_query`, `search_query`, `find_record_method`, etc.
 - Actions, Dashboards, and Cards `self.visible`
 - anything that you are passing as a block should be without arguments

**As a general rule, we removed all block arguments. If we missed any, so please send them our way so we can update this guide.** Thank you!

### Actions to take

Remove the arguments from blocks

```ruby
# Before
self.visible = ->(resource:) {}

# After
self.visible = -> {}

# Before
field :name, as: :text, default: ->(resource:) {something}, format_using: ->(value:) {}, visible: ->(resource:) {}

# After
field :name, as: :text, default: -> {something}, format_using: -> {}, visible: -> {}

# Before
field :level, as: :select, options: ->(model:, resource:, field:, view:) do
    {
      Beginner: :beginner,
      Intermediate: :intermediate,
      Advanced: :advanced,
    }
  end

# After
field :level, as: :select, options: -> do
    {
      Beginner: :beginner,
      Intermediate: :intermediate,
      Advanced: :advanced,
    }
  end
```
</Option>

<Option name="Swap `disabled` and `readonly` field options">

We received some feedback in v2.x that the `disabled` field option does not protect against DOM field manipulation when the form is submitted, so we introduced the `readonly` option that protects against that.

After a short [research](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly) we soon found out that HTML does it the other way around. `disabled` protects against that and `readonly` doesn't.
So, we are switching them to better comply with the standards.

### Actions to take

Swap those two

```ruby
field :name,
  as: :text,
  disabled: -> { !Avo::Current.user.is_admin? } // [!code --]
  readonly: -> { !Avo::Current.user.is_admin? } // [!code ++]

field :hidden_info,
  as: :text,
  readonly: -> { !Avo::Current.user.is_admin? } // [!code --]
  disabled: -> { !Avo::Current.user.is_admin? } // [!code ++]
```
</Option>

<Option name="Removed `index_text_align` option">
Same behavior from `index_text_align` can be achieved using `html` and `class` options.

### Actions to take
Replace `index_text_align` with `html` option:

```ruby
# Before
field :users_required, as: :number, index_text_align: :right

# After
field :users_required, as: :number, html: {index: {wrapper: {classes: "text-right"}}}
```
</Option>

<Option name="Renamed `resolve_query_scope` to `index_query` in resources">
The new method name `index_query` speaks more about what it does and the rest of the changes brings it more inline with the other APIs

### Actions to take

- rename `resolve_query_scope` to `index_query`
- remove the `(model_class:)` block argument
- rename `model_class` inside the block to `query`

```ruby
# Before
self.resolve_query_scope = ->(model_class:) do
  model_class.order(last_name: :asc)
end

# After
self.index_query = -> do
  query.order(last_name: :asc)
end
```
</Option>

<Option name="Removed `resolve_find_scope` in favor of `find_record_method`">
The new `find_record_method` method works better as it enables you to use custom find matchers.

### Actions to take

- rename `resolve_query_scope` to `index_query`
- remove the `(model_class:, id:, params:)` block arguments
- rename `model_class` inside the block to `query`
- add the `.find` matcher

```ruby
# Before
self.resolve_find_scope = ->(model_class:) do
  model_class.friendly
end

# After
self.find_record_method = -> do
  query.friendly.find id
end
```
</Option>

<Option name="Refactor the grid view API">
We removed the old `grid do` block to `self.grid_view` to fall more inline with `self.map_view` and others.

The `card` block will cycle through all of your records and you need to return a hash with the following keys `title`, `body`, `cover_url`.

You may also return an `html` option to apply html properties to the card elements.

```ruby
self.grid_view = {
  card: -> do
    {
      cover_url:
        if record.cover_photo.attached?
          main_app.url_for(record.cover_photo.url)
        end,
      title: record.name,
      body: ActionView::Base.full_sanitizer.sanitize(record.body).truncate(120)
    }
  end,
  html: -> do
    {
      title: {
        index: {
          wrapper: {
            classes: "bg-blue-50 rounded-md p-2"
          }
        }
      },
      body: {
        index: {
          wrapper: {
            classes: "bg-gray-50 rounded-md p-1"
          }
        }
      }
    }
  end
}
```
</Option>

<Option name="Refactored the search API">
In Avo 2, the search options were scattered around multiple places. The query was used from the `search_query`, the record description was taken from an arbitrary `as_description: true` field option, and other mis-aligned places.

In Avo 3 we brought all those things in a single `self.search` option.

The `self.search[:item]` block will go through each of the found records where you have to return a hash with the following keys `title`, `description`, `image_url`, `image_format`.

- `self.search_query` moved to `self.search[:query]`. (remove `self.search_query` from the resource file)
- `scope` that was accessible inside old `self.search_query` moved to `query` and it's inside `self.search[:query]` (check code example below)
- `self.search_query_help` moved to `self.search[:help]`. (remove `self.search_query_help` from the resource file)
- `self.hide_from_global_search` moved to `self.search[:hide_on_global]`. (remove `self.hide_from_global_search` from the resource file)
- `self.search_result_path` moved to `self.search[:result_path]`. (remove `self.search_result_path` from the resource file)
- the search item `title` is going to be the `self.title` by default but you can configure it in `item`.
- `as_description: true` is `self.search[:item][:description]`. (remove `as_description: true` from fields)
- `as_avatar: true` is `self.search[:item][:image_url]`. (remove `as_avatar:` from fields)
- `as_avatar: :rounded` is `self.search[:item][:image_format]`

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> {
      query.order(created_at: :desc)
        .ransack(first_name_cont: params[:q], last_name_cont: params[:q], m: "or")
        .result(distinct: false)
    },
    item: -> do
      {
        title: record.name,
        description: "This user has the following roles: #{record.roles.select { |key, value| value }.keys.join(", ")}",
        image_url: main_app.url_for(record.cover_photo) if record.cover_photo.attached?,
        image_format: :rounded
      }
    end
    help: -> { "- Search by first name or last name." },
    hide_on_global: true,
    result_path: -> { avo.resources_city_path record, custom: "yup" }
  }
end
```
</Option>

<Option name="Rename Avo configuration classes">

We are falling more in line with how Rails and zeitwerk autoloads classes. We do this to avoid some issues like class conflicts and difficult to remember naming schemes.

The old naming scheme: `{NAME}{TYPE}` (`UserResource`)
The new naming scheme: `Avo::{TYPE}::{Name}` (`Avo::Resources::User`)

In a similar fashion you should update the filename too: `app/avo/resources/user_resource.rb` -> `app/avo/resources/user.rb`.

### Actions to take

Rename the your configuration classes to include the full path:

::: code-group

```ruby [Resources]
# Before
# /app/avo/resources/user_resource.rb
class UserResource < Avo::BaseResource
end

# After
# /app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
end
```

```ruby [Actions]
# Before
# /app/avo/actions/export_action.rb
class ExportAction < Avo::BaseAction
end

# After
# /app/avo/actions/export.rb
class Avo::Actions::Export < Avo::BaseAction
end
```

```ruby [Filters]
# Before
# /app/avo/filters/name_filter.rb
class NameFilter < Avo::BaseFilter
end

# After
# /app/avo/filters/name.rb
class Avo::Filters::Name < Avo::BaseFilter
end
```

```ruby [Dashboards]
# Before
# /app/avo/dashboards/sales_dashboard.rb
class SalesDashboard < Avo::BaseResource
end

# After
# /app/avo/dashboards/sales.rb
class Avo::Dashboards::Sales < Avo::Dashboards::BaseDashboard
end
```

```ruby [Cards]
# Before
# /app/avo/cards/users_count_card.rb
class UsersCountCard < Avo::Dashboards::MetricCard
end

# After
# /app/avo/cards/users_count.rb
class Avo::Cards::UsersCount < Avo::Cards::MetricCard
end
```

```ruby [Resource tools]
# Before
# /app/avo/resource_tools/comments_resource_tool.rb
class CommentsResourceTool < Avo::BaseResourceTool
end

# After
# /app/avo/resource_tools/comments.rb
class Avo::ResourceTools::Comments < Avo::BaseResourceTool
end
```

```ruby [Custom fields]
# Before
# /app/avo/fields/color_picker_field.rb
class ColorPickerField < Avo::Fields::BaseField
end

# After
# /app/avo/fields/color_picker_field.rb
class Avo::Fields::ColorPickerField < Avo::Fields::BaseField
end
```
:::
</Option>

<Option name="Use the `def fields` API">
We are introducing a new API for declaring fields. This brings many improvements from easier maintenance, better control, better composition, and more.

```ruby
# Before
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  field :id, as: :id, filterable: true
  field :name, as: :text, sortable: true, show_on: :preview, filterable: true

  tabs do
    tab "Info" do
      panel do
        field :created_at, as: :date_time, filterable: true
      end
    end
  end

  sidebar do
    field :updated_at, as: :date_time, filterable: true
  end

  panel "Logo" do
    field :logo, as: :external_image, hide_on: :show, as_avatar: :rounded
  end

  tool Avo::ResourceTools::TeamTool
end

# After
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, filterable: true
    field :name, as: :text, sortable: true, show_on: :preview, filterable: true

    tabs do
      tab "Info" do
        panel do
          field :created_at, as: :date_time, filterable: true
        end
      end
    end

    sidebar do
      field :updated_at, as: :date_time, filterable: true
    end

    panel "Logo" do
      field :logo, as: :external_image, hide_on: :show, as_avatar: :rounded
    end

    tool Avo::ResourceTools::TeamTool
  end
end
```

This will enable us to provide request specific data to the field configuration like `current_user` and `params` and will enable you to have better composition.

```ruby
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  def admin_fields
    field :created_at, as: :date_time, filterable: true
  end

  def fields
    field :id, as: :id, filterable: true
    field :name, as: :text, sortable: true, show_on: :preview, filterable: true
    field :logo, as: :external_image, hide_on: :show, as_avatar: :rounded do
      if record.url
        "//logo.clearbit.com/#{URI.parse(record.url).host}?size=180"
      end
    end

    # request-time data
    if current_user.is_admin?
      # better composition
      admin_fields
    end
  end
end
```

### Actions to take

Wrap all `field`, `tabs`, `tab`, `panel`, `sidebar`, and `tool` declarations from Resource and Action files into one `def fields` method.
</Option>

<Option name="Use the `def actions` API">
Similar to how we added the `def fields` wrapper to fields you should now wrap all actions in an `actions` method.


```ruby{3,8-10}
# Before
class Avo::Resources::User < Avo::BaseResource
  action Avo::Actions::Dummy
end

# After
class Avo::Resources::User < Avo::BaseResource
  def actions
    action Avo::Actions::Dummy
  end
end
```
</Option>

<Option name="Use the `def filters` API">
Similar to how we added the `def fields` wrapper to fields you should now wrap all filters in an `filters` method.


```ruby{3,8-10}
# Before
class Avo::Resources::User < Avo::BaseResource
  filter Avo::Filters::IsAdmin
end

# After
class Avo::Resources::User < Avo::BaseResource
  def filters
    filter Avo::Filters::IsAdmin
  end
end
```
</Option>

<Option name="Use the `def scopes` API">
Similar to how we added the `def fields` wrapper to fields you should now wrap all scopes in an `scopes` method.


```ruby{3,8-10}
# Before
class Avo::Resources::User < Avo::BaseResource
  scope Avo::Scopes::Active
end

# After
class Avo::Resources::User < Avo::BaseResource
  def scopes
    scope Avo::Scopes::Active
  end
end
```
</Option>

<Option name="Wrap all Dashboard `card` and `divider` definitions inside one `def cards` method">
After the `def fields` refactor we did the same in dashboard files. Instead of declaring the cards in the class directly, you should do it in the `def cards` method.

```ruby{6-9,17-22}
# Before
class Avo::Dashboards::Dashy < AvoDashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  card Avo::Cards::ExampleMetric, visible: -> { true }
  card Avo::Cards::ExampleAreaChart
  divider
  card Avo::Cards::ExampleScatterChart
end

# After
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  def cards
    card Avo::Cards::ExampleMetric, visible: -> { true }
    card Avo::Cards::ExampleAreaChart
    divider
    card Avo::Cards::ExampleScatterChart
  end
end
```
</Option>

<Option name="`tool` is declared inside the `def fields` method">
In Avo 3 you'll be able to insert resource tools in-between fields, tabs and panels, so now, the `tool`s must be called inside the `fields` method. This feature is unreleased yet, but you should make the change now so it'll be seamless when we add it.

### Actions to take

```ruby{8,17}
# Before
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true, sortable: false
    field :email, as: :gravatar, link_to_record: true, as_avatar: :circle, only_on: :index
  end

  tool Avo::ResourceTools::UserTool
end

# After
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true, sortable: false
    field :email, as: :gravatar, link_to_record: true, as_avatar: :circle, only_on: :index

    tool Avo::ResourceTools::UserTool
  end
end
```
</Option>

<Option name="Remove `tabs_style` from the `tabs` declaration">
We streamlined tabs and kept only the `:pills` style so now we only have one style of tabs.

### Actions to take

Remove `tabs_style` from the `tabs` declaration

```ruby
# Before
tabs tabs_style: :pills do
  # tabs here
end

# After
tabs do
  # tabs here
end
```
</Option>
