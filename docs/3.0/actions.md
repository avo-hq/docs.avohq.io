---
license: community
feedbackId: 837
outline: deep
---

# Actions

<DemoVideo demo-video="https://youtu.be/BK47E7TMXn0?t=778" />

## Overview

Actions in Avo are powerful tools that enable operations on single or multiple records simultaneously, enhancing your interface with custom functionality. They support various tasks, from triggering background jobs to generating reports and handling batch updates, while also collecting additional input via customizable forms.

Common use cases include managing user states, sending notifications, and automating data processing. Their flexibility makes them essential for building robust administrative interfaces, streamlining workflows, and managing data efficiently.

## Generator

Generate a new action file using the Rails generator:

```bash
bin/rails generate avo:action toggle_inactive
```

This will create a new action file at `app/avo/actions/toggle_inactive.rb` with a basic structure.

```ruby
# app/avo/actions/toggle_inactive.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.name = "Toggle Inactive"
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

:::warning Record Selection
By default, actions can only be triggered after selecting at least one record. For actions that should work without record selection (like "Export All" or "Generate Report"), you can either:
- Use the `--standalone` flag when generating the action:
```bash
bin/rails generate avo:action export_users --standalone
```
- Or set `self.standalone = true` in the action class
:::

### `--standalone`
Creates an action that doesn't require record selection. Useful for global operations like generating reports or exporting all records.

```bash
bin/rails generate avo:action export_users --standalone
```

## Usage

Actions are registered within a resource by using the `actions` method. This method defines which actions are available for that specific resource.

### `action`

The `action` method is used to register an action within the `actions` block. It accepts the action class as its first argument and optional configuration parameters

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def actions
    # Basic registration
    action Avo::Actions::ToggleInactive
  end
end
```

:::warning
Using the Pundit policies, you can restrict access to actions using the `act_on?` method. If you think you should see an action on a resource and you don't, please check the policy method.

