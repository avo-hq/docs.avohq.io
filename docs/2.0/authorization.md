---
license: pro
---

# Authorization

When you share access to Avo with your clients or large teams, you may want to restrict access to a resource or a subset of resources. One example may be that only admin-level users may delete or update records.

By default, Avo leverages Pundit under the hood to manage the authorization.

:::info Pundit alternative
Pundit is just the default choice. You may plug in your own client using the instructions [here](#custom-authorization-clients).
:::

## Make sure Avo knows who your current user is

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

With this new policy, you may control what every type o user can do with Avo. The policy has the default methods for the regular controller actions: `index?`, `show?`, `create?`, `new?`, `update?`, `edit?` and `destroy?`.

These methods control whether the resource appears on the sidebar, if the view/edit/destroy buttons are visible or if a user has access to those index/show/edit/create pages.

### index?

`index?` is used to display/hide the resources on the sidebar and restrict access to the resources **Index** view.

:::info
  This option is used in the **auto-generated menu**, not in the **menu editor**.

  You'll have to use your own logic in the [`visible`](./menu-editor#item-visibility) block for that.
:::

### show?

When setting `show?` to `false`, the user will not see the show icon on the resource row and will not have access to the **Show** view of a resource.

### create?

The `create?` method will prevent the users from creating a resource. That will also apply to the `Create new {model}` button on the `Index`, the `Save` button on the `/new` page, and `Create new {model}` button on the association `Show` page.

### new?

The `new?` method will control whether the users can save the new resource. You can also access the `record` variable with the form values pre-filled.

### edit?

`edit?` to `false` will hide the edit button on the resource row and prevent the user from seeing the edit view.

### update?

`update?` to `false` will prevent the user from updating a resource. You can also access the `record` variable with the form values pre-filled.

### destroy?

`destroy?` to `false` will prevent the user from destroying a resource and hiding the delete button.

### upload_attachments?

Controls whether the attachment upload input should be visible in the `File` and `Files` fields.

### download_attachments?

Controls whether the attachment download button should be visible in the `File` and `Files` fields.

### delete_attachments?

Controls whether the attachment delete button should be visible in the `File` and `Files` fields.

### act_on?

Controls whether the user can see the actions button on the `Index` page.

<img :src="('/assets/img/authorization/actions_button.jpg')" alt="Actions button" class="border mb-4" />

## Associations

When using relationships, you would like to set policies for `creating` new records on the association, allowing to `attach`, `detach`, `create` or `destroy` relevant records. Again, Avo makes this easy using a straightforward naming schema.

### attach_{association}?

When you have a `Post` resource with many `Comment`s through the `has_many :comments` association and want to authorize which users can attach `comments` to a post, you should define an `attach_comment?` policy on your post model's policy class. Use the association name as the suffix of the policy method.

<img :src="('/assets/img/authorization/attach.jpg')" class="border mb-4" />

### detach_{association}?

`detach` method works similarly to `attach`, but for detaching.

<img :src="('/assets/img/authorization/detach.jpg')" class="border mb-4" />

### view_{association}?

Controls whether the view button is visible on the associated record row on the `Index` page. This **does not** control whether the user has access to that record. You can control that using the Policy of that record.

<img :src="('/assets/img/authorization/view.jpg')" class="border mb-4" />

### edit_{association}?

`edit` method works similarly to `attach`, but for editing.

<img :src="('/assets/img/authorization/edit.jpg')" class="border mb-4" />

### create_{association}?

`create` method works similarly to `attach`, but for creating.

<img :src="('/assets/img/authorization/create.jpg')" class="border mb-4" />

### destroy_{association}?

`destroy` method works similarly to `attach`, but for destroying.

<img :src="('/assets/img/authorization/destroy.jpg')" class="border mb-4" />

### act_on_{association}?

`act_on_` method works similarly to `attach`, but for showing actions.

<img :src="('/assets/img/authorization/actions.jpg')" class="border mb-4" />

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

### Client methods

Each authorization client must expose a few methods.

### `authorize`

Receives the `user`, `record`, `action`, and optionally, the `policy_class` and authorizez that action

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

### `policy`

Receives the `user` and `record` and returns the policy to use.

```ruby
def policy(user, record)
  Pundit.policy(user, record)
end
```

### `policy!`

Receives the `user` and `record` and returns the policy to use. It will raise an error if no policy is found.

```ruby
def policy!(user, record)
  Pundit.policy!(user, record)
rescue Pundit::NotDefinedError => error
  raise NoPolicyError.new error.message
end
```

### `apply_policy`

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
