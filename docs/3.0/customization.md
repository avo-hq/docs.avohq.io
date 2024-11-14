---
feedbackId: 836
---

# Customization options

## Change the app name

On the main navbar next to the logo, Avo generates a link to the homepage of your app. The label for the link is usually computed from your Rails app name. You can customize that however, you want using `config.app_name = 'Avocadelicious'`.

The `app_name` option is also callable using a block. This is useful if you want to reference a `I18n.t` method or something more dynamic.

```ruby
Avo.configure do |config|
  config.app_name = -> { I18n.t "app_name" }
end
```

## Timezone and Currency

Your data-rich app might have a few fields where you reference `date`, `datetime`, and `currency` fields. You may customize the global timezone and currency with `config.timezone = 'UTC'` and `config.currency = 'USD'` config options.

## Resource Index view

There are a few customization options to change how resources are displayed in the **Index** view.

### Resources per page

You may customize how many resources you can view per page with `config.per_page = 24`.

<Image src="/assets/img/resource-index/per-page-config.jpg" width="648" height="438" alt="Per page config" />

### Per page steps

Similarly customize the per-page steps in the per-page picker with `config.per_page_steps = [12, 24, 48, 72]`.

<Image src="/assets/img/resource-index/per-page-steps.jpg" width="628" height="422" alt="Per page config" />

### Resources via per page

For `has_many` associations you can control how many resources are visible in their `Index view` with `config.via_per_page = 8`.

### Default view type

The `ResourceIndex` component supports two view types `:table` and `:grid`. You can change that by `config.default_view_type = :table`. Read more on the [grid view configuration page](./grid-view.html).

<div class="grid grid-flow-row sm:grid-flow-col sm:grid-cols-2 gap-2 w-full">
  <div class="w-full">
    <strong>Table view</strong>
    <Image src="/assets/img/customization/table-view.png" width="2400" height="1500" alt="Table view" />
  </div>
  <div class="w-full">
    <strong>Grid view</strong>
    <Image src="/assets/img/customization/grid-view.jpg" width="1312" height="1096" alt="Grid view" />
  </div>
</div>

## ID links to resource

On the **Index** view, each row has the controls component at the end, which allows the user to go to the **Show** and **Edit** views and delete that entry. If you have a long row and a not-so-wide display, it might not be easy to scroll to the right-most section to click the **Show** link.

You can enable the `id_links_to_resource` config option to make it easier.

```ruby{4}
Avo.configure do |config|
  config.root_path = '/avo'
  config.app_name = 'Avocadelicious'
  config.id_links_to_resource = true
end
```

That will render all `id` fields in the **Index** view as a link to that resource.

<Image src="/assets/img/fields-reference/as-link-to-resource.jpg" width="694" height="166" alt="As link to resource" />

## Resource controls on the left or both sides
<DemoVideo demo-video="https://youtu.be/MfryUtcXqvU?t=706" />

By default, the resource controls are located on the right side of the record rows, which might be hidden if there are a lot of columns. You might want to move the controls to the left side in that situation using the `resource_controls_placement` option.

```ruby{2}
Avo.configure do |config|
  config.resource_controls_placement = :left
end
```

<Image src="/assets/img/customization/resource-controls-left.jpg" width="1206" height="920" alt="Resource controls on the left side" />

<VersionReq version="3.13.7" class="mt-2" />

You might want to render the controls on both sides

```ruby{2}
Avo.configure do |config|
  config.resource_controls_placement = :both
end
```

## Container width

```ruby{2-3}
Avo.configure do |config|
  config.full_width_index_view = false
  config.full_width_container = false
end
```

Avo's default main content is constrained to a regular [Tailwind CSS container](https://tailwindcss.com/docs/container). If you have a lot of content or prefer to display it full-width, you have two options.

### Display the `Index` view full-width

Using `full_width_index_view: true` tells Avo to display the **Index** view full-width.

### Display all views full-width

Using `full_width_container: true` tells Avo to display all views full-width.

## Cache resources on the `Index` view

Avo caches each resource row (or Grid item for Grid view) for performance reasons. You can disable that cache using the `cache_resources_on_index_view` configuration option. The cache key is using the record's `id` and `created_at` attributes and the resource file `md5`.

:::info
If you use the `visibility` option to show/hide fields based on the user's role, you should disable this setting.
:::

```ruby{2}
Avo.configure do |config|
  config.cache_resources_on_index_view = false
end
```

## Context

In the `Resource` and `Action` classes, you have a global `context` object to which you can attach a custom payload. For example, you may add the `current_user`, the current request `params`, or any other arbitrary data.

You can configure it using the `set_context` method in your initializer. The block you pass in will be instance evaluated in `Avo::ApplicationController`, so it will have access to the `current_user` method or `Current` object.

