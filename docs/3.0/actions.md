---
license: community
feedbackId: 837
---

# Actions

<DemoVideo demo-video="https://youtu.be/BK47E7TMXn0?t=778" />

Avo actions allow you to perform specific tasks on one or more of your records.

For example, you might want to mark a user as active/inactive and optionally send a message that may be customized by the person that wants to run the action.

Once you attach an action to a resource using the `action` method inside the `actions` method, it will appear in the **Actions** dropdown. By default, actions appear on the `Index`, `Show`, and `Edit` views. Versions previous to 2.9 would only display the actions on the `Index` and `Show` views.

<Image src="/assets/img/actions/actions-dropdown.gif" width="710" height="462" alt="Actions dropdown" />

:::info
Since version <Version version="2.13" /> you may use the [customizable controls](./customizable-controls) feature to show the actions outside the dropdown.
:::

## Creating an action

To generate an action configuration file, run `bin/rails generate avo:action toggle_active`.

```ruby
# app/avo/actions/toggle_active.rb

class Avo::Actions::ToggleActive < Avo::BaseAction
  self.name = "Toggle Active"
  # self.visible = -> do
  #   true
  # end

  # def fields
  #   # Add Action fields here
  # end

  def handle(query:, fields:, current_user:, resource:, **args)
    query.each do |record|
      # Do something with your records.
    end
  end
end
```

## Registering an action

To add the action to a resource, declare it inside the `actions` method as follows:

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

## The `fields` method (optional)

You may add fields to the action just as you do it in a resource. Adding fields is optional.

:::warning
The `belongs_to` field will only work on the <Show /> and <Edit /> page of a record. It won't work on the <Index /> page of a resource.