More info [here](./authorization#act-on)
:::

Once attached, the action will appear in the **Actions** dropdown menu. By default, actions are available on:
- Index view (for bulk operations)
- Show view (for single record operations)
- Edit view (new and edit)

:::info
You may use the [customizable controls](./customizable-controls) feature to show the actions outside the dropdown.
:::

<Option name="`arguments`" headingSize="4">

The `arguments` option allows you to pass custom data to your action. These arguments are accessible throughout the entire action class including the `handle` and `fields` methods.

```ruby{5-7,11-15}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def actions
    action Avo::Actions::ToggleInactive,
      arguments: {
        special_message: true
      }

    # Or as a proc to make it dynamic
    action Avo::Actions::ToggleInactive,
      arguments: -> do
        {
          special_message: resource.view.index? && current_user.is_admin?
        }
      end
  end
end
```

Now, the arguments can be accessed all over the action class like inside `handle` and `fields` methods.

```ruby{4-8}
# app/avo/actions/toggle_inactive.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  def handle(**args)
    if arguments[:special_message]
      succeed "I love 🥑"
    else
      succeed "Success response ✌️"
    end
  end
end
```
</Option>

<Option name="`icon`" headingSize="4">

<VersionReq version="3.5.6" class="mt-4" />

The `icon` option lets you specify the icon to display next to the action in the dropdown menu. Avo supports Heroicons by default.

Here's an example of how you can define actions with icons:

```ruby{4}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def actions
    action Avo::Actions::ToggleInactive, icon: "heroicons/outline/globe"
  end
end
```

</Option>

---

### `divider`

<VersionReq version="3.5.6" class="mt-4" />

Action dividers allow you to organize and separate actions into logical groups, improving the overall layout and usability.
This will create a visual separator in the actions dropdown menu, helping you group related actions together.

```ruby{8}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def actions
    # User status actions
    action Avo::Actions::ActivateUser
    action Avo::Actions::DeactivateUser

    divider

    # Communication actions
    action Avo::Actions::SendWelcomeEmail
    action Avo::Actions::SendPasswordReset
  end
end
```

<Option name="`label`" headingSize="4">

You can also add a label to the divider for better organization:

```ruby{5}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def actions
    action Avo::Actions::ActivateUser
    divider label: "Communication"
    action Avo::Actions::SendWelcomeEmail
  end
end
```

</Option>


## Fields

You may add fields to the action just as you do it in a resource. Adding fields is optional.

Since version <Version version="3.16.2" /> you can access the selected records through the `query` object within fields.

```ruby{5-8}
# app/avo/actions/toggle_active.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.name = "Toggle Inactive"

  def fields
    field :notify_user, as: :boolean
    field :message, as: :textarea, default: "Your account has been marked as inactive."
  end

  def handle(query:, fields:, current_user:, resource:, **args)
    query.each do |record|
      # Do something with your records.
    end
  end
end

```

<Image src="/assets/img/actions/action-fields.jpg" width="711" height="332" alt="Actions" />

:::warning Limitations

---

**Belongs to field**

The `belongs_to` field will **only work** on the <Show /> and <Edit /> page of a record. It **won't** work on the <Index /> page of a resource.

Read more on why [here](https://github.com/avo-hq/avo/issues/1572#issuecomment-1421461084).

---

**Files authorization**

If you're using the `file` field on an action that is registered to a resource that's using the authorization feature, please ensure you have the `upload_{FIELD_ID}?` policy method returning `true`. Otherwise, the `file` input might be hidden.

More about this on the [authorization page](./authorization#attachments).
:::

## Execution Logic

The `handle` method is where you define what happens when your action is executed. This is the core of your action's business logic and is called when a user triggers the action from the UI.

The handle method receives the following arguments:
- `query` Contains the selected record(s). Single records are automatically wrapped in an array for consistency
- `fields` Contains the values submitted through the action's form fields
- `current_user` The currently authenticated user
- `resource` The Avo resource instance that triggered the action

```ruby
# app/avo/actions/toggle_inactive.rb # [!code focus]
class Avo::Actions::ToggleInactive < Avo::BaseAction # [!code focus]
  self.name = "Toggle Inactive"

  def fields
    field :notify_user, as: :boolean
    field :message, as: :textarea, default: "Your account has been marked as inactive."
  end

  def handle(query:, fields:, current_user:, resource:, **args) # [!code focus]
    query.each do |record| # [!code focus]
      # Toggle the inactive status # [!code focus]
      record.update!(inactive: !record.inactive) # [!code focus]

      # Send notification if requested # [!code focus]
      if fields[:notify_user] # [!code focus]
        # Assuming there's a notify method - implement according to your notification system # [!code focus]
        record.notify(fields[:message]) # [!code focus]
      end # [!code focus]
    end # [!code focus]

    succeed "Successfully toggled status for #{query.count} #{'record'.pluralize(query.count)}" # [!code focus]
  end # [!code focus]
end # [!code focus]
```

## Notification types

After an action runs, you can respond to the user with different types of notifications. The default response reloads the page and shows an `Action ran successfully` message of type `inform`.

<Option name="`succeed`" headingSize="3">

Displays a **green** success alert to indicate successful completion.
</Option>

<Option name="`warn`" headingSize="3">

Displays an **orange** warning alert for cautionary messages.
</Option>

<Option name="`inform`" headingSize="3">

Displays a **blue** info alert for general information.
</Option>

<Option name="`error`" headingSize="3">

Displays a **red** error alert to indicate failure or errors.
</Option>

```ruby{4-7}
# app/avo/actions/toggle_inactive.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  def handle(**args)
    succeed "Success response ✌️"
    warn "Warning response ✌️"
    inform "Info response ✌️"
    error "Error response ✌️"
  end
end
```

<Image src="/assets/img/actions/alert-responses.png" width="1074" height="558" alt="Avo notification types" />

<Option name="`silent`" headingSize="3">

You may want to run an action and show no notification when it's done. That is useful for redirect scenarios. You can use the `silent` response for that.

```ruby{5}
# app/avo/actions/toggle_inactive.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  def handle(**args)
    redirect_to "/admin/some-tool"
    silent
  end
end
```
</Option>

## Response types

After an action completes, you can control how the UI responds through various response types. These powerful responses give you fine-grained control over the user experience by allowing you to:

- **Navigate**: Reload pages or redirect users to different parts of your application
- **Manipulate UI**: Control modals, update specific page elements, or refresh table rows
- **Handle Files**: Trigger file downloads and handle data exports
- **Show Feedback**: Combine with notification messages for clear user communication

You can use these responses individually or combine them to create sophisticated interaction flows. Here are all the available action responses:

<Option name="`reload`" headingSize=3>

The `reload` response triggers a full-page reload. This is the default behavior if no other response type is specified.

```ruby{9}
def handle(query:, **args)
  query.each do |project|
    project.update active: false
  end

  succeed 'Done!'
  reload # This is optional since reload is the default behavior
end
```
</Option>

<Option name="`redirect_to`" headingSize=3>

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

<Option name="`download`" headingSize=3>

`download` will start a file download to your specified `path` and `filename`.

**You need to set `self.may_download_file` to true for the download response to work like below**. That's required because we can't respond with a file download (send_data) when making a Turbo request.

If you find another way, please let us know 😅.

:::code-group

```ruby{3,16} [app/avo/actions/download_file.rb]
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

```ruby{8} [app/avo/resources/project.rb]
# app/avo/resources/project.rb
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

<Option name="`keep_modal_open`" headingSize=3>

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

<Option name="`close_modal`" headingSize=3>

<VersionReq version="3.3.0" class="mt-4" />

This type of response becomes useful when you are working with a form and need to execute an action without redirecting, ensuring that the form remains filled as it is.

`close_modal` will flash all the messages gathered by [action responses](#action-responses) and will close the modal using turbo streams keeping the page still.

```ruby{7,9}
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

<Option name="`do_nothing`" headingSize=3>

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

<Option name="`navigate_to_action`" headingSize=3>

<VersionReq version="3.4.2" class="mt-4" />

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

<Option name="`append_to_response`" headingSize=3>

<VersionReq version="3.10.3" class="mt-4" />

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

<Option name="`reload_records`" headingSize=3>

<VersionReq version="3.14.0" class="my-4" />

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

Actions can be customized in several ways to enhance the user experience. You can modify the action's display name, confirmation message, button labels, and confirmation behavior between other things.

There are 2 types of customization, visual and behavioral.

### Visual customization

Visual customization is the process of modifying the action's appearance. This includes changing the action's name, message and button labels.

All visual customization options can be set as a string or a block.

The blocks are executed using [`Avo::ExecutionContext`](execution-context). Within this blocks, you gain access to all attributes of [`Avo::ExecutionContext`](execution-context) along with the `resource`, `record`, `view`, `arguments` and `query`.

<Option name="`name`" headingSize=4>

The `name` option is used to change the action's display name.

```ruby
# app/avo/actions/release_fish.rb
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.name = "Release fish" # [!code focus]

  # Or as a block # [!code focus]
  self.name = -> { # [!code focus]
    record.present? ? "Release #{record.name}?" : "Release fish" # [!code focus]
  } # [!code focus]
end
```

</Option>

<Option name="`message`" headingSize=4>

The `message` option is used to change the action's confirmation message.

```ruby
# app/avo/actions/release_fish.rb
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.message = "Are you sure you want to release the fish?" # [!code focus]

  # Or as a block # [!code focus]
  self.message = -> { # [!code focus]
    if resource.record.present? # [!code focus]
      "Are you sure you want to release the #{resource.record.name}?" # [!code focus]
    else # [!code focus]
      "Are you sure you want to release the fish?" # [!code focus]
    end # [!code focus]
  } # [!code focus]
end
```

</Option>

<Option name="`confirm_button_label`" headingSize=4>

The `confirm_button_label` option is used to change the action's confirmation button label.

```ruby
# app/avo/actions/release_fish.rb
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.confirm_button_label = "Release fish" # [!code focus]

  # Or as a block # [!code focus]
  self.confirm_button_label = -> { # [!code focus]
    if resource.record.present? # [!code focus]
      "Release #{resource.record.name}" # [!code focus]
    else # [!code focus]
      "Release fish" # [!code focus]
    end # [!code focus]
  } # [!code focus]
end
```

</Option>

<Option name="`cancel_button_label`" headingSize=4>

The `cancel_button_label` option is used to change the action's cancel button label.

```ruby
# app/avo/actions/release_fish.rb
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.cancel_button_label = "Cancel release" # [!code focus]

  # Or as a block # [!code focus]
  self.cancel_button_label = -> { # [!code focus]
    if resource.record.present? # [!code focus]
      "Cancel release on #{resource.record.name}" # [!code focus]
    else # [!code focus]
      "Cancel release" # [!code focus]
    end # [!code focus]
  } # [!code focus]
end
```

</Option>


### Behavioral customization

Behavioral customization is the process of modifying the action's behavior. This includes changing the action's confirmation behavior and authorization.

<Option name="`no_confirmation`" headingSize=4>

By default, actions display a confirmation modal before execution. You can bypass this modal by setting `self.no_confirmation = true`, which will execute the action immediately upon triggering.

```ruby
# app/avo/actions/release_fish.rb
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.no_confirmation = true # [!code focus]
end
```

This is particularly useful for actions that:
- Are safe to execute without confirmation
- Need to provide immediate feedback
- Are part of a multi-step workflow where confirmation is handled elsewhere

</Option>

<Option name="`standalone`" headingSize=4>

Standalone actions allow you to execute operations that aren't tied to specific model records. These are useful for global operations like:

- Generating system-wide reports
- Running maintenance tasks
- Triggering background jobs

You can create a standalone action in two ways:

1. Using the generator with the `--standalone` flag:
```bash
bin/rails generate avo:action global_action --standalone
```

2. Adding `self.standalone = true` to an existing action:
```ruby
# app/avo/actions/global_report.rb
class Avo::Actions::GlobalReport < Avo::BaseAction
  self.name = "Generate Global Report"
  self.standalone = true # [!code focus]

  def handle(**args)
    # Your global operation logic here
    succeed "Report generated successfully!"
  end
end
```

Standalone actions will be active in the Actions dropdown even when no records are selected. They can be used alongside regular record-based actions in the same resource.

:::tip
Standalone actions work well with the [`fields`](#fields) feature to collect additional input needed for the operation.
:::

</Option>

<Option name="`visible`" headingSize=4>

You may want to hide specific actions on some views, like a standalone action on the `Show` and `Edit` views, and show it only on the `Index` view. You can do that using the `self.visible` attribute.

```ruby{5,8}
# app/avo/actions/global_report.rb
class Avo::Actions::GlobalReport < Avo::BaseAction
  self.name = "Generate Global Report"
  self.standalone = true
  self.visible = true # [!code focus]

  # Or as a block # [!code focus]
  self.visible = -> { view.index? } # [!code focus]
end
```

The `visible` attribute accepts a boolean or a block.

The block will be executed within the [`Avo::ExecutionContext`](execution-context) environment, giving you access to important contextual attributes like:
- `view` - The current view type (index, show, edit)
- `resource` - The current resource instance
- `parent_resource` - The parent resource (if applicable).
  - You can access the `parent_record` by `parent_resource.record`
- Plus all other [`Avo::ExecutionContext`](execution-context) default attributes
</Option>

<Option name="`authorize`" headingSize=4>

The `authorize` attribute is used to restrict access to actions based on custom logic.

If an action is unauthorized, it will be hidden. If a bad actor attempts to proceed with the action, the controller will re-evaluate the authorization and block unauthorized requests.

```ruby
class Avo::Actions::GlobalReport < Avo::BaseAction
  self.authorize = false # [!code focus]

  # Or as a block # [!code focus]
  self.authorize = -> { # [!code focus]
    current_user.is_admin? # [!code focus]
  } # [!code focus]
end
```

The `authorize` attribute accepts a boolean or a proc.

The block will be executed within the [`Avo::ExecutionContext`](execution-context) environment, giving you access to important contextual attributes like:
- `action` - The current action instance
- `resource` - The current resource instance
- `view` - The current view type (index, show, edit)
- All other [`Avo::ExecutionContext`](execution-context) attributes

</Option>

<Option name="`close_modal_on_backdrop_click`" headingSize=4>

<VersionReq version="3.14.0" class="mt-4" />

By default, action modals use a dynamic backdrop.

Add `self.close_modal_on_backdrop_click = false` in case you want to prevent the user from closing the modal when clicking on the backdrop.

```ruby{3}
# app/avo/actions/toggle_inactive.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.close_modal_on_backdrop_click = false # [!code focus]
end
```

</Option>


<Option name="`turbo`" headingSize=4>

The `turbo` attribute is used to control the Turbo behavior of actions.

There are times when you don't want to perform the actions with Turbo. In such cases, turbo should be set to false.

```ruby
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.turbo = false # [!code focus]
end
```

The `turbo` attribute accepts a boolean.
</Option>

## Helpers

### `link_arguments`

The `link_arguments` method is used to generate the arguments for an action link.

You may want to dynamically generate an action link. For that you need the action class and a resource instance (with or without record hydrated). Call the action's class method `link_arguments` with the resource instance as argument and it will return the `[path, data]` that are necessary to create a proper link to a resource.

Let's see an example use case:

```ruby{4-,16} [Current Version]
# app/avo/resources/city.rb
class Avo::Resources::City < Avo::BaseResource
  field :name, as: :text, name: "Name (click to edit)", only_on: :index do
    path, data = Avo::Actions::City::Update.link_arguments(
      resource: resource,
      arguments: {
        cities: Array[resource.record.id],
        render_name: true
      }
    )

    link_to resource.record.name, path, data: data
  end
end
```


<Image src="/assets/img/actions/action_link.gif" width="684" height="391" alt="actions link demo" />


## Guides
// TODO: Organize guides into sub-sections and link to them here

### StimulusJS

Please follow our extended [StimulusJS guides](./stimulus-integration.html#use-stimulus-js-in-a-tool) for more information.

### Passing Params to the Action Show Page
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

**Implementation**

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
