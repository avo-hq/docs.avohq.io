---
license: pro
outline: [2, 3]
guide: ./menu-editor.html
---

# Menu editor API

This is the per-item reference for Avo's menu DSL. For task-oriented guides and worked examples, see the [Menu editor guide](./menu-editor.html).

All menus are configured in `config/initializers/avo.rb` by assigning a Proc that uses the DSL below:

```ruby
Avo.configure do |config|
  config.main_menu = -> {
    section "Content", icon: "tabler/outline/files" do
      resource :posts
    end
  }
end
```

Three menus are configurable:

| Config key | Renders in | Item types rendered |
| --- | --- | --- |
| `main_menu` | The sidebar | All item types |
| `profile_menu` | The profile widget in the sidebar footer | `link_to` only |
| `header_menu` | The top navigation bar | `link_to` only |

## Structure items

<Option name="`section`" headingSize="3">

Top-level container, rendered with a prominent header made of a `name` and an `icon`. Sections group related `group`s and items at the highest level of the menu.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap" do
  group "Academia" do
    resource :course
  end

  all_tools
end
```

- **Options:** [`icon`](#icon), [`collapsable`](#collapsable), [`collapsed`](#collapsed), [`visible`](#visible)
- **Default `name`:** `nil` — the name may be omitted for an unlabeled section

</Option>

<Option name="`group`" headingSize="3">

Sub-category nested inside a section, rendered as a collapsable label that clusters related items. Groups can also sit at the top level, but the recommended hierarchy is `section → group → item`.

```ruby
group "Blog", collapsable: true, collapsed: true do
  resource :posts
  resource :comments
end
```

- **Options:** [`collapsable`](#collapsable), [`collapsed`](#collapsed), [`visible`](#visible)
- **Not supported:** `icon`

A group automatically hides itself when every item inside it is invisible (for example, when all of them fail their `visible` checks).

</Option>

## Item types

<Option name="`link_to`" headingSize="3">

Generates a link to any path. `link` is an alias — the two are interchangeable.

```ruby
link_to "Google", path: "https://google.com", target: :_blank
```

| Option | Description |
| --- | --- |
| `path` | The URL the link points to. May be passed positionally: `link_to "Home", main_app.root_path`. |
| `target` | Standard anchor target. `:_blank` also renders a small external-link icon. |
| `active` | Highlight matching mode — see below. |
| `title` | Native `title` attribute (hover tooltip). Rendered in the header and profile menus. Tooltips are opt-in; without `title`, none is shown. |
| `method` | Non-GET HTTP method, submitted through Turbo. Honored in the profile and header menus. |
| `params` | Extra query parameters appended to the path. Honored in the profile and header menus. |

Also accepts the shared [`icon`](#icon), [`hotkey`](#hotkey), [`data`](#data), and [`visible`](#visible) options.

`active` controls when the link is highlighted as active:

| Value | Behavior |
| --- | --- |
| `:inclusive` (default) | Active when the current path starts with the link's path — useful for nested routes. |
| `:exclusive` | Active only on an exact path match. |
| `true` / `false` | Forces the state. |

:::warning `active` is ignored on sub-items
For links nested inside a `resource` block, Avo computes the active sub-item itself — inclusively, favoring the most specific (longest) matching path — and a per-link `active:` has no effect.
:::

</Option>

<Option name="`resource`" headingSize="3">

Generates a link to a resource's Index view. Pass a symbol (`:users`) or the full class name as a String (`"Avo::Resources::User"`). Items whose resource can't be found are silently skipped.

```ruby
resource :posts
resource :posts, label: "News posts"
resource :posts, params: { status: "published" }
```

| Option | Description |
| --- | --- |
| `label` | Overrides the resource's navigation label. |
| `params` | Hash of query params appended to the link, or a Proc returning one (evaluated with access to `resource`). |

Also accepts the shared [`icon`](#icon), [`hotkey`](#hotkey), [`data`](#data), and [`visible`](#visible) options. When no `hotkey` is given, the resource class's own `self.hotkey` is used as a fallback. When no `icon` is given, the resource class's `self.icon` is used.

Passing a block nests sub-items under the resource — see the [sub-items guide](./menu-editor.html#sub-items). Any item type can be nested; nested items don't render icons, and a nested `action` inherits the enclosing resource.

```ruby
resource :projects do
  link_to "First project", path: "/admin/resources/projects/1"
  resource :tasks
  dashboard :sales
  action Avo::Actions::ExportData # inherits :projects
