---
feedbackId: 831
demoVideo: https://youtu.be/VMvG-j1Vxio
license: addon
addon_link: https://avohq.io/addons/menu-editor
outline: [2, 3]
api_docs: ./menu-editor-api.html
---

# Menu editor

One common task you need to do is organize your sidebar resources into menus. You can easily do that using the menu editor in the initializer.

When you start with Avo, you'll get an auto-generated sidebar by default. That sidebar will contain all your resources, dashboards, and custom tools. To customize it, add the `main_menu` key to your initializer.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section "Resources", icon: "tabler/outline/building-store", collapsable: false do
      group "Company", collapsable: true do
        resource :projects do
          link_to "First project", path: "/admin/resources/projects/1"
          link_to "Second project", path: "/admin/resources/projects/2"
        end
        resource :team, icon: "heroicons/outline/user-group"
        resource :team_membership
        resource :reviews, icon: "heroicons/outline/star"
      end
    end

    section I18n.t('avo.other'), icon: "heroicons/outline/finger-print", collapsable: true, collapsed: true do
      link_to 'Avo HQ', path: 'https://avohq.io', target: :_blank
      link_to 'Jumpstart Rails', path: 'https://jumpstartrails.com/', target: :_blank
    end
  }
end
```

<Image src="/assets/img/4_0/menu-editor/v4/main.webp" dark-src="/assets/img/4_0/menu-editor/v4/main-dark.webp" width="256" height="312" alt="Avo main menu" />

Avo has three configurable menus, all built with the same DSL: `main_menu` (the sidebar), [`profile_menu`](#profile-menu), and [`header_menu`](#header-menu). The rest of this page uses `main_menu` in its examples; the profile and header menus are covered at the end.

## Menu item types

The recommended hierarchy is [`section`](./menu-editor-api.html#section) → [`group`](./menu-editor-api.html#group) → item. Sections are the top-level containers rendered with an icon header; groups are collapsable sub-categories inside them.

The items themselves:

- [`link_to`](./menu-editor-api.html#link_to) (alias `link`) links to any path, internal or external.
- [`resource`](./menu-editor-api.html#resource) links to a resource's Index view — pass a symbol (`:users`) or the full class name (`"Avo::Resources::User"`).
- [`dashboard`](./menu-editor-api.html#dashboard) links to a [dashboard](./dashboards.html) by `id` or `name`.
- [`page`](./menu-editor-api.html#page) and [`form`](./menu-editor-api.html#form) link to your [pages and forms](./forms-and-pages.html) (requires the `avo-forms` add-on).
- [`board`](./menu-editor-api.html#board) links to a [kanban board](./kanban-boards.html) (requires the `avo-kanban` add-on).
- [`action`](./menu-editor-api.html#action) triggers a [standalone action](./actions.html) straight from the menu.
- [`render`](./menu-editor-api.html#render) renders a partial or View Component for anything custom.

If you want to change an item's label, pass `label:` — `resource :posts, label: "News posts"` works the same on `dashboard`, `page`, `form`, and `action` items.

## Add everything at once

Instead of listing items one by one, the `all_*` helpers pull in a whole category: [`all_resources`](./menu-editor-api.html#all_resources), [`all_dashboards`](./menu-editor-api.html#all_dashboards), [`all_pages`](./menu-editor-api.html#all_pages), [`all_forms`](./menu-editor-api.html#all_forms), [`all_boards`](./menu-editor-api.html#all_boards), and [`all_tools`](./menu-editor-api.html#all_tools). Most accept an `except:` array to leave specific entries out.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section "App", icon: "heroicons/outline/beaker" do
      group "Dashboards" do
        all_dashboards
      end

      group "Resources" do
        all_resources except: [:users, :orders]
      end

      group "All tools" do
        all_tools
      end
    end
  }
end
```

:::warning
The `all_resources` helper takes your [authorization](./authorization) rules into account, so make sure you have `def index?` enabled in your resource policy.
:::

<Image src="/assets/img/4_0/menu-editor/v4/all-helpers.webp" dark-src="/assets/img/4_0/menu-editor/v4/all-helpers-dark.webp" width="256" height="312" alt="Avo menu editor" />

## Sub-items

