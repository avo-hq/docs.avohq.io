---
feedbackId: 831
demoVideo: https://youtu.be/VMvG-j1Vxio
license: pro
version: "2.3.0"
---

# Menu editor

One common task you need to do is organize your sidebar resources into menus. You can easily do that using the menu editor in the initializer.

When you start with Avo, you'll get an auto-generated sidebar by default. That sidebar will contain all your resources, dashboards, and custom tools. To customize that menu, you have to add the `main_menu` key to your initializer.

```ruby{3-20}
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section "Resources", icon: "tabler/outline/building-store", collapsable: false do
      group "Company", collapsable: true do
        resource :projects, path: "/admin/resources/projects" do
          link "First project", active: :inclusive, path: "/admin/resources/projects/1"
          link "Second project", active: :inclusive, path: "/admin/resources/projects/2"
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

<Image src="/assets/img/menu-editor/v4/main.png" width="250" height="350" alt="Avo main menu" />

For now, Avo supports editing only two menus, `main_menu` and `profile_menu`. However, that might change in the future by allowing you to write custom menus for other parts of your app.

## Menu item types

A few menu item types are supported: `link_to`, `section`, `group`, `resource`, `dashboard`, and `subitems`. There are a few helpers too, like `all_resources`, `all_dashboards`, and `all_tools`.

The recommended hierarchy is `section → group → resource → subitem`. Sections are the top-level containers rendered with an icon header in the sidebar.
<!-- here add the short details about the rest of the cases-->

<Option name="`link_to`">

`link_to` is the menu item that the user will probably interact with the most. It will generate a link on your menu. You can specify the `name`, `path` , and `target`.

```ruby
link_to "Google", path: "https://google.com", target: :_blank
```

When you add the `target: :_blank` option, a tiny external link icon will be displayed.

#### `link_to` options

#### `path`

This is the path of the item.
It may be ommited to make the API look like Rail's

```ruby
config.main_menu = -> {
  # These two are equivalent
  link_to "Home", path: main_app.root_path
  link_to "Home", main_app.root_path
}
```

##### `data`

You may add arbitraty `data` attributes to your link.

You can make a link execute a `put`, `post`, or `delete` request similar to how you use the `data-turbo-method` attribute.

```ruby
config.main_menu = -> {
  link_to "Sign out!", main_app.destroy_user_session_path, data: { turbo_method: :delete }
}
```

</Option>

<Option name="`render`">

The `render` method will render renderable objects like partials or View Components.

You can even pass `locals` to partials.
The partials follow the same pattern as the regular `render` method.

```ruby
render "avo/sidebar/items/custom_tool"
render "avo/sidebar/items/custom_tool", locals: { something: :here }
render Super::Dooper::Component.new(something: :here)
```

</Option>

<Option name="`resource`">

To make it a bit easier, you can use `resource` to quickly generate a link to one of your resources. For example, you can pass a short symbol name `:user` or the full name `Avo::Resources::User`.

```ruby
resource :posts
resource "Avo::Resources::Comments"
```

You can also change the label for the `resource` items to something else.

```ruby
resource :posts, label: "News posts"
```

Additionally, you can pass the `params` option to the `resource` items to add query params to the link.

```ruby
resource :posts, params: { status: "published" }
resource :users, params: -> do
  decoded_filter = {"Avo::Filters::IsAdmin"=>["non_admins"]}

  { encoded_filters: Avo::Filters::BaseFilter.encode_filters(decoded_filter)}
end
```

### Subitems

You can add sub-links beneath a resource by passing a block. These appear as child items under the resource link in the sidebar and are useful for linking to filtered views, specific records, or nested paths.

```ruby
resource :projects, path: "/admin/resources/projects" do
  link "First project", active: :inclusive, path: "/admin/resources/projects/1"
  link "Second project", active: :inclusive, path: "/admin/resources/projects/2"
end
```

The `active` option controls when the sub-link is highlighted as active:
- `:inclusive` — the link is active when the current path starts with the given `path` (useful for nested routes)
- `:exclusive` — the link is active only on an exact path match (default)

</Option>

<Option name="`subitems`">

`subitems` is an optional wrapper you can use inside a `resource` block to make the sub-links more explicit and readable. It is functionally equivalent to writing links directly in the block. Note that `subitems` and the `link` items within it do not support the `icon` option.

```ruby
# These two are equivalent
resource :projects do
  link "New project", path: "/admin/resources/projects/new"
  link "All projects", path: "/admin/resources/projects"
