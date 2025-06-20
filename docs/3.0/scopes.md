---
license: advanced
outline: [2,3]
---

# Scopes

<Image src="/assets/img/scopes.png" width="862" height="636" alt="" />

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
class Avo::Scopes::Admins < Avo::Advanced::Scopes::BaseScope
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

<VersionReq version="3.11" class="mt-4" />

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


The `scoped_query` method can be used to compute and display the record count. Please see [the recipe](./guides/display-scope-record-count.html) on how to enable it.

```ruby{3}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Advanced::Scopes::BaseScope
  self.name = "Even"
end
```

```ruby{4}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Advanced::Scopes::BaseScope
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
class Avo::Scopes::EvenId < Avo::Advanced::Scopes::BaseScope
  self.description = "Only records that have an even ID."
end
```

```ruby{3-5}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Advanced::Scopes::BaseScope
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
class Avo::Scopes::EvenId < Avo::Advanced::Scopes::BaseScope
  # This will use the `even_id` scope from the model
  self.scope = :even_id
end
```

```ruby{3}
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Advanced::Scopes::BaseScope
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
class Avo::Scopes::EvenId < Avo::Advanced::Scopes::BaseScope
  # Only show this scope to admins
  self.visible = -> { current_user.admin? }
end
```

</Option>

### Full example

```ruby
# app/avo/scopes/even_id.rb
class Avo::Scopes::EvenId < Avo::Advanced::Scopes::BaseScope
  # Please see the performance note above if you're using `scoped_query`
  self.name = -> { "Even (#{scoped_query.count})" }

  # This will compute the description based on the resource name
  self.description = -> {
    "Only #{resource.name.downcase.pluralize} that have an even ID"
  }

  # This will scope the query to only even IDs
  self.scope = -> { query.where("#{resource.model_key}.id % 2 = ?", "0") }

  # Only show this scope to admins
  self.visible = -> { current_user.admin? }
end
```