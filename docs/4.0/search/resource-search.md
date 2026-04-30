---
license: community
---

# Search

Finding what you're looking for fast is essential. That's why Avo recommends using [ransack's](https://github.com/activerecord-hackery/ransack) powerful query language. While we show you examples using `ransack`, you can use other search engines, `ransack` is **not mandatory**.

If you're choosing to use `ransack`, you need to add it as a dependency to your app.

```ruby
# Gemfile
gem "ransack"
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

The `query` block provides the `q` variable, which contains the stripped search query string, and the `query` variable on which you run the query. That ensures that the [authorization scopes](./../authorization.html#scopes) have been appropriately applied. If you need access to the unstripped query string, you can use `params[:q]` instead of `q`.

In this block, you may configure the search however strict or loose you need it. Check out [ransack's search matchers](https://github.com/activerecord-hackery/ransack#search-matchers) to compose the query better.

:::warning
If you're using ransack version 4 and up you must add `ransackable_attributes` and maybe more to your model in order for it to work. Read more about it [here](https://activerecord-hackery.github.io/ransack/going-further/other-notes/#authorization-allowlistingdenylisting).
:::

## Branching by surface — `search_type`

Pickers and the navbar may want different scopes against the same resource. Branch on `search_type`:

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> {
      case search_type
      when :global      # navbar ⌘K — widest, includes email
        query.ransack(first_name_cont: q, last_name_cont: q, email_cont: q, m: "or").result(distinct: false)
      when :resource    # index search bar — name only
        query.ransack(first_name_cont: q, last_name_cont: q, m: "or").result(distinct: false)
      when :association # picker — tightest
        query.ransack(first_name_cont: q).result(distinct: false)
      end
    }
  }
end
```

If you don't need surface-specific behavior, ignore the local and write a single query that runs on every surface.

## Default suggestions on focus

<LicenseReq license="pro" />

When a [searchable picker](./../associations/belongs_to#searchable-belongs-to) is opened without typing, you can configure the records to show via `suggestions:`. The most common form is per-picker, on the field:

```ruby
field :user, as: :belongs_to, searchable: {
  suggestions: -> { query.order(created_at: :desc) }
}
```

The picker calls this proc whenever the user focuses an empty input. The proc has the same locals as `query:` (including `parent_record` for picker context). If `:suggestions` is not configured, the picker's dropdown stays closed on focus — it only opens once the user types and results come back.

:::info
`suggestions:` only fires on the **association picker** (`:association`). The navbar palette returns no results on a blank query, and the resource-index search bar shows the regular index listing.
:::

#### Resource-level fallback

Configure `self.search[:suggestions]` if you want the same suggestions for every picker pointing at this resource. Field-level `searchable: { suggestions: ... }` always wins per-picker.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q, m: "or").result(distinct: false) },
    suggestions: -> { query.order(created_at: :desc) }
  }
end
```

## Authorize search

Search is authorized in policy files using the [`search?`](./../authorization#search) method.

```ruby
class UserPolicy < ApplicationPolicy
  def search?
    true
  end
end
```

If the `search?` method returns false, the search operation for that resource is not going to show up in the global search and the search box on index is not going to be displayed.

If you're using `search?` already in your policy file, you can alias it to some other method in you initializer using the `config.authorization_methods` config. More about that on [the authorization page](./../authorization.html#using-different-policy-methods).

```ruby
Avo.configure do |config|
  config.authorization_methods = {
    search: 'avo_search?',
  }
  end
```

## Resource search

When a resource has the `search` attribute with a valid configuration, a new search input will be displayed on the `Index` view. When you perform a search, the current view (table, grid, map, or any other view type) will update to show only the matching results, maintaining the same visual format.

<Image src="/assets/img/search/resource_search.jpg" width="808" height="395" alt="" />

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