You can nest items beneath a `resource` by passing a block. They appear as child items under the resource link in the sidebar. Any item type can be nested; a nested `resource`, `dashboard`, `page`, `board`, or `action` resolves its own URL automatically, so only `link_to` needs an explicit `path:`. A nested `action` also inherits its enclosing resource, so you don't repeat it.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    resource :projects do
      link_to "First project", path: "/admin/resources/projects/1"
      resource :tasks                 # nested resource
      dashboard :sales                # nested dashboard
      page "Avo::Pages::Settings"     # nested page
      board 1                         # nested kanban board
      action Avo::Actions::ExportData # nested action (inherits :projects)
    end
  }
end
```

Avo highlights the active sub-item automatically by matching the current path, favoring the most specific match. Sub-items don't render an `icon`. For readability you can optionally wrap them in a `subitems` block — it behaves identically to listing them directly.

## Trigger actions from the menu

An [`action`](./menu-editor-api.html#action) item opens the action's modal, just like the per-resource **Actions** dropdown. Because the menu has no selected record, only [standalone actions](./actions-api.html#standalone) (`self.standalone = true`) can be added — others are skipped with a log warning.

```ruby
# app/avo/actions/export_data.rb
class Avo::Actions::ExportData < Avo::BaseAction
  self.name = "Export data" # used as the menu label unless you override it
  self.standalone = true # required to add it to the menu

  def handle(fields:, **)
    # ...generate and return the export
  end
end
```

An action always lives under a resource's URL, so you must tell it which one. At the top level `resource:` is required; nested inside a `resource` block it is inherited (an explicit `resource:` still overrides it).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    # Top level — resource: required
    action Avo::Actions::ExportData, resource: :projects, label: "Export", icon: "tabler/outline/download"

    # Nested — inherits :projects automatically
    resource :projects do
      action Avo::Actions::ExportData
    end
  }
end
```

## Item visibility

