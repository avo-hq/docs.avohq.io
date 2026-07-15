---
license: advanced
outline: [2, 4]
---

# Scopes

<Image src="/assets/img/4_0/scopes/scopes.png" dark-src="/assets/img/4_0/scopes/scopes-dark.png" width="2824" height="1208" alt="Scopes bar" />

:::warning
This section is a work in progress.
:::

Sometimes you might need to segment your data beyond just a few filters. You might have an `User` resource but you frequently need to see all the **Active users** or **Admin users**. You can use a filter for that or add a scope.

## Generating scopes

```bash
bin/rails generate avo:scope admins
```

```ruby
# app/avo/scopes/admins.rb
class Avo::Scopes::Admins < Avo::Scopes::BaseScope
  self.name = "Admins" # Name displayed on the scopes bar
  self.description = "Admins only" # This is the tooltip value
  self.scope = :admins # valid scope on the model you're using it
  self.visible = -> { true } # control the visibility
end

# app/models/user.rb
class User < ApplicationRecord
  scope :admins, -> { where role: :admin } # This is used in the scope file above
end
```

## Registering scopes

Because scopes are re-utilizable, you must manually add that scope to a resource using the `scope` method inside the `scopes` method.

```ruby{4}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def scopes
    scope Avo::Scopes::Admins
  end
end
```

<Option name="`default`" headingSize="3">

The `default` option lets you select a default scope that is applied when you
navigate to the resources page.

This option can be configured using a static value or a proc, which is executed using the [Avo::ExecutionContext](./execution-context.html). Check the [Execution Context](#execution-context) section for more information about what's available in the execution context.

```ruby{5-6}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def scopes
    scope Avo::Scopes::OddId
    # EvenId scope is applied as default
    scope Avo::Scopes::EvenId, default: true
  end
end
```

```ruby{5-6}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def scopes
    scope Avo::Scopes::OddId
    # EvenId scope is applied as default if the current user is an admin
    scope Avo::Scopes::EvenId, default: -> { current_user.admin? }
  end
end
```

</Option>

<Option name="`remove_scope_all`" headingSize="3">

If you don't want to have the `All` default scope you can remove it by executing the `remove_scope_all` method inside `scopes` method.

```ruby{4}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def scopes
    remove_scope_all
    scope Avo::Scopes::Admins
  end
end
```

</Option>

## Options

### Execution Context

All options can be configured using static values or procs. The procs are executed using the [Avo::ExecutionContext](./execution-context.html), which provides access to all default methods and attributes available in Avo's execution context. Each option has access to:

- `query`
- `resource`
- `scope`
- `scoped_query` (check below Performance Note)

:::warning Performance Note
Inside each proc, you can call `scoped_query`, but use it with caution as it executes the scope. If the scope takes a while to execute, this could impact performance.
:::

---

<Option name="`name`" headingSize="3">

This value is going to be displayed on the scopes bar as the name of the scope.

:::tip Record counts
To show a record count next to the scope, use the built-in [`counter`](#counter) option instead of computing it inside `name`. It supports lazy and on-hover loading so it won't slow down the page.
:::

```ruby{3}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  self.name = "Even"
end
```

```ruby{4}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  # Please see the performance note above if you're using `scoped_query`
  self.name = -> { "Even (#{scoped_query.count})" }
end
```

</Option>

---

<Option name="`description`" headingSize="3">

This value is going to be displayed when the user hovers over the scope.

```ruby{3}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  self.description = "Only records that have an even ID."
end
```

```ruby{3-5}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  self.description = -> {
    "Only #{resource.name.downcase.pluralize} that have an even ID"
  }
end
```

</Option>

---

<Option name="`scope`" headingSize="3">

The scope you return here is going to be applied to the query of records on that page.

You can use a symbol which will indicate the scope on that model or a proc which will have the `query` available so you can apply any modifications you need.

```ruby{4}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  # This will use the `even_id` scope from the model
  self.scope = :even_id
end
```

```ruby{3}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  self.scope = -> { query.where("#{resource.model_key}.id % 2 = ?", "0") }
end
```

</Option>

---

<Option name="`visible`" headingSize="3">

From this block you can show, hide, and authorize the scope on the resource.

:::info Extra Access
The `visible` option has additional access to `parent_record` and `parent_resource` variables, which are useful when working with nested resources or association contexts.
:::

```ruby{4}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  # Only show this scope to admins
  self.visible = -> { current_user.admin? }
end
```

</Option>

---

<Option name="`counter`" headingSize="3">

Displays a count badge next to the scope's label showing how many records match the scope. This is the built-in, recommended alternative to computing the count manually inside `name`.

The count is computed against the resource's authorization-scoped query and ignores any active search or filters, so it always reflects the whole scope.

Set it to `true` (or `:eager`) to render the count during the request:

```ruby{3}
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = true
end
```

:::warning Performance Note
An eager counter runs its `count` query on every page load. For large tables, use `:lazy` or `:hover` to defer it.
:::

For finer control, pass a Hash with any of the keys below.

<Option name="`counter.loading`" headingSize="4">

Controls when the count is fetched.

| Mode                 | Behavior                                                              |
| -------------------- | --------------------------------------------------------------------- |
| `:eager` (or `true`) | Count is computed during the request and rendered inline.             |
| `:lazy`              | Count loads in a deferred turbo-frame after the page paints.          |
| `:hover`             | Same as `:lazy` — loads in a deferred turbo-frame after paint.        |

```ruby{3}
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = :lazy
end
```

</Option>

<Option name="`counter.count`" headingSize="4">

A custom count value. The `count` proc runs in the execution context with access to `query`, `resource`, and `scope`, where `query` is the unfiltered base query. It can return any value (not just a number) — whatever it returns becomes `value` in the `format` block:

```ruby{3-6}
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = {
    loading: :lazy,
    count: -> { query.active.count }
  }
end
```

</Option>

<Option name="`counter.visible`" headingSize="4">

A boolean or proc that shows the badge only in some cases. When it evaluates falsy, the count is hidden — the scope tab itself still shows (use the scope's own [`visible`](#visible) option to hide the tab):

```ruby{5}
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = {
    loading: :lazy,
    visible: -> { current_user.admin? }
  }
end
```

</Option>

<Option name="`counter.format`" headingSize="4">

By default the count is rendered with `number_to_delimited` (e.g. `1,234`). A `format` block renders it however you like. It runs in the execution context — the count is available as `value` (the result of your `count` block, or the computed count when you don't set one), alongside `query`, `resource`, and `scope`, where `query` is the same unfiltered base query used by `counter.count` — and can return any value (coerced to a string):

```ruby{5}
# app/avo/scopes/active.rb
class Avo::Scopes::Active < Avo::Scopes::BaseScope
  self.counter = {
    loading: :lazy,
    format: -> { "#{value} #{resource.name.pluralize.downcase}" }
  }
end
```

The `format` block can return plain text, so it also works as a text-only badge — it renders even when the scope has no numeric count. If your `format` block raises, Avo falls back to the default delimited format, so a bad formatter never breaks the page.

</Option>

</Option>

## Full example

```ruby
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Scopes::BaseScope
  self.name = "Even"

  # This will compute the description based on the resource name
  self.description = -> {
    "Only #{resource.name.downcase.pluralize} that have an even ID"
  }

  # This will scope the query to only even IDs
  self.scope = -> { query.where("#{resource.model_key}.id % 2 = ?", "0") }

  # Only show this scope to admins
  self.visible = -> { current_user.admin? }

  # Show a record count badge, loaded lazily so it won't slow down the page
  self.counter = :lazy
end
```
