---
license: community
feedbackId: 837
outline: deep
---

# Execution flow

When a user triggers an action in Avo, the following flow occurs:

1. Record selection phase:
   - This phase can be bypassed by setting `self.standalone = true`
   - For bulk actions on the index page, Avo collects all the records selected by the user
   - For actions on the show page [or row controls](./../customizable-controls.md#Row%20controls), Avo uses that record as the target of the action

2. The action is initiated by the user through the index page (bulk actions), show page (single record actions), [or resource controls (custom action buttons)](./../customizable-controls.md)

3. Form display phase (optional):
    - This phase can be bypassed by setting `self.no_confirmation = true`
    - By default, a modal is displayed where the user can confirm or cancel the action
    - If the action has defined fields, they will be shown in the modal for the user to fill out
    - The user can then choose to run the action or cancel it
    - If the user cancels, the execution stops here

4. Action execution:
    - The `handle` method processes selected records, form values, current user, and resource details
    - Your custom business logic is executed within the `handle` method
    - User feedback is configured ([`succeed`](#succeed), [`warn`](#warn), [`inform`](#inform), [`error`](#error), or [`silent`](#silent))
    - Response type is configured ([`redirect_to`](#redirect_to), [`reload`](#reload), [`keep_modal_open`](#keep_modal_open), and [more](#response-types))


## The `handle` method

The `handle` method is where you define what happens when your action is executed. This is the core of your action's business logic and receives the following arguments:

- `query` Contains the selected record(s). Single records are automatically wrapped in an array for consistency
- `fields` Contains the values submitted through the action's form fields
- `current_user` The currently authenticated user
- `resource` The Avo resource instance that triggered the action

```ruby{10-23}
# app/avo/actions/toggle_inactive.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.name = "Toggle Inactive"

  def fields
    field :notify_user, as: :boolean
    field :message, as: :textarea
  end

  def handle(query:, fields:, current_user:, resource:, **args)
    query.each do |record|
      # Toggle the inactive status
      record.update!(inactive: !record.inactive)

      # Send notification if requested
      if fields[:notify_user]
        # Assuming there's a notify method
        record.notify(fields[:message])
      end
    end

    succeed "Successfully toggled status for #{query.count}"
  end
end
```

## Feedback notifications

After an action runs, you can respond to the user with different types of notifications or no feedback at all. The default feedback is an `Action ran successfully` message of type `inform`.

All feedback notification methods (`succeed`, `warn`, `inform`, `error`) support an optional `timeout` parameter to control how long the notification remains visible:

```ruby
# Display notification for 5 seconds
succeed 'Task completed successfully', timeout: 5000

# Keep notification open indefinitely, until the user dismisses it
warn 'Important warning - requires attention', timeout: :forever

# Use default timeout (falls back to global configuration)
inform 'Action completed'
```

:::info
Set the `timeout` to `:forever` to keep the notification open indefinitely until the user dismisses it.

The default timeout is set to `config.alert_dismiss_time` in the Avo configuration.
:::

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


:::info
You can show multiple notifications at once by calling multiple feedback methods (`succeed`, `warn`, `inform`, `error`) in your action's `handle` method. Each notification will be displayed in sequence.
:::

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

:::warning
**Ignore this warning if you are using Avo 3.2.2 or later.**

You need to set `self.may_download_file` to true for the download response to work like below.
:::

:::code-group

```ruby{3-4,17} [app/avo/actions/download_file.rb]
class Avo::Actions::DownloadFile < Avo::BaseAction
  self.name = "Download file"
  # Only required for versions before 3.2.2
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

This option leverages Turbo Stream to refresh specific table rows (and grid view cards since <Version version="3.24.0"/>) in response to an action.

For individual records, you can use the `reload_record` alias method.

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