The [`visible`](./menu-editor-api.html#visible) option is available on all menu items. It can be a boolean or a block that has access to a few things:

- the `current_user`. Given that you [set a way](authentication.html#customize-the-current-user-method) for Avo to know who the current user is, that will be available in that block call
- the [`context`](customization.html#context) object.
- the `params` object of that current request
- the [`view_context`](https://apidock.com/rails/AbstractController/Rendering/view_context) object. The `view_context` object lets you use the route helpers. eg: `view_context.main_app.posts_path`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    resource :user, visible: -> do
      context[:something] == :something_else
    end
  }
end
```

A `group` hides itself automatically when every item inside it is invisible.

## Authorization

<DemoVideo demo-video="https://youtu.be/Eex8CiinQZ8?t=373" />

When you switch from a generated menu to a custom one, you might want to keep using the same [authorization](authorization) rules as before. For that scenario, use the `authorize` helper inside the `visible` block.

```ruby{5}
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    resource :team, visible: -> {
      # authorize current_user, THE_RESOURCE_MODEL, THE_POLICY_METHOD, raise_exception: false
      authorize current_user, Team, "index?", raise_exception: false
    }
  }
end
```

Give it the `current_user` (available in the block), the resource's model class, the policy method you'd like to authorize for (default is `index?`), and tell it not to raise an exception. The item's visibility will now follow the `index?` method from the `TeamPolicy` class.

## Add `data` attributes to items

You may want to add special data attributes to some items and you can do that using the [`data`](./menu-editor-api.html#data) option. For example you may add `data: { turbo: false }` to make a regular request for a link, or make a link execute a `put`, `post`, or `delete` request the same way you'd use the `data-turbo-method` attribute.

```ruby{4,5}
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    resource :user, data: { turbo: false }
    link_to "Sign out!", main_app.destroy_user_session_path, data: { turbo_method: :delete }
  }
end
```

## Icons

The [`icon`](./menu-editor-api.html#icon) option is supported on `section` and on individual menu items (`link_to`, `resource`, `dashboard`, `page`, `form`, `board`, `action`). It is not supported on `group` or on sub-items nested inside a `resource` block.

You can use icons from [Tabler Icons](https://tabler.io/icons) (preferred in Avo 4) or from [Heroicons](https://heroicons.com/) (both `outline` and `solid` variants).

```ruby
section "Resources", icon: "tabler/outline/building-store" do
  group "Blog" do
    resource :posts, icon: "heroicons/outline/academic-cap"
  end

  link_to "Avo", "https://avohq.io", icon: "tabler/outline/world"
end
```

## Keyboard shortcuts on menu items

Any menu item accepts a [`hotkey:`](./menu-editor-api.html#hotkey) option. When set, Avo renders a `<kbd>` badge next to the label and registers the key binding so users can jump straight to that item from anywhere in the admin panel.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section "Content", icon: "tabler/outline/files" do
      resource :post, hotkey: "g p"
      resource :category, hotkey: "g c"
      link_to "Analytics", path: "/avo/analytics", hotkey: "g a"
    end
  }
end
```

The hotkey string follows [@github/hotkey](https://github.com/github/hotkey) syntax. Use space-separated keys for sequences (e.g. `"g p"` means press <kbd>g</kbd> then <kbd>p</kbd>).

For `resource` items you can also set the hotkey on the resource class itself, which acts as a fallback when no `hotkey:` is passed to the menu item:

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.hotkey = "g p"
end
```

<RelatedList>
  <RelatedItem href="./keyboard-shortcuts.html">Keyboard shortcuts — full reference for built-in shortcuts and patterns</RelatedItem>
</RelatedList>

## Collapsable sections and groups

Both `section` and `group` support the [`collapsable`](./menu-editor-api.html#collapsable) option. When enabled, an arrow icon is added to indicate the item can be collapsed. The collapsed/expanded state is stored in the browser's Local Storage and remembered across page loads.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap", collapsable: true do
  group "Blog", collapsable: true do
    resource :posts
    resource :comments
  end
end
```

<Image src="/assets/img/4_0/menu-editor/collapsable.webp" dark-src="/assets/img/4_0/menu-editor/collapsable-dark.webp" width="248" height="156" alt="Avo menu editor" />

### Default collapsed state

You can set a default collapsed state using the [`collapsed`](./menu-editor-api.html#collapsed) option. This only takes effect the first time a user visits — once they have a stored preference, that preference takes priority.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap", collapsable: true, collapsed: true do
  group "Blog", collapsable: true, collapsed: true do
    resource :posts
    resource :comments
  end
end
```

<Image src="/assets/img/4_0/menu-editor/collapsed.webp" dark-src="/assets/img/4_0/menu-editor/collapsed-dark.webp" width="248" height="66" alt="Avo menu editor" />

## Profile menu

The profile menu allows you to add items to the menu displayed in the profile component. **The sign-out link is automatically added for you.**

Only `link_to` items are rendered here; other item types are ignored.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.profile_menu = -> {
    link_to "Profile", path: "/profile", icon: "user-circle"
  }
end
```

<Image src="/assets/img/4_0/menu-editor/profile-menu.webp" dark-src="/assets/img/4_0/menu-editor/profile-menu-dark.webp" width="316" height="150" alt="Avo profile menu" />

### Forms in the profile menu

It's common to have links that `POST` to a path, like signing out a user. For this scenario the profile menu's `link_to` supports the [`method`](./menu-editor-api.html#link_to) and `params` options, so if you have a custom sign-out path you can do things like this:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.profile_menu = -> {
    link_to "Sign out", path: main_app.destroy_user_session_path, icon: "user-circle", method: :post, params: { custom_param: :here }
  }
end
```

### Custom content in the profile menu

You might, however, want to add a very custom form or more items to the profile menu. For that we prepared the `_profile_menu_extra.html.erb` partial for you.

```bash
bin/rails generate avo:eject --partial :profile_menu_extra
```

This will eject the partial and you can add whatever custom content you might need.

```erb
<%# app/views/avo/partials/_profile_menu_extra.html.erb %>
<%# Example link below %>
<%#= render Avo::ProfileItemComponent.new label: 'Profile', path: '/profile', icon: 'user-circle' %>
```

## Header menu

The header menu is the row of links rendered in Avo's top navigation bar. By default it shows a single link to your `app_name`; setting `header_menu` replaces that with your own links — typically documentation, status, billing, or other external destinations. Links that don't fit collapse into a "more" dropdown automatically.

The DSL is flat — only `link_to` items render.

```ruby{3-7}
# config/initializers/avo.rb
Avo.configure do |config|
  config.header_menu = -> {
    link_to "Docs", path: "https://docs.avohq.io", target: :_blank
    link_to "Drafts", path: avo.resources_posts_path, params: { status: "draft" }
    link_to "Sign out", path: main_app.destroy_user_session_path, method: :delete
  }
end
```

Header links support the same [`link_to` options](./menu-editor-api.html#link_to) as everywhere else — including `method`, `params`, and [`title`](./menu-editor-api.html#link_to) for a hover tooltip — plus the [`visible`](./menu-editor-api.html#visible) block for conditional links.
