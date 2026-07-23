---
license: community
outline: [2, 3]
guide: ./customization.html
prev:
  text: "Customization options"
  link: "./customization.html"
next: false
---

# Customization API

Per-option reference for Avo's general configuration. For task-oriented documentation and worked examples, see the [Customization guide](./customization.html).

All options are set on the `config` object in `config/initializers/avo.rb`:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  # options listed below
end
```

This page is the complete reference of Avo's initializer options. Options that belong to a specific feature list their contract here and link to that feature's page for the full guide and worked examples.

## Application

<Option name="`app_name`" headingSize="3">

The label of the homepage link rendered in the navbar, next to the logo.

```ruby
config.app_name = "Avocadelicious"
```

Also accepts a block, evaluated on each request — useful for `I18n.t` lookups:

```ruby
config.app_name = -> { I18n.t "app_name" }
```

- **Type:** String or Proc returning a String
- **Default:** computed from the Rails application class name, humanized

</Option>

<Option name="`timezone`" headingSize="3">

The global timezone used when displaying `date` and `datetime` fields.

```ruby
config.timezone = "UTC"
```

- **Type:** String
- **Default:** `"UTC"`

</Option>

<Option name="`currency`" headingSize="3">

The global currency used when displaying `currency` fields that don't set their own.

```ruby
config.currency = "USD"
```

- **Type:** String
- **Default:** `"USD"`

</Option>

<Option name="`home_path`" headingSize="3">

Where users are redirected when they click the logo or visit Avo's root path. Also accepts a block, which has access to route helpers.

```ruby
config.home_path = "/avo/dashboard"

# or

config.home_path = -> { avo_dashboards.dashboard_path(:dashy) }
```

- **Type:** String or Proc returning a String
- **Default:** `nil` — the root path redirects to the first available resource

</Option>

<Option name="`alert_dismiss_time`" headingSize="3">

How long alerts stay on screen (in milliseconds) before dismissing automatically.

```ruby
config.alert_dismiss_time = 8000
```

- **Type:** Integer (milliseconds)
- **Default:** `5000`

</Option>

## Index view

<Option name="`per_page`" headingSize="3">

The default number of records per page on <Index /> views.

```ruby
config.per_page = 24
```

- **Type:** Integer
- **Default:** `24`

</Option>

<Option name="`per_page_steps`" headingSize="3">

The options listed in the per-page picker on <Index /> views.

```ruby
config.per_page_steps = [12, 24, 48, 72]
```

- **Type:** Array of Integers
- **Default:** `[12, 24, 48, 72]`

</Option>

<Option name="`via_per_page`" headingSize="3">

The number of records shown on association views (`has_many` tables and similar).

```ruby
config.via_per_page = 8
```

- **Type:** Integer
- **Default:** `8`

</Option>

<Option name="`default_view_type`" headingSize="3">

The view type <Index /> views use when a resource doesn't set its own `default_view_type`.

```ruby
config.default_view_type = :grid
```

- **Type:** Symbol
- **Default:** `:table`
- **Values:** `:table`, `:grid`, `:map`, or any registered [custom view type](./custom-view-types.html)

</Option>

<Option name="`first_sorting_option`" headingSize="3">

The direction applied the first time a user sorts a column on the <Index /> view.

```ruby
config.first_sorting_option = :asc
```

- **Type:** Symbol
- **Default:** `:desc`
- **Values:** `:asc`, `:desc`

</Option>

<Option name="`density`" headingSize="3">

How much vertical space rows take up in <Index /> tables and in dashboard table and list cards.

```ruby
config.density = :normal
```

Dashboard table and list cards can override the global value with `self.density`:

```ruby
class Avo::Cards::ExampleList < Avo::Cards::ListCard
  self.density = :tight
