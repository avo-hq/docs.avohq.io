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
    query: -> { query.ransack(name_eq: params[:q]).result(distinct: false) }
  }
end
```

The `query` block passes over the `params` object that holds the `q` param, the actual query string. It also provides the `query` variable on which you run the query. That ensures that the [authorization scopes](./authorization.html#scopes) have been appropriately applied.

In this block, you may configure the search however strict or loose you need it. Check out [ransack's search matchers](https://github.com/activerecord-hackery/ransack#search-matchers) to compose the query better.

:::warning
If you're using ransack version 4 and up you must add `ransackable_attributes` and maybe more to your model in order for it to work. Read more about it [here](https://activerecord-hackery.github.io/ransack/going-further/other-notes/#authorization-allowlistingdenylisting).
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

:::option `title`

By default, the search results will be displayed as text. By default search title will be the [resource title](./resources.html#self_title).

<img :src="('/assets/img/search/search_blank.jpg')" alt="Blank search" class="border mb-4" />

You may configure that to be something more complex using the `card -> title` option. That will display it as the title of the search result.

```ruby{6}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: params[:q], m: "or").result(distinct: false) },
    item: -> do
      {
        title: "[#{record.id}]#{record.name}",
      }
    end
  }
end
```

<img :src="('/assets/img/search/search_label.jpg')" alt="Search label" class="border mb-4" />
:::

:::option `description`

<LicenseReq license="pro" />

You might want to show more than just the title in the search result. Avo provides the `card -> description` option to add some more information.

```ruby{7}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: params[:q], m: "or").result(distinct: false) },
    item:  -> do
      {
        title: "[#{record.id}]#{record.name}",
        description: record.truncated_body
      }
    end
  }
end
```

<img :src="('/assets/img/search/search_description.jpg')" alt="Search description" class="border mb-4" />
:::

:::option `image_url`

<LicenseReq license="pro" />

You may improve the results listing by adding an image to each search result. You do that by using the `card -> image_url` attribute that is an url to a image.

```ruby{8}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: params[:q], m: "or").result(distinct: false) },
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

:::option `image_format`

<LicenseReq license="pro" />

The image you add to a search result can have a different format based on what you set on the `card -> image_format` attribute. You may choose between three options: `:square`, `:rounded` or `:circle`.

```ruby{9}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: params[:q], m: "or").result(distinct: false) },
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

<img :src="('/assets/img/search/search_avatar.jpg')" alt="Search avatar" class="border mb-4" />

:::option `help`

You may improve the results listing header by adding a piece of text highlighting the fields you are looking for or any other instruction for the user. You do that by using the `help` attribute. This attribute takes a string and appends it to the title of the resource.

<img :src="('/assets/img/search/search_header_help.jpg')" alt="Search Header Help" class="border mb-4" />

```ruby{4}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(id_eq: params[:q], m: "or").result(distinct: false) },
    help: -> { "- search by id" }
  }
end
```
:::

:::option `result_path`

By default, when a user clicks on a search result, they will be redirected to that record, but you can change that using the `result_path` option.

```ruby
class Avo::Resources::City < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_eq: params[:q]).result(distinct: false) },
    result_path: -> { avo.resources_city_path record, custom: "yup" }
  }
end
```
:::

:::option `hide_on_global`

You might have a resource that you'd like to be able to perform a search on when on its `Index` page but not have it present in the global search. You can hide it using `hide_on_global: true`.

```ruby{7}
class Avo::Resources::TeamMembership < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(id_eq: params[:q], m: "or").result(distinct: false) },
    item: -> do
      {
        description: record.level,
      }
    end,
    hide_on_global: true
  }
end
```
:::

## Resource search

When a resource has the `search` attribute with a valid configuration, a new search input will be displayed on the `Index` view.

![](/assets/img/search/resource_search.jpg)

## Global search

<LicenseReq license="pro" />

Avo also has a global search feature. It will search through all the resources that have the `search` attribute with a valid configuration.

You open the global search input by clicking the trigger on the navbar or by using the <kbd>CMD</kbd> + <kbd>K</kbd> keyboard shortcut (<kbd>Ctrl</kbd> + <kbd>K</kbd> on Windows).

<img :src="('/assets/img/search/global_search_trigger.jpg')" alt="Global search trigger" class="border mb-4" />

### Hide the global search

If you, by any chance, want to hide the global search, you can do so using this setting 👇

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.disabled_features = [:global_search]
end
```

### Scope out global or resource searches

You may want to perform different searches on the `global` search from the `resource` search. You may use the `params[:global]` flag to figure that out.


```ruby
class Avo::Resources::Order < Avo::BaseResource
  self.search = {
    query: -> {
      if params[:global]
        # Perform global search
        query.ransack(id_eq: params[:q], m: "or").result(distinct: false)
      else
        # Perform resource search
        query.ransack(id_eq: params[:q], details_cont: params[:q], m: "or").result(distinct: false)
      end
    }
  }
end
```

## Searching within associations

In some cases, you might need to search for records based on attributes of associated models. This can be achieved by adding a few things to the search query. Here's an example of how to do that:

Assuming you have two models, `Application` and `Client`, with the following associations:

```ruby
  class Application < ApplicationRecord
    belongs_to :client
  end

  class Client < ApplicationRecord
    has_many :applications
  end
```

You can perform a search on `Application` records based on attributes of the associated `Client`. For example, searching by the client's email, name, or phone number:

```ruby{5,10-14}
  class Application < ApplicationRecord
    self.search = {
      query: lambda {
        query
        	.joins(:client)
        	.ransack(
	          id_eq: params[:q],
	          name_cont: params[:q],
	          workflow_name_cont: params[:q],
	          client_id_eq: params[:q],
	          client_first_name_cont: params[:q],
	          client_last_name_cont: params[:q],
	          client_email_cont: params[:q],
	          client_phone_number_cont: params[:q],
	          m: 'or'
        ).result(distinct: false)
      },
      item: lambda {
        {
          title: record.external_client_id,
          description: "#{record.client.name}, #{record.client.email}"
        }
      }
    }
  end
```

In the above example, ransack is used to search for `Application` records based on various attributes of the associated `Client`, such as client_email_cont and client_phone_number_cont. The joins method is used to join the applications table with the clients table to perform the search efficiently.

This approach allows for flexible searching within associations, enabling you to find records based on related model attributes.

## Results count
:::info Since version <Version version="3.10" />
:::
By default, Avo displays 8 search results whenever you search. You can change the number of results displayed by configuring the `search_results_count` option:

```ruby
Avo.configure do |config|
  config.search_results_count = 16
end
```

You can also change the number of results displayed on individual resources:

```ruby
# resources/user.rb

self.search: {
  results_count = 5
}
```

You can also assign a lambda:

```ruby
# resources/user.rb

self.search: {
  results_count = -> { user.admin? ? 30 : 10 }
}
```

If you configure results_count by specifying it in the resource file then that number takes precedence over the global search_results_count for that resource.
