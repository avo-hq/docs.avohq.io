---
license: pro
---

# Authorization

When you share access to Avo with your clients or large teams, you may want to restrict access to a resource or a subset of resources. One example may be that only admin-level users may delete or update records.

Avo provides a [Pundit](https://github.com/varvet/pundit) client out of the box for authorization that uses a policy system to manage access.

:::info Pundit alternative
Pundit is just the default client. You may plug in your own client using the instructions [here](#custom-authorization-clients).
You can use [this](https://github.com/avo-hq/avo/issues/1922) `action_policy` client as well.
:::

:::warning
You must manually require `pundit` or your authorization library in your `Gemfile`.

```ruby
# Minimal authorization through OO design and pure Ruby classes
gem "pundit"
```
And update config/initializers/avo.rb with following configuration:
```ruby
# Example of enabling authorization client in Avo configuration
config.authorization_client = :pundit
```
:::

## Ensure Avo knows who your current user is

Before setting any policies up, please ensure Avo knows your current user. Usually, this 👇 set up should be fine, but follow [the authentication guide](./authentication#customize-the-current-user-method) for more information.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_method = :current_user
end
```

## Policies

Just run the regular pundit `bin/rails g pundit:policy Post` to generate a new policy.

**If this is a new app you need to install pundit first <code>bin/rails g pundit:install</code>.**

With this new policy, you may control what every type of user can do with Avo. The policy has the default methods for the regular controller actions: `index?`, `show?`, `create?`, `new?`, `update?`, `edit?` and `destroy?`.

These methods control whether the resource appears on the sidebar, if the view/edit/destroy buttons are visible or if a user has access to those index/show/edit/create pages.

<Option name="index?">

`index?` is used to display/hide the resources on the sidebar and restrict access to the resources **Index** view.

:::info
  This option is used in the **auto-generated menu**, not in the **menu editor**.

  You'll have to use your own logic in the [`visible`](./menu-editor#item-visibility) block for that.
:::

</Option>

<Option name="`show?`">

When setting `show?` to `false`, the user will not see the show icon on the resource row and will not have access to the **Show** view of a resource.

</Option>

<Option name="`create?`">

The `create?` method will prevent the users from creating a resource. That will also apply to the `Create new {model}` button on the <Index />, the `Save` button on the `/new` page, and `Create new {model}` button on the association `Show` page.

</Option>

<Option name="`new?`">

The `new?` method will control whether the users can save the new resource. You can also access the `record` variable with the form values pre-filled.

</Option>

<Option name="`edit?`">

`edit?` to `false` will hide the edit button on the resource row and prevent the user from seeing the edit view.

</Option>

<Option name="`update?`">

`update?` to `false` will prevent the user from updating a resource. You can also access the `record` variable with the form values pre-filled.

</Option>

<Option name="`destroy?`">

`destroy?` to `false` will prevent the user from destroying a resource and hiding the delete button.

:::info More granular file authorization
These are per-resource and general settings. If you want to control the authorization per individual file, please see the [granular settings](#attachments).
:::

</Option>

<Option name="`act_on?`">

Controls whether the user can see the actions button on the <Index /> page.

</Option>

<Option name="`reorder?`">

Controls whether the user can see the [records reordering](./records-reordering) buttons on the <Index /> page.

<Image src="/assets/img/authorization/actions_button.jpg" width="1220" height="632" alt="Actions button" />

</Option>

<Option name="`search?`">

Controls whether the user can see the [resource search input](./search) on top of the <Index /> page.

</Option>

<Option name="`preview?`">

<VersionReq version="3.18.0" />

Controls access to the preview endpoint, which is triggered by the [preview field](./record-previews.html).

:::info
This policy method does not control the visibility of the [preview field](./record-previews.html). It only manages authorization at the endpoint level. To hide the preview field, use the `visible` field option.
:::

</Option>

## Associations

When using associations, you would like to set policies for `creating` new records on the association, allowing to `attach`, `detach`, `create` or `destroy` relevant records. Again, Avo makes this easy using a straightforward naming schema.

:::warning
Make sure you use the same pluralization as the association name.

For a `has_many :users` association use the plural version method `view_users?`, `edit_users?`, `detach_users?`, etc., not the singular version `detach_user?`.
:::

### Example scenario

We'll have this example of a `Post` resource with many `Comment`s through the `has_many :comments` association.


:::info The `record` variable in policy methods
In the `Post` `has_many` `Comments` example, when you want to authorize `show_comments?` in `PostPolicy` you will have a `Comment` instance as the `record` variable, but when you try to authorize the `attach_comments?`, you won't have that `Comment` instance because you want to create one, but we expose the parent `Post` instance so you have more information about that authorization action that you're trying to make.
:::

<Option name="`attach_{association}?`">

Controls whether the `Attach comment` button is visible. The `record` variable is the parent record (a `Post` instance in our scenario).

<Image src="/assets/img/authorization/attach.jpg" width="1224" height="692" alt="" />

</Option>
<Option name="`detach_{association}?`">

Controls whether the **detach button is available** on the associated record row on the <Index /> view. The `record` variable is the actual row record (a `Comment` instance in our scenario).

<Image src="/assets/img/authorization/detach.jpg" width="1224" height="692" alt="" />

</Option>
<Option name="`view_{association}?`">

Controls whether the whole association is being displayed on the parent record. The `record` variable is the actual row record (a `Comment` instance in our scenario).

</Option>
<Option name="`show_{association}?`">

Controls whether the **view button is visible** on the associated record row on the <Index /> page. The `record` variable is the actual row record (a `Comment` instance in our scenario).

:::warning
This **does not** control whether the user has access to that record. You control that using the Policy of that record (`PostPolicy.show?` in our example).
:::

<Image src="/assets/img/authorization/show.jpg" width="1224" height="692" alt="" />

:::info Difference between `view_{association}?` and `show_{association}?`
Let's take a `Post` `has_many` `Comment`s.

When you use the `view_comments?` policy method you get the `Post` instance as the `record` and you control if the whole listing of comments appears on that record's <Show /> page.

When you use `show_comments?` policy method, the `record` variable is each `Comment` instance and you control whether the view button is displayed on each individual row.
:::

</Option>
<Option name="`edit_{association}?`">

Controls whether the **edit button is visible** on the associated record row on the <Index /> page.The `record` variable is the actual row record (a `Comment` instance in our scenario).

:::warning
This **does not** control whether the user has access to that record's edit page. You control that using the Policy of that record (`PostPolicy.show?` in our example).
:::

<Image src="/assets/img/authorization/edit.jpg" width="1224" height="692" alt="" />
</Option>

<Option name="`create_{association}?`">

Controls whether the `Create comment` button is visible. The `record` variable is the parent record (a `Post` instance in our scenario).

<Image src="/assets/img/authorization/create.jpg" width="1224" height="692" alt="" />

</Option>
<Option name="`destroy_{association}?`">

Controls whether the **delete button is visible** on the associated record row on the <Index /> page.The `record` variable is the actual row record (a `Comment` instance in our scenario).

<Image src="/assets/img/authorization/destroy.jpg" width="1224" height="692" alt="" />

</Option>
<Option name="`act_on_{association}?`">

Controls whether the `Actions` dropdown is visible. The `record` variable is the parent record (a `Post` instance in our scenario).

<Image src="/assets/img/authorization/actions.jpg" width="1224" height="692" alt="" />

</Option>
<Option name="`reorder_{association}?`">

Controls whether the user can see the [records reordering](./records-reordering) buttons on the `has_many` <Index /> page.
</Option>

## Removing duplication

:::info A note on duplication
Let's take the following example:

A `User` has many `Contract`s. And you represent that in your Avo resource. How do you handle authorization to the `ContractResource`?

For one, you set the `ContractPolicy.index?` and `ContractPolicy.edit?` methods to `false` so regular users don't have access to all contracts (see and edit), and the `UserPolicy.view_contracts?` and `UserPolicy.edit_contracts?` set to `false`, because, when viewing a user you want to see all the contracts associated with that user and don't let them edit it.

You might be thinking that there's code duplication here. "Why do I need to set a different rule for `UserPolicy.edit_contracts?` when I already set the `ContractPolicy.edit?` to `false`? Isn't that going to take precedence?"

Now, let's imagine we have a user that is an admin in the application. The business need is that an admin has access to all contracts and can edit them. This is when we go back to the `ContractPolicy.edit?` and turn that to true for the admin user. And now we can separately control who and where a user can edit a contract.
:::

You may remove duplication by applying the same policy rule from the original policy.

```ruby
class CommentPolicy
  # ... more policy methods
  def edit
    record.user_id == current_user.id
  end
end

class PostPolicy
  # ... more policy methods
  def edit_comments?
    Pundit.policy!(user, record).edit?
  end
end
```

Now, whatever action you take for one comment, it will be available for the `edit_comments?` method in `PostPolicy`.

<VersionReq version="2.31" />

From version 2.31 we introduced a concern that removes the duplication and helps you apply the same rules to associations. You should include `Avo::Pro::Concerns::PolicyHelpers` in the `ApplicationPolicy` for it to be applied to all policy classes.

`PolicyHelpers` allows you to use the method `inherit_association_from_policy`. This method takes two arguments; `association_name` and the policy file you want to be used as a template.

```ruby
inherit_association_from_policy :comments, CommentPolicy
```

With just one line of code, it will define the following methods to policy your association:

```ruby
def create_comments?
  CommentPolicy.new(user, record).create?
end

def edit_comments?
  CommentPolicy.new(user, record).edit?
end

def update_comments?
  CommentPolicy.new(user, record).update?
end

def destroy_comments?
  CommentPolicy.new(user, record).destroy?
end

def show_comments?
  CommentPolicy.new(user, record).show?
end

def reorder_comments?
  CommentPolicy.new(user, record).reorder?
end

def act_on_comments?
  CommentPolicy.new(user, record).act_on?
end

def view_comments?
  CommentPolicy.new(user, record).index?
end

# Since Version 3.10.0

def attach_comments?
  CommentPolicy.new(user, record).attach?
end

def detach_comments?
  CommentPolicy.new(user, record).detach?
end
```

Although these methods won't be visible in your policy code, you can still override them. For instance, if you include the following code in your `CommentPolicy`, it will be executed in place of the one defined by the helper:

```ruby
inherit_association_from_policy :comments, CommentPolicy

def destroy_comments?
  false
end
```

## Attachments

<VersionReq version="2.28" />

When working with files, it may be necessary to establish policies that determine whether users can `upload`, `download` or `delete` files. Fortunately, Avo simplifies this process by providing a straightforward naming schema for these policies.

Both the `record` and the `user` will be available for you to access.

<Image src="/assets/img/authorization/file_actions.png" width="472" height="93" alt="" />

<Option name="`upload_{FIELD_ID}?`">

Controls whether the user can upload the attachment.
</Option>

<Option name="`download_{FIELD_ID}?`">

Controls whether the user can download the attachment.
</Option>

<Option name="`delete_{FIELD_ID}?`">

Controls whether the user can destroy the attachment.
</Option>

:::info AUTHORIZE IN BULK
If you want to allow or disallow these methods in bulk you can use a little meta-programming to assign all the same value.

```ruby
[:cover_photo, :audio].each do |file|
  [:upload, :download, :delete].each do |action|
    define_method "#{action}_#{file}?" do
      true
    end
  end
end
```
:::

## Scopes

You may specify a scope for the <Index />, <Show />, and <Edit /> views.

```ruby{3-9}
class PostPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if user.admin?
        scope.all
      else
        scope.where(published: true)
      end
    end
  end
end
```

:::warning
This scope will be applied only to the <Index /> view of Avo. It will not be applied to the association view.

Example:

A `Post` has_many `Comment`s. The `CommentPolicy::Scope` will not affect the `has_many` field. You need to add the [`scope` option](./associations/has_many.html#add-scopes-to-associations) to the `has_many` field where you can modify the query.

```ruby
# The `parent` is the Post instance that the user is seeing. ex: Post.find(1)
# The `query` is the Active Record query being done on the comments. ex: post.comments
field :comments, as: :has_many, scope: -> { Pundit.policy_scope(parent, query) }
```
:::

## Using different policy methods

By default Avo will use the generated Pundit methods (`index?`, `show?`, `create?`, `new?`, `update?`, `edit?` and `destroy?`). But maybe, in your app, you're already using these methods and would like to use different ones for Avo. You may want override these methods inside your configuration with a simple map using the `authorization_methods` key.


```ruby{6-14}
Avo.configure do |config|
  config.root_path = '/avo'
  config.app_name = 'Avocadelicious'
  config.license_key = ENV['AVO_LICENSE_KEY']
  config.authorization_methods = {
    index: 'avo_index?',
    show: 'avo_show?',
    edit: 'avo_edit?',
    new: 'avo_new?',
    update: 'avo_update?',
    create: 'avo_create?',
    destroy: 'avo_destroy?',
    search: 'avo_search?',
  }
end
```

Now, Avo will use `avo_index?` instead of `index?` to manage the **Index** view authorization.

## Raise errors when policies are missing

The default behavior of Avo is to allow missing policies for resources silently. So, if you have a `User` model and a `Avo::Resources::User` but don't have a `UserPolicy`, Avo will not raise errors regarding missing policies and authorize that resource.

If, however, you need to be on the safe side of things and raise errors when a Resource is missing a Policy, you can toggle on the `raise_error_on_missing_policy` configuration.

```ruby{7}
# config/initializers/avo.rb
Avo.configure do |config|
  config.root_path = '/avo'
  config.app_name = 'Avocadelicious'
  config.license_key = ENV['AVO_LICENSE_KEY']
  config.raise_error_on_missing_policy = true
end
```

Now, you'll have to provide a policy for each resource you have in your app, thus making it a more secure app.

## Logs
<VersionReq version="3.11.7" />
[Developers](authentication.html#_2-developer-user) have the ability to monitor any unauthorized actions. When a [developer user](authentication.html#_2-developer-user) makes a request that triggers an unauthorized action, a log entry similar to the following will be generated:

In development each log entry provides details about the policy class, the action attempted, the user who made the request, and the record involved:
```bash
web     | [Avo->] Unauthorized action 'act_on?' for 'UserPolicy'
web     | user: #<User id: 20, first_name: "Avo", last_name: "Cado", roles: {"admin"=>true, "manager"=>false, "writer"=>false}, team_id: nil, slug: "avo-cado", active: true, email: "avo@avohq.io", created_at: "2023-05-20 18:32:32.857042000 +0000", updated_at: "2024-01-03 14:20:00.352895000 +0000">
web     | record: User(id: integer, first_name: string, last_name: string, roles: json, team_id: integer, slug: string, active: boolean, email: string, encrypted_password: string, reset_password_token: string, reset_password_sent_at: datetime, remember_created_at: datetime, created_at: datetime, updated_at: datetime)
```

In production each log entry provides details about the policy class and the attempted action:
```bash
web     | [Avo->] Unauthorized action 'act_on?' for 'UserPolicy'
```

## Custom policies

<VersionReq version="2.17" />

By default, Avo will infer the policy from the model of the resource object. If you wish to use a different policy for a given resource, you can specify it directly in the resource using the `authorization_policy` option.

```ruby
# app/avo/resources/photo_comment.rb
class Avo::Resources::PhotoComment < Avo::BaseResource
  self.model_class = "Comment"
  self.authorization_policy = PhotoCommentPolicy
  # ...
end
```

## Custom authorization clients

:::info
Check out the [Pundit client](https://github.com/avo-hq/avo/blob/main/lib/avo/services/authorization_clients/pundit_client.rb) for reference.
:::

### Change the authorization client

In order to use a different client change the `authorization_client` option in the initializer.

The built-in possible values are `nil` and `:pundit`.

When you create your own client, pass the class name.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authorization_client = 'Services::AuthorizationClients::CustomClient'
end
```

### Client methods

Each authorization client must expose a few methods.

<Option name="`authorize`">

Receives the `user`, `record`, `action`, and optionally, the `policy_class` (you may want to use custom policy classes for some resources).

```ruby
# Pundit example
def authorize(user, record, action, policy_class: nil)
  Pundit.authorize(user, record, action, policy_class: policy_class)
rescue Pundit::NotDefinedError => error
  raise NoPolicyError.new error.message
rescue Pundit::NotAuthorizedError => error
  raise NotAuthorizedError.new error.message
end
```

</Option>
<Option name="`policy`">

Receives the `user` and `record` and returns the policy to use.

```ruby
def policy(user, record)
  Pundit.policy(user, record)
end
```

</Option>
<Option name="`policy!`">

Receives the `user` and `record` and returns the policy to use. It will raise an error if no policy is found.

```ruby
def policy!(user, record)
  Pundit.policy!(user, record)
rescue Pundit::NotDefinedError => error
  raise NoPolicyError.new error.message
end
```

</Option>
<Option name="`apply_policy`">

Receives the `user`, `record`, and optionally, the policy class to use. It will apply a scope to a query.

```ruby
def apply_policy(user, model, policy_class: nil)
  # Try and figure out the scope from a given policy or auto-detected one
  scope_from_policy_class = scope_for_policy_class(policy_class)

  # If we discover one use it.
  # Else fallback to pundit.
  if scope_from_policy_class.present?
    scope_from_policy_class.new(user, model).resolve
  else
    Pundit.policy_scope!(user, model)
  end
rescue Pundit::NotDefinedError => error
  raise NoPolicyError.new error.message
end
```
</Option>

## Explicit authorization

<Option name="`explicit_authorization`">

:::warning Option Renamed
In versions between <Version version="3.13.4" /> and <Version version="3.13.6" />, this option is named `implicit_authorization`.
:::

<VersionReq version="3.13.4" />

 This option gives you control over how missing policy classes or methods are handled during authorization checks in your Avo application.

### Possible values

**`true`**
  - If a policy class or method is **missing** for a given resource or action, that action will automatically be considered **unauthorized**.
  - This behavior enhances security by ensuring that any unconfigured or unhandled actions are denied by default.

**`false`**
  - If a policy class or method is **missing**, the action will be considered **authorized** by default.

**`Proc`**
  - You can also set `explicit_authorization` as a `Proc` to apply custom logic. Within this block, you gain access to all attributes of [`Avo::ExecutionContext`](execution-context)

    For example:

    ```ruby
    config.explicit_authorization = -> {
      current_user.access_to_admin_panel? && !current_user.admin?
    }
    ```

    In this case, missing policies will be handled based on the condition: if the user has access to the admin panel but isn't an admin, the `explicit_authorization` will be enabled. This option allows you to customize authorization decisions based on the context of the current user or other factors.
### Default

- For **new applications** (starting from Avo `3.13.4`) the default value for `explicit_authorization` is `true`. This provides a more secure out-of-the-box experience by ensuring actions without explicit authorization are denied.

- For **existing applications** upgrading to `3.13.4` or later the default value for `explicit_authorization` remains `false` to preserve backward compatibility. Existing applications will retain the permissive behavior unless explicitly changed.

### Configuration:

You can configure this setting in your `config/avo.rb` file:

```ruby{4}
Avo.configure do |config|
  # Set to true to deny access when policies or methods are missing
  # Set to false to allow access when policies or methods are missing
  config.explicit_authorization = true
end
```

### Examples:

1. **When `explicit_authorization` is `true`**
    - **Scenario**: You have a `Post` resource, but there is no policy class defined for it.
    - **Result**: All actions for the `Post` resource (index, show, create, etc.) will be **unauthorized** unless you explicitly define a policy class and methods for those actions.

    ---
    - **Scenario**: You have a `Post` resource, and the policy class defined for it only defines the `show?` method.

    ```ruby
    class PostPolicy < ApplicationPolicy
      def show?
        user.admin?
      end
    end
    ```
    - **Result**: In this case, since the `PostPolicy` lacks an `index?` method, attempting to access the `index` action will be denied by default.

2. **When `explicit_authorization: false`**
    - **Scenario**: Same `Post` resource without a policy class.
    - **Result**: All actions for the `Post` resource will be **authorized** even though there are no explicit policy methods. This could expose unintended behavior, as any unprotected action will be accessible.

    ---

    - **Scenario**: You have a `Post` resource, and the policy class defined for it only defines the `show?` method.
    ```ruby
    class PostPolicy < ApplicationPolicy
      def show?
        user.admin?
      end
    end
    ```
    - **Result**: In this case, missing methods like `index?` will allow access to the `index` action by default.


### Migration Recommendations:

- **For applications after from Avo `3.13.4`**

    It is recommended to leave `explicit_authorization` set to `true`, ensuring all actions must be explicitly authorized to prevent unintentional access.

- **For applications before from Avo `3.13.4`**

    - If upgrading from an earlier version, carefully review your policies before enabling `explicit_authorization`. Missing policy methods that were previously allowing access will now deny access unless explicitly defined.

    - It’s recommended to disable [`raise_error_on_missing_policy`](authorization.html#raise-errors-when-policies-are-missing) in production, though it's not mandatory. When `explicit_authorization` is set to `true`, the default behavior is to deny access for actions without a defined policy. In this case, it’s often better to show an unauthorized message to users rather than raise an error. However, keeping [`raise_error_on_missing_policy`](authorization.html#raise-errors-when-policies-are-missing) enabled in development can be helpful for identifying missing policy classes.
</Option>

## Rolify integration

Check out [this guide](guides/rolify-integration.md) to add rolify role management with Avo.
