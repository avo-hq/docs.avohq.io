---
license: pro
---

# Global Search

Avo has a powerful global search feature powered by Hotwire. It searches through all the resources that have the `search` attribute with a valid configuration.

The global search leverages the [resource search](./resource-search) configuration. Please refer to the [resource search](./resource-search) section for more information on how to configure the search for a resource.

You open the global search by clicking the trigger on the navbar or by using the <kbd>Cmd</kbd> + <kbd>K</kbd> keyboard shortcut (<kbd>Ctrl</kbd> + <kbd>K</kbd> on Windows). The search includes enhanced keyboard navigation:

- <kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>Cmd</kbd> + <kbd>K</kbd> - Open global search
- <kbd>Up</kbd> and <kbd>Down</kbd> arrow keys - Navigate through search results
- <kbd>Enter</kbd> - Visit the selected record
- <kbd>Esc</kbd> - Close the search modal

The global search shows a limited number of quick results in the dropdown, with an option to view all matching results on a dedicated page without limits.

## Global configuration

Use the `global_search` configuration to enable/disable the feature and control related options.

```ruby{3-6}
# config/initializers/avo.rb
Avo.configure do |config|
  config.global_search = {
    enabled: true,
    navigation_section: true,
  }
end
```

Set `enabled: false` to hide the global search.

All configuration options can be set using a lambda. Within this block, you gain access to all attributes of [`Avo::ExecutionContext`](./../execution-context).

```ruby{3-6}
# config/initializers/avo.rb
Avo.configure do |config|
  config.global_search = {
    enabled: -> { current_user.is_admin? },
    navigation_section: -> { current_user.is_admin? },
  }
end
```

<Option name="`item`">

The `item` configuration is used to configure the item displayed in the search results. It is a hash with the following options:

| Option | Description | Default | Possible Values |
|--------|-------------|---------|-----------------|
| `title` | The title of the search result | [Resource title](./../resources.html#self_title) | Any string |
| `description` | The description of the search result | `nil` | Any string |
| `image_url` | The URL of the image to display in the search result | `nil` | Any valid URL |
| `image_format` | The format of the image to display in the search result | `:square` | `:square`, `:rounded`, `:circle` |
| `path` | The path to redirect to when clicking the search result | Record's show page | Any valid path |

### Example with all configurations

```ruby{5-13}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q, body_cont: q, m: "or").result(distinct: false) },
    item: -> do
      {
        title: "[#{record.id}] #{record.name}",
        description: record.truncated_body,
        image_url: main_app.url_for(record.cover_photo),
        image_format: :rounded,
        path: avo.resources_post_path(record, custom: "search")
      }
    end
  }
end
```

</Option>

<Option name="`hide_on_global`">

You might have a resource that you'd like to be able to perform a search on when on its `Index` page but not have it present in the global search. You can hide it using `hide_on_global: true`.

```ruby{9}
class Avo::Resources::TeamMembership < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(id_eq: q, m: "or").result(distinct: false) },
    item: -> do
      {
        description: record.level,
      }
    end,
    hide_on_global: true
  }
end
```
</Option>


### Scope out global or resource searches

You may want to perform different searches on the `global` search from the `resource` search. You may use the `params[:global]` flag to figure that out.

```ruby{5-11}
# app/avo/resources/order.rb
class Avo::Resources::Order < Avo::BaseResource
  self.search = {
    query: -> {
      if params[:global]
        # Perform global search
        query.ransack(id_eq: q, m: "or").result(distinct: false)
      else
        # Perform resource search
        query.ransack(id_eq: q, details_cont: q, m: "or").result(distinct: false)
      end
    }
  }
end
```

<Option name="`results_count`">

By default, Avo displays 8 search results for each resource in the global search. You can change the number of results displayed by configuring the `search_results_count` option:

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.search_results_count = 16
end
```

You can also change the number of results displayed on individual resources:

```ruby{4}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    results_count: 5
    query: -> {
      # ...
    },
  }
end
```

You can also assign a lambda to dynamically set the value. Inside that block you have access to all attributes of the [`Avo::ExecutionContext`](./../execution-context).

```ruby{3}
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    results_count: -> { user.admin? ? 30 : 10 }
  }
end
```

If you configure `results_count` by specifying it in the resource file then that number takes precedence over the global [`search_results_count`](#search_results_count) for that resource.

</Option>

## Custom search provider

You can use custom search providers like Elasticsearch.
In such cases, or when you want to have full control over the search results, the `query` block should return an array of hashes. Each hash should follow the structure below:

```ruby
{
  _id: 1,
  _label: "The label",
  _url: "The URL",
  _description: "Some description about the record", # only with Avo Pro and above
  _avatar: "URL to an image that represents the record", # only with Avo Pro and above
  _avatar_type: :rounded # or :circle or :square; only with Avo Pro and above
}
```

Example:

```ruby{2-10}
class Avo::Resources::Project < Avo::BaseResource
  self.search = {
    query: -> do
      [
        { _id: 1, _label: "Record One", _url: "https://example.com/1" },
        { _id: 2, _label: "Record Two", _url: "https://example.com/2" },
        { _id: 3, _label: "Record Three", _url: "https://example.com/3" }
      ]
    end
  }
end
```

:::warning
Results count will not be available with custom search providers.
:::
