---
license: community
description: "The Radio field is used to render radio buttons."
fieldTags: [choice]
outline: [2, 3]
---

# Radio

The `Radio` field renders a group of choices where only one value can be selected. Use it for a short list of choices that should all be visible on the form.

```ruby
# app/avo/resources/user.rb
field :role,
  as: :radio,
  name: "User role",
  options: {
    admin: "Administrator",
    manager: "Manager",
    writer: "Writer"
  }
```

Without configuration, the field has no choices. Configured choices render as standard radio buttons, and the index and show views display the label matching the stored value.

<Image src="/assets/img/4_0/fields/radio/form.webm" dark-src="/assets/img/4_0/fields/radio/form-dark.webm" width="760" height="162" alt="An Avo edit-form card with a radio field labelled User role, animating through Administrator, Manager and Writer options." prompt="GIF with select options" />

## Choose the available values {#options}

Set `options` to a hash whose keys are the values submitted by the form and whose values are the visible labels, as in the example above. It defaults to an empty hash (`{}`).

If choices depend on the current record, use a block returning the same hash shape. The block has access to [`Avo::ExecutionContext`](../execution-context), including `record`, `resource`, `view`, and `field`.

```ruby
# app/avo/resources/user.rb
field :role_id, as: :radio, options: -> do
  record.roles.each_with_object({}) do |role, choices|
    choices[role.id] = role.name.humanize
  end
end
```

## Show choices as tabs {#display_as}

Set `display_as` to `:tabs` for a tab-style switcher instead of standard radio buttons. Both styles submit the selected option's key.

| Value | Behavior |
| --- | --- |
| `:radio` | Standard radio buttons (default). |
| `:tabs` | Tab-style switcher. |

```ruby
# app/avo/resources/user.rb
field :role, as: :radio, display_as: :tabs, options: { admin: "Administrator", writer: "Writer" }
```

## Display stored values instead of labels {#display_value}

If you want the index and show views to display the stored value rather than its label, set `display_value: true` (the default is `false`). This does not change the form labels.

```ruby
# app/avo/resources/user.rb
field :role, as: :radio, display_value: true, options: { admin: "Administrator", writer: "Writer" }
```

When no label matches, these views fall back to the stored value. A `nil` value displays a dash.

For shared settings such as visibility, defaults, and help text, see [Common field options](../field-options.html).