end

resource :projects do
  subitems do
    link "New project", path: "/admin/resources/projects/new"
    link "All projects", path: "/admin/resources/projects"
  end
end
```

</Option>

<Option name="`dashboard`">

Similar to `resource`, this is a helper to make it easier to reference a dashboard. You pass in the `id` or the `name` of the dashboard.

```ruby
dashboard :dashy
dashboard "Sales"
```

You can also change the label for the `dashboard` items to something else.

```ruby
dashboard :dashy, label: "Dashy Dashboard"
```

</Option>

<Option name="`section`">

Sections are the **top-level containers** in the sidebar. They are rendered with a prominent header that includes an `icon` and a `name`. Sections are intended to group related `group`s and items at the highest level of the menu.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap" do
  group "Academia", collapsable: true do
    resource :course
    resource :course_link
  end

  group "Blog", collapsable: true, collapsed: true do
    resource :posts
    resource :comments
  end
end
```

You can also place items directly inside a section without a group:

```ruby
section "Tools", icon: "heroicons/outline/finger-print" do
  all_tools
end
```

</Option>

<Option name="`group`">

Groups are **sub-categories** nested inside sections. They render as a collapsable label and are used to cluster related items within a section. Groups support `collapsable` and `collapsed` options. Note that groups do not support the `icon` option.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap" do
  group "Blog", collapsable: true, collapsed: true do
    resource :posts
    resource :categories
    resource :comments
  end
end
```

Groups can also be placed at the top level without a parent section, but the recommended structure is to nest them inside sections.

</Option>

<Option name="`all_resources`">

Renders all resources, except those explicitly excluded.

#### Arguments:
- `except`: *(Array, optional)* – A list of resource names to be excluded.

#### Example:

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "Resources" do
    all_resources except: [:users, :orders]
  end
end
```

In the example above, all resources will be rendered except `Avo::Resources::Users` and `Avo::Resources::Orders`.

</Option>

<Option name="`all_dashboards`">

Renders all dashboards, except those explicitly excluded.

#### Arguments:
- `except`: *(Array, optional)* – A list of dashboard names to be excluded.

#### Example:

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "Dashboards" do
    all_dashboards except: [:sales, :analytics]
  end
end
```

In this example, all dashboards will be rendered except `Avo::Resources::Sales` and `Avo::Resources::Analytics`.

</Option>

<Option name="`all_tools`">

Renders all tools.

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "All tools" do
    all_tools
  end
end
```

</Option>

### `all_` helpers

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "Dashboards" do
    all_dashboards
  end

  group "Resources" do
    all_resources
  end

  group "All tools" do
    all_tools
  end
end
```

:::warning
The `all_resources` helper is taking into account your [authorization](./authorization) rules, so make sure you have `def index?` enabled in your resource policy.
:::

<Image src="/assets/img/menu-editor/v4/all-helpers.png" width="254" height="350" alt="Avo menu editor" />

## Item visibility

The `visible` option is available on all menu items. It can be a boolean or a block that has access to a few things:

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

## Add `data` attributes to items

<VersionReq version="2.16" />

You may want to add special data attributes to some items and you can do that using the `data` option. For example you may add `data: {turbo: false}` to make a regular request for a link.

```ruby{4}
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    resource :user, data: {turbo: false}
  }
end
```

## Using authorization rules

When you switch from a generated menu to a custom one, you might want to keep using the same authorization rules as before. To quickly do that, use the `authorize` method in the `visible` option.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    resource :team, visible: -> do
      # authorize current_user, MODEL_THAT_NEEDS_TO_BE_AUTHORIZED, METHOD_THAT_NEEDS_TO_BE_AUTHORIZED
      authorize current_user, Team, "index?", raise_exception: false
    end
  }
end
```

## Icons

The `icon` option is supported on `section` and on individual menu items (`link_to`, `resource`, `dashboard`). It is not supported on `group` or `subitems` (including links within subitems).

