---
feedbackId: 836
license: community
outline: [2, 3]
api_docs: ./customization-api.html
---

# Customization options

Avo's initializer exposes a set of app-wide settings that don't belong to any single feature — the app name, timezone, index view behavior, layout widths, logging, and more. They all live in `config/initializers/avo.rb`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.app_name = "Avocadelicious"
  config.timezone = "UTC"
  config.currency = "USD"
  config.per_page = 24
end
```

With no configuration at all, Avo computes the app name from your Rails app, uses UTC and USD, shows 24 records per page in constrained-width tables, and redirects the logo to your first resource. Every default is listed in the [Customization API](./customization-api.html), and options that belong to a specific feature (appearance, menus, authentication, search…) are indexed [there](./customization-api.html) too.

## Change the app name

On the main navbar next to the logo, Avo generates a link to the homepage of your app. The label is usually computed from your Rails app name, and you can customize it with [`app_name`](./customization-api.html#app_name).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.app_name = "Avocadelicious"
end
```

If you need something dynamic — an `I18n.t` lookup, for example — pass a block instead:

```ruby
Avo.configure do |config|
  config.app_name = -> { I18n.t "app_name" }
end
```

To replace that single link with a list of links (docs, support, etc.), see [Header menu](./menu-editor.html#header-menu).

## Timezone and currency

If your app displays `date`, `datetime`, or `currency` fields, set the global [`timezone`](./customization-api.html#timezone) and [`currency`](./customization-api.html#currency) they should use.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.timezone = "UTC"
  config.currency = "USD"
end
```

## Resource Index view

There are a few customization options to change how resources are displayed in the **Index** view.

### Per-page pagination

Set the default page size with [`per_page`](./customization-api.html#per_page) and the options in the per-page picker with [`per_page_steps`](./customization-api.html#per_page_steps).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.per_page = 4
  config.per_page_steps = [4, 12, 24, 48]
end
```

<Image src="/assets/img/4_0/customization/per-page-pagination.webm" dark-src="/assets/img/4_0/customization/per-page-pagination-dark.webm" width="888" height="280" alt="An Avo index table with four rows and a pagination bar; the per-page picker opens upward to list 4, 12, 24 and 48, then closes." prompt="index table with 4 rows and pagination bar; per-page picker opens listing 4, 12, 24, 48 then closes" />

For `has_many` associations, control how many records are visible in their **Index** view with [`via_per_page`](./customization-api.html#via_per_page).

For the pagination engine itself — countless mode, page size behavior — set global defaults with [`pagination`](./customization-api.html#pagination), which takes the same keys as the per-resource [`self.pagination`](./resources-api#self.pagination) option.

### Default view type

The `ResourceIndex` component supports the `:table` (default), `:grid`, and `:map` view types, plus any [custom view type](./custom-view-types.html) you register. Change the default for all resources with [`default_view_type`](./customization-api.html#default_view_type), or per resource with the `default_view_type` class attribute. Read more on the [views pages](./views.html#view-types).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.default_view_type = :grid
end
```

<Image src="/assets/img/4_0/customization/view-type-table-grid.webm" dark-src="/assets/img/4_0/customization/view-type-table-grid-dark.webm" width="888" height="650" alt="An Avo Posts index with six records per page: the view switcher toggles between table rows and grid cards." prompt="Posts index with 4 per page; GIF toggling table and grid view with annotated view switcher" />

### Sorting direction

The first time a user sorts a column, Avo sorts it descending. Flip that with [`first_sorting_option`](./customization-api.html#first_sorting_option).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.first_sorting_option = :asc
end
```

### Row density

Control how much vertical space rows take up in tables and dashboard list cards with [`density`](./customization-api.html#density) — `:tight`, `:normal` (default), or `:relaxed`. Dashboard table and list cards can [override it per card](./customization-api.html#density).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.density = :tight
end
```

### Click a row to view the record

By default, clicking anywhere on a row navigates to that record's <Show /> view. If you'd rather reserve navigation for the explicit controls, disable [`click_row_to_view_record`](./customization-api.html#click_row_to_view_record).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.click_row_to_view_record = false
end
```

<Image src="/assets/img/4_0/customization/click-row-to-view-record.webm" dark-src="/assets/img/4_0/customization/click-row-to-view-record-dark.webm" width="1170" height="528" alt="An Avo resource index where a row name cell is highlighted, clicked, and navigates to the record show view with panel and card DSL layout." />

:::warning
This interaction (clicking a `tr` element to behave as a link) is not natively supported in HTML. Avo enhances it with JavaScript, which may lead to side effects. Please report any issues you encounter on our [issue queue](https://avo.cool/new-issue).
:::

### Cache resources on the Index view

Avo caches each resource row (or grid item) for performance reasons. Disable that with [`cache_resources_on_index_view`](./customization-api.html#cache_resources_on_index_view).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.cache_resources_on_index_view = false
end
```

:::info
If you use the `visibility` option to show/hide fields based on the user's role, you should disable this setting.
:::

### Search debounce

Avo waits 300 milliseconds after the user stops typing before firing a search request. Tune that with [`search_debounce`](./customization-api.html#search_debounce).

### Modify controls placement and appearance

<!-- @include: ./common/row_controls_config_common.md-->

See [row controls configuration on table view](table-view.html#global-configuration).

## ID links to resource

On the **Index** view, each row has the controls component at the end, which allows the user to go to the **Show** and **Edit** views and delete that entry. If you have a long row and a not-so-wide display, it might not be easy to scroll to the right-most section to click the **Show** link.

Enable [`id_links_to_resource`](./customization-api.html#id_links_to_resource) to render all `id` fields on the **Index** view as links to their resource.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.id_links_to_resource = true
end
```

<Image src="/assets/img/4_0/customization/as-link-to-resource.webp" dark-src="/assets/img/4_0/customization/as-link-to-resource-dark.webp" width="1696" height="664" alt="An Avo index where each row's ID is rendered as a blue link to that record's show view, with a Name column." />

## Container width

Control how wide Avo's main content area is with [`container_width`](./customization-api.html#container_width). The default keeps index views in a large constrained container and show/form views in a narrower one.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  # Apply one width to all views
  config.container_width = :full

  # Or target specific views with a hash
  config.container_width = { index: :full }
end
```

Widths are `:large`, `:small`, or `:full`. The hash form accepts individual view keys (`:index`, `:show`, `:new`, `:edit`, `:create`, `:update`) and the group aliases `:forms`, `:display`, and `:single` — specific keys win over aliases. See the [reference](./customization-api.html#container_width) for the full tables.

```ruby
# All single-record views full-width; index stays large
config.container_width = { single: :full }

# Mix: single full-width, but show overridden back to small
config.container_width = { single: :full, show: :small }
```

### Upgrading from `full_width_container` / `full_width_index_view`

| Old | New |
| --- | --- |
| `config.full_width_container = true` | `config.container_width = :full` |
| `config.full_width_container = false` | Remove the line (default is correct) |
| `config.full_width_index_view = true` | `config.container_width = { index: :full }` |

## Toggle the sidebar button visibility

By default, Avo displays a toggle button in the navbar that allows users to collapse and expand the sidebar on desktop. Hide it with [`sidebar_toggle_visible`](./customization-api.html#sidebar_toggle_visible) — the sidebar then stays permanently open on desktop. On mobile, the sidebar toggle is always visible regardless of this setting.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.sidebar_toggle_visible = false
end
```

<Image src="/assets/img/4_0/customization/sidebar-toggle-hidden.webp" dark-src="/assets/img/4_0/customization/sidebar-toggle-hidden-dark.webp" width="2880" height="2360" alt="An Avo resource index on desktop with the sidebar permanently open and no toggle button in the navbar, because sidebar_toggle_visible is set to false." prompt="Full Avo resource index page with config.sidebar_toggle_visible = false: the sidebar is open on the left and the navbar at the top has NO collapse/expand toggle button next to the logo. Capture the entire page (sidebar + navbar + content) at a desktop width." />

## Body classes

Add custom CSS classes to Avo's `<body>` tag with [`body_classes`](./customization-api.html#body_classes) — useful for applying global styles, theme variations, or targeting specific layouts with CSS.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.body_classes = "custom-theme compact-layout"
end
```

It also accepts an array, or a block for dynamic classes. The block is evaluated with Avo's [`ExecutionContext`](./execution-context.html), so you have access to `current_user`, `request`, `params`, and other context methods.

```ruby
Avo.configure do |config|
  config.body_classes = -> {
    classes = []
    classes << "admin-mode" if current_user&.admin?
    classes << "dark-preference" if request.cookies["theme"] == "dark"
    classes
  }
end
```

## Hide the layout when printing

If your users print record pages, enable [`hide_layout_when_printing`](./customization-api.html#hide_layout_when_printing) to hide the sidebar, navbar, and footer on the printed page, leaving only the content.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.hide_layout_when_printing = true
end
```

## Home path

When a user clicks your logo inside Avo or goes to the `/avo` URL, they will be redirected to one of your resources. Point them somewhere else — a dashboard, for example — with [`home_path`](./customization-api.html#home_path).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.home_path = "/avo/dashboard"
end
```

It also accepts a block, which has access to route helpers:

```ruby
Avo.configure do |config|
  config.home_path = -> { avo_dashboards.dashboard_path(:dashy) }
end
```

When you configure `home_path`, the `Get started` sidebar item is hidden in the development environment.

You can pair it with the `set_initial_breadcrumbs` option for a more cohesive experience:

```ruby
Avo.configure do |config|
  config.home_path = "/avo/dashboard"
  config.set_initial_breadcrumbs do
    add_breadcrumb "Dashboard", "/avo/dashboard"
  end
end
```

## Skip show view

In the CRUD interface Avo adds the <Show /> view by default: users see the view icon on rows and get redirected to the <Show /> page after updating a record, running an action, and similar tasks.

If you don't use the <Show /> view at all and prefer to go straight to <Edit />, set [`resource_default_view`](./customization-api.html#resource_default_view) to `:edit`. Row links, redirects, and association links will all target the <Edit /> view instead.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.resource_default_view = :edit
end
```

:::info Renamed from `skip_show_view`
This option was previously named `config.skip_show_view = true`.
:::

<Image src="/assets/img/4_0/customization/skip_show_view.webm" dark-src="/assets/img/4_0/customization/skip_show_view-dark.webm" width="1170" height="428" alt="An Avo create form for a course: after saving, Avo redirects to the Edit view instead of Show when skip_show_view is enabled." />

## Open a record in your editor

In the `development` environment, Avo renders a small `</>` icon next to the things you build with Avo — resources, actions, filters, dashboards, cards, and forms. Clicking it opens that class's source file directly in your editor, so you can jump from the UI to the code that powers it. The icon is only rendered in `development` and never shows up in other environments.

The link is built from [`default_editor_url`](./customization-api.html#default_editor_url), where `%{path}` is replaced with the absolute path of the source file.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.default_editor_url = "cursor://file/%{path}"
end
```

The default targets [Cursor](https://cursor.com). To open files in a different editor, change the URL scheme, for example `vscode://file/%{path}` for VS Code or `subl://open?url=file://%{path}` for Sublime Text.

### Resources

The resource header shows the icon next to the resource's name, linking to the resource file (e.g. `app/avo/resources/project.rb`).

<Image src="/assets/img/4_0/customization/open-in-editor-resource.webp" dark-src="/assets/img/4_0/customization/open-in-editor-resource-dark.webp" width="1776" height="172" alt="An Avo Projects index header in development, with a small code icon right after the resource name — it opens the resource's source file in your editor — highlighted with a red box." prompt="A resource Index view header in development showing the resource name with the small open-in-your-editor code icon right after it, with a red box annotation highlighting the icon" />

### Actions

When you run an action, the icon sits in the modal heading next to the action's name, linking to the action file.

<Image src="/assets/img/4_0/customization/open-in-editor-action.webp" dark-src="/assets/img/4_0/customization/open-in-editor-action-dark.webp" width="2502" height="1158" alt="An Avo action confirmation modal open over the Posts index in development, its heading showing the action name with a small code icon next to it — it opens the action's source file in your editor — highlighted with a red box." prompt="An action confirmation modal open over the Index view, showing the action name in the modal heading with the small open-in-your-editor code icon next to it, with a red box annotation highlighting the icon" />

### Filters

Each filter in the filters panel shows the icon next to its name, linking to that filter's file.

<Image src="/assets/img/4_0/customization/open-in-editor-filter.webp" dark-src="/assets/img/4_0/customization/open-in-editor-filter-dark.webp" width="308" height="319" alt="The Avo filters panel open on the Posts index in development, each filter name (Featured, Published) followed by a small code icon that opens the filter's source file in your editor, each icon highlighted with a red box." prompt="The filters panel open on an Index view in development, each filter name followed by the small open-in-your-editor code icon, with red box annotations highlighting the icons" />

### Dashboards

The dashboard header shows the icon next to the dashboard's name, linking to the dashboard file.

<Image src="/assets/img/4_0/customization/open-in-editor-dashboard.webp" dark-src="/assets/img/4_0/customization/open-in-editor-dashboard-dark.webp" width="1776" height="132" alt="An Avo dashboard header in development, with a small code icon right after the dashboard title — it opens the dashboard's source file in your editor — highlighted with a red box." prompt="A dashboard page header in development showing the dashboard title with the small open-in-your-editor code icon next to it, with a red box annotation highlighting the icon" />

### Cards

Each card on a dashboard shows the icon next to its label, linking to that card's file.

<Image src="/assets/img/4_0/customization/open-in-editor-card.webp" dark-src="/assets/img/4_0/customization/open-in-editor-card-dark.webp" width="470" height="178" alt="An Avo dashboard metric card in development, with a small code icon right after the card label — it opens the card's source file in your editor — highlighted with a red box." prompt="A dashboard card in development showing the card label with the small open-in-your-editor code icon next to it, with a red box annotation highlighting the icon" />

### Forms

If you use [Avo Forms](./forms-and-pages.html), the form header shows the icon next to the form's title, linking to the form file.

<Image src="/assets/img/4_0/customization/open-in-editor-form.webp" dark-src="/assets/img/4_0/customization/open-in-editor-form-dark.webp" width="1360" height="132" alt="An Avo Forms form header in development, with a small code icon right after the form title — it opens the form's source file in your editor — highlighted with a red box." prompt="An Avo Forms form page header in development showing the form title with the small open-in-your-editor code icon next to it, with a red box annotation highlighting the icon" />

## Context

In the `Resource` and `Action` classes, you have a global `context` object to which you can attach a custom payload. For example, you may add the current request `params` or any other arbitrary data.

Configure it with [`set_context`](./customization-api.html#set_context) in your initializer. The block is instance-evaluated in `Avo::ApplicationController`, so it has access to the `_current_user` method and the `Current` object.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.set_context do
    {
      foo: "bar",
      params: request.params,
    }
  end
end
```

:::warning `_current_user`
It's recommended you don't store your current user here but using the [`current_user_method`](./authentication.html#customize-the-current-user-method) config.
:::

You can access the context data with the `::Avo::Current.context` object.

## Alerts

Alerts dismiss themselves after 5 seconds. Keep them on screen longer (or shorter) with [`alert_dismiss_time`](./customization-api.html#alert_dismiss_time), in milliseconds.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.alert_dismiss_time = 8000
end
```

## Persist UI state

By default, association pagination and static filter selections reset on every request. To retain them while the user's session is active, enable [`persistence`](./customization-api.html#persistence) with the `:session` driver.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.persistence = {
    driver: :session
  }
end
```

:::warning Cookie store size limit
Rails' default cookie session store is limited to 4096 bytes. Storing many pagination states and filter selections can exceed it and raise `ActionDispatch::Cookies::CookieOverflow`. Use a scalable [session store](https://guides.rubyonrails.org/configuring.html#config-session-store) such as Redis or MemCache instead.
:::

## Associations

Global defaults for associations live under the [`associations`](./customization-api.html#associations) namespace. You only need to set the keys you want to change.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.associations = {
    lookup_list_limit: 1000,
    frames: {
      loading: :lazy,           # :lazy or :manual — default render mode for association frames
      auto_load_for: 15.minutes # manual memory window (0/nil to disable)
    }
  }
end
```

### Lookup list limit

By default, there is a limit of 1000 records per query when listing the association options. This limit ensures that the page will not crash due to large collections. Use `lookup_list_limit` to change it.

The message `There are more records available.` is shown when the limit is reached. To localize the message you can use `I18n.translate("avo.more_records_available")`.

Using [searchable](./associations/searchable.html) is recommended for listing unlimited records with better performance and user experience.

<!-- REDO MANUALLY: this shot shows an open native browser <select> dropdown listing the
    records + the disabled "There are more records available." option. Playwright cannot open
    a native browser dropdown (the OS renders it outside the page), so the automated pipeline
    can't capture it. Re-shoot by hand (CleanShot) in both light and dark and replace the two
    assets, keeping the same filenames. -->
<Image src="/assets/img/4_0/customization/associations-lookup-list-limit.webp" dark-src="/assets/img/4_0/customization/associations-lookup-list-limit-dark.webp" width="1952" height="820" alt="An Avo new form where a belongs_to user select lists five records followed by a disabled 'There are more records available.' message when the lookup list limit is reached." />

### Association frames

The `frames` keys control how association turbo frames (`has_one`, `has_many`, `has_and_belongs_to_many`) load on the <Show /> page when a field doesn't set its own [`loading:`](./associations/has_many.html#loading) option — `:lazy` fetches the frame when it's revealed; `:manual` renders a placeholder with a **Load** button that stays loaded for the `auto_load_for` window. A per-field `loading:` always overrides these global defaults. See the [reference](./customization-api.html#associations) for the full key table.

## Turbo

Configure how Turbo behaves inside Avo — for example whether pages start loading on `mousedown` — with the [`turbo`](./customization-api.html#turbo) option.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.turbo = -> do
    {
      instant_click: true
    }
  end
end
```

## Default URL options

To append params automatically to every path Avo generates — the mechanism behind route-level [multitenancy](./multitenancy.html) — list them in [`default_url_options`](./customization-api.html#default_url_options).

::: code-group

```ruby [config/initializers/avo.rb]
Avo.configure do |config|
  config.default_url_options = [:account_id]
end
```

```ruby [config/routes.rb]
Rails.application.routes.draw do
  scope "/account/:account_id" do
    mount_avo
  end
end
```

:::

Now, when you visit `https://example.org/account/adrian/avo`, the `account_id` param is `adrian` and it will be appended to all path helpers.

## Logger

Send Avo's logs to a different output stream by returning a logger from the [`logger`](./customization-api.html#logger) proc.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
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
end
```

## Status page

The status page (`/avo_private/status`) hides the license key by default. Control which items appear there with [`exclude_from_status`](./customization-api.html#exclude_from_status) — set it to `[]` to show everything, or add more items to hide them.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.exclude_from_status = ["license_key", "ip"]
end
```

## Usage metadata

On the community tier, Avo sends usage metadata (fields count, resources count, and similar metrics) to Avo HQ to help the team understand how the framework is used. Opt out with [`send_metadata`](./customization-api.html#send_metadata).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.send_metadata = false
end
```

## Generators

### Custom `view_component` path

You may not keep your view components under `app/components` and want the generated field `view_component`s to be generated in your custom directory. Change it with [`view_component_path`](./customization-api.html#view_component_path).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.view_component_path = "app/frontend/components"
end
```

### Generate Avo resources alongside models

When you run `rails generate model`, Avo also generates the matching resource file. Opt out globally with [`model_generator_hook`](./customization-api.html#model_generator_hook), or pass `--skip-avo-resource` to skip it for a single run.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.model_generator_hook = false
end
```

## Page titles

This section has moved to the [Custom pages](./custom-tools.html#set-the-page-title) page.

## Mount Avo under a nested path

This section has moved to the [Routing](./routing.html#mount-avo-under-a-nested-path) page.

## Custom query scopes

This section has moved: see [`self.index_query`](./resources-api.html#self.index_query) and [customize how records are fetched](./resources.html#customize-how-records-are-fetched) on the Resources pages.

## Customize profile name, photo, and title

This section has moved to the [Authentication](./authentication.html#customize-the-profile-widget) page.

## Eject

[This section has moved.](./eject-views)

## Breadcrumbs

This section has moved to the [Breadcrumbs](./breadcrumbs.md) page.
