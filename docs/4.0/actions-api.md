---
license: community
feedbackId: 837
outline: [2, 3]
guide: ./actions.html
prev:
  text: "Actions"
  link: "./actions.html"
next: false
---

# Actions API

Per-option reference for actions. For task-oriented documentation and worked examples, see the [Actions guide](./actions.html).

Options live in two places: registration options are passed when declaring the action in a resource's `actions` method, and class attributes are set on the action class itself.

```ruby
# app/avo/resources/user.rb — registration options
class Avo::Resources::User < Avo::BaseResource
  def actions
    action Avo::Actions::ToggleInactive, icon: "heroicons/outline/globe"
  end
end

# app/avo/actions/toggle_inactive.rb — class attributes
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.name = "Toggle Inactive"
  self.standalone = false
end
```

Options that accept a block are executed using [`Avo::ExecutionContext`](./execution-context), with access to `resource`, `record`, `view`, `arguments`, and `query` (plus the extras listed on each option).

## Registration

Declared inside the resource's `actions` method.

<Option name="`action`" headingSize="3">

Registers an action class on the resource. The action appears in the **Actions** dropdown in the order of declaration.

```ruby
def actions
  action Avo::Actions::ToggleInactive
end
```

- **Type:** action class, plus optional `arguments` and `icon` keyword arguments

</Option>

<Option name="`arguments`" headingSize="3">

Custom data passed to the action. Accessible as `arguments` throughout the action class, including the `handle` and `fields` methods.

```ruby
def actions
  action Avo::Actions::ToggleInactive,
    arguments: {
      special_message: true
    }

  # Or as a proc to make it dynamic
  action Avo::Actions::ToggleInactive,
    arguments: -> do
      {special_message: resource.view.index? && current_user.is_admin?}
    end
end
```

- **Type:** Hash or Proc returning a Hash
- **Default:** `{}`

:::info
Arguments are encrypted and Base64-encoded when embedded in action URLs, so sensitive values don't leak into the query string.
:::

</Option>

<Option name="`icon`" headingSize="3">