You can use icons from [Heroicons](https://heroicons.com/) (both `outline` and `solid` variants) or from [Tabler Icons](https://tabler.io/icons) (preferred in Avo 4).

```ruby
section "Resources", icon: "heroicons/solid/academic-cap" do
  group "Blog" do
    resource :posts, icon: "heroicons/outline/academic-cap"
  end
end

section "Resources", icon: "heroicons/solid/finger-print" do
  resource :course, icon: "heroicons/outline/finger-print"
end

section "Resources", icon: "heroicons/solid/adjustments" do
  resource :course, icon: "heroicons/outline/adjustments"
end
```

### Icons on resource, dashboard, and link_to

In addition to sections, you can add icons to `resource`, `dashboard`, and `link_to` items.

```ruby
link_to "Avo", "https://avohq.io", icon: "globe"
```

## Keyboard shortcuts on menu items

Any menu item — `resource`, `link`, or `dashboard` — accepts a `hotkey:` option. When set, Avo renders a `<kbd>` badge next to the label and registers the key binding so users can jump straight to that item from anywhere in the admin panel.

```ruby
Avo.configure do |config|
  config.main_menu = -> {
    section "Content", icon: "tabler/outline/files" do
      resource :post, hotkey: "g p"
      resource :category, hotkey: "g c"
      link "Analytics", path: "/avo/analytics", hotkey: "g a"
    end
  }
end
```

The hotkey string follows [@github/hotkey](https://github.com/github/hotkey) syntax. Use space-separated keys for sequences (e.g. `"g p"` means press <kbd>g</kbd> then <kbd>p</kbd>).

For `resource` items you can also set the hotkey on the resource class itself, which acts as a fallback when no `hotkey:` is passed to the menu item:

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.hotkey = "g p"
end
```

<RelatedList>
  <RelatedItem href="./keyboard-shortcuts.html">Keyboard shortcuts — full reference for built-in shortcuts and patterns</RelatedItem>
</RelatedList>

## Collapsable sections and groups

Both `section` and `group` support the `collapsable` option. When enabled, an arrow icon is added to indicate the item can be collapsed. The collapsed/expanded state is stored in the browser's Local Storage and remembered across page loads.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap", collapsable: true do
  group "Blog", collapsable: true do
    resource :posts
    resource :comments
  end
end
```

<Image src="/assets/img/menu-editor/collapsable.jpg" width="250" height="182" alt="Avo menu editor" />

### Default collapsed state

You can set a default collapsed state using the `collapsed` option. This only takes effect the first time a user visits — once they have a stored preference, that preference takes priority.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap", collapsable: true, collapsed: true do
  group "Blog", collapsable: true, collapsed: true do
    resource :posts
    resource :comments
  end
end
```

<Image src="/assets/img/menu-editor/collapsed.jpg" width="250" height="182" alt="Avo menu editor" />

You might want to allow your users to hide certain items from view.

## Authorization

<DemoVideo demo-video="https://youtu.be/Eex8CiinQZ8?t=373" />

If you use the [authorization feature](authorization), you will need an easy way to authorize your items in the menu builder.
For that scenario, we added the `authorize` helper.

```ruby{3}
Avo.configure do |config|
  config.main_menu = -> {
    resource :team, visible: -> {
      # authorize current_user, THE_RESOURCE_MODEL, THE_POLICY_METHOD, raise_exception: false
      authorize current_user, Team, "index?", raise_exception: false
    }
  }
end
```

Use it in the `visible` block by giving it the `current_user` (which is available in that block), the class of the resource, the method that you'd like to authorize for (default is `index?`), and tell it not to throw an exception.

Now, the item visibility will use the `index?` method from the `TeamPolicy` class.

## Profile menu

The profile menu allows you to add items to the menu displayed in the profile component. **The sign-out link is automatically added for you.**

You may add the `icon` option to the `profile_menu` links.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.profile_menu = -> {
    link_to "Profile", path: "/profile", icon: "user-circle"
  }
end
```

<Image src="/assets/img/menu-editor/profile-menu.png" width="276" height="192" alt="Avo profile menu" />

## Forms in profile menu

It's common to have forms that `POST` to a path to do sign ut a user. For this scenario we added the `method` and `params` option to the profile item `link_to`, so if you have a custom sign out path you can do things like this.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.profile_menu = -> {
    link_to "Sign out", path: main_app.destroy_user_session_path, icon: "user-circle", method: :post, params: {custom_param: :here}
  }
end
```

## Custom content in the profile menu

You might, however, want to add a very custom form or more items to the profile menu. For that we prepared the `_profile_menu_extra.html.erb` partial for you.

```bash
bin/rails generate avo:eject --partial :profile_menu_extra
```

This will eject the partial and you can add whatever custom content you might need.

```erb
<%# Example link below %>
<%#= render Avo::ProfileItemComponent.new label: 'Profile', path: '/profile', icon: 'user-circle' %>
```
