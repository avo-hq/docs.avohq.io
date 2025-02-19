---
feedbackId: 836
license: community
---

# Custom pages (custom tools)

You may use custom tools to create custom sections or views to add to your app.

## Generate tools

`bin/rails generate avo:tool dashboard` will generate the necessary files to show the new custom tool.

```bash{2-6}
▶ bin/rails generate avo:tool dashboard
      create  app/views/avo/sidebar/items/_dashboard.html.erb
      insert  app/controllers/avo/tools_controller.rb
      create  app/views/avo/tools/dashboard.html.erb
       route  namespace :avo do
  get "dashboard", to: "tools#dashboard"
end
```

### Controller

If this is your first custom tool, a new `ToolsController` will be generated for you. Within this controller, Avo created a new method.

```ruby
class Avo::ToolsController < Avo::ApplicationController
  def dashboard
  end
end
```

You can keep this action in this controller or move it to another controller and organize it differently.

### Route

```ruby{2-4}
Rails.application.routes.draw do
  namespace :avo do
    get "dashboard", to: "tools#dashboard"
  end

  authenticate :user, ->(user) { user.admin? } do
    mount_avo
  end
end
```

The route generated is wrapped inside a namespace with the `Avo.configuration.root_path` name. Therefore, you may move it inside your authentication block next to the Avo mounting call.

### Sidebar item

The `_dashboard.html.erb` partial will be added to the `app/views/avo/sidebar/items` directory. All the files in this directory will be loaded by Avo and displayed in the sidebar. They are displayed alphabetically, so you may change their names to reorder the items.

### Customize the sidebar

If you want to customize the sidebar partial further, you can [eject](./eject-views.html#partial) and update it to your liking. We're planning on creating a better sidebar customization experience later this year.

## Add assets

You might want to import assets (javascript and stylesheets files) when creating custom tools or fields. You can do that so easily from v1.3. Please follow [this guide](./custom-asset-pipeline.html) to bring your assets with your asset pipeline.


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

```erb{13}
# app/views/avo/tools/dashboard.html.erb
<div class="flex flex-col">
  <%= render Avo::PanelComponent.new title: 'Dashboard', display_breadcrumbs: true do |c| %>
    <% c.with_tools do %>
      <div class="text-sm italic">This is the panels tools section.</div>
    <% end %>

    <% c.with_body do %>
      <div class="flex flex-col justify-between py-6 min-h-24">
        <div class="px-6 space-y-4">
          <h3>What a nice new tool 👋</h3>

          <%= custom_helper %>
        </div>
      </div>
    <% end %>
  <% end %>
</div>
```

### Using path helpers

Because you're in a Rails engine, you will have to prepend the engine object to the path.

#### For Avo paths

Instead of writing `resources_posts_path(1)` you have to write `avo.resources_posts_path(1)`.

#### For the main app paths

When you want to reference paths from your main app, instead of writing `posts_path(1)`, you have to write `main_app.posts_path`.
