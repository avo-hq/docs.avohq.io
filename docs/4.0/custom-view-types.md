# Custom view types

Avo ships with three built-in view types for the resource index: **table**, **grid**, and **map**. You can restrict which ones are available per-resource, or create entirely new view types through plugins.

## Restricting available view types

By default, Avo displays all the configured view types on the view switcher. For example, if you have `map_view` and `grid_view` configured, both of them, along with the `table_view`, will be available on the view switcher.

However, there might be cases where you only want to make a specific view type available without removing the configurations for other view types. This can be achieved using the `view_types` class attribute on the resource. Note that when only one view type is available, the view switcher will not be displayed.

```ruby{3}
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = :table
  #...
end
```

If you want to make multiple view types available, you can use an array. The icons on the view switcher will follow the order in which they are declared in the configuration.

```ruby{3}
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = [:table, :grid]
  #...
end
```

You can also dynamically restrict the view types based on user roles, params, or other business logic. To do this, assign a block to the `view_types` attribute. Within the block, you'll have access to `resource`, `record`, `params`, `current_user`, and other default accessors provided by `ExecutionContext`.

```ruby{3-9}
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = -> do
    if current_user.is_admin?
      [:table, :grid]
    else
      :table
    end
  end
  #...
end
```

## Creating a custom view type through a plugin

You can register entirely new view types from a Rails Engine (Avo plugin). The view type will appear in the view switcher alongside the built-in ones and can be set as the default for any resource.

The process has three parts: **create the component**, **register the view type**, and **configure a resource to use it**.

### 1. Create the view type component

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

### 2. Register the view type

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

| Option            | Required | Description                                           |
| ----------------- | -------- | ----------------------------------------------------- |
| `component`       | Yes      | Component class or string (auto-constantized)         |
| `icon`            | Yes      | Icon path for the inactive state in the view switcher |
| `active_icon`     | Yes      | Icon path for the active state in the view switcher   |
| `translation_key` | No       | I18n key for the view type name in tooltips           |

:::info
The `component` can be passed as a string (`"MyPlugin::ViewTypes::TimelineViewTypeComponent"`) or as the class itself. Strings are constantized at render time, which avoids load-order issues during boot.
:::

### 3. Configure a resource to use it

Once registered, you can use your custom view type in any resource:

```ruby
class Avo::Resources::Event < Avo::BaseResource
  self.default_view_type = :timeline # [!code focus:2]
  self.view_types = [:table, :timeline]

  # ... fields
end
```

Setting `default_view_type` makes your view type the one users see first. Including `:table` in `view_types` keeps the table view available as a fallback via the view switcher.

## How it works under the hood

When a user visits a resource index, Avo resolves the current view type through the `ViewTypeManager`:

1. The `ViewTypeManager` holds a registry of all view types (built-in + plugin-registered)
2. It looks up the component class for the current view type via `component_for(name)`
3. The `ResourceListingComponent` renders that component with all the standard props
4. The view switcher partial reads the registry for icons and renders toggle buttons for each available view type

The view type is persisted in the URL as the `view_type` query parameter, so it survives page reloads and can be bookmarked.

## Full example: avo-notifications

The `avo-notifications` gem ships a `:notification` view type as a real-world reference. Here's how it's wired up:

**Registration** in the engine:

```ruby
# lib/avo/notifications/engine_content.rb
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

**Resource** sets it as the default:

```ruby
# app/avo/resources/avo_notification.rb
class Avo::Resources::AvoNotification < Avo::BaseResource
  self.default_view_type = :notification
  self.view_types = [:table, :notification]
end
```

## Adding styles

If your view type needs custom CSS, add it to your engine's stylesheet. Follow BEM methodology with Tailwind `@apply` directives:

```css
/* app/assets/stylesheets/my-plugin/application.css */
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

@layer components {
  .timeline-view__item {
    @apply flex gap-3 px-5 py-3.5 transition-colors;

    &:hover {
      @apply bg-gray-50;
    }
  }
}
```

Then register the stylesheet in your engine initializer:

```ruby
Avo.asset_manager.add_stylesheet "my-plugin/application"
```

## Adding interactivity with Stimulus

For client-side behavior (filtering, toggling, etc.), create a Stimulus controller in your engine and register it:

```javascript
// app/javascript/controllers/my_filter_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["item"];
  static values = { filter: { type: String, default: "all" } };

  applyFilter() {
    this.itemTargets.forEach((item) => {
      item.toggleAttribute("hidden", !this.shouldShow(item));
    });
  }

  shouldShow(item) {
    if (this.filterValue === "all") return true;
    return item.dataset.active === "true";
  }
}
```

```javascript
// app/javascript/controllers/index.js
import MyFilterController from "./my_filter_controller";

const application = window.Stimulus;
application.register("my-filter", MyFilterController);
```

Then use it in your template with `data-controller="my-filter"` and `data-action` attributes. Use the `hidden` HTML attribute (not CSS classes) for toggling visibility.
