# Upgrade guide

We'll update this page when we release new Avo 4 versions.

If you're looking for the Avo 3 to Avo 4 upgrade guide, please visit [the dedicated page](./avo-3-avo-4-upgrade).

## Upgrade `avo-kanban` to 4.0.0.beta.5

<Option name="Kanban search procs receive `search_type: :kanban` instead of `params[:for_kanban_board]`">

### Breaking Change

The kanban "add a card" picker used to send a `for_kanban_board=1` query param, reachable in your `self.search[:query]` proc via `params[:for_kanban_board]`. That param is no longer sent.

Instead, the picker now injects `search_type: :kanban` (and `q`) into the proc, matching Avo's other search surfaces (`:resource`, `:global`, `:association`). See [`search_type`](./search/resource-search#search-type).

### Action Required

If any of your `self.search[:query]` procs branch on `params[:for_kanban_board]`, switch them to `search_type`:

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.search = {
    query: -> {
      if params[:for_kanban_board] == "1" # [!code --]
      if search_type == :kanban # [!code ++]
        query.where(active: true).ransack(name_cont: q).result
      else
        query.ransack(name_cont: q).result
      end
    }
  }
end
```

If your search proc doesn't reference `for_kanban_board`, no change is needed.

</Option>
