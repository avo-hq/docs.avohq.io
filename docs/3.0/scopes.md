---
license: advanced
---

# Scopes

![](/assets/img/scopes.png)

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


```ruby
class Avo::Resources::User < Avo::BaseResource
  def scopes
    scope Avo::Scopes::Admins
  end
end
```

## Remove `All` scope

If you don't want to have the `All` default scope you can remove it by executing the `remove_scope_all` method inside `scopes` method.

```ruby
class Avo::Resources::User < Avo::BaseResource
  def scopes
    remove_scope_all
    scope Avo::Scopes::Admins
  end
end
```

## Options

The scope classes take a few options.

:::option `name`
This value is going to be displayed on the scopes bar as the name of the scope.

This can be a callable value and it receives the `resource` and `query` objects.

The `query` object can be used to compute and display the record count.

Please see [the recipe](./recipes/display-scope-record-count.html) on how to enable it.
:::

:::option `description`
This value is going to be displayed when the user hovers over the scope.

This can be a callable value and it receives the `resource` and `query` objects.
:::

:::option `scope`
The scope you return here is going to be applied to the query of records on that page.

You can use a symbol which will indicate the scope on that model or a block which will have the `query` available so you can apply any modifications you need.

```ruby
class Avo::Scopes::EvenId < Avo::Advanced::Scopes::BaseScope
  self.name = "Even"
  self.description = "Only records that have an even ID."
  self.scope = -> { query.where("#{resource.model_key}.id % 2 = ?", "0") }
  self.visible = -> { true }
end
```
:::

:::option `visible`
From this block you can show, hide, and authorize the scope on the resource.
:::
