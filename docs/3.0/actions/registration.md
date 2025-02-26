---
license: community
feedbackId: 837
outline: deep
---

# Registration

Actions are registered within a resource by using the resource's `actions` method. This method defines which actions are available for that specific resource.

## `action`

The `action` method is used to register an action within the `actions` block. It accepts the action class as its first argument and optional configuration parameters like `arguments` and `icon`

```ruby{5}
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

Once attached, the action will appear in the **Actions** dropdown menu. By default, actions are available on all views.

:::info
You may use the [customizable controls](./customizable-controls) feature to show the actions outside the dropdown.
:::

<Option name="`arguments`" headingSize="3">

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

<Option name="`icon`" headingSize="3">

<VersionReq version="3.5.6" class="mt-4" />

The `icon` option lets you specify the icon to display next to the action in the dropdown menu. Avo supports [Heroicons](https://heroicons.com) by default.

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

## `divider`

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

<Option name="`label`" headingSize="3">

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
