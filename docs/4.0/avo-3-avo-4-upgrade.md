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
