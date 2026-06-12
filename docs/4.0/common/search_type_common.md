## `search_type`

The same `self.search[:query]` proc runs from four surfaces. To branch per surface, use the `search_type` local.

| Value | Surface |
|---|---|
| `:resource` | resource-index search bar (and the standalone `/search` endpoint) |
| `:global` | navbar ⌘K palette |
| `:association` | [searchable association picker](./../associations/searchable) on edit forms and the attach modal |
| `:kanban` | [kanban board](./../kanban-boards) "add a card" picker |

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
      when :kanban      # kanban "add a card" picker
        query.ransack(first_name_cont: q, last_name_cont: q, m: "or").result(distinct: false)
      end
    }
  }
end
```

If you don't need surface-specific behavior, ignore the local and write a single query that runs on every surface.
