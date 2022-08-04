# Customize Avo

[[toc]]

## Change the app name

On the main navbar next to the logo Avo generates a link to the homepage of your app. The label for the link is usually computed from your Rails app name. You can customize that however you want using `config.app_name = 'Avocadelicious'`.

## Timezone and currency

In your data-rich app you might have a few fields where you reference `date`, `datetime` and `currency` fields. You may customize the global timezone and currency with `config.timezone = 'UTC'` and `config.currency = 'USD'` config options.

## Resource Index view

There are a few customization options to change the ways resources are displayed in the **Index** view.

### Resources per page

You my customize how many resources you can view per page with `config.per_page = 24`.

<img :src="$withBase('/assets/img/resource-index/per-page-config.jpg')" alt="Per page config" class="border mb-4" />

### Per page steps

Similarly customize the per-page steps in the per-page picker with `config.per_page_steps = [12, 24, 48, 72]`.

<img :src="$withBase('/assets/img/resource-index/per-page-steps.jpg')" alt="Per page config" class="border mb-4" />

### Resources via per page

For `has_many` associations you can control how many resources are visible in their `Index view` with `config.via_per_page = 8`.

### Default view type

The `ResourceIndex` component supports two view types `:table` and `:grid`. You can change that by `config.default_view_type = :table`. Read more on the [grid view configuration page](./grid-view.html).

<div class="grid grid-flow-row sm:grid-flow-col sm:grid-cols-2 gap-2 w-full">
  <div class="w-full">
    <strong>Table view</strong>
    <img :src="$withBase('/assets/img/customization/table-view.png')" alt="Table view" class="border mb-4" />
  </div>
  <div class="w-full">
    <strong>Grid view</strong>
    <img :src="$withBase('/assets/img/customization/grid-view.png')" alt="Grid view" class="border mb-4" />
  </div>
</div>

## ID links to resource

On the **Index** view each row has at the end the controls component which allows the user to go to the **Show** and **Edit** views, and delete that entry. If you have a long row and a not-so-wide monitor it might not be that easy to scroll to the right-most section to click the **Show** link.

To make it easier you can enable the `id_links_to_resource` config option.

```ruby{4}
Avo.configure do |config|
  config.root_path = '/avo'
  config.app_name = 'Avocadelicious'
  config.id_links_to_resource = true
end
```

This will render all `id` fields in the **Index** view as link to that resource.

<img :src="$withBase('/assets/img/fields-reference/as-link-to-resource.jpg')" alt="As link to resource" class="border mb-4" />

## Container width

```ruby{2-3}
Avo.configure do |config|
  config.full_width_index_view = false
  config.full_width_container = false
end
```

By default Avo's main content is constrained to a regular [Tailwind CSS container](https://tailwindcss.com/docs/container). If you have a lot of content or prefer to display it full-width you have two options to choose from.

### Display only the Index view full-width

Using `full_width_index_view: true` tells Avo to display the **Index** view full-width.

### Display all views full-width

Using `full_width_container: true` tells Avo to display all views full-width.

## Cache resources on Index view

By default Avo caches each resource row (or Grid item for Grid view) for the performance benefits. You can disable that cache using the `cache_resources_on_index_view` configuration option.

```ruby{2}
Avo.configure do |config|
  config.cache_resources_on_index_view = false
end
```

## Context

In the `Resource` and `Action` classes you have a global `context` object to which you can attach a custom payload. For example you may add the `current_user`, the current request `params` or any other arbitrary data.

You can configure it using the `set_context` method in your initializer. The block you pass in will be instance evaluated in `Avo::ApplicationController` so it will have access to the `current_user` method or `Current` object.

```ruby{2-8}
Avo.configure do |config|
  config.set_context do
    {
      foo: 'bar',
      user: current_user,
      params: request.params,
    }
  end
end
```

The context data can also be reached using the `::Avo::App.context` object.

## Eject views

If you want to change one of Avo's built-in views, you can eject it, update it and use it in your admin.

### Prepared templates

We prepared a few templates to make it

`bin/rails generate avo:eject :sidebar` will eject the `_sidebar.html.erb` partial.

```
▶ bin/rails generate avo:eject :sidebar
Running via Spring preloader in process 20947
      create  app/views/avo/sidebar/_sidebar.html.erb
```

A list with prepared templates:

- `:sidebar` ➡️ &nbsp; `app/views/avo/sidebar/_sidebar.html.erb`
- `:logo` ➡️ &nbsp; `app/views/avo/partials/_logo.html.erb`
- `:head` ➡️ &nbsp; `app/views/avo/partials/_head.html.erb`
- `:header` ➡️ &nbsp; `app/views/avo/partials/_header.html.erb`
- `:profile_dropdown` ➡️ &nbsp; `app/views/avo/partials/_profile_dropdown.html.erb`
- `:footer` ➡️ &nbsp; `app/views/avo/partials/_footer.html.erb`
- `:scripts` ➡️ &nbsp; `app/views/avo/partials/_scripts.html.erb`

#### Logo

In the `app/views/avo/partials` directory you will find the `_logo.html.erb` partial which you may customize however you want. It will be displayed in place of Avo's logo.

<img :src="$withBase('/assets/img/customization/logo.jpg')" alt="Avo logo customization" class="border mb-4" />

#### Header

The `_header.html.erb` partial enables you to customize the name and link of your app.

<img :src="$withBase('/assets/img/customization/header.jpg')" alt="Avo header customization" class="border mb-4" />

