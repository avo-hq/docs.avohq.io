## Limiting results

By default, Avo applies `config.search_results_count` (default: `8`) to search queries that return an ActiveRecord relation **without** a user-applied `.limit()`.

Set the global default in your initializer:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.search_results_count = 16
end
```

Override per query by adding `.limit()` in the `query:` proc. Your limit always wins:

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(name_cont: q).result(distinct: false).limit(5)
    }
  }
end
```

Dynamic limits work too. The `query:` block has access to all [`Avo::ExecutionContext`](./../execution-context) locals:

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(name_cont: q).result(distinct: false).limit(current_user.admin? ? 30 : 10)
    }
  }
end
```

This applies to resource-index search, [global search](./../search/global-search), and [searchable association pickers](./../associations/searchable).

:::info Custom array search providers
If your `query:` proc returns an `Array` of hashes, Avo does **not** auto-cap the results. Use `.first(N)` or `.take(N)` in your proc if you need a limit.
:::
