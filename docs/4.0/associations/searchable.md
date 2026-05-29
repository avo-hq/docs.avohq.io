---
license: pro
outline: [2, 3]
api: ./searchable-api.html
---

# Searchable associations

<DemoVideo demo-video="https://youtu.be/KLI_sVTPX-Q" />

When a target resource has too many records for a simple dropdown, `searchable` replaces the association field's `<select>` (and the attach modal's record picker) with a search-as-you-type input backed by your own query.

## Requirements

A `query` source must be defined, in one of two places:

- `self.search = { query: ... }` on the target resource — shared by every searchable picker that points at it, or
- a `query:` proc inside the field's `searchable: { ... }` hash — scoped to that single picker.

If neither is present, the picker stays empty in both modes: typing returns nothing, and `suggestions:` is never consulted.

## Boolean form

Pass `searchable: true` to opt in with the target resource's defaults.

```ruby{6}
# app/avo/resources/course_link.rb
class Avo::Resources::CourseLink < Avo::BaseResource
  def fields
    field :links,
      as: :has_many,
      searchable: true
  end
end
```

## Hash form

When the same target resource is referenced from several places and each picker needs a different scope, pass a hash instead of `true`. The hash overrides the resource-level defaults **for that one picker only**.

```ruby{6-13}
# app/avo/resources/review.rb
class Avo::Resources::Review < Avo::BaseResource
  def fields
    field :user,
      as: :belongs_to,
      searchable: {
        query: -> {
          query.ransack(first_name_cont: q, last_name_cont: q, m: "or").result(distinct: false)
        },
        suggestions: -> { query.where(role: :reviewer).order(created_at: :desc) },
        limit: 5,
        enabled: -> { current_user.admin? }
      }
  end
end
```

### `query:`

Runs while the user is typing. The records it returns fill the dropdown, capped at the configured limit. If set, it takes precedence over the target resource's `self.search[:query]`.

```ruby
query: -> { query.ransack(name_cont: q).result(distinct: false) }
```

### `suggestions:`

Runs when the picker is opened **without** any typed input. The records it returns fill the dropdown, capped at the configured limit. If set, it takes precedence over the target resource's `self.search[:suggestions]`.

```ruby
suggestions: -> { query.where(active: true).order(created_at: :desc) }
```

**Default when omitted:** provided a [query source exists](#requirements), the picker shows the latest records from the target resource's `index_query` (its base index scope), ordered by id descending — it is **not** empty. With no query source at all, the picker stays empty and `suggestions:` is never consulted.

:::info
`suggestions:` only fires on the **association picker** (`:association`). The navbar palette returns no results on a blank query, and the resource-index search bar shows the regular index listing.
:::

### `limit:`

Number or proc. Caps how many results a single picker returns. Overrides the target resource's `self.search[:results_count]` for this field.

```ruby{1,3}
limit: 5
# or
limit: -> { params[:context] == "popover" ? 3 : 10 }
```

When neither `limit:` (field) nor `results_count:` (resource) is set, Avo falls back to `Avo.configuration.search_results_count` (default `8`).

### `enabled:`

Boolean or proc. Determines whether the picker uses the searchable widget. If it evaluates to false, the field falls back to the standard `<select>`. Handy for gradual rollouts or role-based gating.

```ruby
enabled: -> { current_user.admin? }
```

## Polymorphic `belongs_to`

Both the boolean and hash forms work on polymorphic `belongs_to` associations. The picker runs separately for each target type: selecting `Post` routes the search to `Post`'s configuration, while selecting `Project` routes it to `Project`'s.

### With boolean form

```ruby{5-7}
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :commentable,
      as: :belongs_to,
      polymorphic_as: :commentable,
      types: [::Post, ::Project],
      searchable: true
  end
end
```

Define `self.search[:query]` on each target resource:

```ruby{4,11}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(id_eq: q, name_cont: q, body_cont: q, m: "or").result(distinct: false) }
  }
end

# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(id_eq: q, name_cont: q, country_cont: q, m: "or").result(distinct: false) }
  }
end
```

### With hash form

On a polymorphic field, a field-level `searchable: { ... }` defines one proc shared across all types. When behavior needs to differ per type, branch on `query.klass` (or `query.klass.name`):

```ruby{5-15}
field :reviewable,
  as: :belongs_to,
  polymorphic_as: :reviewable,
  types: [::Post, ::Project],
  searchable: {
    limit: 3,
    suggestions: -> {
      klass = query.respond_to?(:klass) ? query.klass : query
      if parent_record&.persisted? && parent_record.reviewable_type == klass.name
        query.where.not(id: parent_record.reviewable_id)
      else
        query
      end
    }
  }
```

## Customizing the picker rows

Each row in the picker is rendered from the target resource's `self.search[:item]` block — the same one [global search](./../search/global-search.html#item) uses.

<!-- @include: ./../common/search_item_common.md-->

:::info Picker-specific behavior
`item:` is **resource-level only**. Putting it inside `searchable: { ... }` on the field is silently ignored.
:::

## Precedence

A field-level hash key always overrides the equivalent setting on the target resource:

- `searchable: { query: }` overrides `self.search[:query]`
- `searchable: { suggestions: }` overrides `self.search[:suggestions]`
- `searchable: { limit: }` overrides `self.search[:results_count]`, which in turn overrides `Avo.configuration.search_results_count` (default `8`)

One resource's `self.search[:query]` is shared by every searchable picker pointing at it. If a single picker needs a different scope than the others, override it at the field level with `searchable: { query: ... }`.

## What you can use inside the procs

**Inside `query:` and `suggestions:`**

| Local             | What it is                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| `q`               | the stripped query string the user typed                                                                |
| `query`           | the base scope (already authorization-scoped)                                                           |
| `params`          | the full request params                                                                                 |
| `search_type`     | always `:association` for picker procs (lets you branch in a proc shared with global / resource search) |
| `parent_record`   | the record whose form the picker lives on; `nil` on create forms                                        |
| `parent_resource` | the Avo resource class of the parent record                                                             |

**Inside `enabled:`**

| Local          | What it is                                                    |
| -------------- | ------------------------------------------------------------- |
| `record`       | the current row's record (e.g. each row of a `has_many` list) |
| `resource`     | the Avo resource instance                                     |
| `current_user` | `Avo::Current.user`                                           |

`parent_record` can be `nil` on create forms (no parent has been persisted yet). Guard with `&.`:

```ruby
suggestions: -> { query.where.not(id: parent_record&.id).order(created_at: :desc) }
```

## Options reference

| Option        | Type            | Default                                                                                       | Description                                                                   |
| ------------- | --------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `query`       | Proc            | resource's `self.search[:query]`                                                              | Filters records while the user is typing                                      |
| `suggestions` | Proc            | resource's `self.search[:suggestions]`, else latest records from `index_query` by id desc     | Records shown when the picker opens with no input                             |
| `limit`       | Integer or Proc | resource's `self.search[:results_count]`, else `Avo.configuration.search_results_count` (`8`) | Caps how many results the picker returns                                      |
| `enabled`     | Boolean or Proc | `true`                                                                                        | Gates whether the searchable widget renders; `false` falls back to `<select>` |
