---
license: community
description: "The Radio field is used to render radio buttons."
fieldTags: [choice]
outline: [2, 3]
api_docs: ./radio-api.html
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

Set [`options`](./radio-api.html#options) to a hash whose keys are the values submitted by the form and whose values are the visible labels, as in the example above.

If choices depend on the current record, use a block returning the same hash shape. The block has access to [`Avo::ExecutionContext`](../execution-context), including `record`, `resource`, `view`, and `field`.

```ruby
# app/avo/resources/user.rb
field :role_id, as: :radio, options: -> do
  record.roles.each_with_object({}) do |role, choices|
    choices[role.id] = role.name.humanize
  end
end
```

<span id="display-as"></span>

## Show choices as tabs {#display_as}

Set [`display_as`](./radio-api.html#display_as) to `:tabs` for a tab-style switcher instead of standard radio buttons. Both styles submit the selected option's key.

```ruby
# app/avo/resources/user.rb
field :role, as: :radio, display_as: :tabs, options: { admin: "Administrator", writer: "Writer" }
```

<span id="display-value"></span>

## Display stored values instead of labels {#display_value}

If you want the index and show views to display the stored value rather than its label, enable [`display_value`](./radio-api.html#display_value). This does not change the form labels.

```ruby
# app/avo/resources/user.rb
field :role, as: :radio, display_value: true, options: { admin: "Administrator", writer: "Writer" }
```

When no label matches, these views fall back to the stored value. A `nil` value displays a dash.

## Options reference

See the [Radio API](./radio-api.html) for all field-specific options, defaults, and choice-matching behavior.

For shared settings such as visibility, defaults, and help text, see [Common field options](../field-options.html).
