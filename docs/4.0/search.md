---
license: mixed
outline: [2, 3]
api_docs: ./search-api.html
---

# Search

Search in Avo is configured once per resource, through the `self.search` class attribute. The same [`query`](./search-api.html#query) proc then powers every surface where a search box appears: the search bar on the <Index /> view, the global <kbd>Cmd</kbd> + <kbd>K</kbd> palette, [searchable association pickers](./associations/searchable), and [kanban board](./kanban-boards) card pickers.

```ruby{3-5}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(first_name_cont: q, last_name_cont: q, m: "or").result(distinct: false) }
  }
end
```

Without `self.search`, a resource shows no search bar on <Index /> and is skipped by the global search.

Avo recommends [ransack's](https://github.com/activerecord-hackery/ransack) query language for composing the search query, but ransack is **not mandatory** — the proc can run any query you like (or even call an [external search service](#custom-search-providers)). If you do use ransack, add it to your app:

```ruby
# Gemfile
gem "ransack"
```

## Enable search for a resource

Configure the [`query`](./search-api.html#query) key of the `search` class attribute on the resource.

```ruby{2-4}
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_eq: q).result(distinct: false) }
  }
end
```

The block exposes the `q` local, which contains the stripped search string, and the `query` local, the base scope to run the search on — using it ensures [authorization scopes](./authorization.html#scopes) are applied. If you need the unstripped search string, use `params[:q]`.

Make the search as strict or as loose as you need — [ransack's search matchers](https://github.com/activerecord-hackery/ransack#search-matchers) help you compose the query.

:::warning
If you're using ransack version 4 and up you must add `ransackable_attributes` and maybe more to your model in order for it to work. Read more about it [here](https://activerecord-hackery.github.io/ransack/going-further/other-notes/#authorization-allowlistingdenylisting).
:::

Once the configuration is in place, a search input appears on the resource's <Index /> view. Searching updates the current view (table, grid, map, or any other view type) in place, showing only matching records. Avo waits 300 ms after the user stops typing before firing the request — tune that with [`search_debounce`](./customization-api.html#search_debounce).

<Image src="/assets/img/4_0/search/resource-search.webm" dark-src="/assets/img/4_0/search/resource-search-dark.webm" width="2144" height="1158" alt="An Avo Projects index where typing into the per-resource search box filters the table to matching records." />

## Run a different query per surface

The same `query` proc runs from every search surface. If you want, say, a wider search in the global palette than in association pickers, branch on the [`search_type`](./search-api.html#search_type) local:

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> {
      case search_type
      when :global      # navbar ⌘K — widest, includes email
        query.ransack(first_name_cont: q, last_name_cont: q, email_cont: q, m: "or").result(distinct: false)
      when :association # picker — tightest
        query.ransack(first_name_cont: q).result(distinct: false)
      else              # index search bar
        query.ransack(first_name_cont: q, last_name_cont: q, m: "or").result(distinct: false)
      end
    }
  }
end
```

If you don't need surface-specific behavior, ignore the local and write a single query that runs everywhere.

:::info
The `search_type` local is injected by Avo Pro for the index, global, and association surfaces. It is **not** injected by the [kanban board](./kanban-boards.html) card picker, and on a Community-only install it isn't defined at all. Referencing `search_type` in those contexts raises an error — guard with `defined?(search_type)` or write a plain query. The kanban picker also reads the term from `params[:q]` rather than a `q` local.
:::

## Search within associations

To find records by attributes of an associated model, join the association and search its columns. Assuming `Application belongs_to :client`, you can search applications by the client's name, email, or phone number:

```ruby{5,7-15}
# app/avo/resources/application.rb
class Avo::Resources::Application < Avo::BaseResource
  self.search = {
    query: -> {
      query
        .joins(:client)
        .ransack(
          id_eq: q,
          name_cont: q,
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

This is about searching _through_ associations from an index or the palette. For the search-as-you-type picker on `belongs_to`/`has_many` fields, see [searchable associations](./associations/searchable).

## Authorize search

Search is authorized in policy files using the [`search?`](./authorization#search) method.

```ruby
class UserPolicy < ApplicationPolicy
  def search?
    true
  end
end
```

If `search?` returns false, the resource is excluded from the global search and the search bar on <Index /> is not displayed.

If you're already using `search?` in your policy file for something else, alias it to another method in your initializer using [`config.authorization_methods`](./authorization.html#using-different-policy-methods).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authorization_methods = {
    search: 'avo_search?',
  }
end
```

## Limit the number of results

By default, Avo caps search queries at [`config.search_results_count`](./search-api.html#search_results_count) (default: `8`) results per resource, unless your `query` proc already applies its own `.limit()` — your limit always wins.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.search_results_count = 16
end
```

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(name_cont: q).result(distinct: false).limit(current_user.admin? ? 30 : 10)
    }
  }
end
```

## Global search {#global-search}

<LicenseReq license="add_on" add_on_link="https://avohq.io/pricing-4?add_ons[]=global-search" />

The global search palette searches every resource that has `self.search` configured, all at once. Open it by clicking the trigger on the navbar or with the <kbd>Cmd</kbd> + <kbd>K</kbd> keyboard shortcut (<kbd>Ctrl</kbd> + <kbd>K</kbd> on Windows).

- <kbd>Cmd</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> - Open the global search
- <kbd>Up</kbd> and <kbd>Down</kbd> arrow keys - Navigate through search results
- <kbd>Enter</kbd> - Visit the selected record
- <kbd>Esc</kbd> - Close the search modal

The dropdown shows a limited number of quick results per resource, with each resource's header displaying the result count — "Users (8 of 21)" — and a link to a dedicated results page that lists every match without limits and can be sorted by newest or oldest. Turn the counting off per resource with [`display_count`](./search-api.html#display_count) if it's expensive on large datasets.

If the palette looks like it's searching resources it shouldn't (or missing ones it should), note that in development Avo renders a dismissible panel inside the palette listing resources with no search configuration and resources hidden from global search.

### Direct record lookup

When the search string looks like an identifier — a UUID, a prefixed ID like `plan_1234`, or a plain number — Avo also looks up records with that exact ID across all globally searchable resources and shows them in a **Direct match** section, so pasting an ID from a log or a support ticket jumps straight to the record.

### Navigation section

Below the results, the palette lists "Go to" links for every resource the current user can access, filtered as you type — handy for jumping to a resource's <Index /> without reaching for the sidebar. Disable it with [`navigation_section`](./search-api.html#navigation_section).

### Configure the global search

Use the `config.global_search` hash in your initializer to control the feature:

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

Set [`enabled: false`](./search-api.html#enabled) to hide the global search entirely. `enabled` and `navigation_section` also accept a lambda, evaluated with access to all attributes of [`Avo::ExecutionContext`](./execution-context):

```ruby{3-6}
# config/initializers/avo.rb
Avo.configure do |config|
  config.global_search = {
    enabled: -> { current_user.is_admin? },
    navigation_section: -> { current_user.is_admin? },
  }
end
```

By default the search runs as you type. Set [`search_on_type: false`](./search-api.html#search_on_type) to require pressing <kbd>Enter</kbd> instead, which runs the search and navigates to the dedicated results page.

### Hide a resource from the global search {#hide_on_global}

You might want a resource to be searchable on its own <Index /> page but not appear in the global palette. Hide it with [`hide_on_global: true`](./search-api.html#hide_on_global):

```ruby{5}
# app/avo/resources/team_membership.rb
class Avo::Resources::TeamMembership < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(id_eq: q, m: "or").result(distinct: false) },
    hide_on_global: true
  }
end
```

### Customize how results render

Each result row in the palette (and in [searchable association pickers](./associations/searchable)) renders a title and, optionally, a description and an image. Configure them with the [`item`](./search-api.html#item) key — without it, rows fall back to the record's title:

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

## Custom search providers

You can back the search with providers like Elasticsearch. When you want full control over the results, return an array of hashes from the `query` proc instead of a relation — see the [expected hash structure](./search-api.html#custom-search-providers):

```ruby{3-9}
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
With array results, the result count is not available and Avo does not auto-apply [`search_results_count`](./search-api.html#search_results_count) — cap the array yourself with `.first(N)` if needed.
:::
