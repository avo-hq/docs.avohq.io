---
license: pro
outline: [2, 3]
api_docs: ./searchable-api.html
---

# Searchable associations

<DemoVideo demo-video="https://youtu.be/KLI_sVTPX-Q" />

When a target resource has too many records for a simple dropdown, `searchable` replaces the association field's `<select>` (and the attach modal's record picker) with a search-as-you-type input backed by your own query.

## Requirements

A `query` source must be defined, in one of two places:

- `self.search = { query: ... }` on the target resource, shared by every searchable picker that points at it ([full docs here](./../search/resource-search.html#enable-search-for-a-resource)), or
- a `query:` proc inside the field's `searchable: { ... }` hash, scoped to that single picker ([details here](#query)).

If neither is present, the picker stays empty.

:::info Precedence
A field-level `searchable: { query: }` or `{ item: }` overrides the matching key on the target resource for that picker only. Everything else about writing those procs is the same as [resource search](./../search/resource-search.html#enable-search-for-a-resource).
:::

## Boolean form

Pass `searchable: true` to opt in with the target resource's search configuration.

```ruby{4}
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :links, as: :has_many, searchable: true
  end
end
```

On this example, the `links` field will use the `Avo::Resources::Link` resource's `query:` and `item:` configuration.

## Hash form

When you need more granular control over a single picker, pass a hash instead of `true`. Use it to override the target resource's `query:` or `item:` for that field, or to gate the picker with `enabled:`.


```ruby{5-14}
# app/avo/resources/review.rb
class Avo::Resources::Review < Avo::BaseResource
  def fields
    field :user, as: :belongs_to,
      searchable: {
        query: -> { query.ransack(name_cont: q).result(distinct: false) },
        item: -> do
          {
            title: "Reviewer: #{record.user.first_name}",
            description: record.user.email
          }
        end,
        enabled: -> { current_user.admin? }
      }
  end
end
```

### `query:`

Runs while the user is typing. The records it returns fill the dropdown. See [resource search](./../search/resource-search.html#enable-search-for-a-resource) for how to write the proc; the same rules apply here.


### `enabled:`

Boolean or proc. Determines whether the picker uses the searchable widget. If it evaluates to false, the field falls back to the standard `<select>`. Handy for gradual rollouts or role-based gating.

### `item:`

Configures how each row renders in the dropdown. See the [Searchable associations API](./searchable-api.html#item) for the available keys.


## Default options

If you want to change what appears when the user clicks the field before typing anything, branch on `q.blank?` in the field's `query:` proc.

```ruby{7-13}
# app/avo/resources/review.rb
class Avo::Resources::Review < Avo::BaseResource
  def fields
    field :user,
      as: :belongs_to,
      searchable: {
        query: -> {
          if q.blank?
            query.where(active: true).order(created_at: :desc).limit(10)
          else
            query.ransack(name_cont: q).result(distinct: false)
          end
        }
      }
  end
end
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
    query: -> { query.ransack(name_cont: q).result(distinct: false) }
  }
end

# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q).result(distinct: false) }
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