#### Footer

The `_footer.html.erb` partial enables you to customize the footer of your admin.

<img :src="$withBase('/assets/img/customization/footer.jpg')" alt="Avo footer customization" class="border mb-4" />

#### Scripts

The `_scripts.html.erb` partial enables you to insert scripts in the footer of your admin.

### Eject any template

You can eject any partial from Avo using the partial path.

```
▶ bin/rails generate avo:eject app/views/layouts/avo/application.html.erb
      create  app/views/layouts/avo/application.html.erb
```

**Warning:** Once ejected, the views will not be receiving updates on new Avo versions.

## Breadcrumbs

By default, Avo ships with breadcrumbs enabled.

<img :src="$withBase('/assets/img/customization/breadcrumbs.jpg')" alt="Avo breadcrumbs" class="border mb-4" />

You may disable them using the `display_breadcrumbs` configuration option.

```ruby{2}
Avo.configure do |config|
  config.display_breadcrumbs = false
end
```

The first item on the breadcrumb is **Home** with the `root_path` url. You can customize that using the `set_initial_breadcrumbs` block.

```ruby{2-5}
Avo.configure do |config|
  config.set_initial_breadcrumbs do
    add_breadcrumb "Casa", root_path
    add_breadcrumb "Something else", something_other_path
  end
end
```

Avo uses the [breadcrumbs_on_rails](https://github.com/weppos/breadcrumbs_on_rails) gem under the hood.

### Breadcrumbs for custom pages

You can add breadcrumbs to custom pages in the controller action.

```ruby{3}
class Avo::ToolsController < Avo::ApplicationController
  def custom_tool
    add_breadcrumb "Custom tool"
  end
end
```

## Page titles

When you want to update the page title for a custom tool or page, you only need to assign a value to the `@page_title` instance variable in the controller method.

```ruby{3}
class Avo::ToolsController < Avo::ApplicationController
  def custom_tool
    @page_title = "Custom tool page title"
  end
end
```

Avo uses the [meta-tags](https://github.com/kpumuk/meta-tags) gem to compile and render the page title.

## Home path

When a user clicks your logo inside Avo or goes to the `/avo` url, they will be redirected to one of your resources. You might want to change that path to be something else like a custom page. You can do that with the `home_path` configuration.

```ruby{2}
Avo.configure do |config|
  config.home_path = "/avo/dashboard"
end
```

When you configure the `home_path` option, the `Get started` sidebar item will be hidden in the development environment.

Now, whenever a user clicks the logo, they will be redirected to `/avo/dashboard`. You can use this configuration option alongside the `set_initial_breadcrumbs` option to create a more cohesive experience.

```ruby{2-5}
Avo.configure do |config|
  config.home_path = "/avo/dashboard"
  config.set_initial_breadcrumbs do
    add_breadcrumb "Dashboard", "/avo/dashboard"
  end
end
```

## Mount Avo under a nested path

You may need to mount Avo under a nested path; something like `/uk/admin`. To do that there are a few things you need to consider.

1. Move the engine mount point below any route for custom tools.

```ruby{7,10}
Rails.application.routes.draw do
  # other routes

  authenticate :user, ->(user) { user.is_admin? } do
    scope :uk do
      scope :admin do
        get "dashboard", to: "avo/tools#dashboard" # custom tool added before engine
      end

      mount Avo::Engine, at: Avo.configuration.root_path # engine mounted last
    end
  end
end
```

2. The `root_path` configuration should only be the last path segment.

```ruby
# 🚫 Don't add the scope to the root_path
Avo.configure do |config|
  config.root_path = "/uk/admin"
end

# ✅ Do this instead
Avo.configure do |config|
  config.root_path = "/admin"
end
```

3. Use full paths for other configurations.

```ruby
Avo.configure do |config|
  config.home_path = "/uk/admin/dashboard"

  config.set_initial_breadcrumbs do
    add_breadcrumb "Dashboard", "/uk/admin/dashboard"
  end
end
```

## Custom `view_component` path

You may not keep your view components under `app/components` and want the generated field `view_component`s to be generated in your custom directory. You can change that using the `view_component_path` configuration key.

```ruby
Avo.configure do |config|
  config.view_component_path = "app/frontend/components"
end
```

## Custom query scopes
You may want to change the queries to add sorting or use gems like [friendly](https://github.com/norman/friendly_id).
You can do that using `query_scope` and `find_scope`.

### Custom query scope
If you need to replace the queries in order to add a sort condition or more query fields, add the `resolve_query_scope` option to the resource definition.

```ruby
class UserResource < Avo::BaseResource
  self.resolve_query_scope = ->(model_class:) do
    model_class.order(last_name: :asc)
  end
end
```

### Custom find scope
If you need to add to the way of how a record is found, add the `resolve_find_scope` option to the resource definition.
```ruby
class UserResource < Avo::BaseResource
  self.resolve_find_scope = ->(model_class:) do
    model_class.friendly
  end
end
```

You also have to add the `friendly_id` configuration to the model definition.
```ruby
class User < ApplicationRecord
  extend FriendlyId
  friendly_id :name, use: :slugged
end
```

## Disable features

You might want to disable some Avo features. You can do that using the `disabled_features` option.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.disabled_features = [:global_search]
end
```

After this setting the global search will be hidden for users.

Supported options:

- `global_search`


<!-- @todo: add docs for use_partials custom functionality -->
