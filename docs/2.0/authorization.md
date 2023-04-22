---
license: pro
---

# Authorization

When you share access to Avo with your clients or large teams, you may want to restrict access to a resource or a subset of resources. One example may be that only admin-level users may delete or update records.

By default, Avo leverages Pundit under the hood to manage the authorization.

:::info Pundit alternative
Pundit is just the default choice. You may plug in your own client using the instructions [here](#custom-authorization-clients).
:::

:::warning
You must manually require `pundit` or your authorization library in your `Gemfile`.

```ruby
# Minimal authorization through OO design and pure Ruby classes
gem "pundit"
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

:::option `show?`

When setting `show?` to `false`, the user will not see the show icon on the resource row and will not have access to the **Show** view of a resource.

:::

:::option `create?`

The `create?` method will prevent the users from creating a resource. That will also apply to the `Create new {model}` button on the <Index />, the `Save` button on the `/new` page, and `Create new {model}` button on the association `Show` page.

:::

:::option `new?`

The `new?` method will control whether the users can save the new resource. You can also access the `record` variable with the form values pre-filled.

:::

:::option `edit?`

`edit?` to `false` will hide the edit button on the resource row and prevent the user from seeing the edit view.

:::

:::option `update?`

`update?` to `false` will prevent the user from updating a resource. You can also access the `record` variable with the form values pre-filled.

:::

::::option `destroy?`

`destroy?` to `false` will prevent the user from destroying a resource and hiding the delete button.

:::info More granular file authorization
These are per-resource and general settings. If you want to control the authorization per individual file, please see the [granular settings](#attachments).
:::

::::

:::option `act_on?`

Controls whether the user can see the actions button on the <Index /> page.

:::

:::option `reorder?`

Controls whether the user can see the [records reordering](./records-reordering) buttons on the <Index /> page.

<img :src="('/assets/img/authorization/actions_button.jpg')" alt="Actions button" class="border mb-4" />

:::
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

:::option `attach_{association}?`

Controls whether the `Attach comment` button is visible. The `record` variable is the parent record (a `Post` instance in our scenario).

<img :src="('/assets/img/authorization/attach.jpg')" class="border mb-4" />

:::
:::option `detach_{association}?`

Controls whether the **detach button is available** on the associated record row on the <Index /> view. The `record` variable is the actual row record (a `Comment` instance in our scenario).

<img :src="('/assets/img/authorization/detach.jpg')" class="border mb-4" />

:::
:::option `view_{association}?`

Controls whether the whole association is being displayed on the parent record. The `record` variable is the actual row record (a `Comment` instance in our scenario).

:::
::::option `show_{association}?`

Controls whether the **view button is visible** on the associated record row on the <Index /> page. The `record` variable is the actual row record (a `Comment` instance in our scenario).

:::warning
This **does not** control whether the user has access to that record. You control that using the Policy of that record (`PostPolicy.show?` in our example).
:::

<img :src="('/assets/img/authorization/show.jpg')" class="border mb-4" />

:::info Difference between `view_{association}?` and `show_{association}?`
Let's take a `Post` `has_many` `Comment`s.

When you use the `view_comments?` policy method you get the `Post` instance as the `record` and you control if the whole listing of comments appears on that record's <Show /> page.

When you use `show_comments?` policy method, the `record` variable is each `Comment` instance and you control whether the view button is displayed on each individual row.
:::

::::
::::option `edit_{association}?`

Controls whether the **edit button is visible** on the associated record row on the <Index /> page.The `record` variable is the actual row record (a `Comment` instance in our scenario).

:::warning
This **does not** control whether the user has access to that record's edit page. You control that using the Policy of that record (`PostPolicy.show?` in our example).
:::

<img :src="('/assets/img/authorization/edit.jpg')" class="border mb-4" />

::::
:::option `create_{association}?`

Controls whether the `Create comment` button is visible. The `record` variable is the parent record (a `Post` instance in our scenario).

<img :src="('/assets/img/authorization/create.jpg')" class="border mb-4" />

:::
:::option `destroy_{association}?`

Controls whether the **delete button is visible** on the associated record row on the <Index /> page.The `record` variable is the actual row record (a `Comment` instance in our scenario).

<img :src="('/assets/img/authorization/destroy.jpg')" class="border mb-4" />

:::
:::option `act_on_{association}?`

Controls whether the `Actions` dropdown is visible. The `record` variable is the parent record (a `Post` instance in our scenario).

<img :src="('/assets/img/authorization/actions.jpg')" class="border mb-4" />

:::
:::option `reorder_{association}?`

Controls whether the user can see the [records reordering](./records-reordering) buttons on the `has_many` <Index /> page.
:::

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
We also have a concern that remove the duplication for you `Avo::Concerns::PolicyHelpers`.To use this concern, you should include it in one of your policies. Alternatively, you can include it in the `ApplicationPolicy` if you want to access it in all of your policies.

`PolicyHelpers` allow you to use the method `inherit_association_from_policy`. This method takes two arguments:`association_name` and `AssociationPolicy`.
Here's an example of how to use it:  `inherit_association_from_policy :comments, CommentPolicy`

With just one line of code, this will define several methods to policy your association:

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
```

Although these methods won't be visible in your policy code, you can still override them by declaring them. For instance, if you include the following code in your `CommentPolicy`, it will be executed in place of the one defined by the helper:

```ruby
def destroy_comments?
  false
end
```

## Attachments

<VersionReq version="2.28" />

When working with files, it may be necessary to establish policies that determine whether users can `upload`, `download` or `delete` files. Fortunately, Avo simplifies this process by providing a straightforward naming schema for these policies.

Both the `record` and the `user` will be available for you to access.

<img :src="('/assets/img/authorization/file_actions.png')" class="border mb-4 rounded" />

:::option `upload_{FIELD_ID}?`
Controls whether the user can upload the attachment.
:::

:::option `download_{FIELD_ID}?`
Controls whether the user can download the attachment.
:::

:::option `delete_{FIELD_ID}?`
Controls whether the user can destroy the attachment.
:::

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

::::option `upload_attachments?`

:::warning DEPRECATED since 2.30.1
This option was removed in **Avo 2.30.1** in favor of `upload_{FIELD_ID}?` method where `FIELD_ID` is the ID of the attachment field (ex: for `has_one_attached :photo` you need to declare the `upload_photo?` method).
:::

Controls whether the attachment upload input should be visible in the `File` and `Files` fields.
::::

::::option `download_attachments?`

:::warning DEPRECATED since 2.30.1
This option was removed in **Avo 2.30.1** in favor of `download_{FIELD_ID}?` method where `FIELD_ID` is the ID of the attachment field (ex: for `has_one_attached :photo` you need to declare the `download_photo?` method).
:::

Controls whether the attachment download button should be visible in the `File` and `Files` fields.
::::

::::option `delete_attachments?`

:::warning DEPRECATED since 2.30.1
This option was removed in Avo 2.30.1 in favor of `delete_{FIELD_ID}?` method where `FIELD_ID` is the ID of the attachment field (ex: for `has_one_attached :photo` you need to declare the `delete_photo?` method).
:::

Controls whether the attachment delete button should be visible in the `File` and `Files` fields.
::::

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

```
:::

## Using different policy methods

By default Avo will use the generated Pundit methods (`index?`, `show?`, `create?`, `new?`, `update?`, `edit?` and `destroy?`). But maybe, in your app, you're already using these methods and would like to use different ones for Avo. You may want override these methods inside your configuration with a simple map using the `authorization_methods` key.


```ruby{6-14}
Avo.configure do |config|
  config.root_path = '/avo'
  config.app_name = 'Avocadelicious'
  config.license = 'pro'
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

The default behavior of Avo is to allow missing policies for resources silently. So, if you have a `User` model and a `UserResource` but don't have a `UserPolicy`, Avo will not raise errors regarding missing policies and authorize that resource.

If, however, you need to be on the safe side of things and raise errors when a Resource is missing a Policy, you can toggle on the `raise_error_on_missing_policy` configuration.

```ruby{7}
# config/initializers/avo.rb
Avo.configure do |config|
  config.root_path = '/avo'
  config.app_name = 'Avocadelicious'
  config.license = 'pro'
  config.license_key = ENV['AVO_LICENSE_KEY']
  config.raise_error_on_missing_policy = true
end
```

Now, you'll have to provide a policy for each resource you have in your app, thus making it a more secure app.

## Custom policies

<VersionReq version="2.17" />

By default, Avo will infer the policy from the model of the resource object. If you wish to use a different policy for a given resource, you can specify it directly in the resource using the `authorization_policy` option.

```ruby
class PhotoCommentResource < Avo::BaseResource
  self.model_class = ::Comment
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

:::option `authorize`

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

:::
:::option `policy`

Receives the `user` and `record` and returns the policy to use.

```ruby
def policy(user, record)
  Pundit.policy(user, record)
end
```

:::
:::option `policy!`

Receives the `user` and `record` and returns the policy to use. It will raise an error if no policy is found.

```ruby
def policy!(user, record)
  Pundit.policy!(user, record)
rescue Pundit::NotDefinedError => error
  raise NoPolicyError.new error.message
end
```

:::
:::option `apply_policy`

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
:::

## Rolify integration

Check out [this guide](recipes/rolify-integration.md) to add rolify role management with Avo.
