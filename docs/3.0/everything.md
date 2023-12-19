---
license: community
feedbackId: 837
---

# Actions

Avo actions allow you to perform specific tasks on one or more of your records.

For example, you might want to mark a user as active/inactive and optionally send a message that may be customized by the person that wants to run the action.

Once you attach an action to a resource using the `action` method inside the `actions` method, it will appear in the **Actions** dropdown. By default, actions appear on the `Index`, `Show`, and `Edit` views. Versions previous to 2.9 would only display the actions on the `Index` and `Show` views.

![Actions dropdown](/assets/img/actions/actions-dropdown.gif)

:::info
Since version <Version version="2.13" /> you may use the [customizable controls](./customizable-controls) feature to show the actions outside the dropdown.
:::

## Overview

You generate one running `bin/rails generate avo:action toggle_active`, creating an action configuration file.

```ruby
class Avo::Actions::ToggleActive < Avo::BaseAction
  self.name = 'Toggle inactive'

  def fields
    field :notify_user, as: :boolean, default: true
    field :message, as: :text, default: 'Your account has been marked as inactive.'
  end

  def handle(**args)
    query, fields, current_user, resource = args.values_at(:query, :fields, :current_user, :resource)

    query.each do |record|
      if record.active
        record.update active: false
      else
        record.update active: true
      end

      # Optionally, you may send a notification with the message to that user from inside the action
      UserMailer.with(user: record).toggle_active(fields["message"]).deliver_later
    end

    succeed 'Perfect!'
  end
end
```

You may add fields to the action just as you do it in a resource. Adding fields is optional. You may have actions that don't have any fields attached.

```ruby
def fields
  field :notify_user, as: :boolean
  field :message, as: :textarea, default: 'Your account has been marked as inactive.'
end
```

:::warning Files authorization
If you're using the `file` field on an action and attach it to a resource that's using the authorization feature, please ensure you have the `upload_{FIELD_ID}?` policy method returning `true`. Otherwise, the `file` input might be hidden.

More about this on the [authorization page](./authorization#attachments).
:::


![Actions](/assets/img/actions/action-fields.jpg)

The `handle` method is where the magic happens. That is where you put your action logic. In this method, you will have access to the `query` (same value as `records` (if there's only one, it will be automatically wrapped in an array)) and the values passed to the `fields`.

```ruby
def handle(**args)
  query, fields = args.values_at(:query, :fields)

  query.each do |record|
    if record.active
      record.update active: false
    else
      record.update active: true
    end

    # Optionally, you may send a notification with the message to that user.
    UserMailer.with(user: record).toggle_active(fields["message"]).deliver_later
  end

  succeed 'Perfect!'
end
```

## Registering actions

To add an action to one of your resources, you need to declare it inside the `actions` method on the resource using the `action` method.

```ruby{9}
class Avo::Resources::User < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id
  end

  def actions
    action Avo::Actions::ToggleActive
  end
end
```

## Action responses

After an action runs, you may use several methods to respond to the user. For example, you may respond with just a message or with a message and an action.

The default response is to reload the page and show the _Action ran successfully_ message.

### Message responses

You will have four message response methods at your disposal `succeed`, `error`, `warn`, and `inform`. These will render the user green, red, orange, and blue alerts.

```ruby{4-7}
def handle(**args)
  # Demo handle action

  succeed "Success response ✌️"
  warn "Warning response ✌️"
  inform "Info response ✌️"
  error "Error response ✌️"
end
```

<img :src="('/assets/img/actions/alert-responses.png')" alt="Avo alert responses" class="border inline-block" />

### Run actions silently

You may want to run an action and show no notification when it's done. That is useful for redirect scenarios. You can use the `silent` response for that.

```ruby
def handle(**args)
  # Demo handle action

  redirect_to "/admin/some-tool"
  silent
end
```

## Response types

After you notify the user about what happened through a message, you may want to execute an action like `reload` (default action) or `redirect_to`. You may use message and action responses together.

```ruby{14}
def handle(**args)
  records = args[:records]

  records.each do |record|
    if record.admin?
      error "Can't mark inactive! The user is an admin."
    else
      record.update active: false

      succeed "Done! User marked as inactive!"
    end
  end

  reload
end
```

The available action responses are:

:::option `reload`

When you use `reload`, a full-page reload will be triggered.

```ruby{9}
def handle(**args)
  records = args[:records]

  records.each do |project|
    project.update active: false
  end

  succeed 'Done!'
  reload
end
```

:::
:::option `redirect_to`

`redirect_to` will execute a redirect to a new path of your app. It accept `allow_other_host`, `status` and any other arguments.

Example:
`redirect_to path, allow_other_host: true, status: 303`

```ruby{9}
def handle(**args)
  records = args[:records]

  records.each do |project|
    project.update active: false
  end

  succeed 'Done!'
  redirect_to avo.resources_users_path
end
```

You may want to redirect to another action. Here's an example of how to create a multi-step process, passing arguments from one action to another.
In this example the initial action prompts the user to select the fields they wish to update, and in the subsequent action, the chosen fields will be accessible for updating.

:::code-group
```ruby[PreUpdate]
class Avo::Actions::City::PreUpdate < Avo::BaseAction
  self.name = "Update"

  def fields
    field :name, as: :boolean
    field :population, as: :boolean
  end

  def handle(**args)
   arguments = Base64.encode64 Avo::Services::EncryptionService.encrypt(
      message: {
        cities: args[:query].map(&:id),
        render_name: args[:fields][:name],
        render_population: args[:fields][:population]
      },
      purpose: :action_arguments
    )

    redirect_to "/admin/resources/city/actions?action_id=Avo::Actions::City::Update&arguments=#{arguments}", turbo_frame: "actions_show"
  end
end
```

```ruby[Update]
class Avo::Actions::City::Update < Avo::BaseAction
  self.name = "Update"
  self.visible = -> { false }

  def fields
    field :name, as: :text if arguments[:render_name]
    field :population, as: :number if arguments[:render_population]
  end

  def handle(**args)
    City.find(arguments[:cities]).each do |city|
      city.update! args[:fields]
    end

    succeed "City updated!"
  end
end
```

:::info `turbo_frame`
Notice the `turbo_frame: "actions_show"` present on the redirect of `Avo::Actions::City::PreUpdate` action. That argument is essential to have a flawless redirect between the actions.
:::


:::option `turbo`
There are times when you don't want to perform the actions with Turbo. In such cases, turbo should be set to false.
:::
:::option `download`

`download` will start a file download to your specified `path` and `filename`.

**You need to set may_download_file to true for the download response to work like below**. That's required because we can't respond with a file download (send_data) when making a Turbo request.

If you find another way, please let us know 😅.

::: code-group

```ruby{3,18} [app/avo/actions/download_file.rb]
class Avo::Actions::DownloadFile < Avo::BaseAction
  self.name = "Download file"
  self.may_download_file = true

  def handle(**args)
    records = args[:records]

    filename = "projects.csv"
    report_data = []

    records.each do |project|
      report_data << project.generate_report_data
    end

    succeed 'Done!'

    if report_data.present? and filename.present?
      download report_data, filename
    end
  end
end
```

```ruby{7} [app/avo/resources/project.rb]
class Avo::Resources::Project < Avo::BaseResource
  def fields
    # fields here
  end

  def actions
    action Avo::Actions::DownloadFile
  end
end
```
:::

:::option `keep_modal_open`

There might be situations where you want to run an action and if it fails, respond back to the user with some feedback but still keep it open with the inputs filled in.

`keep_modal_open` will tell Avo to keep the modal open.

```ruby
class Avo::Actions::KeepModalOpenAction < Avo::BaseAction
  self.name = "Keep Modal Open"
  self.standalone = true

  def fields
    field :name, as: :text
    field :birthday, as: :date
  end

  def handle(**args)
    begin
    user = User.create args[:fields]
    rescue => error
      error "Something happened: #{error.message}"
      keep_modal_open
      return
    end

    succeed "All good ✌️"
  end
end
```

## Customization

```ruby{2-6}
class Avo::Actions::TogglePublished < Avo::BaseAction
  self.name = 'Mark inactive'
  self.message = 'Are you sure you want to mark this user as inactive?'
  self.confirm_button_label = 'Mark inactive'
  self.cancel_button_label = 'Not yet'
  self.no_confirmation = true
end
```
:::

### Customize the message

You may update the `self.message` class attribute to customize the message if there are no fields present.

#### Callable message

<VersionReq version="2.21" />

Since version `2.21` you can pass a block to `self.message` where you have access to a bunch of variables.

```ruby
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.message = -> {
    # you have access to:
    # - params
    # - current_user
    # - context
    # - view_context
    # - request
    # - resource
    # - record
    "Are you sure you want to release the #{record.name}?"
  }
end
```

<!-- <img :src="('/assets/img/actions/actions-message.jpg')" alt="Avo message" class="border mb-4" /> -->

### Customize the buttons

You may customize the labels for the action buttons using `confirm_button_label` and `cancel_button_label`.

<img :src="('/assets/img/actions/actions-button-labels.jpg')" alt="Avo button labels" class="border mb-4" />

### No confirmation actions

You will be prompted by a confirmation modal when you run an action. If you don't want to show the confirmation modal, pass in the `self.no_confirmation = true` class attribute. That will execute the action without showing the modal at all.

## Standalone actions

You may need to run actions that are not necessarily tied to a model. Standalone actions help you do just that. Add `self.standalone` to an existing action or generate a new one using the `--standalone` option (`bin/rails generate avo:action global_action --standalone`).

```ruby{3}
class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"
  self.standalone = true

  def handle(**args)
    fields, current_user, resource = args.values_at(:fields, :current_user, :resource)

    # Do something here

    succeed 'Yup'
  end
end
```

## Actions visibility

You may want to hide specific actions on screens, like a standalone action on the `Show` screen. You can do that using the `self.visible` attribute.

```ruby{4}
class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"
  self.standalone = true
  self.visible = -> { view == :index }

  def handle(**args)
    fields, current_user, resource = args.values_at(:fields, :current_user, :resource)

    # Do something here

    succeed 'Yup'
  end
end
```

By default, actions are visible on the `Index`, `Show`, and `Edit` views, but you can enable them on the `New` screen, too (from version 2.9.0).

```ruby
self.visible = -> { view == :new }

# Or use this if you want them to be visible on any view
self.visible = -> { true }
```

Inside the visible block you can access the following variables:
```ruby
  self.visible = -> do
    #   You have access to:
    #   block
    #   context
    #   current_user
    #   params
    #   parent_resource (can access the parent_record by parent_resource.record)
    #   resource (can access the record by resource.record)
    #   view
    #   view_context
  end
```

## Actions authorization

:::warning
Using the Pundit policies, you can restrict access to actions using the `act_on?` method. If you think you should see an action on a resource and you don't, please check the policy method.

More info [here](./authorization#act-on)
:::

The `self.authorize` attribute in action classes is handy when you need to manage authorization for actions. This attribute accepts either a boolean or a proc, allowing the incorporation of custom logic. Within this block, you gain access to all attributes of [`Avo::ExecutionContext`](execution-context) along with the `action` object, hydrated with attributes such as `record`, `resource`, and `view`.

If an action is unauthorized, it will be hidden. If a bad actor attempts to proceed with the action, the controller will re-evaluate the authorization and block unauthorized requests.

```ruby
self.authorize = false

# Or

self.authorize = -> {
  current_user.is_admin?
}
```

## Actions arguments

Actions can have different behaviors according to their host resource. In order to achieve that, arguments must be passed like on the example below:

```ruby{12-14}
class Avo::Resources::Fish < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id
    field :name, as: :text
    field :user, as: :belongs_to
    field :type, as: :text, hide_on: :forms
  end

  def actions
    action DummyAction, arguments: {
      special_message: true
    }

    # Or as a proc

    action DummyAction, arguments: -> do
      {
        special_message: resource.view.index? && current_user.is_admin?
      }
    end
  end
end
```

Now, the arguments can be accessed inside `Avo::Actions::DummyAction` ***`handle` method*** and on the ***`visible` block***!

```ruby{4-6,8-14}
class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"
  self.standalone = true
  self.visible = -> do
    arguments[:special_message]
  end

  def handle(**args)
    if arguments[:special_message]
      succeed "I love 🥑"
    else
      succeed "Success response ✌️"
    end
  end
end
```

## Action link

You may want to dynamically generate an action link. For that you need the action class and a resource instance (with or without record hydrated). Call the action's class method `link_arguments` with the resource instance as argument and it will return the `[path, data]` that are necessary to create a proper link to a resource.

Let's see an example use case:

```ruby{15,16,17,18,20}
field :name,
  as: :text,
  filterable: true,
  name: "name (click to edit)",
  only_on: :index do

  arguments = Base64.encode64 Avo::Services::EncryptionService.encrypt(
    message: {
      cities: Array[resource.record.id],
      render_name: true
    },
    purpose: :action_arguments
  )

  path, data = Avo::Actions::City::Update.link_arguments(
    resource: resource,
    arguments: arguments
  )

  link_to resource.record.name, path, data: data

end
```

![actions link demo](/assets/img/actions/action_link.gif)

## StimulusJS

Please follow our extended [StimulusJS guides](./stimulus-integration.html#use-stimulus-js-in-a-tool) for more information.

:::option `find_record_method`
Because of how
:::


# Asset manager

In your plugins or custom content you might want to add a new stylesheet or javascript file to be loaded inside Avo.

You can manually add them to the `_head.html.erb` or `_pre_head.html.erb` files or you can use the `AssetManager`.

Next, the asset manager will add them to the `<head>` element of Avo's layout file.

## Add a stylesheet file

Use `Avo.asset_manager.add_stylesheet PATH`

Example:

```ruby
Avo.asset_manager.add_stylesheet "/public/magic_file.css"
Avo.asset_manager.add_stylesheet Avo::Engine.root.join("app", "assets", "stylesheets", "magic_file.css")
```

## Add a javascript file

Use `Avo.asset_manager.add_javascript PATH`

Example:

```ruby
Avo.asset_manager.add_javascript "/public/magic_file.js"
Avo.asset_manager.add_javascript Avo::Engine.root.join("app", "javascripts", "magic_file.js")
```


---
version: '1.0'
license: community
---

# Belongs to

```ruby
field :user, as: :belongs_to
```

You will see three field types when you add a `BelongsTo` association to a model.


## Options

<!-- @include: ./../common/associations_searchable_option_common.md-->

:::option `allow_via_detaching`
Keeps the field enabled when visiting from the parent record.

<!-- @include: ./../common/default_boolean_false.md-->
:::

<!-- @include: ./../common/associations_attach_scope_option_common.md-->

:::option `polymorphic_as`
Sets the field as polymorphic with the key set on the model.

#### Default

`nil`

#### Possible values

A symbol, used on the `belongs_to` association with `polymorphic: true`.
:::

:::option `types`
Sets the types the field can morph to.

#### Default

`[]`

#### Possible values

`[Post, Project, Team]`. Any array of model names.
:::

:::option `polymorphic_help`
Sets the help text for the polymorphic type dropdown. Useful when you need to specify to the user why and what they need to choose as polymorphic.

#### Default

`nil`

#### Possible values

Any string.
:::

<!-- @include: ./../common/associations_use_resource_option_common.md-->

:::option `can_create`
Controls the creation link visibility on forms.

#### Default

`true`

#### Possible values

`true`, `false`
:::

## Overview

On the `Index` and `Show` views, Avo will generate a link to the associated record containing the [`@title`](./../resources.html#setting-the-title-of-the-resource) value.

<img :src="('/assets/img/associations/belongs-to-index.jpg')" alt="Belongs to index" class="border mb-4" />

<img :src="('/assets/img/associations/belongs-to-show.jpg')" alt="Belongs to show" class="border mb-4" />

On the `Edit` and `New` views, Avo will generate a dropdown element with the available records where the user can change the associated model.

<img :src="('/assets/img/associations/belongs-to-edit.jpg')" alt="Belongs to edit" class="border mb-4" />

## Polymorphic `belongs_to`

To use a polymorphic relation, you must add the `polymorphic_as` and `types` properties.

```ruby{13}
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :id

  def fields
    field :id, as: :id
    field :body, as: :textarea
    field :excerpt, as: :text, show_on: :index do
      ActionView::Base.full_sanitizer.sanitize(record.body).truncate 60
    rescue
      ""
    end

    field :commentable, as: :belongs_to, polymorphic_as: :commentable, types: [::Post, ::Project]
  end
end
```

## Polymorphic help

When displaying a polymorphic association, you will see two dropdowns. One selects the polymorphic type (`Post` or `Project`), and one for choosing the actual record. You may want to give the user explicit information about those dropdowns using the `polymorphic_help` option for the first dropdown and `help` for the second.

```ruby{17-18}
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :id

  def fields
    field :id, as: :id
    field :body, as: :textarea
    field :excerpt, as: :text, show_on: :index do
      ActionView::Base.full_sanitizer.sanitize(record.body).truncate 60
    rescue
      ""
    end

    field :reviewable,
      as: :belongs_to,
      polymorphic_as: :reviewable,
      types: [::Post, ::Project, ::Team],
      polymorphic_help: "Choose the type of record to review",
      help: "Choose the record you need."
  end
end
```

<img :src="('/assets/img/associations/polymorphic_help.jpg')" alt="Belongs to ploymorphic help" class="border mb-4" />

## Searchable `belongs_to`

<DemoVideo demo-video="https://youtu.be/KLI_sVTPX-Q" />

There might be the case that you have a lot of records for the parent resource, and a simple dropdown won't cut it. This is where you can use the `searchable` option to get a better search experience for that resource.

```ruby{8}
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :id

  def fields
    field :id, as: :id
    field :body, as: :textarea

    field :user, as: :belongs_to, searchable: true
  end
end
```

<img :src="('/assets/img/associations/searchable-closed.jpg')" alt="Belongs to searchable" class="border mb-4" />
<img :src="('/assets/img/associations/searchable-open.jpg')" alt="Belongs to searchable" class="border mb-4" />

`searchable` works with `polymorphic` `belongs_to` associations too.

```ruby{8}
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :id

  def fields
    field :id, as: :id
    field :body, as: :textarea

    field :commentable, as: :belongs_to, polymorphic_as: :commentable, types: [::Post, ::Project], searchable: true
  end
end
```

:::info
Avo uses the [search feature](./../search) behind the scenes, so **make sure the target resource has the `query` option configured inside the `search` block**.
:::


```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(id_eq: params[:q], name_cont: params[:q], body_cont: params[:q], m: "or").result(distinct: false)
    }
  }
end

# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(id_eq: params[:q], name_cont: params[:q], country_cont: params[:q], m: "or").result(distinct: false)
    }
  }
end
```

## Belongs to attach scope

<DemoVideo demo-video="https://youtu.be/Eex8CiinQZ8?t=6" />

When you edit a record that has a `belongs_to` association, on the edit screen, you will have a list of records from which you can choose a record to associate with.

For example, a `Post` belongs to a `User`. So on the post edit screen, you will have a dropdown (or a search field if it's [searchable](#searchable-belongs-to)) with all the available users. But that's not ideal. For example, maybe you don't want to show all the users in your app but only those who are not admins.

You can use the `attach_scope` option to keep only the users you need in the `belongs_to` dropdown field.

You have access to the `query` that you can alter and return it and the `parent` object, which is the actual record where you want to assign the association (the true `Post` in the below example).

```ruby
# app/models/user.rb
class User < ApplicationRecord
  scope :non_admins, -> { where "(roles->>'admin')::boolean != true" }
end

# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :user, as: :belongs_to, attach_scope: -> { query.non_admins }
  end
end
```

For scenarios where you need to add a record associated with that resource (you create a `Post` through a `Category`), the `parent` is unavailable (the `Post` is not persisted in the database). Therefore, Avo makes the `parent` an instantiated object with its parent populated (a `Post` with the `category_id` populated with the parent `Category` from which you started the creation process) so you can better scope out the data (you know from which `Category` it was initiated).

## Allow detaching via the association

When you visit a record through an association, that `belongs_to` field is disabled. There might be cases where you'd like that field not to be disabled and allow your users to change that association.

You can instruct Avo to keep that field enabled in this scenario using `allow_via_detaching`.

```ruby{12}
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :id

  def fields
    field :id, as: :id
    field :body, as: :textarea

    field :commentable,
      as: :belongs_to,
      polymorphic_as: :commentable,
      types: [::Post, ::Project],
      allow_via_detaching: true
  end
end
```


---
version: '1.0'
license: community
---

# Has And Belongs To Many

The `HasAndBelongsToMany` association works similarly to [`HasMany`](./has_many).

```ruby
field :users, as: :has_and_belongs_to_many
```

## Options
<!-- @include: ./../common/associations_searchable_option_common.md-->
<!-- @include: ./../common/associations_attach_scope_option_common.md-->
<!-- @include: ./../common/associations_scope_option_common.md-->
<!-- @include: ./../common/associations_description_option_common.md-->
<!-- @include: ./../common/associations_use_resource_option_common.md-->
<!-- @include: ./../common/associations_discreet_pagination_option_common.md-->
<!-- @include: ./../common/associations_hide_search_input_option_common.md-->

<!-- @include: ./../common/search_query_scope_common.md-->
<!-- @include: ./../common/show_on_edit_common.md-->

### Searchable `has_and_belongs_to_many`

<div class="flex gap-2 mt-2">
  <VersionReq version="1.25" />
  <LicenseReq license="pro" title="Searchable associations are available as a pro feature" />
</div>


Similar to [`belongs_to`](./belongs_to#searchable-belongs-to), the `has_many` associations support the `searchable` option.

<!-- @include: ./../common/scopes_common.md-->
<!-- @include: ./../common/show_hide_buttons_common.md-->


---
version: '1.0'
license: community
---

# Has Many

By default, the `HasMany` field is visible only on the `Show` view. You will see a new panel with the model's associated records below the regular fields panel.

```ruby
field :projects, as: :has_many
```

## Options

<!-- @include: ./../common/associations_searchable_option_common.md-->
<!-- @include: ./../common/associations_attach_scope_option_common.md-->
<!-- @include: ./../common/associations_scope_option_common.md-->
<!-- @include: ./../common/associations_description_option_common.md-->
<!-- @include: ./../common/associations_use_resource_option_common.md-->
<!-- @include: ./../common/associations_discreet_pagination_option_common.md-->
<!-- @include: ./../common/associations_hide_search_input_option_common.md-->
<!-- @include: ./../common/associations_link_to_child_resource_common.md-->

<!-- @include: ./../common/search_query_scope_common.md-->

## Has Many Through

The `HasMany` association also supports the `:through` option.

```ruby{3}
field :members,
  as: :has_many,
  through: :memberships
```

<!-- @include: ./../common/show_on_edit_common.md-->
<!-- @include: ./../common/scopes_common.md-->
<!-- @include: ./../common/show_hide_buttons_common.md-->


---
version: '1.0'
license: community
---

:::warning
It's important to set the `inverse_of` as often as possible to your model's association attribute.
:::

# Has One

The `HasOne` association shows the unfolded view of your `has_one` association. It's like peaking on the `Show` view of that associated record. The user can also access the `Attach` and `Detach` buttons.

```ruby
field :admin, as: :has_one
```

<img :src="('/assets/img/associations/has-one.jpg')" alt="Has one" class="border mb-4" />

## Options

<!-- @include: ./../common/associations_searchable_option_common.md-->
<!-- @include: ./../common/associations_attach_scope_option_common.md-->

<!-- @include: ./../common/show_on_edit_common.md-->


# Associations

One of the most amazing things about Ruby on Rails is how easy it is to create [Active Record associations](https://guides.rubyonrails.org/association_basics.html) between models. We try to keep the same simple approach in Avo too.

:::warning
It's important to set the `inverse_of` as often as possible to your model's association attribute.
:::

 - [Belongs to](./associations/belongs_to)
 - [Has one](./associations/has_one)
 - [Has many](./associations/has_many)
 - [Has many through](./associations/has_many#has-many-through)
 - [Has and blongs to many](./associations/has_and_belongs_to_many)

## Single Table Inheritance (STI)

When you have models that share behavior and fields with STI, Rails will cast the model as the final class no matter how you query it.

```ruby
# app/models/user.rb
class User < ApplicationRecord
end

# app/models/super_user.rb
class SuperUser < User
end

# User.all.map(&:class) => [User, SuperUser]
```

For example, when you have two models, `User` and `SuperUser` with STI, when you call `User.all`, Rails will return an instance of `User` and an instance of `SuperUser`. That confuses Avo in producing the proper resource of `User`. That's why when you deal with STI, the final resource `Avo::Resources::SuperUser` should receive the underlying `model_class` so Avo knows which model it represents.

```ruby{4}
class Avo::Resources::SuperUser < Avo::BaseResource
  self.title = :name
  self.includes = []
  self.model_class = ::SuperUser

  def fields
    field :id, as: :id
    field :name, as: :text
  end
end
```

## Link to child resource when using STI

Let's take another example. We have a `Person` model and `Sibling` and `Spouse` models that inherit from it.

You may want to use the `Avo::Resources::Person` to list all the records, but when your user clicks on a person, you want to use the inherited resources (`Avo::Resources::Sibiling` and `Avo::Resources::Spouse`) to display the details. The reason is that you may want to display different fields or resource tools for each resource type.

There are two ways you can use this:

1. `self.link_to_child_resource = true` Declare this option on the parent resource. When a user is on the <Index /> view of your the `Avo::Resources::Person` and clicks on the view button of a `Person` they will be redirected to a `Child` or `Spouse` resource instead of a `Person` resource.
2. `field :peoples, as: :has_many, link_to_child_resource: false` Use it on a `has_many` field. On the `Avo::Resources::Person` you may want to show all the related people on the <Show /> page, but when someone click on a record, they are redirected to the inherited `Child` or `Spouse` resource.

## Add custom labels to the associations' pages

You might want to change the name that appears on the association page. For example, if you're displaying a `team_members` association, your users will default see `Team members` as the title, but you'd like to show them `Members`.

You can customize that using [fields localization](localization.html#localizing-fields).

<img :src="('/assets/img/associations/custom-label.jpg')" alt="Custom label" class="border mb-4" />


---
version: '1.0'
license: community
---

# Authentication

## Customize the `current_user` method

Avo will not assume your authentication provider (the `current_user` method returns `nil`). That means that you have to tell Avo who the `current_user` is.

### Using devise

For [devise](https://github.com/heartcombo/devise), you should set it to `current_user`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_method = :current_user
end
```

### Use a different authenticator

Using another authentication provider, you may customize the `current_user` method to something else.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_method = :current_admin
end
```

If you get the current user from another object like `Current.user`, you may pass a block to the `current_user_method` key.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_method do
    Current.user
  end
end
```

## Customize the sign-out link

If your app responds to `destroy_user_session_path`, a sign-out menu item will be added on the bottom sidebar (when you click the three dots). If your app does not respond to this method, the link will be hidden unless you provide a custom sign-out path. There are two ways to customize the sign-out path.

### Customize the current user resource name

You can customize just the "user" part of the path name by setting `current_user_resource_name`. For example if you follow the `User` -> `current_user` convention, you might have a `destroy_current_user_session_path` that logs the user out.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_resource_name = :current_user
end
```

Or if your app provides a `destroy_current_admin_session_path` then you would need to set `current_user_resource_name` to `current_admin`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_resource_name = :current_admin
end
```

### Customize the entire sign-out path

Alternatively, you can customize the sign-out path name completely by setting `sign_out_path_name`. For example, if your app provides `logout_path` then you would pass this name to `sign_out_path_name`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.sign_out_path_name = :logout_path
end
```

If both `current_user_resource_name` and `sign_out_path_name` are set, `sign_out_path_name` takes precedence.

## Filter out requests

You probably do not want to allow Avo access to everybody. If you're using [devise](https://github.com/heartcombo/devise) in your app, use this block to filter out requests in your `routes.rb` file.

```ruby
authenticate :user do
  mount Avo::Engine => '/avo'
end
```

You may also add custom user validation such as `user.admin?` to only permit a subset of users to your Avo instance.

```ruby
authenticate :user, -> user { user.admin? } do
  mount Avo::Engine => '/avo'
end
```

Check out more examples of authentication on [sidekiq's authentication section](https://github.com/mperham/sidekiq/wiki/Monitoring#authentication).

## `authenticate_with` method

Alternatively, you can use the `authenticate_with` config attribute. It takes a block and evaluates it in Avo's `ApplicationController` as a `before_action`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authenticate_with do
    authenticate_admin_user
  end
end
```

Note that Avo's `ApplicationController` does not inherit from your app's `ApplicationController`, so any protected methods you defined would not work. Instead, you would need to explicitly write the authentication logic in the block. For example, if you store your `user_id` in the session hash, then you can do:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authenticate_with do
    redirect_to '/' unless session[:user_id] == 1 # hard code user ids here
  end
end
```

## Authorization

When you share access to Avo with your clients or large teams, you may want to restrict access to a resource or a subset of resources. You should set up your authorization rules (policies) to do that. Check out the [authorization page](authorization) for details on how to set that up.


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

## Custom policies

<VersionReq version="2.17" />

By default, Avo will infer the policy from the model of the resource object. If you wish to use a different policy for a given resource, you can specify it directly in the resource using the `authorization_policy` option.

```ruby
class Avo::Resources::PhotoComment < Avo::BaseResource
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


# Upgrade guide

The upgrade process from Avo 2 to Avo 3 has quite a few steps, but you'll soon figure out that the API hasn't changed all that much. We moved a few things around and made others more consistent.

Depending on how you use Avo you might not need to do all the steps.

## Upgrade from 2.x to 3.x

:::info Ensure you meet the technical requirements
Avo now requires Ruby 3.0 and Rails 6.1
:::

:::info Ensure you have a token for `Pro` and `Advanced` versions.
Avo 3 requires a new v3 license key. Your v2 license key won't work. Please purchase and Avo 3 license from [avohq.io/pricing](https://avohq.io/pricing).
:::

:::info Upgrade from a v2 license to a v3 license
Because we switched Stripe accounts, the subscription upgrade process is not an automated one.

It goes like this:

- you write to us at [upgrades@avohq.io](mailto:upgrades@avohq.io?subject=I%20want%20to%20upgrade%20my%20Avo%20v2%20subscription%20to%20a%20v3%20one&body=Hi%2C%0D%0A%0D%0AMy%20name%20is%20...%2C%20with%20the%20license%20key%20...%20and%20I%20would%20like%20to%20upgrade%20my%20subscription%20to%20v3.%0D%0A%0D%0AThank%20you%2C%0D%0A%0D%0AFind%20your%20license%20key%20at%20https%3A%2F%2Favohq.io%2Fsubscriptions.) and tell us you license key and that you want to upgrade
- we'll cancel the v2 subscription and refund what's left
- you purchase a new v3 license from [avohq.io/pricing](https://avohq.io/pricing)
- at this point you'll still have a 14-day grace period on your v2 license so your app continues to work until you upgrade your code to v3.
:::

## Use the automatic upgrade tool

:::danger The upgrade tool

 - is experimental
 - doesn't cover all the required steps
 - might produce unwanted artifacts

**Back-up your code before using the tool.**
:::

To use the upgrade tool add `gem 'avo_upgrade'` to your `Gemfile` and run `bundle install`.

```ruby
group :development do
  gem "avo_upgrade"
end
```

Next you should run the `bin/rails avo:upgrade:2_to_3` command and go through the process.

Ideally, you'd run the command with a clean tree and then make the last adjustments manually. The command will tell you what those the last adjustments are that you have to do manually.

When that command finished you can safely remove `gem "avo_upgrade"` from your `Gemfile`.

## Upgrade steps

Each paragraph will guide you through the upgrade process for each individual change.

Most of these steps are breaking changes so you'll need to apply them if you're using the feature.

:::option Update your `Gemfile`
The Avo gem comes in three flavors now. Community, Pro, or Advanced.

You should add the one you use in your `Gemfile`. If you use Pro or Advanced you don't have to add `avo` too. Each gem adds their own dependencies.

Add only one of the ones below.

<!-- @include: ./common/avo_in_gemfile.md-->

:::info
For the duration of the open beta you should keep the `source` option on all packages. Once we release the stable version we'll publish `avo` to rubygems.org.
:::


:::option The status field changed behavior
Before, for the status you'd set the `failed` and `loading` states and everything else fell under `success`. That felt unnatural. We needed a `neutral` state.
Now we changed the field so you'll set the `failed`, `loading`, and `success` values and the rest fall under `neutral`.

```ruby
# Before
field :status,
  as: :status,
  failed_when: :failed,
  loading_when: :loading

# After
field :status,
  as: :status,
  failed_when: :failed,
  loading_when: :loading
  success_when: :deployed # specify the success state
```
:::

:::option `heading` has become a field type
Before, a heading used the `heading` method with a text string or HTML string as an argument.
Now, it is a field type with an ID. It supports rendering as text and as HTML.

### Actions to take

Rename `heading` to `field`. Give the field an ID and add the `as: :heading` argument.

```ruby
# Before
heading 'User Information'

# After
field :user_information, as: :heading
# or...
field :some_id, as: :heading, label: 'User Information'

# Before
heading '<div class="underline uppercase font-bold">User Information</div>', as_html: true

# After
field :some_id, as: :heading, as_html: true do
  '<div class="underline uppercase font-bold">User Information</div>'
end
```
:::

:::option Moved some globals from `Avo::App` to `Avo::Current`

### Actions to take

Rename the following:

- `Avo::App.context`      -> `Avo::Current.context`
- `Avo::App.params`       -> `Avo::Current.params`
- `Avo::App.request`      -> `Avo::Current.request`
- `Avo::App.view_context` -> `Avo::Current.view_context`
- `Avo::App.current_user` -> `Avo::Current.user`

Make note of the `current_user` to `user` rename.
:::

:::option Renamed `model` to `record` across all configuration files

The `model` naming is a bit off. You never know if you're mentioning the model class or the instantiated database record, so we changed it to `record` (Pundit calls it a record too). One of the places you'll see it the most is when you reference it off of the `resource` (`resource.model`).

### Actions to take

Rename `resource.model` to `resource.record`.

You might have the `model` referenced in other places too. Try to replace it with `record`.
If you find it in other places, please send them our way so we can update this doc for a more consistent API. Thank you!
:::

:::option Remove block (lambda) arguments

All block arguments are removed from Avo. We did this in order to make blocks more consistent and to improve future compatibility. All the arguments that were previously available as arguments, are present inside the block.

We don't have a complete list of blocks but we'll try to give you a few examples:

 - Field options: `visible`, `readonly`, `disabled`, `format_using`, etc.
 - Select field `options` option
 - Resource options: `index_query`, `search_query`, `find_record_method`, etc.
 - Actions, Dashboards, and Cards `self.visible`
 - anything that you are passing as a block should be without arguments

**As a general rule, we removed all block arguments. If we missed any, so please send them our way so we can update this guide.** Thank you!

### Actions to take

Remove the arguments from blocks

```ruby
# Before
self.visible = ->(resource:) {}

# After
self.visible = -> {}

# Before
field :name, as: :text, default: ->(resource:) {something}, format_using: ->(value:) {}, visible: ->(resource:) {}

# After
field :name, as: :text, default: -> {something}, format_using: -> {}, visible: -> {}

# Before
field :level, as: :select, options: ->(model:, resource:, field:, view:) do
    {
      Beginner: :beginner,
      Intermediate: :intermediate,
      Advanced: :advanced,
    }
  end

# After
field :level, as: :select, options: -> do
    {
      Beginner: :beginner,
      Intermediate: :intermediate,
      Advanced: :advanced,
    }
  end
```
:::

:::option Swap `disabled` and `readonly` field options

We received some feedback in v2.x that the `disabled` field option does not protect against DOM field manipulation when the form is submitted, so we introduced the `readonly` option that protects against that.

After a short [research](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly) we soon found out that HTML does it the other way around. `disabled` protects against that and `readonly` doesn't.
So, we are switching them to better comply with the standards.

### Actions to take

Swap those two

```ruby
field :name,
  as: :text,
  disabled: -> { !Avo::Current.user.is_admin? } // [!code --]
  readonly: -> { !Avo::Current.user.is_admin? } // [!code ++]

field :hidden_info,
  as: :text,
  readonly: -> { !Avo::Current.user.is_admin? } // [!code --]
  disabled: -> { !Avo::Current.user.is_admin? } // [!code ++]
```
:::

:::option Removed `index_text_align` option
Same behavior from `index_text_align` can be achieved using `html` and `class` options.

### Actions to take
Replace `index_text_align` with `html` option:

```ruby
# Before
field :users_required, as: :number, index_text_align: :right

# After
field :users_required, as: :number, html: {index: {wrapper: {classes: "text-right"}}}
```
:::

:::option Renamed `resolve_query_scope` to `index_query` in resources
The new method name `index_query` speaks more about what it does and the rest of the changes brings it more inline with the other APIs

### Actions to take

- rename `resolve_query_scope` to `index_query`
- remove the `(model_class:)` block argument
- rename `model_class` inside the block to `query`

```ruby
# Before
self.resolve_query_scope = ->(model_class:) do
  model_class.order(last_name: :asc)
end

# After
self.index_query = -> do
  query.order(last_name: :asc)
end
```
:::

:::option Removed `resolve_find_scope` in favor of `find_record_method`
The new `find_record_method` method works better as it enables you to use custom find matchers.

### Actions to take

- rename `resolve_query_scope` to `index_query`
- remove the `(model_class:, id:, params:)` block arguments
- rename `model_class` inside the block to `query`
- add the `.find` matcher

```ruby
# Before
self.resolve_find_scope = ->(model_class:) do
  model_class.friendly
end

# After
self.find_record_method = -> do
  query.friendly.find id
end
```
:::

:::option Refactor the grid view API
We removed the old `grid do` block to `self.grid_view` to fall more inline with `self.map_view` and others.

The `card` block will cycle through all of your records and you need to return a hash with the following keys `title`, `body`, `cover_url`.

You may also return an `html` option to apply html properties to the card elements.

```ruby
self.grid_view = {
  card: -> do
    {
      cover_url:
        if record.cover_photo.attached?
          main_app.url_for(record.cover_photo.url)
        end,
      title: record.name,
      body: ActionView::Base.full_sanitizer.sanitize(record.body).truncate(120)
    }
  end,
  html: -> do
    {
      title: {
        index: {
          wrapper: {
            classes: "bg-blue-50 rounded-md p-2"
          }
        }
      },
      body: {
        index: {
          wrapper: {
            classes: "bg-gray-50 rounded-md p-1"
          }
        }
      }
    }
  end
}
```
:::

:::option Refactored the search API
In Avo 2, the search options were scattered around multiple places. The query was used from the `search_query`, the record description was taken from an arbitrary `as_description: true` field option, and other mis-aligned places.

In Avo 3 we brought all those things in a single `self.search` option.

The `self.search[:item]` block will go through each of the found records where you have to return a hash with the following keys `title`, `description`, `image_url`, `image_format`.

- `self.search_query` moved to `self.search[:query]`. (remove `self.search_query` from the resource file)
- `scope` that was accessible inside old `self.search_query` moved to `query` and it's inside `self.search[:query]` (check code example below)
- `self.search_query_help` moved to `self.search[:help]`. (remove `self.search_query_help` from the resource file)
- `self.hide_from_global_search` moved to `self.search[:hide_on_global]`. (remove `self.hide_from_global_search` from the resource file)
- `self.search_result_path` moved to `self.search[:result_path]`. (remove `self.search_result_path` from the resource file)
- the search item `title` is going to be the `self.title` by default but you can configure it in `item`.
- `as_description: true` is `self.search[:item][:description]`. (remove `as_description: true` from fields)
- `as_avatar: true` is `self.search[:item][:image_url]`. (remove `as_avatar:` from fields)
- `as_avatar: :rounded` is `self.search[:item][:image_format]`

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> {
      query.order(created_at: :desc)
        .ransack(first_name_cont: params[:q], last_name_cont: params[:q], m: "or")
        .result(distinct: false)
    },
    item: -> do
      {
        title: record.name,
        description: "This user has the following roles: #{record.roles.select { |key, value| value }.keys.join(", ")}",
        image_url: main_app.url_for(record.cover_photo) if record.cover_photo.attached?,
        image_format: :rounded
      }
    end
    help: -> { "- Search by first name or last name." },
    hide_on_global: true,
    result_path: -> { avo.resources_city_path record, custom: "yup" }
  }
end
```
:::

::::option Rename Avo configuration classes

We are falling more in line with how Rails and zeitwerk autoloads classes. We do this to avoid some issues like class conflicts and difficult to remember naming schemes.

The old naming scheme: `{NAME}{TYPE}` (`UserResource`)
The new naming scheme: `Avo::{TYPE}::{Name}` (`Avo::Resources::User`)

In a similar fashion you should update the filename too: `app/avo/resources/user_resource.rb` -> `app/avo/resources/user.rb`.

### Actions to take

Rename the your configuration classes to include the full path:

::: code-group

```ruby [Resources]
# Before
# /app/avo/resources/user_resource.rb
class UserResource < Avo::BaseResource
end

# After
# /app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
end
```

```ruby [Actions]
# Before
# /app/avo/actions/export_action.rb
class ExportAction < Avo::BaseAction
end

# After
# /app/avo/actions/export.rb
class Avo::Actions::Export < Avo::BaseAction
end
```

```ruby [Filters]
# Before
# /app/avo/filters/name_filter.rb
class NameFilter < Avo::BaseFilter
end

# After
# /app/avo/filters/name.rb
class Avo::Filters::Name < Avo::BaseFilter
end
```

```ruby [Dashboards]
# Before
# /app/avo/dashboards/sales_dashboard.rb
class SalesDashboard < Avo::BaseResource
end

# After
# /app/avo/dashboards/sales.rb
class Avo::Dashboards::Sales < Avo::Dashboards::BaseDashboard
end
```

```ruby [Cards]
# Before
# /app/avo/cards/users_count_card.rb
class UsersCountCard < Avo::Dashboards::MetricCard
end

# After
# /app/avo/cards/users_count.rb
class Avo::Cards::UsersCount < Avo::Cards::MetricCard
end
```

```ruby [Resource tools]
# Before
# /app/avo/resource_tools/comments_resource_tool.rb
class CommentsResourceTool < Avo::BaseResourceTool
end

# After
# /app/avo/resource_tools/comments.rb
class Avo::ResourceTools::Comments < Avo::BaseResourceTool
end
```

```ruby [Custom fields]
# Before
# /app/avo/fields/color_picker_field.rb
class ColorPickerField < Avo::Fields::BaseField
end

# After
# /app/avo/fields/color_picker_field.rb
class Avo::Fields::ColorPickerField < Avo::Fields::BaseField
end
```
:::
::::

:::option Use the `def fields` API
We are introducing a new API for declaring fields. This brings many improvements from easier maintenance, better control, better composition, and more.

```ruby
# Before
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  field :id, as: :id, filterable: true
  field :name, as: :text, sortable: true, show_on: :preview, filterable: true

  tabs do
    tab "Info" do
      panel do
        field :created_at, as: :date_time, filterable: true
      end
    end
  end

  sidebar do
    field :updated_at, as: :date_time, filterable: true
  end

  panel "Logo" do
    field :logo, as: :external_image, hide_on: :show, as_avatar: :rounded
  end

  tool Avo::ResourceTools::TeamTool
end

# After
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, filterable: true
    field :name, as: :text, sortable: true, show_on: :preview, filterable: true

    tabs do
      tab "Info" do
        panel do
          field :created_at, as: :date_time, filterable: true
        end
      end
    end

    sidebar do
      field :updated_at, as: :date_time, filterable: true
    end

    panel "Logo" do
      field :logo, as: :external_image, hide_on: :show, as_avatar: :rounded
    end

    tool Avo::ResourceTools::TeamTool
  end
end
```

This will enable us to provide request specific data to the field configuration like `current_user` and `params` and will enable you to have better composition.

```ruby
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  def admin_fields
    field :created_at, as: :date_time, filterable: true
  end

  def fields
    field :id, as: :id, filterable: true
    field :name, as: :text, sortable: true, show_on: :preview, filterable: true
    field :logo, as: :external_image, hide_on: :show, as_avatar: :rounded do
      if record.url
        "//logo.clearbit.com/#{URI.parse(record.url).host}?size=180"
      end
    end

    # request-time data
    if current_user.is_admin?
      # better composition
      admin_fields
    end
  end
end
```

### Actions to take

Wrap all `field`, `tabs`, `tab`, `panel`, `sidebar`, and `tool` declarations from Resource and Action files into one `def fields` method.
:::

:::option Use the `def actions` API
Similar to how we added the `def fields` wrapper to fields you should now wrap all actions in an `actions` method.


```ruby{3,8-10}
# Before
class Avo::Resources::User < Avo::BaseResource
  action Avo::Actions::Dummy
end

# After
class Avo::Resources::User < Avo::BaseResource
  def actions
    action Avo::Actions::Dummy
  end
end
```
:::

:::option Use the `def filters` API
Similar to how we added the `def fields` wrapper to fields you should now wrap all filters in an `filters` method.


```ruby{3,8-10}
# Before
class Avo::Resources::User < Avo::BaseResource
  filter Avo::Filters::IsAdmin
end

# After
class Avo::Resources::User < Avo::BaseResource
  def filters
    filter Avo::Filters::IsAdmin
  end
end
```
:::

:::option Use the `def scopes` API
Similar to how we added the `def fields` wrapper to fields you should now wrap all scopes in an `scopes` method.


```ruby{3,8-10}
# Before
class Avo::Resources::User < Avo::BaseResource
  scope Avo::Scopes::Active
end

# After
class Avo::Resources::User < Avo::BaseResource
  def scopes
    scope Avo::Scopes::Active
  end
end
```
:::

:::option Wrap all Dashboard `card` and `divider` definitions inside one `def cards` method
After the `def fields` refactor we did the same in dashboard files. Instead of declaring the cards in the class directly, you should do it in the `def cards` method.

```ruby{6-9,17-22}
# Before
class Avo::Dashboards::Dashy < AvoDashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  card Avo::Cards::ExampleMetric, visible: -> { true }
  card Avo::Cards::ExampleAreaChart
  divider
  card Avo::Cards::ExampleScatterChart
end

# After
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  def cards
    card Avo::Cards::ExampleMetric, visible: -> { true }
    card Avo::Cards::ExampleAreaChart
    divider
    card Avo::Cards::ExampleScatterChart
  end
end
```
:::

:::option `tool` is declared inside the `def fields` method
In Avo 3 you'll be able to insert resource tools in-between fields, tabs and panels, so now, the `tool`s must be called inside the `fields` method. This feature is unreleased yet, but you should make the change now so it'll be seamless when we add it.

### Actions to take

```ruby{8,17}
# Before
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true, sortable: false
    field :email, as: :gravatar, link_to_record: true, as_avatar: :circle, only_on: :index
  end

  tool Avo::ResourceTools::UserTool
end

# After
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true, sortable: false
    field :email, as: :gravatar, link_to_record: true, as_avatar: :circle, only_on: :index

    tool Avo::ResourceTools::UserTool
  end
end
```
:::

:::option Remove `tabs_style` from the `tabs` declaration
We streamlined tabs and kept only the `:pills` style so now we only have one style of tabs.

### Actions to take

Remove `tabs_style` from the `tabs` declaration

```ruby
# Before
tabs tabs_style: :pills do
  # tabs here
end

# After
tabs do
  # tabs here
end
```
:::


# Avo 3

Avo 3 is the version of Avo we always wanted to build. It condenses all the learnings we had for the past three years into a few cool packages.

We would like to thank our community for all the support they've given and all the feedback and contributions!

## Changes

You'll find all the new changes in the [Avo 2 to Avo 3 upgrade section](./avo-2-avo-3-upgrade.html).

## New features & big changes

We made

- [Dynamic filters](./dynamic-filters)
- [Custom controls on everywhere](./customizable-controls) (<Index />, <Show />, <Edit />,and `Row`)
- [Resource scopes](./scopes)
- [Custom fields from template](./eject-views.html#field_components)
- [Custom resource view components](./resources.html#self_components) for <Index />, <Show />, and <Edit />
- [Custom components for fields](./field-options.html#customizing-field-components-using-components-option)
- [Intelligent `view` object](./views.html#checking-the-current-view) and new `display` view option
- [Better TailwindCSS integration](./tailwindcss-integration.html)
- [Resource Cards](./resources.html#cards)
- [New `def fields` API](./fields)
- [New `def index|show|edit_fields` API](./fields.html#specific-methods-for-each-view)
- [Plugins API](./plugins)
- [Record preview on Index](./record-previews)
- [Testing helpers](./testing#testing-helpers)
- [Eject command improvements](./eject-views.html)
- [Panel layout improvements](./resource-panels.html)
- [Action link generator](./actions.html#action-link)
- [StimulusJS in actions](./actions.html#stimulusjs)
- Multiple actions flows
- Intelligent resource title
- License checking mechanism improvements
- Dynamic fields (coming soon)
- Nested record creation (coming soon)
- Resource tools in fields (coming soon)

## What are we working on next?

Avo 3 is not finished yet. We will continue to provide the same cadence of one release every two weeks you are used to. Some the things we want to focus on in the near future are:

- Theming
- Improvements to the dynamic filters
- Custom resource adapters
- Dynamic fields
- Nested records creation
- Resource tool in fields

Please follow our [Roadmap](https://avohq.io/roadmap) for more information about that.

## Repos and packages

Avo 3 has been divided into various repositories and packages, organized by the specific feature or tier they are intended for. Within this structure, there are three main packages available: `avo`, `avo-pro`, and `avo-advanced`. Depending on your license, you need to manually include one of these packages in your `Gemfile`. Note that both `avo-pro` and `avo-advanced` come with additional packages that serve as their dependencies.

## Feedback

I'd love it if we could have an open forum with the open beta program. I created an `#avo-3` channel on Discord where I invite you all to provide feedback and ask for support.
We appreciate all types of feedback from the API changes, to design work, and any idea you might have.

## Documentation

We started the process to redo and reorganize the 3.0 docs, so if we missed anything, please let us know.

## What next?

1. [Install Avo 3](./installation)
1. [Follow the upgrade guide](./avo-2-avo-3-upgrade.html) if you're upgrading from Avo 2
1. [Experience the new features](#new-features)
1. [Provide feedback and ask for support](https://github.com/avo-hq/avo/issues/new?assignees=&labels=Avo%203)


# `Avo::ApplicationController`

## On extending the `ApplicationController`

You may sometimes want to add functionality to Avo's `ApplicationController`. That functionality may be setting attributes to `Current` or multi-tenancy scenarios.

When you need to do that, you may feel the need to override it with your own version. That means you go into the source code, find `AVO_REPO/app/controllers/avo/application_controller.rb`, copy the whole thing into your own `YOUR_APP/app/controllers/avo/application_controller.rb` file inside your app, and add your own piece of functionality.

```ruby{10,14-16}
# Copied from Avo to `app/controllers/avo/application_controller.rb`
module Avo
  class ApplicationController < ::ActionController::Base
    include Pagy::Backend
    include Avo::ApplicationHelper
    include Avo::UrlHelpers

    protect_from_forgery with: :exception
    around_action :set_avo_locale
    before_action :multitenancy_detector

    # ... more Avo::ApplicationController methods

    def multitenancy_detector
      # your logic here
    end
  end
end
```

That will work just fine until the next time we update it. After that, we might add a method, remove one, change the before/after actions, update the helpers and do much more to it.
**That will definitely break your app the next time when you upgrade Avo**. Avo's private controllers are still considered private APIs that may change at any point. These changes will not appear in the changelog or the upgrade guide.

## Responsibly extending the `ApplicationController`

There is a right way of approaching this scenario using Ruby modules or concerns.

First, you create a concern with your business logic; then you include it in the parent `Avo::ApplicationController` like so:

```ruby{5-7,9-11,15-18}
# app/controllers/concerns/multitenancy.rb
module Multitenancy
  extend ActiveSupport::Concern

  included do
    before_action :multitenancy_detector
  end

  def multitenancy_detector
    # your logic here
  end
end

# configuration/initializers/avo.rb
Rails.configuration.to_prepare do
  Avo::ApplicationController.include Multitenancy
end
```

With this technique, the `multitenancy_detector` method and its `before_action` will be included safely in `Avo::ApplicationController`.


# `Avo::Current`

`Avo::Current` is based on the `Current` pattern Rails exposes using [`ActiveSupport/CurrentAttributes`](https://api.rubyonrails.org/classes/ActiveSupport/CurrentAttributes.html).

On each request Avo will set some values on it.

:::option `user`
This is what will be returned by the [`current_user_method`](./authentication.html#customize-the-current-user-method) that you've set in your initializer.
:::

:::option `params`
Equivalent of `request.params`.
:::

:::option `request`
The Rails `request`.
:::

:::option `context`
The [`context`](./customization.html#context) that you configured in your initializer evaluated in `Avo::ApplicationController`.
:::

:::option `view_context`
An instance of [`ActionView::Rendering`](https://api.rubyonrails.org/classes/ActionView/Rendering.html#method-i-view_context) off of which you can run any methods or variables that are available in your partials.

```ruby
view_context.link_to "Avo", "https://avohq.io"
```
:::

:::option `locale`
The `locale` of the app.
:::



---
feedbackId: 838
---

# Filters

Filters allow you to better scope the index queries for records you are looking for.

Each filter is configured in a class with a few dedicated [methods and options](#filter-options). To use a filter on a resource you must [register it](#register-filters) and it will be displayed on the <Index /> view.

## Filter options

:::option `self.name`

`self.name` is what is going to be displayed to the user in the filters panel.
:::

:::option `self.visible`

You may want to show/hide the filter in some scenarios. You can do that using the `self.visible` attribute.

Inside the visible block you can acces the following variables and you should return a boolean (`true`/`false`).

```ruby
  self.visible = -> do
    #   You have access to:
    #   block
    #   context
    #   current_user
    #   params
    #   parent_model
    #   parent_resource
    #   resource
    #   view
    #   view_context
    true
  end
```
:::

:::option `self.empty_message`
There might be times when you will want to show a message to the user when you're not returning any options.

More on this in the [Empty message guide](#empty-message-text).
:::
:::option `options`
Some filters allow you to pass options to the user. For example on the [select filter](#select_filter) you can set the options in the dropdown, and on the [boolean filter](#boolean_filter) you may set the checkbox values.
Each filter type has their own `options` configuration explained below.

In the `options` method you have access to the `request`, `params`, [`context`](./customization#context), `view_context`, and `current_user` objects.
:::

:::option `apply`
The `apply` method is what is going to be run when Avo fetches the records on the <Index /> view.

It recieves the `request` form which you can get all the `params` if you need them, it gets the `query` which is the query Avo made to fetch the records. It's a regular [Active Record](https://guides.rubyonrails.org/active_record_querying.html) which you can manipulate.

It also receives the `values` variable which holds the actual choices the user made on the front-end for the [options](#options) you set.
:::

:::option `default`
You may set default values for the `options` you set. For example you may set which option to be selected for the [select filter](#select_filter) and which checkboxes to be set for the [boolean filter](#boolean_filter).

In the `default` method you have access to the `request`, `params`, [`context`](./customization#context), `view_context`, and `current_user` objects.
:::

:::option `react`
This is a hook in which you can change the value of the filter based on what other filters have for values.

More on this in the [React to filters guide](#react-to-filters)
:::

## Register filters

In order to use a filter you must register it on a `Resource` using the `filter` method inside the `filters` method.

```ruby{9}
class Avo::Resources::Post < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id
  end

  def filters
    filter Avo::Filters::PublishedFilter
  end
end
```

## Filter types

Avo has several types of filters available [Boolean filter](#boolean_filter), [Select filter](#select_filter), [Multiple select filter](#multiple_select_filter) and [Text filter](#text_filter).

<img :src="('/assets/img/filters.png')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

### Filter values

Because the filters get serialized back and forth, the final `value`/`values` in the `apply` method will be stringified or have the stringified keys if they are hashes. You can declare them as regular hashes in the `options` method, but they will get stringified.

:::option Boolean Filter

The boolean filter is a filter where the user can filter the records using one or more checkboxes.

To generate one run:

```bash
bin/rails generate avo:filter featured
```
or
```bash
bin/rails generate avo:filter featured --type boolean
```

Here's a sample filter

```ruby
class Avo::Filters::Featured < Avo::Filters::BooleanFilter
  self.name = 'Featured filter'

  # `values` comes as a hash with stringified keys
  # Eg:
  # {
  #   'is_featured': true
  # }
  def apply(request, query, values)
    return query if values['is_featured'] && values['is_unfeatured']

    if values['is_featured']
      query = query.where(is_featured: true)
    elsif values['is_unfeatured']
      query = query.where(is_featured: false)
    end

    query
  end

  def options
    {
      is_featured: "Featured",
      is_unfeatured: "Unfeatured"
    }
  end

  # Optional method to set the default state.
  # def default
  #   {
  #     is_featured: true
  #   }
  # end
end
```

Each filter file comes with a `name`, `apply`, and `options` methods.

The `name` method lets you set the name of the filter.

The `apply` method is responsible for filtering out the records by giving you access to modify the `query` object. The `apply` method also gives you access to the current `request` object and the passed `values`. The `values` object is a `Hash` containing all the configured `options` with the option name as the key and `true`/`false` as the value.

```ruby
# Example values payload
{
  'is_featured': true,
  'is_unfeatured': false,
}
```

The `options` method defines the available values of your filter. They should return a `Hash` with the option id as a key and option label as value.

### Default value

You can set a default value to the filter, so it has a predetermined state on load. To do that, return the state you desire from the `default` method.

```ruby{23-27}
class Avo::Filters::Featured < Avo::Filters::BooleanFilter
  self.name = 'Featured status'

  def apply(request, query, values)
    return query if values['is_featured'] && values['is_unfeatured']

    if values['is_featured']
      query = query.where(is_featured: true)
    elsif values['is_unfeatured']
      query = query.where(is_featured: false)
    end

    query
  end

  def options
    {
      is_featured: "Featured",
      is_unfeatured: "Unfeatured"
    }
  end

  def default
    {
      is_featured: true
    }
  end
end
```
:::

:::option Select Filter

Select filters are similar to Boolean ones but they give the user a dropdown with which to filter the values.

```bash
rails generate avo:filter published --type select
```

The most significant difference from the **Boolean filter** is in the `apply` method. You only get back one `value` attribute, which represents which entry from the `options` method is selected.

A finished, select filter might look like this.

```ruby
class Avo::Filters::Published < Avo::Filters::SelectFilter
  self.name = 'Published status'

  # `value` comes as a string
  # Eg: 'published'
  def apply(request, query, value)
    case value
    when 'published'
      query.where.not(published_at: nil)
    when 'unpublished'
      query.where(published_at: nil)
    else
      query
    end
  end

  def options
    {
      published: "Published",
      unpublished: "Unpublished"
    }
  end

  # Optional method to set the default state.
  # def default
  #   :published
  # end
end
```

### Default value

The select filter supports setting a default too. That should be a string or symbol with the select item. It will be stringified by Avo automatically.

```ruby{22-24}
class Avo::Filters::Published < Avo::Filters::SelectFilter
  self.name = 'Published status'

  def apply(request, query, value)
    case value
    when 'published'
      query.where.not(published_at: nil)
    when 'unpublished'
      query.where(published_at: nil)
    else
      query
    end
  end

  def options
    {
      'published': 'Published',
      'unpublished': 'Unpublished',
    }
  end

  def default
    :published
  end
end
```
:::

:::option Multiple select filter

You may also use a multiple select filter.

```bash
rails generate avo:filter post_status --type multiple_select
```

```ruby
class Avo::Filters::PostStatus < Avo::Filters::MultipleSelectFilter
  self.name = "Status"

  # `value` comes as an array of strings
  # Ex: ['admins', 'non_admins']
  def apply(request, query, value)
    if value.include? 'admins'
      query = query.admins
    end

    if value.include? 'non_admins'
      query = query.non_admins
    end

    query
  end

  def options
    {
      admins: "Admins",
      non_admins: "Non admins",
    }
  end

  # Optional method to set the default state.
  # def default
  #   ['admins', 'non_admins']
  # end
end
```

<img :src="('/assets/img/multiple-select-filter.png')" alt="Avo multiple select filter" style="width: 300px;" class="border mb-4" />

### Dynamic options

The select filter can also take dynamic options:

```ruby{15-17}
class Avo::Filters::Author < Avo::Filters::SelectFilter
  self.name = 'Author'

  def apply(request, query, value)
    query = query.where(author_id: value) if value.present?
    query
  end

  # Example `applied_filters`
  # applied_filters = {
  #   "Avo::Filters::CourseCountryFilter" => {
  #     "USA" => true,
  #     "Japan" => true,
  #     "Spain" => false,
  #     "Thailand" => false,
  #   }
  # }
  def options
    # Here you have access to the `applied_filters` object too
    Author.select(:id, :name).each_with_object({}) { |author, options| options[author.id] = author.name }
  end
end
```
:::

:::option Text Filter

You can add complex text filters to Avo using the Text filter

```bash
rails generate avo:filter name --type text
```

```ruby
class Avo::Filters::Name < Avo::Filters::TextFilter
  self.name = "Name filter"
  self.button_label = "Filter by name"

  # `value` comes as text
  # Eg: 'avo'
  def apply(request, query, value)
    query.where('LOWER(name) LIKE ?', "%#{value}%")
  end

  # def default
  #   'avo'
  # end
end
```
:::

## Dynamic filter options

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio" />

You might want to compose more advanced filters, like when you have two filters, one for the country and another for cities, and you'd like to have the cities one populated with cities from the selected country.

Let's take the `Avo::Resources::Course` as an example.

```ruby{3-5,7-14}
# app/models/course.rb
class Course < ApplicationRecord
  def self.countries
    ["USA", "Japan", "Spain", "Thailand"]
  end

  def self.cities
    {
      USA: ["New York", "Los Angeles", "San Francisco", "Boston", "Philadelphia"],
      Japan: ["Tokyo", "Osaka", "Kyoto", "Hiroshima", "Yokohama", "Nagoya", "Kobe"],
      Spain: ["Madrid", "Valencia", "Barcelona"],
      Thailand: ["Chiang Mai", "Bangkok", "Phuket"]
    }
  end
end
```

We will create two filters—one for choosing countries and another for cities.

```ruby{4-5}
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def filters
    filter Avo::Filters::CourseCountryFilter
    filter Avo::Filters::CourseCityFilter
  end
end
```

The country filter is pretty straightforward. Set the query so the `country` field to be one of the selected countries and the `options` are the available countries as `Hash`.

```ruby{6,10}
# app/avo/filters/course_country.rb
class Avo::Filters::CourseCountry < Avo::Filters::BooleanFilter
  self.name = "Course country filter"

  def apply(request, query, values)
    query.where(country: values.select { |country, selected| selected }.keys)
  end

  def options
    Course.countries.map { |country| [country, country] }.to_h
  end
end
```

The cities filter has a few more methods to manage the data better, but the gist is the same. The `query` makes sure the records have the city value in one of the cities that have been selected.

The `options` method gets the selected countries from the countries filter (`Avo::Filters::CourseCountryFilter`) and formats them to a `Hash`.

```ruby{6,10}
# app/avo/filters/course_city.rb
class Avo::Filters::CourseCity < Avo::Filters::BooleanFilter
  self.name = "Course city filter"

  def apply(request, query, values)
    query.where(city: values.select { |city, selected| selected }.keys)
  end

  def options
    cities_for_countries countries
  end

  private

  # Get a hash of cities for certain countries
  # Example payload:
  # countries = ["USA", "Japan"]
  def cities_for_countries(countries_array = [])
    countries_array
      .map do |country|
        # Get the cities for this country
        Course.cities.stringify_keys[country]
      end
      .flatten
      # Prepare to transform to a Hash
      .map { |city| [city, city] }
      # Turn to a Hash
      .to_h
  end

  # Get the value of the selected countries
  # Example payload:
  # applied_filters = {
  #   "Avo::Filters::CourseCountryFilter" => {
  #     "USA" => true,
  #     "Japan" => true,
  #     "Spain" => false,
  #     "Thailand" => false,
  #   }
  # }
  def countries
    if applied_filters["Avo::Filters::CourseCountryFilter"].present?
      # Fetch the value of the countries filter
      applied_filters["Avo::Filters::CourseCountryFilter"]
        # Keep only the ones selected
        .select { |country, selected| selected }
        # Pluck the name of the coutnry
        .keys
    else
      # Return empty array
      []
    end
  end
end
```

<img :src="('/assets/img/filters/dynamic-options.png')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

The `countries` method above will check if the `Avo::Filters::CourseCountryFilter` has anything selected. If so, get the names of the chosen ones. This way, you show only the cities from the selected countries and not all of them.

## React to filters

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio?t=219" />

Going further with the example above, a filter can react to other filters. For example, let's say that when a user selects `USA` from the list of countries, you want to display a list of cities from the USA (that's already happening in `options`), and you'd like to select the first one on the list. You can do that with the `react` method.

```ruby{21-36}
# app/avo/filters/course_city.rb
class Avo::Filters::CourseCity < Avo::Filters::BooleanFilter
  self.name = "Course city filter"

  def apply(request, query, values)
    query.where(city: values.select { |city, selected| selected }.keys)
  end

  def options
    cities_for_countries countries
  end

  # applied_filters = {
  #   "Avo::Filters::CourseCountryFilter" => {
  #     "USA" => true,
  #     "Japan" => true,
  #     "Spain" => false,
  #     "Thailand" => false,
  #   }
  # }
  def react
    # Check if the user selected a country
    if applied_filters["Avo::Filters::CourseCountryFilter"].present? && applied_filters["Avo::Filters::CourseCityFilter"].blank?
      # Get the selected countries, get their cities, and select the first one.
      selected_countries = applied_filters["Avo::Filters::CourseCountryFilter"].select do |name, selected|
        selected
      end

      # Get the first city
      cities = cities_for_countries(selected_countries.keys)
      first_city = cities.first.first

      # Return the first city as selected
      [[first_city, true]].to_h
    end
  end

  private

  # Get a hash of cities for certain countries
  # Example payload:
  # countries = ["USA", "Japan"]
  def cities_for_countries(countries_array = [])
    countries_array
      .map do |country|
        # Get the cities for this country
        Course.cities.stringify_keys[country]
      end
      .flatten
      # Prepare to transform to a Hash
      .map { |city| [city, city] }
      # Turn to a Hash
      .to_h
  end

  # Get the value of the selected countries
  # Example `applied_filters` payload:
  # applied_filters = {
  #   "Avo::Filters::CourseCountryFilter" => {
  #     "USA" => true,
  #     "Japan" => true,
  #     "Spain" => false,
  #     "Thailand" => false,
  #   }
  # }
  def countries
    if applied_filters["Avo::Filters::CourseCountryFilter"].present?
      # Fetch the value of the countries filter
      applied_filters["Avo::Filters::CourseCountryFilter"]
        # Keep only the ones selected
        .select { |country, selected| selected }
        # Pluck the name of the coutnry
        .keys
    else
      # Return empty array
      []
    end
  end
end
```

After all, filters are applied, the `react` method is called, so you have access to the `applied_filters` object.
Using the applied filter payload, you can return the value of the current filter.

```ruby
def react
  # Check if the user selected a country
  if applied_filters["Avo::Filters::CourseCountryFilter"].present? && applied_filters["Avo::Filters::CourseCityFilter"].blank?
    # Get the selected countries, get their cities, and select the first one.
    selected_countries = applied_filters["Avo::Filters::CourseCountryFilter"]
      .select do |name, selected|
        selected
      end

    # Get the first city
    cities = cities_for_countries(selected_countries.keys)
    first_city = cities.first.first

    # Return the first city selected as a Hash
    [[first_city, true]].to_h
  end
end
```

Besides checking if the countries filter is populated (`applied_filters["Avo::Filters::CourseCountryFilter"].present?`), we also want to allow the user to customize the cities filter further, so we need to check if the user has added a value to that filter (`applied_filters["Avo::Filters::CourseCountryFilter"].blank?`).
If these conditions are true, the country filter has a value, and the user hasn't selected any values from the cities filter, we can react to it and set a value as the default one.

<img :src="('/assets/img/filters/dynamic-options.gif')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

Of course, you can modify the logic and return all kinds of values based on your needs.

## Empty message text

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio?t=347" />

There might be times when you will want to show a message to the user when you're not returning any options. You may customize that message using the `empty_message` option.

<img :src="('/assets/img/filters/empty-message.gif')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

```ruby{4}
# app/avo/filters/course_city.rb
class Avo::Filters::CourseCity < Avo::Filters::BooleanFilter
  self.name = "Course city filter"
  self.empty_message = "Please select a country to view options."

  def apply(request, query, values)
    query.where(city: values.select { |city, selected| selected }.keys)
  end

  def options
    if countries.present?
      []
    else
      ["Los Angeles", "New York"]
    end
  end

  private

  def countries
    # logic to fetch the countries
  end
end
```

## Keep filters panel open

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio?t=374" />

There are scenarios where you wouldn't want to close the filters panel when you change the values. For that, you can use the `keep_filters_panel_open` resource option.

More on this on the [`keep_filters_panel_open` resource option](./resources#self_keep_filters_panel_open).

## Filter arguments

Filters can have different behaviors according to their host resource. In order to achieve that, arguments must be passed like on the example below:

```ruby{12-14}
class Avo::Resources::Fish < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id
    field :name, as: :text
    field :user, as: :belongs_to
    field :type, as: :text, hide_on: :forms
  end

  def filters
    filter Avo::Filters::NameFilter, arguments: {
      case_insensitive: true
    }
  end
end
```

Now, the arguments can be accessed inside `Avo::Filters::NameFilter` ***`apply` method***, ***`options` method*** and on the ***`visible` block***!

```ruby{4-6,8-14}
class Avo::Filters::Name < Avo::Filters::TextFilter
  self.name = "Name filter"
  self.button_label = "Filter by name"
  self.visible = -> do
    arguments[:case_insensitive]
  end

  def apply(request, query, value)
    if arguments[:case_insensitive]
      query.where("LOWER(name) LIKE ?", "%#{value.downcase}%")
    else
      query.where("name LIKE ?", "%#{value}%")
    end
  end
end
```

## Manually create encoded URLs

You may want to redirect users to filtered states of the <Index /> view from other places in your app. In order to create those filtered states you may use these helpers functions or Rails helpers.


### Rails helpers

:::option `decode_filter_params`

Decodes the `filters` param. This Rails helper can be used anywhere in a view or off the `view_context`.

#### Usage

```ruby
# in a view
decode_filter_params params[:filters] # {"NameFilter"=>"Apple"}

# Or somewhere in an Avo configuration file

class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    filters = view_context.decode_filter_params(params[:filters])

    do_something_important_with_the_filters filters
  end
end
```
:::

:::option `encode_filter_params`

Encodes a `filters` object into a serialized state that Avo understands. This Rails helper can be used anywhere in a view or off the `view_context`.

#### Usage

```ruby
# in a view
filters = {"NameFilter"=>"Apple"}
encode_filter_params filters # eyJOYW1lRmlsdGVyIjoiQXBwbGUifQ==

# Or somewhere in an Avo configuration file

class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    do_something_important

    redirect_to avo.resources_users_path(filters: view_context.decode_filter_params({"NameFilter"=>"Apple"}))
  end
end
```
:::

### Standalone helpers

:::option `Avo::Filters::BaseFilter.decode_filters`

Decodes the `filters` param. This standalone method can be used anywhere.

#### Usage

```ruby
class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    filters = Avo::Filters::BaseFilter.decode_filters(params[:filters])

    do_something_important_with_the_filters filters
  end
end
```
:::

:::option `Avo::Filters::BaseFilter.encode_filters`

Encodes a `filters` object into a serialized state that Avo understands. This standalone method can be used anywhere.

#### Usage

```ruby
class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"

  def handle(**args)
    do_something_important

    redirect_to avo.resources_users_path(filters: Avo::Filters::BaseFilter.encode_filters({"NameFilter"=>"Apple"}))
  end
end
```
:::


---
version: '2.15'
betaStatus: Open beta
license: pro
---

# Branding

```ruby
Avo.configure do |config|
  config.branding = {
    colors: {
      background: "248 246 242",
      100 => "#C5F1D4",
      400 => "#3CD070",
      500 => "#30A65A",
      600 => "#247D43",
    },
    chart_colors: ['#FFB435', "#FFA102", "#CC8102", '#FFB435', "#FFA102", "#CC8102"],
    logo: "/avo-assets/logo.png",
    logomark: "/avo-assets/logomark.png",
    placeholder: "/avo-assets/placeholder.svg",
    favicon: "/avo-assets/favicon.ico"
  }
end
```

Using the branding feature, you can easily change the look of your app. You tweak it inside your `avo.rb` initializer in the `branding` attribute. It takes a hash with a few properties.

## Configure brand color

To customize the primary color of Avo, you must configure the `colors` key with four color variants. `100` for color hints, `500` for the base primary color, and `400` and `600` values for highlights.

```ruby{4-8}
Avo.configure do |config|
  config.branding = {
    colors: {
      background: "248 246 242",
      100 => "#C5F1D4",
      400 => "#3CD070",
      500 => "#30A65A",
      600 => "#247D43",
    }
  }
end
```

You may also customize the color of Avo's background using the `background` key.

![](/assets/img/branding/green.jpg)

![](/assets/img/branding/red.jpg)

![](/assets/img/branding/orange.jpg)

:::info
The color format can be hex (starting with `#`) or rgb (three groups split by a space, not a comma).
:::


Avo uses [Tailwinds color system](https://tailwindcss.com/docs/customizing-colors). You can generate your own using the tools below.

 - [Palettte](https://palettte.app/)
 - [ColorBox](https://colorbox.io/)
 - [TailwindInk](https://tailwind.ink/)

Here are a few for you to choose from.

```ruby
config.branding = {
  colors: {
    # BLUE
    100 => "#CEE7F8",
    400 => "#399EE5",
    500 => "#0886DE",
    600 => "#066BB2",
    # RED
    100 => "#FACDD4",
    400 => "#F06A7D",
    500 => "#EB3851",
    600 => "#E60626",
    # GREEN
    100 => "#C5F1D4",
    400 => "#3CD070",
    500 => "#30A65A",
    600 => "#247D43",
    # ORANGE
    100 => "#FFECCC",
    400 => "#FFB435",
    500 => "#FFA102",
    600 => "#CC8102",
  }
}
```

## Customize the chart colors

For your dashboard, you can further customize the colors of the charts. You can do that using the `chart_colors` option. Pass in an array of colors, and Avo will do the rest.

```ruby
Avo.configure do |config|
  config.branding = {
    chart_colors: ['#FFB435', "#FFA102", "#CC8102", '#FFB435', "#FFA102", "#CC8102"],
  }
end
```

![](/assets/img/branding/chart-colors.jpg)

:::warning
The chart colors should be hex colors. They are forwarded to chart.js
:::

## Customize the logo

We want to make it easy to change the logo for your app, so we added the `logo` and `logomark` options to the branding feature.

The `logo` should be the "big" logo you want to display on the desktop version of your app, and `logomark` should be a squared-aspect image that Avo displays on the mobile version.

![](/assets/img/branding/logomark.gif)

## Customize the missing image placeholder

When you view the data in the <Index /> view in a grid, when the `cover` field does not have an image, an avocado is going to be displayed instead as a placeholder.

You might want to change that to something else using the `placeholder` option.

```ruby
Avo.configure do |config|
  config.branding = {
    placeholder: "/YOUR_PLACEHOLDER_IMAGE.jpg",
  }
end
```

## Customize the favicon

We want to make it easy to change the logo for your app, so we added the `favicon` option to the branding feature.
Overwrite it using an `.ico` file.


# Cache

Avo uses the application's cache system to enhance performance. The cache system is especially beneficial when dealing with resource index tables and license requests.

## Cache store selection

The cache system dynamically selects the appropriate cache store based on the application's environment:

### Production

In production, if the existing cache store is one of the following: `ActiveSupport::Cache::MemoryStore` or `ActiveSupport::Cache::NullStore` it will use the default `:file_store` with a cache path of `tmp/cache`. Otherwise, the existing cache store `Rails.cache` will be used.

### Test

In testing, it directly uses the `Rails.cache` store.

### Development and other environments

In all other environments the `:memory_store` is used.

### Custom selection

There is the possibility to force the usage of a custom cache store into Avo.

```ruby
# config/initializers/avo.rb
config.cache_store = -> {
  ActiveSupport::Cache.lookup_store(:solid_cache_store)
}

# or

config.cache_store = ActiveSupport::Cache.lookup_store(:solid_cache_store)
```

`cache_store` configuration option is expecting a cache store object, the lambda syntax can be useful if different stores are desired on different environments.

:::warning MemoryStore in production
Our computed system do not use MemoryStore in production because it will not be shared between multiple processes (when using Puma).
:::

## Solid Cache

Avo seamlessly integrates with [Solid Cache](https://github.com/rails/solid_cache). To setup Solid Cache follow these essential steps

Add this line to your application's Gemfile:

```ruby
gem "solid_cache"
```

And then execute:
```bash
$ bundle
```

Or install it yourself as:
```bash
$ gem install solid_cache
```

Add the migration to your app:

```bash
$ bin/rails solid_cache:install:migrations
```

Then run it:
```bash
$ bin/rails db:migrate
```

To set Solid Cache as your Rails cache, you should add this to your environment config:

```ruby
config.cache_store = :solid_cache_store
```

Check [Solid Cache repository](https://github.com/rails/solid_cache) for additional valuable information.


---
feedbackId: 839
version: unreleased
license: pro
---

# Cards

Cards are one way of quickly adding custom content for your users.

Cards can be used on dashboards or resources, we'll refer to both of them as "parent" since they're hosting the cards.

You can add three types of cards to your parent: `partial`, `metric`, and `chartkick`.

## Base settings

All cards have some standard settings like `id`, which must be unique, `label` and `description`. The `label` will be the title of your card, and `description` will show a tiny question mark icon on the bottom right with a tooltip with that description.

Each card has its own `cols` and `rows` settings to control the width and height of the card inside the parent's grid. They can have values from `1` to `6`.

```ruby{2-7}
class Avo::Cards::UsersMetric < Avo::Cards::MetricCard
  self.id = 'users_metric'
  self.label = 'Users count'
  self.description = 'Users description'
  self.cols = 1
  self.rows = 1
  self.display_header = true
end
```

<img :src="('/assets/img/dashboards/users_metric.jpg')" alt="Avo Metric Card" class="border mb-4" />

## Ranges
#### Control the aggregation using ranges

You may also want to give the user the ability to query data in different ranges. You can control what's passed in the dropdown using the' ranges' attribute. The array passed here will be parsed and displayed on the card. All integers are transformed to days, and other string variables will be passed as they are.

You can also set a default range using the `initial_range` attribute.

The ranges have been changed a bit since **version 2.8**. The parameter you pass to the `range` option will be directly passed to the [`options_for_select`](https://apidock.com/rails/v5.2.3/ActionView/Helpers/FormOptionsHelper/options_for_select) helper, so it behaves more like a regular `select_tag`.

```ruby{4-15}
class Avo::Cards::UsersMetric < Avo::Cards::MetricCard
  self.id = 'users_metric'
  self.label = 'Users count'
  self.initial_range = 30
  self.ranges = {
    "7 days": 7,
    "30 days": 30,
    "60 days": 60,
    "365 days": 365,
    Today: "TODAY",
    "Month to date": "MTD",
    "Quarter to date": "QTD",
    "Year to date": "YTD",
    All: "ALL"
  }
end
```

## Keep the data fresh

If the parent is something that you keep on the big screen, you need to keep the data fresh at all times. That's easy using `refresh_every`. You pass the number of seconds you need to be refreshed and forget about it. Avo will do it for you.

```ruby{3}
class Avo::Cards::UsersMetric < Avo::Cards::MetricCard
  self.id = 'users_metric'
  self.refresh_every = 10.minutes
end
```

## Hide the header

In cases where you need to embed some content that should fill the whole card (like a map, for example), you can choose to hide the label and ranges dropdown.

```ruby{3}
class Avo::Cards::UsersMetric < Avo::Cards::MetricCard
  self.id = 'users_metric'
  self.display_header = false
end
```
<img :src="('/assets/img/dashboards/map_card.jpg')" alt="Avo Map card" class="border mb-4" />

## Format

Option `self.format` is useful when you want to format the data that `result` returns from `query`.

Example without format:

```ruby
class Avo::Cards::AmountRaised < Avo::Cards::MetricCard
  self.id = "amount_raised"
  self.label = "Amount raised"
  self.prefix = "$"

  def query
    result 9001
  end
end
```

![amount raised without format](/assets/img/3_0/cards/amount_raised_without_format.png)


Example with format:

```ruby
class Avo::Cards::AmountRaised < Avo::Cards::MetricCard
  self.id = "amount_raised"
  self.label = "Amount raised"
  self.prefix = "$"
  self.format = -> {
    number_to_social value, start_at: 1_000
  }

  def query
    result 9001
  end
end
```

![amount raised with format](/assets/img/3_0/cards/amount_raised_with_format.png)

## Metric card

The metric card is your friend when you only need to display a simple big number. To generate one run `bin/rails g avo:card users_metric --type metric`.

<img :src="('/assets/img/dashboards/users_metric.jpg')" alt="Avo Metric" class="border mb-4" />

#### Calculate results

To calculate your result, you may use the `query` method. After you make the query, use the `result` method to store the value displayed on the card.

In the `query` method you have access to a few variables like `context` (the [App context](./customization#context)), `params` (the request params), `range` (the range that was requested), `dashboard`, `resource` or `parent` (the current dashboard or resource the card is on), and current `card`.

```ruby{23-47,36}
class Avo::Cards::UsersMetric < Avo::Cards::MetricCard
  self.id = 'users_metric'
  self.label = 'Users count'
  self.description = 'Some tiny description'
  self.cols = 1
  # self.rows = 1
  # self.initial_range = 30
  # self.ranges = {
  #   "7 days": 7,
  #   "30 days": 30,
  #   "60 days": 60,
  #   "365 days": 365,
  #   Today: "TODAY",
  #   "Month to date": "MTD",
  #   "Quarter to date": "QTD",
  #   "Year to date": "YTD",
  #   All: "ALL",
  # }
  # self.prefix = '$'
  # self.suffix = '%'
  # self.refresh_every = 10.minutes

  def query
    from = Date.today.midnight - 1.week
    to = DateTime.current

    if range.present?
      if range.to_s == range.to_i.to_s
        from = DateTime.current - range.to_i.days
      else
        case range
        when 'TODAY'
          from = DateTime.current.beginning_of_day
        when 'MTD'
          from = DateTime.current.beginning_of_month
        when 'QTD'
          from = DateTime.current.beginning_of_quarter
        when 'YTD'
          from = DateTime.current.beginning_of_year
        when 'ALL'
          from = Time.at(0)
        end
      end
    end

    result User.where(created_at: from..to).count
  end
end
```

### Decorate the data using `prefix` and `suffix`

Some metrics might want to add a `prefix` or a `suffix` to display the data better.

```ruby{3,4}
class Avo::Cards::UsersMetric < Avo::Cards::MetricCard
  self.id = 'users_metric'
  self.prefix = '$'
  self.suffix = '%'
end
```

<img :src="('/assets/img/dashboards/prefix-suffix.jpg')" alt="Avo Prefix & suffix" class="border mb-4" />

## Chartkick card

A picture is worth a thousand words. So maybe a chart a hundred? Who knows? But creating charts in Avo is very easy with the help of the [chartkick](https://github.com/ankane/chartkick) gem.

You start by running `bin/rails g avo:card users_chart --type chartkick`.

```ruby
class Avo::Cards::UserSignups < Avo::Cards::ChartkickCard
  self.id = 'user_signups'
  self.label = 'User signups'
  self.chart_type = :area_chart
  self.description = 'Some tiny description'
  self.cols = 2
  # self.rows = 1
  # self.chart_options = { library: { plugins: { legend: { display: true } } } }
  # self.flush = true
  # self.legend = false
  # self.scale = false
  # self.legend_on_left = false
  # self.legend_on_right = false

  def query
    points = 16
    i = Time.new.year.to_i - points
    base_data =
      Array
        .new(points)
        .map do
          i += 1
          [i.to_s, rand(0..20)]
        end
        .to_h

    data = [
      { name: 'batch 1', data: base_data.map { |k, v| [k, rand(0..20)] }.to_h },
      { name: 'batch 2', data: base_data.map { |k, v| [k, rand(0..40)] }.to_h },
      { name: 'batch 3', data: base_data.map { |k, v| [k, rand(0..10)] }.to_h }
    ]

    result data
  end
end
```

<img :src="('/assets/img/dashboards/chartkick.jpg')" alt="Chartkick card" class="border mb-4" />

### Chart types

Using the `self.chart_type` class attribute you can change the type of the chart. Supported types are `line_chart`, `pie_chart`, `column_chart`, `bar_chart`, `area_chart`, and `scatter_chart`.

### Customize chart

Because the charts are being rendered with padding initially, we offset that before rendering to make the chart look good on the card. To disable that, you can set `self.flush = false`. That will set the chart loose for you to customize further.

After you set `flush` to `false`, you can add/remove the `scale` and `legend`. You can also place the legend on the left or right using `legend_on_left` and `legend_on_right`.

These are just some of the predefined options we provide out of the box, but you can send different [chartkick options](https://github.com/ankane/chartkick#options) to the chart using `chart_options`.

If you'd like to use [Groupdate](https://github.com/ankane/groupdate), [Hightop](https://github.com/ankane/hightop), and [ActiveMedian](https://github.com/ankane/active_median) you should require them in your `Gemfile`. Only `chartkick` is required by default.

`chart.js` is supported for the time being. So if you need support for other types, please reach out or post a PR (🙏 PRs are much appreciated).

## Partial card

You can use a partial card to add custom content to a card. Generate one by running `bin/rails g avo:card custom_card --type partial`. That will create the card class and the partial for it.

```ruby{5}
class Avo::Cards::ExampleCustomPartial < Avo::Cards::PartialCard
  self.id = "users_custom_card"
  self.cols = 1
  self.rows = 4
  self.partial = "avo/cards/custom_card"
  # self.display_header = true
end
```
<img :src="('/assets/img/dashboards/custom_partial_card.jpg')" alt="Custom partial card" class="border mb-4" />

You can embed a piece of content from another app using an iframe. You can hide the header using the `self.display_header = false` option. That will render the embedded content flush to the container.

```ruby{5}
# app/avo/cards/map_card.rb
class Avo::Cards::MapCard < Avo::Cards::PartialCard
  self.id = "map_card"
  self.label = "Map card"
  self.partial = "avo/cards/map_card"
  self.display_header = false
  self.cols = 2
  self.rows = 4
end
```

```html
<!-- app/views/avo/cards/_map_card.html.erb -->
<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d17991.835132857846!2d-73.98926852562143!3d40.742050491245955!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sro!4v1647079626880!5m2!1sen!2sro" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
```

<img :src="('/assets/img/dashboards/map_card.jpg')" alt="Avo Map card" class="border mb-4" />

## Cards visibility

<VersionReq version="2.28" />

It's common to show the same card to multiple types of users (admins, regular users). In that scenario you might want to hide some cards for the regular users and show them just to the admins.

You can use the `visible` option to do that. It can be a `boolean` or a `block` where you can access the `params`, `current_user`, `context`, `parent`, and `card` object.

```ruby{4-11}
class Avo::Cards::UsersCount < Avo::Cards::MetricCard
  self.id = "users_metric"
  self.label = "Users count"
  self.visible = -> do
    # You have access to:
    # context
    # params
    # parent (the current dashboard or resource)
    # dashboard (will be nil when parent is resource)
    # resource (will be nil when parent is dashboard)
    # current card
    true
  end

  def query
    result User.count
  end
end
```

You may also control the visibility from the parent class.

:::code-group
```ruby [On Dashboards]
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  def cards
    card Avo::Cards::UsersCount, visible: -> { true }
  end
end
```

```ruby [On Resources]
class Avo::Resources::User < Avo::BaseResource
  def cards
    card Avo::Cards::UsersCount, visible: -> { true }
  end
end
```
:::

## Dividers

You may want to separate the cards. You can use dividers to do that.

:::code-group
```ruby [On Dashboards]
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  def cards
    card Avo::Cards::ExampleColumnChart
    card Avo::Cards::ExamplePieChart
    card Avo::Cards::ExampleBarChart
    divider label: "Custom partials"
    card Avo::Cards::ExampleCustomPartial
    card Avo::Cards::MapCard
  end
end
```
```ruby [On Resources]
class Avo::Resources::User < Avo::BaseResource
  def cards
    card Avo::Cards::ExampleColumnChart
    card Avo::Cards::ExamplePieChart
    card Avo::Cards::ExampleBarChart
    divider label: "Custom partials"
    card Avo::Cards::ExampleCustomPartial
    card Avo::Cards::MapCard
  end
end
```
:::

<img :src="('/assets/img/dashboards/divider.jpg')" alt="Avo Dashboard Divider" class="border mb-4" />

Dividers can be a simple line between your cards or have some text on them that you control using the `label` option.
When you don't want to show the line, you can enable the `invisible` option, which adds the divider but does not display a border or label.


## Dividers visibility

<VersionReq version="2.28" />

You might want to conditionally show/hide a divider based on a few factors. You can do that using the `visible` option.

```ruby
divider label: "Custom partials", visible: -> {
  # You have access to:
  # context
  # params
  # parent (the current dashboard or resource)
  # dashboard (will be nil when parent is resource)
  # resource (will be nil when parent is dashboard)
  true
}
```


:::option `attach_scope`
Scope out the records the user sees on the Attach modal.

#### Default

`nil`

#### Possible values

```ruby{3}
field :user,
  as: :belongs_to,
  attach_scope: -> { query.non_admins }
```

Pass in a block where you attach scopes to the `query` object. The block is executed in the [`ExecutionContext`](./../execution-context).
:::


:::option `description`
Changes the text displayed under the association name.

![](/assets/img/associations/description-option.jpg)

#### Default

`nil`

#### Possible values

Any string.
:::


:::option `discreet_pagination`
Hides the pagination details when only there's only one page for that association.

#### Default

`false`

#### Possible values

`true`, `false`
:::


:::option `hide_search_input`
Hides the search input displayed on the association table.

#### Default

`false`. When nothing is selected and the `search_query` of association's resource is configured, Avo displays the search input.

#### Possible values

`true`, `false`.
:::


:::option `link_to_child_resource`

Sets which resource should be used in an STI scenario.

See more on this in the [STI section](./../associations#link-to-child-resource-when-using-sti).

#### Default

`false`. When it's `false` it will use the same resource.

#### Possible values

`true`, `false`.
:::


:::option `scope`
Scope out the records displayed in the table.

#### Default

`nil`

#### Possible values

```ruby{3}
field :user,
  as: :belongs_to,
  scope: -> { query.approved }
```

Pass in a block where you attach scopes to the `query` object. The block gets executed in the [`ExecutionContext`](./../execution-context).
:::


::::option `searchable`

<div class="space-x-2">
  <LicenseReq license="pro" />
  <DemoVideo demo-video="https://youtu.be/KLI_sVTPX-Q" />
</div>

Turns the attach field/modal from a `select` input to a searchable experience

```ruby{5}
class Avo::Resources::CourseLink < Avo::BaseResource
  def fields
    field :links,
      as: :has_many,
      searchable: true
  end
end
```

:::warning
  Avo uses the **search feature** behind the scenes, so **make sure the target resource has the [`search_query`](./../search) option configured**.
:::

```ruby{3-7}
# app/avo/resources/course_link.rb
class Avo::Resources::CourseLink < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(id_eq: params[:q], link_cont: params[:q], m: "or").result(distinct: false)
    }
  }
end
```

#### Default

`false`

#### Possible values

`true`, `false`
::::


:::option `use_resource`
Sets a different resource to be used when displaying (or redirecting to) the association table.

#### Default

`nil`. When nothing is selected, Avo infers the resource type from the reflected association.

#### Possible values

`Avo::Resources::Post`, `Avo::Resources::PhotoComment`, or any Avo resource class.
:::


```ruby
# Add one of the following in your Gemfile depending on the tier you are on.

# Avo Community
gem "avo", ">= 3.2.1"

# Avo Pro
gem "avo", ">= 3.2.1"
gem "avo-pro", ">= 3.2.0", source: "https://packager.dev/avo-hq/"

# Avo Advanced
gem "avo", ">= 3.2.1"
gem "avo-advanced", ">= 3.2.0", source: "https://packager.dev/avo-hq/"
```


:::option `first_day_of_week`
Set which should be the first date of the week in the picker calendar. Flatpickr [documentation](https://flatpickr.js.org/localization/) on that. 1 is Monday, and 7 is Sunday.

#### Default value

`1`

#### Possible values

`1`, `2`, `3`, `4`, `5`, `6`, and `7`
:::

:::option `disable_mobile`
By default, flatpickr is [disabled on mobile](https://flatpickr.js.org/mobile-support/) because the mobile date pickers tend to give a better experience, but you can override that using `disable_mobile: true` (misleading to set it to `true`, I know. We're just forwarding the option). So that will override that behavior and display flatpickr on mobile devices too.

#### Default value

`false`

#### Possible values

`true`, `false`
:::


#### Default

`false`

#### Possible values

`true`, `false`

#### Default

`true`

#### Possible values

`true`, `false`

:::option `accept`
Instructs the input to accept only a particular file type for that input using the `accept` option.

```ruby
field :cover_video, as: :file, accept: "image/*"
```

#### Default

`nil`

#### Possible values

`image/*`, `audio/*`, `doc/*`, or any other types from [the spec](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept).
:::

:::option `direct_upload`
<LicenseReq license="pro" />

If you have large files and don't want to overload the server with uploads, you can use the `direct_upload` feature, which will upload the file directly to your cloud provider.

```ruby
field :cover_video, as: :file, direct_upload: true
```

<!-- @include: ./default_boolean_false.md -->
:::

:::option `display_filename`
Option that specify if the file should have the caption present or not.

```ruby
field :cover_video, as: :file, display_filename: false
```

#### Default

`true`

#### Possible values

`true`, `false`
:::


## Authorization

:::info
Please ensure you have the `upload_{FIELD_ID}?`, `delete_{FIELD_ID}?`, and `download_{FIELD_ID}?` methods set on your model's **Pundit** policy. Otherwise, the input and download/delete buttons will be hidden.
:::

Related:
 - [Attachment pundit policies](./../authorization.html#attachments)

<!-- ## Deprecated options

The `is_image`, `is_audio`, and `is_video` options are deprecated in favor of letting Active Storage figure out the type of the attachment. If Active Storage detects a file as an image, Avo will display it as an image. Same for audio and video files. -->


:::warning
You must manually require `activestorage` and `image_processing` gems in your `Gemfile`.

```ruby
# Active Storage makes it simple to upload and reference files
gem "activestorage"

# High-level image processing wrapper for libvips and ImageMagick/GraphicsMagick
gem "image_processing"
```
:::


:::option `link_to_record`
Wraps the content into an anchor that links to the resource.
:::


## Add scopes to associations

<DemoVideo demo-video="https://youtu.be/3ee9iq2CnzA" />

When displaying `has_many` associations, you might want to scope out some associated records. For example, a user might have multiple comments, but on the user's `Show` page, you don't want to display all the comments, but only the approved ones.

```ruby{5,16,22}
# app/models/comment.rb
class Comment < ApplicationRecord
  belongs_to :user, optional: true

  scope :approved, -> { where(approved: true) }
end

# app/models/user.rb
class User < ApplicationRecord
  has_many :comments
end

# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :comments, as: :has_many, scope: -> { query.approved }
  end
end
```

The `comments` query on the user `Index` page will have the `approved` scope attached.

<img :src="('/assets/img/associations/scope.jpg')" alt="Association scope" class="border mb-4" />

With version 2.5.0, you'll also have access to the `parent` record so that you can use that to scope your associated models even better.

All the `has_many` associations have the [`attach_scope`](./../associations/belongs_to#attach-scope) option available too.


## Search query scope

<VersionReq version="2.13" />

If the resource used for the `has_many` association has the `search` block configured with a `query`, Avo will use that to scope out the search query to that association.

For example, if you have a `Team` model that `has_many` `User`s, now you'll be able to search through that team's users instead of all of them.

You can target that search using `params[:via_association]`. When the value of `params[:via_association]` is `has_many`, the search has been mad inside a has_many association.

For example, if you want to show the records in a different order, you can do this:

```ruby
self.search = {
  query: -> {
    if params[:via_association] == 'has_many'
      query.ransack(id_eq: params[:q], m: "or").result(distinct: false).order(name: :asc)
    else
      query.ransack(id_eq: params[:q], m: "or").result(distinct: false)
    end
  }
}
```


## Show/hide buttons

You will want to control the visibility of the attach/detach/create/destroy/actions buttons visible throughout your app. You can use the policy methods to do that.

Find out more on the [authorization](./../authorization#associations) page.

<img :src="('/assets/img/associations/authorization.jpg')" alt="Associations authorization" class="border mb-4" />


## Show on edit screens

By default, `has_and_belongs_to_many` is only visible on the `Show` page. If you want to enable it on the `Edit` page, too, you need to add the `show_on: :edit` option.

:::warning
  Adding associations on the `New` screen is not currently supported. The association needs some information from the parent record that hasn't been created yet (because the user is on the `New` screen).
:::

You may use the [redirect helpers](./../resources#customize-what-happens-after-record-is-created-edited) to have the following flow:

1. User is on the `New` view. They can't see the association panels yet.
1. User creates the record.
1. They get redirected to the `Show`/`Edit` view, where they can see the association panels.
1. User attaches associations.


<SponsorGroup title="Business Sponsors">
  <Sponsor :blank="true" />
  <Sponsor
    href="https://www.equipetechnique.com?ref=avo"
    title="Equipe Technique – 10+ years seniority in software services ready to serve"
    src="/img/sponsors/ET-dark.jpeg"
    alt="Equipe Technique"
  />
  <Sponsor :blank="true" />
</SponsorGroup>

<SponsorGroup title="Startup Sponsors">
  <Sponsor :blank="true" />
  <Sponsor
    href="https://www.wyndy.com/?ref=avo"
    title="Wyndy – Get a sitter in seconds. Post any job for free."
    src="/img/sponsors/wyndy.png"
    alt="Wyndy"
  />
  <Sponsor :blank="true" />
</SponsorGroup>


---
version: '2.14'
demoVideo: https://youtu.be/peKt90XhdOg?t=11
---

# Resource controllers

In order to benefit from Rails' amazing REST architecture, Avo generates a controller alongside every resource.
Generally speaking you don't need to touch those controllers. Everything just works out of the box with configurations added to the resource file.

However, sometimes you might need more granular control about what is happening in the controller actions or their callbacks. In that scenario you may take over and override that behavior.

## Request-Response lifecycle

Each interaction with the CRUD UI results in a request - response cycle. That cycle passes through the `BaseController`. Each auto-generated controller for your resource inherits from `ResourcesController`, which inherits from `BaseController`.

```ruby
class Avo::CoursesController < Avo::ResourcesController
end
```

In order to make your controllers more flexible, there are several overridable methods similar to how [devise](https://github.com/heartcombo/devise#controller-filters-and-helpers:~:text=You%20can%20also%20override%20after_sign_in_path_for%20and%20after_sign_out_path_for%20to%20customize%20your%20redirect%20hooks) overrides `after_sign_in_path_for` and `after_sign_out_path_for`.

## Create methods
For the `create` method, you can modify the `after_create_path`, the messages, and the actions both on success or failure.

:::option `after_create_path`
Overriding this method, you can tell Avo what path to follow after a record was created with success.

```ruby
def after_create_path
  "/avo/resources/users"
end
```
:::

:::option `create_success_action`
Override this method to create a custom response when a record was created with success.

```ruby
def create_success_action
  respond_to do |format|
    format.html { redirect_to after_create_path, notice: create_success_message}
  end
end
```
:::

:::option `create_fail_action`
Override this method to create a custom response when a record failed to be created.

```ruby
def create_fail_action
  respond_to do |format|
    flash.now[:error] = create_fail_message
    format.html { render :new, status: :unprocessable_entity }
  end
end
```
:::

:::option `create_success_message`
Override this method to change the message the user receives when a record was created with success.

```ruby
def create_success_message
  "#{@resource.name} #{t("avo.was_successfully_created")}."
end
```
:::

:::option `create_fail_message`
Override this method to change the message the user receives when a record failed to be created.

```ruby
def create_fail_message
  t "avo.you_missed_something_check_form"
end
```
:::

## Update methods
For the `update` method, you can modify the `after_update_path`, the messages, and the actions both on success or failure.

:::option `after_update_path`
Overriding this method, you can tell Avo what path to follow after a record was updated with success.

```ruby
def after_update_path
  "/avo/resources/users"
end
```
:::

:::option `update_success_action`
Override this method to create a custom response when a record was updated with success.

```ruby
def update_success_action
  respond_to do |format|
    format.html { redirect_to after_update_path, notice: update_success_message }
  end
end
```
:::

:::option `update_fail_action`
Override this method to create a custom response when a record failed to be updated.

```ruby
def update_fail_action
  respond_to do |format|
    flash.now[:error] = update_fail_message
    format.html { render :edit, status: :unprocessable_entity }
  end
end
```
:::

:::option `update_success_message`
Override this method to change the message the user receives when a record was updated with success.

```ruby
def update_success_message
  "#{@resource.name} #{t("avo.was_successfully_updated")}."
end
```
:::

:::option `update_fail_message`
Override this method to change the message the user receives when a record failed to be updated.

```ruby
def update_fail_message
  t "avo.you_missed_something_check_form"
end
```
:::

## Destroy methods
For the `destroy` method, you can modify the `after_destroy_path`, the messages, and the actions both on success or failure.

:::option `after_destroy_path`
Overriding this method, you can tell Avo what path to follow after a record was destroyed with success.

```ruby
def after_update_path
  "/avo/resources/users"
end
```
:::

:::option `destroy_success_action`
Override this method to create a custom response when a record was destroyed with success.

```ruby
def destroy_success_action
  respond_to do |format|
    format.html { redirect_to after_destroy_path, notice: destroy_success_message }
  end
end
```
:::

:::option `destroy_fail_action`
Override this method to create a custom response when a record failed to be destroyed.

```ruby
def destroy_fail_action
  respond_to do |format|
    format.html { redirect_back fallback_location: params[:referrer] || resources_path(resource: @resource, turbo_frame: params[:turbo_frame], view_type: params[:view_type]), error: destroy_fail_message }
  end
end
```
:::

:::option `destroy_success_message`
Override this method to change the message the user receives when a record was destroyed with success.

```ruby
def destroy_success_message
  t("avo.resource_destroyed", attachment_class: @attachment_class)
end
```
:::

:::option `destroy_fail_message`
Override this method to change the message the user receives when a record failed to be destroyed.

```ruby
def destroy_fail_message
  @errors.present? ? @errors.join(". ") : t("avo.failed")
end
```
:::




---
feedbackId: 943
demoVideo: https://youtu.be/0NForGDgk50
---

# Custom asset pipeline

Avo plays well with most Rails asset pipelines.

| Asset pipeline | Avo compatibility |
|---------------|------------|
| [importmap](https://github.com/rails/importmap-rails) | ✅ Fully supported |
| [Propshaft](https://github.com/rails/propshaft)       | ✅ Fully supported |
| [Sprockets](https://github.com/rails/sprockets)       | ✅ Fully supported |
| [Webpacker](https://github.com/rails/webpacker)       | 🛻 Only with Sprockets or Propshaft |

There are two things we need to mention when communicating about assets.

1. Avo's assets
2. You custom assets

## Avo's assets

We chose to impact your app, and your deploy processes as little as possible. That's why we bundle up Avo's assets when we publish on [rubygems](https://rubygems.org/gems/avo), so you don't have to do anything else when you deploy your app. Avo doesn't require a NodeJS, or any kind of any other special environment in your deploy process.

Under the hood Avo uses TailwindCSS 3.0 with the JIT engine and bundles the assets using [`jsbundling`](https://github.com/rails/jsbundling-rails) with `esbuild`.

## Your custom assets

Avo makes it easy to use your own styles and javascript through your already set up asset pipeline. It just hooks on to it to inject the new assets to be used in Avo.

## Use TailwindCSS utility classes

Please follow the dedicated [TailwindCSS integration guide](./tailwindcss-integration.html).

## Add custom JS code and Stimulus controllers

There are more ways of dealing with JS assets, and Avo handles that well.

## Use Importmap to add your assets

Importmap has become the default way of dealing with assets in Rails 7. For you to start using custom JS assets with Avo and importmap you should run this install command `bin/rails generate avo:js:install`. That will:

- create your `avo.custom.js` file as your JS entrypoint;
- add it to the `app/views/avo/partials/_head.html.erb` partial so Avo knows to load it;
- pin it in your `importmap.rb` file so `importmap-rails` knows to pick it up.

## Use `js-bundling` with `esbuild`

`js-bundling` gives you a bit more flexibility and power when it comes to assets. We use that under the hood and we'll use it to expose your custom JS assets.

When you install `js-bundling` with `esbuild` you get this npm script `"build": esbuild app/javascript/*.* --bundle --sourcemap --outdir=app/assets/builds --public-path=assets`. That script will take all your JS entrypoint files under `app/javascript` and bundle them under `assets/builds`.

```bash
bin/rails generate avo:js:install --bundler esbuild
```

That command will:

- eject the `_head.html.erb` file;
- add the `avo.custom.js` asset to it;
- create the `avo.custom.js` file under `app/javascript` which will be your entrypoint.

That will be picked up by the `build` script and create it's own `assets/builds/avo.custom.js` file that will, in turn, be picked up by sprockets or propshaft and loaded into your app.

## Use `js-bundling` with `rollup` or `webpack`

Avo supports the other bundlers too but we just don't have a generator command to configure them for you. If you use the other bundlers and have configured them to use custom assets, then please [open up a PR](https://github.com/avo-hq/avo) and help the community get started faster.

## Manually add your CSS and JS assets

In order to manually add your assets you have to eject the `_pre_head.html.erb` partial (`bin/rails generate avo:eject --partial :pre_head`), create the asset files (examples below), and add the asset files from your pipeline to the `_pre_head` partial. Then, your asset pipeline will pick up those assets and use add them to your app.

:::warning
You should add your custom styles to `_pre_head.html.erb`, versus `_head.html.erb` to avoid overriding Avo's default styles. This

The order in which Avo loads the partials and asset files is this one:

1. `_pre_head.html.erb`
2. Avo's CSS and JS assets
3. `_head.html.erb`
:::

![Avo and the asset pipeline](/assets/img/asset-pipeline.jpg)

### Sprockets and Propshaft

Create `avo.custom.js` and `avo.custom.css` inside `app/assets/javascripts` and `app/assets/stylesheets` with the desired scripts and styles.
Then add them to Avo using the `_pre_head.html.erb` partial (`rails generate avo:eject --partial :pre_head`).

```erb
# app/views/avo/partials/_pre_head.html.erb

<%= javascript_include_tag 'avo.custom', defer: true %>
<%= stylesheet_link_tag 'avo.custom', media: 'all' %>
```

:::warning
Please ensure that when using `javascript_include_tag` you add the `defer: true` option so the browser will use the same loading strategy as Avo's and the javascript files are loaded in the right order.
:::

### Webpacker

:::warning
We removed support for webpacker. In order to use Avo with your assets you must install Sprockets or Propshaft in order to serve assets like SVG, CSS, or JS files.
:::

:::info
Instructions below are for Webpacker version 6. Version 5 has different paths (`app/javascript/packs`).
:::

Create `avo.custom.js` and `avo.custom.css` inside `app/packs/entrypoints` with the desired scripts and styles.
Then add them to Avo using the `_pre_head.html.erb` partial (`rails generate avo:eject --partial :pre_head`).

```erb
# app/views/avo/partials/_pre_head.html.erb

<%= javascript_pack_tag 'avo.custom', defer: true %>
<%= stylesheet_pack_tag 'avo.custom', media: 'all' %>
```


---
feedbackId: 836
license: pro
---

# Custom fields

Avo ships with 20+ well polished and ready to be used, fields out of the box.

When you need a field that is not provided by default, Avo makes it easy to add it.

## Generate a new field

Every new field comes with three [view components](https://viewcomponent.org/), `Edit` (which is also used in the `New` view), and `Show` and `Index`. There's also a `Field` configuration file.

`bin/rails generate avo:field progress_bar` generates the files for you.

:::info
Please restart your rails server after adding a new custom field.
:::

```bash{2-9}
▶ bin/rails generate avo:field progress_bar
      create  app/components/avo/fields/progress_bar_field
      create  app/components/avo/fields/progress_bar_field/edit_component.html.erb
      create  app/components/avo/fields/progress_bar_field/edit_component.rb
      create  app/components/avo/fields/progress_bar_field/index_component.html.erb
      create  app/components/avo/fields/progress_bar_field/index_component.rb
      create  app/components/avo/fields/progress_bar_field/show_component.html.erb
      create  app/components/avo/fields/progress_bar_field/show_component.rb
      create  app/avo/fields/progress_bar_field.rb
```

The `ProgressBarField` file is what registers the field in your admin.

```ruby
class Avo::Fields::ProgressBarField < Avo::Fields::BaseField
  def initialize(name, **args, &block)
    super(name, **args, &block)
  end
end
```

Now you can use your field like so:

```ruby{7}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_record: true
    field :progress, as: :progress_bar
  end
end
```
<img :src="('/assets/img/custom-fields/progress-show.jpg')" alt="Progress custom field" class="border mb-4" />

The generated view components are basic text fields for now.

```erb{1,9,14}
# app/components/avo/fields/progress_bar_field/edit_component.html.erb
<%= edit_field_wrapper field: @field, index: @index, form: @form, resource: @resource, displayed_in_modal: @displayed_in_modal do %>
  <%= @form.text_field @field.id,
    class: helpers.input_classes('w-full', has_error: @field.model_errors.include?(@field.id)),
    placeholder: @field.placeholder,
    disabled: @field.readonly %>
<% end %>

# app/components/avo/fields/progress_bar_field/index_component.html.erb
<%= index_field_wrapper field: @field do %>
  <%= @field.value %>
<% end %>

# app/components/avo/fields/progress_bar_field/show_component.html.erb
<%= show_field_wrapper field: @field, index: @index do %>
  <%= @field.value %>
<% end %>
```

You can customize them and add as much or as little content as needed. More on customization [below](#customize-the-views).

:::option Use existent field template
There may be times when you want to duplicate an existing field and start from there.

To achieve this behavior, use the `--field_template` argument and pass the original field as a value.

Now, all components will have the exact same code (except the name) as the original field.

```bash
$ bin/rails generate avo:field super_text --field_template text
      create  app/components/avo/fields/super_text_field
      create  app/components/avo/fields/super_text_field/edit_component.html.erb
      create  app/components/avo/fields/super_text_field/edit_component.rb
      create  app/components/avo/fields/super_text_field/index_component.html.erb
      create  app/components/avo/fields/super_text_field/index_component.rb
      create  app/components/avo/fields/super_text_field/show_component.html.erb
      create  app/components/avo/fields/super_text_field/show_component.rb
      create  app/avo/fields/super_text_field.rb
```

We can verify that all components have the text field code. From here there are endless possibilities to extend the original field features.

```ruby
# app/avo/fields/super_text_field.rb
module Avo
  module Fields
    class SuperTextField < BaseField
      attr_reader :link_to_record
      attr_reader :as_html
      attr_reader :protocol

      def initialize(id, **args, &block)
        super(id, **args, &block)

        add_boolean_prop args, :link_to_record
        add_boolean_prop args, :as_html
        add_string_prop args, :protocol
      end
    end
  end
end

# lib/avo/fields/text_field.rb
module Avo
  module Fields
    class TextField < BaseField
      attr_reader :link_to_record
      attr_reader :as_html
      attr_reader :protocol

      def initialize(id, **args, &block)
        super(id, **args, &block)

        add_boolean_prop args, :link_to_record
        add_boolean_prop args, :as_html
        add_string_prop args, :protocol
      end
    end
  end
end
```
:::
## Field options

This file is where you may add field-specific options.

 ```ruby{3-6,11-14}
# app/avo/fields/progress_bar_field.rb
class Avo::Fields::ProgressBarField < Avo::Fields::BaseField
  attr_reader :max
  attr_reader :step
  attr_reader :display_value
  attr_reader :value_suffix

  def initialize(name, **args, &block)
    super(name, **args, &block)

    @max = 100
    @step = 1
    @display_value = false
    @value_suffix = nil
  end
end
```

The field-specific options can come from the field declaration as well.

```ruby{11-14,24}
# app/avo/fields/progress_bar_field.rb
class Avo::Fields::ProgressBarField < Avo::Fields::BaseField
  attr_reader :max
  attr_reader :step
  attr_reader :display_value
  attr_reader :value_suffix

  def initialize(name, **args, &block)
    super(name, **args, &block)

    @max = args[:max] || 100
    @step = args[:step] || 1
    @display_value = args[:display_value] || false
    @value_suffix = args[:value_suffix] || nil
  end
end

# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_record: true
    field :progress, as: :progress_bar, step: 10, display_value: true, value_suffix: "%"
  end
end
```

## Field Visibility

If you need to hide the field in some view, you can use the [visibility helpers](./field-options.html#showing-hiding-fields-on-different-views).

```ruby{16}
# app/avo/fields/progress_bar_field.rb
class Avo::Fields::ProgressBarField < Avo::Fields::BaseField
  attr_reader :max
  attr_reader :step
  attr_reader :display_value
  attr_reader :value_suffix

  def initialize(name, **args, &block)
    super(name, **args, &block)

    @max = args[:max] || 100
    @step = args[:step] || 1
    @display_value = args[:display_value] || false
    @value_suffix = args[:value_suffix] || nil

    hide_on :forms
  end
end
```

## Customize the views

No let's do something about those views. Let's add a progress bar to the `Index` and `Show` views.

```erb{1,15}
# app/components/avo/fields/progress_bar_field/show_component.html.erb
<%= show_field_wrapper field: @field, index: @index do %>
  <!-- If display_value is set to true, show the value above the progress bar -->
  <% if @field.display_value %>
    <div class="text-center text-sm font-semibold w-full leading-none mb-1">
      <!-- Add the suffix if value_suffix is set -->
      <%= @field.value %><%= @field.value_suffix if @field.value_suffix.present? %>
    </div>
  <% end %>

  <!-- Show the progress input with the settings we passed to the field. -->
  <progress max="<%= @field.max %>" value="<%= @field.value %>" class="block w-full"></progress>
<% end %>

# app/components/avo/fields/progress_bar_field/index_component.html.erb
<%= index_field_wrapper field: @field do %>
  <!-- If display_value is set to true, show the value above the progress bar -->
  <% if @field.display_value %>
    <div class="text-center text-sm font-semibold w-full leading-none mb-1">
      <!-- Add the suffix if value_suffix is set -->
      <%= @field.value %><%= @field.value_suffix if @field.value_suffix.present? %>
    </div>
  <% end %>

  <!-- Show the progress input with the settings we passed to the field. -->
  <progress max="<%= @field.max %>" value="<%= @field.value %>" class="block w-24"></progress>
<% end %>
```

<img :src="('/assets/img/custom-fields/progress-index.jpg')" alt="Progress bar custom field on index" class="border mb-4" />

For the `Edit` view, we're going to do something different. We'll implement a `range` input.

```erb{1}
# app/components/avo/fields/progress_bar_field/edit_component.html.erb
<%= edit_field_wrapper field: @field, index: @index, form: @form, resource: @resource, displayed_in_modal: @displayed_in_modal do %>
  <!-- Show the progress input with the settings we passed to the field. -->
  <% if @field.display_value %>
    <div class="text-center text-sm font-semibold w-full leading-none mb-1">
      <!-- Add the suffix if value_suffix is set -->
      <span class="js-progress-bar-value-<%= @field.id %>"><%= @field.value %></span><%= @field.value_suffix if @field.value_suffix.present? %>
    </div>
  <% end %>
  <!-- Add the range input with the settings we passed to the field -->
  <%= @form.range_field @field.id,
    class: 'w-full',
    placeholder: @field.placeholder,
    disabled: @field.readonly,
    min: 0,
    # add the field-specific options
    max: @field.max,
    step: @field.step,
    %>
<% end %>


<script>
// Get the input and value elements
var input = document.getElementById('project_progress');
// Scope the selector to the current field. You might have more than one progress field on the page.
var log = document.querySelector('.js-progress-bar-value-<%= @field.id %>');

// Add an event listener for when the input is updated
input.addEventListener('input', updateValue);

// Update the value element with the value from the input
function updateValue(e) {
  log.textContent = e.target.value;
}
</script>
```
<img :src="('/assets/img/custom-fields/progress-edit.jpg')" alt="Progress bar custom field edit" class="border mb-4" />

## Field assets

Because there isn't just one standardized way of handling assets in Rails, we decided we won't provide **asset loading** support for custom fields for now. That doesn't mean that you can't use custom assets (javascript or CSS files), but you will have to load them in your own pipeline in dedicated Avo files.

In the example above, we added javascript on the page just to demonstrate the functionality. In reality, you might add that to a stimulus controller inside your own Avo [dedicated pipeline](./custom-asset-pipeline.html) (webpacker or sprockets).

Some styles were added in the asset pipeline directly.
```css
progress {
  @apply h-2 bg-white border border-gray-400 rounded shadow-inner;
}
progress[value]::-webkit-progress-bar {
  @apply bg-white border border-gray-500 rounded shadow-inner;
}
progress[value]::-webkit-progress-value{
  @apply bg-green-600 rounded;

}
progress[value]::-moz-progress-bar {
  @apply bg-green-600 rounded appearance-none;
}
```

## Use pre-built Stimulus controllers

Avo ships with a few Stimulus controllers that help you build more dynamic fields.

### Hidden input controller

This controller allows you to hide your content and add a trigger to show it. You'll find it in the Trix field.

<img :src="('/assets/img/stimulus/hidden_input_trix.gif')" alt="Hidden input controller" class="border mb-4" />

You should add the `:always_show` `attr_reader` and `@always_show` instance variables to your field.

```ruby{3,8}
# app/avo/fields/color_picker_field.rb
class Avo::Fields::ColorPickerField < Avo::Fields::BaseField
  attr_reader :always_show

  def initialize(id, **args, &block)
    super(id, **args, &block)

    @always_show = args[:always_show] || false
    @allow_non_colors = args[:allow_non_colors]
  end
end
```

Next, in your fields `Show` component, you need to do a few things.

1. Wrap the field inside a controller tag
1. Add the trigger that will show the content.
1. Wrap the value in a div with the `hidden` class applied if the condition `@field.always_show` is `false`.
1. Add the `content` target (`data-hidden-input-target="content"`) to that div.

```erb{4-7,8}
# app/components/avo/fields/color_picker_field/show_component.html.erb

<%= show_field_wrapper field: @field, index: @index do %>
  <div data-controller="hidden-input">
    <% unless @field.always_show %>
      <%= link_to t('avo.show_content'), 'javascript:void(0);', class: 'font-bold inline-block', data: { action: 'click->hidden-input#showContent' } %>
    <% end %>
    <div <% unless @field.always_show %> class="hidden" <% end %> data-hidden-input-target="content">
      <div style="background-color: <%= @field.value %>"
        class="h-6 px-1 rounded-md text-white text-sm flex items-center justify-center leading-none"
      >
        <%= @field.value %>
      </div>
    </div>
  </div>
<% end %>
```

<img :src="('/assets/img/stimulus/hidden_input_color.gif')" alt="Hidden input controller" class="border mb-4" />


---
feedbackId: 836
license: pro
---

# Custom pages (custom tools)

You may use custom tools to create custom sections or views to add to your app.

## Generate tools

`bin/rails generate avo:tool dashboard` will generate the necessary files to show the new custom tool.

```bash{2-6}
▶ bin/rails generate avo:tool dashboard
      create  app/views/avo/sidebar/items/_dashboard.html.erb
      insert  app/controllers/avo/tools_controller.rb
      create  app/views/avo/tools/dashboard.html.erb
       route  namespace :avo do
  get "dashboard", to: "tools#dashboard"
end
```

### Controller

If this is your first custom tool, a new `ToolsController` will be generated for you. Within this controller, Avo created a new method.

```ruby
class Avo::ToolsController < Avo::ApplicationController
  def dashboard
  end
end
```

You can keep this action in this controller or move it to another controller and organize it differently.

### Route

```ruby{2-4}
Rails.application.routes.draw do
  namespace :avo do
    get "dashboard", to: "tools#dashboard"
  end

  authenticate :user, ->(user) { user.admin? } do
    mount Avo::Engine => Avo.configuration.root_path
  end
end
```

The route generated is wrapped inside a namespace with the `Avo.configuration.root_path` name. Therefore, you may move it inside your authentication block next to the Avo mounting call.

### Sidebar item

The `_dashboard.html.erb` partial will be added to the `app/views/avo/sidebar/items` directory. All the files in this directory will be loaded by Avo and displayed in the sidebar. They are displayed alphabetically, so you may change their names to reorder the items.

### Customize the sidebar

If you want to customize the sidebar partial further, you can [eject](./eject-views.html#partial) and update it to your liking. We're planning on creating a better sidebar customization experience later this year.

## Add assets

You might want to import assets (javascript and stylesheets files) when creating custom tools or fields. You can do that so easily from v1.3. Please follow [this guide](./custom-asset-pipeline.html) to bring your assets with your asset pipeline.


## Using helpers from your app

You'll probably want to use some of your helpers in your custom tools. To have them available inside your custom controllers inherited from Avo's `ApplicationController`, you need to include them using the `helper` method.

```ruby{3-5,10}
# app/helpers/home_helper.rb
module HomeHelper
  def custom_helper
    'hey from custom helper'
  end
end

# app/controllers/avo/tools_controller.rb
class Avo::ToolsController < Avo::ApplicationController
  helper HomeHelper

  def dashboard
    @page_title = "Dashboard"
  end
end
```

```erb{13}
# app/views/avo/tools/dashboard.html.erb
<div class="flex flex-col">
  <%= render Avo::PanelComponent.new title: 'Dashboard', display_breadcrumbs: true do |c| %>
    <% c.with_tools do %>
      <div class="text-sm italic">This is the panels tools section.</div>
    <% end %>

    <% c.with_body do %>
      <div class="flex flex-col justify-between py-6 min-h-24">
        <div class="px-6 space-y-4">
          <h3>What a nice new tool 👋</h3>

          <%= custom_helper %>
        </div>
      </div>
    <% end %>
  <% end %>
</div>
```

### Using path helpers

Because you're in a Rails engine, you will have to prepend the engine object to the path.

#### For Avo paths

Instead of writing `resources_posts_path(1)` you have to write `avo.resources_posts_path(1)`.

#### For the main app paths

When you want to reference paths from your main app, instead of writing `posts_path(1)`, you have to write `main_app.posts_path`.


# Custom view types
By default, Avo displays all the configured view types on the view switcher. For example, if you have `map_view` and `grid_view` configured, both of them, along with the `table_view`, will be available on the view switcher.

However, there might be cases where you only want to make a specific view type available without removing the configurations for other view types. This can be achieved using the `view_types` class attribute on the resource. Note that when only one view type is available, the view switcher will not be displayed.

```ruby{3}
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = :table
  #...
end
```

If you want to make multiple view types available, you can use an array. The icons on the view switcher will follow the order in which they are declared in the configuration.

```ruby{3}
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = [:table, :grid]
  #...
end
```

You can also dynamically restrict the view types based on user roles, params, or other business logic. To do this, assign a block to the `view_types` attribute. Within the block, you'll have access to `resource`, `record`, `params`, `current_user`, and other default accessors provided by `ExecutionContext`.


```ruby{3-9}
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.view_types = -> do
    if current_user.is_admin?
      [:table, :grid]
    else
      :table
    end
  end
  #...
end
```


---
license: advanced
---

# Customizable controls

![](/assets/img/resources/customizable-controls/index.jpg)

One of the things that we wanted to support from day one is customizable controls on resource pages, and now, Avo supports customizable controls on <Index />, <Show />, and <Edit /> views and for the table row.

## Default controls

By default, Avo displays a few buttons (controls) for the user to use on the <Index />, <Show />, and <Edit /> views which you can override using the appropriate resource options.

![](/assets/img/3_0/customizable-controls/default-controls.png)

## Customize the controls

You can take over and customize them all using the `index_controls`, `show_controls`, `edit_controls`, and `row_controls` class attributes.

:::option Show page
On the <Show /> view the default configuration is `back_button`, `delete_button`, `detach_button`, `actions_list`, and `edit_button`.

To start customizing the controls, add a `show_controls` block and start adding the desired controls.

```ruby
class Avo::Resources::Fish < Avo::BaseResource
  self.show_controls = -> do
    back_button label: "", title: "Go back now"
    link_to "Fish.com", "https://fish.com", icon: "heroicons/outline/academic-cap", target: :_blank
    link_to "Turbo demo", "/admin/resources/fish/#{params[:id]}?change_to=🚀🚀🚀 New content here 🚀🚀🚀",
      class: ".custom-class",
      data: {
        turbo_frame: "fish_custom_action_demo"
      }
    delete_button label: "", title: "something"
    detach_button label: "", title: "something"
    actions_list label: "Runnables", exclude: [ReleaseFish], style: :primary, color: :slate
    action Avo::Actions::ReleaseFish, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe"
    edit_button label: ""
  end
end
```

![](/assets/img/3_0/customizable-controls/show-controls.png)
:::

:::option Edit page
On the <Edit /> view the default configuration is `back_button`, `delete_button`, `actions_list`, and `save_button`.

To start customizing the controls, add a `edit_controls` block and start adding the desired controls.

```ruby
class Avo::Resources::Fish < Avo::BaseResource
  self.edit_controls = -> do
    back_button label: "", title: "Go back now"
    link_to "Fish.com", "https://fish.com", icon: "heroicons/outline/academic-cap", target: :_blank
    delete_button label: "", title: "something"
    detach_button label: "", title: "something"
    actions_list exclude: [Avo::Actions::ReleaseFish], style: :primary, color: :slate, label: "Runnables"
    action Avo::Actions::ReleaseFish, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe" if view != :new
    save_button label: "Save Fish"
  end
end
```

![](/assets/img/3_0/customizable-controls/show-controls.png)
:::

:::option Index page
On the <Index /> view the default configuration contains the `actions_list`, `attach_button`, and `create_button`.

To start customizing the controls, add a `index_controls` block and start adding the desired controls.

```ruby
class Avo::Resources::Fish < Avo::BaseResource
  self.index_controls = -> do
    link_to "Fish.com", "https://fish.com", icon: "heroicons/outline/academic-cap", target: :_blank
    actions_list exclude: [Avo::Actions::DummyAction], style: :primary, color: :slate, label: "Runnables" if Fish.count > 0
    action Avo::Actions::DummyAction, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe" if Fish.count > 0
    attach_button label: "Attach one Fish"
    create_button label: "Create a new and fresh Fish"
  end
end
```

![](/assets/img/3_0/customizable-controls/index-controls.png)
:::

:::option Row controls
On the <Index /> view the on the end of each table row the default configuration contains the `order_controls` `show_button`, `edit_button`, `detach_button`, and `delete_button`.

To start customizing the controls, add a `row_controls` block and start adding the desired controls.

The controls you customize here will be displayed on the grid view too.

```ruby
class Avo::Resources::Fish < Avo::BaseResource
  self.row_controls = -> do
    action Avo::Actions::ReleaseFish, label: "Release #{record.name}", style: :primary, color: :blue,
      icon: "heroicons/outline/hand-raised" unless params[:view_type] == "grid"
    edit_button title: "Edit this Fish now!"
    show_button title: "Show this Fish now!"
    delete_button title: "Delete this Fish now!", confirmation_message: "Are you sure you want to delete this Fish?"
    actions_list style: :primary, color: :slate, label: "Actions" unless params[:view_type] == "grid"
    action Avo::Actions::ReleaseFish, title: "Release #{record.name}", icon: "heroicons/outline/hand-raised", style: :icon
    link_to "Information about #{record.name}", "https://en.wikipedia.org/wiki/#{record.name}",
      icon: "heroicons/outline/information-circle", target: :_blank, style: :icon
  end
end
```

![](/assets/img/3_0/customizable-controls/row-controls.png)
:::

## Controls

A control is an item that you can place in a designated area. They can be one of the default ones like `back_button`, `delete_button`, or `edit_button` to custom ones like `link_to` or `action`.

You may use the following controls:

:::option `back_button`
Links to a previous page. The link is not a `history.back()` action. It's computed based on the parameters sent by Avo. That ensures the user has consistent hierarchical progress through the app.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
:::

:::option `delete_button`
Adds the appropriate destroy form. It will take into account your authorization policy rules.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
:::

:::option `detach_button`
Adds the appropriate detach form. It's visible only on the association (`has_one`) page. It will take into account your authorization policy rules.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
:::

:::option `actions_list`
A dropdown where the user can see and run all the actions assigned to that resource.

#### Supported options

`label`, `title`, `style`, `color`, `icon`, and `exclude`.

#### `exclude` option

Filters out the specified actions.

It's used in conjunction with the `action` control. For example, when you extract an action, you don't want it to be displayed in the `actions_list` anymore, so you use the `exclude` option to filter it out.

#### Example

```ruby
actions_list exclude: DisableAccount
# Or
actions_list exclude: [ExportSelection, PublishPost]
```

:::

:::option `edit_button`
Links to the record edit page.

#### Supported options

`label`, `title`, `style`, `color`, and `icon`.
:::

:::option `link_to`
Renders a link to a path set by you.

#### Supported options

`title`, `style`, `color`, `icon`, `target`, `data`, and `class`.
:::

:::option `action`
Renders a button that triggers an action. You must provide it an [Action](./actions) class.

#### Supported options

`title`, `style`, `color`, and `icon`.

#### Example

```ruby
action Avo::Actions::DisableAccount
action Avo::Actions::ExportSelection, style: :text
action Avo::Actions::PublishPost, color: :fuchsia, icon: "heroicons/outline/eye"
```

:::

:::warning
When you use the `action` helper in any customizable block it will act only as a shortcut to display the action button, it will not also register it to the resource.

You must manually register it with the `action` declaration.

```ruby{6,10}
class Avo::Resources::Fish < Avo::BaseResource
  self.title = :name

  self.show_controls = -> do
    # In order to use it here
    action Avo::Actions::ReleaseFish, style: :primary, color: :fuchsia
  end

  # 👇 Also declare it here 👇
  def actions
    action Avo::Actions::ReleaseFish, arguments: { both_actions: "Will use them" }
  end
end
```

:::

## Control Options

:::option `title`
Sets the tooltip for that control.

#### Possible values

Any string value.
:::

:::option `style`
Sets the `style` attribute for the [`Avo::ButtonComponent`](https://github.com/avo-hq/avo/blob/main/app/components/avo/button_component.rb).

#### Possible values

`:primary`, `:outline`, `:text`
:::

:::option `color`
Sets the `color` attribute for the [`Avo::ButtonComponent`](https://github.com/avo-hq/avo/blob/main/app/components/avo/button_component.rb)

#### Possible values

Can be any color of [Tailwind`s default color pallete](https://tailwindcss.com/docs/customizing-colors#default-color-palette) as a symbol.
:::

:::option `icon`
Sets the icon for that button.

#### Possible values

Any [Heroicon](https://heroicons.com) you want. You must specify the style of the heroicon like so `heoricons/outline/academic-cap` or `heroicons/solid/adjustments`.
:::

:::option `target`
Sets the target for that control. So whatever you pass here will be passed to the control.

#### Possible values

`:_blank`, `:_top`, `:_self`
:::

:::option `class`
Sets the classes for that control.

#### Possible values

Any string value.
:::

## Conditionally hiding/showing actions

Actions have the `visible` block where you can control the visibility of an action. In the context of `show_controls` that block is not taken into account, but yiou can use regular `if`/`else` statements because the action declaration is wrapped in a block.

```ruby{6-8}
class Avo::Resources::Fish < Avo::BaseResource
  self.show_controls = -> do
    back_button label: "", title: "Go back now"

    # visibility conditional
    if record.something?
      action Avo::Actions::ReleaseFish, style: :primary, color: :fuchsia, icon: "heroicons/outline/globe"
    end

    edit_button label: ""
  end
end
```


---
feedbackId: 836
---

# Customization options

## Change the app name

On the main navbar next to the logo, Avo generates a link to the homepage of your app. The label for the link is usually computed from your Rails app name. You can customize that however, you want using `config.app_name = 'Avocadelicious'`.

The `app_name` option is also callable using a block. This is useful if you want to reference a `I18n.t` method or something more dynamic.

```ruby
Avo.configure do |config|
  config.app_name = -> { I18n.t "app_name" }
end
```

## Timezone and Currency

Your data-rich app might have a few fields where you reference `date`, `datetime`, and `currency` fields. You may customize the global timezone and currency with `config.timezone = 'UTC'` and `config.currency = 'USD'` config options.

## Resource Index view

There are a few customization options to change how resources are displayed in the **Index** view.

### Resources per page

You may customize how many resources you can view per page with `config.per_page = 24`.

<img :src="('/assets/img/resource-index/per-page-config.jpg')" alt="Per page config" class="border mb-4" />

### Per page steps

Similarly customize the per-page steps in the per-page picker with `config.per_page_steps = [12, 24, 48, 72]`.

<img :src="('/assets/img/resource-index/per-page-steps.jpg')" alt="Per page config" class="border mb-4" />

### Resources via per page

For `has_many` associations you can control how many resources are visible in their `Index view` with `config.via_per_page = 8`.

### Default view type

The `ResourceIndex` component supports two view types `:table` and `:grid`. You can change that by `config.default_view_type = :table`. Read more on the [grid view configuration page](./grid-view.html).

<div class="grid grid-flow-row sm:grid-flow-col sm:grid-cols-2 gap-2 w-full">
  <div class="w-full">
    <strong>Table view</strong>
    <img :src="('/assets/img/customization/table-view.png')" alt="Table view" class="border mb-4" />
  </div>
  <div class="w-full">
    <strong>Grid view</strong>
    <img :src="('/assets/img/customization/grid-view.jpg')" alt="Grid view" class="border mb-4" />
  </div>
</div>

## ID links to resource

On the **Index** view, each row has the controls component at the end, which allows the user to go to the **Show** and **Edit** views and delete that entry. If you have a long row and a not-so-wide display, it might not be easy to scroll to the right-most section to click the **Show** link.

You can enable the `id_links_to_resource` config option to make it easier.

```ruby{4}
Avo.configure do |config|
  config.root_path = '/avo'
  config.app_name = 'Avocadelicious'
  config.id_links_to_resource = true
end
```

That will render all `id` fields in the **Index** view as a link to that resource.

<img :src="('/assets/img/fields-reference/as-link-to-resource.jpg')" alt="As link to resource" class="border mb-4" />

## Resource controls on the left side
<DemoVideo demo-video="https://youtu.be/MfryUtcXqvU?t=706" />

By default, the resource controls are located on the right side of the record rows, which might be hidden if there are a lot of columns. You might want to move the controls to the left side in that situation using the `resource_controls_placement` option.

```ruby{2}
Avo.configure do |config|
  config.resource_controls_placement = :left
end
```


<img :src="('/assets/img/customization/resource-controls-left.jpg')" alt="Resource controls on the left side" class="border mb-4" />

## Container width

```ruby{2-3}
Avo.configure do |config|
  config.full_width_index_view = false
  config.full_width_container = false
end
```

Avo's default main content is constrained to a regular [Tailwind CSS container](https://tailwindcss.com/docs/container). If you have a lot of content or prefer to display it full-width, you have two options.

### Display the `Index` view full-width

Using `full_width_index_view: true` tells Avo to display the **Index** view full-width.

### Display all views full-width

Using `full_width_container: true` tells Avo to display all views full-width.

## Cache resources on the `Index` view

<!-- :::info
  Since version <Version version="2.30" /> `cache_resources_on_index_view` is disabled by default.
::: -->

Avo caches each resource row (or Grid item for Grid view) for performance reasons. You can disable that cache using the `cache_resources_on_index_view` configuration option. The cache key is using the record's `id` and `created_at` attributes and the resource file `md5`.

:::info
If you use the `visibility` option to show/hide fields based on the user's role, you should disable this setting.
:::

```ruby{2}
Avo.configure do |config|
  config.cache_resources_on_index_view = false
end
```

## Context

In the `Resource` and `Action` classes, you have a global `context` object to which you can attach a custom payload. For example, you may add the `current_user`, the current request `params`, or any other arbitrary data.

You can configure it using the `set_context` method in your initializer. The block you pass in will be instance evaluated in `Avo::ApplicationController`, so it will have access to the `current_user` method or `Current` object.

```ruby{2-8}
Avo.configure do |config|
  config.set_context do
    {
      foo: 'bar',
      params: request.params,
    }
  end
end
```

:::warning `_current_user`
It's recommended you don't store your current user here but using the [`current_user_method`](./authentication.html#customize-the-current-user-method) config.
:::

You can access the context data with `::Avo::App.context` object.

## Eject
[This section has moved.](./eject-views)

## Breadcrumbs

By default, Avo ships with breadcrumbs enabled.

<img :src="('/assets/img/customization/breadcrumbs.jpg')" alt="Avo breadcrumbs" class="border mb-4" />

You may disable them using the `display_breadcrumbs` configuration option.

```ruby{2}
Avo.configure do |config|
  config.display_breadcrumbs = false
end
```

The first item on the breadcrumb is **Home** with the `root_path` URL. You can customize that using the `set_initial_breadcrumbs` block.

```ruby{2-5}
Avo.configure do |config|
  config.set_initial_breadcrumbs do
    add_breadcrumb "Casa", root_path
    add_breadcrumb "Something else", something_other_path
  end
end
```

Avo uses the [breadcrumbs_on_rails](https://github.com/weppos/breadcrumbs_on_rails) gem under the hood.

### Breadcrumbs for custom pages

You can add breadcrumbs to custom pages in the controller action.

```ruby{3}
class Avo::ToolsController < Avo::ApplicationController
  def custom_tool
    add_breadcrumb "Custom tool"
  end
end
```

## Page titles

When you want to update the page title for a custom tool or page, you only need to assign a value to the `@page_title` instance variable in the controller method.

```ruby{3}
class Avo::ToolsController < Avo::ApplicationController
  def custom_tool
    @page_title = "Custom tool page title"
  end
end
```

Avo uses the [meta-tags](https://github.com/kpumuk/meta-tags) gem to compile and render the page title.

## Home path

When a user clicks your logo inside Avo or goes to the `/avo` URL, they will be redirected to one of your resources. You might want to change that path to something else, like a custom page. You can do that with the `home_path` configuration.

```ruby{2}
Avo.configure do |config|
  config.home_path = "/avo/dashboard"
end
```

### Use a lambda function for the home_path

<VersionReq version="2.8.0" class="mt-2" />

You can also use a lambda function to define that path.

```ruby{2}
Avo.configure do |config|
  config.home_path = -> { avo.dashboard_path(:dashy) }
end
```

When you configure the `home_path` option, the `Get started` sidebar item will be hidden in the development environment.

Now, users will be redirected to `/avo/dashboard` whenever they click the logo. You can use this configuration option alongside the `set_initial_breadcrumbs` option to create a more cohesive experience.

```ruby{2-5}
Avo.configure do |config|
  config.home_path = "/avo/dashboard"
  config.set_initial_breadcrumbs do
    add_breadcrumb "Dashboard", "/avo/dashboard"
  end
end
```

## Mount Avo under a nested path

You may need to mount Avo under a nested path, something like `/uk/admin`. In order to do that, you need to consider a few things.

1. Move the engine mount point below any route for custom tools.

```ruby{7,10}
Rails.application.routes.draw do
  # other routes

  authenticate :user, ->(user) { user.is_admin? } do
    scope :uk do
      scope :admin do
        get "dashboard", to: "avo/tools#dashboard" # custom tool added before engine
      end

      mount Avo::Engine, at: Avo.configuration.root_path # engine mounted last
    end
  end
end
```

2. The `root_path` configuration should only be the last path segment.

```ruby
# 🚫 Don't add the scope to the root_path
Avo.configure do |config|
  config.root_path = "/uk/admin"
end

# ✅ Do this instead
Avo.configure do |config|
  config.root_path = "/admin"
end
```

3. Use full paths for other configurations.

```ruby
Avo.configure do |config|
  config.home_path = "/uk/admin/dashboard"

  config.set_initial_breadcrumbs do
    add_breadcrumb "Dashboard", "/uk/admin/dashboard"
  end
end
```

## Custom `view_component` path

You may not keep your view components under `app/components` and want the generated field `view_component`s to be generated in your custom directory. You can change that using the `view_component_path` configuration key.

```ruby
Avo.configure do |config|
  config.view_component_path = "app/frontend/components"
end
```

## Custom query scopes

You may want to change Avo's queries to add sorting or use gems like [friendly](https://github.com/norman/friendly_id).
You can do that using `index_query` for multiple records and `find_record_method` when fetching one record.

### Custom scope for `Index` page

Using `index_query` you tell Avo how to fetch the records for the `Index` view.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.index_query = -> {
    query.order(last_name: :asc)
  }
end
```

### Custom find method for `Show` and `Edit` pages

Using `find_record_method` you tell Avo how to fetch one record for `Show` and `Edit` views and other contexts where a record needs to be fetched from the database.

This is very useful when you use something like `friendly` gem, custom `to_param` methods on your model, and even the wonderful `prefix_id` gem.

#### Custom `to_param` method

The following example shows how you can update the `to_param` (to use the post name) method on the `User` model to use a custom attribute and then update the `Avo::Resources::User` so it knows how to search for that model.

::: code-group
```ruby [app/avo/resources/post.rb]
class Avo::Resource::Post < Avo::BaseResource
  self.find_record_method = -> {
    # When using friendly_id, we need to check if the id is a slug or an id.
    # If it's a slug, we need to use the find_by_slug method.
    # If it's an id, we need to use the find method.
    # If the id is an array, we need to use the where method in order to return a collection.
    if id.is_a?(Array)
      id.first.to_i == 0 ? query.where(slug: id) : query.where(id: id)
    else
      id.to_i == 0 ? query.find_by_slug(id) : query.find(id)
    end
  }
end
```

```ruby [app/models/post.rb]
class Post < ApplicationRecord
  before_save :update_slug

  def to_param
    slug || id
  end

  def update_slug
    self.slug = name.parameterize
  end
end
```
:::

#### Using the `friendly` gem

::: code-group
```ruby [app/avo/resources/user.rb]
class Avo::Resources::User < Avo::BaseResource
  self.find_record_method = -> {
    # We have to add .friendly to the query
    query.friendly.find! id
  }
end
```

```ruby [app/models/user.rb]
class User < ApplicationRecord
  extend FriendlyId

  friendly_id :name, use: :slugged
end
```
:::

#### Using `prefixed_ids` gem

You really don't have to do anything on Avo's side for this to work. You only need to add the `has_prefix_id` the model as per the documentation. Avo will know how to search for the record.

```ruby
class Course < ApplicationRecord
  has_prefix_id :course
end
```

## Disable features

You might want to disable some Avo features. You can do that using the `disabled_features` option.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.disabled_features = [:global_search]
end
```

After this setting, the global search will be hidden for users.

Supported options:

- `global_search`

## Customize profile name, photo, and title

You might see on the sidebar footer a small profile widget. The widget displays three types of information about the user; `name`, `photo`, and `title`.

### Customize the name of the user

Avo checks to see if the object returned by your [`current_user_method`](authentication.html#customize-the-current-user-method) responds to a `name` method. If not, it will try the `email` method and then fall back to `Avo user`.

### Customize the profile photo

Similarly, it will check if that current user responds to `avatar` and use that as the `src` of the photo.

### Customize the title of the user

Lastly, it will check if it responds to the `avo_title` method and uses that to display it under the name.

### Customize the sign-out link

Please follow [this](authentication.html#customise-the-sign-out-link) guide in [authentication](authentication).

## Skip show view

<div class="space-x-2">
  <VersionReq version="2.16" />
  <BetaStatus label="Public beta" />
</div>

In the CRUD interface Avo adds the <Show /> view by default. This means that when your users will see the view icon to go to that detail page and they will be redirected to the <Show /> page when doing certain tasks (update a record, run an action, etc.).

You might not want that behavior and you might not use the <Show /> view at all and prefer to skip that and just use the <Edit /> view.
Adding `config.skip_show_view = true` to your `avo.rb` configuration file will tell Avo to skip it and use the <Edit /> view as the default resource view.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.skip_show_view = true
end
```

![](/assets/img/customization/skip_show_view.gif)

## Logger

You may want to set a different output stream for avo logs, you can do that by returning it on a `config.logger` Proc

```ruby
## == Logger ==
config.logger = -> {
  file_logger = ActiveSupport::Logger.new(Rails.root.join("log", "avo.log"))

  file_logger.datetime_format = "%Y-%m-%d %H:%M:%S"
  file_logger.formatter = proc do |severity, time, progname, msg|
    "[Avo] #{time}: #{msg}\n".tap do |i|
      puts i
    end
  end

  file_logger
}
```


---
feedbackId: 833
license: pro
version: '2.0'
---

# Dashboards

:::warning
You must manually require the `chartkick` gem in your `Gemfile`.

```ruby
# Create beautiful JavaScript charts with one line of Ruby
gem "chartkick"
```
:::

There comes the point in your app's life when you need to display the data in an aggregated form like a metric or chart. That's what Avo's Dashboards are all about.

## Generate a dashboard

Run `bin/rails g avo:dashboard my_dashboard` to get a shiny new dashboard.

```ruby
class Avo::Dashboards::MyDashboard < Avo::Dashboards::BaseDashboard
  self.id = 'my_dashboard'
  self.name = 'Dashy'
  self.description = 'The first dashbaord'
  self.grid_cols = 3

  def cards
    card Avo::Cards::ExampleMetric
    card Avo::Cards::ExampleAreaChart
    card Avo::Cards::ExampleScatterChart
    card Avo::Cards::PercentDone
    card Avo::Cards::AmountRaised
    card Avo::Cards::ExampleLineChart
    card Avo::Cards::ExampleColumnChart
    card Avo::Cards::ExamplePieChart
    card Avo::Cards::ExampleBarChart
    divider label: "Custom partials"
    card Avo::Cards::ExampleCustomPartial
    card Avo::Cards::MapCard
  end
end
```

<img :src="('/assets/img/dashboards/dashboard.jpg')" alt="Avo Dashboard" class="border mb-4" />

## Settings

Each dashboard is a file. It holds information about itself like the `id`, `name`, `description`, and how many columns its grid has.

The `id` field has to be unique. The `name` is what the user sees in big letters on top of the page, and the `description` is some text you pass to give the user more details regarding the dashboard.

Using the ' grid_cols ' parameter, you may organize the cards in a grid with `3`, `4`, `5`, or `6` columns using the `grid_cols` parameter. The default is `3`.

## Cards
[This section has moved.](cards.html)

### Override card arguments from the dashboard

We found ourselves in the position to add a few cards that were the same card but with a slight difference. Ex: Have one `Users count` card and another `Active users count` card. They both count users, but the latter has an `active: true` condition applied.

Before, we'd have to duplicate that card and modify the `query` method slightly but end up with duplicated boilerplate code.
For those scenarios, we created the `arguments` attribute. It allows you to send arbitrary arguments to the card from the parent.

```ruby{7-9}
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  def cards
    card Avo::Cards::UsersCount
    card Avo::Cards::UsersCount, arguments: {
      active_users: true
    }
  end
end
```

Now we can pick up that option in the card and update the query accordingly.

```ruby{9-11}
class Avo::Cards::UsersCount < Avo::Cards::MetricCard
  self.id = "users_metric"
  self.label = "Users count"

  # You have access to context, params, range, current parent, and current card
  def query
    scope = User

    if arguments[:active_users].present?
      scope = scope.active
    end

    result scope.count
  end
end
```

That gives you an extra layer of control without code duplication and the best developer experience.

#### Control the base settings from the parent

Evidently, you don't want to show the same `label`, `description`, and other details for that second card from the first card;. Therefore, you can control the `label`, `description`, `cols`, `rows`, and `refresh_every` arguments from the parent declaration.

```ruby{8-12}
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = "dashy"
  self.name = "Dashy"

  def cards
    card Avo::Cards::UsersCount
    card Avo::Cards::UsersCount,
      label: "Active users",
      description: "Active users count",
      cols: 2,
      rows: 2,
      refresh_every: 2.minutes,
      arguments: {
        active_users: true
      }
  end
end
```

## Dashboards visibility

You might want to hide specific dashboards from certain users. You can do that using the `visible` option. The option can be a boolean `true`/`false` or a block where you have access to the `params`, `current_user`, `context`, and `dashboard`.

If you don't pass anything to `visible`, the dashboard will be available for anyone.

```ruby{5-11}
class Avo::Dashboards::ComplexDash < Avo::Dashboards::BaseDashboard
  self.id = "complex_dash"
  self.name = "Complex dash"
  self.description = "Complex dash description"
  self.visible = -> do
    current_user.is_admin?
    # or
    params[:something] == 'something else'
    # or
    context[:your_param] == params[:something_else]
  end

  def cards
    card Avo::Cards::UsersCount
  end
end
```

## Dashboards authorization

<VersionReq version="2.22" />

You can set authorization rules for dashboards using the `authorize` block.

```ruby{3-6}
class Avo::Dashboards::Dashy < Avo::Dashboards::BaseDashboard
  self.id = 'dashy'
  self.authorization = -> do
    # You have access to current_user, params, request, context, adn view_context.
    current_user.is_admin?
  end
end
```


---
feedbackId: 838
license: advanced
---

# Dynamic filters

The Dynamic filters make it so easy to add multiple, composable, and dynamic filters to the <Index /> view.

The first thing you need to do is add the `filterable: true` attribute to the fields you need to filter through. We use `ransack` behind the scenes so it's essential to configure the `ransackable_attributes` list to ensure that every filterable field is incorporated within it.


```ruby{4-6} [Fields]
class Avo::Resources::Project < Avo::BaseResource
  def fields
    field :name, as: :text
    field :status, as: :status, filterable: true
    field :stage, as: :badge, filterable: true
    field :country, as: :country, filterable: true
  end
end
```

Authorize ransackable_attributes
```ruby{3,11}
class Project < ApplicationRecord
  def self.ransackable_attributes(auth_object = nil)
    ["status", "stage", "country"]
  end
end

# Or authorize ALL attributes at once

class Project < ApplicationRecord
  def self.ransackable_attributes(auth_object = nil)
    authorizable_ransackable_attributes
  end
end
```

This will make Avo add this new "Filters" button to the <Index /> view of your resource.

When the user clicks the button, a new filters bar will appear below enabling them to add filters based on the attributes you marked as filterable.
The user can add multiple filters for the same attribute if they desire so.

## Filter types

There are a few types of filters available for you to use out of the box.

:::option Boolean

### Conditions

 - Is true
 - Is false
 - Is present
 - Is blank
:::

:::option Date

### Conditions

 - Is
 - Is not
 - Is on or before
 - Is on or after
 - Is within
 - Is present
 - Is blank
:::

:::option Has many

This filter will give you options from the database.

### Conditions

 - Is
 - Is not
 - Is present
 - Is blank
:::

:::option Number

### Conditions

 - = (equals)
 - != (is different)
 - > (greater than)
 - >= (greater than or equal to)
 - < (lower than)
 - <= (lower than or equal to)
 - Is present
 - Is blank
:::

:::option Select

### Conditions

 - Is
 - Is not
 - Is present
 - Is blank
:::

:::option Text

### Conditions

 - Contains
 - Does not contain
 - Is
 - Is not
 - Starts with
 - Ends with
 - Is present
 - Is blank
:::

::::option Array

Used on `tags` fields.

### Conditions

 - Are
 - Contains
 - Overlap
 - Contained in

:::warning
This will only work with database array columns, not when using the `acts-as-taggable-on` gem.
:::

::::

## Options

You can have a few customization options available that you can add in your `avo.rb` initializer file.

```ruby
Avo.configure do |config|
  # Other Avo configurations
end

if defined?(Avo::DynamicFilters)
  Avo::DynamicFilters.configure do |config|
    config.button_label = "Advanced filters"
    config.always_expanded = true
  end
end
```

:::option `button_label`
This will change the label on the expand label.
:::

:::option `always_expanded`
You may opt-in to have them always expanded and have the button hidden.
:::

## Field to filter matching

At the moment the filters are not configurable so each field will have a dedicated filter type. We will have a more advanced configuration in the future.

The current field-to-filter matching is done like so:

```ruby
def field_to_filter(type)
  case type.to_sym
  when :boolean
    :boolean
  when :date, :date_time, :time
    :date
  when :id, :number, :progress_bar
    :number
  when :select, :badge, :country, :status
    :select
  when :text, :textarea, :code, :markdown, :password, :trix
    :text
  else
    :text
  end
end
```

## Caveats

At some point we'll integrate the [Basic filters](./basic-filters) into the dynamic filters bar. Until then, if you have both basic and dynamic filters on your resource you'll have two `Filters` buttons on your <Index /> view.

To mitigate that you can toggle the `always_expanded` option to true.


# Eject

If you want to change one of Avo's built-in views, you can eject it, update it and use it in your admin panel.

:::warning
Once ejected, the views will not receive updates on new Avo releases. You must maintain them yourself.
:::

:::option `--partial`
Utilize the `--partial` option when you intend to extract certain partial

## Prepared templates

We prepared a few templates to make it easier for you.

`bin/rails generate avo:eject --partial :logo` will eject the `_logo.html.erb` partial.

```
▶ bin/rails generate avo:eject --partial :logo
Running via Spring preloader in process 20947
      create  app/views/avo/logo/_logo.html.erb
```

A list of prepared templates:

- `:logo` ➡️ &nbsp; `app/views/avo/partials/_logo.html.erb`
- `:head` ➡️ &nbsp; `app/views/avo/partials/_head.html.erb`
- `:header` ➡️ &nbsp; `app/views/avo/partials/_header.html.erb`
- `:footer` ➡️ &nbsp; `app/views/avo/partials/_footer.html.erb`
- `:scripts` ➡️ &nbsp; `app/views/avo/partials/_scripts.html.erb`
- `:sidebar_extra` ➡️ &nbsp; `app/views/avo/partials/_sidebar_extra.html.erb`

### Logo

In the `app/views/avo/partials` directory, you will find the `_logo.html.erb` partial, which you may customize however you want. It will be displayed in place of Avo's logo.

### Header

The `_header.html.erb` partial enables you to customize the name and link of your app.

### Footer

The `_footer.html.erb` partial enables you to customize the footer of your admin.

### Scripts

The `_scripts.html.erb` partial enables you to insert scripts in the footer of your admin.

## Eject any template

You can eject any partial from Avo using the partial path.

```
▶ bin/rails generate avo:eject --partial app/views/layouts/avo/application.html.erb
      create  app/views/layouts/avo/application.html.erb
```
:::

:::option `--component`
You can eject any view component from Avo using the `--component` option.

```bash
$ bin/rails generate avo:eject --component Avo::Index::TableRowComponent
```
or

```bash
$ bin/rails generate avo:eject --component avo/index/table_row_component
```

Have the same output:
```bash
create  app/components/avo/index/table_row_component.rb
create  app/components/avo/index/table_row_component.html.erb
```
:::

:::option `--field-components`
With `--field-components` option is easy to eject, one or multiple field components. Notice that without using the `--scope`, the ejected components will override the original components for that field everywhere on the project.

Check the `--scope` and the [`components`](./field-options.html#components) field options for more details on how to override the components only on specific parts of the project.

```bash
$ rails g avo:eject --field-components text
      create  app/components/avo/fields/text_field
      create  app/components/avo/fields/text_field/edit_component.html.erb
      create  app/components/avo/fields/text_field/edit_component.rb
      create  app/components/avo/fields/text_field/index_component.html.erb
      create  app/components/avo/fields/text_field/index_component.rb
      create  app/components/avo/fields/text_field/show_component.html.erb
      create  app/components/avo/fields/text_field/show_component.rb
```

Let's say you want to override only the edit component of the `TextField`, that can be achieved with this simple command.

```bash
$ rails g avo:eject --field-components text --view edit
      create  app/components/avo/fields/text_field/edit_component.rb
      create  app/components/avo/fields/text_field/edit_component.html.erb
```

:::option `--view`
While utilizing the `--field-components` option, you can selectively extract a specific view using the `--view` parameter, as demonstrated in the example above. If this option is omitted, all components of the field will be ejected.
:::


:::option `--scope`
When you opt to eject a view component that exists under `Avo::Views` or a field component under `Avo::Fields` namespace, for example the `Avo::Views::ResourceIndexComponent` or `Avo::Fields::TextField::ShowComponent` you can employ the `--scope` option to specify the namespace that should be adopted by the ejected component, extending from `Avo::Views` / `Avo::Fields`.

```bash
$ rails g avo:eject --component Avo::Views::ResourceIndexComponent --scope admins
      create  app/components/avo/views/admins/resource_index_component.rb
      create  app/components/avo/views/admins/resource_index_component.html.erb

$ rails g avo:eject --field-components text --view show --scope admins
      create  app/components/avo/fields/admins/text_field/show_component.rb
      create  app/components/avo/fields/admins/text_field/show_component.html.erb
```

The ejected file have the same code that original `Avo::Views::ResourceIndexComponent` or `Avo::Fields::TextField::ShowComponent` but you can notice that the class name and the directory has changed

```ruby
class Avo::Views::Admins::ResourceIndexComponent < Avo::ResourceComponent

class Avo::Fields::Admins::TextField::ShowComponent < Avo::Fields::ShowComponent
```

:::info Scopes transformation
`--scope users_admins` -> `Avo::Views::UsersAdmins::ResourceIndexComponent`<br>
`--scope users/admins` -> `Avo::Views::Users::Admins::ResourceIndexComponent`

:::


# Execution context

[`Avo::Services::EncryptionService`](https://github.com/avo-hq/avo/blob/main/lib/avo/services/encryption_service.rb) it's used internally by Avo when is needed to encrypt sensible params.

One example is the select all feature, where we pass the query, encrypted, through params.

## How does the [`Avo::Services::EncryptionService`](https://github.com/avo-hq/avo/blob/main/lib/avo/services/encryption_service.rb) work?

The `EncryptionService` is an service that can be called anywhere on the app.

### Public methods

:::option `encrypt`
Used to encrypt data
:::

:::option `decrypt`
Used to decrypt data
:::

<br><br>

### Mandatory arguments:

:::option `message`
Object to be encrypted
:::

:::option `purpose`
A symbol with the purpose of encryption, can be anything, it just ***need to match when decrypting***.
:::

<br><br>

### Optional arguments
This service uses [`ActiveSupport::MessageEncryptor`](https://api.rubyonrails.org/v5.2.3/classes/ActiveSupport/MessageEncryptor.html) as encryptor so [`Avo::Services::EncryptionService`](https://github.com/avo-hq/avo/blob/main/lib/avo/services/encryption_service.rb) accepts any argument specified on [`ActiveSupport::MessageEncryptor` documentation](https://api.rubyonrails.org/v5.2.3/classes/ActiveSupport/MessageEncryptor.html)

## Usage example

### Basic text:
```ruby
secret_encryption = Avo::Services::EncryptionService.encrypt(message: "Secret string", purpose: :demo)
# "x+rnETtClF2cb80PtYzlULnVB0vllf+FvwoqBpPbHWa8q6vlml5eRWrwFMcYrjI6--h2MiT1P5ctTUjwfQ--k2WsIRknFVE53QwXADDDJw=="

Avo::Services::EncryptionService.decrypt(message: secret_encryption, purpose: :demo)
# "Secret string"
```

### Objects with custom serializer:
```ruby
secret_encryption = Avo::Services::EncryptionService.encrypt(message:Course::Link.first, purpose: :demo, serializer: Marshal)
# "1UTtkhu9BDywzz8yl8/7cBZnOoM1wnILDJbT7gP+zz8M/t1Dve4QTFQP5nfHZdYK9KvFDwkizm8DTHyNZdixDtCO/M7yNMlzL8Mry1RQ3AF0qhhTzFeqb5UqyQv/Cuq+NWvQ+GXv3gFckXaNqsFSX5yDccEpRDpyNkYT4MFxOa+8hVR4roebkNKB89lb73anBDTHsTAd37y2LFiv2YaiFguPQ/...

Avo::Services::EncryptionService.decrypt(message: secret_encryption, purpose: :demo, serializer: Marshal)
# #<Course::Link:0x00007fd28dc44c00 id: 1, link: "http://ortiz.com/cher_mohr", course_id: 1, created_at: Thu, 07 Dec 2023 11:05:13.779644000 UTC +00:00, updated_at: Thu, 07 Dec 2023 11:05:13.779644000 UTC +00:00, position: 1>
```

## Secret key base
:::warning
[`Avo::Services::EncryptionService`](https://github.com/avo-hq/avo/blob/main/lib/avo/services/encryption_service.rb) fetches a secret key base to be used on the encrypt / decrypt process. Make sure that you have it defined in any of the following:

`ENV["SECRET_KEY_BASE"] || Rails.application.credentials.secret_key_base || Rails.application.secrets.secret_key_base`
:::




# Execution context

Avo enables developers to hook into different points of the application lifecycle using blocks.
That functionality can't always be performed in void but requires some pieces of state to set up some context.

Computed fields are one example.

```ruby
field :full_name, as: :text do
  "#{record.first_name} #{record.last_name}"
end
```

In that block we need to pass the `record` so you can compile that value. We send more information than just the `record`, we pass on the `resource`, `view`, `view_context`, `request`, `current_user` and more depending on the block that's being run.

## How does the `ExecutionContext` work?

The `ExecutionContext` is an object that holds some pieces of state on which we execute a lambda function.

```ruby
module Avo
  class ExecutionContext

    attr_accessor :target, :context, :params, :view_context, :current_user, :request

    def initialize(**args)
      # If target don't respond to call, handle will return target
      # In that case we don't need to initialize the others attr_accessors
      return unless (@target = args[:target]).respond_to? :call

      args.except(:target).each do |key,value|
        singleton_class.class_eval { attr_accessor "#{key}" }
        instance_variable_set("@#{key}", value)
      end

      # Set defaults on not initialized accessors
      @context      ||= Avo::Current.context
      @params       ||= Avo::Current.params
      @view_context ||= Avo::Current.view_context
      @current_user ||= Avo::Current.current_user
      @request      ||= Avo::Current.request
    end

    delegate :authorize, to: Avo::Services::AuthorizationService

    # Return target if target is not callable, otherwise, execute target on this instance context
    def handle
      target.respond_to?(:call) ? instance_exec(&target) : target
    end
  end
end

# Use it like so.
SOME_BLOCK = -> {
  "#{record.first_name} #{record.last_name}"
}

Avo::ExecutionContext.new(target: &SOME_BLOCK, record: User.first).handle
```

This means you could throw any type of object at it and it it responds to a `call` method wil will be called with all those objects.

:::option `target`
The block you'll pass to be evaluated. It may be anything but will only be evaluated if it responds to a `call` method.
:::

:::option `context`
Aliased to [`Avo::Current.context`](./avo-current#context).
:::

:::option `current_user`
Aliased to [`Avo::Current.user`](./avo-current#user).
:::

:::option `view_context`
Aliased to [`Avo::Current.view_context`](./avo-current#view_context).
:::

:::option `request`
Aliased to [`Avo::Current.request`](./avo-current#request).
:::

:::option `params`
Aliased to [`Avo::Current.params`](./avo-current#params).
:::

:::option Custom variables
You can pass any variable to the `ExecutionContext` and it will be available in that block.
This is how we can expose `view`, `record`, and `resource` in the computed field example.

```ruby
Avo::ExecutionContext.new(target: &SOME_BLOCK, record: User.first, view: :index, resource: resource).handle
```
:::

:::option `helpers`
Within the `ExecutionContext` you might want to use some of your already defined helpers. You can do that using the `helpers` object.

```ruby
# products_helper.rb
class ProductsHelper
  # Strips the "CODE_" prefix from the name
  def simple_name(name)
    name.gsub "CODE_", ""
  end
end

field :name, as: :text, format_using: -> { helpers.simple_name(value) }
:::


# FAQ

## Show/hide buttons throughout the admin

You might want to hide some buttons and not show them to your users. That's pretty handy using the [`Authorization`](authorization) feature. Then, you control the display of those buttons using the policy methods.

- Show button -> `show?` method
- Edit button -> `edit?` method
- Delete button -> `destroy?` method
- Upload attachments button -> `upload_{FIELD_ID}?` method
- Download attachments button -> `download_{FIELD_ID}?` method
- Delete attachments button -> `delete_{FIELD_ID}?` method
- Attach button -> `attach_#{RESOURCE_PLURL_NAME}?` (eg: `attach_posts?`) method
- Detach button -> `detach_#{RESOURCE_PLURL_NAME}?` (eg: `detach_posts?`) method

## Why don't regular URL helpers work as expected?

When writing rails code somewhere in the Avo domain you might want to use your regular URL helpers like the below:

```ruby{2}
field :partner_home, as: :text, as_html: true do
  link_to 'Partner', partner_home_url(record)
end
```

That will not work because Avo will execute that code inside itself, a Rails engine. So per the [Rails documentation](https://guides.rubyonrails.org/engines.html#routes) you have to prepend the helper with `main_app` for it to work. Rails needs to know which engine it should find a route for. So the query becomes this 👇

```ruby{2}
field :partner_home, as: :text, as_html: true do
  link_to 'Partner', main_app.partner_home_url(record)
end
```

## I want to give access to different kinds of users to various resources.

You can do that using Pundit scopes and the Authorization feature. You create a policy for that resource and set the condition on the `index?` method. More on that on the [authorization](authorization) page and Pundit's [docs](https://github.com/varvet/pundit).

Authorization is a Pro feature for Avo. Please [reach out](https://avohq.io/subscriptions/new?plan=2&trial=1) if you need a trial key to test it out.

## How can I set a homepage for the admin section

You can do that using the [home_path](customization.html#home-path) configuration. You just set `config.home_path = "/avo/resources/posts"` (or whatever path you'd like) in the Avo initializer, and you're all set up. The user will be redirected to that path when navigating to `/avo`.


```ruby{8}
# config/initializers/avo.rb

Avo.configure do |config|
  config.root_path = '/avo'
  config.license_key = ENV['AVO_LICENSE_KEY']
  config.id_links_to_resource = true
  config.home_path = '/avo/resources/posts'
  config.set_context do
    {
      foo: 'bar',
      user: current_user,
      params: request.params,
    }
  end
end
```

## I want to have two different resources mapped to the same model with different types

That depends on your setup:

1. If you have [Rails STI](https://guides.rubyonrails.org/association_basics.html#single-table-inheritance-sti), then it will work. Avo knows how to handle STI models. So you'll have two models and an Avo resource for each one. That will render two resources in your admin panel's sidebar.
2. You don't have Rails STI but something custom. Then the response is it depends. Because something custom is... custom, we offer a few mechanisms to get over that.

If you have one model, `User`, you'll have one Avo resource, `Avo::Resources::User`.
Then you can customize different things based on your requirements. Like if for instance, you want to show only some types of users on the `Index` view, you can use [custom query scopes](https://docs.avohq.io/1.0/customization.html#custom-query-scopes) to hide specific types (if that's what you want to do).
Same if you want to [show/hide fields](https://docs.avohq.io/1.0/field-options.html#field-visibility) based on the resource type or type of user.

All in all **we're confident you'll have the necessary instruments** you need to build your admin.

### STI example

For **STI** you can check out the models and resources in the [demo app](https://main.avodemo.com/).

 - [person.rb](https://github.com/avo-hq/avodemo/blob/main/app/models/person.rb)
 - [spouse.rb](https://github.com/avo-hq/avodemo/blob/main/app/models/spouse.rb)
 - [person_resource.rb](https://github.com/avo-hq/avodemo/blob/main/app/avo/resources/person_resource.rb)
 - [spouse_resource.rb](https://github.com/avo-hq/avodemo/blob/main/app/avo/resources/spouse_resource.rb)

One thing you should do is for the derived model (`Spouse` in this case) add the `model_class` to [the Avo resource](https://github.com/avo-hq/avodemo/blob/main/app/avo/resources/spouse_resource.rb#L5).

## Try a pre-release version

We push pre-release versions of the gem from time to time for you to try out before pushing it to the `main` branch. To test them out, specify the exact version in your `Gemfile`.

Let's say you want to try out `1.19.1.pre.1`. You need to specify it like below 👇

```ruby
# Gemfile

# ... other gems

gem 'avo', '1.19.1.pre.1'
```

## The authorization features are not working

If you're having trouble with the authorization feature, make sure you have the following enabled:

- you are on a [Pro](licensing) license
- you have set the [`current_user_method`](authentication.html#customize-the-current-user-method)
- you have reset the rails server after the above settings
- you have the pundit policy on the appropriate model

## Add custom methods/get custom data

You might want to be able to send custom data to some of the blocks you use (`default` block, computed fields, field formatters, etc.). You can use the `context` block. The block is evaluated in the `ApplicationController` so it can access the `params` and other common controller methods. More on that [here](customization#context).

## Get access to the `ActionView` helper methods

For convenience sake, we capture the `view_context` for you and set it to the `Avo::App.view_context` global object. You can use all the `ActionView` methods you'd regularly use in your helpers throughout your Avo configuration.

On the `Resource` and `Field` classes, it's already delegated for you, so you can just use `view_context`.

```ruby{7,10}
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :id, as: :id
    field :body,
      as: :textarea,
      format_using: -> do
        view_context.content_tag(:div, style: 'white-space: pre-line') { value }
      end
    field :computed_field, as: :text do
      view_context.link_to("Login", main_app.new_user_session_path)
    end
  end
end
```

## Render new lines for textarea fields

**From version 2.8**

When adding content using the `textarea` field, you might see that the newlines are not displayed on the `Show` view.

```ruby{3}
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :body, as: :textarea
  end
end
```

<img :src="('/assets/img/faq/newline/edit.png')" alt="Render new lines" class="border mb-4" />
<img :src="('/assets/img/faq/newline/default.png')" alt="Render new lines" class="border mb-4" />

You can change how you display the information by using the `format_using` option.

### Use `simple_format`

```ruby{6}
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :body,
      as: :textarea,
      format_using: -> do
        simple_format value
      end
  end
end
```

<img :src="('/assets/img/faq/newline/simple_format.png')" alt="Render new lines" class="border mb-4" />

### Use the `white-space: pre-line` style rule

```ruby{6}
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :body,
      as: :textarea,
      format_using: -> do
        content_tag(:div, style: 'white-space: pre-line') { value }
      end
    end
end
```

<img :src="('/assets/img/faq/newline/whitespace.png')" alt="Render new lines" class="border mb-4" />

### Use the `whitespace-pre-line` class

```ruby{6}
class Avo::Resources::Comment < Avo::BaseResource
  def fields
    field :body,
      as: :textarea,
      format_using: -> do
        content_tag(:div, class: 'whitespace-pre-line') { value }
      end
  end
end
```

<img :src="('/assets/img/faq/newline/whitespace.png')" alt="Render new lines" class="border mb-4" />


---
feedbackId: 834
---

# Field options

## Change field name

To customize the label, you can use the `name` property to pick a different label.

```ruby
field :is_available, as: :boolean, name: "Availability"
```

<img :src="('/assets/img/fields-reference/naming-convention-override.png')" alt="Field naming convention override" class="border mb-4" />

## Showing / Hiding fields on different views

There will be cases where you want to show fields on different views conditionally. For example, you may want to display a field in the <New /> and <Edit /> views and hide it on the <Index /> and <Show /> views.

For scenarios like that, you may use the visibility helpers `hide_on`, `show_on`, `only_on`, and `except_on` methods. Available options for these methods are: `:new`, `:edit`, `:index`, `:show`, `:forms` (both `:new` and `:edit`) and `:all` (only for `hide_on` and `show_on`).

Version 3 introduces the `:display` option that is the opposite of `:forms`, referring to both, `:index` and `:show`

Be aware that a few fields are designed to override those options (ex: the `id` field is hidden in <Edit /> and <New />).

```ruby
field :body, as: :text, hide_on: [:index, :show]
```

Please read the detailed [views](./views.html) page for more info.

## Field Visibility

You might want to restrict some fields to be accessible only if a specific condition applies. For example, hide fields if the user is not an admin.

You can use the `visible` block to do that. It can be a `boolean` or a lambda.
Inside the lambda, we have access to the [`context`](./customization.html#context) object and the current `resource`. The `resource` has the current `record` object, too (`resource.record`).

```ruby
field :is_featured, as: :boolean, visible: -> { context[:user].is_admin? }  # show field based on the context object
field :is_featured, as: :boolean, visible: -> { resource.name.include? 'user' } # show field based on the resource name
field :is_featured, as: :boolean, visible: -> { resource.record.published_at.present? } # show field based on a record attribute
```

:::warning
On form submissions, the `visible` block is evaluated in the `create` and `update` controller actions. That's why you have to check if the `resource.record` object is present before trying to use it.
:::


```ruby
# `resource.record` is nil when submitting the form on resource creation
field :name, as: :text, visible -> { resource.record.enabled? }

# Do this instead
field :name, as: :text, visible -> { resource.record&.enabled? }
```

## Computed Fields

You might need to show a field with a value you don't have in a database row. In that case, you may compute the value using a block that receives the `record` (the actual database record), the `resource` (the configured Avo resource), and the current `view`. With that information, you can compute what to show on the field in the <Index /> and <Show /> views.

```ruby
field 'Has posts', as: :boolean do
  record.posts.present?
rescue
  false
end
```

:::info
Computed fields are displayed only on the <Show /> and <Index /> views.
:::

This example will display a boolean field with the value computed from your custom block.

## Fields Formatter

Sometimes you will want to process the database value before showing it to the user. You may do that using `format_using` block.

Notice that this block will have effect on **all** views.

You have access to a bunch of variables inside this block, all the defaults that [`Avo::ExecutionContext`](./execution-context.html) provides plus `value`, `record`, `resource`, `view` and `field`.

```ruby
field :is_writer, as: :text, format_using: -> {
  if view.form?
    value
  else
    value.present? ? '👍' : '👎'
  end
}
```

This example snippet will make the `:is_writer` field generate `👍` or `👎` emojis instead of `1` or `0` values on display views and the values `1` or `0` on form views.

<img :src="('/assets/img/fields-reference/fields-formatter.png')" alt="Fields formatter" class="border mb-4" />

Another example:

```ruby
field :company_url,
  as: :text,
  format_using: -> {
    if view == :new || view == :edit
      value
    else
      link_to(value, value, target: "_blank")
    end
  } do
  main_app.companies_url(record)
end
```

## Formatting with Rails helpers

You can also format using Rails helpers like `number_to_currency` (note that `view_context` is used to access the helper):

```ruby
field :price, as: :number, format_using: -> { view_context.number_to_currency(value) }
```

## Sortable fields

One of the most common operations with database records is sorting the records by one of your fields. For that, Avo makes it easy using the `sortable` option.

Add it to any field to make that column sortable in the <Index /> view.

```ruby
field :name, as: :text, sortable: true
```

<img :src="('/assets/img/fields-reference/sortable-fields.png')" alt="Sortable fields" class="border mb-4" />

## Custom sortable block

When using computed fields or `belongs_to` associations, you can't set `sortable: true` to that field because Avo doesn't know what to sort by. However, you can use a block to specify how the records should be sorted in those scenarios.

```ruby{4-7}
class Avo::Resources::User < Avo::BaseResource
  field :is_writer,
    as: :text,
    sortable: -> {
      # Order by something else completely, just to make a test case that clearly and reliably does what we want.
      query.order(id: direction)
    },
    hide_on: :edit do
      record.posts.to_a.size > 0 ? "yes" : "no"
    end
end
```

The block receives the `query` and the `direction` in which the sorting should be made and must return back a `query`.

In the example of a `Post` that `has_many` `Comment`s, you might want to order the posts by which one received a comment the latest.

You can do that using this query.

::: code-group

```ruby{5} [app/avo/resources/post.rb]
class Avo::Resources::Post < Avo::BaseResource
  field :last_commented_at,
    as: :date,
    sortable: -> {
      query.includes(:comments).order("comments.created_at #{direction}")
    }
end
```

```ruby{4-6} [app/models/post.rb]
class Post < ApplicationRecord
  has_many :comments

  def last_commented_at
    comments.last&.created_at
  end
end
```

:::

## Placeholder

Some fields support the `placeholder` option, which will be passed to the inputs on <Edit /> and <New /> views when they are empty.

```ruby
field :name, as: :text, placeholder: 'John Doe'
```

<img :src="('/assets/img/fields-reference/placeholder.png')" alt="Placeholder option" class="border mb-4" />

## Required
To indicate that a field is mandatory, you can utilize the `required` option, which adds an asterisk to the field as a visual cue.

Avo automatically examines each field to determine if the associated attribute requires a mandatory presence. If it does, Avo appends the asterisk to signify its mandatory status. It's important to note that this option is purely cosmetic and does not incorporate any validation logic into your model. You will need to manually include the validation logic yourself, such as (`validates :name, presence: true`).


```ruby
field :name, as: :text, required: true
```

<img :src="('/assets/img/fields-reference/required.png')" alt="Required option" class="border mb-4" />

<DemoVideo demo-video="https://youtu.be/peKt90XhdOg?t=937" />

You may use a block as well. It will be executed in the `Avo::ExecutionContext` and you will have access to the `view`, `record`, `params`, `context`, `view_context`, and `current_user`.

```ruby
field :name, as: :text, required: -> { view == :new } # make the field required only on the new view and not on edit
```

## Disabled

When you need to prevent the user from editing a field, the `disabled` option will render it as `disabled` on <New /> and <Edit /> views and the value will not be passed to that record in the database. This prevents a bad actor to go into the DOM, enable that field, update it, and then submit it, updating the record.


```ruby
field :name, as: :text, disabled: true
```

<img :src="('/assets/img/fields-reference/readonly.png')" alt="Disabled option" class="border mb-4" />


### Disabled as a block

<VersionReq version="2.14" class="mt-2" />

You may use a block as well. It will be executed in the `Avo::ExecutionContext` and you will have access to the `view`, `record`, `params`, `context`, `view_context`, and `current_user`.

```ruby
field :id, as: :number, disabled: -> { view == :edit } # make the field disabled only on the new edit view
```

## Readonly

When you need to prevent the user from editing a field, the `readonly` option will render it as `disabled` on <New /> and <Edit /> views. This does not, however, prevent the user from enabling the field in the DOM and send an arbitrary value to the database.


```ruby
field :name, as: :text, readonly: true
```

<img :src="('/assets/img/fields-reference/readonly.png')" alt="Readonly option" class="border mb-4" />

## Default Value

When you need to give a default value to one of your fields on the <New /> view, you may use the `default` block, which takes either a fixed value or a block.

```ruby
# using a value
field :name, as: :text, default: 'John'

# using a callback function
field :level, as: :select, options: { 'Beginner': :beginner, 'Advanced': :advanced }, default: -> { Time.now.hour < 12 ? 'advanced' : 'beginner' }
```

## Help text

Sometimes you will need some extra text to explain better what the field is used for. You can achieve that by using the `help` method.
The value can be either text or HTML.

```ruby
# using the text value
field :custom_css, as: :code, theme: 'dracula', language: 'css', help: "This enables you to edit the user's custom styles."

# using HTML value
field :password, as: :password, help: 'You may verify the password strength <a href="http://www.passwordmeter.com/">here</a>.'
```

<img :src="('/assets/img/fields-reference/help-text.png')" alt="Help text" class="border mb-4" />

## Nullable

When a user uses the **Save** button, Avo stores the value for each field in the database. However, there are cases where you may prefer to explicitly instruct Avo to store a `NULL` value in the database row when the field is empty. You do that by using the `nullable` option, which converts `nil` and empty values to `NULL`.

You may also define which values should be interpreted as `NULL` using the `null_values` method.

```ruby
# using default options
field :updated_status, as: :status, failed_when: [:closed, :rejected, :failed], loading_when: [:loading, :running, :waiting], nullable: true

# using custom null values
field :body, as: :textarea, nullable: true, null_values: ['0', '', 'null', 'nil', nil]
```

## Link to record

Sometimes, on the <Index /> view, you may want a field in the table to be a link to that resource so that you don't have to scroll to the right to click on the <Show /> icon. You can use `link_to_record` to change a table cell to be a link to that record.

```ruby
# for id field
field :id, as: :id, link_to_record: true

# for text field
field :name, as: :text, link_to_record: true

# for gravatar field
field :email, as: :gravatar, link_to_record: true
```

<img :src="('/assets/img/fields-reference/as-link-to-resource.jpg')" alt="As link to resource" class="border mb-4" />

You can add this property on `Id`, `Text`, and `Gravatar` fields.

Optionally you can enable the global config `id_links_to_resource`. More on that on the [id links to resource docs page](./customization.html#id-links-to-resource).

Related:

 - [ID links to resource](./customization#id-links-to-resource)
 - [Resource controls on the left side](./customization#resource-controls-on-the-left-side)

## Align text on Index view

It's customary on tables to align numbers to the right. You can do that using the `html` option.

```ruby{2}
class Avo::Resources::Project < Avo::BaseResource
  field :users_required, as: :number, html: {index: {wrapper: {classes: "text-right"}}}
end
```

<img :src="('/assets/img/fields/index_text_align.jpg')" alt="Index text align" class="border mb-4" />

## Stacked layout

For some fields, it might make more sense to use all of the horizontal area to display it. You can do that by changing the layout of the field wrapper using the `stacked` option.

```ruby
field :meta, as: :key_value, stacked: true
```

#### `inline` layout (default)
![](/assets/img/fields/field_wrapper_layout_inline.jpg)

#### `stacked` layout

![](/assets/img/fields/field_wrapper_layout_stacked.jpg)

## Global `stacked` layout

You may also set all the fields to follow the `stacked` layout by changing the `field_wrapper_layout` initializer option from `:inline` (default) to `:stacked`.

```ruby
Avo.configure do |config|
  config.field_wrapper_layout = :stacked
end
```

Now, all fields will have the stacked layout throughout your app.

## Field options

:::option `use_resource`
<!-- TODO: this -->
:::

:::option `components`
The field's `components` option allows you to customize the view components used for rendering the field in all, `index`, `show` and `edit` views. This provides you with a high degree of flexibility.

### Ejecting the field components
To start customizing the field components, you can eject one or multiple field components using the `avo:eject` command. Ejecting a field component generates the necessary files for customization. Here's how you can use the `avo:eject` command:

#### Ejecting All Components for a Field

`$ rails g avo:eject --field-components <field_type> --scope admin`

Replace `<field_type>` with the desired field type. For instance, to eject components for a Text field, use:

`$ rails g avo:eject --field-components text --scope admin`

This command will generate the files for all the index, edit and show components of the Text field, for each field type the amount of components may vary.

For more advanced usage check the [`--fields-components` documentation](./customization.html#field_components)
:::warning Scope
If you don't pass a `--scope` when ejecting a field view component, the ejected component will override the default components all over the project.

Check [ejection documentation](./eject-views.html) for more details.
:::

### Customizing field components using `components` option

Here's some examples of how to use the `components` option in a field definition:

::: code-group
```ruby [Hash]
field :description,
  as: :text,
  components: {
    show_component: Avo::Fields::Admin::TextField::ShowComponent,
    edit_component: "Avo::Fields::Admin::TextField::EditComponent"
  }
```

```ruby [Block]
field :description,
  as: :text,
  components: -> do
    {
      show_component: Avo::Fields::Admin::TextField::ShowComponent,
      edit_component: "Avo::Fields::Admin::TextField::EditComponent"
    }
  end
```
:::

The components block it's executed using `Avo::ExecutionContent` and gives access to a bunch of variables as: `resource`, `record`, `view`, `params` and more.

`<view>_component` is the key used to render the field's `<view>`'s component, replace `<view>` with one of the views in order to customize a component per each view.

:::warning Initializer
It's important to keep the initializer on your custom components as the original field view component initializer.
:::


---
feedbackId: 1273
---

# Field wrappers

Each field display in your Avo resource has a field wrapper that helps display it in a cohesive way across the whole app.
This not only helps with a unitary design, but also with styling in a future theming feature.

:::info
You'll probably never have to use these components and helpers by themselves, but we'd like to document how they work as a future reference for everyone.
:::

# Index field wrapper

![](/assets/img/field-wrappers/index_field_wrapper.jpg)

Each field displayed on the <Index /> view is wrapped in this component that regulates the way content is displayed and makes it easy to control some options.

You may use the component `Avo::Index::FieldWrapperComponent` or the helper `index_field_wrapper`.

:::option `dash_if_blank`
This option renders a dash `—` if the content inside responds to true on the `blank?` method.
In the example below, we'd like to show the field as a red checkmark even if the content is `nil`.

#### Default

`true`

```erb
<%= index_field_wrapper **field_wrapper_args, dash_if_blank: false do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `center_content`
Wraps the content in a container with `flex items-center justify-center` classes making everything centered horizontally and vertically.

#### Default

`false`

```erb
<%= index_field_wrapper **field_wrapper_args, center_content: true do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `flush`
Removes the padding around the field allowing it to flow from edge to edge.

#### Default

`false`

```erb
<%= index_field_wrapper **field_wrapper_args, flush: false do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `field`
The instance of the field. It's usually passed in with the `field_wrapper_args`.

```erb
<%= index_field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `resource`
The instance of the resource. It's usually passed in with the `field_wrapper_args`.

```erb
<%= index_field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

# Show & Edit field wrapper

![](/assets/img/field-wrappers/show_field_wrapper.jpg)
![](/assets/img/field-wrappers/edit_field_wrapper.jpg)

The <Show /> and <Edit /> field wrappers are actually the same component.

You may use the component `Avo::Index::FieldWrapperComponent` or the helper `field_wrapper`.

## Field wrapper areas

![](/assets/img/field-wrappers/field_wrapper_areas.jpg)

Each field wrapper is divided in three areas.

### Label

This is where the field name is being displayed. This is also where the [required](./field-options#required) asterisk is added for required fields.

### Value

This area holds the actual value of the field or it's representation. The falue can be simple text or more advanced types like images, advanced pickers, and content editors.

At the bottom the [help text](./field-options#help-text) is going to be shown on the <Edit /> view and below it the validation error.

### Extra

This space is rarely used and it's there just to fill some horizontal space so the content doesn't span to the whole width and maintain its readability. With the introduction of the sidebar, this space will be ignored

## Options

:::option `dash_if_blank`
This option renders a dash `—` if the content inside responds to true on the `blank?` method.
In the example below, we'd like to show the field as a red checkmark even if the content is `nil`.

#### Default

`true`

```erb
<%= field_wrapper **field_wrapper_args, dash_if_blank: false do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `compact`
This renders the field in a more compact way by removing the **Extra** area and decresing the width of the **Label** and **Content** areas.

This is enabled on the fields displayed in actions.

#### Default

`false`

```erb
<%= field_wrapper **field_wrapper_args, compact: true do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `data`
Pass in some data attributes. Perhaps you would like to attach a StimulusJS controller to this field.

```erb
<%= field_wrapper **field_wrapper_args, data: {controller: "boolean-check"} do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `full_width`
This removes the **Extra** area and renders the **Value** area full width.

This is used on fields that require a larger area to be displayed like [WYSIWYG editors](./fields/trix), [`KeyValue`](./fields/key_value), or [file fields](./fields/files).

#### Default

`false`

```erb
<%= field_wrapper **field_wrapper_args, full_width: true do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `form`
The instance of the form that is going to be populated. It's usually passed in with the `field_wrapper_args` on the <Edit /> view.

```erb
<%= field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `field`
The instance of the field. It's usually passed in with the `field_wrapper_args`.

```erb
<%= field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `help`
The text that is going to be displayed below the actual field on the <Edit /> view.

```erb
<%= field_wrapper **field_wrapper_args, help: "Specify if the post is published or not." do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `label`
The text that is going to be displayed in the **Label** area. You might want to override it.

```erb
<%= field_wrapper **field_wrapper_args, label: "Post is published" do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `resource`
The instance of the resource. It's usually passed in with the `field_wrapper_args`.

```erb
<%= field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `stacked`
Display the field in a column layout with the label on top of the value

```erb
<%= field_wrapper **field_wrapper_args, style: "background: red" do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

![](/assets/img/field-wrappers/stacked_field.jpg)


:::option `style`
The you might want to pass some styles to the wrapper to change it's looks.

```erb
<%= field_wrapper **field_wrapper_args, style: "background: red" do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `view`
The view where the field is diplayed so it knows if it's a <Show /> or <Edit /> view. It's usually passed in with the `field_wrapper_args`.

```erb
<%= field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::



---
version: '1.0'
license: community
---

# Badge

The `Badge` field is used to display an easily recognizable status of a record.

<img :src="('/assets/img/fields/badge.jpg')" alt="Badge field" class="border mb-4" />

```ruby
field :stage,
  as: :badge,
  options: {
    info: [:discovery, :idea],
    success: :done,
    warning: 'on hold',
    danger: :cancelled,
    neutral: :drafting
  } # The mapping of custom values to badge values.
```

## Description

By default, the badge field supports five value types: `info` (blue), `success` (green), `danger` (red), `warning` (yellow) and `neutral` (gray). We can choose what database values are mapped to which type with the `options` parameter.

The `options` parameter is a `Hash` that has the state as the `key` and your configured values as `value`. The `value` param can be a symbol, string, or array of symbols or strings.

The `Badge` field is intended to be displayed only on **Index** and **Show** views. In order to update the value shown by badge field you need to use another field like [Text](#text) or [Select](#select), in combination with `hide_on: index` and `hide_on: show`.


## Options

:::option `options`

The options should be a hash with the keys of one of the five available types (`info`, `success`, `warning`, `danger`, `neutral`) and the values matching your record's database values.

#### Default value

`{ info: :info, success: :success, danger: :danger, warning: :warning, neutral: :neutral }`

Below is an example of how you can use two fields in that combination.
:::

## Examples

```ruby
field :stage, as: :select, hide_on: [:show, :index], options: { 'Discovery': :discovery, 'Idea': :idea, 'Done': :done, 'On hold': 'on hold', 'Cancelled': :cancelled, 'Drafting': :drafting }, placeholder: 'Choose the stage.'
field :stage, as: :badge, options: { info: [:discovery, :idea], success: :done, warning: 'on hold', danger: :cancelled, neutral: :drafting }
```



---
version: '1.0'
license: community
---

# Boolean

The `Boolean` field renders a `input[type="checkbox"]` on **Form** views and a nice green `check` icon/red `X` icon on the **Show** and **Index** views.

<img :src="('/assets/img/fields/boolean.jpg')" alt="Boolean field" title="Boolean field on the Show view" class="border mb-4" />

```ruby
field :is_published,
  as: :boolean,
  name: 'Published',
  true_value: 'yes',
  false_value: 'no'
```

## Options

:::option `true_value`

What should count as true. You can use `1`, `yes`, or a different value.

#### Default value

`[true, "true", "1"]`

:::
:::option `false_value`

What should count as false. You can use `0`, `no`, or a different value.

#### Default value

`[false, "false", "0"]`
:::


---
version: '1.0'
license: community
---

# Boolean Group

<img :src="('/assets/img/fields/boolean-group.jpg')" alt="Boolean group field" class="border mb-4" />

The `BooleanGroup` is used to update a `Hash` with `string` keys and `boolean` values in the database.

It's useful when you have something like a roles hash in your database.

```ruby
field :roles, as: :boolean_group, name: 'User roles', options: { admin: 'Administrator', manager: 'Manager', writer: 'Writer' }
```

## Options

:::option `options`
`options` should be a `Hash` with the keys to one of the four available types (`info`, `success`, `warning`, `danger`) and the values matching your record's database values.

#### Default value

```ruby
{
  info: :info,
  success: :success,
  danger: :danger,
  warning: :warning
}
```
:::

## Example DB payload

```ruby
# Example boolean group object stored in the database
{
  "admin": true,
  "manager": true,
  "creator": true,
}
```


---
version: '1.0'
license: community
---

# Code

<img :src="('/assets/img/fields/code.jpg')" alt="Code field" class="border mb-4" />

The `Code` field generates a code editor using [codemirror](https://codemirror.net/) package. This field is hidden on **Index** view.

```ruby
field :custom_css, as: :code, theme: 'dracula', language: 'css'
```

## Options

:::option `theme`

Customize the color theme.

#### Default value

`material-darker`

#### Possible values

`material-darker`, `eclipse`, or `dracula`

Preview the themes here: [codemirror-themes](https://codemirror.net/demo/theme.html).
:::

:::option `language`
Customize the syntax highlighting using the language method.

#### Default value

`javascript`

#### Possible values

`css`, `dockerfile`, `htmlmixed`, `javascript`, `markdown`, `nginx`, `php`, `ruby`, `sass`, `shell`, `sql`, `vue` or `xml`.
:::

:::option `height`
Customize the height of the editor.

#### Default value

`auto`

#### Possible values

`auto`, or any value in pixels (eg `height: 250px`).
:::

:::option `tab_size`
Customize the tab_size of the editor.

#### Default value

`2`

#### Possible values

Any integer value.
:::

:::option `indent_with_tabs`
Customize the type of indentation.

#### Default value

`false`

#### Possible values

`true` or `false`
:::

:::option `line_wrapping`
Customize whether the editor should apply line wrapping.

#### Default value

`true`

#### Possible values

`true` or `false`
:::


---
version: '1.0'
license: community
---

# Country

`Country` field generates a [Select](#select) field on **Edit** view that includes all [ISO 3166-1](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) countries. The value stored in the database will be the country code, and the value displayed in Avo will be the name of the country.

:::warning
You must manually require the `countries` gem in your `Gemfile`.

```ruby
# All sorts of useful information about every country packaged as convenient little country objects.
gem "countries"
```
:::

```ruby
field :country, as: :country, display_code: true
```

## Options

:::option `display_code`

You can easily choose to display the `code` of the country on **Index** and **Show** views by declaring `display_code` to `true`.

### Default value

`false`

### Possible values

`true`, `false`
:::


---
version: '1.0'
license: community
---

# Date

The `Date` field may be used to display date values.

```ruby
field :birthday,
  as: :date,
  first_day_of_week: 1,
  picker_format: "F J Y",
  format: "yyyy-LL-dd",
  placeholder: "Feb 24th 1955"
```

## Options

:::option `format`
Format the date shown to the user on the `Index` and `Show` views.

#### Default

`yyyy-LL-dd`

#### Possible values

Use [`luxon`](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) formatting tokens.
:::
:::option `picker_format`
Format the date shown to the user on the `Edit` and `New` views.

#### Default

`Y-m-d`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/formatting) formatting tokens.
:::

:::option `picker_options`;
Passes the options here to [flatpickr](https://flatpickr.js.org/).

#### Default

`{}`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/options) options.

:::warning
These options may override other options like `picker_options`.
:::

::::
<!-- @include: ./../common/date_date_time_common.md-->


---
version: '1.0'
license: community
---

# DateTime

<img :src="('/assets/img/fields/date-time.jpg')" alt="DateTime field" class="border mb-4" />

The `DateTime` field is similar to the Date field with two new attributes. `time_24hr` tells flatpickr to use 24 hours format and `timezone` to tell it in what timezone to display the time. By default, it uses your browser's timezone.

```ruby
field :joined_at,
  as: :date_time,
  name: "Joined at",
  picker_format: "Y-m-d H:i:S",
  format: "yyyy-LL-dd TT",
  time_24hr: true,
  timezone: "PST"
```

## Options

:::option `format`

Format the date shown to the user on the `Index` and `Show` views.

#### Default

`yyyy-LL-dd TT`

#### Possible values

Use [`luxon`](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) formatting tokens.
:::
:::option `picker_format`
Format the date shown to the user on the `Edit` and `New` views.

#### Default

`Y-m-d H:i:S`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/formatting) formatting tokens.
:::
:::option `time_24hr`
Displays time picker in 24-hour mode or AM/PM selection.

<!-- @include: ./../common/default_boolean_false.md -->
:::
:::option `timezone`
Select in which timezone the values should be cast.

#### Default

If nothing is selected, the browser's timezone will be used.

#### Possible values

[TZInfo identifiers](https://api.rubyonrails.org/classes/ActiveSupport/TimeZone.html).

```ruby{1,3}
field :started_at, as: :date_time, timezone: "EET"
# Or
field :started_at, as: :date_time, timezone: -> { record.timezone }
```
:::

:::option `picker_options`
Passes the options here to [flatpickr](https://flatpickr.js.org/).

#### Default

`{}`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/options) options.
:::

:::warning
These options may override other options like `time_24hr`.
:::

<!-- @include: ./../common/date_date_time_common.md-->


---
version: '1.0'
license: community
---

# External image

You may have a field in the database that has the URL to an image, and you want to display that in Avo. That is where the `ExternalImage` field comes in to help.

It will take that value, insert it into an `image_tag`, and display it on the `Index` and `Show` views.

```ruby
field :logo, as: :external_image
```

## Options

:::option `width`

#### Default value

`40`

#### Possible values

Use any number to size the image.
:::

:::option `height`
#### Default value

`40`

#### Possible values

Use any number to size the image.
:::

:::option `radius`
#### Default value

`0`

#### Possible values

Use any number to set the radius value.
:::

<!-- @include: ./../common/link_to_record_common.md-->

## Use computed values

Another common scenario is to use a value from your database and create a new URL using a computed value.

```ruby
field :logo, as: :external_image do
  "//logo.clearbit.com/#{URI.parse(record.url).host}?size=180"
rescue
  nil
end
```

## Use in the Grid `cover` position

Another common place you could use it is in the grid `:cover` position.

```ruby
cover :logo, as: :external_image, link_to_record: true do
  "//logo.clearbit.com/#{URI.parse(record.url).host}?size=180"
rescue
  nil
end
```


---
version: '1.0'
license: community
---

# File

<!-- @include: ./../common/files_gem_common.md-->

The `File` field is the fastest way to implement file uploads in a Ruby on Rails app using [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html).

Avo will use your application's Active Storage settings with any supported [disk services](https://edgeguides.rubyonrails.org/active_storage_overview.html#disk-service).

```ruby
field :avatar, as: :file, is_image: true
```

## Options

<!-- @include: ./../common/file_options_common.md-->
<!-- @include: ./../common/link_to_record_common.md-->

<!-- @include: ./../common/file_other_common.md-->


---
version: '1.0'
license: community
---

# Files

<!-- @include: ./../common/files_gem_common.md-->

The `Files` field is similar to [`File`](./file) and enables you to upload multiple files at once using the same easy-to-use [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html) implementation.

```ruby
field :documents, as: :files
```

## Options
<!-- @include: ./../common/file_options_common.md-->

<!-- @include: ./../common/file_other_common.md-->

:::option `view_type`
![](/assets/img/files_view_types.gif)

Set the default `view_type`.

#### Default

`grid`

#### Possible values

`grid`, `list`
:::

:::option `hide_view_type_switcher`
Option to hide the view type switcher component.

#### Default

`false`

#### Possible values

`true`, `false`
:::


---
version: '1.0'
license: community
---

# Gravatar

The `Gravatar` field turns an email field from the database into an avatar image if it's found in the [Gravatar](https://en.gravatar.com/site/implement/images/) database.

```ruby
field :email,
  as: :gravatar,
  rounded: false,
  size: 60,
  default_url: 'some image url'
```

## Options
:::option `rounded`
Choose whether the rendered avatar should be rounded or not on the `Index` view.

On `Show`, the image is always a `square,` and the size is `responsive`.

<!-- @include: ./../common/default_boolean_true.md -->
:::

:::option `size`
Set the size of the avatar.

#### Default

`32`

#### Possible values

Any number in pixels. Remember that the size will influence the `Index` table row height.
:::

:::option `default`
Set the default image if the email address was not found in Gravatar's database.

#### Default

`32`

#### Possible values

Any number in pixels. Remember that the size will influence the `Index` table row height.
:::

<!-- @include: ./../common/link_to_record_common.md-->

## Using computed values

You may also pass in a computed value.

```ruby
field :email, as: :gravatar do
  "#{record.google_username}@gmail.com"
end
```


---
version: '1.0'
license: community
---

# Heading

:::code-group
```ruby [Field id]
field :user_information, as: :heading
```

```ruby [Label]
field :some_id, as: :heading, label: "user information"
```

```ruby [Computed]
field :some_id, as: :heading do
  "user information"
end
```
:::


<img :src="('/assets/img/fields/heading.png')" alt="Heading field" class="border mb-4" />

The `Heading` field displays a header that acts as a separation layer between different sections.

`Heading` is not assigned to any column in the database and is only visible on the `Show`, `Edit` and `Create` views.

:::warning Computed heading
The computed fields are not rendered on form views, same with heading field, if computed syntax is used it will not be rendered on the form views. Use `label` in order to render it on **all** views.
:::

## Options

:::option `as_html`
The `as_html` option will render it as HTML.

```ruby
field :dev_heading, as: :heading, as_html: true do
  '<div class="underline uppercase font-bold">DEV</div>'
end
```

<!-- @include: ./../common/default_boolean_false.md -->
:::

:::option `label`
The content of `label` is the content displayed on the heading space.

```ruby
field :some_id, as: :heading, label: "user information"
```
:::


---
version: '1.0'
license: community
---

# Hidden

There are scenarios where in order to be able to submit a form, an input should be present but inaccessible to the user. An example of this might be where you want to set a field by default without the option to change, or see it. `Hidden` will render a `<input type="hidden" />` element on the `Edit` and `New` page.

> Hidden will only render on the `Edit` and `New` views.

### Example usage:
```ruby
# Basic
field :group_id, as: :hidden

# With default
field :user_id, as: :hidden, default: -> { current_user.id }

# If the current_user is a admin
# 1. Allow them to see and select a user.
# 2. Remove the user_id field to prevent user_id it from overriding the user selection.
# Otherwise set the user_id to the current user and hide the field.
field :user, as: :belongs_to, visible: -> { context[:current_user].admin? }
field :user_id, as: :hidden, default: -> { current_user.id }, visible: -> { !context[:current_user].admin? }
```


---
version: '1.0'
license: community
---

# ID

The `id` field is used to show the record's id. By default, it's visible only on the `Index` and `Show` views. That is a good field to add the `link_to_record` option to make it a shortcut to the record `Show` page.

```ruby
field :id, as: :id
```

## Options

<!-- @include: ./../common/link_to_record_common.md-->



---
version: '1.0'
license: community
---

# KeyValue

<img :src="('/assets/img/fields/key-value.jpg')" alt="KeyValue field" class="border mb-4" />

The `KeyValue` field makes it easy to edit flat key-value pairs stored in `JSON` format in the database.

```ruby
field :meta, as: :key_value
```

## Options

:::option `key_label`
Customize the label for the key header.

#### Default

`I18n.translate("avo.key_value_field.key")`

#### Possible values

Any string value.
:::

:::option `value_label`
Customize the label for the value header.

#### Default

`I18n.translate("avo.key_value_field.value")`

#### Possible values

Any string value.
:::

:::option `action_text`
Customize the label for the add row button tooltip.

#### Default

`I18n.translate("avo.key_value_field.add_row")`

#### Possible values

Any string value.
:::

:::option `delete_text`
Customize the label for the delete row button tooltip.

#### Default

`I18n.translate("avo.key_value_field.delete_row")`

#### Possible values

Any string value.
:::

:::option `disable_editing_keys`
Toggle on/off the ability to edit the keys for that field. Turning this off will allow the user to customize only the value fields.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `disable_adding_rows`
Toggle on/off the ability to add new rows.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `disable_deleting_rows`
Toggle on/off the ability to delete rows from that field. Turning this on will prevent the user from deleting existing rows.

<!-- @include: ./../common/default_boolean_false.md-->
:::

## Customizing the labels

You can easily customize the labels displayed in the UI by mentioning custom values in `key_label`, `value_label`, `action_text`, and `delete_text` properties when defining the field.

```ruby
field :meta, # The database field ID
  as: :key_value, # The field type.
  key_label: "Meta key", # Custom value for key header. Defaults to 'Key'.
  value_label: "Meta value", # Custom value for value header. Defaults to 'Value'.
  action_text: "New item", # Custom value for button to add a row. Defaults to 'Add'.
  delete_text: "Remove item" # Custom value for button to delete a row. Defaults to 'Delete'.
```

## Enforce restrictions

You can enforce some restrictions by removing the ability to edit the field's key by setting `disable_editing_keys` to `true`. Be aware that this option will also disable adding rows as well. You can separately remove the ability to add a new row by setting `disable_adding_rows` to `true`. Deletion of rows can be enforced by setting `disable_deleting_rows` to `true`.

```ruby
field :meta, # The database field ID
  as: :key_value, # The field type.
  disable_editing_keys: false, # Option to disable the ability to edit keys. Implies disabling to add rows. Defaults to false.
  disable_adding_rows: false, # Option to disable the ability to add rows. Defaults to false.
  disable_deleting_rows: false # Option to disable the ability to delete rows. Defaults to false.
```

`KeyValue` is hidden on the `Index` view.


---
version: '2.30'
license: community
betaStatus: Open beta
---

# Location

The `Location` field is used to display a point on a map.

```ruby
field :coordinates, as: :location
```

<img :src="('/assets/img/fields/location-field.png')" alt="Location field" class="border mb-4" />

:::warning
You need to add the `mapkick-rb` (not `mapkick`) gem to your `Gemfile` and have the `MAPBOX_ACCESS_TOKEN` environment variable with a valid [Mapbox](https://account.mapbox.com/auth/signup/) key.
:::

## Description

By default, the location field is attached to one database column that has the coordinates in plain text with a comma `,` joining them (`latitude,longitude`).
Ex: `44.427946,26.102451`

Avo will take that value, split it by the comma and use the first element as the `latitude` and the second one as the `longitude`.

On the <Show /> view you'll get in interactive map and on the edit you'll get one field where you can edit the coordinates.

## Options

:::option `stored_as`

It's customary to have the coordinates in two distinct database columns, one named `latitude` and another `longitude`.

You can instruct Avo to use those two with the `stored_as` option

#### Default value

`nil`

#### Possible values

`nil`, or `[:latitude, :longitude]`.

```ruby
field :coordinates, as: :location, stored_as: [:latitude, :longitude]
```

By using this notation, Avo will grab the `latitude` and `longitude` from those particular columns to compose the map.

This will also render the <Edit /> view with two separate fields to edit the coordinates.

<img :src="('/assets/img/fields/location-edit.png')" alt="Location field" class="border mb-4" />


---
version: '1.0'
license: community
---

# Markdown

<img :src="('/assets/img/fields/markdown.jpg')" alt="Trix field" class="border mb-4" />

The `Markdown` field renders a [EasyMDE Markdown Editor](https://github.com/Ionaru/easy-markdown-editor) and is associated with a text or textarea column in the database.
`Markdown` field converts text within the editor into raw Markdown text and stores it back in the database.

The Markdown field is hidden from the **Index** view.


```ruby
field :description, as: :markdown
```

## Options

:::option `always_show`

By default, the content of the `Markdown` field is not visible on the `Show` view, instead, it's hidden under a `Show Content` link that, when clicked, displays the content. You can set Markdown to always display the content by setting `always_show` to `true`.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `height`
Sets the value of the editor

#### Default

`auto`


#### Possible values

`auto` or any number in pixels.
:::

:::option `spell_checker`
Toggles the editor's spell checker option.

```ruby
field :description, as: :markdown, spell_checker: true
```

<!-- @include: ./../common/default_boolean_false.md-->
:::

## Enable spell checker


---
version: '1.0'
license: community
---

# Number

The `number` field renders a `input[type="number"]` element.

```ruby
field :age, as: :number
```

## Options

:::option `min`
Set the `min` attribute.

#### Default

`nil`

#### Possible values

Any number.
:::

:::option `max`
Set the `max` attribute.

#### Default

`nil`

#### Possible values

Any number.
:::

:::option `step`
Set the `step` attribute.

#### Default

`nil`

#### Possible values

Any number.
:::

## Examples

```ruby
field :age, as: :number, min: 0, max: 120, step: 5
```


---
version: '1.0'
license: community
---

# Password

The `Password` field renders a `input[type="password"]` element for that field. By default, it's visible only on the `Edit` and `New` views.

```ruby
field :password, as: :password
```

Related:

- [Devise password optional](./../resources#devise-password-optional)



---
version: '3.0'
license: community
---

# Preview

The `Preview` field adds a tiny icon to each row on the <Index /> view that, when hovered, it will display a preview popup with more information regarding that record.

![](/assets/img/fields/preview/preview.gif)

```ruby
field :preview, as: :preview
```

## Define the fields

The fields shown in the preview popup are configured similarly to how you [configure the visibility in the different views](./../resources#views).

When you want to display a field in the peview popup simply call the `show_on :preview` option on the field.

```ruby
  field :name, as: :text, show_on :preview
```


---
version: '1.0'
license: community
---

# Progress bar

The `ProgressBar` field renders a `progress` element on `Index` and `Show` views and and a `input[type=range]` element on `Edit` and `New` views.

```ruby
field :progress, as: :progress_bar
```
<img :src="('/assets/img/custom-fields/progress-index.jpg')" alt="Progress bar custom field on index" class="border mb-4" />

## Options

:::option `max`
Sets the maximum value of the progress bar.

#### Default

`100`

#### Possible values

Any number.
:::

:::option `step`
Sets the step in which the user can move the slider on the `Edit` and `New` views.

#### Default

`1`

#### Possible values

Any number.
:::

:::option `display_value`
Choose if the value is displayed on the `Edit` and `New` views above the slider.

<!-- @include: ./../common/default_boolean_true.md-->
:::

:::option `value_suffix`
Set a string value to be displayed after the value above the progress bar.

#### Default

`nil`

#### Possible values

`%` or any other string.
:::

## Examples

```ruby
field :progress,
  as: :progress_bar,
  max: 150,
  step: 10,
  display_value: true,
  value_suffix: "%"
```

<img :src="('/assets/img/custom-fields/progress-edit.jpg')" alt="Progress bar custom field edit" class="border mb-4" />


---
version: '1.0'
license: community
---

# Select

The `Select` field renders a `select` field.

```ruby
field :type, as: :select, options: { 'Large container': :large, 'Medium container': :medium, 'Tiny container': :tiny }, display_with_value: true, placeholder: 'Choose the type of the container.'
```

## Options

:::option `options`
A `Hash` representing the options that should be displayed in the select. The keys represent the labels, and the values represent the value stored in the database.

The options get cast as `ActiveSupport::HashWithIndifferentAccess` objects if they are a `Hash`.

#### Default

`nil`

#### Possible values

`{ 'Large container': :large, 'Medium container': :medium, 'Tiny container': :tiny }` or any other `Hash`.
:::

:::option `enum`
Set the select options as an Active Record [enum](https://edgeapi.rubyonrails.org/classes/ActiveRecord/Enum.html). You may use `options` or `enum`, not both.

```ruby{3,10}
# app/models/project.rb
class Project < ApplicationRecord
  enum type: { 'Large container': 'large', 'Medium container': 'medium', 'Tiny container': 'small' }
end

# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  field :type,
    as: :select,
    enum: ::Project.types,
    display_with_value: true,
    placeholder: 'Choose the type of the container.'
end
```

#### Default

`nil`

#### Possible values

`Post::statuses` or any other `enum` stored on a model.
:::

:::option `display_value`
You may want to display the values from the database and not the labels of the options. You may change that by setting `display_value` to `true`.

```ruby{5}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  field :type,
    as: :select,
    display_with_value: true
end
```

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `include_blank`
## Include blank

The `Select` field also has the `include_blank` option. That can have three values.

If it's set to `false` (default), it will not show any blank option but only the options you configured.

If it's set to `true` and you have a `placeholder` value assigned, it will use that placeholder string as the first option.

If it's a string `include_blank: "No country"`, the `No country` string will appear as the first option in the `<select>` and will set the value empty or `nil` depending on your settings.

```ruby{5}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  field :type,
    as: :select,
    include_blank: 'No type'
end
```

#### Default

`nil`

#### Possible values

`nil`, `true`, `false`, or a string to be used as the first option.
:::

## Computed options

You may want to compute the values on the fly for your `Select` field. You can use a lambda for that where you have access to the `record`, `resource`, `view`, and `field` properties where you can pull data off.

```ruby{5-7}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  field :type,
    as: :select,
    options: -> do
      record.get_types_from_the_database.map { |type| [type.name, type.id] }
    end,
    placeholder: 'Choose the type of the container.'
end
```

The output value must be a supported [`options_for_select`](https://apidock.com/rails/ActionView/Helpers/FormOptionsHelper/options_for_select) value.


---
version: '1.0'
license: community
---

# Status

Displays the status of a record in three ways; `loading`, `failed`, `success`, or `neutral`.

You may select the `loading`, `failed`, and `success` state values, and everything else will fall back to `neutral`.

```ruby
field :progress,
  as: :status,
  failed_when: [:closed, :rejected, :failed],
  loading_when: [:loading, :running, :waiting, "in progress"],
  success_when: [:done],
```

<img :src="('/assets/img/fields/status.png')" alt="Status field" class="border mb-4" />

## Options

:::option `failed_when`
Set the values for when the status is `failed`.

#### Default value

`[:failed]`

#### Possible values

`[:closed, :rejected, :failed]` or an array with strings or symbols that indicate the `failed` state.
:::

:::option `loading_when`
Set the values for when the status is `loading`.

#### Default value

`[:waiting, :running]`

#### Possible values

`[:loading, :running, :waiting, "in progress"]` or an array with strings or symbols that indicate the `loading` state.
:::

:::option `success_when`
Set the values for when the status is `success`.

#### Default value

`[]`

#### Possible values

`[:done, :success, :deployed, "ok"]` or an array with strings or symbols that indicate the `success` state.
:::




---
license: pro
version: '2.6.0'
demoVideo: https://youtu.be/DKKSjNUvuBA
---

# Tags field

Adding a list of things to a record is something we need to do pretty frequently; that's why having the `tags` field is helpful.

```ruby
field :skills, as: :tags
```

<img :src="('/assets/img/fields/tags-field/basic.gif')" alt="Avo tags field" class="border mb-4" />

## Options

:::option `suggestions`

You can give suggestions to your users to pick from which will be displayed to the user as a dropdown under the field.

```ruby{4,10-12}
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :skills, as: :tags, suggestions: -> { record.skill_suggestions }
  end
end

# app/models/course.rb
class Course < ApplicationRecord
  def skill_suggestions
    ['example suggestion', 'example tag', self.name]
  end
end
```

<img :src="('/assets/img/fields/tags-field/suggestions.gif')" alt="Avo tags field" class="border mb-4" />

#### Default

`[]`

#### Possible values

The `suggestions` option can be an array of strings, an object with the keys `value`, `label`, and (optionally) `avatar`, or a lambda that returns an array of that type of object.

The lambda is run inside a [`ExecutionContext`](./../execution-context.html), so it has access to the `record`, `resource`, `request`, `params`, `view`, and `view_context` along with other things.

```ruby{5-21}
# app/models/post.rb
class Post < ApplicationRecord
  def self.tags_suggestions
    # Example of an array of more advanced objects
    [
      {
        value: 1,
        label: 'one',
        avatar: 'https://images.unsplash.com/photo-1560363199-a1264d4ea5fc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop',
      },
      {
        value: 2,
        label: 'two',
        avatar: 'https://images.unsplash.com/photo-1567254790685-6b6d6abe4689?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop',
      },
      {
        value: 3,
        label: 'three',
        avatar: 'https://images.unsplash.com/photo-1560765447-da05a55e72f8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop',
      },
    ]
  end
end
```

:::

:::option `dissallowed`
The `disallowed` param works similarly to `suggestions`. Use it to prevent the user from adding specific values.

```ruby{3}
field :skills,
  as: :tags,
  disallowed: ["not", "that"]
```

<img :src="('/assets/img/fields/tags-field/disallowed.gif')" alt="Avo tags field" class="border mb-4" />

#### Default

`[]`

#### Possible values

An array of strings representing the value that can't be stored in the database.
:::

:::option `enforce_suggestions`
Set whether the field should accept other values outside the suggested ones. If set to `true` the user won't be able to add anything else than what you posted in the `suggestions` option.

```ruby{4}
field :skills,
  as: :tags,
  suggestions: %w(one two three),
  enforce_suggestions: true
```

<img :src="('/assets/img/fields/tags-field/enforce_suggestions.gif')" alt="Avo tags field" class="border mb-4" />

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `suggestions_max_items`
Set of suggestions that can be displayed at once. The excessive items will be hidden and the user will have to narrow down the query to see them.

```ruby{4}
field :skills,
  as: :tags,
  suggestions: %w(one two three),
  suggestions_max_items: 2
```

<img :src="('/assets/img/fields/tags-field/suggestions_max_items.gif')" alt="Avo tags field - suggestions max items option" class="border mb-4" />

#### Default

`20`

#### Possible values

Integers

:::option `close_on_select`
Set whether the `suggestions` dropdown should close after the user makes a selection.

```ruby{4}
field :items,
  as: :tags,
  suggestions: -> { Post.tags_suggestions },
  close_on_select: true
```

<img :src="('/assets/img/fields/tags-field/close_on_select.gif')" alt="Avo tags field" class="border mb-4" />

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `acts_as_taggable_on`
Set the field the `acts_as_taggable_on` is set.

#### Default

`nil`

#### Possible values

Any string or symbol you have configured on your corresponding model.
:::

:::option `disallowed`
#### Default

`false`

#### Possible values

`true`, `false`
:::

:::option `delimiters`

Set the characters that will cut off the content into tags when the user inputs the tags.

```ruby{3}
field :skills,
  as: :tags,
  delimiters: [",", " "]
```

<img :src="('/assets/img/fields/tags-field/delimiters.gif')" alt="Avo tags field" class="border mb-4" />

#### Default

`[","]`

#### Possible values

`[",", " "]`

Valid values are comma `,` and space ` `.

:::


:::option `mode`

By default, the tags field produces an array of items (ex: categories for posts), but in some scenarios you might want it to produce a single value (ex: dynamically search for users and select just one). Use `mode: :select` to make the field produce a single value as opposed to an array of values.

```ruby{3}
field :skills,
  as: :tags,
  mode: :select
```

#### Default

`nil`

#### Possible values

Valid values are `nil` for array values and `select` for a single value.

![](/assets/img/fields/tags-field/mode-select.gif)

:::

<Option name="`fetch_values_from`">

There might be cases where you want to dynamically fetch the values from an API. The `fetch_values_from` option enables you to pass a URL from where the field should suggest values.

This options works wonderful when used in [Actions](./../actions.md).

```ruby{3}
field :skills,
  as: :tags,
  fetch_values_from: "/avo/resources/skills/skills_for_user"
```

When the user searches for a record, the field will perform a request to the server to fetch the records that match that query.

![](/assets/img/fields/tags-field/mode-select.gif)

#### Default

`nil`

#### Possible values

Valid values are `nil`, a string, or a block that evaluates to a string. The string should resolve to an enddpoint that returns an array of objects with the keys `value` and `label`.

::: code-group

```ruby{2-10} [app/controllers/avo/skills_controller.rb]
class Avo::SkillsController < Avo::ResourcesController
  def skills_for_user
    skills = Skill.all.map do |skill|
      {
        value: skill.id,
        label: skill.name
      }
    end
    render json: skills
  end
end
```

```ruby{13} [config/routes.rb]
Rails.application.routes.draw do
  # your routes

  authenticate :user, ->(user) { user.is_admin? } do
    mount Avo::Engine, at: Avo.configuration.root_path
  end
end

if defined? ::Avo
  Avo::Engine.routes.draw do
    scope :resources do
      # Add route for the skills_for_user action
      get "skills/skills_for_user", to: "skills#skills_for_user"
    end
  end
end
```

:::info
When using the `fetch_labels_from` pattern, on the <Show /> and <Index /> views you will see the `id` of those options instead of the label.
That is expected, because you are storing the `id`s in the database and the field can't know what labels those `id`s have.

To mitigate that use the `fetch_labels` option.
:::

</Option>

:::option `fetch_labels`
The `fetch_labels` option allows you to pass an array of custom strings to be displayed on the tags field. This option is useful when Avo is displaying a bunch of IDs and you want to show some custom label from that ID's record.

```ruby{4-6}
field :skills,
  as: :tags,
  fetch_values_from: "/avo/resources/skills/skills_for_user",
  fetch_labels: -> {
    Skill.where(id: record.skills).pluck(:name)
  }
```

In the above example, `fetch_labels` is a lambda that retrieves the names of the skills stored in the record's `skills` property.

When you use `fetch_labels`, Avo passes the current `resource` and `record` as arguments to the lambda function. This gives you access to the hydrated resource and the current record.

#### Default

Avo's default behavior on tags

#### Possible values

Array of strings
:::

## PostgreSQL array fields

You can use the tags field with the PostgreSQL array field.

```ruby{11}
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :skills, as: :tags
  end
end

# db/migrate/add_skills_to_courses.rb
class AddSkillsToCourses < ActiveRecord::Migration[6.0]
  def change
    add_column :courses, :skills, :text, array: true, default: []
  end
end
```

## Acts as taggable on

One popular gem used for tagging is [`acts-as-taggable-on`](https://github.com/mbleigh/acts-as-taggable-on). The tags field integrates very well with it.

You need to add `gem 'acts-as-taggable-on', '~> 9.0'` in your `Gemfile`, add it to your model `acts_as_taggable_on :tags`, and use `acts_as_taggable_on` on the field.

```ruby{6}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :tags,
      as: :tags,
      acts_as_taggable_on: :tags,
      close_on_select: false,
      placeholder: 'add some tags',
      suggestions: -> { Post.tags_suggestions },
      enforce_suggestions: true,
      help: 'The only allowed values here are `one`, `two`, and `three`'
  end
end

# app/models/post.rb
class Post < ApplicationRecord
  acts_as_taggable_on :tags
end
```

That will let Avo know which attribute should be used to fill with the user's tags.

:::info Related
You can set up the tags as a resource using [this guide](./../recipes/act-as-taggable-on-integration).
:::

## Array fields

We haven't tested all the scenarios, but the tags field should play nicely with any array fields provided by Rails.

```ruby{10-12,14-16}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :items, as: :tags
  end
end

# app/models/post.rb
class Post < ApplicationRecord
  def items=(items)
    puts ["items->", items].inspect
  end

  def items
    %w(1 2 3 4)
  end
end
```


---
version: '1.0'
license: community
---

# Text

The `Text` field renders a regular `<input type="text" />` element.

```ruby
field :title, as: :text
```
## Options

:::option `as_html`
Displays the value as HTML on the `Index` and `Show` views. Useful when you need to link to another record.

```ruby
field :title, as: :text, as_html: true do
  '<a href="https://avohq.io">Avo</a>'
end
```

<!-- @include: ./../common/default_boolean_false.md-->
:::


:::option `protocol`
Render the value with a protocol prefix on the `Index` and `Show` views. So, for example, you can make a text field a `mailto` link very quickly.

```ruby{3}
field :email,
  as: :text,
  protocol: :mailto
```

<DemoVideo demo-video="https://www.youtube.com/watch?v=MfryUtcXqvU&t=662s" />

#### Default

`nil`

#### Possible values

`mailto`, `tel`, or any other string value you need to pass to it.
:::

<!-- @include: ./../common/link_to_record_common.md-->

## Customization

You may customize the `Text` field with as many options as you need.

```ruby
field :title, # The database field ID
  as: :text, # The field type
  name: 'Post title', # The label you want displayed
  required: true, # Display it as required
  readonly: true, # Display it disabled
  as_html: true # Should the output be parsed as html
  placeholder: 'My shiny new post', # Update the placeholder text
  format_using: -> { value.truncate 3 } # Format the output
```


---
version: '1.0'
license: community
---

# Textarea

The `textarea` field renders a `<textarea />` element.

```ruby
field :body, as: :textarea
```

## Options


:::option `rows`
Set the number of rows visible in the `Edit` and `New` views.

```ruby
field :body, as: :textarea, rows: 5
```

#### Default

`5`

#### Possible values

Any integer.
:::


---
version: '2.18'
license: community
---

# Time

<!-- Replace this image with one of the Time field -->
![](/assets/img/fields/time.png)

The `Time` field is similar to the [DateTime](./date_time) field and uses the time picker of flatpickr (without the calendar). You can use the `time_24hr` option for flatpickr to use the 24-hour format. Add the option `relative: false` if you want the time to stay absolute and not change based on the browser's timezone.

```ruby
field :starting_at,
  as: :time,
  picker_format: 'H:i',
  format: "HH:mm",
  relative: true,
  picker_options: {
    time_24hr: true
  }
```


:::option `format`

Format the date shown to the user on the `Index` and `Show` views.

#### Default

`TT`

#### Possible values

Use [`luxon`](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) formatting tokens.
:::

:::option `picker_format`
Format the date shown to the user on the `Edit` and `New` views.

#### Default

`H:i:S`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/formatting) formatting tokens.
:::

:::option `picker_options`;
Passes the options here to [flatpickr](https://flatpickr.js.org/).

#### Default

`{}`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/options) options.

:::warning
These options may override other options like `picker_options`.
:::

::::


---
version: '1.0'
license: community
---

# Trix

```ruby
field :body, as: :trix
```

The `Trix` field renders a [WYSIWYG Editor](https://trix-editor.org/) and can be associated with a `string` or `text` column in the database. The value stored in the database will be the editor's resulting `HTML` content.


<img :src="('/assets/img/fields/trix.jpg')" alt="Trix field" class="border mb-4" />

Trix field is hidden from the `Index` view.

## Options

:::option `always_show`
By default, the content of the `Trix` field is not visible on the `Show` view; instead, it's hidden under a `Show Content` link that, when clicked, displays the content. You can set Markdown to display the content by setting `always_show` to `true`.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `attchments_disabled`
Hides the attachments button from the Trix toolbar.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `hide_attachment_filename`
Hides the attachment's name from the upload output in the field value.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `hide_attachment_filesize`
Hides the attachment size from the upload output in the field value.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `hide_attachment_url`
Hides the attachment URL from the upload output in the field value.

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `attachment_key`
Enables file attachments.

#### Default

`nil`

#### Possible values

`nil`, or a symbol representing the `has_many_attachments` key on the model.
:::


## File attachments

<!-- @include: ./../common/files_gem_common.md-->

Trix supports drag-and-drop file attachments. To enable **Active Storage** integration, you must add the `attachment_key` option to your Trix field.

```ruby
field :body, as: :trix, attachment_key: :trix_attachments
```

That `attachment_key` has to have the same name as the model.

```ruby{2}
class Post < ApplicationRecord
  has_many_attached :trix_attachments
end
```

Now, when you upload a file in the Trix field, Avo will create an Active Record attachment.

## Disable attachments

You may want to use Trix only as a text editor and disable the attachments feature. Adding the `attachments_disabled` option will hide the attachments button (paperclip icon).

```ruby
field :body, as: :trix, attachments_disabled: true
```

## Remove attachment attributes

By default, Trix will add some meta-data in the editor (filename, filesize, and URL) when adding an attachment. You might not need those to be present in the document. You can hide them using `hide_attachment_filename`, `hide_attachment_filesize`, and `hide_attachment_url`.


---
feedbackId: 834
---


# Fields

Fields are the backbone of a [`Resource`](./resources).
Through fields you tell Avo what to fetch from the database and how to display it on the <Index />, <Show />, and <Edit /> views.

Avo ships with various simple fields like `text`, `textarea`, `number`, `password`, `boolean`, `select`, and more complex ones like `markdown`, `key_value`, `trix`, `tags`, and `code`.

## Declaring fields

You add fields to a resource through the `fields` method using the `field DATABASE_COLUMN, as: FIELD_TYPE, **FIELD_OPTIONS` notation.

```ruby
def fields
  field :name, as: :text
end
```

The `name` property is the column in the database where Avo looks for information or a property on your model.

That will add a few fields in your new Avo app.

On the <Index /> and <Show /> views, we'll get a new text column of that record's database value.
Finally, on the <Edit /> and <New /> views, we will get a text input field that will display & update the `name` field on that model.

### Specific methods for each view

The `fields` method in your resource is invoked whenever non-specific view methods are present. To specify fields for each view or a group of views, you can use the following methods:

`index` view -> `index_fields`<br>
`show` view -> `show_fields`<br>
`edit` / `update` views -> `edit_fields`<br>
`new` / `create` views -> `new_fields`

You can also register fields for a specific group of views as follows:

`index` / `show` views -> `display_fields`<br>
`edit` / `update` / `new` / `create` views -> `form_fields`

When specific view fields are defined, they take precedence over view group fields. If neither specific view fields nor view group fields are defined, the fields will be retrieved from the `fields` method.

The below example use two custom helpers methods to organize the fields through `display_fields` and `form_fields`

<!-- TODO: add exmaples for `index_fields` and the rest of the views -->

:::code-group
```ruby [display_fields]
def display_fields
  base_fields
  tool_fields
end
```

```ruby [form_fields]
def form_fields
  base_fields
  tool_fields
  tool Avo::ResourceTools::CityEditor, only_on: :forms
end
```

```ruby [tool_fields (helper method)]
# Notice that even if those fields are hidden on the form, we still include them on `form_fields`.
# This is because we want to be able to edit them using the tool.
# When submitting the form, we need this fields declared on the resource in order to know how to process them and fill the record.
def tool_fields
  with_options hide_on: :forms do
    field :name, as: :text, help: "The name of your city", filterable: true
    field :population, as: :number, filterable: true
    field :is_capital, as: :boolean, filterable: true
    field :features, as: :key_value
    field :image_url, as: :external_image
    field :tiny_description, as: :markdown
    field :status, as: :badge, enum: ::City.statuses
  end
end
```

```ruby [base_fields (helper method)]
def base_fields
  field :id, as: :id
  field :coordinates, as: :location, stored_as: [:latitude, :longitude]
  field :city_center_area,
    as: :area,
    geometry: :polygon,
    mapkick_options: {
      style: "mapbox://styles/mapbox/satellite-v9",
      controls: true
    },
    datapoint_options: {
      label: "Paris City Center",
      tooltip: "Bonjour mes amis!",
      color: "#009099"
    }
  field :description,
    as: :trix,
    attachment_key: :description_file,
    visible: -> { resource.params[:show_native_fields].blank? }
  field :metadata,
    as: :code,
    format_using: -> {
      if view.edit?
        JSON.generate(value)
      else
        value
      end
    },
    update_using: -> do
      ActiveSupport::JSON.decode(value)
    end

  field :created_at, as: :date_time, filterable: true
end
```
:::

:::warning In some scenarios fields require presence even if not visible
In certain situations, fields must be present in your resource configuration, even if they are hidden from view. Consider the following example where `tool_fields` are included within `form_fields` despite being wrapped in a `with_options hide_on: :forms do ... end` block.

For instance, when using `tool Avo::ResourceTools::CityEditor, only_on: :forms`, it will render the `features` field, which is of type `key_value`. When the form is submitted, Avo relies on the presence of the `features` field to determine its type and properly parse the submitted value.

If you omit the declaration of `field :features, as: :key_value, hide_on: :forms`, Avo will be unable to update that specific database column.
:::


## Field conventions

When we declare a field, we pinpoint the specific database row for that field. Usually, that's a snake case value.

Each field has a label. Avo will convert the snake case name to a humanized version.
In the following example, the `is_available` field will render the label as *Is available*.

```ruby
field :is_available, as: :boolean
```

<img :src="('/assets/img/fields-reference/naming-convention.jpg')" alt="Field naming convention" class="border mb-4" />

:::info
If having the fields stacked one on top of another is not the right layout, try the [resource-sidebar](./resource-sidebar).
:::

### A more complex example

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id
    field :first_name, as: :text
    field :last_name, as: :text
    field :email, as: :text
    field :active, as: :boolean
    field :cv, as: :file
    field :is_admin?, as: :boolean
  end
end
```

The `fields` method is already hydrated with the `current_user`, `params`, `request`, `view_context`, and `context` variables so you can use them to conditionally show/hide fields

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id
    field :first_name, as: :text
    field :last_name, as: :text
    field :email, as: :text
    field :is_admin?, as: :boolean
    field :active, as: :boolean

    if current_user.is_admin?
      field :cv, as: :file
    end
  end
end
```


## Field Types

<ul>
  <li v-for="field in fields">
    <a :href="field.link">
      {{field.text}}
      </a>
  </li>
</ul>


---
feedbackId: 838
---

# Filters

Most content management systems need a way to filter the data.

Avo provides two types of filters you can use when building your app.

1. [Basic filters](./basic-filters)
2. [Dynamic filters](./dynamic-filters)

## Differences

### 1. Basic filters

- configured as one filter per file
- there are four types of filters (Text, Boolean, Select, Multiple select)
- they are more configurable
- you can scope out the information better
- you can use outside APIs or configurations
- you must add and configure each filter for a resource

### 2. Dynamic filters

- easier to set up. They only require one option on the field
- the user can choose the condition on which they filter the records
- a lot more conditions than basic filters
- the user can add multiple conditions per attribute
- they are more composable


# Gem server authentication

Avo comes in a few tiers. The Community tier which comes as a free gem available on rubygems.org and a few paid tiers which come in private gems hosted on our own private gems server (packager.dev).

In order to have access to the paid gems you must authenticate using the **Gem Server Token** found on your [license page](https://v3.avohq.io/licenses).

There are a few ways to do that, but we will focus on the most important and secure ones for [on the server and CI systems](#on-the-server-and-ci-systems) and [on your local development environment](#on-your-local-development-environment).

:::info
We'll use the `xxx` notiation instead of the actual gem server token.
:::

## On the server and CI systems

:::info Recommendation
This is the recommended way for most use cases.
:::

The best way to do it is to register this environment variable so bundler knows to use it when pulling packages from [`packager.dev`](https://packager.dev).

```bash
export BUNDLE_PACKAGER__DEV=xxx
# or
BUNDLE_PACKAGER__DEV=xxx bundle install
```

Each hosting service will have their own way to add environment variables. Check out how to do it on [Heroku](#Configure-Heroku) or [Hatchbox](#Configure-Hatchbox).

:::warning Warning about using the `.env` file
You might be tempted to add the token to your `.env` file, as you might do with your Rails app.
That will not work because `bundler` will not automatically load those environment variables.

You should add the environment variable through the service dedicated page or by running the `export` command before `bundle install`.
:::

## On your local development environment

For your local development environment you should add the toke to the default bundler configuration.
This way `bundler` is aware of it without having to specify it in the `Gemfile`.

```bash
bundle config set --global https://packager.dev/avo-hq/ xxx
```

## Add Avo to your `Gemfile`

Now you are ready to add Avo to your `Gemfile`.

<!-- @include: ./common/avo_in_gemfile.md-->

Now you can run `bundle install` and `bundler` will pick it up and use it to authenticate on the server.

## Configure Heroku

If you're using heroku, you can set the environment variable using the following command. This way `bundler` will use it when authenticating to `packager.dev`.

```bash
heroku config:set BUNDLE_PACKAGER__DEV=xxx
```

## Configure Hatchbox

If you're using Hatchbox, you can set the environment variable in your apps "Environment" tab. This way `bundler` will use it when authenticating to `packager.dev`.

```yaml
BUNDLE_PACKAGER__DEV: xxx
```


# Grid view

<br />
<img :src="('/assets/img/grid-view.jpg')" alt="Avo grid view" class="border mb-4" />

Some resources are best displayed in a grid view. We can do that with Avo using a `cover_url`, a `title`, and a `body`.

## Enable grid view

To enable grid view for a resource, you need to configure the `grid_view` class attribute on the resource. That will add the grid view to the view switcher on the <Index /> view.

```ruby{2-13}
class Avo::Resources::Post < Avo::BaseResource
  self.grid_view = {
    card: -> do
      {
        cover_url:
          if record.cover_photo.attached?
            main_app.url_for(record.cover_photo.url)
          end,
        title: record.name,
        body: record.truncated_body
      }
    end
  }
end
```

<img :src="('/assets/img/view-switcher.png')" alt="Avo view switcher" class="border mb-4" />

## Make default view

To make the grid the default way of viewing a resource **Index**, we have to use the `default_view_type` class attribute.

```ruby{2}
class Avo::Resources::Post < Avo::BaseResource
  self.default_view_type = :grid
end
```

## Custom style

You may want to customize the card a little bit. That's possible using the `html` option.

```ruby{13-30}
class Avo::Resources::Post < Avo::BaseResource
  self.grid_view = {
    card: -> do
      {
        cover_url:
          if record.cover_photo.attached?
            main_app.url_for(record.cover_photo.url)
          end,
        title: record.name,
        body: record.truncated_body
      }
    end,
    html: -> do
      {
        title: {
          index: {
            wrapper: {
              classes: "bg-blue-50 rounded-md p-2"
            }
          }
        },
        body: {
          index: {
            wrapper: {
              classes: "bg-gray-50 rounded-md p-1"
            }
          }
        }
      }
    end
  }
end
```

<img :src="('/assets/img/grid-html-option.png')" alt="Grid html option" class="border mb-4" />



# Getting Started

Avo is a tool that helps developers and teams build apps 10x faster. It takes the things we always build for every app and abstracts them in familiar configuration files.

It has three main parts:

1. [The CRUD UI](#_1-the-crud-ui)
2. [Dashboards](#_2-dashboards)
3. [The custom content](#_3-the-custom-content)

## 1. The CRUD UI

If before, we built apps by creating layouts, adding controller methods to extract _data_ from the database, display it on the screen, worrying how we present it to the user, capture the users input as best we can and writing logic to send that data back to the database, Avo takes a different approach.

It only needs to know what kind of data you need to expose and what type it is. After that, it takes care of the rest.
You **tell it** you need to manage Users, Projects, Products, or any other types of data and what properties they have; `first_name` as `text`, `birthday` as `date`, `cover_photo` as `file` and so on.

There are the basic fields like [text](./fields/text), [textarea](./fields/textarea), [select](./fields/select) and [boolean](./fields/boolean), and the more complex ones like [trix](./fields/trix), [markdown](./fields/markdown), [gravatar](./fields/gravatar), and [boolean_group](./fields/boolean_group). There's even an amazing [file](./fields/file) field that's tightly integrated with `Active Storage`. **You've never added files integration as easy as this before.**

## 2. Dashboards

Most apps need a way of displaying the stats in an aggregated form. Using the same configuration-based approach, Avo makes it so easy to display data in metric cards, charts, and even lets you take over using partial cards.

## 3. Custom content
Avo is a shell in which you develop your app. It offers a familiar DSL to configure the app you're building, but sometimes you might have custom needs. That's where the custom content comes in.

You can extend Avo in different layers. For example, in the CRUD UI, you may add [Custom fields](./custom-fields) that slot in perfectly in the current panels and in each view. You can also add [Resource tools](./resource-tools) to control the experience using standard Rails partials completely.

You can even create [Custom tools](./custom-tools) where you can add all the content you need using Rails partials or View Components.

Most of the places where records are listed like [Has many associations](./associations/has_many), [attach modals](./associations/belongs_to.html#belongs-to-attach-scope), [search](./search), and more are scopable to meet your multi-tenancy scenarios.

Most of the views you see are exportable using the [`eject` command](./eject-views).

StimulusJS is deeply baked into the CRUD UI and helps you extend the UI and make a complete experience for your users.

## Seamless upgrades

Avo comes packaged as a [gem](https://rubygems.org/gems/avo). Therefore, it does not pollute your app with its internal files. Instead, everything is tucked away neatly in the package.

That makes for a beautiful upgrade experience. You hit `bundle update avo` and get the newest and best of Avo without any file conflicts.

## Next up

Please take your time and read the documentation pages to see how Avo interacts with your app and how one should use it.

<!-- 1. [Rails and Hotwire](./rails-and-hotwire)
1. [Installation](./installation)
1. [Authentication](./authentication)
1. [Authorization](./authorization) -->
1. [Install Avo in your app](./installation.html)
1. [Set up the current user](authentication.html#customize-the-current-user-method)
1. [Create a Resource](./resources.html#defining-resources)
1. [Set up authorization](authorization.html)
1. [Set up licensing](licensing)
1. [Explore the live demo app](https://main.avodemo.com/)
1. Explore these docs
1. Enjoy building your app without ever worrying about the admin layer ever again
1. Explore the [FAQ](faq) pages for guides on how to set up your Avo instance.

## Walkthrough videos

### Build a blog admin panel

<br/>

<div class="aspect-video">
  <iframe width="100%" height="100%" src="https://www.youtube.com/embed/WgNK-oINFww" title="Build a production-ready blog admin panel" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

### Build a booking app

<br/>

<div class="aspect-video">
  <iframe width="100%" height="100%" src="https://www.youtube.com/embed/BK47E7TMXn0" title="Build a booking app in less than an hour" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>


---
prev: /3.0/
---

# Installation


## Requirements

- Ruby on Rails >= 6.1
- Ruby >= 3
- `api_only` set to `false`. More [here](./recipes/api-only-app).
- `propshaft` or `sprockets` gem
- Have the `secret_key_base` defined in  any of the following `ENV["SECRET_KEY_BASE"]`, `Rails.application.credentials.secret_key_base`, or `Rails.application.secrets.secret_key_base`

:::warning Zeitwerk autoloading is required.
When adding Avo to a Rails app that was previously a Rails 5 app you must ensure that it uses zeitwerk for autoloading and Rails 6.1 or higher defaults.

```ruby
# config/application.rb
config.autoloader = :zeitwerk
config.load_defaults 6.1 # 6.1 or higher, depending on your rails version
```
:::

## Installing Avo
<!--
Use [this](https://railsbytes.com/public/templates/zyvsME) RailsBytes template for a one-liner install process.

`rails app:template LOCATION='https://avohq.io/app-template'`

**OR** -->

Take it step by step.

1. Add the appropiate Avo gem to the `Gemfile`

<!-- @include: ./common/avo_in_gemfile.md-->

:::info
Please use [this guide](./gem-server-authentication.html) to find the best authentication strategy for your use-case.
:::

2. Run `bundle install`.
3. Run `bin/rails generate avo:install` to generate the initializer and add Avo to the `routes.rb` file.
4. [Generate an Avo Resource](resources)

:::info
This will mount the app under `/avo` path. Visit the link to see the result.
:::

## Install from GitHub

You may also install Avo from GitHub but when you do that you must compile the assets yourself. You do that using the `rake avo:build-assets` command.
When pushing to production, make sure you build the assets on deploy time using this task.

```ruby
# Rakefile
Rake::Task["assets:precompile"].enhance do
  Rake::Task["avo:build-assets"].execute
end
```

:::info
If you don't have the `assets:precompile` step in your deployment process, please adjust that with a different step you might have like `db:migrate`.
:::

## Mount Avo to a subdomain

You can use the regular `host` constraint in the `routes.rb` file.

```ruby
constraint host: 'avo' do
  mount Avo::Engine, at: '/'
end
```

## Next steps

Please follow the next steps to ensure your app is secured and you have access to all the features you need.

1. Set up [authentication](authentication.html#customize-the-current-user-method) and tell Avo who is your `current_user`. This step is required for the authorization feature to work.
1. Set up [authorization](authorization). Don't let your data be exposed. Give users access to the data they need to see.
1. Set up [licensing](licensing).


# Licensing

Avo has two types of licenses. The **Community edition**is free to use and works best for personal, hobby, and small commercial projects, and the **Pro edition** for when you need more advanced features.

## Community vs. Pro

The **Community version** has powerful features that you can use today like [Resource management](./resources.html), most [feature-rich](./field-options.html) [fields](./fields.html), out-of-the box [sorting](./field-options.html#sortable-fields), [filtering](./filters.html) and [actions](./actions.html) and all the [associations](./associations.html) you need.

The **Pro version** has [advanced authorization](./authorization.html) using Pundit, [localization support](./localization.html), [Custom tools](./custom-tools.html), [Custom fields](./custom-tools.html) and much [more](https://avohq.io/pricing). [More](https://avohq.io/roadmap) features like Settings screens and Themes are coming soon.

The features are separated by their level of complexity and maintenance needs. Selling the Avo Pro edition as a paid upgrade allows us to fund this business and work on it full-time. That way, Avo improves over time, helping developers with more features and customization options.

## One license per site

Each license can be used to run one application in one `production` environment on one URL. So when an app is in the `production` environment (`Rails.env.production?` is `true`), we only need to check that the license key and URL match the purchased license you're using for that app.

### More installations/environments per site

You might have the same site running in multiple environments (`development`, `staging`, `test`, `QA`, etc.) for non-production purposes. You don't need extra licenses for those environments as long as they are not production environments (`Rails.env.production?` returns `false`).

### Sites

You can see your license keys on your [licenses](https://avohq.io/licenses) page.

## Add the license key

After you purchase an Avo license, add it to your `config/initializers/avo.rb` file under `license_key`.

```ruby{3-4}
# config/initializers/avo.rb
Avo.configure do |config|
  config.license_key = '************************' # or use ENV['AVO_LICENSE_KEY']
end
```

## Configure the display of license request timeout error

If you want to hide the badge displaying the license request timeout error, you can do it by setting the `display_license_request_timeout_error` configuration to `false`. It defaults to `true`.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.display_license_request_timeout_error = false
end
```
## Purchase a license

You can purchase a license on the [purchase](https://avohq.io/purchase/pro) page.

## License validation

### "Phone home" mechanism

Avo pings the [HQ](https://avohq.io) (the license validation service) with some information about the current Avo installation. You can find the full payload below.

```ruby
# HQ ping payload
{
  license: Avo.configuration.license,
  license_key: Avo.configuration.license_key,
  avo_version: Avo::VERSION,
  rails_version: Rails::VERSION::STRING,
  ruby_version: RUBY_VERSION,
  environment: Rails.env,
  ip: current_request.ip,
  host: current_request.host,
  port: current_request.port,
  app_name: Rails.application.class.to_s.split("::").first,
  avo_metadata: avo_metadata
}
```

That information helps us to identify your license and return a license valid/invalid response to Avo.
The requests are made at boot time and every hour when you use Avo on any license type.

If you need a special build without the license validation mechanism please [get in touch](mailto:adrian@avohq.io).


## Upgrade your 1.0 license to 2.0

We are grateful to our `1.0` customers for believing in us. So we offer a free and easy upgrade path and **a year of free updates** for version `2.0`.

If you have a 1.0 license and want to upgrade to 2.0, you need to log in to [avohq.io](https://avohq.io), and go to the [licenses page](https://avohq.io/subscriptions), and hit the `Upgrade` button next to your license. You'll be redirected to the new subscription screen where you can start the subscription for 2.0.
After you add your billing details, you won't get charged immediately, but on the next billing cycle next year.

If you choose not to renew the subscription after one year, that's fine; you can cancel at any time, no biggie. You won't get charged and will keep the last version available at the end of that subscription.


---
license: pro
---

# Localization (i18n)

Avo leverages Rails' powerful I18n translations module. When you run `bin/rails avo:install`, Rails will generate for you the `avo.en.yml` translation file. This file will automatically be injected into the I18n translations module.

## Localizing resources

Let's say you want to localize a resource. All you need to do is add a `self.translation_key` class attribute in the `Resource` file. That will tell Avo to use that translation key to localize this resource. That will change the labels of that resource everywhere in Avo.

```ruby{4}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.title = :name
  self.translation_key = 'avo.resource_translations.user'
end
```

```yaml{6-10}
# avo.es.yml
es:
  avo:
    dashboard: 'Dashboard'
    # ... other translation keys
    resource_translations:
      user:
        zero: 'usuarios'
        one: 'usuario'
        other: 'usuarios'
```

## Localizing fields

Similarly, you can even localize fields. All you need to do is add a `translation_key:` option on the field declaration.


```ruby{8}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id
    # ... other fields
    field :files, as: :files, translation_key: 'avo.field_translations.file'
  end
end
```

```yaml{6-10}
# avo.es.yml
es:
  avo:
    dashboard: 'Dashboard'
    # ... other translation keys
    field_translations:
      file:
        zero: 'archivos'
        one: 'archivo'
        other: 'archivos'
```

## Setting the locale

Setting the locale for Avo is simple. Just use the `config.locale = :en` config attribute. Default is `nil` and will fall back to whatever you have configured in `application.rb`.

```ruby{2}
Avo.configure do |config|
  config.locale = :en # default is nil
end
```

That will change the locale only for Avo requests. The rest of your app will still use your locale set in `application.rb`. If you wish to change the locale for the whole app, you can use the `set_locale=pt-BR` param. That will set the default locale until you restart your server.

Suppose you wish to change the locale only for one request using the `force_locale=pt-BR` param. That will set the locale for that request and keep the `force_locale` param while you navigate Avo. Remove that param when you want to go back to your configured `default_locale`.

Check out our guide for [multilingual records](recipes/multilingual-content).

## Re-generate the locale

When updating Avo, please run `bin/rails generate avo:locales` to re-generate the locales file.

## FAQ

If you try to localize your resources and fields and it doesn't seem to work, please be aware of the following.

### Advanced localization is a Pro feature

Localizing strings in Avo will still work using Rails' `I18n` mechanism, but localizing files and resources require a `Pro` or above license.

The reasoning is that deep localization is a more advanced feature that usually falls in the commercial realm. So if you create commercial products or apps for clients and make revenue using Avo, we'd love to get your support to maintain it and ship new features going forward.

### The I18n.t method defaults to the name of that field/resource

Internally the localization works like so `I18n.t(translation_key, count: 1, default: default)` where the `default` is the computed field/resource name. So check the structure of your translation keys.

```yaml
# config/locales/avo.pt-BR.yml
pt-BR:
  avo:
    field_translations:
      file:
        zero: 'arquivos'
        one: 'arquivo'
        other: 'arquivos'
    resource_translations:
      user:
        zero: 'usuários'
        one: 'usuário'
        other: 'usuários'
```


---
feedbackId: 835
---

# Map view

Some resources that contain geospatial data can benefit from being displayed on a map. For
resources to be displayed to the map view they require a `coordinates` field, but that's customizable.

## Enable map view

To enable map view for a resource, you need to add the `map_view` class attribute to a resource. That will add the view switcher to the <Index /> view.

<img :src="('/assets/img/map-view.png')" alt="Avo view switcher" class="border mb-4" />

```ruby
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.map = {
    mapkick_options: {
      controls: true
    },
    record_marker: -> {
      {
        latitude: record.coordinates.first,
        longitude: record.coordinates.last,
        tooltip: record.name
      }
    },
    table: {
      visible: true,
      layout: :right
    }
  }
end
```

:::option `mapkick_options`
The options you pass here are forwarded to the [`mapkick` gem](https://github.com/ankane/mapkick).
:::

:::option `record_marker`
This block is being applied to all the records present in the current query to fetch the coordinates of off the record.

You may use this block to fetch the coordinates from other places (API calls, cache queries, etc.) rather than the database.

This block has to return a hash compatible with the [`PointMap` items](https://github.com/ankane/mapkick#point-map). Has to have `latitude` and `longitude` and optionally `tooltip`, `label`, or `color`.
:::

:::option `table`
This is the configuration for the adjacent table. You can set the visibility to `true` or `false`, and set the position of the table `:top`, `:right`, `:bottom`, or `:left`.
:::

## Make it the default view

To make the map view the default way of viewing a resource on <Index />, we have to use the `default_view_type` class attribute.

```ruby{7}
class Avo::Resources::City < Avo::BaseResource
  self.default_view_type = :map
end
```


---
feedbackId: 831
demoVideo: https://youtu.be/VMvG-j1Vxio
license: pro
version: "2.3.0"
---

# Menu editor

One common task you need to do is organize your sidebar resources into menus. You can easily do that using the menu editor in the initializer.

When you start with Avo, you'll get an auto-generated sidebar by default. That sidebar will contain all your resources, dashboards, and custom tools. To customize that menu, you have to add the `main_menu` key to your initializer.

```ruby{3-22}
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section "Resources", icon: "heroicons/outline/academic-cap" do
      group "Academia" do
        resource :course
        resource :course_link
      end

      group "Blog", collapsable: true, collapsed: true do
        dashboard :dashy

        resource :post
        resource :comment
      end
    end

    section I18n.t('avo.other'), icon: "heroicons/outline/finger-print", collapsable: true, collapsed: true do
      link_to 'Avo HQ', path: 'https://avohq.io', target: :_blank
      link_to 'Jumpstart Rails', path: 'https://jumpstartrails.com/', target: :_blank
    end
  }
end
```

<img :src="('/assets/img/menu-editor/main.jpg')" alt="Avo main menu" class="border mb-4" />

For now, Avo supports editing only two menus, `main_menu` and `profile_menu`. However, that might change in the future by allowing you to write custom menus for other parts of your app.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section I18n.t("avo.dashboards"), icon: "dashboards" do
      dashboard :dashy, visible: -> { true }
      dashboard :sales, visible: -> { true }

      group "All dashboards", visible: false do
        all_dashboards
      end
    end

    section "Resources", icon: "heroicons/outline/academic-cap" do
      group "Academia" do
        resource :course
        resource :course_link
      end

      group "Blog" do
        resource :posts
        resource :comments
      end

      group "Other" do
        resource :fish
      end
    end

    section "Tools", icon: "heroicons/outline/finger-print" do
      all_tools
    end

    group do
      link_to "Avo", path: "https://avohq.io"
      link_to "Google", path: "https://google.com", target: :_blank
    end
  }
  config.profile_menu = -> {
    link_to "Profile", path: "/profile", icon: "user-circle"
  }
end
```

## Menu item types

A few menu item types are supported `link_to`, `section`, `group`, `resource`, and `dashboard`. There are a few helpers too, like `all_resources`, `all_dashboards`, and `all_tools`.

:::option `link_to`

Link to is the menu item that the user will probably interact with the most. It will generate a link on your menu. You can specify the `name`, `path` , and `target`.

```ruby
link_to "Google", path: "https://google.com", target: :_blank
```

<img :src="('/assets/img/menu-editor/external-link.jpg')" alt="Avo menu editor" class="border mb-4" />

When you add the `target: :_blank` option, a tiny external link icon will be displayed.

:::

:::option `resource`

To make it a bit easier, you can use `resource` to quickly generate a link to one of your resources. For example, you can pass a short symbol name `:user` or the full name `Avo::Resources::User`.

```ruby
resource :posts
resource "Avo::Resources::Comments"
```

<img :src="('/assets/img/menu-editor/resource.jpg')" alt="Avo menu editor" class="border mb-4" />

You can also change the label for the `resource` items to something else.

```ruby
resource :posts, label: "News posts"
```

Additionally, you can pass the `params` option to the `resource` items to add query params to the link.

```ruby
resource :posts, params: { status: "published" }
resource :users, params: -> do
  decoded_filter = {"IsAdmin"=>["non_admins"]}

  { filters: Avo::Filters::BaseFilter.encode_filters(decoded_filter)}
end
```

:::

:::option `dashboard`

Similar to `resource`, this is a helper to make it easier to reference a dashboard. You pass in the `id` or the `name` of the dashboard.

```ruby
dashboard :dashy
dashboard "Sales"
```

<img :src="('/assets/img/menu-editor/dashboard.jpg')" alt="Avo menu editor" class="border mb-4" />

You can also change the label for the `dashboard` items to something else.

```ruby
dashboard :dashy, label: "Dashy Dashboard"
```

:::

:::option `section`

Sections are the big categories in which you can group your menu items. They take `name` and `icon` options.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap" do
  resource :course
  resource :course_link
end
```

<img :src="('/assets/img/menu-editor/section.jpg')" alt="Avo menu editor" class="border mb-4" />

:::

:::option `group`

Groups are smaller categories where you can bring together your items.

```ruby
group "Blog" do
  resource :posts
  resource :categories
  resource :comments
end
```

<img :src="('/assets/img/menu-editor/group.jpg')" alt="Avo menu editor" class="border mb-4" />
:::

:::option `all_resources`
Renders all resources.

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "Resources", icon: "resources" do
    all_resources
  end
end
```

:::

:::option `all_dashboards`
Renders all dashboards.

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "Dashboards", icon: "dashboards" do
    all_dashboards
  end
end
```

:::

:::option `all_tools`
Renders all tools.

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "All tools", icon: "tools" do
    all_tools
  end
end
```

:::

### `all_` helpers

```ruby
section "App", icon: "heroicons/outline/beaker" do
  group "Dashboards", icon: "dashboards" do
    all_dashboards
  end

  group "Resources", icon: "resources" do
    all_resources
  end

  group "All tools", icon: "tools" do
    all_tools
  end
end
```

:::warning
The `all_resources` helper is taking into account your [authorization](./authorization) rules, so make sure you have `def index?` enabled in your resource policy.
:::

<img :src="('/assets/img/menu-editor/all-helpers.jpg')" alt="Avo menu editor" class="border mb-4" />

## Item visibility

The `visible` option is available on all menu items. It can be a boolean or a block that has access to a few things:

- the `current_user`. Given that you [set a way](authentication.html#customize-the-current-user-method) for Avo to know who the current user is, that will be available in that block call
- the [`context`](customization.html#context) object.
- the `params` object of that current request
- the [`view_context`](https://apidock.com/rails/AbstractController/Rendering/view_context) object. The `view_context` object lets you use the route helpers. eg: `view_context.main_app.posts_path`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    resource :user, visible: -> do
      context[:something] == :something_else
    end
  }
end
```

## Add `data` attributes to items

<VersionReq version="2.16" />

You may want to add special data attributes to some items and you can do that using the `data` option. For example you may add `data: {turbo: false}` to make a regular request for a link.

```ruby{4}
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    resource :user, data: {turbo: false}
  }
end
```

## Using authorization rules

When you switch from a generated menu to a custom one, you might want to keep using the same authorization rules as before. To quickly do that, use the `authorize` method in the `visible` option.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    resource :team, visible: -> do
      # authorize current_user, MODEL_THAT_NEEDS_TO_BE_AUTHORIZED, METHOD_THAT_NEEDS_TO_BE_AUTHORIZED
      authorize current_user, Team, "index?", raise_exception: false
    end
  }
end
```

## Icons

For [`Section`](#section)s, you can use icons to make them look better. You can use some local ones that we used throughout the app and all [heroicons](https://heroicons.com/) designed by [Steve Schoger](https://twitter.com/steveschoger). In addition, you can use the `solid` or `outline` versions. We used the `outline` version throughout the app.

```ruby
section "Resources", icon: "heroicons/outline/academic-cap" do
  resource :course
end

section "Resources", icon: "heroicons/solid/finger-print" do
  resource :course
end

section "Resources", icon: "heroicons/outline/adjustments" do
  resource :course
end
```

<img :src="('/assets/img/menu-editor/icons.jpg')" alt="Avo menu editor" class="border mb-4" />

### Icons on resource, dashboard, and link_to items

You can add icons to other menu items like `resource`, `dashboard`, and `link_to`.

```ruby
link_to "Avo", "https://avohq.io", icon: "globe"
```

## Collapsable sections and groups

When you have a lot of items they can take up a lot of vertical space. You can choose to make those sidebar sections collapsable by you or your users.

```ruby
section "Resources", icon: "resources", collapsable: true do
  resource :course
end
```

<img :src="('/assets/img/menu-editor/collapsable.jpg')" alt="Avo menu editor" class="border mb-4" />

That will add the arrow icon next to the section to indicate it's collapsable. So when your users collapse and expand it, their choice will be stored in Local Storage and remembered in that browser.

### Default collapsed state

You can however, set a default collapsed state using the `collapsed` option.

```ruby
section "Resources", icon: "resources", collapsable: true, collapsed: true do
  resource :course
end
```

<img :src="('/assets/img/menu-editor/collapsed.jpg')" alt="Avo menu editor" class="border mb-4" />

You might want to allow your users to hide certain items from view.

## Authorization

<DemoVideo demo-video="https://youtu.be/Eex8CiinQZ8?t=373" />

If you use the [authorization feature](authorization), you will need an easy way to authorize your items in the menu builder.
For that scenario, we added the `authorize` helper.

```ruby{3}
Avo.configure do |config|
  config.main_menu = -> {
    resource :team, visible: -> {
      # authorize current_user, THE_RESOURCE_MODEL, THE_POLICY_METHOD, raise_exception: false
      authorize current_user, Team, "index?", raise_exception: false
    }
  }
end
```

Use it in the `visible` block by giving it the `current_user` (which is available in that block), the class of the resource, the method that you'd like to authorize for (default is `index?`), and tell it not to throw an exception.

Now, the item visibility will use the `index?` method from the `TeamPolicy` class.

## Profile menu

The profile menu allows you to add items to the menu displayed in the profile component. **The sign-out link is automatically added for you.**

You may add the `icon` option to the `profile_menu` links.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.profile_menu = -> {
    link_to "Profile", path: "/profile", icon: "user-circle"
  }
end
```

<img :src="('/assets/img/menu-editor/profile-menu.png')" alt="Avo profile menu" class="border mb-4" />

## Forms in profile menu

It's common to have forms that `POST` to a path to do sign ut a user. For this scenario we added the `method` and `params` option to the profile item `link_to`, so if you have a custom sign out path you can do things like this.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.profile_menu = -> {
    link_to "Sign out", path: main_app.destroy_user_session_path, icon: "user-circle", method: :post, params: {custom_param: :here}
  }
end
```

## Custom content in the profile menu

You might, however, want to add a very custom form or more items to the profile menu. For that we prepared the `_profile_menu_extra.html.erb` partial for you.

```bash
bin/rails generate avo:eject --partial :profile_menu_extra
```

This will eject the partial and you can add whatever custom content you might need.

```erb
<%# Example link below %>
<%#= render Avo::ProfileItemComponent.new label: 'Profile', path: '/profile', icon: 'user-circle' %>
```


# Avo::ButtonComponent

This component renders a button or a link with the styling


# `Avo::PanelComponent`

The panel component is one of the most used components in Avo.

```erb
<%= render Avo::PanelComponent.new(title: @product.name, description: @product.description) do |c| %>
  <% c.with_tools do %>
    <%= a_link(@product.link, icon: 'heroicons/solid/academic-cap', style: :primary, color: :primary) do %>
      View product
    <% end %>
  <% end %>

  <% c.with_body do %>
    <div class="flex flex-col p-4 min-h-24">
      <div class="space-y-4">
        <h3>Product information</h3>

        <p>Style: shiny</p>
      </div>
    </div>
  <% end %>
<% end %>
```

![](/assets/img/native-components/avo-panel-component/index.jpg)

## Options

All options are optional. You may render a panel without options.

```erb
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_body do %>
    Something here.
  <% end %>
<% end %>
```

:::option `name`
The name of the panel. It's displayed on the top under the breadcrumbs.

#### Type
`String`

![](/assets/img/native-components/avo-panel-component/name.jpg)
:::

:::option `description`
Small text under the name that speaks a bit about what the panel does.

#### Type
`String`

![](/assets/img/native-components/avo-panel-component/description.jpg)
:::

:::option `classes`
A list of classes that should be applied to the panel container.

#### Type
`String`

![](/assets/img/native-components/avo-panel-component/classes.jpg)
:::

:::option `body_classes`
A list of classes that should be applied to the body of panel.

#### Type
`String`

![](/assets/img/native-components/avo-panel-component/body_classes.jpg)
:::

:::option `data`
A hash of data attributes to be forwarded to the panel container.

#### Type
`Hash`

![](/assets/img/native-components/avo-panel-component/classes.jpg)
:::

:::option `display_breadcrumbs`
Toggles the breadcrumbs visibility. You can't customize the breadcrumbs yet.

#### Type
`Boolean`

![](/assets/img/native-components/avo-panel-component/display_breadcrumbs.jpg)
:::

## Slots

The component has a few slots where you customize the content in certain areas.

:::option `tools`
We created this slot as a place to put resource controls like the back, edit, delete, and detach buttons.
This slot will collapse under the title and description when the screen resolution falls under `1024px`.

The section is automatically aligned to the right using `justify-end` class.

```erb
<%= render Avo::PanelComponent.new(name: "Dashboard") do |c| %>
  <% c.with_tools do %>
    <%= a_link('/admin', icon: 'heroicons/solid/academic-cap', style: :primary) do %>
      Admin
    <% end %>
  <% end %>
<% end %>
```

![](/assets/img/native-components/avo-panel-component/tools-slot.jpg)
:::

:::option `body`
This is one of the main slots of the component where the bulk of the content is displayed.

```erb{2-4}
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_body do %>
    Something here.
  <% end %>
<% end %>
```

![](/assets/img/native-components/avo-panel-component/body-slot.jpg)
:::

:::option `bare_content`
Used when displaying the [Grid view](./../grid-view), it displays the data flush in the container and with no background.

```erb{2-4}
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_bare_content do %>
    Something here.
  <% end %>
<% end %>
```

![](/assets/img/native-components/avo-panel-component/grid-view.jpg)
:::

:::option `footer_tools`
This is pretty much the same slot as `tools` but rendered under the `body` or `bare_content` slots.

```erb{2-4}
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_footer_controls do %>
    Something here.
  <% end %>
<% end %>
```

![](/assets/img/native-components/avo-panel-component/footer-controls.jpg)
:::

:::option `footer`
The lowest available area at the end of the component.

```erb{2-4}
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_footer do %>
    Something here.
  <% end %>
<% end %>
```
:::

:::option `sidebar`
The sidebar will conveniently show things in a smaller area on the right of the `body`.

```erb{2-4}
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_Sidebar do %>
    Something tiny here.
  <% end %>
<% end %>
```
![](/assets/img/native-components/avo-panel-component/sidebar.png)
:::


---
feedbackId: 1273
---

# Native field components

One of the most important features of Avo is the ability to extend it pass the DSL. It's very important to us to enable you to add the features you need and create the best experience for your users.

That's why you can so easily create [custom fields](./custom-fields), [resource tools](./resource-tools), and [custom tools](./custom-tools) altogether. When you need to augment the UI even more you can use your [custom CSS and JS assets](./custom-asset-pipeline) too.

When you start adding those custom views you might want to add your own fields, and you'd like to make them look like the rest of the app.
That's why Avo provides a way to use those fields beyond the DSL, in your own custom Rails partials.

## Declaring fields

When you generate a new [resource tool](./resource-tools) you get access to the resource partial.

:::details Sample resource tool
```erb
<div class="flex flex-col">
  <%= render Avo::PanelComponent.new title: "Post info" do |c| %>
    <% c.with_tools do %>
      <%= a_link('/avo', icon: 'heroicons/solid/academic-cap', style: :primary) do %>
        Dummy link
      <% end %>
    <% end %>
    <% c.with_body do %>
      <div class="flex flex-col p-4 min-h-24">
        <div class="space-y-4">
          <h3>🪧 This partial is waiting to be updated</h3>
          <p>
            You can edit this file here <code class='p-1 rounded bg-gray-500 text-white text-sm'>app/views/avo/resource_tools/post_info.html.erb</code>.
          </p>
          <p>
            The resource tool configuration file should be here <code class='p-1 rounded bg-gray-500 text-white text-sm'>app/avo/resource_tools/post_info.rb</code>.
          </p>
          <%
            # In this partial, you have access to the following variables:
            # tool
            # @resource
            # @resource.model
            # form (on create & edit pages. please check for presence first)
            # params
            # Avo::App.context
            # current_user
          %>
        </div>
      </div>
    <% end %>
  <% end %>
</div>
```
:::

You may add new fields using the `avo_show_field`, or `avo_edit_field` methods and use [the arguments you are used to from resources](./field-options).

```ruby
# In your resource file
field :name, as: :text
```

```erb
<!-- In your partial file -->
<%= avo_edit_field :name, as: :text %>
```

## The `form` option

If this is an <Edit /> or a <New /> view, you should pass it the `form` object that an Avo resource tool provides for you.

```erb
<%= avo_edit_field :name, as: :text, form: form %>
```

## The `value` option

When you are building a show field and you want to give it a value to show, use the `value` options

```erb
<%= avo_show_field(:photo, as: :external_image, value: record.cdn_image) %>
```

## Other field options

The fields take all the [field options](./field-options) you are used to like, `help`, `required`, `readonly`, `placeholder`, and more.

```erb
<%= avo_edit_field :name, as: :text, form: form, help: "The user's name", readonly: -> { !current_user.is_admin? }, placeholder: "John Doe", nullable: true %>
```

## Component options

The field taks a new `component_options` argument that will be passed to the view component for that field. Please check out the [field wrapper documentation](./field-wrappers) for more details on that.

## `avo_field` helper

You may use the `avo_field` helper to conditionally switch from `avo_show_field` and `avo_edit_field`.

```erb
<%= avo_field :name, as: :text, view: :show %>
<%= avo_field :name, as: :text, view: :edit %>
<%= avo_field :name, as: :text, view: ExampleHelper.view_conditional %>
```


# Plugins

:::warning
This section is a work in progress.
:::


# Avo ❤️ Rails & Hotwire

In order to provide this all-in-one full-interface experience, we are using Rails' built-in [engines functionality](https://guides.rubyonrails.org/engines.html).

## Avo as a Rails engine

Avo is a **Ruby on Rails engine** that runs isolated and side-by-side with your app. You configure it using a familiar DSL and sometimes regular Rails code through controller methods and partials.

Avo's philosophy is to have as little business logic in your app as possible and give the developer the right tools to extend the functionality when needed.

That means we use a few files to configure most of the interface. When that configuration is not enough, we enable the developer to export ([eject](./eject-views#partial)) partials or even generate new ones for their total control.

### Prepend engine name in URL path helpers

Because it's a **Rails engine** you'll have to follow a few engine rules. One of them is that [routes are isolated](https://guides.rubyonrails.org/engines.html#routes). That means that whenever you're using Rails' [path helpers](https://guides.rubyonrails.org/routing.html#generating-paths-and-urls-from-code) you'll need to prepend the name of the engine. For example, Avo's name is `avo,` and your app's engine name is `main_app`.

```ruby
# When referencing an Avo route, use avo
link_to 'Users', avo.resources_users_path
link_to user.name, avo.resources_user_path(user)

# When referencing a path for your app, use main_app
link_to "Contact", main_app.contact_path
link_to post.name, main_app.posts_path(post)
```

### Use your helpers inside Avo

This is something that we'd like to improve in the future, but the flow right now is to 1. include the helper module inside the controller you need it for and then 2. reference the methods from the `view_context.controller` object in resource files or any other place you'd need them.

```ruby{3-5,10,16}
# app/helpers/application_helper.rb
module ApplicationHelper
  def render_copyright_info
    "Copyright #{Date.today.year}"
  end
end

# app/controller/avo/products_controller.rb
class Avo::ProductsController < Avo::ResourcesController
  include ApplicationHelper
end

# app/avo/resources/products_resource.rb
class ProductsResource < Avo::BaseResource
  field :copyright, as: :text do
    view_context.controller.render_copyright_info
  end
end
```

## Hotwire

Avo's built with Hotwire, so anytime you'd like to use Turbo Frames, that's supported out of the box.

## StimulusJS

Avo comes loaded with Stimulus JS and has a quite deep integration with it by providing useful built-in helpers that improve the development experience.

Please follow the [Stimulus JS guide](./stimulus-integration.md ) that takes an in-depth look at all the possible ways of extending the UI.


# Act as taggable on integration

A popular way to implement the tags pattern is to use the [`acts-as-taggable-on`](https://github.com/mbleigh/acts-as-taggable-on) gem.
Avo already supports it in the [`tags`](./../fields/tags) field, but you might also want to browse the tags as resources.

[This template](https://railsbytes.com/templates/VRZskb) will add the necessarry resource and controller files to your app.

Run `rails app:template LOCATION='https://railsbytes.com/script/VRZskb'`

If you're using the menu editor don't forget to add the resources to your menus.

```ruby
resource :taggings
resource :tags
```

![](/assets/img/recipes/act-as-taggable-on-integration/act-as-taggable-on-integration.gif)


# Add nested fields to CRUD forms

Please follow [this](./../resource-tools.html#add-custom-fields-on-forms) guide to learn how to implement nested fields on Avo forms.


# Use Avo in an `api_only` Rails app

**After Avo version 2.9 👇**

The `api_mode` might not be supported. The reason for that is that Rails does not generate some paths for the [`resource` route helper](https://guides.rubyonrails.org/routing.html#resource-routing-the-rails-default). Most important being the `new` and `edit` paths. That's because APIs don't have the `new` path (they have the `create` path).

But you're probably safer using Rails with `api_only` disabled (`config.api_only = false`).

**Pre Avo version 2.9 👇**

You might have an api-only Rails app where you'd like to use Avo. In my early explorations I found that it needs the `::ActionDispatch::Flash` middleware for it to properly work.

So, add it in your `application.rb` file.

```ruby{18}
require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module RailApi
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true
    config.middleware.use ::ActionDispatch::Flash
  end
end
```


# Custom link field

When you want to add a custom link as a field on your resource that points to a related resource (and you don't want to use one of the available [association fields](../index.md)) you can use the [`Text`](../fields/text) field like so.

```ruby
# with the format_using option
field :partner_home, as: :text, format_using: -> { link_to(value, value, target: "_blank") } do
  avo.resources_partner_url record.partner.id
end

# with the as_html option
field :partner_home, as: :text, as_html: true do
  if record.partner.present?
    link_to record.partner.first_name, avo.resources_partner_url(record.partner.id)
  end
end
```


# Export to CSV action

Even if we don't have a dedicated export to CSV feature, you may create an action that will take all the selected records and export a CSV file for you.

Below you have an example which you can take and customize to your liking. It even give you the ability to use custom user-selected attributes.

```ruby
# app/avo/actions/export_csv.rb
class ExportCsv < Avo::BaseAction
  self.name = "Export CSV"
  self.may_download_file = true

  # Add more fields here for custo user-selected columns
  field :id, as: :boolean
  field :created_at, as: :boolean

  def handle(models:, resource:, fields:, **)
    columns = models.first.class.columns_hash.keys
    # Uncomment below to use the user-selected fields
    # columns = get_columns_from_fields(fields)

    return error "No record selected" if models.blank?

    file = CSV.generate(headers: true) do |csv|
      csv << columns

      models.each do |record|
        csv << columns.map do |attr|
          record.send(attr)
        end
      end
    end

    download file, "#{resource.plural_name}.csv"
  end

  def get_columns_from_fields(fields)
    fields.select { |key, value| value }.keys
  end
end
```

![](/assets/img/recipes/export-to-csv/export-to-csv.gif)



# Pretty JSON objects to the code field

It's common to have JSON objects stored in your database. So you might want to display them nicely on your resource page.

```ruby
field :meta, as: :code, language: 'javascript'
```

<img :src="('/assets/img/recipes/format-ruby-object-to-json/before.png')" alt="Avo Admin for Rails" class="border mb-4" />

But that will be hard to read on one line like that. So we need to format it.

Luckily we can use `JSON.pretty_generate` for that and a computed field.

```ruby{3}
field :meta, as: :code, language: 'javascript' do
  if record.meta.present?
    JSON.pretty_generate(record.meta.as_json)
  end
end
```

<img :src="('/assets/img/recipes/format-ruby-object-to-json/after.png')" alt="Avo Admin for Rails" class="border mb-4" />

That's better! You'll notice that the field is missing on the `Edit` view. That's normal for a computed field to be hidden on `Edit`.
To fix that, we should add another one just for editing.

```ruby{1}
field :meta, as: :code, language: 'javascript', only_on: :edit
field :meta, as: :code, language: 'javascript' do
  if record.meta.present?
    JSON.pretty_generate(record.meta.as_json)
  end
end
```

Now you have a beautifully formatted JSON object in a code editor.


# Hide field labels

One common use case for the [`file`](./../fields/file), [`files`](./../fields/files), and [`external_image`](./../fields/external_image) fields is to display the logo for a record. You might want to do that but in a more "un-fieldy" way, so it doesn't look like a field with a label on top.

You can hide that label using CSS in your [custom asset pipeline](./../custom-asset-pipeline.html), or in a [`_footer` partial](./../eject-views#partial).

Avo is littered with great `data` selectors so you can pick and choose any element you'd like. If it doesn't have it, we'll add it.

Here's an example on how to remove the label on an `external_image` field for the `Team` resource (try it [here](https://main.avodemo.com/avo/resources/teams/4)).

```css
[data-resource-name="TeamResource"] [data-field-type="external_image"][data-field-id="logo"] [data-slot="label"]{
  display: none;
}
```


# Manage information-heavy resources

This has been sent in by our friends at [Wyndy.com](https://wyndy.com). I'm just going to paste David's message because it says it all.

David 👇

Hey y'all - we've got a very information heavy app where there are pretty distinct differences between the data we display on index, show, & form views as well as how it's ordered.

We created a concern for our resources to make organizing this a bit easier, would love y'all's thoughts/feedback as to whether this could be a valuable feature! Example gist: [https://gist.github.com/davidlormor/d1d7e32a3568f6a9b3540669e7f601dc](https://gist.github.com/davidlormor/d1d7e32a3568f6a9b3540669e7f601dc)

We went with a concern because I ran into inheritance issues trying to create a `BaseResource` class (issues with Avo's `model_class` expectations) and monkey-patching `Avo::BaseResource` seemed to cause issues with Rails' autoloading/zeitwork?

```ruby
class ExampleResource < Avo::BaseResource
  include ResourceExtensions

  field :id, as: :id
  field :name, as: :text

  index do
    field :some_field, as: :text
    field :some_index_field, as: :text, sortable: true
  end

  show do
    field :some_show_field, as: :markdown
    field :some_field, as: :text
  end

  create do
    field :some_create_field, as: :number
  end

  edit do
    field :some_create_field, as: :number, readonly: true
    field :some_field
    field :some_editable_field, as: :text
  end
end
```

```ruby
require "active_support/concern"

module ResourceExtensions
  extend ActiveSupport::Concern

  class_methods do
    def index(&block)
      with_options only_on: :index, &block
    end

    def show(&block)
      with_options only_on: :show, &block
    end

    def create(&block)
      with_options only_on: :new, &block
    end

    def edit(&block)
      with_options only_on: :edit, &block
    end
  end
end
```


---
license: pro
---

# Multilingual content

This is not an official feature yet, but until we add it with all the bells and whistles, you can use this guide to monkey-patch it into your app.

We pushed some code to take in the `set_locale` param and set the `I18n.locale` and `I18n.default_locale` so all subsequent requests will use that locale. **That will change the locale for your whole app. Even to the front office**.

If you don't want to change the locale for the whole app, you can use `force_locale`, which will change the locale for that request only. It will also append `force_locale` to all your links going forward.

```ruby
def set_default_locale
  I18n.locale = params[:set_locale] || I18n.default_locale

  I18n.default_locale = I18n.locale
end

# Temporary set the locale
def set_force_locale
  if params[:force_locale].present?
    initial_locale = I18n.locale.to_s.dup
    I18n.locale = params[:force_locale]
    yield
    I18n.locale = initial_locale
  else
    yield
  end
end
```

## Install the mobility gem

Follow the install instructions [here](https://github.com/shioyama/mobility#installation). A brief introduction below (but follow their guide for best results)

 - add the gem to your `Gemfile` `gem 'mobility', '~> 1.2.5'`
 - `bundle install`
 - install mobility `rails generate mobility:install`
 - update the backend (like in the guide) `backend :key_value, type: :string`
 - add mobility to your model `extend Mobility`
 - add translatable field `translates :name`
 - 🙌 that's it. The content should be translatable now.

## Add the language switcher

**Before v 2.3.0**

First, you need to eject the `_profile_dropdown` partial using this command `bin/rails generate avo:eject :profile_dropdown`. In that partial, add the languages you need to support like so:

```erb
<!-- Before -->
<% destroy_user_session_path = "destroy_#{Avo.configuration.current_user_resource_name}_session_path".to_sym %>

<div <% if main_app.respond_to?(destroy_user_session_path) %> data-controller="toggle-panel" <% end %>>
  <a href="javascript:void(0);" class="flex items-center cursor-pointer font-semibold text-gray-700" data-action="click->toggle-panel#togglePanel">
    <% if _current_user.respond_to?(:avatar) &&  _current_user.avatar.present? %>
      <%= image_tag _current_user.avatar, class: "h-12 rounded-full border-4 border-white mr-1" %>
    <% end %>
    <% if _current_user.respond_to?(:name) && _current_user.name.present? %>
      <%= _current_user.name %>
    <% elsif _current_user.respond_to?(:email) && _current_user.email.present? %>
      <%= _current_user.email %>
    <% else %>
      Avo user
    <% end %>
    <% if main_app.respond_to?(destroy_user_session_path) %>
      <%= svg 'chevron-down', class: "ml-1 h-4" %>
    <% end %>
  </a>

  <% if main_app.respond_to?(destroy_user_session_path) %>
    <div class="hidden absolute inset-auto right-0 mr-6 mt-0 py-4 bg-white rounded-xl min-w-[200px] shadow-context" data-toggle-panel-target="panel">
      <%= button_to t('avo.sign_out'), main_app.send(:destroy_user_session_path), method: :delete, form: { "data-turbo" => "false" }, class: "appearance-none bg-white text-left cursor-pointer text-green-600 font-semibold hover:text-white hover:bg-green-500 block px-4 py-1 w-full" %>
    </div>
  <% end %>
</div>
```

```erb
<!-- After -->
<% destroy_user_session_path = "destroy_#{Avo.configuration.current_user_resource_name}_session_path".to_sym %>

<div <% if main_app.respond_to?(destroy_user_session_path) %> data-controller="toggle-panel" <% end %>>
  <a href="javascript:void(0);" class="flex items-center cursor-pointer font-semibold text-gray-700" data-action="click->toggle-panel#togglePanel">
    <% if _current_user.respond_to?(:avatar) &&  _current_user.avatar.present? %>
      <%= image_tag _current_user.avatar, class: "h-12 rounded-full border-4 border-white mr-1" %>
    <% end %>
    <% if _current_user.respond_to?(:name) && _current_user.name.present? %>
      <%= _current_user.name %>
    <% elsif _current_user.respond_to?(:email) && _current_user.email.present? %>
      <%= _current_user.email %>
    <% else %>
      Avo user
    <% end %>
    <% if main_app.respond_to?(destroy_user_session_path) %>
      <%= svg 'chevron-down', class: "ml-1 h-4" %>
    <% end %>
  </a>

  <% if main_app.respond_to?(destroy_user_session_path) %>
    <div class="hidden absolute inset-auto right-0 mr-6 mt-0 py-4 bg-white rounded-xl min-w-[200px] shadow-context" data-toggle-panel-target="panel">
      <!-- Add this 👇 -->
      <% classes = "appearance-none bg-white text-left cursor-pointer text-green-600 font-semibold hover:text-white hover:bg-green-500 block px-4 py-1 w-full" %>

      <% if I18n.locale == :en %>
        <%= link_to "Switch to Portuguese", { set_locale: 'pt-BR' }, class: classes %>
      <% else %>
        <%= link_to "Switch to English", { set_locale: 'en' }, class: classes %>
      <% end %>
      <!-- Add this 👆 -->

      <%= button_to t('avo.sign_out'), main_app.send(:destroy_user_session_path), method: :delete, form: { "data-turbo" => "false" }, class: classes %>
    </div>
  <% end %>
</div>
```

Feel free to customize the dropdown as much as you need it to and add as many locales as you need.

**After v2.3.0**

Use the `profile_menu` to add the language-switching links.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.profile_menu = -> {
    link "Switch to Portuguese", path: "?set_locale=pt-BR"
    link "Switch to English", path: "?set_locale=en"
  }
end
```

**After v2.10**

The `set_locale` param will change the locale for the entire website (for you and your customers). If you need to change it just for the current visit, use `force_locale`. That will switch the locale for that request only, not for your customers. It will also add the `force_locale` param to each link as we advance, making it easy to update all your multilingual content.

**After v2.11**

A change was pushed to consider the `locale` from the initializer. That will change the locale for Avo requests.

```ruby{2}
Avo.configure do |config|
  config.locale = :en # default is nil
end
```

## Workflow

You will now be able to edit the attributes you marked as translatable (eg: `name`) in the locale you are in (default is `en`). Next, you can go to the navbar on the top and switch to a new locale. The switch will then allow you to edit the record in that locale and so on.

## Support

This is the first iteration of multilingual content. It's obvious that this could be done in a better way, and we'll add that better way in the future, but until then, you can use this method to edit your multilingual content.

Thanks!


# Use route-level multitenancy

Multitenancy is not a far-fetched concept, and you might need it when you reach a certain level with your app. Avo is ready to handle that.

This guide will show you **one way** of achieving that, but if can be changed if you have different needs.

## Prepare the Current model

We will use Rails' [`Current`](https://api.rubyonrails.org/classes/ActiveSupport/CurrentAttributes.html) model to hold the account.

```ruby{3}
# app/models/current.rb
class Current < ActiveSupport::CurrentAttributes
  attribute :account
end
```

## Add middleware to catch the account param

We're trying to fetch the account number from the `params` and see if we have an account with that ID in this middleware. If so, store it in the `Current.account` model, where we can use it throughout the app.

```ruby{18,21,23,25}
## Multitenant Account Middleware
#
# Included in the Rails engine if enabled.
#
# Used for setting the Account by the first ID in the URL like Basecamp 3.
# This means we don't have to include the Account ID in every URL helper.
# From JumpstartRails AccountMiddleware

class AccountMiddleware
  def initialize(app)
    @app = app
  end

  # http://example.com/12345/projects
  def call(env)
    request = ActionDispatch::Request.new env
    # Fetch the account id from the path
    _, account_id, request_path = request.path.split("/", 3)

    # Check if the id is a number
    if /\d+/.match?(account_id)
      # See if that account is present in the database.
      if (account = Account.find_by(id: account_id))
        # If the account is present, set the Current.account to that
        Current.account = account
      else
        # If not, redirect to the root path
        return [302, {"Location" => "/"}, []]
      end

      request.script_name = "/#{account_id}"
      request.path_info = "/#{request_path}"
    end

    @app.call(request.env)
  end
end
```

## Update the custom tools routes

By default, when generating [custom tools](./../custom-tools.html), we're adding them to the parent app's routes. Because we're declaring them there, the link helpers don't hold the account id in the params.

```ruby{2-4}
Rails.application.routes.draw do
  scope :avo do
    get "custom_page", to: "avo/tools#custom_page"
  end

  devise_for :users

  # Your routes

  authenticate :user, -> user { user.admin? } do
    mount Avo::Engine => Avo.configuration.root_path
  end
end
```

To fix that, we need to move them as if they were added to Avo's routes.

```ruby{13-18}
# config/routes.rb
Rails.application.routes.draw do
  devise_for :users

  # Your routes

  authenticate :user, -> user { user.admin? } do
    mount Avo::Engine => Avo.configuration.root_path
  end
end

# Move Avo custom tools routes to Avo engine
if defined? ::Avo
  Avo::Engine.routes.draw do
    # make sure you don't add the `avo/` prefix to the controller below
    get 'custom_page', to: "tools#custom_page"
  end
end
```

```ruby
# app/controllers/avo/tools_controller.rb
class Avo::ToolsController < Avo::ApplicationController
  def custom_page
    @page_title = "Your custom page"

    add_breadcrumb "Your custom page"
  end
end
```

## Retrieve and use the account

Throughout your app you can use `Current.account` or if you add it to Avo's [`context`](./../customization#context) object and use it from there.

```ruby{8}
# config/initializers/avo.rb
Avo.configure do |config|
  config.set_context do
    {
      foo: 'bar',
      user: current_user,
      params: request.params,
      account: Current.account
    }
  end
end
```

Check out [this PR](https://github.com/avo-hq/avodemo/pull/4) for how to update an app to support multitenancy.


---
demo: https://main.avodemo.com/avo/resources/fish/new
---

# Nested records when creating

![](/assets/img/recipes/nested-records-when-creating/nested-records-demo.gif)

A lot of you asked for the ability to create nested `has_many` records on the <New /> view. Although it's fairly "easy" to implement using `accepts_nested_attributes_for` for simple cases, it's a different story to extract it, make it available, and cover most edge cases for everyone.
That's why Avo and no other similar gems dont't offer this feature as a first-party feature.
But, that doesn't mean that it's impossible to implement it yourself. It's actually similar to how you'd implement it for your own app.

We prepared this scenario where a `Fish` model `has_many` `Review`s. I know, it's not the `Slider` `has_many` `Item`s example, but you'll get the point.

## Full set of changes

The full code is available in Avo's [dummy app](https://github.com/avo-hq/avo/tree/main/spec/dummy) and the changes in [this PR](https://github.com/avo-hq/avo/pull/1472).

## Guide to add it to your app

You can add this functionality using these steps.

### 1. Add `accepts_nested_attributes_for` on your parent model

```ruby{4}
class Fish < ApplicationRecord
  has_many :reviews, as: :reviewable

  accepts_nested_attributes_for :reviews
end
```

:::warning
Ensure you have the `has_many` association on the parent model.
:::

### 2. Add a JS helper package that dynamically adds more review forms

`yarn add stimulus-rails-nested-form`

In your JS file register the controller.

```js{3,6}
// Probably app/javascript/avo.custom.js
import { Application } from '@hotwired/stimulus'
import NestedForm from 'stimulus-rails-nested-form'

const application = Application.start()
application.register('nested-form', NestedForm)
```

:::info
Use [this guide](./../custom-asset-pipeline.html#add-custom-js-code-and-stimulus-controllers) to add custom JavaScript to your Avo app.
:::

### 3. Generate a new resource tool

`bin/rails generate avo:resource_tool nested_fish_reviews`

This will generate two files. The `NestedFishReviews` ruby file you'll register on the `Avo::Resources::Fish` file and we'll edit the template to contain our fields.

### 4. Register the tool on the resource

We'll display it only on the <New /> view.

```ruby{7}
class Avo::Resources::Fish < Avo::BaseResource
  # other fields actions, filters and more

  def fields
    field :reviews, as: :has_many

    tool Avo::ResourceTools::NestedFishReviews, only_on: :new
  end
end
```

### 5. Create a partial for one new review

This partial will have the fields for one new review which we'll add more on the page.

```erb
<!-- app/views/avo/partials/_fish_review.html.erb -->
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_body do %>
    <div class="nested-form-wrapper divide-y" data-new-record="<%= f.object.new_record? %>">
      <%= avo_edit_field :body, as: :trix, form: f, help: "What should the review say", required: true %>
      <%= avo_edit_field :user, as: :belongs_to, form: f, help: "Who created the review", required: true %>
    </div>
  <% end %>
<% end %>
```

### 6. Update the resource tool partial

It's time to put it all together. In the resource tool partial we're wrapping the whole thing with the `nested-form` controller div, creating a new `form` helper to reference the nested fields with `form.fields_for` and wrapping the "new" template so we can use replicate it using the `nested-form` package.
In the footer we'll also add the button that will add new reviews on the page.

```erb
<!-- app/views/avo/resource_tools/_nested_fish_reviews.html.erb -->
<div class="flex flex-col">
  <%= content_tag :div,data: { controller: 'nested-form', nested_form_wrapper_selector_value: '.nested-form-wrapper' } do %>
    <%= render Avo::PanelComponent.new(name: "Reviews", description: "Create some reviews for this fish") do |c| %>
      <% c.with_bare_content do %>
        <% if form.present? %>
          <template data-nested-form-target="template">
            <%= form.fields_for :reviews, Review.new, multiple: true, child_index: 'NEW_RECORD' do |todo_fields| %>
              <%= render "avo/partials/fish_review", f: todo_fields %>
            <% end %>
          </template>
          <div class="space-y-4">
            <%= form.fields_for :reviews, Review.new, multiple: true do |todo_fields| %>
              <%= render "avo/partials/fish_review", f: todo_fields %>
            <% end %>
            <div data-nested-form-target="target"></div>
          </div>
        <% end %>
      <% end %>
      <% c.with_footer_tools do %>
        <div class="mt-4">
          <%= a_link 'javascript:void(0);', icon: 'plus', color: :primary, style: :outline, data: {action: "click->nested-form#add"} do %>
            Add another review
          <% end %>
        </div>
      <% end %>
    <% end %>
  <% end %>
</div>
```

### 7. Permit the new nested params

There's one more step we need to do and that's to whitelist the new `reviews_attributes` params to be passed to the model.

```ruby{2}
class Avo::Resources::Fish < Avo::BaseResource
  self.extra_params = [reviews_attributes: [:body, :user_id]]

  # other fields actions, filters and more
  def fields
    field :reviews, as: :has_many

    tool Avo::ResourceTools::NestedFishReviews, only_on: :new
  end
end
```

## Conclusion

There you have it!

Apart from the resource tool and the `extra_params` attribute, we wrote regular Rails code that we would have to write to get this functionality in our app.

![](/assets/img/recipes/nested-records-when-creating/nested-records-demo.gif)


# REST API integration

Recipe [contributed](https://github.com/avo-hq/avo/issues/656) by [santhanakarthikeyan](https://github.com/santhanakarthikeyan).

I've built a page using AVO + REST API without using the ActiveRecord model. I was able to build an index page + associated has_many index page. It would be great if we could offer this as a feature, I guess, Avo would be the only admin framework that can offer this feature in case we take it forward :+1:

I've made it work along with Pagination, Filter and even search are easily doable.

`app/avo/filters/grace_period.rb`
```ruby
class GracePeriod < Avo::Filters::BooleanFilter
  self.name = 'Grace period'

  def apply(_request, query, value)
    query.where(value)
  end

  def options
    {
      grace_period: 'Within graceperiod'
    }
  end
end

```

`app/avo/resources/aging_order_resource.rb`
```ruby
class AgingOrderResource < Avo::BaseResource
  self.title = :id
  self.includes = []

  field :id, as: :text
  field :folio_number, as: :text
  field :order_submitted_at, as: :date_time, timezone: 'Chennai', format: '%B %d, %Y %H:%M %Z'
  field :amc_name, as: :text
  field :scheme, as: :text
  field :primary_investor_id, as: :text
  field :order_type, as: :text
  field :systematic, as: :boolean
  field :order_reference, as: :text
  field :amount, as: :text
  field :units, as: :text
  field :age, as: :text

  filter GracePeriod
end
```

`app/controllers/avo/aging_orders_controller.rb`
```ruby
module Avo
  class AgingOrdersController < Avo::ResourcesController
    def pagy_get_items(collection, _pagy)
      collection.all.items
    end

    def pagy_get_vars(collection, vars)
      collection.where(page: page, size: per_page)

      vars[:count] = collection.all.count
      vars[:page] = params[:page]
      vars
    end

    private

    def per_page
      params[:per_page] || Avo.configuration.per_page
    end

    def page
      params[:page]
    end
  end
end
```

`app/models/aging_order.rb`
```ruby
class AgingOrder
  include ActiveModel::Model
  include ActiveModel::Conversion
  include ActiveModel::Validations
  extend ActiveModel::Naming

  attr_accessor :id, :investment_date, :folio_number, :order_submitted_at,
                :amc_name, :scheme, :primary_investor_id, :order_type, :systematic,
                :order_reference, :amount, :units, :age

  class << self
    def column_names
      %i[id investment_date folio_number order_submitted_at amc_name
         scheme primary_investor_id order_type systematic
         order_reference amount units age]
    end

    def base_class
      AgingOrder
    end

    def root_key
      'data'
    end

    def count_key
      'total_elements'
    end

    def all(query)
      response = HTTParty.get(ENV['AGING_URL'], query: query)
      JSON.parse(response.body)
    end
  end

  def persisted?
    id.present?
  end
end
```

`app/models/lazy_loader.rb`
```ruby
class LazyLoader
  def initialize(klass)
    @offset, @limit = nil
    @params = {}
    @items = []
    @count = 0
    @klass = klass
  end

  def where(query)
    @params = @params.merge(query)
    self
  end

  def items
    all
    @items
  end

  def count(_attr = nil)
    all
    @count
  end

  def offset(value)
    @offset = value
    self
  end

  def limit(value)
    @limit = value
    items[@offset, @limit]
  end

  def all
    api_response
    self
  end

  def to_sql
    ""
  end

  private

  def api_response
    @api_response ||= begin
      json = @klass.all(@params)
      json.fetch(@klass.root_key, []).map do |obj|
        @items << @klass.new(obj)
      end
      @count = json.fetch(@klass.count_key, @items.size)
    end
  end
end
```

`app/policies/aging_order_policy.rb`
```ruby
class AgingOrderPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      LazyLoader.new(scope)
    end
  end

  def index?
    user.admin?
  end

  def show?
    false
  end
end
```

`config/initializers/array.rb`
```ruby
class Array
  def limit(upto)
    take(upto)
  end
end
```



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


# Use markdown for help attributes

:::info User contribution
Recipe [contributed](https://github.com/avo-hq/avo/issues/1390#issuecomment-1302553590) by [dhnaranjo](https://github.com/dhnaranjo).
:::

Desmond needed a way to write markdown in the help field and built an HTML to Markdown compiler.

```ruby
module MarkdownHelpText
  class Renderer < Redcarpet::Render::HTML
    def header(text, level)
      case level
      when 1 then %(<h1 class="mb-4">#{text}</h1>)
      when 2 then %(<h2 class="mb-4">#{text}</h1>)
      else
        %(<h#{level} class="mb-2">#{text}</h#{level}>)
      end
    end

    def paragraph(text)
      %(<p class="mb-2">#{text}</p>)
    end

    def block_code(code, language)
      <<~HTML
        <pre class="mb-2 p-1 rounded bg-gray-500 text-white text-sm">
        <code class="#{language}">#{code.chomp}</code>
        </pre>
      HTML
    end

    def codespan(code)
      %(<code class="mb-2 p-1 rounded bg-gray-500 text-white text-sm">#{code}</code>)
    end

    def list(contents, list_type)
      list_style = case list_type
             when "ul" then "list-disc"
             when "ol" then "list-decimal"
             else "list-none"
             end
      %(<#{list_type} class="ml-8 mb-2 #{list_style}">#{contents}</#{list_type}>)
    end
  end

  def markdown_help(content, renderer: Renderer)
    markdown = Redcarpet::Markdown.new(
      renderer.new,
      filter_html: false,
      escape_html: false,
      autolink: true,
      fenced_code_blocks: true
    ).render(content)

    %(<section>#{markdown}</section>)
  end
end
```

```ruby
 field :description_copy, as: :markdown,
    help: markdown_help(<<~MARKDOWN
      # Dog
      ## Cat
      ### bird
      paragraph about hats **bold hat**

      ~~~
      class Ham
        def wow
          puts "wow"
        end
      end
      ~~~

      `code thinger`

      - one
      - two
      - three
    MARKDOWN
    )
```

![](/assets/img/recipes/use-markdown-in-help-attributes/result.png)


# Use own helpers in Resource files

## TL;DR

Run `rails app:template LOCATION='https://railsbytes.com/script/V2Gsb9'`

## Details

A common pattern is to have some helpers defined in your app to manipulate your data. You might need those helpers in your `Resource` files.

#### Example:

Let's say you have a `Post` resource and you'd like to show a stripped-down version of your `body` field. So in your `posts_helper.rb` file you have the `extract_excerpt` method that sanitizes the body and truncates it to 120 characters.

```ruby
# app/helpers/posts_helper.rb
module PostsHelper
  def extract_excerpt(body)
    ActionView::Base.full_sanitizer.sanitize(body).truncate 120
  end
end
```

Now, you'd like to use that helper inside one of you computed fields.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :excerpt, as: :text do |model|
      extract_excerpt model.body
    end
  end
end
```

Initially you'll get an error similar to `undefined method 'extract_excerpt' for #<Avo::Fields::TextField>`. That's because the compute field executes that method in a scope that's different from your application controller, thus not having that method present.

## The solution

The fix is to include the helper module in the `BaseField` and we can do that using this snippet somewhere in the app (you can add it in `config/initializers/avo.rb`).

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  # Usual Avo config
end

module FieldExtensions
  # Include a specific helper
  include PostsHelper
end

Rails.configuration.to_prepare do
  Avo::Fields::BaseField.include FieldExtensions
end
```

Or you can go wild and include all helpers programatically.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  # Usual Avo config
end

module FieldExtensions
  # Include all helpers
  helper_names = ActionController::Base.all_helpers_from_path Rails.root.join("app", "helpers")
  helpers = ActionController::Base.modules_for_helpers helper_names
  helpers.each do |helper|
    send(:include, helper)
  end
end

Rails.configuration.to_prepare do
  Avo::Fields::BaseField.include FieldExtensions
end
```

Now you can reference all helpers in your `Resource` files.


# Recipes & guides for Avo 3

These guides have been submitted by our community members.



---
license: pro
---

# Record previews

:::warning
This section is a work in progress.
:::

To use record previews add the `preview` field on your resource and add `show_on: :preview` to the fields you'd like to have visible on the preview popover.


```ruby{3,7,11,14}
class Avo::Resources::Team < Avo::BaseResource
  def fields
    field :preview, as: :preview
    field :name,
     as: :text,
     sortable: true,
     show_on: :preview
    field :color,
      as: Avo::Fields::ColorPickerField,
      hide_on: :index,
      show_on: :preview
    field :description,
      as: :textarea,
      show_on: :preview
  end
end
```
![](/assets/img/3_0/record-previews/preview-field.png)


---
version: "1.24.2"
license: pro
demoVideo: https://www.youtube.com/watch?v=LEALfPiyfRk
---

# Records ordering

A typical scenario is when you need to set your records into a specific order. Like re-ordering `Slide`s inside a `Carousel` or `MenuItem`s inside a `Menu`.

The `ordering` class attribute is your friend for this. You can set four actions `higher`, `lower`, `to_top` or `to_bottom`, and the `display_inline` and `visible_on` options.
The actions are simple lambda functions but coupled with your logic or an ordering gem, and they can be pretty powerful.

## Configuration

I'll demonstrate the ordering feature using the `act_as_list` gem.

Install and configure the gem as instructed in the [tutorials](https://github.com/brendon/acts_as_list#example). Please ensure you [give all records position attribute values](https://github.com/brendon/acts_as_list#adding-acts_as_list-to-an-existing-model), so the gem works fine.

Next, add the order actions like below.

```ruby
class Avo::Resources::CourseLink < Avo::BaseResource
  self.ordering = {
    visible_on: :index,
    actions: {
      higher: -> { record.move_higher },
      lower: -> { record.move_lower },
      to_top: -> { record.move_to_top },
      to_bottom: -> { record.move_to_bottom },
    }
  }
end
```

The `record` is the actual instantiated model. The `move_higher`, `move_lower`, `move_to_top`, and `move_to_bottom` methods are provided by `act_as_list`. If you're not using that gem, you can add your logic inside to change the position of the record.

The actions have access to `record`, `resource`, `options` (the `ordering` class attribute) and `params` (the `request` params).

That configuration will generate a button with a popover containing the ordering buttons.

<img :src="('/assets/img/resources/ordering_hover.jpg')" alt="Avo ordering" class="border mb-4" />

## Always show the order buttons

If the resource you're trying to update requires re-ordering often, you can have the buttons visible at all times using the `display_inline: true` option.

```ruby
class Avo::Resources::CourseLink < Avo::BaseResource
  self.ordering = {
    display_inline: true,
    visible_on: :index,
    actions: {
      higher: -> { record.move_higher },
      lower: -> { record.move_lower },
      to_top: -> { record.move_to_top },
      to_bottom: -> { record.move_to_bottom },
    }
  }
end
```

<img :src="('/assets/img/resources/ordering_visible.jpg')" alt="Avo ordering" class="border mb-4" />

## Display the buttons in the `Index` view or association view

A typical scenario is to order the records only in the scope of a parent record, like order the `MenuItems` for a `Menu` or `Slides` for a `Slider`. So you wouldn't need to have the order buttons on the `Index` view but only in the association section.

To control that, you can use the `visible_on` option. The possible values are `:index`, `:association` or `[:index, :association]` for both views.

## Change the scope on the `Index` view

Naturally, you'll want to apply the `order(position: :asc)` condition to your query. You may do that in two ways.

1. Add a `default_scope` to your model. If you're using this ordering scheme only in Avo, then, this is not the recommended way, because it will add that scope to all queries for that model and you probably don't want that.

2. Use the [`index_query`](https://docs.avohq.io/3.0/customization.html#custom-query-scopes) to alter the query in Avo.

```ruby{2-4}
class Avo::Resources::CourseLink < Avo::BaseResource
  self.index_query = -> {
    query.order(position: :asc)
  }

  self.ordering = {
    display_inline: true,
    visible_on: :index, # :index or :association
    actions: {
      higher: -> { record.move_higher }, # has access to record, resource, options, params
      lower: -> { record.move_lower },
      to_top: -> { record.move_to_top },
      to_bottom: -> { record.move_to_bottom }
    }
  }
end


# Avo 3.0 release notes

We brought up a few new things:

 - `panel`s can not receive `show_on: :index`. That will take all the fields inside that panel and display them on the index screen
 - you have access to the `main_panel`. This will hold the resource name, description, buttons and more.
 - `panel`s can now hold `tool`s.
 - `tool`s can be added inside `body` statements inside `panel` statements
 - `tool`s can come before fields using `main_panel`
 - `body`s can have the type of `:clear` to not wrap everything in a white container (aliased to `clear_body`)
 - `sidebar`s can have multiple panels by declaring multiple `sidebar` statements


# Resource panels
<br>
<img :src="('/assets/img/tabs-and-panels/panel.png')" alt="Panel" class="border mb-4" />

Panels are the backbone of Avo's display infrastructure. Most of the information that's on display is wrapped inside a panel. They help maintain a consistent design throughout Avo's pages. They are also available as a view component `Avo::PanelComponent` for custom tools, and you can make your own pages using it.

When using the fields DSL for resources, all fields declared in the root will be grouped into a "main" panel, but you can add your panels.

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true
    field :email, as: :text, name: "User Email", required: true

    panel name: "User information", description: "Some information about this user" do
      field :first_name, as: :text, required: true, placeholder: "John"
      field :last_name, as: :text, required: true, placeholder: "Doe"
      field :active, as: :boolean, name: "Is active", show_on: :show
    end
  end
end
```
<img :src="('/assets/img/tabs-and-panels/root-and-panel.png')" alt="Root fields and panel fields" class="border mb-4" />

You can customize the panel `name` and panel `description`.

## What is the Main Panel?
The Main Panel is the primary container for fields in a resource. It typically includes the resource's title, action buttons, and fields that are part of the resource's core data. You can think of it as the central hub for managing and displaying the resource's information.

The Main Panel is automatically created by Avo based on your resource's field definitions. However, you can also customize it to meet your specific requirements.


## How does Avo compute panels?
By default Avo's field organization occurs behind the scenes, leveraging multiple panels to simplify the onboarding process and reduce complexity when granular customization is not needed.

When retrieving the fields, the first step involves categorizing them based on whether or not they have their own panel. Fields without their own panels are referred to as "standalone" fields. Notably, most association fields, such as `field :users, as: :has_many`, automatically have their dedicated panels.

During the Avo's grouping process, we ensure that the fields maintain the order in which they were declared.

Once the groups are established, we check whether the main panel has been explicitly declared within the resource. If it has been declared, this step is skipped. However, if no main panel declaration exists, we compute a main panel and assign the first group of standalone fields to it. This ensures that the field arrangement aligns with your resource's structure and maintains the desired order.

## Computed panels vs Manual customization
Let's focus on the `fields` method for the next examples. In these examples, we demonstrate how to achieve the same field organization using both computed panels and manual customization. Each example have the code that makes Avo compute the panels and also have an example on how to intentionally declare the panels in order to achieve the same result.

:::code-group
```ruby [Computed]
def fields
  field :id, as: :id
  field :name, as: :text
  field :user, as: :belongs_to
  field :type, as: :text
end
```

```ruby [Customized]
def fields
  main_panel do
    field :id, as: :id
    field :name, as: :text
    field :user, as: :belongs_to
    field :type, as: :text
  end
end
```
:::

On this example Avo figured out that a main panel was not declared and it computes one with all standalone fields.

![](/assets/img/resource-panels/1.png)

<br>

Now let's add some field that is not standalone between `name` and `user` fields.

:::code-group
```ruby{5} [Computed]
def fields
  field :id, as: :id
  field :name, as: :text

  field :reviews, as: :has_many

  field :user, as: :belongs_to
  field :type, as: :text
end
```

```ruby [Customized]
def fields
  main_panel do
    field :id, as: :id
    field :name, as: :text
  end

  field :reviews, as: :has_many

  panel do
    field :user, as: :belongs_to
    field :type, as: :text
  end
end
```
:::

Since the field that has it owns panel was inserted between a bunch of standalone fields Avo will compute a main panel for the first batch of standalone fields (`id` and `name`) and will compute a simple panel for the remaining groups of standalone fields (`user` and `type`)

![](/assets/img/resource-panels/2.png)

<br>

With these rules on mind we have the ability to keep the resource simple and also to fully customize it, for example, if we want to switch the computed main panel with the computed panel we can declare them in the desired order.

```ruby
def fields
  panel do
    field :user, as: :belongs_to
    field :type, as: :text
  end

  field :reviews, as: :has_many

  main_panel do
    field :id, as: :id
    field :name, as: :text
  end
end
```

![](/assets/img/resource-panels/3.png)

By using the `main_panel` and `panel` method, you can manually customize the organization of fields within your resource, allowing for greater flexibility and control.

## Index view fields

By default, only the fields declared in the root and the fields declared inside `main_panel` will be visible on the `Index` view.

```ruby{3-7}
class Avo::Resources::User < Avo::BaseResource
  def fields
    # Only these fields will be visible on the `Index` view
    field :id, as: :id, link_to_record: true
    field :email, as: :text, name: "User Email", required: true
    field :name, as: :text, only_on: :index do
      "#{record.first_name} #{record.last_name}"
    end

    # These fields will be hidden on the `Index` view
    panel name: "User information", description: "Some information about this user" do
      field :first_name, as: :text, required: true, placeholder: "John"
      field :last_name, as: :text, required: true, placeholder: "Doe"
      field :active, as: :boolean, name: "Is active", show_on: :show
    end
  end
end
```

<img :src="('/assets/img/tabs-and-panels/index-view.png')" alt="Index view" class="border mb-4" />


---
version: '2.17'
license: pro
feedbackId: 1073
demoVideo: https://youtu.be/3udJOcc0Jfo
---

# Resource Sidebar

By default, all declared fields are going to be stacked vertically in the main area. But there are some fields with information that needs to be displayed in a smaller area, like boolean, date, and badge fields.
Those fields don't need all that horizontal space and can probably be displayed in a different space.
That's we created the **resource sidebar**.

## Adding fields to the sidebar

Using the `sidebar` block on a resource you may declare fields the same way you would do on the root level. Notice that the sidebar should be declared inside a panel. Each resource can have several panels or main panels and each panel can have it's own sidebars.

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    main_panel do
      field :id, as: :id, link_to_record: true
      field :first_name, as: :text, placeholder: "John"
      field :last_name, as: :text, placeholder: "Doe"

      sidebar do
        field :email, as: :gravatar, link_to_record: true, only_on: :show
        field :active, as: :boolean, name: "Is active", only_on: :show
      end
    end
  end
end
```

![](/assets/img/resource-sidebar/sidebar.jpg)


The fields will be stacked in a similar way in a narrower area on the side of the main panel. You may notice that inside each field, the tabel and value zones are also stacked one on top of the other to allow for a larger area to display the field value.

:::option panel_wrapper
The `panel_wrapper` it's helpful when you want to render a custom tool inside a sidebar and you don't want to apply the `white_panel_classes` to it

```ruby
sidebar panel_wrapper: false do
  tool Avo::ResourceTools::SidebarTool
end
```
:::


---
feedbackId: 836
demoVideo: https://youtu.be/Eex8CiinQZ8?t=196
license: pro
---

# Resource tools

Similar to adding custom fields to a resource, you can add custom tools. A custom tool is a partial added to your resource's `Show` and `Edit` views.

## Generate a resource tool

Run `bin/rails generate avo:resource_tool post_info`. That will create two files. The configuration file `app/avo/resource_tools/post_info.rb` and the partial file `app/views/avo/resource_tools/_post_info.html.erb`.

The configuration file holds the tool's name and the partial path if you want to override it.

```ruby
class Avo::ResourceTools::PostInfo < Avo::BaseResourceTool
  self.name = "Post info"
  # self.partial = "avo/resource_tools/post_info"
end
```

The partial is ready for you to customize further.

```erb
<div class="flex flex-col">
  <%= render Avo::PanelComponent.new title: "Post info" do |c| %>
    <% c.with_tools do %>
      <%= a_link('/avo', icon: 'heroicons/solid/academic-cap', style: :primary) do %>
        Dummy link
      <% end %>
    <% end %>

    <% c.with_body do %>
      <div class="flex flex-col p-4 min-h-24">
        <div class="space-y-4">
          <h3>🪧 This partial is waiting to be updated</h3>

          <p>
            You can edit this file here <code class='p-1 rounded bg-gray-500 text-white text-sm'>app/views/avo/resource_tools/post_info.html.erb</code>.
          </p>

          <p>
            The resource tool configuration file should be here <code class='p-1 rounded bg-gray-500 text-white text-sm'>app/avo/resource_tools/post_info.rb</code>.
          </p>

          <%
            # In this partial, you have access to the following variables:
            # tool
            # @resource
            # @resource.model
            # form (on create & edit pages. please check for presence first)
            # params
            # Avo::App.context
            # current_user
          %>
        </div>
      </div>
    <% end %>
  <% end %>
</div>
```

<img :src="('/assets/img/resource-tools/resource-tool-partial.png')" alt="Avo resource tool partial" class="border mb-4" />

## Partial context

You might need access to a few things in the partial.

You have access to the `tool`, which is an instance of your tool `PostInfo`, and the `@resource`, which holds all the information about that particular resource (`view`, `model`, `params`, and others), the `params` of the request, the `Avo::App.context` and the `current_user`.
That should give you all the necessary data to scope out the partial content.

## Tool visibility

The resource tool is default visible on the `Show` view of a resource. You can change that using the [visibility options](field-options.html#showing-hiding-fields-on-different-views) (`show_on`, `only_on`).

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    tool Avo::ResourceTools::PostInfo, show_on: :edit
  end
end
```

### Using path helpers

Because you're in a Rails engine, you will have to prepend the engine object to the path.

#### For Avo paths

Instead of writing `resources_posts_path(1)` you have to write `avo.resources_posts_path(1)`.

#### For the main app paths

When you want to reference paths from your main app, instead of writing `posts_path(1)`, you have to write `main_app.posts_path`.

## Add custom fields on forms

**From Avo 2.12**

You might want to add a few more fields or pieces of functionality besides the CRUD-generated fields on your forms. Of course, you can already create new [custom fields](./custom-fields) to do it in a more structured way, but you can also use a resource tool to achieve more custom behavior.

You have access to the `form` object that is available on the new/edit pages on which you can attach inputs of your choosing. You can even achieve nested form functionality.

You have to follow three steps to enable this functionality:

1. Add the inputs in a resource tool and enable the tool on the form pages
2. Tell Avo which `params` it should permit to write to the model
3. Make sure the model is equipped to receive the params

In the example below, we'll use the `Avo::Resources::Fish`, add a few input fields (they will be a bit unstyled because this is not the scope of the exercise), and do some actions with some of them.

We first need to generate the tool with `bin/rails g avo:resource_tool fish_information` and add the tool to the resource file.

```ruby{3}
class Avo::ResourcesFish < Avo::BaseResource
  def fields
    tool Avo::ResourceTools::FishInformation, show_on: :forms
  end
end
```

In the `_fish_information.html.erb` partial, we'll add a few input fields. Some are directly on the `form`, and some are nested with `form.fields_for`.

The fields are:

- `fish_type` as a text input
- `properties` as a multiple text input which will produce an array in the back-end
- `information` as nested inputs which will produce a `Hash` in the back-end

```erb{13-36}
<!-- _fish_information.html.erb -->
<div class="flex flex-col">
  <%= render Avo::PanelComponent.new(title: @resource.model.name) do |c| %>
    <% c.with_tools do %>
      <%= a_link('/admin', icon: 'heroicons/solid/academic-cap', style: :primary) do %>
        Primary
      <% end %>
    <% end %>

    <% c.with_body do %>
      <div class="flex flex-col p-4 min-h-24">
        <div class="space-y-4">
          <% if form.present? %>
            <%= form.label :fish_type %>
            <%= form.text_field :fish_type, value: 'default type of fish', class: input_classes %>
            <br>

            <%= form.label :properties %>
            <%= form.text_field :properties, multiple: true, value: 'property 1', class: input_classes %>
            <%= form.text_field :properties, multiple: true, value: 'property 2', class: input_classes %>
            <br>

            <% form.fields_for :information do |information_form| %>
              <%= form.label :information_name %>
              <%= information_form.text_field :name, value: 'information name', class: input_classes %>
              <div class="text-gray-600 mt-2 text-sm">This is going to be passed to the model</div>
              <br>
              <%= form.label :information_history %>
              <%= information_form.text_field :history, value: 'information history', class: input_classes %>
              <div class="text-gray-600 mt-2 text-sm">This is going to be passed to the model</div>
              <br>
              <%= form.label :information_age %>
              <%= information_form.text_field :age, value: 'information age', class: input_classes %>
              <div class="text-gray-600 mt-2 text-sm">This is NOT going to be passed to the model</div>
            <% end %>
          <% end %>
        </div>
      </div>
    <% end %>
  <% end %>
</div>
```

Next, we need to tell Avo and Rails which params are welcomed in the `create`/`update` request. We do that using the `extra_params` option on the `Avo::Resources::Fish`. Avo's internal implementation is to assign the attributes you specify here to the underlying model (`model.assign_attributes params.permit(extra_params)`).

```ruby{2}
class Avo::Resources::Fish < Avo::BaseResource
  self.extra_params = [:fish_type, :something_else, properties: [], information: [:name, :history]]

  def fields
    tool Avo::ResourceTools::FishInformation, show_on: :forms
  end
end
```

The third step is optional. You must ensure your model responds to the params you're sending. Our example should have the `fish_type`, `properties`, and `information` attributes or setter methods on the model class. We chose to add setters to demonstrate the params are called to the model.

```ruby
class Fish < ApplicationRecord
  self.inheritance_column = nil # required in order to use the type DB attribute

  def fish_type=(value)
    self.type = value
  end

  def properties=(value)
    # properties should be an array
    puts ["properties in the Fish model->", value].inspect
  end

  def information=(value)
    # properties should be a hash
    puts ["information in the Fish model->", value].inspect
  end
end
```

If you run this code, you'll notice that the `information.information_age` param will not reach the `information=` method because we haven't allowed it in the `extra_params` option.


# Resource options

Avo effortlessly empowers you to build an entire customer-facing interface for your Ruby on Rails application. One of the most powerful features is how easy you can administer your database records using the CRUD UI.

## Overview

Similar to how you configure your database layer using the Rails models and their DSL, Avo's CRUD UI is configured using `Resource` files.

Each `Resource` maps out one of your models. There can be multiple `Resource`s associated to the same model if you need that.

All resources are located in the `app/avo/resources` directory.

## Resources from model generation

```bash
bin/rails generate model car make:string mileage:integer
```

Running this command will generate the standard Rails files (model, controller, etc.) and `Avo::Resources::Car` & `Avo::CarsController` for Avo.

The auto-generated resource file will look like this:

```ruby
class Avo::Resources::Car < Avo::BaseResource
  self.includes = []
  # self.search = {
  #   query: -> { query.ransack(id_eq: params[:q], m: "or").result(distinct: false) }
  # }

  def fields
    field :id, as: :id
    field :make, as: :text
    field :mileage, as: :number
  end
end
```

This behavior can be omitted by using the argument `--skip-avo-resource`. For example if we want to generate a `Car` model but no Avo counterpart we should use the following command:

```bash
bin/rails generate model car make:string kms:integer --skip-avo-resource
```

## Manually defining resources

```bash
bin/rails generate avo:resource post
```

This command will generate the `Post` resource file in `app/avo/resources/post.rb` with the following code:

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.includes = []
  # self.search = {
  #   query: -> { query.ransack(id_eq: params[:q], m: "or").result(distinct: false) }
  # }

  def fields
    field :id, as: :id
  end
end
```

From this config, Avo will infer a few things like the resource's model will be the `Post` model and the name of the resource is `Post`. But all of those inferred things are actually overridable.

Now, let's say we already have a model `Post` well defined with attributes and associations. In that case, the Avo resource will be generated with the fields attributes and associations.

::: code-group

```ruby [app/models/post.rb]
# == Schema Information
#
# Table name: posts
#
#  id           :bigint           not null, primary key
#  name         :string
#  body         :text
#  is_featured  :boolean
#  published_at :datetime
#  user_id      :bigint
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  status       :integer          default("draft")
#
class Post < ApplicationRecord
 enum status: [:draft, :published, :archived]

 validates :name, presence: true

 has_one_attached :cover_photo
 has_one_attached :audio
 has_many_attached :attachments

 belongs_to :user, optional: true
 has_many :comments, as: :commentable
 has_many :reviews, as: :reviewable

 acts_as_taggable_on :tags
end
```

```ruby [app/avo/resource/post.rb]
class Avo::Resources::Post < Avo::BaseResource
  self.includes = []
  # self.search = {
  #   query: -> { query.ransack(id_eq: params[:q], m: "or").result(distinct: false) }
  # }

  def fields
    field :id, as: :id
    field :name, as: :text
    field :body, as: :textarea
    field :is_featured, as: :boolean
    field :published_at, as: :datetime
    field :user_id, as: :number
    field :status, as: :select, enum: ::Post.statuses
    field :cover_photo, as: :file
    field :audio, as: :file
    field :attachments, as: :files
    field :user, as: :belongs_to
    field :comments, as: :has_many
    field :reviews, as: :has_many
    field :tags, as: :tags
  end
end
```

:::

It's also possible to specify the resource model class. For example, if we want to create a new resource named `MiniPost` resource using the `Post` model we can do that using the following command:

```bash
bin/rails generate avo:resource mini-post --model-class post
```

That command will create a new resource with the same attributes as the post resource above with specifying the `model_class`:

```ruby
class Avo::Resources::MiniPost < Avo::BaseResource
  self.model_class = ::Post
end
```

:::info
You can see the result in the admin panel using this URL `/avo`. The `Post` resource will be visible on the left sidebar.
:::

## Fields

`Resource` files tell Avo what records should be displayed in the UI, but not what kinds of data they hold. You do that using the `fields` method.

Read more about the fields [here](./fields).

```ruby{5-17}
class Avo::Resources::Post < Avo::BaseResource
  self.title = :id
  self.includes = []

  def fields
    field :id, as: :id
    field :name, as: :text, required: true
    field :body, as: :trix, placeholder: "Add the post body here", always_show: false
    field :cover_photo, as: :file, is_image: true, link_to_record: true
    field :is_featured, as: :boolean

    field :is_published, as: :boolean do
      record.published_at.present?
    end

    field :user, as: :belongs_to, placeholder: "—"
  end
end
```

## Routing

Avo will automatically generate routes based on the resource name when generating a resource.

```
Avo::Resources::Post         -> /avo/resources/posts
Avo::Resources::PhotoComment -> /avo/resources/photo_comments
```

If you change the resource name, you should change the generated controller name too.

## Use multiple resources for the same model

Usually, an Avo Resource maps to one Rails model. So there will be a one-to-one relationship between them. But there will be scenarios where you'd like to create another resource for the same model.

Let's take as an example the `User` model. You'll have an `User` resource associated with it.

```ruby
# app/models/user.rb
class User < ApplicationRecord
end

# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_record: true
    field :email, as: :gravatar, link_to_record: true, as_avatar: :circle
    field :first_name, as: :text, required: true, placeholder: "John"
    field :last_name, as: :text, required: true, placeholder: "Doe"
  end
end
```

![](/assets/img/resources/model-resource-mapping-1.jpg)

So when you click on the Users sidebar menu item, you get to the `Index` page where all the users will be displayed. The information displayed will be the gravatar image, the first and the last name.

Let's say we have a `Team` model with many `User`s. You'll have a `Team` resource like so:

```ruby{12}
# app/models/team.rb
class Team < ApplicationRecord
end

# app/avo/resources/team.rb
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_record: true
    field :name, as: :text
    field :users, as: :has_many
  end
end
```

From that configuration, Avo will figure out that the `users` field points to the `User` resource and will use that one to display the users.

But, let's imagine that we don't want to display the gravatar on the `has_many` association, and we want to show the name on one column and the number of projects the user has on another column.
We can create a different resource named `TeamUser` resource and add those fields.

```ruby
# app/avo/resources/team_user.rb
class Avo::Resources::TeamUser < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_record: true
    field :name, as: :text
    field :projects_count, as: :number
  end
end
```

We also need to update the `Team` resource to use the new `TeamUser` resource for reference.

```ruby
# app/avo/resources/team.rb
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_record: true
    field :name, as: :text
    field :users, as: :has_many, use_resource: Avo::Resources::TeamUser
  end
end
```

![](/assets/img/resources/model-resource-mapping-2.jpg)

But now, if we visit the `Users` page, we will see the fields for the `TeamUser` resource instead of `User` resource, and that's because Avo fetches the resources in an alphabetical order, and `TeamUser` resource is before `User` resource. That's definitely not what we want.
The same might happen if you reference the `User` in other associations throughout your resource files.

To mitigate that, we are going to use the `model_resource_mapping` option to set the "default" resource for a model.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.model_resource_mapping = {
    'User': 'Avo::Resources::User'
  }
end
```

That will "shortcircuit" the regular alphabetical search and use the `User` resource every time we don't specify otherwise.

We can still tell Avo which resource to use in other `has_many` or `has_and_belongs_to_many` associations with the [`use_resource`](./associations/has_many#default-4) option.

## Namespaced resources

`Resource`s can't be namespaced yet, so they all need to be in the root level of that directory. If you have a model `Super::Dooper::Trooper::Model` you can use `Avo::Resources::SuperDooperTrooperModel` with the `model_class` option.

```ruby
class Avo::Resources::SuperDooperTrooperModel < Avo::BaseResource
  self.model_class = "Super::Dooper::Trooper::Model"
end
```

## Views

Please read the detailed [views](./views.html) page.


## Extending `Avo::ResourcesController`

You may need to execute additional actions on the `ResourcesController` before loading the Avo pages. You can create an `Avo::BaseResourcesController` and extend your resource controller from it.

```ruby
# app/controllers/avo/base_resources_controller.rb
class Avo::BaseResourcesController < Avo::ResourcesController
  include AuthenticationController::Authentication

  before_action :is_logged_in?
end

# app/controllers/avo/posts_controller.rb
class Avo::PostsController < Avo::BaseResourcesController
end
```

:::warning
You can't use `Avo::BaseController` and `Avo::ResourcesController` as **your base controller**. They are defined inside Avo.
:::

When you generate a new resource or controller in Avo, it won't automatically inherit from the `Avo::BaseResourcesController`. However, you have two approaches to ensure that the new generated controllers inherit from a custom controller:

### `--parent-controller` option on the generators
Both the `avo:controller` and `avo:resource` generators accept the `--parent-controller` option, which allows you to specify the controller from which the new controller should inherit. Here are examples of how to use it:

```bash
rails g avo:controller city --parent-controller Avo::BaseResourcesController
rails g avo:resource city --parent-controller Avo::BaseResourcesController
```

### `resource_parent_controller` configuration option
You can configure the `resource_parent_controller` option in the `avo.rb` initializer. This option will be used to establish the inherited controller if the `--parent-controller` argument is not passed on the generators. Here's how you can do it:

```ruby
Avo.configure do |config|
  # ...
  config.resource_parent_controller = "Avo::BaseResourcesController" # "Avo::ResourcesController" is default value
  # ...
end
```

### Attach concerns to `Avo::BaseController`

Alternatively you can use [this guide](https://avohq.io/blog/safely-extend-a-ruby-on-rails-controller) to attach methods, actions, and hooks to the main `Avo::BaseController` or `Avo::ApplicationController`.


## Manually registering resources

In order to have a more straightforward experience when getting started with Avo, we are eager-loading the `app/avo/resources` directory.
That makes all those resources available to your app without you doing anything else.

If you want to manually load them use the `config.resources` option.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.resources = [
    "Avo::Resources::User",
    "Avo::Resources::Fish",
  ]
end
```

This tells Avo which resources you use and stops the eager-loading process on boot-time.
This means that other resources that are not declared in this array will not show up in your app.


## Resource Options

Resources have a few options available for customization.

:::option `self.title`

Each Avo resource will try to figure out what the title of a record is. It will try the following attributes in order `name`, `title`, `label`, and fallback to the `id`.

You can change it to something more specific, like the model's `first_name` or `slug` attributes.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.title = :slug # it will now reference @post.slug to show the title
end
```

### Using a computed title

If you don't have a `title`, `name`, or `label` attribute in the database, you can add a getter method to your model where you compose the name.

```ruby{3,8-10}
# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :tiny_name
end

# app/models/comment.rb
class Comment < ApplicationRecord
  def tiny_name
    ActionView::Base.full_sanitizer.sanitize(body).truncate 30
  end
end
```

### `title` as a block

If you prefer not to use any record methods and instead compute the resource's title directly within the resource itself, you can accomplish this by assigning a lambda function to the `title` class attribute. You'll have access to `resource` and `record`.

```ruby{3-5}
# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  self.title = -> {
    ActionView::Base.full_sanitizer.sanitize(record.body).truncate 30
  }
end
:::

:::option `self.description`

You might want to display information about the current resource to your users. Then, using the `description` class attribute, you can add some text to the `Index`, `Show`, `Edit`, and `New` views.

<img :src="('/assets/img/resources/description.png')" alt="Avo message" class="border mb-4" />

There are two ways of setting the description. The quick way as a `string` and the more customizable way as a `block`.

### Set the description as a string

```ruby{3}
class Avo::Resources::User < Avo::BaseResource
  self.title = :name
  self.description = "These are the users of the app."
end
```

This is the quick way to set the label, and it will be displayed **on all pages**. If you want to restrict the message to custom views, use a lambda function.

### Set the description as a block

This is the more customizable method where you can access the `record`, `resource`, `view`, `current_user`, and `params` objects.

```ruby{3-13}
class Avo::Resources::User < Avo::BaseResource
  self.title = :name
  self.description = -> do
    if view == :index
    "These are the users of the app"
    else
      if current_user.is_admin?
        "You can update all properties for this user: #{record.id}"
      else
        "You can update some properties for this user: #{record.id}"
      end
    end
  end
end
```
:::

:::option `self.includes`

If you regularly need access to a resource's associations, you can tell Avo to eager load those associations on the <Index /> view using `includes`.

That will help you avoid those nasty `n+1` performance issues.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.includes = [:user, :tags]
end
```
:::

:::option `default_view_type`

On <Index />, the most common view type is `:table`, but you might have some data that you want to display in a `:grid` or `:map`. You can change that by setting `default_view_type` to `:grid` and by adding the `grid` block.

<img :src="('/assets/img/grid-view.jpg')" alt="Avo grid view" class="border mb-4" />

```ruby{2}
class Avo::Resources::Post < Avo::BaseResource
  self.default_view_type = :grid
end
```

Find out more on the [grid view documentation page](grid-view).
:::

:::option `self.model_class`

For some resources you might have a model that is namespaced, or you might have a secondary resource for a model. For that scenario, you can use the `self.model_class` option to tell Avo which model to reference in that resource.

```ruby{2}
class Avo::Resources::DelayedJob < Avo::BaseResource
  self.model_class = ::Delayed::Job

  def fields
    field :id, as: :id
  end
end
```

:::

:::option `self.devise_password_optional`

If you use `devise` and update your user models (usually `User`) without passing a password, you will get a validation error. You can use `devise_password_optional` to stop receiving that error. It will [strip out](https://stackoverflow.com/questions/5113248/devise-update-user-without-password/11676957#11676957) the `password` key from `params`.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.devise_password_optional = true
end
```

### Related

- [Password field](./fields/password)

:::

::::option `self.visible_on_sidebar`

When you get started, the sidebar will be auto-generated for you with all the [dashboards](./dashboards), resources, and [custom tools](./custom-tools).
However, you may have resources that should not appear on the sidebar, which you can hide using the `visible_on_sidebar` option.

```ruby{2}
class Avo::Resources::TeamMembership < Avo::BaseResource
  self.visible_on_sidebar = false
end
```

:::warning
This option is used in the **auto-generated menu**, not in the [menu editor](./menu-editor).

You'll have to use your own logic in the [`visible`](./menu-editor#item-visibility) block for that.
:::
::::

:::option `config.buttons_on_form_footers`

If you have a lot of fields on a resource, that form might get pretty tall. So it would be useful to have the `Save` button in the footer of that form.

You can do that by setting the `buttons_on_form_footers` option to `true` in your initializer. That will add the `Back` and `Save` buttons on the footer of that form for the `New` and `Edit` screens.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.buttons_on_form_footers = true
end
```

<img :src="('/assets/img/resources/buttons_on_footer.png')" alt="Buttons on footer" class="border mb-4" />

:::

:::option `after_create_path`/`after_update_path`

For some resources, it might make sense to redirect to something other than the `Show` view. With `after_create_path` and `after_update_path` you can control that.

The valid options are `:show` (default), `:edit`, or `:index`.

```ruby{2-3}
class Avo::Resources::Comment < Avo::BaseResource
  self.after_create_path = :index
  self.after_update_path = :edit
end
```

### Related

You can go more granular and customize these paths or response more using controller methods.

 - [`after_create_path`](./controllers#after_create_path)
 - [`after_update_path`](./controllers#after_update_path)
 - [`after_destroy_path`](./controllers#after_destroy_path)
:::


:::option `self.record_selector`

You might have resources that will never be selected, and you do not need that checkbox to waste your horizontal space.

You can hide it using the `record_selector` class_attribute.

```ruby{2}
class Avo::Resources::Comment < Avo::BaseResource
  self.record_selector = false
end
```

<img :src="('/assets/img/resources/record_selector.png')" alt="Hide the record selector." class="border mb-4" />
:::

:::option `self.link_to_child_resource`

Let's take an example. We have a `Person` model and `Sibling` and `Spouse` models that inherit from it using Single Table Inheritance (STI).

When you declare this option on the parent resource `Person` it has the following effect. When a user is on the <Index /> view of your the `Person` resource and clicks to visit a `Person` record they will be redirected to a `Child` or `Spouse` record instead of a `Person` record.

```ruby
class Avo::Resources::Person < Avo::BaseResource
  self.link_to_child_resource = true
end
```
:::

:::option `self.keep_filters_panel_open`

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio?t=374" />

There are scenarios where you wouldn't want to close the filters panel when you change the values. For that, you can use the `keep_filters_panel_open` resource option.

```ruby{2}
class Avo::Resources::Course < Avo::BaseResource
  self.keep_filters_panel_open = true

  def fields
    field :id, as: :id
    field :name, as: :text
  end

  def filters
    filter Avo::Filters::CourseCountryFilter
    filter Avo::Filters::CourseCityFilter
  end
end
```

<img :src="('/assets/img/filters/keep-filters-panel-open.gif')" alt="Avo filters" style="width: 300px;" class="border mb-4" />
:::

:::option self.components
By default, for each view we render an component:

`:index` -> `Avo::Views::ResourceIndexComponent`<br>
`:show` -> `Avo::Views::ResourceShowComponent`<br>
`:new`, `:edit` -> `Avo::Views::ResourceEditComponent`

It's possible to change this behavior by using the `self.components` resource option.

```ruby
self.components = {
  resource_index_component: Avo::Views::Users::ResourceIndexComponent,
  resource_show_component: "Avo::Views::Users::ResourceShowComponent",
  resource_edit_component: "Avo::Views::Users::ResourceEditComponent",
  resource_new_component: Avo::Views::Users::ResourceEditComponent
}
```

A resource configured with the example above will start using the declared components instead the default ones.

:::warning Warning
The custom view components must ensure that their initializers are configured to receive all the arguments passed during the rendering of a component. You can verify this in our codebase through the following files:

`:index` -> `app/views/avo/base/index.html.erb`<br>
`:show` -> `app/views/avo/base/show.html.erb`<br>
`:new` -> `app/views/avo/base/new.html.erb`<br>
`:edit` -> `app/views/avo/base/edit.html.erb`
:::
Creating a customized component for a view is most easily achieved by ejecting one of our pre-existing components using the `--scope` parameter. You can find step-by-step instructions in the documentation [here](./customization.html#scope).

Alternatively, there is another method which requires two additional manual steps. This involves crafting a personalized component by extracting an existing one and adjusting its namespace. Although changing the namespace is not mandatory, we strongly recommend it unless you intend for all resources to adopt the extracted component.

Example:
1. Execute the command `bin/rails generate avo:eject --component Avo::Views::ResourceIndexComponent` to eject the specified component.<br><br>
2. Access the newly ejected file and adjust the namespace. You can create a fresh directory like `my_dir` and transfer the component to that directory.<br><br>
2. You have the flexibility to establish multiple directories, just ensure that the class name corresponds to the path of the directories.<br><br>
3. Update the class namespace in the file from `Avo::Views::ResourceIndexComponent` to `Avo::MyDir::Views::ResourceIndexComponent`.<br><br>
4. You can now utilize the customized component in a resource.

```ruby
self.components = {
  resource_index_component: Avo::MyDir::Views::ResourceIndexComponent
}
```

This way you can choose the whatever namespace structure you want and you assure that the initializer is accepting the right arguments.


:::option self.index_query
### Unscoped queries on `Index`
You might have a `default_scope` on your model that you don't want to be applied when you render the `Index` view.
```ruby{2}
class Project < ApplicationRecord
  default_scope { order(name: :asc) }
end
```

You can unscope the query using the `index_query` method on that resource.

```ruby{3}
class Avo::Resources::Project < Avo::BaseResource
  self.title = :name
  self.index_query = -> { query.unscoped }
end
```

## Cards

Use the `def cards` method to add some cards to your resource.

Check [cards documentation](./cards) for more details.

```ruby{9-19}
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id
    field :name, as: :text
    field :email, as: :text
    field :roles, as: :boolean_group, options: {admin: "Administrator", manager: "Manager", writer: "Writer"}
  end

  def cards
    card Avo::Cards::ExampleAreaChart, cols: 3
    card Avo::Cards::ExampleMetric, cols: 2
    card Avo::Cards::ExampleMetric,
      label: "Active users metric",
      description: "Count of the active users.",
      arguments: { active_users: true },
      visible: -> { !resource.view.form? }
  end
end
```

![Alt text](/assets/img/cards_on_resource.png)

:::option self.pagination
<VersionReq version="2.45" />
This feature is designed for managing pagination. For example on large tables of data sometimes count is inefficient and unnecessary.

By setting `self.pagination[:type]` to `:countless`, you can disable the pagination count on the index page.

This is especially beneficial for large datasets, where displaying the total number of items and pages may have some performance impact.

```ruby
# As block:
self.pagination = -> do
  {
    type: :default,
    size: [1, 2, 2, 1],
  }
end

# Or as hash:
self.pagination = {
  type: :default,
  size: [1, 2, 2, 1],
}
```

The exposed pagination setting above have the default value for each key.

### `type`<br><br>
  #### Possible values
  `:default`, `:countless`
  #### Default
  `:default`


### `size`<br><br>
  #### Possible values
  [Pagy docs - Control the page links](https://ddnexus.github.io/pagy/docs/how-to/#control-the-page-links)
  #### Default
  `[1, 2, 2, 1]`

### Examples
#### Default
```ruby
self.pagination = -> do
  {
    type: :default,
    size: [1, 2, 2, 1],
  }
end
```

![Default pagination](/assets/img/resources/pagination/default.png)
<br><br>

#### Countless

```ruby
self.pagination = -> do
  {
    type: :countless
  }
end
```

![Countless pagination](/assets/img/resources/pagination/countless.png)
<br><br>

#### Countless and "pageless"
```ruby
self.pagination = -> do
  {
    type: :countless,
    size: []
  }
end
```
![Countless pagination size empty](/assets/img/resources/pagination/countless_empty_size.png)
:::


# Routing

We stick to Rails defaults in terms of routing just to make working with Avo as straighforward as possible.

## Avo's Engines

Avo's functionality is bundled in a few gems and most of them have their own engines. By default we mount the engines under Avo's routes using a configuration like this one.

```ruby
# Your app's routes.rb
Rails.application.routes.draw do
  mount Avo::Engine, at: Avo.configuration.root_path

  # other routes
end

# Avo's routes.rb
Avo::Engine.routes.draw do
  mount Avo::DynamicFilters::Engine, at: "/avo-dynamic_filters" if defined?(Avo::DynamicFilters::Engine)
  mount Avo::Dashboards::Engine, at: "/dashboards" if defined?(Avo::Dashboards::Engine)
  mount Avo::Pro::Engine, at: "/avo-pro" if defined?(Avo::Pro::Engine)

  # other routes
end
```

:::option `Avo.mount_engines` helper

In order to make mounting the engines easier we added the `Avo.mount_engines` helper which returns a block that can be run in any routing context.

```ruby
# The configuration above turns into
Avo::Engine.routes.draw do
  instance_exec(&Avo.mount_engines)

  # other routes
end
```
:::

Sometimes you might have more exotic use-cases so you'd like to customize those paths accordingly.

## Mount Avo under a `:locale` scope

Having a locale scope is a good way to set the locale for your users. Because of how Rails is mounting engines, that locale scope is not being applied to nested engines, so you'll need to nest them yourself.

```ruby
# This will work for Avo's routes but won't work for the nested engines.
Rails.application.routes.draw do
  scope ":locale" do
    mount Avo::Engine, at: Avo.configuration.root_path
  end
end
```

The fix here is to tell Avo not to mount the engines and have them mounted yourself.

::: code-group
```ruby [config/avo.rb]
Avo.configure do |config|
  # Disable automatic engine mounting
  config.mount_avo_engines = false

  # other configuration
end
```

```ruby [config/routes.rb]
Rails.application.routes.draw do
  scope ":locale" do
    mount Avo::Engine, at: Avo.configuration.root_path
  end

  # other routes
end

if defined? ::Avo
  Avo::Engine.routes.draw do
    scope ":locale" do
      instance_exec(&Avo.mount_engines)
    end
  end
end
```
:::
This will instruct Rails to add the locale scope to all Avo nested engines too.


---
license: advanced
---

# Scopes

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
class Avo::Scopes::Admins < Avo::Pro::Scopes::BaseScope
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

## Options

The scope classes take a few options.

:::option `name`
This value is going to be displayed on the scopes bar as the name of the scope.
:::

:::option `description`
This value is going to be displayed when the user hovers over the scope.
:::

:::option `scope`
The scope you return here is going to be applied to the query of records on that page.

You can use a symbol which will indicate the scope on that model or a block which will have the `query` available so you can apply any modifications you need.

```ruby
class Avo::Scopes::EvenId < Avo::Pro::Scopes::BaseScope
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


---
version: '1.0'
license: community
---

# Search

Finding what you're looking for fast is essential. That's why Avo leverages [ransack's](https://github.com/activerecord-hackery/ransack) powerful query language.

:::info
While we show you examples using `ransack`, you can use other search engines, so `ransack` is not mandatory.
:::

First, you need to add `ransack` as a dependency to your app (breaking change from Avo v1.10).

```ruby
# Gemfile
gem 'ransack'
```

## Enable search for a resource

To enable search for a resource, you need to configure the `search` class attribute to the resource file.

```ruby{2-4}
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_eq: params[:q]).result(distinct: false) }
  }
end
```

The `query` block passes over the `params` object that holds the `q` param, the actual query string. It also provides the `query` variable on which you run the query. That ensures that the [authorization scopes](./authorization.html#scopes) have been appropriately applied.

In this block, you may configure the search however strict or loose you need it. Check out [ransack's search matchers](https://github.com/activerecord-hackery/ransack#search-matchers) to compose the query better.

:::warning
If you're using ransack version 4 and up you must add `ransackable_attributes` and maybe more to your model in order for it to work. Read more about it [here](https://activerecord-hackery.github.io/ransack/going-further/other-notes/#authorization-allowlistingdenylisting).
:::

## Authorize search

<VersionReq version="2.29" />

Since Avo 2.29 search is authorized in policy files using the `search?` method.

```ruby
class UserPolicy < ApplicationPolicy
  def search?
    true
  end
end
```

If the `search?` method returns false, the search operation for that resource is not going to show up in the global search and the search box on index is not going to be displayed.

If you're using `search?` already in your policy file, you can alias it to some other method in you initializer using the `config.authorization_methods` config. More about that on [the authorization page](./authorization.html#using-different-policy-methods).

```ruby
Avo.configure do |config|
  config.authorization_methods = {
    search: 'avo_search?',
  }
  end
```

## Configure the search result

:::option `title`

By default, the search results will be displayed as text. By default search title will be the [resource title](./resources.html#self_title).

<img :src="('/assets/img/search/search_blank.jpg')" alt="Blank search" class="border mb-4" />

You may configure that to be something more complex using the `card -> title` option. That will display it as the title of the search result.

```ruby{6}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: params[:q], m: "or").result(distinct: false) },
    item: -> do
      {
        title: "[#{record.id}]#{record.name}",
      }
    end
  }
end
```

<img :src="('/assets/img/search/search_label.jpg')" alt="Search label" class="border mb-4" />
:::

:::option `description`

<LicenseReq license="pro" />

You might want to show more than just the title in the search result. Avo provides the `card -> description` option to add some more information.

```ruby{7}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: params[:q], m: "or").result(distinct: false) },
    item:  -> do
      {
        title: "[#{record.id}]#{record.name}",
        description: record.truncated_body
      }
    end
  }
end
```

<img :src="('/assets/img/search/search_description.jpg')" alt="Search description" class="border mb-4" />
:::

:::option `image_url`

<LicenseReq license="pro" />

You may improve the results listing by adding an image to each search result. You do that by using the `card -> image_url` attribute that is an url to a image.

```ruby{8}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: params[:q], m: "or").result(distinct: false) },
    item: -> do
      {
        title: "[#{record.id}]#{record.name}",
        description: ActionView::Base.full_sanitizer.sanitize(record.body).truncate(130),
        image_url: main_app.url_for(record.cover_photo),
      }
    end
  }
end
```

:::option `image_format`

<LicenseReq license="pro" />

The image you add to a search result can have a different format based on what you set on the `card -> image_format` attribute. You may choose between three options: `:square`, `:rounded` or `:circle`.

```ruby{9}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: params[:q], m: "or").result(distinct: false) },
    item: -> do
      {
        title: "[#{record.id}]#{record.name}",
        description: ActionView::Base.full_sanitizer.sanitize(record.body).truncate(130),
        image_url: main_app.url_for(record.cover_photo),
        image_format: :rounded
      }
    end
  }
end
```

<img :src="('/assets/img/search/search_avatar.jpg')" alt="Search avatar" class="border mb-4" />

:::option `help`

You may improve the results listing header by adding a piece of text highlighting the fields you are looking for or any other instruction for the user. You do that by using the `help` attribute. This attribute takes a string and appends it to the title of the resource.

<img :src="('/assets/img/search/search_header_help.jpg')" alt="Search Header Help" class="border mb-4" />

```ruby{4}
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(id_eq: params[:q], m: "or").result(distinct: false) },
    help: -> { "- search by id" }
  }
end
```
:::

:::option `result_path`

By default, when a user clicks on a search result, they will be redirected to that record, but you can change that using the `result_path` option.

```ruby
class Avo::Resources::City < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_eq: params[:q]).result(distinct: false) },
    result_path: -> { avo.resources_city_path record, custom: "yup" }
  }
end
```
:::

:::option `hide_on_global`

You might have a resource that you'd like to be able to perform a search on when on its `Index` page but not have it present in the global search. You can hide it using `hide_on_global: true`.

```ruby{7}
class Avo::Resources::TeamMembership < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(id_eq: params[:q], m: "or").result(distinct: false) },
    item: -> do
      {
        description: record.level,
      }
    end,
    hide_on_global: true
  }
end
```
:::

## Resource search

When a resource has the `search` attribute with a valid configuration, a new search input will be displayed on the `Index` view.

![](/assets/img/search/resource_search.jpg)

## Global search

<LicenseReq license="pro" />

Avo also has a global search feature. It will search through all the resources that have the `search` attribute with a valid configuration.

You open the global search input by clicking the trigger on the navbar or by using the <kbd>CMD</kbd> + <kbd>K</kbd> keyboard shortcut (<kbd>Ctrl</kbd> + <kbd>K</kbd> on Windows).

<img :src="('/assets/img/search/global_search_trigger.jpg')" alt="Global search trigger" class="border mb-4" />

### Hide the global search

If you, by any chance, want to hide the global search, you can do so using this setting 👇

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.disabled_features = [:global_search]
end
```

### Scope out global or resource searches

You may want to perform different searches on the `global` search from the `resource` search. You may use the `params[:global]` flag to figure that out.


```ruby
class Avo::Resources::Order < Avo::BaseResource
  self.search = {
    query: -> {
      if params[:global]
        # Perform global search
        query.ransack(id_eq: params[:q], m: "or").result(distinct: false)
      else
        # Perform resource search
        query.ransack(id_eq: params[:q], details_cont: params[:q], m: "or").result(distinct: false)
      end
    }
  }
end
```


---
feedbackId: 943
version: "2.8"
demoVideo: https://www.youtube.com/watch?v=ZMOz22FaAUg
betaStatus: Beta
---

# Stimulus JS & HTML attributes

:::warning
This feature is in the **beta** phase. The API might change while seeing how the community uses it to build their apps.
This is not the **dependable fields** feature but a placeholder so we can observe and see what we need to ship to make it helpful to you.
:::

_What we'll be able to do at the end of reading these docs_

<img :src="('/assets/img/stimulus/country-city-select.gif')" alt="Debug on input stimulus method" class="border mb-4" />

:::info
**Please note** that in order to have the JS code from your controllers loaded in Avo you'll need to add your asset pipeline using [these instructions](custom-asset-pipeline.html). It's really easier than it sounds. It's like you'd add a new JS file to your regular Rails app.
:::

<hr/>

One of the most requested features is the ability to make the forms more dynamic. We want to bring the first iteration of this feature through Stimulus JS integration.
This light layer will allow you to hook into the views and inject your functionality with Stimulus JS.

You'll be able to add your Stimulus controllers to the resource views (`Index`, `Show`, `Edit`, and `New`), attach `classes`, `style`, and `data` attributes to the fields and inputs in different views.

## Assign Stimulus controllers to resource views

To enable a stimulus controller to resource view, you can use the `stimulus_controllers` option on the resource file.

```ruby
class Avo::Resources::Course < Avo::BaseResource
  self.stimulus_controllers = "course-resource"
end
```

You can add more and separate them by a space character.

```ruby
class Avo::Resources::Course < Avo::BaseResource
  self.stimulus_controllers = "course-resource select-field association-fields"
end
```

Avo will add a `resource-[VIEW]` (`resource-edit`, `resource-show`, or `resource-index`) controller for each view.

### Field wrappers as targets

By default, Avo will add stimulus target data attributes to all field wrappers. The notation scheme uses the name and field type `[FIELD_NAME][FIELD_TYPE]WrapperTarget`.

```ruby
# Wrappers get the `data-[CONTROLLER]-target="nameTextWrapper"` attribute and can be targeted using nameTextWrapperTarget
field :name, as: :text

# Wrappers get the `data-[CONTROLLER]-target="createdAtDateTimeWrapper"` attribute and can be targeted using createdAtDateTimeWrapperTarget
field :created_at, as: :date_time

# Wrappers get the `data-[CONTROLLER]-target="hasSkillsTagsWrapper"` attribute and can be targeted using hasSkillsTagsWrapperTarget
field :has_skills, as: :tags
```

For example for the following stimulus controllers `self.stimulus_controllers = "course-resource select-field association-fields"` Avo will generate the following markup for the `has_skills` field above on the `edit` view.

```html{4-7}
<div class="relative flex flex-col md:flex-row md:items-center pb-2 md:pb-0 leading-tight min-h-14"
  data-field-id="has_skills"
  data-field-type="boolean"
  data-resource-edit-target="hasSkillsBooleanWrapper"
  data-course-resource-target="hasSkillsBooleanWrapper"
  data-select-field-target="hasSkillsBooleanWrapper"
  data-association-fields-target="hasSkillsBooleanWrapper"
>
  <!-- Rest of the field content -->
</div>
```

You can add those targets to your controllers and use them in your JS code.

### Field inputs as targets

Similar to the wrapper element, inputs in the `Edit` and `New` views get the `[FIELD_NAME][FIELD_TYPE]InputTarget`. On more complex fields like the searchable, polymorphic `belongs_to` field, where there is more than one input, the target attributes are attached to all `input`, `select`, and `button` elements.

```ruby
# Inputs get the `data-[CONTROLLER]-target="nameTextInput"` attribute and can be targeted using nameTextInputTarget
field :name, as: :text

# Inputs get the `data-[CONTROLLER]-target="createdAtDateTimeInput"` attribute and can be targeted using createdAtDateTimeInputTarget
field :created_at, as: :date_time

# Inputs get the `data-[CONTROLLER]-target="hasSkillsTagsInput"` attribute and can be targeted using hasSkillsTagsInputTarget
field :has_skills, as: :tags
```

### All controllers receive the `view` value

All stimulus controllers receive the `view` attribute in the DOM.

```html{4-5}
<div class="space-y-12"
  data-model-id="280"
  data-controller="resource-edit course-resource"
  data-resource-edit-view-value="edit"
  data-course-resource-view-value="edit"
>
  <!-- The fields and panels -->
</div>
```

Now you can use that inside your Stimulus JS controller like so:

```js{5,9}
import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static values = {
    view: String,
  }

  async connect() {
    console.log('view ->', this.viewValue)
  }
}
```

The possible values are `index`, `show`, `edit`, or `new`

## Assign Stimulus controllers to actions

Similarly as to resource, you can assign stimulus controller to an action. To do that you can use the `stimulus_controllers` option on the action file.

```ruby
class Avo::Actions::ShowCurrentTime < Avo::BaseAction
  self.stimulus_controllers = "city-in-country"
end
```

You can add more and separate them by a space character.

```ruby
class Avo::Actions::ShowCurrentTime < Avo::BaseAction
  self.stimulus_controllers = "course-resource select-field association-fields"
end
```

The same way as for the resources, Avo will add stimulus target data attributes to [all field wrappers](#field-wrappers-as-targets) and [all input fields](#field-inputs-as-targets).

Unlike with the resource, Avo will not add a specific default controller for each type of the view (`index`, `show`, `edit`).
Same way, the controllers will not receive the `view` attribute in the DOM, [as in case of resources](#all-controllers-receive-the-view-value).

## Attach HTML attributes

Using the `html` option you can attach `style`, `classes`, and `data` attributes. The `style` attribute adds the `style` tag to your element, `classes` adds the `class` tag, and the `data` attribute the `data` tag to the element you choose.

Pass the `style` and `classes` attributes as strings, and the `data` attribute a Hash.

```ruby{4-11}
field :name, as: :text, html: {
  edit: {
    wrapper: {
      style: "background: red; text: white;" # string
      classes: "absolute h-[41px] w-full" # string
      data: {
        action: "input->resource-edit#toggle",
        resource_edit_toggle_target_param: "skills_tags_wrapper",
      } # Hash
    }
  }
}
```

### Declare the fields from the outside in

When you add these attributes, you need to think from the outside in. So first the `view` (`index`, `show`, or `edit`), next the element to which you add the attribute (`wrapper`, `label`, `content` or `input`), and then the attribute `style`, `classes`, or `data`.

**The `edit` value will be used for both the `Edit` and `New` views.**

There are two notations through which you can attach the attributes; `object` or `block` notation.

## The `object` notation

This is the simplest way of attaching the attribute. You usually use this when you want to add _static_ content and params.

```ruby{3-9}
field :has_skills,
  as: :boolean,
  html: {
    edit: {
      wrapper: {
        classes: "hidden"
      }
    }
  }
```

In this example, we're adding the `hidden` class to the field wrapper on the `Edit` and `New` views.

## The `block` notation

You can use the' block' notation if you need to do a more complex transformation to add your attributes. You'll have access to the `params`, `current_user`, `record`, and `resource` variables. It's handy in multi-tenancy scenarios and when you need to scope out the information across accounts.

```ruby{3-18}
field :has_skills,
  as: :boolean,
  html: -> do
    edit do
      wrapper do
        classes do
          "hidden"
        end
        data do
          if current_user.admin?
            {
              action: "click->admin#do_something_admin"
            }
          else
            {
              record: record,
              resource: resource,
            }
          end
        end
      end
    end
  end
```

For the `data`, `style`, and `classes` options, you may use the `method` notation alongside the block notation for simplicity.

```ruby{6,7}
field :has_skills,
  as: :boolean,
  html: -> do
    edit do
      wrapper do
        classes("hidden")
        data({action: "click->admin#do_something_admin"})
      end
    end
  end
```

## Where are the attributes added?

You can add attributes to the wrapper element for the `index`, `show`, or `edit` blocks.

## Index field wrapper

```ruby
field :name, as: :text, html: {
  index: {
    wrapper: {}
  }
}
```

<img :src="('/assets/img/stimulus/index-field-wrapper.jpg')" alt="Index field wrapper" class="border mb-4" />

## Show field wrapper

```ruby
field :name, as: :text, html: {
  show: {
    wrapper: {}
  }
}
```

<img :src="('/assets/img/stimulus/show-field-wrapper.jpg')" alt="Show field wrapper" class="border mb-4" />

## Show label target

```ruby
field :name, as: :text, html: {
  show: {
    label: {}
  }
}
```

<img :src="('/assets/img/stimulus/show-label-target.jpg')" alt="Show label target" class="border mb-4" />

## Show content target

```ruby
field :name, as: :text, html: {
  show: {
    content: {}
  }
}
```

<img :src="('/assets/img/stimulus/show-content-target.jpg')" alt="Show content target" class="border mb-4" />

## Edit field wrapper

```ruby
field :name, as: :text, html: {
  edit: {
    wrapper: {}
  }
}
```

<img :src="('/assets/img/stimulus/edit-field-wrapper.jpg')" alt="Edit field wrapper" class="border mb-4" />

## Edit label target

```ruby
field :name, as: :text, html: {
  edit: {
    label: {}
  }
}
```

<img :src="('/assets/img/stimulus/edit-label-target.jpg')" alt="Edit label target" class="border mb-4" />

## Edit content target

```ruby
field :name, as: :text, html: {
  edit: {
    content: {}
  }
}
```

<img :src="('/assets/img/stimulus/edit-content-target.jpg')" alt="Edit content target" class="border mb-4" />

## Edit input target

```ruby
field :name, as: :text, html: {
  edit: {
    input: {}
  }
}
```

<img :src="('/assets/img/stimulus/edit-input-target.jpg')" alt="Index field wrapper" class="border mb-4" />

## Composing the attributes together

You can use the attributes together to make your fields more dynamic.

```ruby{3-9}
  field :has_skills, as: :boolean, html: {
    edit: {
      input: {
        data: {
          # On click run the toggleSkills method on the toggle-fields controller
          action: "input->toggle-fields#toggleSkills",
        }
      }
    }
  }
  field :skills, as: :tags, html: {
    edit: {
      wrapper: {
        # hide this field by default
        classes: "hidden"
      }
    }
  }
```

```js
// toggle_fields_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["skillsTagsWrapper"]; // use the target Avo prepared for you

  toggleSkills() {
    this.skillsTagsWrapperTarget.classList.toggle("hidden");
  }
}
```

## Pre-made stimulus methods

Avo ships with a few JS methods you may use on your resources.

### `resource-edit#toggle`

On your `Edit` views, you can use the `resource-edit#toggle` method to toggle the field visibility from another field.

```ruby{5-7}
field :has_country, as: :boolean, html: {
  edit: {
    input: {
      data: {
        action: "input->resource-edit#toggle", # use the pre-made stimulus method on input
        resource_edit_toggle_target_param: "countrySelectWrapper", # target to be toggled
        # resource_edit_toggle_targets_param: ["countrySelectWrapper"] # add more than one target
      }
    }
  }
}
field :country, as: :select, options: Course.countries.map { |country| [country, country] }.to_h
```

<img :src="('/assets/img/stimulus/toggle-method.gif')" alt="Toggle method" class="border mb-4" />

### `resource-edit#disable`

Disable works similarly to toggle, with the difference that it disables the field instead of hiding it.

```ruby{5-7,16}
field :has_skills, as: :boolean, html: {
  edit: {
    input: {
      data: {
        action: "input->resource-edit#disable", # use the pre-made stimulus method on input
        resource_edit_disable_target_param: "countrySelectInput", # target to be disabled
        # resource_edit_disable_targets_param: ["countrySelectWrapper"] # add more than one target to disable
      }
    }
  }
}
field :country, as: :select, options: Course.countries.map { |country| [country, country] }.to_h
```

<img :src="('/assets/img/stimulus/disable-method.gif')" alt="Disable method" class="border mb-4" />

You may also target the `wrapper` element for that field if the target field has more than one input like the searchable polymorphic `belongs_to` field.

```ruby{6}
field :has_skills, as: :boolean, html: {
  edit: {
    input: {
      data: {
        action: "input->resource-edit#disable", # use the pre-made stimulus method on input
        resource_edit_disable_target_param: "countrySelectWrapper", # target the wrapper so all inputs are disabled
        # resource_edit_disable_targets_param: ["countrySelectWrapper"] # add more than one target to disable
      }
    }
  }
}
field :country, as: :select, options: Course.countries.map { |country| [country, country] }.to_h
```

### `resource-edit#debugOnInput`

For debugging purposes only, the `resource_edit` Stimulus JS controller provides the `debugOnInput` method that outputs the event and value for an action to the console. Use this just to make sure you targeted your fields correctly. It doesn't have any real use.

<img :src="('/assets/img/stimulus/debug-on-input.gif')" alt="Debug on input stimulus method" class="border mb-4" />

## Custom Stimulus controllers

<DemoVideo demo-video="https://youtu.be/ZMOz22FaAUg?t=1127" />

The bigger purpose of this feature is to create your own Stimulus JS controllers to bring the functionality you need to the CRUD interface.

Below is an example of how you could implement a city & country select feature where the city select will have its options changed when the user selects a country:

1. Add an action to the country select to trigger a change.
1. The stimulus method `onCountryChange` will be triggered when the user changes the country.
1. That will trigger a fetch from the server where Rails will return an array of cities for the provided country.
1. The city field will have a `loading` state while we fetch the results.
1. The cities will be added to the `city` select field
1. If the initial value is present in the returned results, it will be selected.
1. All of this will happen only on the `New` and `Edit` views because of the condition we added to the `connect` method.

::: code-group

```ruby [app/avo/resources/course.rb]
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  self.stimulus_controllers = "course-resource"

  def fields
    field :id, as: :id
    field :name, as: :text
    field :country, as: :select, options: Course.countries.map { |country| [country, country] }.to_h, html: {
      edit: {
        input: {
          data: {
            course_resource_target: "countryFieldInput", # Make the input a target
            action: "input->course-resource#onCountryChange" # Add an action on change
          }
        }
      }
    }
    field :city, as: :select, options: Course.cities.values.flatten.map { |city| [city, city] }.to_h, html: {
      edit: {
        input: {
          data: {
            course_resource_target: "cityFieldInput" # Make the input a target
          }
        }
      }
    }
  end
end
```

```ruby{4-6} [config/routes.rb]
Rails.application.routes.draw do
  if defined? ::Avo
    Avo::Engine.routes.draw do
      scope :resources do
        get "courses/cities", to: "courses#cities"
      end
    end
  end
end
```

```ruby{3} [app/controllers/avo/courses_controller.rb]
class Avo::CoursesController < Avo::ResourcesController
  def cities
    render json: get_cities(params[:country]) # return an array of cities based on the country we received
  end

  private

  def get_cities(country)
    return [] unless Course.countries.include?(country)

    Course.cities[country.to_sym]
  end
end
```

```ruby [app/models/course.rb]
class Course < ApplicationRecord
  def self.countries
    ["USA", "Japan", "Spain", "Thailand"]
  end

  def self.cities
    {
      USA: ["New York", "Los Angeles", "San Francisco", "Boston", "Philadelphia"],
      Japan: ["Tokyo", "Osaka", "Kyoto", "Hiroshima", "Yokohama", "Nagoya", "Kobe"],
      Spain: ["Madrid", "Valencia", "Barcelona"],
      Thailand: ["Chiang Mai", "Bangkok", "Phuket"]
    }
  end
end
```

```js [course_resource_controller.js]
import { Controller } from "@hotwired/stimulus";

const LOADER_CLASSES = "absolute bg-gray-100 opacity-10 w-full h-full";

export default class extends Controller {
  static targets = ["countryFieldInput", "cityFieldInput", "citySelectWrapper"];

  static values = {
    view: String,
  };

  // Te fields initial value
  static initialValue;

  get placeholder() {
    return this.cityFieldInputTarget.ariaPlaceholder;
  }

  set loading(isLoading) {
    if (isLoading) {
      // create a loader overlay
      const loadingDiv = document.createElement("div");
      loadingDiv.className = LOADER_CLASSES;
      loadingDiv.dataset.target = "city-loader";

      // add the loader overlay
      this.citySelectWrapperTarget.prepend(loadingDiv);
      this.citySelectWrapperTarget.classList.add("opacity-50");
    } else {
      // remove the loader overlay
      this.citySelectWrapperTarget
        .querySelector('[data-target="city-loader"]')
        .remove();
      this.citySelectWrapperTarget.classList.remove("opacity-50");
    }
  }

  async connect() {
    // Add the controller functionality only on forms
    if (["edit", "new"].includes(this.viewValue)) {
      this.captureTheInitialValue();

      // Trigger the change on load
      await this.onCountryChange();
    }
  }

  // Read the country select.
  // If there's any value selected show the cities and prefill them.
  async onCountryChange() {
    if (this.hasCountryFieldInputTarget && this.countryFieldInputTarget) {
      // Get the country
      const country = this.countryFieldInputTarget.value;
      // Dynamically fetch the cities for this country
      const cities = await this.fetchCitiesForCountry(country);

      // Clear the select of options
      Object.keys(this.cityFieldInputTarget.options).forEach(() => {
        this.cityFieldInputTarget.options.remove(0);
      });

      // Add blank option
      this.cityFieldInputTarget.add(new Option(this.placeholder));

      // Add the new cities
      cities.forEach((city) => {
        this.cityFieldInputTarget.add(new Option(city, city));
      });

      // Check if the initial value is present in the cities array and select it.
      // If not, select the first item
      const currentOptions = Array.from(this.cityFieldInputTarget.options).map(
        (item) => item.value
      );
      if (currentOptions.includes(this.initialValue)) {
        this.cityFieldInputTarget.value = this.initialValue;
      } else {
        // Select the first item
        this.cityFieldInputTarget.value =
          this.cityFieldInputTarget.options[0].value;
      }
    }
  }

  // Private

  captureTheInitialValue() {
    this.initialValue = this.cityFieldInputTarget.value;
  }

  async fetchCitiesForCountry(country) {
    if (!country) {
      return [];
    }

    this.loading = true;

    const response = await fetch(
      `${window.Avo.configuration.root_path}/resources/courses/cities?country=${country}`
    );
    const data = await response.json();

    this.loading = false;

    return data;
  }
}
```

:::

This is how the fields behave with this Stimulus JS controller.

<img :src="('/assets/img/stimulus/country-city-select.gif')" alt="Debug on input stimulus method" class="border mb-4" />

## Use Stimulus JS in a tool

There are a few steps you need to take in order to register the Stimulus JS controller in the current app context.

First, you need to have a JS entrypoint (ex: `avo.custom.js`) and have that loaded in the `_head` partial. For instructions on that please follow [these steps](./custom-asset-pipeline#add-custom-js-code-and-stimulus-controllers) to add it to your app (`importmaps` or `esbuild`).

### Set up a controller

```js
// app/javascript/controllers/sample_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    console.log("Hey from sample controller 👋");
  }
}
```

### Register that controller with the current Stimulus app

```js
// app/javascript/avo.custom.js
import SampleController from "controllers/sample_controller";

// Hook into the stimulus instance provided by Avo
const application = window.Stimulus;
application.register("course-resource", SampleController);

// eslint-disable-next-line no-console
console.log("Hi from Avo custom JS 👋");
```

### Use the controller in the Avo tool

```erb
<!-- app/views/avo/_sample_tool.html.erb -->
<div data-controller="sample">
  <!-- content here -->
</div>
```

Done 🙌 Now you have a controller connecting to a custom [Resource tool](./resource-tools) or [Avo tool](./custom-tools) (or Avo views).


---
feedbackId: 1073
version: '2.10'
license: pro
demoVideo: https://youtu.be/B1Y-Z-R-Ys8?t=175
betaStatus: Open beta
---

# Tabs

Once your Avo resources reach a certain level of complexity, you might feel the need to better organize the fields, associations, and resource tools into groups. You can already use the [`heading`](fields/heading) to separate the fields inside a panel, but maybe you'd like to do more.

Tabs are a new layer of abstraction over panels. They enable you to group panels and tools together under a single pavilion and toggle between them.

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true
    field :email, as: :text, name: "User Email", required: true

    tabs do
      tab "User information", description: "Some information about this user" do
        panel do
          field :first_name, as: :text, required: true, placeholder: "John"
          field :last_name, as: :text, required: true, placeholder: "Doe"
          field :active, as: :boolean, name: "Is active", show_on: :show
        end
      end

      field :teams, as: :has_and_belongs_to_many
      field :people, as: :has_many
      field :spouses, as: :has_many
      field :projects, as: :has_and_belongs_to_many
    end
  end
end
```

<img :src="('/assets/img/tabs-and-panels/tabs.png')" alt="Avo tabs" class="border mb-4" />

To use tabs, you need to open a `tabs` group block. Next, you add your `tab` block where you add fields and panels like you're used to on resource root. Most fields like `text`, `number`, `gravatar`, `date`, etc. need to be placed in a `panel`. However, the `has_one`, `has_many`, and `has_and_belongs_to_many` have their own panels, and they don't require a `panel` or a `tab`.

The tab `name` is mandatory is what will be displayed on the tab switcher. The tab `description` is what will be displayed in the tooltip on hover.

<img :src="('/assets/img/tabs-and-panels/tab-name-description.png')" alt="Avo tab name and description" class="border mb-4" />

## Tabs on Show view

Tabs have more than an aesthetic function. They have a performance function too. On the <Show /> page, if you have a lot of `has_many` type of fields or tools, they won't load right away, making it a bit more lightweight for your Rails app. Instead, they will lazy-load only when they are displayed.

## Tabs on Edit view

All visibility rules still apply on <Edit />, meaning that `has_*` fields will be hidden by default. However, you can enable them by adding `show_on: :edit`. All other fields will be loaded and hidden on page load. This way, when you submit a form, if you have validation rules in place requiring a field that's in a hidden tab, it will be present on the page on submit-time.

## Durable and "Bookmarkable"

Tabs remain durable within views, meaning that when switch between views, each tab group retains the selected tab. This ensures a consistent UX, allowing for seamless navigation without losing context.

Moreover, you have the ability to bookmark a link with a personalized tab selection.

This functionalities relies on the unique tab group ID. To take full advantage of this feature, it's important to assign a unique ID to each tab group defined in your application.

```ruby {1}
tabs id: :some_random_uniq_id do
  field :posts, as: :has_many, show_on: :edit
end
```
<!-- The panel has a few parts available -->


<!-- <img :src="('/assets/img/tabs-and-panels/panel-top.png')" alt="Avo Panels" class="border mb-4" /> -->
<!-- <img :src="('/assets/img/tabs-and-panels/panel-bottom.png')" alt="Avo Panels" class="border mb-4" /> -->




# TailwindCSS integration

We use TailwindCSS 3.0 with the JIT engine to style Avo, so on release we only pack the used Tailwind classes in our final css file. That's why, when you want to style your custom content (tools, resource tools, fields, or ejected partials), you won't have access to all of Tailwind's utility classes. It's a feature, not a bug. It's a performance optimization.

But there's an easy way to overcome that. You can add your own TailwindCSS process to watch for your the utility classes you use.

In versions prior to Avo 3, we maintained separate pre-compiled assets and provided a way to inject your Tailwind CSS assets into Avo's application. This often led to stylesheet conflicts. Now, we've improved integration by compiling a single stylesheet during the build process. If you want to add Tailwind configurations to Avo, your application will compile Avo's assets alongside your own in one build.

```bash
bin/rails generate avo:tailwindcss:install
```

That command will:

- install `tailwindcss-rails` gem if you haven't installed it yet;
- generate Avo's tailwind config.js `config/avo/tailwind.config.js`
- generate tailwind `base`, `components` and `utilities` under `app/assets/stylesheets/avo/tailwind` directory (workaround to import avo's base css after tailwind's base)
- create a custom `app/assets/stylesheets/avo/tailwind.css` file where you can further customize your Avo space;
- generate or enhance your `Procfile.dev` with the required compile `yarn avo:tailwind:css --watch` command, as per default `tailwindcss-rails` practices;
- enhance your `package.json` file with the build script. **Make sure `package.json` is present, `npm init` will generate one if your project does'n have it**.
- enhance your `Rake` file with the following code:
```ruby
# When running `rake assets:precompile` this is the order of events:
# 1 - Task `avo:yarn_install`
# 2 - Task `avo:sym_link`
# 3 - Cmd  `yarn avo:tailwind:css`
# 4 - Task `assets:precompile`
Rake::Task["assets:precompile"].enhance(["avo:sym_link"])
Rake::Task["avo:sym_link"].enhance(["avo:yarn_install"])
Rake::Task["avo:sym_link"].enhance do
  `yarn avo:tailwind:css`
end
```

Now, instead of running `bin/rails server`, you can run that Procfile with `bin/dev`.

:::info
You mileage may vary when running these tasks depending with your setup. The gist is that you need to run `yarn avo:tailwind:css` on deploy0time to compile the css file and `yarn avo:tailwind:css --watch` to watch for changes in development.
:::

Inside `app/assets/stylesheets/avo` you'll have a new `tailwind.css` file that's waiting for you to customize. The default `config/avo/tailwind.config.js` file should have the proper paths set up for purging and should be ready to go. Notice that it utilizes an preset that we manage, that preset is essential to build all avo's styles.

```css
@import 'tailwindcss/base';
/* Have all of Avo's custom and plugins styles available. */
@import '../../../../tmp/avo/base.css';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/*

@layer components {
  .btn-primary {
    @apply py-2 px-4 bg-blue-200;
  }
}

*/
```

:::warning Avo Task Dependencies
You must ensure that the `avo:sym_link` and `avo:yarn_install` tasks are executed before building the Avo assets.

These tasks are responsible for creating various symbolic links within the `tmp/avo` directory and installing necessary Node modules within Avo's path. These modules are essential for utilizing the Avo Tailwind preset. And the symbolic links are essentials for purging all Avo's tailwind classes.
:::


<!-- @include: ./../common/technical-support.md-->


---
feedbackId: 1168
---

# Testing

:::info
We know the testing guides aren't very detailed, and some testing helpers are needed. So please send your feedback [here](https://github.com/avo-hq/avo/discussions/1168).
:::

Testing is an essential aspect of your app. Most Avo DSLs are Ruby classes, so regular testing methods should apply.

## Testing helpers

We prepared a few testing helpers for you to use in your apps. They will help with opening/closing datepickers, choosing the date, saving the records, add/remove tags, and also select a lot of elements throughout the UI.

You can find them all [here](https://github.com/avo-hq/avo/blob/main/lib/avo/test_helpers.rb),

## Testing Actions

Given this `Avo::Actions::ReleaseFish`, this is the `spec` that tests it.

```ruby
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.name = "Release fish"
  self.message = "Are you sure you want to release this fish?"

  def fields
    field :message, as: :textarea, help: "Tell the fish something before releasing."
  end

  def handle(**args)
    args[:records].each do |record|
      record.release
    end

    succeed "#{args[:records].count} fish released with message '#{args[:fields][:message]}'."
  end
end

```

```ruby
require 'rails_helper'

RSpec.feature ReleaseFish, type: :feature do
  let(:fish) { create :fish }
  let(:current_user) { create :user }
  let(:resource) { Avo::Resources::User.new.hydrate model: fish }

  it "tests the dummy action" do
    args = {
      fields: {
        message: "Bye fishy!"
      },
      current_user: current_user,
      resource: resource,
      models: [fish]
    }

    action = described_class.new(model: fish, resource: resource, user: current_user, view: :edit)

    expect(action).to receive(:succeed).with "1 fish released with message 'Bye fishy!'."
    expect(fish).to receive(:release)

    action.handle **args
  end
end
```


# Upgrade guide

We'll update this page when we release new Avo 3 versions.

If you're looking for the Avo 2 to Avo 3 upgrade guide, please visit [the dedicated page](./avo-2-avo-3-upgrade).

## Upgrade from 3.1.3 to 3.1.4

:::option `Avo::Filters::BaseFilter.decode_filters`
We removed the rescue that would return `{}` on parsing error. This rescue block was occasionally concealing pertinent errors. Ensure that when invoking `Avo::Filters::BaseFilter.decode_filters` the argument is not `nil` and has been encoded using the `Avo::Filters::BaseFilter.encode_filters` method.
:::

## Upgrade from 3.0.1.beta24 to 3.0.2

:::option Sidebar should be declared inside a panel
We introduced the `main_panel` option and also refactored the way that fields are fetched from the resource, now we allow multiple sidebars per panel but each sidebar should be defined inside a `panel` or `main_panel` block.

We suggest to read [panels](resource-panels) and [sidebars](resource-sidebar) sections for more information and to be aware of the new possibilities.
:::

:::option Dashboards visibility and authorization
Previously, if the `visible` attribute was set to `false` on dashboards, visiting them was impossible because the controller would trigger a "Not found" error. In cases where `authorize` returned `false`, the controller would block access but still keep the dashboard visible.

This behavior has been enhanced. Now, even if `visible` is set to `false`, the dashboard remains accessible but won't appear in the menu. Additionally, if `authorize` returns `false`, the dashboards are now hidden.
:::

:::option Actions
We've internally implemented some changes around actions to resolve certain bugs. No action is needed from your end, but if you happen to notice any anomalies in the actions flow, please get in touch with us so we can address them promptly. Thank you.
:::

:::option Attachments eager load

Attachments are no longer automatically eager loading. If you want to eager load attachments there are at least two ways:

### Use [`self.includes`](resources.html#self_includes) option

```ruby
class Avo::Resources::PhotoComment < Avo::BaseResource
  self.includes = [:user, [photo_attachment: :blob]]

  def fields
    field :user, as: :belongs_to
    field :photo, as: :file, is_image: true
  end
```

### Use [`self.index_query`](customization.html#custom-scope-for-index-page) option
```ruby
class Avo::Resources::Product < Avo::BaseResource
   self.index_query = -> {
    query.includes image_attachment: :blob
  }

  def fields
    field :image, as: :file, is_image: true
  end
```

:::

## Upgrade from 3.0.1.beta23 to 3.0.1.beta24

:::option Cards
With the new feature that allow [cards on resources](resources.html#cards)  we've realized that it's no longer logical to retain cards within the `Dashboard` namespace scope. Consequently, each card is now located within the `Avo::Cards` namespace.

```ruby
# Before
class Avo::Cards::AmountRaised < Avo::Dashboards::MetricCard
class Avo::Cards::ExampleAreaChart < Avo::Dashboards::ChartkickCard
class Avo::Cards::ExampleBarChart < Avo::Dashboards::ChartkickCard
# ...

# After
class Avo::Cards::AmountRaised < Avo::Cards::MetricCard
class Avo::Cards::ExampleAreaChart < Avo::Cards::ChartkickCard
class Avo::Cards::ExampleBarChart < Avo::Cards::ChartkickCard
# ...

```
:::


## Upgrade from 3.0.1.beta22 to 3.0.1.beta23
:::option Caching
Since there are many available cache stores and we were allowing only few we changed the way of computing the cache store to be used by Avo.

One of our concerns was to maintain the status quo, but if you notice any caching issues there is a new configurable option [`config.cache_store`](cache#custom-selection) that allows you to tell Avo what `cache_store` to use.

Check [cache page](cache) for more details.
:::

## Upgrade from 3.0.1.beta8 to 3.0.1.beta9
:::option Heading as field
Heading option changed declaration mode, one of the main reasons for this change is to be able to generate a clear `data-field-id` on the DOM

For more information about `heading` field syntax check [`heading` field's documentation](./fields/heading).
::: code-group
```ruby [Before]
heading "personal information"
heading "contact"
heading '<div class="underline uppercase font-bold">DEV</div>', as_html: true
```

```ruby [After]
field :personal_information, as: :heading       # data-field-id == "personal_information"
field :heading, as: :heading, label: "Contact"  # data-field-id == "heading"
field :dev, as: :heading, as_html: true, label: '<div class="underline uppercase font-bold">DEV</div>'
```
:::

:::option Badge field `secondary` option renamed to `neutral`
We believe that the term `neutral` better reflects the intended use.
::: code-group
```ruby {8} [Before]
field :stage,
  as: :badge,
  options: {
    info: [:discovery, :idea],
    success: :done,
    warning: "on hold",
    danger: :cancelled,
    secondary: :drafting
  }
```

```ruby {8} [After]
field :stage,
  as: :badge,
  options: {
    info: [:discovery, :idea],
    success: :done,
    warning: "on hold",
    danger: :cancelled,
    neutral: :drafting
  }
```
:::

:::option Rename `link_to_resource` to `link_to_record`
`link_to_resource` was renamed to `link_to_record`.
::: code-group
```ruby {3-4} [Before]
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_resource: true
    field :email, as: :gravatar, link_to_resource: true
  end
end
```

```ruby {3-4} [After]
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true
    field :email, as: :gravatar, link_to_record: true
  end
end
```
:::

## Upgrade from 3.0.1.beta5 to 3.0.1.beta6

:::option The status field changed behavior
Before, for the status you'd set the `failed` and `loading` states and everything else fell under `success`. That felt unnatural. We needed a `neutral` state.
Now we changed the field so you'll set the `failed`, `loading`, and `success` values and the rest fall under `neutral`.

```ruby
# Before
field :status,
  as: :status,
  failed_when: :failed,
  loading_when: :loading

# After
field :status,
  as: :status,
  failed_when: :failed,
  loading_when: :loading
  success_when: :deployed # specify the success state
```
:::


# Views

The Avo CRUD feature generates with four main views for each resource.

:::option `Index`
The page where you see all your resources listed in a table or a [grid](grid-view.md).
:::

:::option `Show`
The page where you see one resource in more detail.
:::

:::option `Edit`
The page where you can edit one resource.
:::

:::option `New`
The page where you can create a new resource.
:::

## Preview

The fields marked with `show_on :preview`, will be show in the [preview field](./fields/preview) popup.
By default, all fields are hidden in `:preview`.

## Checking the current view

The `view` object, available in the code, is an instance of the `Avo::ViewInquirer` class.
This enables you to examine the existing `view` status through expressions such as `view.show?` and `view.index?`.
Essentially, these are equivalent to asserting whether view equals `show` or `index`.

## Multiple ways to check

```ruby
view == "edit" # Check against a string
view == :edit # Check against a symbol
view.edit? # Ask if it's a view
view.form? # Ask if it's a collection of views
view.in? [:edit, :new] # Check against an array of symbols
view.in? ["edit", "new"] # Check against an array of strings
```

::: code-group
```ruby [Ask]
if view.show?
  # Code for the "show" view
elsif view.index?
  # Code for the "index" view
elsif view.edit?
  # Code for the "edit" view
elsif view.new?
  # Code for the "new" view
elsif view.form?
  # Code for the "new" or "edit" views
elsif view.display?
  # Code for the "index or "show" views
end
```

```ruby [Symbol comparator]
if view == :show
  # Code for the "show" view
elsif view == :index
  # Code for the "index" view
elsif view == :edit
  # Code for the "edit" view
elsif view == :new
  # Code for the "new" view
end
```

```ruby [String comparator]
if view == "show"
  # Code for the "show" view
elsif view == "index"
  # Code for the "index" view
elsif view == "edit"
  # Code for the "edit" view
elsif view == "new"
  # Code for the "new" view
end
```
:::

It's also possible to check if the view is on a `form` (`new`, `edit`) or `display` (`index`, `show`).

::: code-group
```ruby [Ask]
if view.form?
  # Code for the "new" and "edit" views
elsif view.display?
  # Code for the "show" and "index" views
end
```

```ruby [Symbol comparator]
if view.in? [:new, :edit]
  # Code for the "new" and "edit" views
elsif view.in? [:show, :index]
  # Code for the "show" and "index" views
end
```

```ruby [String comparator]
if view.in? ["new", "edit"]
  # Code for the "new" and "edit" views
elsif view.in? ["show", "index"]
  # Code for the "show" and "index" views
end
```
:::


