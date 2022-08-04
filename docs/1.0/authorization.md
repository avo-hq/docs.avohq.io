# Authorization

[[toc]]

<div class="rounded-md bg-blue-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-blue-700">
        This is a <a href="https://avohq.io/purchase/pro" target="_blank" class="underline">pro</a> feature
      </div>
    </div>
  </div>
</div>


When you share access to Avo with your clients or large teams, you may want to restrict access to a resource or a subset of resources. One example may be that only admin level users may delete records. Avo leverages Pundit under the hood to manage the role-based authentication.

## Make sure Avo knows who your current user is

Before setting any policies up, please make sure Avo knows your current user. Usually, you need this 👇 &nbsp;  set up should be fine, but follow [this](authentication.html#customize-the-current-user-method) page for more scenarios.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_method = :current_user
end
```

## Policies

To generate a new policy, just run the regular pundit `bin/rails g pundit:policy Post`.

**If this is a new app you need to install pundit first <code>bin/rails g pundit:install</code>.**

With this new policy, you may control what every type o user can do with Avo. The policy has the default methods for the regular controller actions: `index?`, `show?`, `create?`, `new?`, `update?`, `edit?` and `destroy?`.

These methods control whether the resource appears on the sidebar, if the view/edit/destroy buttons are visible or if a user has access to those index/show/edit/create pages.

### index?

`index?` is used to display the resources on the sidebar, display the related HasMany resources view and restrict access to the resources **Index** view.

### show?

When setting `show?` to `false`, the user will not see the show icon on the resource row and will not have access to the **Show** view of a resource.

### create?

The `create?` method will prevent the users from creating a resource. This will also apply to the `Create new {model}` button on the `Index`, the `Save` button on the `/new` page, and `Create new {model}` button on the association `Show` page.

### new?

The `new?` method will control whether the users can save the new resource. You will also have access to the `record` variable with the form values pre-filled.

### edit?

`edit?` to `false` will hide the edit button on the resource row and prevent the user from seeing the edit view.

### update?

`update?` to `false` will prevent the user from updating a resource. You will also have access to the `record` variable with the form values pre-filled.

### destroy?

`destroy?` to `false` will prevent the user from destroying a resource and hiding the delete button.

### upload_attachments?

Controls whether the attachment upload input should be visible in the `File` and `Files` fields.

### download_attachments?

Controls whether the attachment download button should be visible in the `File` and `Files` fields.

### delete_attachments?

Controls whether the attachment delete button should be visible in the `File` and `Files` fields.

### act_on?

This controls whether the user can see the actions button on the `Index` page.

<img :src="$withBase('/assets/img/authorization/actions_button.jpg')" alt="Actions button" class="border mb-4" />

## Associations

When using relationships, you would like to set policies for `creating` new records on the association, allowing to `attach`, `detach`, `create` or `destroy` relevant records. Avo makes this easy using a straight-forward naming schema.

### attach_{association}?

When you have a `Post` resource that has many `Comment`s throught the `has_many :comments` association and you want to authorize which users can attach `comments` to a post, you should define an `attach_comment?` policy on your post model's policy class. You should use the association name as the suffix of the policy method.

<img :src="$withBase('/assets/img/authorization/attach.jpg')" class="border mb-4" />

### detach_{association}?

`detach` method works similarly to `attach` one, but for detaching.

<img :src="$withBase('/assets/img/authorization/detach.jpg')" class="border mb-4" />

### view_{association}?

This controls whether the view button is visible on the associated record row on the `Index` page. This **does not** control whether the user has access to that record. You control that using the Policy of that record.

<img :src="$withBase('/assets/img/authorization/view.jpg')" class="border mb-4" />

### edit_{association}?

`create` method works similarly to `attach` one, but for detaching.

<img :src="$withBase('/assets/img/authorization/edit.jpg')" class="border mb-4" />

### create_{association}?

`create` method works similarly to `attach` one, but for detaching.

<img :src="$withBase('/assets/img/authorization/create.jpg')" class="border mb-4" />

### destroy_{association}?

`create` method works similarly to `attach` one, but for detaching.

<img :src="$withBase('/assets/img/authorization/destroy.jpg')" class="border mb-4" />

### act_on_{association}?

`create` method works similarly to `attach` one, but for detaching.

<img :src="$withBase('/assets/img/authorization/actions.jpg')" class="border mb-4" />

## Scopes

In the generated policy, you may also specify a scope for the **Index** view.

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

By default Avo will use the usual generated Pundit methods (`index?`, `show?`, `create?`, `new?`, `update?`, `edit?` and `destroy?`). But maybe, in your app, you're already using these methods and would like to use different ones for Avo. You may override these methods inside your configuration with a simple map using the `authorization_methods` key.


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

The default behavior of Avo is to silently allow missing policies for resources. So, if you have a `User` model and a `UserResource` but don't have a `UserPolicy`, Avo will not raise errors regarding missing policies and authorize that resource.

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

Now, you'll have to provide a policy to each resource you have in your app, thus making it a more secure app.
