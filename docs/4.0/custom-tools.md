---
feedbackId: 836
license: community
outline: [2, 3]
---

# Custom tools

You may use custom tools to create custom sections or pages to add to your app.

:::info Custom tools vs. resource tools
A custom tool is a **standalone page** — its own route, controller action, and sidebar item. If instead you want to embed a custom partial **inside a resource's `Show` or `Edit` view**, reach for a [resource tool](./resource-tools.html).
:::

## Generate tools

`bin/rails generate avo:tool dashboard` will generate the necessary files to show the new custom tool.

```bash{2-6}
▶ bin/rails generate avo:tool dashboard
      create  app/views/avo/sidebar/items/_dashboard.html.erb
      create  app/controllers/avo/tools_controller.rb
      insert  app/controllers/avo/tools_controller.rb
      create  app/views/avo/tools/dashboard.html.erb
      insert  config/routes.rb
```

The generator restarts the server at the end so the new route takes effect.

### Controller

If this is your first custom tool, a new `ToolsController` is generated for you. The generator inserts an action into it, pre-filled with a page title and a breadcrumb.

```ruby
# app/controllers/avo/tools_controller.rb
class Avo::ToolsController < Avo::ApplicationController
  def dashboard
    @page_title = "Dashboard"
    add_breadcrumb title: "Dashboard"
  end
end
```

You can keep this action here or move it to another controller and organize it differently.

### Route

The route is injected **inside your `mount_avo` block** in `config/routes.rb`, so it inherits whatever wraps that call:

```ruby{3}
# config/routes.rb
authenticate :user, ->(user) { user.is_admin? } do
  mount_avo do
    get "dashboard", to: "tools#dashboard", as: :dashboard
  end
end
```

If `mount_avo` is a one-liner (`mount_avo` or `mount_avo at: "avo"`), the generator converts it to block form and drops the route inside. If it's already a block, the route is injected into it. Existing indentation is preserved.

:::info
Because the route lives inside `mount_avo`, it's protected by the same authentication as the rest of Avo — the `authenticate` block above covers it too.

The one exception is the fallback: if your `config/routes.rb` has no `mount_avo` call at all, the generator appends a standalone `Avo::Engine.routes.draw` block instead, and **that** route is not behind any auth. Secure it yourself if needed. See [Routing](./routing.html) and [Rails engines & paths](./rails-engines-paths.html) for the details of routing inside the engine.
:::

### Sidebar item

The `_dashboard.html.erb` partial will be added to the `app/views/avo/sidebar/items` directory. All the files in this directory will be loaded by Avo and displayed in the sidebar. They are displayed alphabetically, so you may change their names to reorder the items.

### Customize the sidebar

If you want to customize the sidebar partial further, you can [eject](./eject-views.html#eject-a-partial) and update it to your liking. We're planning on creating a better sidebar customization experience later this year.

## What's available in your tool

A custom tool isn't an isolated component — it's a plain Rails view (`app/views/avo/tools/dashboard.html.erb`) rendered inside Avo's layout by an action on a controller that inherits from `Avo::ApplicationController`. That means your view runs with the **full Avo view context**: anything Avo exposes to its own screens is available to yours.

The pieces you'll reach for most:

| Variable / helper | What it is |
| --- | --- |
| `ui` | Avo's UI component builder — `ui.panel`, `panel.with_card`, `ui.description_list`, and the rest of the components Avo renders everywhere. Using these keeps your tool visually consistent and dark-mode-ready. |
| `@page_title` | The page title, pre-set by the generator. Assign any instance variable in the action and it's available in the view, just like a normal Rails controller. |
| `_current_user` | The currently signed-in user, as resolved by Avo's [authentication](./authentication.html). |
| `Avo::Current.context` | Your app-wide [`context` object](./customization.html#context). |
| `params` | The request params, as in any Rails view. |
| `avo.` / `main_app.` path helpers | Route helpers for the engine and your main app — see [Using path helpers](#using-path-helpers) below. |

Everything is wired through the controller action, so the usual Rails rules apply: set instance variables in the action, read them in the view, and pull in your own helpers with the [`helper` method](#using-helpers-from-your-app).

## Set the page title

The generator already assigns a `@page_title` for you. To change it, edit that instance variable in the controller action.

```ruby{4}
# app/controllers/avo/tools_controller.rb
class Avo::ToolsController < Avo::ApplicationController
  def dashboard
    @page_title = "Custom tool page title"
  end
end
```

Avo uses the [meta-tags](https://github.com/kpumuk/meta-tags) gem to compile and render the page title.

## Add assets

You might want to import assets (javascript and stylesheets files) when creating custom tools or fields. Please follow the [Asset handling guide](./asset-handling.html) to bring your assets with your asset pipeline.


## Using helpers from your app

You'll probably want to use some of your helpers in your custom tools. To have them available inside your custom controllers inherited from Avo's `ApplicationController`, you need to include them using the `helper` method.

```ruby{3-5,10}
# app/helpers/home_helper.rb
module HomeHelper
  def custom_helper
    'hey from custom helper'
  end
end

# app/controllers/avo/tools_controller.rb
class Avo::ToolsController < Avo::ApplicationController
  helper HomeHelper

  def dashboard
    @page_title = "Dashboard"
  end
end
```

```erb{12}
<%# app/views/avo/tools/dashboard.html.erb %>
<div class="flex flex-col">
  <%= render ui.panel(title: 'Dashboard') do |panel| %>
    <% panel.with_controls do %>
      <div class="text-sm italic">This is the panels tools section.</div>
    <% end %>

    <% panel.with_card(title: "New tool", padded: true) do %>
      <div class="flex flex-col justify-between min-h-24 space-y-4">
        <h3>What a nice new tool 👋</h3>

        <%= custom_helper %>
      </div>
    <% end %>
  <% end %>
</div>
```

:::tip Reuse Avo's UI components
`ui.panel` and `panel.with_card` are the same building blocks Avo renders everywhere else — the [`Avo::UI::PanelComponent`](./native-components/avo-panel-component.html) and the [`Avo::UI::CardComponent`](./native-components/avo-card-component.html) it wraps content in. Reaching for them (instead of hand-rolling `<div>`s) keeps your custom tool visually consistent with the rest of the app and gives you dark mode for free. Prefer their built-in options over patching the markup with utility classes — `padded: true` gives the card body Avo's standard padding instead of adding your own `px-*`/`py-*`, and `title:`/`description:` build the header for you. When your content is a **list of fields**, wrap it in `ui.description_list` so they get full width and dividers. For colors, spacing, and dark-mode tokens, follow the [theming guide](./appearance.html).
:::

### Using path helpers

Because you're in a Rails engine, you will have to prepend the engine object to the path.

#### For Avo paths

Instead of writing `resources_posts_path(1)` you have to write `avo.resources_posts_path(1)`.

#### For the main app paths

When you want to reference paths from your main app, instead of writing `posts_path(1)`, you have to write `main_app.posts_path`.