Read more on why [here](https://github.com/avo-hq/avo/issues/1572#issuecomment-1421461084).
:::

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


<Image src="/assets/img/actions/action-fields.jpg" width="711" height="332" alt="Actions" />

## The `handle` method

This is where the magic happens. This method contains your action logic.

The handle method receives the following arguments:
- `query` and `records`: both names can be used interchangeably. Single records are automatically wrapped in an array.
- `fields`
- `current_user`
- `resource`

```ruby
def handle(query:, fields:, current_user:, resource:, **args)
  # Do something
end
```

## Passing Params to the Action Show Page
When navigation to an action from a resource <Index /> or <Show /> views, it's sometimes useful to pass parameters to an action.

One particular example is when you'd like to populate a field in that action with some particular value based on that param.

```ruby
class Action
  def fields
    field :some_field, as: :hidden, default: -> { if previous_param == yes ? :yes : :no}
  end
end
```
Consider the following scenario:

1. Navigate to `https://main.avodemo.com/avo/resources/users`.
2. Add the parameter `hey=ya` to the URL: `https://main.avodemo.com/avo/resources/users?hey=ya`
3. Attempt to run the dummy action.
4. After triggering the action, verify that you can access the `hey` parameter.
5. Ensure that the retrieved value of the `hey` parameter is `ya`.

#### Implementation

To achieve this, we'll reference the `request.referer` object and extract parameters from the URL. Here is how to do it:

```ruby
class Action
  def fields
    # Accessing the parameters passed from the parent view
    field :some_field, as: :hidden, default: -> {
      # Parsing the request referer to extract parameters
      parent_params = URI.parse(request.referer).query.split("&").map { |param| param.split("=")}.to_h.with_indifferent_access
      # Checking if the `hei` parameter equals `ya`
      if parent_params[:hey] == 'ya'
        :yes
      else
        :no
      end
    }
  end
end
```
Parse the `request.referer` to extract parameters using `URI.parse`.
Split the query string into key-value pairs and convert it into a hash.
Check if the `hey` parameter equals `ya`, and set the default value of `some_field` accordingly.

## Action responses

After an action runs, you may use several methods to respond to the user. For example, you may respond with just a message or with a message and an action.

The default response is to reload the page and show the _Action ran successfully_ message.

### Message responses

Four message response methods are at your disposal: `succeed`, `error`, `warn`, and `inform`. These render green, red, orange, and blue alerts.

```ruby{4-7}
def handle(**args)
  # Demo handle action

  succeed "Success response ✌️"
  warn "Warning response ✌️"
  inform "Info response ✌️"
  error "Error response ✌️"
end
```

<Image src="/assets/img/actions/alert-responses.png" width="1074" height="558" alt="Avo alert responses" />

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
def handle(query:, **args)
  query.each do |record|
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

<Option name="`reload`">

When you use `reload`, a full-page reload will be triggered.

```ruby{9}
def handle(query:, **args)
  query.each do |project|
    project.update active: false
  end

  succeed 'Done!'
  reload
end
```

</Option>
<Option name="`redirect_to`">

`redirect_to` will execute a redirect to a new path of your app. It accept `allow_other_host`, `status` and any other arguments.

Example:
`redirect_to path, allow_other_host: true, status: 303`

```ruby{9}
def handle(query:, **args)
  query.each do |project|
    project.update active: false
  end

  succeed 'Done!'
  redirect_to avo.resources_users_path
end
```
</Option>

<Option name="`turbo`">
There are times when you don't want to perform the actions with Turbo. In such cases, turbo should be set to false.
</Option>

<Option name="`download`">

`download` will start a file download to your specified `path` and `filename`.

**You need to set may_download_file to true for the download response to work like below**. That's required because we can't respond with a file download (send_data) when making a Turbo request.

If you find another way, please let us know 😅.

:::code-group

```ruby{3,18} [app/avo/actions/download_file.rb]
class Avo::Actions::DownloadFile < Avo::BaseAction
  self.name = "Download file"
  self.may_download_file = true

def handle(query:, **args)
    filename = "projects.csv"
    report_data = []

    query.each do |project|
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
</Option>

<Option name="`keep_modal_open`">

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

  def handle(fields:, **args)
    User.create fields
    succeed "All good ✌️"
  rescue => error
    error "Something happened: #{error.message}"
    keep_modal_open
  end
end
```
</Option>

<Option name="`close_modal`">
<VersionReq version="3.3.0" />

This type of response becomes useful when you are working with a form and need to execute an action without redirecting, ensuring that the form remains filled as it is.

`close_modal` will flash all the messages gathered by [action responses](#action-responses) and will close the modal using turbo streams keeping the page still.

```ruby{7}
class Avo::Actions::CloseModal < Avo::BaseAction
  self.name = "Close modal"

  def handle(**args)
    # do_something_here
    succeed "Modal closed!!"
    close_modal
    # or
    do_nothing
  end
end
```
</Option>

<Option name="`do_nothing`">
`do_nothing` is an alias for `close_modal`.

```ruby{7}
class Avo::Actions::CloseModal < Avo::BaseAction
  self.name = "Close modal"

  def handle(**args)
    # do_something_here
    succeed "Modal closed!!"
    do_nothing
  end
end
```
</Option>

<Option name="`navigate_to_action`">
<VersionReq version="3.4.2" />

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

  def handle(query:, fields:, **args)
    navigate_to_action Avo::Actions::City::Update,
      arguments: {
        cities: query.map(&:id),
        render_name: fields[:name],
        render_population: fields[:population]
      }
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

  def handle(fields:, **args)
    City.find(arguments[:cities]).each do |city|
      city.update! fields
    end

    succeed "City updated!"
  end
end
```
:::

You can see this multi-step process in action by visiting the [avodemo](https://main.avodemo.com/avo/resources/cities). Select one of the records, click on the "Update" action, choose the fields to update, and then proceed to update the selected fields in the subsequent action.
</Option>

<Option name="`append_to_response`">
<VersionReq version="3.10.3" />

Avo action responses are in the `turbo_stream` format. You can use the `append_to_response` method to append additional turbo stream responses to the default response.

```ruby{5-7}
def handle(**args)
  succeed "Modal closed!!"
  close_modal

  append_to_response -> {
    turbo_stream.set_title("Cool title ;)")
  }
end
```

The `append_to_response` method accepts a Proc or lambda function. This function is executed within the context of the action's controller response.

The block should return either a single `turbo_stream` response or an array of multiple `turbo_stream` responses.

:::code-group
```ruby[Array]{2-5}
append_to_response -> {
  [
    turbo_stream.set_title("Cool title"),
    turbo_stream.set_title("Cool title 2")
  ]
}
```

```ruby[Single]{2}
append_to_response -> {
  turbo_stream.set_title("Cool title")
}
```
:::
</Option>

<Option name="`reload_records`">
<VersionReq version="3.14.0" />

<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.loom.com/embed/6b9ae6a3968c447f98ac4f9a161fe781?sid=17f08010-6a56-4e8c-8b80-692424327b55" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

:::warning
This option **only** works on **Index** pages, **NOT** on **associations**.
:::

This option leverages Turbo Stream to refresh specific table rows in response to an action. For individual records, you can use the `reload_record` alias method.

```ruby{8}
def handle(query:, fields:, **args)
  query.each do |record|
    record.update! active: !record.active

    record.notify fields[:message] if fields[:notify_user]
  end

  reload_records(query)
end
```

The `reload_records` and `reload_record` methods are aliases, and they accept either an array of records or a single record.

:::code-group
```ruby[Array]{1}
reload_records([record_1, record_2])
```

```ruby[Single]{1}
reload_record(record)
```
:::
</Option>

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

### Callable options

Both `name` and `message` allow a block. Within this block, you gain access to all attributes of [`Avo::ExecutionContext`](execution-context) along with the `record` (if on show view), `resource`, `arguments` and `view`.
### Customize the name

```ruby
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.name = -> { "Release #{record.name}?" }
  self.message = -> { "Are you sure you want to release the #{record.name}?" }
end
```

<!-- <img :src="('/assets/img/actions/actions-message.jpg')" alt="Avo message" class="border mb-4" /> -->

### Customize the buttons

You may customize the labels for the action buttons using `confirm_button_label` and `cancel_button_label`.

<Image src="/assets/img/actions/actions-button-labels.jpg" width="699" height="325" alt="Avo button labels" />

### No confirmation actions

You will be prompted by a confirmation modal when you run an action. If you don't want to show the confirmation modal, pass in the `self.no_confirmation = true` class attribute. That will execute the action without showing the modal at all.

## Standalone actions

You may need to run actions that are not necessarily tied to a model. Standalone actions help you do just that. Add `self.standalone` to an existing action or generate a new one using the `--standalone` option (`bin/rails generate avo:action global_action --standalone`).

```ruby{3}
class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"
  self.standalone = true

  def handle(query:, fields:, current_user:, resource:, **args)
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

  def handle(query:, fields:, current_user:, resource:, **args)
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

The `self.authorize` attribute in action classes is handy when you need to manage authorization for actions. This attribute accepts either a boolean or a proc, allowing the incorporation of custom logic. Within this block, you gain access to all attributes of [`Avo::ExecutionContext`](execution-context) along with the `action`, `resource`, and `view`.

If an action is unauthorized, it will be hidden. If a bad actor attempts to proceed with the action, the controller will re-evaluate the authorization and block unauthorized requests.

```ruby
self.authorize = false

# Or

self.authorize = -> {
  current_user.is_admin?
}
```

## Actions close modal on backdrop click

<VersionReq version="3.14.0" />

By default, action modals use a dynamic backdrop. Add `self.close_modal_on_backdrop_click = false` in case you want to prevent the user from closing the modal when clicking on the backdrop.

```ruby{3}
class Avo::Actions::DummyAction < Avo::BaseAction
  self.name = "Dummy action"
  self.close_modal_on_backdrop_click = false

  def handle(query:, fields:, current_user:, resource:, **args)
    # Do something here

    succeed 'Yup'
  end
end
```

## Custom action arguments

Actions can have different behaviors according to their host resource. In order to achieve that, arguments can receive additional arguments as follows:

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

:::code-group
```ruby{7,8,9,10,11,12,13,15} [Current Version]
field :name,
  as: :text,
  filterable: true,
  name: "name (click to edit)",
  only_on: :index do

  path, data = Avo::Actions::City::Update.link_arguments(
    resource: resource,
    arguments: {
      cities: Array[resource.record.id],
      render_name: true
    }
  )

  link_to resource.record.name, path, data: data
end
```

```ruby{15,16,17,18,20} [< 3.4.2]
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
:::

<Image src="/assets/img/actions/action_link.gif" width="684" height="391" alt="actions link demo" />

## StimulusJS

Please follow our extended [StimulusJS guides](./stimulus-integration.html#use-stimulus-js-in-a-tool) for more information.

## Divider

<VersionReq version="3.5.6" />

Action dividers allow you to organize and separate actions into logical groups, improving the overall layout and usability.

Here's an example of how you can define actions dividers:

```ruby
def actions
    action Avo::Actions::ToggleInactive
    action Avo::Actions::ToggleAdmin
    divider
    action Avo::Actions::Sub::DummyAction
    action Avo::Actions::DownloadFile
    divider
    action Avo::Actions::Test::NoConfirmationRedirect
    action Avo::Actions::Test::CloseModal
  end
```
<Image src="/assets/img/action_divider.png" width="306" height="325" alt="" />

<Option name="`label`">
You can pass a `label` option to display that text
</Option>

## Icon

<VersionReq version="3.5.6" />
Action icons allow you to enhance the visual representation of actions. Action icons provide a quick visual cue for users, helping them identify different actions at a glance.

Here's an example of how you can define actions with icons:

```ruby
def actions
    action Avo::Actions::ToggleInactive, icon: "heroicons/outline/globe"
    action Avo::Actions::ToggleAdmin
    action Avo::Actions::Sub::DummyAction
    action Avo::Actions::DownloadFile, icon: "heroicons/outline/arrow-left"
    action Avo::Actions::Test::NoConfirmationRedirect
    action Avo::Actions::Test::CloseModal
  end
```

<Image src="/assets/img/action_icon.png" width="306" height="325" alt="" />
