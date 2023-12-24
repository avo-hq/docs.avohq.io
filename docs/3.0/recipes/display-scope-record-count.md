# Display scope record count

The `name` and `description` scope options can be callable values and receive the `resource` and `query` objects.

The `query` object is the actual Active Record query that is made to fetch the records.
You my use that to display a counter of how many record are there in that scope.

### Example

```ruby{2-4}
class Avo::Scopes::Scheduled < Avo::Pro::Scopes::BaseScope
  self.name = -> {
    view_context.sanitize "Scheduled <span class='bg-gray-200 px-1 text-white text-xs rounded font-semibold'>#{query.count}</span>"
  }
  self.description = -> { "All the scheduled jobs." }
  self.scope = -> { query.finished.invert_where }
  self.visible = -> { true }
end
```

In this example we made the `name` option a callable block and are returning the name of the scope and a `span` with the count of the records.

We are also using the `sanitize` method to return it as HTML.
THe `sanitize` method is being called from the `view_context` as it's not directly available in that block.

:::warning
This may have some performance implicatons as it will run the `count` query on every page load.
:::