end
```

- **Type:** Symbol
- **Default:** `:normal`
- **Values:** `:tight`, `:normal`, `:relaxed`

</Option>

<Option name="`click_row_to_view_record`" headingSize="3">

Makes the whole <Index /> row a link to the record's <Show /> view.

```ruby
config.click_row_to_view_record = false
```

- **Type:** Boolean
- **Default:** `true`

:::warning
Clicking a `tr` element to behave as a link is not natively supported in HTML. Avo enhances this with JavaScript, which may lead to side effects. Please report any issues on the [issue queue](https://avo.cool/new-issue).
:::

</Option>

<Option name="`id_links_to_resource`" headingSize="3">

Renders every `id` field on the <Index /> view as a link to that record's <Show /> view.

```ruby
config.id_links_to_resource = true
```

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`cache_resources_on_index_view`" headingSize="3">

Caches each resource row (or grid item) on the <Index /> view. The cache key uses the record's `id` and `created_at` attributes and the resource file's `md5`.

```ruby
config.cache_resources_on_index_view = false
```

- **Type:** Boolean
- **Default:** `true`

:::warning
The cache key does not include the current user. If you use the `visibility` field option to show or hide fields based on the user's role, disable this setting.
:::

</Option>

<Option name="`pagination`" headingSize="3">

Default pagination settings applied to every resource. Accepts the same keys as the per-resource [`self.pagination`](./resources-api#self.pagination) option, which also overrides this global default.

```ruby
config.pagination = {
  type: :countless
}

# or

config.pagination = -> do
  {
    type: :countless
  }
end
```

- **Type:** Hash or Proc returning a Hash
- **Default:** `{}`

</Option>

<Option name="`search_debounce`" headingSize="3">

How long Avo waits (in milliseconds) after the user stops typing in a search input before firing the search request.

```ruby
config.search_debounce = 300
```

- **Type:** Integer (milliseconds)
- **Default:** `300`

</Option>

<Option name="`resource_row_controls_config`" headingSize="3">

Placement and appearance of the row controls on <Index /> tables, globally. A resource can override it with `self.row_controls_config`.

```ruby
config.resource_row_controls_config = {
  placement: :right,
  float: false,
  show_on_hover: false
}
```

- **Type:** Hash, merged over the defaults
- **Default:** `{ placement: :right, float: false, show_on_hover: false }`

Full guide and per-key reference: [Table view](./table-view.html#global-configuration) and [`resource_row_controls_config`](./table-view-api.html#resource_row_controls_config).

</Option>

## Layout

<Option name="`container_width`" headingSize="3">

The width of Avo's main content area, globally or per view.

```ruby
# One width for all views
config.container_width = :full

# Or target specific views with a hash
config.container_width = { index: :full }
```

| Value    | Behavior                                    |
| -------- | ------------------------------------------- |
| `:large` | Constrained container (default for index)   |
| `:small` | Narrow container (default for show / forms) |
| `:full`  | Full viewport width                         |

Hash keys can be individual views — `:index`, `:show`, `:new`, `:edit`, `:create`, `:update` — or group aliases:

| Alias      | Expands to                                     |
| ---------- | ---------------------------------------------- |
| `:forms`   | `:new`, `:edit`, `:create`, `:update`          |
| `:display` | `:index`, `:show`                              |
| `:single`  | `:show`, `:new`, `:edit`, `:create`, `:update` |

When a specific key and a group alias target the same view, the specific key wins. Views not mentioned in the hash keep their defaults.

- **Type:** Symbol or Hash
- **Default:** `{ index: :large, show: :small, new: :small, edit: :small, create: :small, update: :small }`
- **Validation:** raises `ArgumentError` for unknown widths or unknown hash keys

</Option>

<Option name="`sidebar_toggle_visible`" headingSize="3">

Shows or hides the navbar button that collapses the sidebar on desktop. When `false`, the sidebar stays permanently open on desktop. On mobile the toggle is always visible.

```ruby
config.sidebar_toggle_visible = false
```

- **Type:** Boolean
- **Default:** `true`

</Option>

<Option name="`body_classes`" headingSize="3">

Custom CSS classes added to Avo's `<body>` tag.

```ruby
config.body_classes = "custom-theme compact-layout"

# or

config.body_classes = ["custom-theme", "compact-layout"]

# or

