---
license: pro
outline: [2, 3]
guide: ./searchable.html
---

# Searchable associations API

`searchable` accepts either a boolean or a Hash of options.

::: code-group

```ruby{7} [Boolean form]
# Opts in with the target resource's self.search[:query].

# app/avo/resources/review.rb
class Avo::Resources::Review < Avo::BaseResource
  def fields
    field :id, as: :id
    field :user, as: :belongs_to, searchable: true
  end
end

# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(first_name_cont: q, last_name_cont: q, m: "or").result(distinct: false)
    }
  }
end
```

```ruby{9-16} [Hash form]
# Overrides any of the resource defaults per field.

# app/avo/resources/review.rb
class Avo::Resources::Review < Avo::BaseResource
  def fields
    field :id, as: :id
    field :user,
      as: :belongs_to,
      searchable: {
        query: -> {
          query.ransack(first_name_cont: q, last_name_cont: q, m: "or").result(distinct: false)
        },
        suggestions: -> { query.where(role: :reviewer).order(created_at: :desc) },
        enabled: -> { current_user.admin? }
      }
  end
end
```

:::

## Search behavior

<Option name="`query`">

Proc that filters records as the user types.

::: code-group

```ruby [On the field]
field :user, as: :belongs_to, searchable: {
  query: -> { query.ransack(name_cont: q).result(distinct: false) }
}
```

```ruby [On the resource]
self.search = {
  query: -> { query.ransack(name_cont: q).result(distinct: false) }
}
```

:::

- **Type:** Proc / Lambda
- **Default:** `nil` — falls back to `self.search[:query]`. If neither is set, the picker stays empty.
- **Precedence:** field-level overrides resource-level
- **Cap:** add `.limit(N)` in the proc to cap this picker; otherwise Avo applies `config.search_results_count`. A user-applied `.limit()` always wins.
- **Locals:** `q`, `query`, `params`, `parent_record`, `parent_resource`

#### Polymorphic fields

One proc runs for every declared type — branch on `query.klass` when the search needs to differ per type.

::: code-group

```ruby [Boolean form]
# Each target resource defines its own self.search[:query]
class Avo::Resources::Post < Avo::BaseResource
  self.search = { query: -> { query.ransack(body_cont: q).result(distinct: false) } }
end

class Avo::Resources::Project < Avo::BaseResource
  self.search = { query: -> { query.ransack(name_cont: q).result(distinct: false) } }
end
```

```ruby [Hash form]
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

:::

</Option>

<Option name="`suggestions`">

Proc that returns records when the picker opens with no typed input.

::: code-group

```ruby [On the field]
field :user, as: :belongs_to, searchable: {
  suggestions: -> { query.where(active: true).order(created_at: :desc) }
}
```

```ruby [On the resource]
self.search = {
  suggestions: -> { query.where(active: true).order(created_at: :desc) }
}
```

:::

- **Type:** Proc / Lambda
- **Default:** `nil` — falls back to `self.search[:suggestions]`, else `index_query.order(id: :desc)`
- **Precedence:** field-level overrides resource-level
- **Locals:** `q`, `query`, `params`, `parent_record`, `parent_resource`

#### Polymorphic fields

One proc runs for every declared type — branch on `query.klass` when the suggestions need to differ per type.

::: code-group

```ruby [Boolean form]
# Each target resource defines its own self.search[:suggestions]
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(body_cont: q).result(distinct: false) },
    suggestions: -> { query.order(created_at: :desc) }
  }
end

class Avo::Resources::Project < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q).result(distinct: false) },
    suggestions: -> { query.where(active: true).order(created_at: :desc) }
  }
end
```

```ruby [Hash form]
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :commentable,
      as: :belongs_to,
      polymorphic_as: :commentable,
      types: [::Post, ::Project],
      searchable: {
        suggestions: -> {
          case query.klass.name
          when "Post"    then query.order(created_at: :desc)
          when "Project" then query.where(active: true).order(created_at: :desc)
          end
        }
      }
  end
end
```

:::
- **Surface:** fires only on the association picker; navbar palette returns no results on blank input; resource-index search bar shows the regular index listing

</Option>

<Option name="`enabled`">

Toggles whether the picker renders as a searchable widget.

```ruby
searchable: {
  enabled: -> { current_user.admin? }
}
```

- **Type:** Boolean, or Proc / Lambda returning a Boolean
- **Default:** `true` (when omitted)
- **Falsy:** field renders the standard `<select>` instead
- **Locals:** `record`, `resource`, `current_user`

</Option>

## Customize the search results

<Option name="`item`">

Customize the search results.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    item: -> do
      {
        title: "[#{record.id}] #{record.name}",
        description: record.email,
        image_url: main_app.url_for(record.avatar),
        image_format: :rounded
      }
    end
  }
end
```
</Option>
