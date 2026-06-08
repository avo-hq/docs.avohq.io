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

If neither is present, the picker stays empty.

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
          query.ransack(first_name_cont: q, last_name_cont: q, m: "or").result(distinct: false).limit(5)
        },
        enabled: -> { current_user.admin? }
      }
  end
end
```

### `query:`

Runs while the user is typing. The records it returns fill the dropdown. If set, it takes precedence over the target resource's `self.search[:query]`. Add `.limit(N)` in the proc to cap results for this picker; otherwise Avo applies `config.search_results_count`.

```ruby
query: -> { query.ransack(name_cont: q).result(distinct: false) }
```

### `enabled:`

Boolean or proc. Determines whether the picker uses the searchable widget. If it evaluates to false, the field falls back to the standard `<select>`. Handy for gradual rollouts or role-based gating.

```ruby
enabled: -> { current_user.admin? }
```

## Default options

When the picker opens with no typed input, `q` is blank. Use the same `query:` proc and branch on `q.blank?` to return default rows — for example, recently created records or a curated shortlist.

```ruby
# Resource-level
self.search = {
  query: -> {
    q.blank? ? query.order(created_at: :desc) : query.ransack(name_cont: q).result(distinct: false)
  }
}
```

```ruby
# Field-level override
field :user, as: :belongs_to, searchable: {
  query: -> {
    q.blank? ? query.where(active: true).order(created_at: :desc) : query.ransack(name_cont: q).result(distinct: false)
  }
}
```

If your `query:` proc does not handle `q.blank?`, the picker stays empty when opened with no input.

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
    query: -> {
      case query.klass.name
      when "Post"    then query.ransack(body_cont: q).result(distinct: false)
      when "Project" then query.ransack(name_cont: q).result(distinct: false)
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

Result limits follow the same rules as [resource search](./../search/resource-search#limiting-results): a `.limit()` in the `query:` proc wins; otherwise Avo applies `config.search_results_count` (default `8`).

One resource's `self.search[:query]` is shared by every searchable picker pointing at it. If a single picker needs a different scope than the others, override it at the field level with `searchable: { query: ... }`.

## What you can use inside the procs

**Inside `query:`**

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

`parent_record` can be `nil` on create forms (no parent has been persisted yet). Guard with `&.` when referencing it inside your `query:` proc.

## Options reference

| Option        | Type            | Default                                                                                       | Description                                                                   |
| ------------- | --------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `query`       | Proc            | resource's `self.search[:query]`                                                              | Filters records while the user is typing                                        |
| `enabled`     | Boolean or Proc | `true`                                                                                        | Gates whether the searchable widget renders; `false` falls back to `<select>` |