config.body_classes = -> {
  current_user&.admin? ? "admin-mode" : ""
}
```

The block form is evaluated with Avo's [`ExecutionContext`](./execution-context.html), so it has access to `current_user`, `request`, `params`, and other context methods.

- **Type:** String, Array of Strings, or Proc returning either
- **Default:** `[]`

</Option>

<Option name="`hide_layout_when_printing`" headingSize="3">

Hides the sidebar, navbar, and footer when printing an Avo page, leaving only the content.

```ruby
config.hide_layout_when_printing = true
```

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`back_to_top`" headingSize="3">

A floating "Back to top" pill that appears centered below the navbar. It stays hidden within `threshold` pixels of the top of the page, reveals when you scroll back up, and hides again when you scroll down. Clicking it smooth-scrolls to the top.

It's off by default — opt in from your initializer:

```ruby
config.back_to_top = {
  enabled: true, # show the "Back to top" pill
  threshold: 64  # pixels scrolled down before an upward scroll reveals it
}
```

Raise `threshold` if you'd rather the pill only show up further down long pages.

The button's label is translated — override it like any other Avo string:

```yaml
# config/locales/avo.en.yml
en:
  avo:
    back_to_top: Back to top
```

- **Type:** Hash, merged over the defaults
- **Default:** `{ enabled: false, threshold: 64 }`
- **i18n key:** `avo.back_to_top` ("Back to top")

</Option>

## Behavior

<Option name="`resource_default_view`" headingSize="3">

The view Avo treats as a record's main page. Set it to `:edit` to skip the <Show /> view entirely — row links, redirects after create/update, and association links all go to <Edit /> instead.

```ruby
config.resource_default_view = :edit
```

- **Type:** Symbol or String
- **Default:** `:show`
- **Values:** `:show`, `:edit`

</Option>

<Option name="`persistence`" headingSize="3">

Retains UI state — association pagination (`page`, `per_page`) and static filter selections — across requests by storing it in the session.

```ruby
config.persistence = {
  driver: :session
}

# or

config.persistence = -> do
  {
    driver: :session
  }
end
```

- **Type:** Hash or Proc returning a Hash
- **Default:** `{ driver: nil }` — no persistence
- **Values:** `driver:` accepts `:session` or `nil`

:::warning Cookie store size limit
Rails' default cookie session store is limited to 4096 bytes. Storing many pagination states and filter selections can exceed it and raise `ActionDispatch::Cookies::CookieOverflow`. Use a scalable [session store](https://guides.rubyonrails.org/configuring.html#config-session-store) such as Redis or MemCache instead.
:::

</Option>

<Option name="`associations`" headingSize="3">

Global defaults for associations, grouped under a single namespace. Set only the keys you want to change — everything else falls back to the defaults.

```ruby
config.associations = {
  lookup_list_limit: 1000,
  frames: {
    loading: :lazy,
    auto_load_for: 15.minutes
  }
}
```

| Key | Default | Description |
|---|---|---|
| `lookup_list_limit` | `1000` | Caps how many records a `belongs_to`/attach lookup lists before showing the "There are more records available." notice. |
| `frames.loading` | `:lazy` | Render mode for association turbo frames (`has_one`, `has_many`, `has_and_belongs_to_many`) when a field doesn't set its own [`loading:`](./associations/has_many.html#loading). `:lazy` fetches the frame when revealed; `:manual` renders a placeholder with a **Load** button. |
| `frames.auto_load_for` | `15.minutes` | For manual frames, how long an opened frame is remembered before the placeholder returns. `0`/`nil` disables it. |

- **Type:** Hash, deep-merged over the defaults
- **Default:** `{ lookup_list_limit: 1000, frames: { loading: :lazy, auto_load_for: 15.minutes } }`

:::info Backward compatibility
The former `config.associations_lookup_list_limit = 1000` still works as an alias for `config.associations[:lookup_list_limit]`.
:::

</Option>

<Option name="`turbo`" headingSize="3">

Configures how Turbo behaves inside Avo.

```ruby
config.turbo = -> do
  {
    instant_click: true
  }
