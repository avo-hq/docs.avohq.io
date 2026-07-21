---
license: pro
outline: [2, 3]
guide: ./searchable.html
---

# Searchable associations API

Per-option reference for `searchable`. For task-oriented documentation, see the [Searchable associations guide](./searchable.html).

| Form | Value | Behavior |
| ---- | ----- | -------- |
| Boolean | `true` | Searchable picker using the target resource's [`self.search`](./../search.html#enable-search-for-a-resource) |
| Boolean | `false` | Standard `<select>` |
| Hash | `{ query:, item:, enabled: }` | Per-field overrides |

## Boolean form

Pass `searchable: true` on the association field. The picker reads `query:` and `item:` from the **target resource's** [`self.search`](./../search.html#enable-search-for-a-resource) hash. Nothing is configured on the field itself.

If the target resource has no [`self.search[:query]`](./../search.html#enable-search-for-a-resource), the picker stays empty. If it has no [`self.search[:item]`](./../search-api.html#item), rows fall back to the resource title.

```ruby{4}
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :links, as: :has_many, searchable: true
  end
end
```

```ruby{2-12}
# app/avo/resources/link.rb
class Avo::Resources::Link < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(title_cont: q).result(distinct: false)
    },
    item: -> {
      {title: record.title, description: record.url}
    }
  }
end
```

The `links` field on `Avo::Resources::Course` uses both procs from `Avo::Resources::Link`.

## Hash form

Pass a hash when a single picker needs different `query:`, `item:`, or `enabled:` behavior than the target resource provides.

```ruby{6-14}
# app/avo/resources/review.rb
class Avo::Resources::Review < Avo::BaseResource
  def fields
    field :user,
      as: :belongs_to,
      searchable: {
        query: -> {
          query.ransack(name_cont: q).result(distinct: false)
        },
        item: -> {
          {title: "Reviewer: #{record.first_name}", description: record.email}
        },
        enabled: -> { current_user.admin? }
      }
  end
end
```

## Options

<Option name="`query`">

Proc that filters records as the user types.

- **Type:** Proc / Lambda
- **Where:** `searchable: { query: }` on the field, or [`self.search[:query]`](./../search.html#enable-search-for-a-resource) on the target resource
- **Default:** `nil` — falls back to [`self.search[:query]`](./../search.html#enable-search-for-a-resource). If neither is set, the picker stays empty.
- **Precedence:** field-level overrides resource-level
- **Cap:** same rules as [Limiting results](./../search-api.html#limiting-results)
- **Locals:** `q`, `query`, `params`, `search_type`, `parent_record`, `parent_resource`

`parent_record` can be `nil` on create forms. Guard with `&.` when referencing it.

```ruby{5}
# app/avo/resources/review.rb
class Avo::Resources::Review < Avo::BaseResource
  def fields
    field :user, as: :belongs_to, searchable: {
      query: -> { query.ransack(name_cont: q).result(distinct: false) }
    }
  end
end
```

#### Polymorphic fields

One proc runs for every declared type. Branch on `query.klass` when the search needs to differ per type.

```ruby{9-14}
# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :commentable,
      as: :belongs_to,
      polymorphic_as: :commentable,
      types: [::Post, ::Project],
      searchable: {
        query: -> {
          case query.klass.name
          when "Post"    then query.ransack(body_cont: q).result(distinct: false)
          when "Project" then query.ransack(name_cont: q).result(distinct: false)
          end
        }
      }
  end
end
```

</Option>

<Option name="`item`">

Proc that renders each row in the picker dropdown.

- **Type:** Proc / Lambda
- **Where:** `searchable: { item: }` on the field, or [`self.search[:item]`](./../search-api.html#item) on the target resource
- **Default:** `nil` — falls back to [`self.search[:item]`](./../search-api.html#item), then the resource title
- **Precedence:** field-level overrides resource-level
- **Locals:** `record`, `resource`

Return value keys:

<!-- @include: ./../common/search_item_keys_common.md-->

```ruby{5-10}
# app/avo/resources/review.rb
class Avo::Resources::Review < Avo::BaseResource
  def fields
    field :user, as: :belongs_to, searchable: {
      item: -> do
        {
          title: "Reviewer: #{record.first_name}",
          description: record.email
        }
      end
    }
  end
end
```

</Option>

<Option name="`enabled`">

Toggles whether the picker renders as a searchable widget.

- **Type:** Boolean, or Proc / Lambda returning a Boolean
- **Where:** `searchable: { enabled: }` on the field
- **Default:** `true` (when omitted)
- **Falsy:** field renders the standard `<select>` instead
- **Locals:** `record`, `resource`, `current_user`

```ruby{5}
# app/avo/resources/review.rb
class Avo::Resources::Review < Avo::BaseResource
  def fields
    field :user, as: :belongs_to, searchable: {
      enabled: -> { current_user.admin? }
    }
  end
end
```

</Option>
