---
license: community
feedbackId: 837
outline: deep
---


# Customization

Actions can be customized in several ways to enhance the user experience. You can modify the action's display name, confirmation message, button labels, and confirmation behavior between other things.

There are 2 types of customization, visual and behavioral.

## Visual customization

Visual customization is the process of modifying the action's appearance. This includes changing the action's name, message and button labels.

All visual customization options can be set as a string or a block.

The blocks are executed using [`Avo::ExecutionContext`](execution-context). Within these blocks, you gain access to:

- All attributes of [`Avo::ExecutionContext`](execution-context)
- `resource` - The current resource instance
- `record` - The current record
- `view` - The current view
- `arguments` - Any passed arguments
- `query` - The current query parameters

<Option name="`name`" headingSize=3>

The `name` option is used to change the action's display name.

```ruby{3,5-8}
# app/avo/actions/release_fish.rb
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.name = "Release fish"

  # Or as a block
  self.name = -> {
    record.present? ? "Release #{record.name}?" : "Release fish"
  }
end
```

</Option>

<Option name="`message`" headingSize=3>

The `message` option is used to change the action's confirmation message.

```ruby{3,5-12}
# app/avo/actions/release_fish.rb
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.message = "Are you sure you want to release the fish?"

  # Or as a block
  self.message = -> {
    if resource.record.present?
      "Are you sure you want to release the #{resource.record.name}?"
    else
      "Are you sure you want to release the fish?"
    end
  }
end
```

</Option>

<Option name="`confirm_button_label`" headingSize=3>

The `confirm_button_label` option is used to change the action's confirmation button label.

```ruby{3,5-12}
# app/avo/actions/release_fish.rb
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.confirm_button_label = "Release fish"

  # Or as a block
  self.confirm_button_label = -> {
    if resource.record.present?
      "Release #{resource.record.name}"
    else
      "Release fish"
    end
  }
end
```

</Option>

<Option name="`cancel_button_label`" headingSize=3>

The `cancel_button_label` option is used to change the action's cancel button label.

```ruby{3,5-12}
# app/avo/actions/release_fish.rb
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.cancel_button_label = "Cancel release"

  # Or as a block
  self.cancel_button_label = -> {
    if resource.record.present?
      "Cancel release on #{resource.record.name}"
    else
      "Cancel release"
    end
  }
end
```

</Option>


## Behavioral customization

Behavioral customization is the process of modifying the action's behavior. This includes changing the action's confirmation behavior and authorization.

<Option name="`no_confirmation`" headingSize=3>

By default, actions display a confirmation modal before execution. You can bypass this modal by setting `self.no_confirmation = true`, which will execute the action immediately upon triggering.

```ruby{3}
# app/avo/actions/release_fish.rb
class Avo::Actions::ReleaseFish < Avo::BaseAction
  self.no_confirmation = true
end
```

This is particularly useful for actions that:
- Are safe to execute without confirmation
- Need to provide immediate feedback
- Are part of a multi-step workflow where confirmation is handled elsewhere

</Option>

<Option name="`standalone`" headingSize=3>

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
```ruby{4}
# app/avo/actions/global_report.rb
class Avo::Actions::GlobalReport < Avo::BaseAction
  self.name = "Generate Global Report"
  self.standalone = true
end
```

Standalone actions will be active in the Actions dropdown even when no records are selected. They can be used alongside regular record-based actions in the same resource.

:::tip
Standalone actions work well with the [`fields`](#fields) feature to collect additional input needed for the operation.
:::

</Option>

<Option name="`visible`" headingSize=3>

You may want to hide specific actions on some views, like a standalone action on the `Show` and `Edit` views, and show it only on the `Index` view. You can do that using the `self.visible` attribute.

```ruby{5,8}
# app/avo/actions/global_report.rb
class Avo::Actions::GlobalReport < Avo::BaseAction
  self.name = "Generate Global Report"
  self.standalone = true
  self.visible = true

  # Or as a block
  self.visible = -> { view.index? }
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

<Option name="`authorize`" headingSize=3>

The `authorize` attribute is used to restrict access to actions based on custom logic.

If an action is unauthorized, it will be hidden. If a bad actor attempts to proceed with the action, the controller will re-evaluate the authorization and block unauthorized requests.

```ruby{2,4-7}
class Avo::Actions::GlobalReport < Avo::BaseAction
  self.authorize = false

  # Or as a block
  self.authorize = -> {
    current_user.is_admin?
  }
end
```

The `authorize` attribute accepts a boolean or a proc.

The block will be executed within the [`Avo::ExecutionContext`](execution-context) environment, giving you access to important contextual attributes like:
- `action` - The current action instance
- `resource` - The current resource instance
- `view` - The current view type (index, show, edit)
- All other [`Avo::ExecutionContext`](execution-context) attributes

</Option>

<Option name="`close_modal_on_backdrop_click`" headingSize=3>

<VersionReq version="3.14.0" class="mt-4" />

By default, action modals use a dynamic backdrop.

Add `self.close_modal_on_backdrop_click = false` in case you want to prevent the user from closing the modal when clicking on the backdrop.

```ruby{3}
# app/avo/actions/toggle_inactive.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.close_modal_on_backdrop_click = false
end
```

</Option>


<Option name="`turbo`" headingSize=3>

The `turbo` attribute is used to control the Turbo behavior of actions.

There are times when you don't want to perform the actions with Turbo. In such cases, turbo should be set to false.

```ruby{3}
# app/avo/actions/toggle_inactive.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.turbo = false
end
```

The `turbo` attribute accepts a boolean.
</Option>

