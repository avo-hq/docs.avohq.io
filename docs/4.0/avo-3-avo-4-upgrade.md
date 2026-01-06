---
outline: [2,3]
---

# Upgrade guide

The upgrade process from Avo 3 to Avo 4 contains several important improvements and changes. Most of the API remains consistent, but there are some key updates to search functionality, TailwindCSS integration, and other features.

Depending on how you use Avo you might not need to do all the steps.

<!-- ## Upgrade from 3.x to 4.x

:::info Ensure you have a valid license
Avo 4 requires a valid v4 license key. Your v3 license key won't work with Avo 4. Please upgrade your license at [avohq.io/pricing](https://avohq.io/pricing).
::: -->

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

See the [Resource Header](./resource-header) documentation for more details on the new `header` DSL.

## Components

### Renamed view type components

Several view type components have been renamed and moved from the `Avo::Index` namespace to `Avo::ViewTypes`:

| Avo 3 | Avo 4 |
|-------|-------|
| `Avo::Index::ResourceMapComponent` | `Avo::ViewTypes::MapComponent` |
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
