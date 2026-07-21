---
license: add_on
add_on_link: https://avohq.io/pricing-4?add_ons[]=scopes
outline: [2, 3]
guide: ./scopes.html
prev:
  text: "Scopes"
  link: "./scopes.html"
next: false
---

# Scopes API

Per-option reference for scopes. For task-oriented documentation and worked examples, see the [Scopes guide](./scopes.html).

A scope is a class in `app/avo/scopes` configured through class attributes, then registered on a resource inside the `scopes` method:

```ruby
# app/avo/scopes/admins.rb
class Avo::Scopes::Admins < Avo::Scopes::BaseScope
  self.name = "Admins"
  self.description = "Admins only"
  self.scope = :admins
  self.visible = -> { true }
  self.counter = :lazy
end

# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def scopes
    scope Avo::Scopes::Admins, default: true
  end
end
```

## Execution context

Every option accepts a static value or a proc. Procs are executed using [`Avo::ExecutionContext`](./execution-context.html) and have access to:

- `query`
- `resource`
- `scope`
- `scoped_query` (see the performance note below)

Some options receive extra context, noted in their entries: `visible` and `counter.visible` also receive `parent_record` and `parent_resource` on nested association indexes; `counter.count` and `counter.format` run against the unfiltered base `query`, and `counter.format` additionally receives `value`.

:::warning Performance note
`scoped_query` executes the scope when called. If the scope is slow to execute, calling it inside a proc (for example in `name`) impacts every page load.
:::

## Scope class options

<Option name="`name`">

The label displayed on the scopes bar.

```ruby
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  self.name = "Even"
end
```

- **Type:** String or Proc
- **Default:** `nil`

:::tip Record counts
To show a record count next to the scope, use the built-in [`counter`](#counter) option instead of computing it inside `name`. It supports lazy loading so it won't slow down the page.
:::

</Option>

<Option name="`description`">

The tooltip displayed when the user hovers over the scope.

```ruby
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  self.description = "Only records that have an even ID."
end
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`scope`">

The scope applied to the query of records on the page. A Symbol names a scope on the model; a Proc receives `query` and returns the modified query.

```ruby
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  # Uses the `even_id` scope from the model
  self.scope = :even_id
end
```

```ruby
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  self.scope = -> { query.where("#{resource.model_key}.id % 2 = ?", "0") }
end
```

- **Type:** Symbol or Proc
- **Default:** `nil`

</Option>

<Option name="`visible`">

Shows, hides, and authorizes the scope on the resource. When it evaluates falsy, the scope tab is not rendered.

```ruby
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  self.visible = -> { current_user.admin? }
end
```

- **Type:** Boolean or Proc
- **Default:** `nil` — the scope is visible

:::info Extra access
The `visible` proc additionally receives `parent_record` and `parent_resource`, useful when working with nested resources or association contexts.
:::

</Option>

<Option name="`counter`">

Displays a count badge next to the scope's label showing how many records match the scope.

The count is computed against the resource's authorization-scoped query and ignores any active search or filters, so it always reflects the whole scope.

```ruby
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = true
end
```

- **Type:** Boolean, Symbol, or Hash with keys `loading`, `count`, `visible`, `format`
- **Default:** `nil` — no badge
- **Values:** `true` / `:eager`, `:lazy`, `:hover`, or a Hash (see the sub-options below). Invalid values are ignored — no badge renders (a debug line is logged in development).

:::warning Performance note
An eager counter runs its `count` query on every page load. For large tables, use `:lazy` or `:hover` to defer it.
:::

<Option name="`counter.loading`" headingSize="3">

Controls when the count is fetched.

| Mode                 | Behavior                                                     |
| -------------------- | ------------------------------------------------------------ |
| `:eager` (or `true`) | Count is computed during the request and rendered inline.    |
| `:lazy`              | Count loads in a deferred turbo-frame after the page paints. |
| `:hover`             | Count loads on the first hover over the scope tab. On touch devices (no hover) it degrades to `:lazy`. |

```ruby
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = :lazy
end
```

- **Type:** Symbol or Boolean
- **Default:** `:eager`

</Option>

<Option name="`counter.count`" headingSize="3">

A custom count value. The proc runs in the execution context with access to `query`, `resource`, and `scope`, where `query` is the unfiltered base query. It can return any value (not just a number) — whatever it returns becomes `value` in the [`format`](#counter.format) block.

```ruby
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = {
    loading: :lazy,
    count: -> { query.active.count }
  }
end
```

To show text or an emoji instead of a number, return a String and pass it through with a `format` of just `value`:

```ruby
# app/avo/scopes/needs_review.rb
class Avo::Scopes::NeedsReview < Avo::Scopes::BaseScope
  self.counter = {
    loading: :lazy,
    count: -> { "🚩" },
    format: -> { value }
  }
end
```

- **Type:** Proc
- **Default:** `nil` — the count is computed from the scope's query

:::info
Without a custom `count`, the computed count must be an Integer — a grouped relation (whose `.count` returns a Hash) hides the badge instead of rendering it.
:::

</Option>

<Option name="`counter.visible`" headingSize="3">

Shows the badge only in some cases. When it evaluates falsy, the count is hidden — the scope tab itself still shows (use the scope's own [`visible`](#visible) option to hide the tab). On nested association indexes, the proc receives `parent_record` and `parent_resource` the same way the scope's [`visible`](#visible) option does.

```ruby
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = {
    loading: :lazy,
    visible: -> { current_user.admin? }
  }
end
```

- **Type:** Boolean or Proc
- **Default:** `nil` — the badge is visible

</Option>

<Option name="`counter.format`" headingSize="3">

Renders the count however you like. By default the count is rendered with `number_to_delimited` (e.g. `1,234`). The block runs in the execution context — the count is available as `value` (the result of your [`count`](#counter.count) block, or the computed count when you don't set one), alongside `query`, `resource`, and `scope` — and can return any value (coerced to a string).

```ruby
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = {
    loading: :lazy,
    format: -> { "#{value} #{resource.name.pluralize.downcase}" }
  }
end
```

The `format` block can return plain text, so it also works as a text-only badge — it renders even when the scope has no numeric count. If the block raises, Avo falls back to the default delimited format, so a bad formatter never breaks the page.

- **Type:** Proc
- **Default:** `nil` — the count is rendered with `number_to_delimited`

</Option>

</Option>

## Registration options

Options passed when registering a scope on a resource, inside the `scopes` method.

<Option name="`default`">

Applies the scope by default when navigating to the resource's <Index /> view.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def scopes
    scope Avo::Scopes::OddId
    scope Avo::Scopes::EvenId, default: true
  end
end
```

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def scopes
    scope Avo::Scopes::OddId
    # EvenId is the default scope only for admins
    scope Avo::Scopes::EvenId, default: -> { current_user.admin? }
  end
end
```

- **Type:** Boolean or Proc
- **Default:** `false`

</Option>

<Option name="`remove_scope_all`">

Removes the built-in `All` scope. Call it inside the `scopes` method when you don't want an unscoped tab, or when you replace it with a custom "All" scope of your own. Pair it with [`default`](#default) on another scope so one is applied when the page loads.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def scopes
    remove_scope_all
    scope Avo::Scopes::Everybody, default: true
    scope Avo::Scopes::Admins
  end
end
```

</Option>
