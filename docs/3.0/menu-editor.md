---
feedbackId: 831
demoVideo: https://youtu.be/VMvG-j1Vxio
license: pro
version: "2.3.0"
---

# Menu editor

One common task you need to do is organize your sidebar resources into menus. You can easily do that using the menu editor in the initializer.

When you start with Avo, you'll get an auto-generated sidebar by default. That sidebar will contain all your resources, dashboards, and custom tools. To customize that menu, you have to add the `main_menu` key to your initializer.

```ruby{3-22}
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section "Resources", icon: "heroicons/outline/academic-cap" do
      group "Academia" do
        resource :course
        resource :course_link
      end

      group "Blog", collapsable: true, collapsed: true do
        dashboard :dashy

        resource :post
        resource :comment
      end
    end

    section I18n.t('avo.other'), icon: "heroicons/outline/finger-print", collapsable: true, collapsed: true do
      link_to 'Avo HQ', path: 'https://avohq.io', target: :_blank
      link_to 'Jumpstart Rails', path: 'https://jumpstartrails.com/', target: :_blank
    end
  }
end
```

<Image src="/assets/img/menu-editor/main.jpg" width="250" height="448" alt="Avo main menu" />

For now, Avo supports editing only two menus, `main_menu` and `profile_menu`. However, that might change in the future by allowing you to write custom menus for other parts of your app.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section I18n.t("avo.dashboards"), icon: "dashboards" do
      dashboard :dashy, visible: -> { true }
      dashboard :sales, visible: -> { true }

      group "All dashboards", visible: false do
        all_dashboards
      end
    end

    section "Resources", icon: "heroicons/outline/academic-cap" do
      group "Academia" do
        resource :course
        resource :course_link
      end

      group "Blog" do
        resource :posts
        resource :comments
      end

      group "Other" do
        resource :fish
      end
    end

    section "Tools", icon: "heroicons/outline/finger-print" do
      all_tools
    end

    group do
      link_to "Avo", path: "https://avohq.io"
      link_to "Google", path: "https://google.com", target: :_blank
    end
  }
  config.profile_menu = -> {
    link_to "Profile", path: "/profile", icon: "user-circle"
  }
end
```

## Menu item types

A few menu item types are supported `link_to`, `section`, `group`, `resource`, and `dashboard`. There are a few helpers too, like `all_resources`, `all_dashboards`, and `all_tools`.

<Option name="`link_to`">

`link_to` is the menu item that the user will probably interact with the most. It will generate a link on your menu. You can specify the `name`, `path` , and `target`.

```ruby
link_to "Google", path: "https://google.com", target: :_blank
```

<Image src="/assets/img/menu-editor/external-link.jpg" width="254" height="155" alt="Avo menu editor" />

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

<Image src="/assets/img/menu-editor/resource.jpg" width="252" height="177" alt="Avo menu editor" />

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

</Option>

<Option name="`dashboard`">

Similar to `resource`, this is a helper to make it easier to reference a dashboard. You pass in the `id` or the `name` of the dashboard.

```ruby
dashboard :dashy
dashboard "Sales"
```

<Image src="/assets/img/menu-editor/dashboard.jpg" width="256" height="212" alt="Avo menu editor" />

You can also change the label for the `dashboard` items to something else.

```ruby
dashboard :dashy, label: "Dashy Dashboard"
```

</Option>

<Option name="`section`">

Sections are the big categories in which you can group your menu items. They take `name` and `icon` options.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap" do
  resource :course
  resource :course_link
end
```

<Image src="/assets/img/menu-editor/section.jpg" width="255" height="207" alt="Avo menu editor" />

</Option>

<Option name="`group`">

Groups are smaller categories where you can bring together your items.

```ruby
group "Blog" do
  resource :posts
  resource :categories
  resource :comments
end
```

<Image src="/assets/img/menu-editor/group.jpg" width="252" height="205" alt="Avo menu editor" />

</Option>

<Option name="`all_resources`">
Renders all resources.

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "Resources", icon: "resources" do
    all_resources
  end
end
```

</Option>

<Option name="`all_dashboards`">

Renders all dashboards.

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "Dashboards", icon: "dashboards" do
    all_dashboards
  end
end
```

</Option>

<Option name="`all_tools`">

Renders all tools.

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "All tools", icon: "tools" do
    all_tools
  end
end
```

</Option>

### `all_` helpers

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "Dashboards", icon: "dashboards" do
    all_dashboards
  end

  group "Resources", icon: "resources" do
    all_resources
  end

  group "All tools", icon: "tools" do
    all_tools
  end
end
```

:::warning
The `all_resources` helper is taking into account your [authorization](./authorization) rules, so make sure you have `def index?` enabled in your resource policy.
:::

<Image src="/assets/img/menu-editor/all-helpers.jpg" width="254" height="732" alt="Avo menu editor" />

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

For [`Section`](#section)s, you can use icons to make them look better. You can use some local ones that we used throughout the app and all [heroicons](https://heroicons.com/) designed by [Steve Schoger](https://twitter.com/steveschoger). In addition, you can use the `solid` or `outline` versions. We used the `outline` version throughout the app.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap" do
  resource :course
end

section "Resources", icon: "heroicons/solid/finger-print" do
  resource :course
end

section "Resources", icon: "heroicons/outline/adjustments" do
  resource :course
end
```

<Image src="/assets/img/menu-editor/icons.jpg" width="253" height="328" alt="Avo menu editor" />

### Icons on resource, dashboard, and link_to items

You can add icons to other menu items like `resource`, `dashboard`, and `link_to`.

```ruby
link_to "Avo", "https://avohq.io", icon: "globe"
```

## Collapsable sections and groups

When you have a lot of items they can take up a lot of vertical space. You can choose to make those sidebar sections collapsable by you or your users.

```ruby
section "Resources", icon: "resources", collapsable: true do
  resource :course
end
```

<Image src="/assets/img/menu-editor/collapsable.jpg" width="250" height="182" alt="Avo menu editor" />

That will add the arrow icon next to the section to indicate it's collapsable. So when your users collapse and expand it, their choice will be stored in Local Storage and remembered in that browser.

### Default collapsed state

You can however, set a default collapsed state using the `collapsed` option.

```ruby
section "Resources", icon: "resources", collapsable: true, collapsed: true do
  resource :course
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