end
```

For readability you can wrap nested items in a `subitems do ... end` block — it behaves identically to listing them directly.

</Option>

<Option name="`dashboard`" headingSize="3">

Generates a link to a [dashboard](./dashboards.html). Pass the dashboard's `id` or `name`.

```ruby
dashboard :dashy
dashboard "Sales", label: "Sales dashboard"
```

- **Options:** `label` (overrides the dashboard's navigation label), plus the shared [`icon`](#icon), [`hotkey`](#hotkey), [`data`](#data), and [`visible`](#visible) options
- **Validation:** raises `Failed to find "..." dashboard used in the menu.` at render time when no dashboard matches the given `id` or `name`

</Option>

<Option name="`page`" headingSize="3">

Generates a link to one of your [pages](./forms-and-pages.html). Pass the page's class name as a **String**.

```ruby
page "Avo::Pages::Settings"
page "Avo::Pages::Settings", label: "App configuration"
```

- **Options:** `label` (defaults to the page's `navigation_label`, falling back to its `title`), plus the shared [`icon`](#icon), [`hotkey`](#hotkey), [`data`](#data), and [`visible`](#visible) options
- **Availability:** provided by the [`avo-forms`](./forms-and-pages.html) add-on

:::info Use the String form
Reference the page by its class name in quotes, not the bare constant. The String is resolved when the menu renders, so the page class isn't autoloaded while your initializer is parsed — which is what prevents boot and reload errors. The bare constant still works, but the String form is recommended.
:::

</Option>

<Option name="`form`" headingSize="3">

Generates a link to one of your [forms](./forms-and-pages.html). Pass the form's class name as a String (recommended, for the same autoloading reasons as [`page`](#page)) or the class itself.

```ruby
form "Avo::Forms::AppSettings"
form "Avo::Forms::AppSettings", label: "Settings"
```

- **Options:** `label` (defaults to the form's `title`), plus the shared [`icon`](#icon), [`hotkey`](#hotkey), [`data`](#data), and [`visible`](#visible) options
- **Availability:** provided by the [`avo-forms`](./forms-and-pages.html) add-on

</Option>

<Option name="`board`" headingSize="3">

Generates a link to one of your [kanban boards](./kanban-boards.html). Pass the board's `id`.

```ruby
board 1
```

- **Options:** the shared [`icon`](#icon), [`hotkey`](#hotkey), [`data`](#data), and [`visible`](#visible) options; the label is the board's name
- **Availability:** provided by the [`avo-kanban`](./kanban-boards.html) add-on

</Option>

<Option name="`action`" headingSize="3">

Adds an item that triggers one of your [actions](./actions.html). Clicking it opens the action's modal, just like the per-resource **Actions** dropdown. Pass the action class or its name as a String.

```ruby
action Avo::Actions::ExportData, resource: :projects
```

| Option | Description |
| --- | --- |
| `resource` | The resource whose URL the action runs under. **Required** at the top level; **inherited** from the enclosing `resource` block when nested (an explicit `resource:` still overrides it). Omitting it at the top level silently skips the item. |
| `label` | Overrides the action's `self.name`. |

Also accepts the shared [`icon`](#icon), [`hotkey`](#hotkey), [`data`](#data), and [`visible`](#visible) options.

- **Validation:** only [standalone actions](./actions-api.html#standalone) (`self.standalone = true`) can be added — the menu has no selected records. Non-standalone actions are skipped with a log warning.

</Option>

<Option name="`render`" headingSize="3">

Renders a renderable object — a partial or a View Component. Partials accept `locals`, following the same pattern as Rails' `render`.

```ruby
render "avo/sidebar/items/custom_tool"
render "avo/sidebar/items/custom_tool", locals: { something: :here }
render Super::Dooper::Component.new(something: :here)
```

</Option>

## Bulk helpers

<Option name="`all_resources`" headingSize="3">

Adds every resource available for navigation, except those explicitly excluded.

```ruby
group "Resources" do
  all_resources except: [:users, :orders]
end
```

- **`except`:** Array of route keys (the plural symbol, e.g. `:users` for `Avo::Resources::User`) to leave out

:::warning
`all_resources` respects your [authorization](./authorization) rules, so make sure `def index?` is enabled in the resource's policy.
:::

</Option>

<Option name="`all_dashboards`" headingSize="3">

Adds every dashboard available for navigation, except those explicitly excluded.

```ruby
group "Dashboards" do
  all_dashboards except: [:sales, :analytics]