The icon displayed next to the action in the dropdown. Accepts [Heroicons](https://heroicons.com) and [Tabler](https://tabler.io/icons) icon paths.

```ruby
def actions
  action Avo::Actions::ToggleInactive, icon: "heroicons/outline/globe"
end
```

- **Type:** String
- **Default:** `"tabler/outline/player-play"`

</Option>

<Option name="`divider`" headingSize="3">

Renders a visual separator in the actions dropdown, grouping related actions. Pass `label` to title the group.

```ruby
def actions
  action Avo::Actions::ActivateUser
  action Avo::Actions::DeactivateUser

  divider label: "Communication"

  action Avo::Actions::SendWelcomeEmail
end
```

- **Options:** `label` (String, optional)

</Option>

## Modal and appearance

Class attributes controlling the action's display and confirmation modal. Each accepts a static value or a block.

<Option name="`name`" headingSize="3">

The action's display name, shown in the dropdown and as the modal title.

```ruby
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.name = "Release fish"

  # Or as a block
  self.name = -> {
    record.present? ? "Release #{record.name}?" : "Release fish"
  }
end
```

- **Type:** String or Proc
- **Default:** `nil` — the class name is humanized (`ToggleInactive` → "Toggle inactive")

</Option>

<Option name="`description`" headingSize="3">

A short description displayed below the action's name in the modal header, helping users understand what the action does before confirming.

```ruby
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.description = "Release the fish back into the ocean"

  # Or as a block
  self.description = -> {
    record.present? ? "Release #{record.name} back into the ocean" : "Release fish back into the ocean"
  }
end
```

- **Type:** String or Proc
- **Default:** `nil`

</Option>

<Option name="`message`" headingSize="3">

The confirmation message shown in the modal body.

```ruby
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.message = "Are you sure you want to release the fish?"

  # Or as a block
  self.message = -> {
    if record.present?
      "Are you sure you want to release #{record.name}?"
    else
      "Are you sure you want to release the fish?"
    end
  }
end
```

- **Type:** String or Proc
- **Default:** `"Are you sure you want to run this action?"`
- **i18n key:** `avo.are_you_sure_you_want_to_run_this_option` ("Are you sure you want to run this action?")

</Option>

<Option name="`confirm_button_label`" headingSize="3">

The label of the modal's confirmation button.

```ruby
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.confirm_button_label = "Release fish"

  # Or as a block
  self.confirm_button_label = -> {
    record.present? ? "Release #{record.name}" : "Release fish"
  }
end
```

- **Type:** String or Proc
- **Default:** `"Run"`
- **i18n key:** `avo.run` ("Run")

</Option>

<Option name="`cancel_button_label`" headingSize="3">

The label of the modal's cancel button.

```ruby
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.cancel_button_label = "Cancel release"

  # Or as a block
  self.cancel_button_label = -> {
    record.present? ? "Cancel release on #{record.name}" : "Cancel release"
  }
end
```

- **Type:** String or Proc
- **Default:** `"Cancel"`
- **i18n key:** `avo.cancel` ("Cancel")

</Option>

<Option name="`confirmation`" headingSize="3">

Whether the confirmation modal is displayed before execution. When `false`, the action executes immediately upon triggering — useful for actions that are safe to run without confirmation or that are part of a multi-step workflow where confirmation is handled elsewhere.

```ruby
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.confirmation = false
end
```

- **Type:** Boolean or Proc
- **Default:** `true`

</Option>

<Option name="`close_modal_on_backdrop_click`" headingSize="3">

Whether clicking the backdrop closes the modal. Set to `false` to force the user to use the buttons — for example when the modal holds a form you don't want dismissed accidentally.

```ruby
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.close_modal_on_backdrop_click = false
end
```

- **Type:** Boolean
- **Default:** `true`

</Option>

## Behavior

<Option name="`standalone`" headingSize="3">

Whether the action can run without selected records. Standalone actions stay enabled in the **Actions** dropdown when nothing is selected, and `handle` receives an empty `query`.

```ruby
class Avo::Actions::GlobalReport < Avo::BaseAction
  self.standalone = true
end
```

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`visible`" headingSize="3">

Controls the views on which the action is displayed.

```ruby
class Avo::Actions::GlobalReport < Avo::BaseAction
  self.visible = -> { view.index? }
end
```

- **Type:** Boolean or Proc
- **Default:** visible on every view except <New />

Block extras beyond the [`Avo::ExecutionContext`](./execution-context) defaults:

- `view` — the current view type (`index`, `show`, `edit`)
- `resource` — the current resource instance
- `parent_resource` — the parent resource, if any (access the parent record via `parent_resource.record`)
- `params`

</Option>

<Option name="`authorize`" headingSize="3">

Restricts access to the action based on custom logic. Unauthorized actions are hidden; if a bad actor attempts to run one anyway, the controller re-evaluates the authorization and blocks the request.

```ruby
class Avo::Actions::GlobalReport < Avo::BaseAction
  self.authorize = -> { current_user.is_admin? }
end
```

- **Type:** Boolean or Proc
- **Default:** `true`

Block extras beyond the [`Avo::ExecutionContext`](./execution-context) defaults: `action`, `resource`, `view`.

</Option>

<Option name="`turbo`" headingSize="3">

Controls the Turbo behavior of the action's form submission. Set to `false` when the action shouldn't be performed with Turbo — for example when it triggers a full file download response.

```ruby
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.turbo = false
end
```

- **Type:** Boolean
- **Default:** unset (Turbo enabled)

</Option>

## The `handle` method

The method every action implements. Receives keyword arguments:

| Argument | Description |
| --- | --- |
| `query` | The selected record(s). A single record is wrapped in an array for consistency. |
| `records` | Alias of `query`. |
| `fields` | The values submitted through the action's form fields. |
| `current_user` | The currently authenticated user. |
| `resource` | The Avo resource instance that triggered the action. |
| `request` | The current `ActionDispatch::Request` object. |

```ruby
def handle(query:, fields:, current_user:, resource:, request:, **args)
  # your business logic
end
```

## Feedback methods

Called inside `handle` to queue notifications shown after the action completes. Call several to stack multiple notifications. With no explicit feedback, Avo shows a translated "Action ran successfully" info notification.

Each method accepts an optional `timeout` keyword — milliseconds the notification stays visible, or `:forever` to keep it open until dismissed.

```ruby
succeed "Task completed successfully", timeout: 5000
warn "Important warning - requires attention", timeout: :forever
```

- **Default timeout:** `config.alert_dismiss_time` (5000 ms)

:::info
Notification bodies are truncated to 320 characters.
:::

<Option name="`succeed`" headingSize="3">

Displays a **green** success alert to indicate successful completion.

</Option>

<Option name="`inform`" headingSize="3">

Displays a **blue** info alert for general information.

</Option>

<Option name="`warn`" headingSize="3">

Displays an **orange** warning alert for cautionary messages.

</Option>

<Option name="`error`" headingSize="3">

Displays a **red** error alert to indicate failure or errors.

</Option>

<Option name="`silent`" headingSize="3">

Suppresses the default notification. Useful for redirect scenarios where a flash message would be noise.

```ruby
def handle(**args)
  redirect_to "/admin/some-tool"
  silent
end
```

</Option>

## Response methods

Called inside `handle` to control how the UI responds after execution. The last response method called wins; feedback notifications are flashed alongside whichever response runs.

<Option name="`reload`" headingSize="3">

Triggers a full-page reload. This is the default behavior when no other response is specified.

```ruby
def handle(query:, **args)
  query.each { |project| project.update! active: false }

  succeed "Done!"
  reload # optional — reload is the default
end
```

</Option>

<Option name="`redirect_to`" headingSize="3">

Redirects to another path of your app. Accepts a path or a block returning one, plus `allow_other_host`, `status`, and any other redirect arguments.

```ruby
def handle(query:, **args)
  succeed "Done!"
  redirect_to avo.resources_users_path
  # or with options
  # redirect_to path, allow_other_host: true, status: 303
end
```

</Option>

<Option name="`download`" headingSize="3">

Starts a file download with the given content and filename.

```ruby
def handle(query:, **args)
  report_data = query.map(&:generate_report_data).join("\n")

  succeed "Done!"
  download report_data, "projects.csv"
end
```

</Option>

<Option name="`keep_modal_open`" headingSize="3">

Keeps the modal open with the user's input intact — typically to show an error and let them retry.

```ruby
def handle(fields:, **args)
  User.create fields
  succeed "All good ✌️"
rescue => error
  error "Something happened: #{error.message}"
  keep_modal_open
end
```

</Option>

<Option name="`close_modal`" headingSize="3">

Closes the modal via Turbo Streams and flashes the queued [feedback notifications](#feedback-methods), keeping the page as it is — useful when the page holds a filled-in form you don't want reloaded.

```ruby
def handle(**args)
  succeed "Modal closed!!"
  close_modal
end
```

</Option>

<Option name="`do_nothing`" headingSize="3">

Alias for [`close_modal`](#close_modal).

</Option>

<Option name="`navigate_to_action`" headingSize="3">

Redirects to another action's modal, optionally passing `arguments` along — the building block for multi-step flows. See [Build a multi-step flow](./actions.html#build-a-multi-step-flow) for a worked example.

```ruby
def handle(query:, fields:, **args)
  navigate_to_action Avo::Actions::City::Update,
    arguments: {
      cities: query.map(&:id)
    }
end
```

</Option>

<Option name="`append_to_response`" headingSize="3">

Appends additional turbo stream responses to the default `turbo_stream` response. Accepts a Proc executed in the context of the action's controller response; it should return a single `turbo_stream` response or an array of them.

```ruby
def handle(**args)
  succeed "Done!"
  close_modal

  append_to_response -> {
    [
      turbo_stream.set_title("Cool title"),
      turbo_stream.set_title("Cool title 2")
    ]
  }
end
```

</Option>

<Option name="`reload_records`" headingSize="3">

Refreshes only the affected table rows or grid cards via Turbo Streams instead of reloading the whole page. Accepts an array of records or a single record; `reload_record` is an alias.

<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.loom.com/embed/6b9ae6a3968c447f98ac4f9a161fe781?sid=17f08010-6a56-4e8c-8b80-692424327b55" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

```ruby
def handle(query:, fields:, **args)
  query.each do |record|
    record.update! active: !record.active
  end

  reload_records(query)
end
```

:::warning
This response **only** works on <Index /> pages, **not** on associations.
:::

</Option>

## Class methods

<Option name="`link_arguments`" headingSize="3">

Returns the `[path, data]` pair needed to build a link that opens the action's modal. Called on the action class with a resource instance (with or without a hydrated record) and optional `arguments`.

```ruby
path, data = Avo::Actions::City::Update.link_arguments(
  resource: Avo::Resources::City.new(record: city),
  arguments: {
    cities: [city.id]
  }
)

link_to "Update city", path, data: data
```

- **Returns:** `[path, data]` — pass both to `link_to`
- `arguments` are encrypted and Base64-encoded into the URL

See [Trigger an action from a link](./actions.html#trigger-an-action-from-a-link) for worked examples.

</Option>