end
```

| Key | Default | Description |
|---|---|---|
| `instant_click` | `true` | Starts loading the page on `mousedown` instead of waiting for the full click. |

- **Type:** Hash or Proc returning a Hash
- **Default:** `{ instant_click: true }`

</Option>

<Option name="`default_url_options`" headingSize="3">

Params appended automatically to every path Avo generates through its path helpers, mirroring Rails' [`default_url_options`](https://apidock.com/rails/ActionController/Base/default_url_options). Used to implement features like route-level multitenancy.

```ruby
config.default_url_options = [:account_id]
```

With Avo mounted under `scope "/account/:account_id"`, visiting `https://example.org/account/adrian/avo` sets the `account_id` param to `adrian` and appends it to all generated paths.

- **Type:** Array of Symbols
- **Default:** `[]`

</Option>

<Option name="`set_context`" headingSize="3">

Attaches a custom payload to the global [`context`](./customization.html#context) object available in resources and actions. The block is instance-evaluated in `Avo::ApplicationController`, so it has access to `_current_user`, `request`, and the `Current` object.

```ruby
config.set_context do
  {
    foo: "bar",
    params: request.params
  }
end
```

- **Type:** block returning any object
- **Default:** `proc {}` — an empty context

:::warning `_current_user`
Don't store your current user here — use the [`current_user_method`](./authentication.html#customize-the-current-user-method) config instead.
:::

</Option>

<Option name="`logger`" headingSize="3">

The logger Avo writes to.

```ruby
config.logger = -> {
  ActiveSupport::Logger.new(Rails.root.join("log", "avo.log"))
}
```

- **Type:** Proc returning a Logger
- **Default:** a file logger writing to `log/avo.log` that also echoes messages to stdout

</Option>

## Development and generators

<Option name="`default_editor_url`" headingSize="3">

The URL template behind the `</>` icons Avo renders in `development` next to resources, actions, filters, dashboards, cards, and forms. `%{path}` is replaced with the absolute path of the class's source file.

```ruby
config.default_editor_url = "vscode://file/%{path}"
```

- **Type:** String containing `%{path}`
- **Default:** `"cursor://file/%{path}"`

</Option>

<Option name="`view_component_path`" headingSize="3">

The directory where generated field `view_component`s are placed.

```ruby
config.view_component_path = "app/frontend/components"
```

- **Type:** String
- **Default:** `"app/components"`

</Option>

<Option name="`model_generator_hook`" headingSize="3">

Makes `rails generate model` also generate the matching Avo resource. Set it to `false` to opt out globally, or pass `--skip-avo-resource` to skip it for a single run.

```ruby
config.model_generator_hook = false
```

- **Type:** Boolean
- **Default:** `true`

</Option>

## Status and metadata

<Option name="`exclude_from_status`" headingSize="3">

Which items to hide from the status page (`/avo_private/status`). The license key is hidden by default for security reasons; set the option to `[]` to show it.

```ruby
config.exclude_from_status = ["license_key", "ip"]

# or

config.exclude_from_status = -> do
  ["license_key", "ip"]
end
```

- **Type:** Array of Strings or Proc returning one
- **Default:** `["license_key"]`

</Option>

<Option name="`send_metadata`" headingSize="3">

Controls whether Avo sends usage metadata to Avo HQ, such as fields count, resources count, and other relevant metrics that help the Avo team understand how the framework is used.

```ruby
config.send_metadata = false
```

- **Type:** Boolean
- **Default:** `true`

:::info
This option only takes effect on the community tier. Paid tiers always send metadata.
:::

</Option>

## Routing

<Option name="`root_path`" headingSize="3">

The path Avo is mounted at.

```ruby
config.root_path = "/admin"
```

- **Type:** String
- **Default:** `"/avo"`

Full guide: [Routing](./routing.html).

</Option>

<Option name="`prefix_path`" headingSize="3">

The prefix of a custom `map` block in `config.ru` that serves your app, so Avo can generate correct paths.

```ruby
config.prefix_path = "/internal"
```

- **Type:** String
- **Default:** `nil`

Full guide: [Routing](./routing.html#serve-avo-from-a-custom-map-in-config-ru).

</Option>

## Licensing

<Option name="`license_key`" headingSize="3">

Your Avo license key.

```ruby
config.license_key = ENV["AVO_LICENSE_KEY"]
```

- **Type:** String
- **Default:** `nil`

Full guide: [Licensing](./licensing.html).

</Option>

<Option name="`display_license_request_timeout_error`" headingSize="3">

Whether the license-server request-timeout error banner is shown.

```ruby
config.display_license_request_timeout_error = false
```

- **Type:** Boolean
- **Default:** `true`

Full guide: [Licensing](./licensing.html).

</Option>

## Authentication

<Option name="`current_user_method`" headingSize="3">

How Avo finds the current user. Pass the name of a method available in `Avo::ApplicationController`, or a block.

```ruby
config.current_user_method = :current_user

# or

config.current_user_method do
  current_admin
end
```

- **Type:** Symbol or block
- **Default:** none — without it, Avo has no current user

Full guide: [Authentication](./authentication.html#customize-the-current-user-method).

</Option>

<Option name="`authenticate_with`" headingSize="3">

A block executed in `Avo::ApplicationController` before every request — put your authentication check here.

```ruby
config.authenticate_with do
  authenticate_admin_user
end
```

- **Type:** block
- **Default:** none — Avo is accessible without authentication

Full guide: [Authentication](./authentication.html).

</Option>

<Option name="`sign_out_path_name`" headingSize="3">

The name of the route helper used for the sign-out link in the profile widget.

```ruby
config.sign_out_path_name = :logout_path
```

- **Type:** Symbol
- **Default:** `nil` — Avo tries `destroy_user_session_path`

Full guide: [Authentication](./authentication.html#customize-the-sign-out-link).

</Option>

<Option name="`current_user_resource_name`" headingSize="3">

The resource name used when building the sign-out path and linking to the current user's record.

```ruby
config.current_user_resource_name = "admin"
```

- **Type:** String
- **Default:** `"user"`

Full guide: [Authentication](./authentication.html).

</Option>

<Option name="`is_admin_method`" headingSize="3">

The method called on the current user to decide whether they have the admin role.

```ruby
config.is_admin_method = :admin?
```

- **Type:** Symbol
- **Default:** `:is_admin?`

Full guide: [User roles](./authentication.html#user-roles).

</Option>

<Option name="`is_developer_method`" headingSize="3">

The method called on the current user to decide whether they have the developer role.

```ruby
config.is_developer_method = :developer?
```

- **Type:** Symbol
- **Default:** `:is_developer?`

Full guide: [User roles](./authentication.html#user-roles).

</Option>

## Authorization

<Option name="`authorization_client`" headingSize="3">

The authorization client. Set it to `nil` to disable authorization.

```ruby
config.authorization_client = :pundit
```

- **Type:** Symbol or `nil`
- **Default:** `:pundit` (the generated initializer sets it to `nil`)

Full guide: [Authorization](./authorization.html).

</Option>

<Option name="`authorization_methods`" headingSize="3">

The mapping between Avo actions and the policy methods called for them.

```ruby
config.authorization_methods = {
  index: "index?",
  show: "show?",
  edit: "edit?",
  new: "new?",
  update: "update?",
  create: "create?",
  destroy: "destroy?"
}
```

- **Type:** Hash
- **Default:** the mapping above

Full guide: [Authorization](./authorization.html).

</Option>

<Option name="`raise_error_on_missing_policy`" headingSize="3">

Raises an error when a resource is missing its policy, instead of allowing everything.

```ruby
config.raise_error_on_missing_policy = true
```

- **Type:** Boolean
- **Default:** `false`

Full guide: [Authorization](./authorization.html).

</Option>

<Option name="`explicit_authorization`" headingSize="3">

When `true`, actions without an explicitly defined policy method are denied; when `false`, they are allowed.

```ruby
config.explicit_authorization = true
```

- **Type:** Boolean or Proc (evaluated with `ExecutionContext`)
- **Default:** `true`

Full guide: [Authorization](./authorization.html).

</Option>

## Localization

<Option name="`locale`" headingSize="3">

Forces a locale for Avo's interface.

```ruby
config.locale = "en-US"
```

- **Type:** String or Symbol
- **Default:** `nil` — falls back to `I18n.default_locale`

Full guide: [Localization](./i18n.html).

</Option>

## Appearance

<Option name="`appearance`" headingSize="3">

Avo's visual identity — logos, favicons, color scheme, neutral and accent palettes, and chart colors.

```ruby
config.appearance = {
  logo: "my_company/logo.png",
  neutral: :slate,
  accent: :blue
}
```

- **Type:** Hash
- **Default:** `{}` — Avo's logo, built-in palettes, and an auto color scheme

Every key has its own entry in the [Appearance API](./appearance-api.html); the [Appearance guide](./appearance.html) has the worked examples.

</Option>

## Cache

<Option name="`cache_store`" headingSize="3">

The cache store Avo uses. Accepts a store object or a lambda, useful when different environments need different stores.

```ruby
config.cache_store = -> {
  ActiveSupport::Cache.lookup_store(:solid_cache_store)
}
```

- **Type:** cache store object or Proc returning one
- **Default:** computed — `FileStore` in `tmp/cache` outside production; `Rails.cache` in production unless it's a `MemoryStore` or `NullStore`, which fall back to the `FileStore`

Full guide: [Performance](./performance.html).

</Option>

## Keyboard shortcuts

<Option name="`hotkeys`" headingSize="3">

Master switches for Avo's keyboard shortcuts.

```ruby
config.hotkeys = {
  enabled: true,        # set to false to disable all keyboard shortcuts
  show_key_badges: true # set to false to hide inline kbd badges from the UI
}
```

- **Type:** Hash, merged over the defaults
- **Default:** `{ enabled: true, show_key_badges: true }`

Full guide: [Keyboard shortcuts](./keyboard-shortcuts.html).

</Option>

## Menus

<Option name="`main_menu`" headingSize="3">

The sidebar menu, built with Avo's menu DSL.

```ruby
config.main_menu = -> {
  section "Resources", icon: "tabler/outline/chart-bar-popular" do
    all_resources
  end
}
```

- **Type:** Proc using the menu DSL
- **Default:** `nil` — Avo generates the menu from your dashboards, resources, and tools

Full guide: [Menu editor](./menu-editor.html).

</Option>

<Option name="`profile_menu`" headingSize="3">

The menu shown when clicking the profile widget in the sidebar footer.

```ruby
config.profile_menu = -> {
  link "Profile", path: "/avo/profile", icon: "tabler/outline/user-circle"
}
```

- **Type:** Proc using the menu DSL
- **Default:** `nil`

Full guide: [Menu editor](./menu-editor.html).

</Option>

<Option name="`header_menu`" headingSize="3">

A list of links rendered in the navbar in place of the single app-name link.

```ruby
config.header_menu = -> {
  link "Docs", path: "https://docs.example.com"
  link "Support", path: "https://support.example.com"
}
```

- **Type:** Proc using the menu DSL — only `link` items are rendered
- **Default:** `nil`

Full guide: [Header menu](./menu-editor.html#header-menu).

</Option>

## Breadcrumbs

<Option name="`set_initial_breadcrumbs`" headingSize="3">

The breadcrumbs every page starts with.

```ruby
config.set_initial_breadcrumbs do
  add_breadcrumb "Dashboard", "/avo/dashboard"
end
```

- **Type:** block
- **Default:** a `Home` breadcrumb pointing to Avo's root path

Full guide: [Breadcrumbs](./breadcrumbs.html).

</Option>

## Search

<Option name="`global_search`" headingSize="3">

Enables the global search and its sidebar navigation section. Values can be Procs, evaluated with `ExecutionContext`.

```ruby
config.global_search = {
  enabled: true,
  navigation_section: true,
  search_on_type: true
}
```

- **Type:** Hash
- **Default:** `{ enabled: true, navigation_section: true }`

Full guide and per-key reference: [Global search](./search.html#global-search).

</Option>

<Option name="`search_results_count`" headingSize="3">

How many results are displayed per resource in the search dropdown.

```ruby
config.search_results_count = 16
```

- **Type:** Integer
- **Default:** `8`

Full reference: [Search API](./search-api.html#search_results_count).

</Option>

## Resources

<Option name="`model_resource_mapping`" headingSize="3">

The "default" resource for a model, used when multiple resources exist for the same model and none is specified.

```ruby
config.model_resource_mapping = {
  "User": "Avo::Resources::User"
}
```

- **Type:** Hash of model name → resource name
- **Default:** `{}`

Full guide: [Resources](./resources.html).

</Option>

<Option name="`resources`" headingSize="3">

Manually declares the resources Avo loads, skipping the boot-time eager-loading of `app/avo/resources`. Resources not in the list won't show up.

```ruby
config.resources = [
  "Avo::Resources::User",
  "Avo::Resources::Fish"
]
```

- **Type:** Array of Strings
- **Default:** `nil` — resources are auto-discovered

Full guide: [Resources](./resources.html).

</Option>

<Option name="`resource_parent_controller`" headingSize="3">

The controller Avo's generated resource controllers inherit from.

```ruby
config.resource_parent_controller = "MyApp::BaseResourcesController"
```

- **Type:** String
- **Default:** `"Avo::ResourcesController"`

Full guide: [Resources](./resources.html).

</Option>

<Option name="`buttons_on_form_footers`" headingSize="3">

Adds the `Back` and `Save` buttons to the footer of <New /> and <Edit /> forms too.

```ruby
config.buttons_on_form_footers = true
```

- **Type:** Boolean
- **Default:** `false`

Full guide: [Resources](./resources.html).

</Option>

## Field discovery

<Option name="`column_names_mapping`" headingSize="3">

Maps column names to the field type `discover_columns` uses for them.

```ruby
config.column_names_mapping = {
  published_at: {field: :date_time},
  body: {field: :markdown}
}
```

- **Type:** Hash
- **Default:** `{}`

Full guide and reference: [Field discovery](./field-discovery.html) / [`column_names_mapping`](./field-discovery-api.html#column_names_mapping).

</Option>

<Option name="`column_types_mapping`" headingSize="3">

Maps database column types to the field type `discover_columns` uses for them.

```ruby
config.column_types_mapping = {
  jsonb: {field: :code}
}
```

- **Type:** Hash
- **Default:** `{}`

Full guide and reference: [Field discovery](./field-discovery.html) / [`column_types_mapping`](./field-discovery-api.html#column_types_mapping).

</Option>

## Fields layout

<Option name="`field_wrapper_layout`" headingSize="3">

The default layout of every field wrapper — label beside the value (`:inline`) or above it (`:stacked`). A field's own `stacked:` option overrides it.

```ruby
config.field_wrapper_layout = :stacked
```

- **Type:** Symbol
- **Default:** `:inline`
- **Values:** `:inline`, `:stacked`

Full guide: [Global stacked layout](./field-options.html#global-stacked-layout).

</Option>

<Option name="`use_stacked_fields`" headingSize="3">

Stacks every field at the CSS level, without needing `stacked: true` on each one.

```ruby
config.use_stacked_fields = true
```

- **Type:** Boolean
- **Default:** `false`

Full guide: [Global stacked layout](./field-options.html#global-stacked-layout).

</Option>

## TailwindCSS

<Option name="`tailwindcss_integration_enabled`" headingSize="3">

Set to `false` to disable Avo's Tailwind integration even when `tailwindcss-ruby` is installed.

```ruby
config.tailwindcss_integration_enabled = false
```

- **Type:** Boolean
- **Default:** `true`

Full guide: [TailwindCSS integration](./tailwindcss-integration.html).

</Option>

<Option name="`tailwindcss_content_sources`" headingSize="3">

The paths Tailwind scans for class names. Each entry is an absolute path or a path relative to `Rails.root`.

```ruby
config.tailwindcss_content_sources = ["app", "lib/components"]
```

- **Type:** Array of Strings or Pathnames
- **Default:** `nil` — Tailwind scans `Rails.root.join("app")`

Full guide: [TailwindCSS integration](./tailwindcss-integration.html).

</Option>
