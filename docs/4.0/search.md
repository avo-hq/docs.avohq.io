---
version: '1.0'
license: community
---

# Search

Finding what you're looking for fast is essential. That's why Avo leverages [ransack's](https://github.com/activerecord-hackery/ransack) powerful query language.

:::info
While we show you examples using `ransack`, you can use other search engines, so `ransack` is not mandatory.
:::

First, you need to add `ransack` as a dependency to your app (breaking change from Avo v1.10).

```ruby
# Gemfile
gem 'ransack'
```

## Enable search for a resource

To enable search for a resource, you need to configure the `search` class attribute to the resource file.

```ruby{2-4}
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_eq: q).result(distinct: false) }
  }
end
```

The `query` block provides the `q` variable, which contains the stripped search query string, and the `query` variable on which you run the query. That ensures that the [authorization scopes](./authorization.html#scopes) have been appropriately applied. If you need access to the unstripped query string, you can use `params[:q]` instead of `q`.

In this block, you may configure the search however strict or loose you need it. Check out [ransack's search matchers](https://github.com/activerecord-hackery/ransack#search-matchers) to compose the query better.

:::warning
If you're using ransack version 4 and up you must add `ransackable_attributes` and maybe more to your model in order for it to work. Read more about it [here](https://activerecord-hackery.github.io/ransack/going-further/other-notes/#authorization-allowlistingdenylisting).
:::

### Custom search provider

<VersionReq version="3.10.8" />

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

## Authorize search

Search is authorized in policy files using the [`search?`](./authorization#search) method.

```ruby
class UserPolicy < ApplicationPolicy
  def search?
    true
  end
end
```

If the `search?` method returns false, the search operation for that resource is not going to show up in the global search and the search box on index is not going to be displayed.

If you're using `search?` already in your policy file, you can alias it to some other method in you initializer using the `config.authorization_methods` config. More about that on [the authorization page](./authorization.html#using-different-policy-methods).

```ruby
Avo.configure do |config|
  config.authorization_methods = {
    search: 'avo_search?',
  }
  end
```

## Configure the search result

<Option name="`title`">

By default, the search results will be displayed as text. By default search title will be the [resource title](./resources.html#self_title).

<Image src="/assets/img/search/search_blank.jpg" width="1412" height="686" alt="Blank search" />

You may configure that to be something more complex using the `item -> title` option. That will display it as the title of the search result.

```ruby{6}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q, m: "or").result(distinct: false) },
    item: -> do
      {
        title: "[#{record.id}]#{record.name}",
      }
    end
  }
end
```

<Image src="/assets/img/search/search_label.jpg" width="1406" height="674" alt="Search label" />
</Option>

<Option name="`description`">

<LicenseReq license="pro" />

You might want to show more than just the title in the search result. Avo provides the `item -> description` option to add some more information.

```ruby{7}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q, m: "or").result(distinct: false) },
    item:  -> do
      {
        title: "[#{record.id}]#{record.name}",
        description: record.truncated_body
      }
    end
  }
end
```

<Image src="/assets/img/search/search_description.jpg" width="1396" height="754" alt="Search description" />
</Option>

<Option name="`image_url`">

<LicenseReq license="pro" />

You may improve the results listing by adding an image to each search result. You do that by using the `item -> image_url` attribute that is an url to a image.

```ruby{8}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q, m: "or").result(distinct: false) },
    item: -> do
      {
        title: "[#{record.id}]#{record.name}",
        description: ActionView::Base.full_sanitizer.sanitize(record.body).truncate(130),
        image_url: main_app.url_for(record.cover_photo),
      }
    end
  }
end
```

</Option>

<Option name="`image_format`">

<LicenseReq license="pro" />

The image you add to a search result can have a different format based on what you set on the `item -> image_format` attribute. You may choose between three options: `:square`, `:rounded` or `:circle`.

```ruby{9}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q, m: "or").result(distinct: false) },
    item: -> do
      {
        title: "[#{record.id}]#{record.name}",
        description: ActionView::Base.full_sanitizer.sanitize(record.body).truncate(130),
        image_url: main_app.url_for(record.cover_photo),
        image_format: :rounded
      }
    end
  }
end
```

<Image src="/assets/img/search/search_avatar.jpg" width="1400" height="794" alt="Search avatar" />
</Option>

<Option name="`help`">

You may improve the results listing header by adding a piece of text highlighting the fields you are looking for or any other instruction for the user. You do that by using the `help` attribute. This attribute takes a string and appends it to the title of the resource.

<Image src="/assets/img/search/search_header_help.jpg" width="1620" height="538" alt="Search Header Help" />

```ruby{4}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(id_eq: q, m: "or").result(distinct: false) },
    help: -> { "- search by id" }
  }
end
```
</Option>

<Option name="`result_path`">

By default, when a user clicks on a search result, they will be redirected to that record, but you can change that using the `result_path` option.

```ruby
class Avo::Resources::City < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_eq: q).result(distinct: false) },
    result_path: -> { avo.resources_city_path record, custom: "yup" }
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

## Resource search

When a resource has the `search` attribute with a valid configuration, a new search input will be displayed on the `Index` view.

<Image src="/assets/img/search/resource_search.jpg" width="808" height="395" alt="" />

## Global search

<LicenseReq license="pro" />

Avo features a powerful global search that searches across all resources that have the `search` attribute configured. The global search provides a modern, responsive interface with live search results, keyboard navigation, and rich result presentation.

### Opening global search

You can open the global search in several ways:

- **Click the search input** in the navbar
- **Keyboard shortcut**: <kbd>CMD</kbd> + <kbd>K</kbd> (macOS) or <kbd>Ctrl</kbd> + <kbd>K</kbd> (Windows/Linux)
- **Focus and start typing** in the search input

<Image src="/assets/img/search/global_search_trigger.jpg" width="960" height="76" alt="Global search trigger" />

### Search interface

The global search displays results in a dropdown container below the search input. As you type, Avo performs live searches with the following features:

#### Live search results
- Results appear instantly as you type (with debouncing)
- Shows results from all searchable resources
- Displays rich information including images, titles, and descriptions
- Shows result counts for each resource type

#### Keyboard navigation
The global search supports full keyboard navigation:

- **<kbd>↑</kbd> / <kbd>↓</kbd>**: Navigate through search results
- **<kbd>Enter</kbd>**: Select the highlighted result or go to "Show all results"
- **<kbd>Escape</kbd>**: Close the search results
- **<kbd>CMD/Ctrl</kbd> + <kbd>K</kbd>**: Focus the search input

#### Resource navigation
The search results include a "Go to" section that allows you to quickly navigate to resource index pages:

- Type a resource name to filter the navigation options
- Click or press Enter to navigate to the resource index
- Useful for quickly accessing specific resource types

#### Show all results
When you have search results, a "Show all results for [query]" option appears:

- Click to view comprehensive search results on a dedicated page
- Press <kbd>Enter</kbd> when the search input is focused to navigate there
- Shows all matching records across all resources in a structured layout

### Search result presentation

Global search results can display rich information for each record:

- **Title**: The main identifier for the record
- **Description**: Additional context (when configured with `item -> description`)
- **Images**: Avatars or thumbnails (when configured with `item -> image_url`)
- **Highlighting**: Search terms are highlighted in results

### Development warnings

<VersionReq version="4.0" />

In development mode, the global search shows helpful warnings about resource configuration:

- **Resources without search configured**: Lists resources that don't have a `search` query block
- **Resources hidden from global search**: Shows resources with `hide_on_global: true`
- **Quick configuration links**: Direct links to documentation for enabling search

These warnings can be dismissed temporarily or permanently using the warning controls.

### Hide the global search

You can disable the global search feature entirely:

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.disabled_features = [:global_search]
end
```

Since version <Version version="3.13.5" /> `disabled_features` can be callable. Within this block, you gain access to all attributes of [`Avo::ExecutionContext`](execution-context):

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.disabled_features = -> { current_user.is_admin? ? [] : [:global_search] }
end
```

### Scope out global or resource searches

You may want to perform different searches on the `global` search from the `resource` search. You can use the `params[:global]` flag to differentiate:

```ruby
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

### Advanced configuration

#### Custom search paths

You can customize where users are redirected when clicking search results using the `result_path` option:

```ruby
class Avo::Resources::Project < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q).result(distinct: false) },
    result_path: -> { avo.resources_project_path(record, tab: "details") }
  }
end
```

#### Search result limits

Control how many results appear in the global search dropdown:

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q).result(distinct: false) },
    results_count: 3  # Only show 3 users in global search dropdown
  }
end
```

## Searching within associations

In some cases, you might need to search for records based on attributes of associated models. This can be achieved by adding a few things to the search query. Here's an example of how to do that:

Assuming you have two models, `Application` and `Client`, with the following associations:

```ruby{3,8}
# app/models/application.rb
class Application < ApplicationRecord
  belongs_to :client
end

# app/models/client.rb
class Client < ApplicationRecord
  has_many :applications
end
```

You can perform a search on `Application` records based on attributes of the associated `Client`. For example, searching by the client's email, name, or phone number:

```ruby{6,11-15}
# app/avo/resources/application.rb
class Avo::Resources::Application < Avo::BaseResource
  self.search = {
    query: -> {
      query
        .joins(:client)
        .ransack(
          id_eq: q,
          name_cont: q,
          workflow_name_cont: q,
          client_id_eq: q,
          client_first_name_cont: q,
          client_last_name_cont: q,
          client_email_cont: q,
          client_phone_number_cont: q,
          m: 'or'
        ).result(distinct: false)
    }
  }
end
```

In the above example, ransack is used to search for `Application` records based on various attributes of the associated `Client`, such as `client_email_cont` and `client_phone_number_cont`. The joins method is used to join the applications table with the clients table to perform the search efficiently.

This approach allows for flexible searching within associations, enabling you to find records based on related model attributes.

## Results count

<VersionReq version="3.11" />

By default, Avo displays 8 search results whenever you search. You can change the number of results displayed by configuring the `search_results_count` option:

```ruby
Avo.configure do |config|
  config.search_results_count = 16
end
```

You can also change the number of results displayed on individual resources:

```ruby{3}
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    results_count: 5
    query: -> {},
  }
end
```

You can also assign a lambda to dynamically set the value.

```ruby{3}
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    results_count: -> { user.admin? ? 30 : 10 }
  }
end
```

If you configure `results_count` by specifying it in the resource file then that number takes precedence over the global [`search_results_count`](#results-count) for that resource.
