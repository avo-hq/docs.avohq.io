# Display scope record count

The `name` and `description` scope options can be callable values and receive the `resource`, `scope` and `query` objects.

The `query` object is the actual Active Record query (unscoped) that is made to fetch the records.

There is also possible to access the `scoped_query` method that will return the `query` after applying the `scope`.
You my use that to display a counter of how many record are there in that scope. Notice that it can impact page loading time when applying on large data tables.

### Example

```ruby{2-4}
class Avo::Scopes::Scheduled < Avo::Advanced::Scopes::BaseScope
  self.name = -> {
    sanitize(
      "Scheduled " \
      "<span class='bg-gray-200 px-1 text-white text-xs rounded font-semibold'>" \
        "#{scoped_query.count}" \
      "</span>"
    )
  }
  self.description = -> { "All the scheduled jobs." }
  self.scope = -> { query.finished.invert_where }
  self.visible = -> { true }
end
```

In this example we made the `name` option a callable block and are returning the name of the scope and a `span` with the count of the records.

We are also using the `sanitize` method to return it as HTML.

:::warning
This may have some performance implications as it will run the `count` query on every page load.
:::
