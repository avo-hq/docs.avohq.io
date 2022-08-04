# Custom tools

[[toc]]

<div class="rounded-md bg-blue-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-blue-700">
        This is a <a href="https://avohq.io/purchase/pro" target="_blank" class="underline">pro</a> feature
      </div>
    </div>
  </div>
</div>

<a href="https://github.com/avo-hq/avo/discussions/836" target="_blank" class="rounded bg-purple-600 hover:bg-purple-500 text-white no-underline px-2 py-1 inline leading-none mt-2">
  Provide feedback
</a>

Avo makes it easy to add custom tools and pages to your dashboard.

## Generate tools

`bin/rails generate avo:tool dashboard` will generate the necessary files to show the new custom tool.

```
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
    mount Avo::Engine => Avo.configuration.root_path
  end
end
```

The route generated is wrapped inside a namespace with the `Avo.configuration.root_path` name. You may move it inside your authentication block next to the Avo mounting call.

### Sidebar item

The `_dashboard.html.erb` partial will be added to the `app/views/avo/sidebar/items` directory. All the files in this directory will be loaded by Avo and displayed in the sidebar. They are displayed in alphabetical order so you may change their name to reorder the items.

### Customize the sidebar

If you want to further customize the sidebar partial you can [eject](./customization.html#eject-views) it and update it to your liking. We're planning on creating a better sidebar customization experience later this year.

## Add assets

When creating custom tools or fields, you might want to import assets (javascript and stylesheets files). You can do that so easily from v1.3. Please follow [this guide](./custom-asset-pipeline.html) to bring your assets with your asset pipeline.


## Using helpers from your app

You'll probably want to use some of your helpers in your custom tools. In order to have them available inside your custom controllers that inherit from Avo's `ApplicationController` you need to include them using the `helper` method.

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
    <% c.tools do %>
      <div class="text-sm italic">This is the panels tools section.</div>
    <% end %>

    <% c.body do %>
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

Because you're in a Rails engine you will have to prepend the engine object to the path.

#### For Avo paths

Instead of writing `resources_posts_path(1)` you have to write `avo.resources_posts_path(1)`.

#### For the main app paths

When you want to reference paths from your main app, instead of writing `posts_path(1)` you have to write `main_app.posts_path`.
