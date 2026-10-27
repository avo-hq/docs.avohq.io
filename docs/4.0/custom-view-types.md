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
class MyPlugin::ViewTypes::TimelineViewTypeComponent < Avo::ViewTypes::BaseViewTypeComponent # [!code highlight]
  def grouped_resources
    @resources.group_by { |r| r.record.created_at.to_date }
  end

  def empty?
    @resources.blank?
  end
end
```

Then create the template. Keep the list Turbo Frame and expose [`index_slot`](./resources-api.html#index_slot) positions so applications can extend your view without replacing it. Pass each region's built-in markup as a block; this enables replacements to preserve it through `default_content.call`:

```erb
<%# app/components/my_plugin/view_types/timeline_view_type_component.html.erb %>

<turbo-frame id="<%= list_frame_id %>" target="_top" class="flex w-full flex-col">
  <%= render_index_slot :before_collection %>
  <%= render_index_slot :collection do %>
    <%= render_index_slot :before_records %>
    <%= render_index_slot :records do %>
      <div class="timeline-view">
        <% if empty? %>
          <div class="p-8 text-center text-gray-500">No records found.</div>
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
    <% end %>
    <%= render_index_slot :after_records %>

    <% unless empty? %>
      <div class="timeline-pagination">
        <%= render_index_slot :before_pagination %>
        <%= render_index_slot(:pagination) { render paginator_component } %>
        <%= render_index_slot :after_pagination %>
      </div>
    <% end %>
  <% end %>
  <%= render_index_slot :after_collection %>
</turbo-frame>
```

:::info
The `paginator_component` and `list_frame_id` methods are inherited from the base class. Render the paginator for populated, paginated views. Keep collection hooks inside the frame, and leave before/after hooks outside the region's replacement block so they survive a full replacement.
:::

The core resource shell already owns cards, header, title, and toolbar hooks. Do not render those again for your view's internal heading. Slot declarations do not add markup to a custom template automatically; only positions you render are available. Slots add no wrapper or styles, and replacing controls means owning their behavior.

For empty index pages, `ResourceListingComponent` renders the shared empty state instead of instantiating your view-type component. Core supplies collection and records hooks around that empty state, without pagination hooks. Your component's empty branch is useful if it is rendered directly, but does not replace core's empty-index behavior. See [slot coverage and caveats](./views.html#keep-slots-when-customizing-the-index) for refresh boundaries and add-on differences.

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

See [Asset handling](./asset-handling.html) for compiling and serving the assets, and [JavaScript & Stimulus](./javascript.html) for wiring up controllers.
