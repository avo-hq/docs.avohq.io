---
license: pro
search_item_path: true
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

```ruby{3-7}
# config/initializers/avo.rb
Avo.configure do |config|
  config.global_search = {
    enabled: true,
    navigation_section: true,
    search_on_type: true,
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

<Option name="`search_on_type`">

By default, Avo runs the search as you type in the global search input. Set `search_on_type: false` to disable this behavior — the dropdown still opens on focus or <kbd>Cmd</kbd> + <kbd>K</kbd>, but typing no longer triggers a search. The user must press <kbd>Enter</kbd> to run the search and navigate to the dedicated results page.

```ruby{5}
# config/initializers/avo.rb
Avo.configure do |config|
  config.global_search = {
    enabled: true,
    search_on_type: false,
  }
end
```

</Option>

<Option name="`item`">

Configures how each result row renders in the palette. It's a hash with the following keys:

<!-- @include: ./../common/search_item_keys_common.md-->

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

<!-- @include: ./../common/search_limit_common.md-->

<Option name="`display_count`">

By default, Avo displays the search results count for each resource in the global search. Example: "Users (8 of 21)". You can avoid counting the number of results by configuring the `display_count` option

This is useful if you have a custom search provider that doesn't return the number of results or if you want to avoid counting the number of results on large datasets.

```ruby{4}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    display_count: false
    query: -> {
      # ...
    },
  }
end
```

You can also assign a lambda to dynamically set the value. Inside that block you have access to all attributes of the [`Avo::ExecutionContext`](./../execution-context).

```ruby{4}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    display_count: -> { user.admin? }
  }
end
```

</Option>

<!-- @include: ./../common/search_type_common.md-->

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
