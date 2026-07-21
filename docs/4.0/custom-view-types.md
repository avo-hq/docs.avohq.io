---
license: community
outline: [2, 3]
---

# Custom view types

Avo ships with three built-in view types for the resource index: **table**, **grid**, and **map**. You can register entirely new view types from a Rails Engine (Avo plugin) — they appear in the view switcher alongside the built-in ones and can be set as the default for any resource.

If you're only looking to control which of the existing view types show up on a resource, see [Restrict the available view types](./views.html#restrict-the-available-view-types) instead.

The process has three parts: **create the component**, **register the view type**, and **configure a resource to use it**.

## 1. Create the view type component

Every view type is a ViewComponent that inherits from `Avo::ViewTypes::BaseViewTypeComponent`. The base class provides these props automatically:

| Prop              | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| `resources`       | Array of Avo resource wrappers (call `.record` for the model) |
| `resource`        | The Avo resource class                                        |
| `pagy`            | Pagination object                                             |
| `query`           | The current query                                             |
| `turbo_frame`     | The Turbo Frame ID                                            |
| `index_params`    | Current index parameters                                      |
| `reflection`      | Association reflection (if nested)                            |
| `parent_record`   | Parent record (if nested)                                     |
| `parent_resource` | Parent resource (if nested)                                   |
| `actions`         | Available actions                                             |

Create your component class inside your engine's namespace:

```ruby
# app/components/my_plugin/view_types/timeline_view_type_component.rb
class MyPlugin::ViewTypes::TimelineViewTypeComponent < Avo::ViewTypes::BaseViewTypeComponent # [!code focus]
  def grouped_resources
    @resources.group_by { |r| r.record.created_at.to_date }
  end

  def empty?
    @resources.blank?
  end
end
```

Then create the template. You have full control over the HTML — render items however you like and include the paginator at the bottom:

```erb
<%# app/components/my_plugin/view_types/timeline_view_type_component.html.erb %>

<div class="timeline-view">
  <% if empty? %>
    <div class="p-8 text-center text-gray-500">
      No records found.
    </div>
  <% else %>
    <% grouped_resources.each do |date, resources| %>
      <h3 class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
        <%= date.strftime("%B %d, %Y") %>
      </h3>

      <% resources.each do |resource| %>
        <div class="px-4 py-3 border-b border-gray-100">
          <%= resource.record.title %>
        </div>
      <% end %>
    <% end %>
  <% end %>
</div>

<%= render paginator_component %>
```

:::info
The `paginator_component` method is inherited from the base class. Always render it to keep pagination working.
:::

## 2. Register the view type

In your engine's initializer, register the view type with `Avo.plugin_manager.register_view_type`. This must happen inside the `ActiveSupport.on_load(:avo_boot)` hook so Avo core is loaded first.

```ruby
# lib/my_plugin/engine.rb
module MyPlugin
  class Engine < ::Rails::Engine
    initializer "my_plugin.init" do
      ActiveSupport.on_load(:avo_boot) do
        Avo.plugin_manager.register "my_plugin" # [!code focus:5]

        Avo.plugin_manager.register_view_type :timeline,
          component: "MyPlugin::ViewTypes::TimelineViewTypeComponent",
          icon: "tabler/outline/timeline-event",
          active_icon: "tabler/filled/timeline-event"
      end
    end
  end
end
```

`register_view_type` accepts these options:

| Option        | Required | Description                                           |
| ------------- | -------- | ----------------------------------------------------- |
| `component`   | Yes      | Component class or string (auto-constantized)         |
| `icon`        | Yes      | Icon path for the inactive state in the view switcher |
| `active_icon` | Yes      | Icon path for the active state in the view switcher   |

:::info
The `component` can be passed as a string (`"MyPlugin::ViewTypes::TimelineViewTypeComponent"`) or as the class itself. Strings are constantized at render time, which avoids load-order issues during boot.
:::

## 3. Configure a resource to use it

Once registered, you can use your custom view type in any resource:

```ruby
# app/avo/resources/event.rb
class Avo::Resources::Event < Avo::BaseResource
  self.default_view_type = :timeline # [!code focus:2]
  self.view_types = [:table, :timeline]

  # ... fields
end
```

Setting [`default_view_type`](./resources-api.html#self.default_view_type) makes your view type the one users see first. Including `:table` in `view_types` keeps the table view available as a fallback via the view switcher. To change the default for **all** resources, set `config.default_view_type` in `config/initializers/avo.rb`.

## Full example: avo-notifications

The `avo-notifications` gem ships a `:notification` view type as a real-world reference. Here's how it's wired up:

**Registration** in the engine:

```ruby
# lib/avo/notifications/engine_handler.rb
Avo.plugin_manager.register_view_type :notification,
  component: "Avo::Notifications::ViewTypes::NotificationViewTypeComponent",
  icon: "tabler/outline/bell",
  active_icon: "tabler/filled/bell"
```

**Component** inherits from the base and adds domain logic (time grouping, unread counts):

```ruby
# app/components/avo/notifications/view_types/notification_view_type_component.rb
class Avo::Notifications::ViewTypes::NotificationViewTypeComponent < Avo::ViewTypes::BaseViewTypeComponent
  def grouped_resources
    @resources.group_by { |resource| time_group(resource.record.created_at) }
  end

  def unread_count
    @resources.count { |resource| user_unread?(resource.record) }
  end

  # ...
end
```

**Resource** sets it as the only view type:

```ruby
# app/avo/resources/avo_notification.rb
class Avo::Resources::AvoNotification < Avo::BaseResource
  self.default_view_type = :notification
  self.view_types = [:notification]
end
```

## Add styles and interactivity

Custom view types often ship their own CSS and Stimulus controllers. Register both from your engine through Avo's asset manager:

```ruby
Avo.asset_manager.add_stylesheet "my-plugin/application"
Avo.asset_manager.add_javascript "my-plugin/application"
```

See [Custom asset pipeline](./custom-asset-pipeline.html) for compiling and serving the assets, and [Stimulus JS integration](./stimulus-integration.html) for wiring up controllers.
