# Display scope record count

:::tip Use the built-in `counter` option
Avo has a built-in [`counter`](../scopes.html#counter) scope option that renders the count badge for you, with `:lazy` and `:hover` loading to avoid slowing down the page. Prefer it over the manual approach below.
:::

The manual approach documented here still works when you need full control over the markup.

The `name` and `description` scope options can be callable values and receive the `resource`, `scope` and `query` objects.

The `query` object is the actual Active Record query (unscoped) that is made to fetch the records.

There is also possible to access the `scoped_query` method that will return the `query` after applying the `scope`.
You may use that to display a counter of how many records are there in that scope. Notice that it can impact page loading time when applying on large data tables.

### Example

<Image src="/assets/img/4_0/guides/display-scope-record-count/scopes.webp" dark-src="/assets/img/4_0/guides/display-scope-record-count/scopes-dark.webp" width="1774" height="396" alt="An Avo Users index with the scopes tab bar — All, Admins, Non admins, Active — where the Active scope shows a small gray badge with the record count." />

```ruby{2-9}
class Avo::Scopes::Scheduled < Avo::Scopes::BaseScope
  self.name = -> {
    sanitize(
      "Scheduled " \
      "<span class='bg-gray-500 px-1 text-white text-xs rounded font-semibold'>" \
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

In order to make the counter stand out, we're using some Tailwind CSS classes that we have available in Avo. If you're trying different classes and they are not applying, you should consider adding the [Tailwind CSS integration](../tailwindcss-integration).

:::warning
This approach will have some performance implications as it will run the `count` query on every page load.
:::