```ruby{3-6}
Avo.configure do |config|
  config.set_context do
    {
      foo: 'bar',
      params: request.params,
    }
  end
end
```

:::warning `_current_user`
It's recommended you don't store your current user here but using the [`current_user_method`](./authentication.html#customize-the-current-user-method) config.
:::

You can access the context data with `::Avo::App.context` object.

## Eject
[This section has moved.](./eject-views)

## Breadcrumbs

By default, Avo ships with breadcrumbs enabled.

<Image src="/assets/img/customization/breadcrumbs.jpg" width="618" height="297" alt="Avo breadcrumbs" />

You may disable them using the `display_breadcrumbs` configuration option.

```ruby{2}
Avo.configure do |config|
  config.display_breadcrumbs = false
end
```

The first item on the breadcrumb is **Home** with the `root_path` URL. You can customize that using the `set_initial_breadcrumbs` block.

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

When a user clicks your logo inside Avo or goes to the `/avo` URL, they will be redirected to one of your resources. You might want to change that path to something else, like a custom page. You can do that with the `home_path` configuration.

```ruby{2}
Avo.configure do |config|
  config.home_path = "/avo/dashboard"
end
```

### Use a lambda function for the home_path

<VersionReq version="2.8.0" class="mt-2" />

You can also use a lambda function to define that path.

```ruby{2}
Avo.configure do |config|
  config.home_path = -> { avo_dashboards.dashboard_path(:dashy) }
end
```

When you configure the `home_path` option, the `Get started` sidebar item will be hidden in the development environment.

Now, users will be redirected to `/avo/dashboard` whenever they click the logo. You can use this configuration option alongside the `set_initial_breadcrumbs` option to create a more cohesive experience.

```ruby{2-5}
Avo.configure do |config|
  config.home_path = "/avo/dashboard"
  config.set_initial_breadcrumbs do
    add_breadcrumb "Dashboard", "/avo/dashboard"
  end
end
```

## Mount Avo under a nested path

You may need to mount Avo under a nested path, something like `/uk/admin`. In order to do that, you need to consider a few things.

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

You may want to change Avo's queries to add sorting or use gems like [friendly](https://github.com/norman/friendly_id).
You can do that using `index_query` for multiple records and `find_record_method` when fetching one record.

### Custom scope for `Index` page

Using `index_query` you tell Avo how to fetch the records for the `Index` view.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.index_query = -> {
    query.order(last_name: :asc)
  }
end
```

### Custom find method for `Show` and `Edit` pages

Using `find_record_method` you tell Avo how to fetch one record for `Show` and `Edit` views and other contexts where a record needs to be fetched from the database.

This is very useful when you use something like `friendly` gem, custom `to_param` methods on your model, and even the wonderful `prefix_id` gem.

#### Custom `to_param` method

The following example shows how you can update the `to_param` (to use the post name) method on the `User` model to use a custom attribute and then update the `Avo::Resources::User` so it knows how to search for that model.

::: code-group
```ruby [app/avo/resources/post.rb]
class Avo::Resource::Post < Avo::BaseResource
  self.find_record_method = -> {
    # When using friendly_id, we need to check if the id is a slug or an id.
    # If it's a slug, we need to use the find_by_slug method.
    # If it's an id, we need to use the find method.
    # If the id is an array, we need to use the where method in order to return a collection.
    if id.is_a?(Array)
      id.first.to_i == 0 ? query.where(slug: id) : query.where(id: id)
    else
      id.to_i == 0 ? query.find_by_slug(id) : query.find(id)
    end
  }
end
```

```ruby [app/models/post.rb]
class Post < ApplicationRecord
  before_save :update_slug

  def to_param
    slug || id
  end

  def update_slug
    self.slug = name.parameterize
  end
end
```
:::

#### Using the `friendly` gem

::: code-group
```ruby [app/avo/resources/user.rb]
class Avo::Resources::User < Avo::BaseResource
  self.find_record_method = -> {
    if id.is_a?(Array)
      query.where(slug: id)
    else
      # We have to add .friendly to the query
      query.friendly.find id
    end
  }
end
```

```ruby [app/models/user.rb]
class User < ApplicationRecord
  extend FriendlyId

  friendly_id :name, use: :slugged
end
```
:::

#### Using `prefixed_ids` gem

You really don't have to do anything on Avo's side for this to work. You only need to add the `has_prefix_id` the model as per the documentation. Avo will know how to search for the record.

```ruby
class Course < ApplicationRecord
  has_prefix_id :course
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

<VersionReq version="3.13.5" /> `disabled_features` become callable. Within this block, you gain access to all attributes of [`Avo::ExecutionContext`](execution-context)

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.disabled_features = -> { current_user.is_admin? ? [] : [:global_search] }
end
```

After this setting, the global search will be hidden for users.

Supported options:

- `global_search`

## Customize profile name, photo, and title

You might see on the sidebar footer a small profile widget. The widget displays three types of information about the user; `name`, `photo`, and `title`.

### Customize the name of the user

Avo checks to see if the object returned by your [`current_user_method`](authentication.html#customize-the-current-user-method) responds to a `name` method. If not, it will try the `email` method and then fall back to `Avo user`.

### Customize the profile photo

Similarly, it will check if that current user responds to `avatar` and use that as the `src` of the photo.

### Customize the title of the user

Lastly, it will check if it responds to the `avo_title` method and uses that to display it under the name.

### Customize the sign-out link

Please follow [this](authentication.html#customise-the-sign-out-link) guide in [authentication](authentication).

## Skip show view

<div class="space-x-2">
  <VersionReq version="2.16" />
  <BetaStatus label="Public beta"></BetaStatus>
</div>

In the CRUD interface Avo adds the <Show /> view by default. This means that when your users will see the view icon to go to that detail page and they will be redirected to the <Show /> page when doing certain tasks (update a record, run an action, etc.).

You might not want that behavior and you might not use the <Show /> view at all and prefer to skip that and just use the <Edit /> view.
Adding `config.skip_show_view = true` to your `avo.rb` configuration file will tell Avo to skip it and use the <Edit /> view as the default resource view.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.skip_show_view = true
end
```

<Image src="/assets/img/customization/skip_show_view.gif" width="1870" height="880" alt="" />

## Logger

You may want to set a different output stream for avo logs, you can do that by returning it on a `config.logger` Proc

```ruby
## == Logger ==
config.logger = -> {
  file_logger = ActiveSupport::Logger.new(Rails.root.join("log", "avo.log"))

  file_logger.datetime_format = "%Y-%m-%d %H:%M:%S"
  file_logger.formatter = proc do |severity, time, progname, msg|
    "[Avo] #{time}: #{msg}\n".tap do |i|
      puts i
    end
  end

  file_logger
}
```

<Option name="`default_url_options`">
`default_url_options` is a Rails [controller method](https://apidock.com/rails/ActionController/Base/default_url_options) that will append params automatically to the paths you generate through path helpers.

In order to implement some features like route-level Multitenancy we exposed an API to add to Avo's `default_url_options` method.

::: code-group
```ruby [config/initializers/avo.rb]{2}
Avo.configure do |config|
  config.default_url_options = [:account_id]
end
```
```ruby [app/config/routes.rb]{3}
Rails.application.routes.draw do
  # Use to test out route-based multitenancy
  scope "/account/:account_id" do
    mount Avo::Engine, at: Avo.configuration.root_path
  end
end
```
:::

Now, when you visit `https://example.org/account/adrian/avo`, the `account_id` param is `adrian` and it will be appended to all path helpers.
</Option>

<Option name="`turbo`">
You may want to configure how turbo behave on Avo.

You can configure it using `config.turbo` option on `avo.rb` initializer

Supported options with default values:

```ruby
  config.turbo = -> do
    {
      instant_click: true
    }
  end
```
</Option>

<Option name="`pagination`">
You can configure the default pagination settings key by key.

```ruby
config.pagination = {
  type: :countless
}

# Or

config.pagination = -> do
  {
    type: :countless,
  }
end
```

This will make all your application's tables countless keeping the size key / value as the default one.

Verify all possible options [here](resources#self_pagination).
</Option>

<Option name="`click_row_to_view_record`">

<!-- <BetaStatus status="beta" /> -->

This setting allows your users to click on a record to navigate to its <Show /> view.

:::warning
This interaction (clicking a `tr` element to behave as a link) is not natively supported in HTML.

Avo enhances this functionality with JavaScript, which may lead to side effects. Please report any issues you encounter on our [issue queue](https://avo.cool/new-issue).
:::

Enable this setting by using the `click_row_to_view_record` configuration option.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.click_row_to_view_record = true
end
```

<Image src="/assets/img/3_0/customization/click-row-to-view-record.gif" width="" height="" alt="Click to view record in Avo" />
</Option>

## Associations lookup list limit

<Option name="`associations_lookup_list_limit`">

<VersionReq version="3.14.1" />

By default, there is a limit of a 1000 records per query when listing the association options. This limit ensures that the page will not crash due to large collections.
Use `associations_lookup_list_limit` configuration to change the limit value.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.associations_lookup_list_limit = 1000
end
```

The message `There are more records available.` is shown when the limit is reached. To localize the message you can use `I18n.translate("avo.more_records_available")`.

Using [searchable](./associations/belongs_to.html#searchable) is recommended for listing unlimited records with better performance and user experience.

<Image src="/assets/img/customization/associations-lookup-list-limit.png" width="2466" height="1098" alt="Associations lookup list limit configuration" />
</Option>
