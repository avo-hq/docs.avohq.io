# Integration with rolify

_Recipe contributed by [Paul](https://github.com/FLX-0x00) after discussing it [here](https://github.com/avo-hq/avo/issues/1568)._

It is possible to implement the [`rolify`](https://github.com/RolifyCommunity/rolify) gem in conjunction with `pundit` in an Avo using basic functionality.
Following the next steps allows for easy management of roles within the admin panel, which can be used to control access to different parts of the application based on user roles. By assigning specific permissions to each user role, Avo users can ensure that their admin panels remain secure and accessible only to authorised users.

:::warning
You must manually require `rolify` in your `Gemfile`.
:::

```ruby
gem "rolify"
```

**If this is a new app you need to do some initial steps, create the role model and specify which models should be handled by rolify**

:::info
Check out the [rolify documentation](https://github.com/RolifyCommunity/rolify) for reference.
:::

We assume that your model for managing users is called `Account` (default when using `rodauth`) and your role model is called `Role` (default when using `rolify`).

```ruby
class Account < ApplicationRecord
  rolify

  # ...
end
```

A `Role` connects to an `Account` through `has_and_belongs_to_many` while an `Account` connects to `Role` through `has_many` (not directly used in the model because the `rolify` statement manage this). Although rolify has its own functions for adding and deleting roles, normal rails operations can also be used to manage the roles. To implement this in avo, the appropriate resources need to be created.

*Perhaps the creation of the account resource is not necessary, as it has already been done in previous steps or has been created automatically by the avo generator through a scaffold/model. So we assume this step is already done.*

```zsh
bin/rails generate avo:resource role
```

After this step the `roles` should now accessible via the avo interface. The final modification should be done in the corresponding `Account` resource file.

```ruby
class AccountResource < Avo::BaseResource
  # ...

  field :assigned_roles, as: :tags, hide_on: :forms do
    record.roles.map {|role|role.name}
  end

  # Only show roles that have not already been assigned to the object, because Avo does not use the add_role method, so it is possible to assign a role twice
  field :roles, as: :has_many, attach_scope: -> { query.where.not(id: parent.roles.pluck(:id)) }

  # ...
end
```

Example of RoleResource file:

```ruby
class RoleResource < Avo::BaseResource
  self.title = :name
  self.includes = []

  field :name, as: :text
  field :accounts, as: :has_and_belongs_to_many
end

```

The roles of an account can now be easily assigned and removed using avo. The currently assigned roles are displayed in the index and show view using the virtual `assigned_roles' field.