end
```

- **`except`:** Array of dashboard `id`s to leave out

</Option>

<Option name="`all_pages`" headingSize="3">

Adds every **main** [page](./forms-and-pages.html) — sub-pages are reached through their parent page's own navigation.

```ruby
section "Configuration", icon: "tabler/outline/settings" do
  all_pages
end
```

- **Availability:** provided by the [`avo-forms`](./forms-and-pages.html) add-on

</Option>

<Option name="`all_forms`" headingSize="3">

Adds every [form](./forms-and-pages.html) defined under the `Avo::Forms` namespace.

```ruby
section "Forms", icon: "tabler/outline/forms" do
  all_forms
end
```

- **Availability:** provided by the [`avo-forms`](./forms-and-pages.html) add-on

</Option>

<Option name="`all_boards`" headingSize="3">

Adds every [kanban board](./kanban-boards.html).

```ruby
section "Boards", icon: "tabler/outline/layout-kanban" do
  all_boards
end
```

- **Availability:** provided by the [`avo-kanban`](./kanban-boards.html) add-on

</Option>

<Option name="`all_tools`" headingSize="3">

Adds every [custom tool](./custom-tools.html) by rendering each tool's partial.

```ruby
group "All tools" do
  all_tools
end
```

</Option>

## Shared options

These options are accepted by every menu item.

<Option name="`visible`" headingSize="3">

Controls whether the item renders.

```ruby
resource :users, visible: -> { current_user.admin? }
```

- **Type:** Boolean or Proc
- **Default:** `true`

Inside the Proc you have access to:

- `current_user` — as configured by the [current user method](./authentication.html#customize-the-current-user-method)
- [`context`](./customization.html#context)
- `params` — the current request's params
- [`view_context`](https://apidock.com/rails/AbstractController/Rendering/view_context) — which also gives you route helpers, e.g. `view_context.main_app.posts_path`

</Option>

<Option name="`icon`" headingSize="3">

An icon rendered next to the item's label. Use a full path like `"tabler/outline/building-store"` or `"heroicons/outline/user-group"`; bare names like `"globe"` are looked up in the bundled icon sets.

```ruby
resource :reviews, icon: "heroicons/outline/star"
```

- **Type:** String
- **Default:** `nil`
- **Supported on:** `section` and individual items (`link_to`, `resource`, `dashboard`, `page`, `form`, `board`, `action`)
- **Not supported on:** `group` and sub-items nested inside a `resource` block

Icons come from [Tabler Icons](https://tabler.io/icons) (preferred in Avo 4) or [Heroicons](https://heroicons.com/) (`outline` and `solid` variants).

</Option>

<Option name="`hotkey`" headingSize="3">

A keyboard shortcut that jumps to the item from anywhere in the admin panel, rendered as a `<kbd>` badge next to the label.

```ruby
resource :post, hotkey: "g p"
```

- **Type:** String, in [@github/hotkey](https://github.com/github/hotkey) syntax — space-separated keys are sequences (`"g p"` = press <kbd>g</kbd> then <kbd>p</kbd>)
- **Default:** `nil`; for `resource` items, falls back to the resource class's `self.hotkey`

</Option>

<Option name="`data`" headingSize="3">

Arbitrary `data` attributes added to the item's HTML element — for example `data: { turbo: false }` to make a link perform a regular request, or `data: { turbo_method: :delete }` to send a non-GET request.

```ruby
resource :users, data: { turbo: false }
```

- **Type:** Hash
- **Default:** `{}`

</Option>

<Option name="`collapsable`" headingSize="3">

Makes a `section` or `group` collapsible, adding an arrow icon to its header. The collapsed/expanded state is stored in the browser's Local Storage and remembered across page loads.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap", collapsable: true do
  # ...
end
```

- **Type:** Boolean
- **Default:** `false`
- **Supported on:** `section`, `group`

</Option>

<Option name="`collapsed`" headingSize="3">

Collapses the `section` or `group` by default. Only takes effect on a user's first visit — once they have a stored preference, that preference wins.

```ruby
group "Blog", collapsable: true, collapsed: true do
  # ...
end
```

- **Type:** Boolean
- **Default:** `false`
- **Supported on:** `section`, `group`

</Option>
