---
outline: [2, 3]
---

# Upgrade guide

:::info Stay up to date
The up-to-date status of all the gems is available at [github.com/avo-hq/avo/issues/4349](https://github.com/avo-hq/avo/issues/4349)
:::

The upgrade process from Avo 3 to Avo 4 contains several important improvements and changes.

We've made these changes to improve consistency and usability of the API and we've added some new features.
Here's what you need to know to upgrade your Avo 3 application to Avo 4.

Take these steps one by one in order to upgrade your app.
You can follow it yourself or let your LLM do the heavy lifting:

```
Use this guide to upgrade this Avo 3 app to Avo 4.
Take it step by step and produce a markdown doc (avo-3-to-4-upgrade.md) with each chapter as an item, checking them off as you go.
https://docs.avohq.io/4.0/avo-3-avo-4-upgrade.html
```

Depending on how you use Avo you might not need to do all the steps.

<!-- ## Upgrade from 3.x to 4.x

:::info Ensure you have a valid license
Avo 4 requires a valid v4 license key. Your v3 license key won't work with Avo 4. Please upgrade your license at [avohq.io/pricing](https://avohq.io/pricing).
::: -->

## Get started with Avo 4

:::info Beta access and private gems
During the Avo 4 open beta, you can try **all** Avo gems (including Pro, Advanced, and other private gems) **regardless of your subscription tier**, including on Community. See [Avo 4 status and feedback #4349](https://github.com/avo-hq/avo/issues/4349) for the latest. Once Avo 4 pricing is finalized, you will need an appropriate paid license to keep using paid gems.

Private beta gems are still served from `packager.dev`. After you enroll at [avohq.io/try-4](https://avohq.io/try-4), your licenses (including Community) include a **Gem Server Token** on your [license page](https://v3.avohq.io/licenses). Configure Bundler with that token so `bundle install` can download private gems. Follow [Gem server authentication](./gem-server-authentication).
:::

Assuming you are upgrading your Avo 3 app, you need to do three things:

1. Enroll to the Avo 4 beta program by going to [avohq.io/try-4](https://avohq.io/try-4).

2. Upgrade the Avo gems

This means updating your `Gemfile` to target the beta version of Avo and running the bundle update on the gems you are using `avo`, `avo-pro`, `avo-advanced`, and all other `avo` gems you are using to use a version greater than or equal to `4.0.0.beta`.
See what other gems you might have such as `avo-nested`, `avo-rhino_field`, etc. because they need to be updated too.

```ruby
# in your Gemfile

# before
gem "avo"
gem "avo-advanced", source: "https://packager.dev/avo-hq/"

# after
gem "avo", ">= 4.0.0.beta"

source "https://packager.dev/avo-hq/" do
  # all or some of these
  gem "avo-pro", ">= 4.0.0.beta"
  gem "avo-advanced", ">= 4.0.0.beta"
  gem "avo-http_resource", ">= 4.0.0.beta"
  gem "avo-dynamic_filters", ">= 4.0.0.beta"
  gem "avo-pro", ">= 4.0.0.beta"
  gem "avo-menu", ">= 4.0.0.beta"
  gem "avo-nested", ">= 4.0.0.beta"
  gem "avo-dashboards", ">= 4.0.0.beta"
  gem "avo-collaboration", ">= 4.0.0.beta"
  gem "avo-forms", ">= 4.0.0.beta"
  gem "avo-kanban", ">= 4.0.0.beta"
  gem "avo-api", ">= 4.0.0.beta"
  gem "avo-http_resource", ">= 4.0.0.beta"
  gem "avo-reactive_fields", ">= 4.0.0.beta"
end

gem "avo-rhino_field", ">= 0.5.1"
```

```bash
# some or all of these
bundle update avo avo-advanced avo-nested avo-http_resource avo-dynamic_filters avo-pro avo-menu avo-dashboards avo-collaboration avo-forms avo-kanban avo-api avo-http_resource avo-reactive_fields avo-rhino_field
```

:::info
You can check each gem version on [avohq.io/gems](https://avohq.io/gems).
:::

3. Go through this guide to upgrade your app to Avo 4.

### Icons

We started using the Tabler icons instead of the Heroicons.
They are provided by the [`avo-icons`](https://github.com/avo-hq/avo-icons) gem and you can quickly search for them using the [tabler icon search](https://tabler.io/icons).

Try to use the Tabler icons instead of the Heroicons moving forward.

If you used any of our icons (eg: `avo/resources`), you should update them to use the new Tabler icons.
Check this PR with changes in the icons: https://github.com/avo-hq/avo/pull/4342/changes

If you see some areas which look "exploded" in the app, it's because some icons are missing and you should update them.

### Avatars and initials

Avo now uses the avatar and initials of a record or resource throughout the app.

You set the avatar using the `avatar` configuration (ex-profile photo). The avatar will be used by Avo in multiple places in the app like the <Show /> and <Edit /> views, and the new breadcrumbs.
In addition you can use the `avatar` field to display the avatar in the <Index /> view.

## Search

Avo 4 introduces significant improvements to the search functionality, with enhanced resource search and global search capabilities.

### Resource search

Resource search functionality has been significantly enhanced in Avo 4. The most notable improvement is that resource search now updates the current view (table, grid, map, or any other view type) to show only the relevant search results, providing a more intuitive and seamless search experience.

Previously, search results were displayed separately from the main view. Now, when you perform a search on a resource index page, the current view dynamically updates to display only the records that match your search criteria, maintaining the same view format you were using (whether table, grid, map, etc.).

### Global search

Global search has undergone a major architectural change in Avo 4. The previous implementation using a customized Algolia autocomplete plugin has been completely replaced with a new, fully owned component powered by Hotwire.

This transition brings several significant benefits:

#### Fully owned component

- **Complete control**: Avo now has full development control over the search experience
- **No external dependencies**: No longer relies on Algolia's autocomplete plugin
- **Future enhancements**: Much greater possibility for future improvements and customizations
- **Consistent experience**: Better integration with Avo's overall design system

#### Enhanced navigation and keyboard shortcuts

The new search component includes improved keyboard navigation:

- <kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>Cmd</kbd> + <kbd>K</kbd> - Open global search
- <kbd>Up</kbd> and <kbd>Down</kbd> arrow keys - Navigate through search results
- <kbd>Enter</kbd> - Visit the selected record
- <kbd>Esc</kbd> - Close the search modal

#### New "Show all results" functionality

The global search now includes a comprehensive results page:

- **Quick results**: The search dropdown shows a limited number of results (respecting the configured limit)
- **Show all results page**: A dedicated page that displays all matching results without the limit restriction
- **Seamless transition**: Easy access from the search dropdown to view comprehensive results

#### Breaking changes and migration notes

##### Search result limits simplified

`self.search[:results_count]` has been removed to reduce Avo-specific DSL where plain Rails already covers the need — use `.limit()` on the relation inside your `query:` proc instead of a separate results-count option.

Use one of these instead:

- **Global default**: `config.search_results_count = 16` in `config/initializers/avo.rb`
- **Per-resource**: `.limit(N)` inside the `query:` proc

A user-applied `.limit()` on a relation always takes precedence over the global default. Custom search providers that return an `Array` are never auto-capped — slice with `.first(N)` in your proc if needed.

<br>

##### Avo Pro mount point removal

To provide a cleaner public URL for the search page, `Avo::Pro` is no longer mounted under the `avo-pro` path prefix.

- Previous mount point: `.../avo-pro/...`
- New mount point: no prefix (mounted at the Avo engine root)

Most `Avo::Pro` generated links were for internal requests (such as reordering) and were not user-visible. With the introduction of the dedicated search page, the public path became visible, so we removed the `avo-pro` prefix to be able to use `/admin/search?q=da` as the public search page instead of `/admin/avo-pro/search?q=da`.

If you have hardcoded links that include the `avo-pro` prefix, update them to the new path or, preferably, use Rails route helpers going forward.

This is **not breaking** unless you used hardcoded URLs, if you used Rails path helpers, no action is needed.

##### Removed `disabled_features` configuration

The `disabled_features` configuration has been removed. It was previously used only for toggling the global search. Replace any usage with the new `global_search` configuration.

```ruby
# Before
Avo.configure do |config|
  config.disabled_features = [:global_search]
end

# After
Avo.configure do |config|
  config.global_search = {
    enabled: false,
  }
end
```

Check the [global search configuration](./search/global-search.md) for more information.

##### Removed `help` option

The `help` option in the search configuration is now obsolete and has been removed. If you were using this option in your search configuration, you should remove it:

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q, email_cont: q, m: "or").result(distinct: false) },
    help: -> { "Search by name or email address" } # [!code --]
  }
end
```

##### Repositioned `result_path` option

The `result_path` option has been moved to the `item` configuration and renamed to `path`.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q, email_cont: q, m: "or").result(distinct: false) },
    item: -> do
      {
        title: record.name,
        description: record.email,
        image_url: record.avatar.attached? ? main_app.url_for(record.avatar) : nil,
        image_format: :rounded,
        path: avo.resources_user_path(record) # [!code ++]
      }
    end,
    result_path: -> { avo.resources_user_path(record) } # [!code --]
  }
end
```

##### Use `search_type` instead of `params[:global]` / `params[:via_association]`

Avo 4 injects a `search_type` local into every `self.search[:query]` proc, with one of three values depending on which surface triggered the search:

| `search_type` | Surface                                | v3 detection                                |
|---------------|----------------------------------------|---------------------------------------------|
| `:global`     | Navbar ⌘K palette                      | `params[:global]`                           |
| `:resource`   | Resource-index search bar              | Falsey `params[:global]` (no `via_association`) |
| `:association`| Searchable association picker          | `params[:via_association] == 'has_many'`    |

`params[:via_association]` has been removed. The v4 picker no longer sets it, which means any `if params[:via_association] == 'has_many'` branch will silently fall through to `else`. There's no error, just the wrong scope applied. This branch must be migrated.

`params[:global]` still works but is superseded. It can't distinguish `:resource` from `:association`, so `search_type` is the preferred option going forward.

```ruby
self.search = {
  query: -> {
    if params[:global]                            # [!code --]
    if search_type == :global                     # [!code ++]
      query.ransack(id_eq: q, m: "or").result(distinct: false)
    elsif params[:via_association] == 'has_many' # [!code --]
    elsif search_type == :association             # [!code ++]
      query.ransack(name_cont: q).result.order(name: :asc)
    else # :resource
      query.ransack(id_eq: q, details_cont: q, m: "or").result(distinct: false)
    end
  }
}
```

## Actions

### Confirmation option renamed

- **What changed**: The `no_confirmation` action option was renamed to `confirmation` and the default behavior flipped.
  - Avo 3: `no_confirmation` (default: false), set to `true` to skip the confirmation modal.
  - Avo 4: `confirmation` (default: true), set to `false` to skip the confirmation modal.

#### Static configuration

```ruby
# Avo 3
class Avo::Actions::ExportCsv < Avo::BaseAction
  self.no_confirmation = true
end

# Avo 4
class Avo::Actions::ExportCsv < Avo::BaseAction
  self.confirmation = false
end
```

#### Dynamic configuration (lambda)

```ruby
# Avo 3
self.no_confirmation = -> { arguments[:no_confirmation] || false }

# Avo 4
self.confirmation = -> { arguments.key?(:confirmation) ? arguments[:confirmation] : true }
```

#### If you customized the actions modal/view

- **Data attribute**: `data-action-no-confirmation-value` → `data-action-confirmation-value`
- **Stimulus value**: `noConfirmation` → `confirmation`
- **Behavior**: show the modal when `confirmation` is true, submit immediately when `confirmation` is false.

## Layout

### `main_panel` is obsolete

The `main_panel` DSL has been removed in Avo 4. Previously, `main_panel` was responsible for holding the header component (title, description, controls, etc.) along with your fields.

Te migration depends on your current setup:

#### `main_panel` is the first panel and has no sidebar

Replace `main_panel` directly with `card`:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    main_panel do # [!code --]
    card do # [!code ++]
      field :id, as: :id
      field :name, as: :text
    end
  end
end
```

#### `main_panel` is the first panel and has a sidebar

Replace `main_panel` with `panel` and wrap the fields (outside the sidebar) with `card`:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    main_panel do # [!code --]
    panel do # [!code ++]
      card do # [!code ++]
        field :id, as: :id
        field :id, as: :id
      end # [!code ++]

      sidebar do
        field :created_at, as: :date_time
      end
    end
  end
```

#### Content above `main_panel`

If you have content above `main_panel`, add an explicit `header` before the renamed `main_panel`:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    panel do
      field :status, as: :badge
    end

    header # [!code ++]

    main_panel do # [!code --]
    card do # [!code ++]
      field :id, as: :id
      field :name, as: :text
    end
  end
end
```

#### Renamed `Avo::PanelComponent` to `Avo::UI::PanelComponent`

If you used the panel component in custom HTML partials you should update the import to use the new name.
The `Avo::PanelComponent` has been renamed to `Avo::UI::PanelComponent`.

```erb
<%= render Avo::PanelComponent.new(title: "User information") do |c| %> <!-- [!code --] -->
<%= render Avo::UI::PanelComponent.new(title: "User information") do |c| %> <!-- [!code ++] -->
  <% c.with_body do %>
    <%= render Avo::Fields::IdField.new(record: record) %>
    <%= render Avo::Fields::TextField.new(record: record, field: :name) %>
  <% end %>
<% end %>
```

##### PanelComponent does not automatically render the content inside a card

The PanelComponent does not automatically render the content inside a card. So if you don't render a card inside the panel, you should use the `with_card` slot instead of the `with_body` slot.

```erb
<%= render Avo::PanelComponent.new(title: "User information") do |c| %> <!-- [!code --] -->
<%= render Avo::UI::PanelComponent.new(title: "User information") do |c| %> <!-- [!code ++] -->
  <% c.with_body do %> <!-- [!code --] -->
  <% c.with_card do %> <!-- [!code ++] -->
    <%= render Avo::Fields::IdField.new(record: record) %>
    <%= render Avo::Fields::TextField.new(record: record, field: :name) %>
  <% end %>
<% end %>
```

#### Renamed `with_tools` slot to `with_controls`

The `with_tools` slot has been renamed to `with_controls`.

```erb
<%= render Avo::UI::PanelComponent.new(title: "User information") do |c| %>
  <% c.with_tools do %> <!-- [!code --] -->
  <% c.with_controls do %> <!-- [!code ++] -->
    <%= render Avo::Fields::IdField.new(record: record) %>
    <%= render Avo::Fields::TextField.new(record: record, field: :name) %>
  <% end %>
<% end %>
```

### `panel` title in keyword arguments

The `panel` title is now given as a keyword argument to the `panel` method.

```ruby
# before
panel "User information" do
  field :id, as: :id
  field :name, as: :text
end

# after
panel title: "User information" do
  field :id, as: :id
  field :name, as: :text
end
```

### `tab` title in keyword arguments

The `tab` now takes a `title` keyword argument instead of the first positional argument.

```ruby
tab "User information" do # [!code --]
tab title: "User information" do # [!code ++]
  panel do
    field :id, as: :id
    field :name, as: :text
  end
end
```

## Branding renamed to Appearance

`config.branding` has been replaced with `config.appearance`. The configuration key was renamed, the `colors:` hash was removed, and the CSS custom properties were renamed. A number of new options (color scheme switching, accent/neutral pickers, database persistence, dark-mode assets) come with it — see the [Appearance documentation](./appearance.html) for the full API.

If you didn't customize `config.branding`, no action is required.

### Rename the configuration key

```ruby
config.branding = {     # [!code --]
config.appearance = {   # [!code ++]
  logo: "my_company/logo.png",
  logomark: "my_company/logomark.png",
  favicon: "my_company/favicon.ico",
  placeholder: "my_company/placeholder.svg",
  chart_colors: ["#0B8AE2", "#34C683"]
}
```

`logo`, `logomark`, `favicon`, `placeholder` and `chart_colors` behave the same.

### `colors:` hash removed

The flat `colors:` hash is gone. The palette is now split into independent **neutral** and **accent** surfaces — each set via a preset symbol or a full custom palette. See [Neutral palette](./appearance.html#neutral-palette) and [Accent palette](./appearance.html#accent-palette).

Most apps that used `colors:` were only tinting the primary accent — the simplest replacement is to pick a preset accent:

```ruby
config.branding = {
  colors: {                     # [!code --]
    100 => "#CEE7F8",           # [!code --]
    400 => "#399EE5",           # [!code --]
    500 => "#0886DE",           # [!code --]
    600 => "#066BB2"            # [!code --]
  }                             # [!code --]
}

config.appearance = {
  accent: :blue # [!code ++]
}
```

#### Bringing your exact colors back

If you want the same hex values you had in `colors:`, configure `accent_colors:` instead. The three-token shape replaces the flat shade hash, and a single palette covers both light and dark mode:

```ruby
config.appearance = {
  accent: :brand,
  accent_colors: {
    color:      "#0886DE", # main accent — was the old `500`
    content:    "#066BB2", # subtle/hover — was the old `600`
    foreground: "#FFFFFF"  # text on accent backgrounds
  }
}
```

The old `background:` value (page background) is now driven by `neutral_colors:` instead — set the full 12-shade palette via [Custom neutral palette](./appearance.html#custom-neutral-palette) if you need that level of control.

See the [Appearance documentation](./appearance.html) for the full API.

### CSS custom properties renamed

If you wrote custom CSS that referenced Avo's brand variables, update the names:

| Avo 3                                | Avo 4                     |
| ------------------------------------ | ------------------------- |
| `--avo-color-application-background` | `--color-background`      |
| `--avo-color-primary-100`            | `--color-avo-neutral-100` |
| `--avo-color-primary-400`            | `--color-avo-neutral-400` |
| `--avo-color-primary-500`            | `--color-avo-neutral-500` |
| `--avo-color-primary-600`            | `--color-avo-neutral-600` |

Values are no longer RGB triplets — they are full CSS colors (`oklch(...)`, `#hex`, `rgb(...)`, `hsl(...)`). Avo 4 also introduces additional design tokens beyond the ones listed above (`--color-foreground`, `--color-primary`, `--color-secondary`, `--color-tertiary`, `--color-content`, `--color-content-secondary`, `--color-accent`, `--color-accent-content`, `--color-accent-foreground`) — inspect Avo's `variables.css` for the full set.

## Components

### Renamed view type components

Several view type components have been renamed and moved from the `Avo::Index` namespace to `Avo::ViewTypes`:

| Avo 3                                | Avo 4                            |
| ------------------------------------ | -------------------------------- |
| `Avo::Index::ResourceMapComponent`   | `Avo::ViewTypes::MapComponent`   |
| `Avo::Index::ResourceTableComponent` | `Avo::ViewTypes::TableComponent` |

If you're using `self.components` in your resources to customize these components, update the keys accordingly:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.components = {
    "Avo::Index::ResourceMapComponent": "Avo::Custom::ResourceMapComponent", # [!code --]
    "Avo::Index::ResourceTableComponent": "Avo::Custom::ResourceTableComponent", # [!code --]
    "Avo::ViewTypes::MapComponent": "Avo::Custom::ResourceMapComponent", # [!code ++]
    "Avo::ViewTypes::TableComponent": "Avo::Custom::ResourceTableComponent", # [!code ++]
  }
end
```

## Nested association forms

If you use the `nested` option on **`has_many`**, **`has_one`**, or **`has_and_belongs_to_many`** fields (nested association forms on <New /> and <Edit />), you must add the **`avo-nested`** gem in Avo 4. The feature is no longer bundled in the `avo-advanced` gem.

Add the gem to your `Gemfile` with the same `https://packager.dev/avo-hq/` source and authentication you use for other private Avo gems, then run `bundle install`:

```ruby
gem "avo-nested", source: "https://packager.dev/avo-hq/"
```

See [Gem server authentication](./gem-server-authentication) if you need to configure `BUNDLE_PACKAGER__DEV`. Full usage of the `nested` option is documented under [Nested in Forms](./associations/has_many#nested-in-forms) on the association field pages.

## Searchable association picker rewritten without Algolia

The searchable association picker was rewritten in Avo 4 using Hotwire (Stimulus + server-rendered HTML) instead of the Algolia autocomplete widget bundled in v3.

If you customized the v3 picker via CSS targeting Algolia's class names (`.aa-Input`, `.aa-Panel`, etc.), those selectors no longer match anything — the v4 picker uses Avo's own markup, and the Algolia stylesheet is no longer bundled.

## Pagination

### Replace `size` with `slots`

If you configured any resource pagination using the `size` option, update your pagination option from `size` to `slots`.

```ruby
self.pagination = -> do
  {
    size: ... # [!code --]
    slots: ... # [!code ++]
  }
end
```

Check the <a href="./resources.html#slots">slots documentation</a> for more details.

## Breadcrumbs

The Breadcrumbs API has been improved.
This is mostly an internal change but you might have a few `add_breadcrumb` calls in your code. Sarch for those and update them to the new API using positional arguments.

`add_breadcrumb` now takes keyword arguments instead of positional arguments.

```ruby
add_breadcrumb "Home", root_path
```

```ruby
add_breadcrumb title: "Home", path: root_path
```

`add_breadcrumb` now takes `icon` and `initials` options for a more immersive experience.

```ruby
add_breadcrumb title: "Home", icon: "heroicons/outline/home", initials: "AM"
add_breadcrumb title: "Home", icon: "tabler/outline/home", initials: "PB"
```

## Renamed `profile_photo` to `avatar`

The `profile_photo` configuration has been renamed to `avatar`.

```ruby
# Before
self.profile_photo = {
  source: :profile_photo # an Active Storage field or a path
}

# After
self.avatar = {
  source: :avatar # an Active Storage field or a path
}
```

The new avatar field will be used throughtout the app to display the record in a visual way.

## Renamed `cover_photo` to `cover`

The `cover_photo` configuration has been renamed to `cover`.

```ruby
# Before
self.cover_photo = {
  source: :cover_photo # an Active Storage field or a path
}

# After
self.cover = {
  source: :cover # an Active Storage field or a path
}
```

## Grid Item Badge DSL tweaks

The grid item badge configuration has been updated from flat properties to a nested hash structure.

```ruby
# Avo 3.15
self.grid_view = {
  card: -> do
    {
      title: record.title,
      badge_label: record.status,        # [!code --]
      badge_color: status_color,         # [!code --]
      badge_title: "Status: #{record.status}" # [!code --]
    }
  end
}

# Avo 4
self.grid_view = {
  card: -> do
    {
      title: record.title,
      badge: {                           # [!code ++]
        label: record.status,            # [!code ++]
        color: status_color,             # [!code ++]
        style: "solid",                  # [!code ++]
        title: "Status tooltip",         # [!code ++]
        icon: "heroicons/outline/check"  # [!code ++]
      }                                   # [!code ++]
    }
  end
}
```

#### Migration steps

1. **Replace flat badge properties** with a `badge` hash:
   - `badge_label` → `badge: { label: ... }`
   - `badge_color` → `badge: { color: ... }`
   - `badge_title` → `badge: { title: ... }`

2. **Add optional new properties** if needed:
   - `badge: { style: ... }` - Controls badge appearance (`subtle` or `solid`)
   - `badge: { icon: ... }` - Adds an icon to the badge

For detailed information about available colors, styles, and icons, see the [Badge field documentation](./fields/badge).

See the [Grid Item Badge](./grid-view#grid-item-badge) documentation for more details on all available options.

## Discreet information updates

We've made a few updates to the discreet information API to make it more versatile.

### API tweaks

1. Removed `id_text` and `id_badge` as they didn't really look good. Use `id` instead.
2. The `timestamps_badge` was removed
3. New `:created_at` and `:updated_at` types which show the timestamps as a key-value pair.
4. `label` is now `text`
5. Renamed `url_target` to `target`
6. `as` can be `icon`, `text`, `badge`, `key_value`
7. `key_value` has `key` and `value` options

## Removed `cluster` (and its alias `row`) in favor of `width`

The `cluster` DSL method (and its alias `row`) has been removed. Previously you wrapped fields in a `cluster do ... end` block to place them side-by-side. Now every field has a `width` option and Avo lays them out together automatically — adjacent fields with a `width` below `100` will sit on the same row.

### Replace `cluster` / `row` with `width`

```ruby
# Avo 3
cluster do
  field :company, stacked: true do
    "TechCorp Inc."
  end
  field :department, stacked: true do
    "Research & Development"
  end
end

# Avo 4
field :company, width: 50 do
  "TechCorp Inc."
end
field :department, width: 50 do
  "Research & Development"
end
```

The same applies to `row`, which was just an alias for `cluster`:

```ruby
# Avo 3
row do
  field :street_address, stacked: true
  field :city, stacked: true
end

# Avo 4
field :street_address, width: 50
field :city, width: 50
```

### Supported `width` values

`width` is given as a percentage. The supported values are `25`, `33`, `50`, `66`, `75`, and `100` (the default).

| `width` | Class    | Approx. fraction |
| ------- | -------- | ---------------- |
| `25`    | `w-1/4`  | ¼                |
| `33`    | `w-1/3`  | ⅓                |
| `50`    | `w-1/2`  | ½                |
| `66`    | `w-2/3`  | ⅔                |
| `75`    | `w-3/4`  | ¾                |
| `100`   | `w-full` | full row         |

Setting any `width` below `100` automatically marks the field as `stacked: true`, so you no longer need to repeat `stacked: true` next to a custom width.

If you used `cluster divider: true` to draw a divider between clustered fields, drop the option — the divider is no longer needed in the new layout.

### Removed field wrapper options

The `compact` and `short` props have been removed from `Avo::FieldWrapperComponent`. Fields now adapt to their context automatically, so no replacement is needed. If you had custom components that passed `compact:` or `short:` into the wrapper, remove those arguments.

### New `use_stacked_fields` configuration

A new global configuration toggles the stacked layout across every field in the app:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.use_stacked_fields = true # default: false
end
```

When set to `true`, fields render with the stacked layout by default without needing `stacked: true` on each one. You can still override per field.

## Map view tweaks

The map view positioning option was reworked so it reflects the position of the **map** instead of the position of the table.

- The configuration key moved from `table.layout` to `map.position`.
- Allowed values stay the same (`:top`, `:right`, `:bottom`, `:left`) but the semantic flipped — you now describe where the map sits, not where the table sits.

```ruby
self.map_view = {
  table: {
    visible: true,
    layout: :bottom  # [!code --]
  },
  map: {                # [!code ++]
    position: :top      # [!code ++]
  }                     # [!code ++]
}
```

Translation between the old and new keys:

| Avo 3 (`table.layout`) | Avo 4 (`map.position`) |
| ---------------------- | ---------------------- |
| `:bottom`              | `:top`                 |
| `:top`                 | `:bottom`              |
| `:left`                | `:right`               |
| `:right`               | `:left`                |

The default map style is now `mapbox://styles/mapbox/light-v11` and the default height is `26rem` when the map is positioned vertically. You can still override these via `mapkick_options`.

## Added `label_help` option

This option allows you to add a help text to the label of a field on <Show /> and <Edit /> views.

<RelatedList>
<RelatedItem href="./field-options.html#label_help">Label help option</RelatedItem>
</RelatedList>

## Cards `description` option renamed to `discreet_description`

The old `description` option was renamed to `discreet_description`
The current `description` option is used for the card description under the title.

## Removed `config.full_width_index_view` configuration for `config.container_width`

The `config.full_width_index_view` configuration has been removed in favor of the `config.container_width` configuration.

```ruby
# Before
config.full_width_index_view = true

# After
config.container_width = { index: :full }
```

More info on the [Container width](./customization.html#container-width) section.

## Added `sidebar_toggle_visible` configuration option

More info on the [Toggle the sidebar button visibility](./customization.html#toggle-the-sidebar-button-visibility) section.

## Added `self.description` option to actions

More info on the [Description option](./actions/customization.html#description) section.

## Added `self.icon` option to resources

More info on the [Icon option](./resources.html#selficon) section.

<!-- TODO: Move all the Added things to a different section -->

## Added `view.single?` method

The `view.single?` method has been added to the view object.

```ruby
if view.single?
  # Code for the "show", "edit", and "new" views
end
```

More info on the [View object](./views.html) section.

## Dynamic Filters `always_expanded` default changed to `true`

In Avo 3 the dynamic filters bar was collapsed by default behind a toggle button. In Avo 4 the default for `Avo::DynamicFilters.configuration.always_expanded` was flipped from `false` to `true`, so the filters bar is now shown expanded out of the box and the toggle button is hidden.

If you want to restore the previous behavior (collapsed by default, with a toggle button), set the option to `false` explicitly in your `config/initializers/avo.rb`:

```ruby
if defined?(Avo::DynamicFilters)
  Avo::DynamicFilters.configure do |config|
    config.always_expanded = false
  end
end
```

More info on the [`always_expanded` option](./dynamic-filters.html#always_expanded) section.
