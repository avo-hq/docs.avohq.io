---
license: community
---

# Radio

<Image src="/assets/img/4_0/fields/radio/form.webm" dark-src="/assets/img/4_0/fields/radio/form-dark.webm" width="760" height="162" alt="An Avo edit-form card with a radio field labelled User role, animating through Administrator, Manager and Writer options." prompt="GIF with select options" />

The `Radio` field is used to render radio buttons. It's useful when only one value can be selected in a given options group.

### Field declaration example
Below is an example of declaring a `radio` field for a role:

```ruby
field :role,
  as: :radio,
  name: "User role",
  options: {
    admin: "Administrator",
    manager: "Manager",
    writer: "Writer"
  }
```

<Option name="`options`">

The `options` attribute accepts either a `Hash` or a proc, allowing the incorporation of custom logic. Within this block, you gain access to all attributes of [`Avo::ExecutionContext`](../execution-context) along with the `record`, `resource`, `view` and `field`.

This attribute represents the options that should be displayed in the radio buttons.

#### Default value

Empty `Hash`.

```ruby
{}
```

#### Possible values

Any `Hash`. The keys represent the value that will be persisted and the values are the visible labels. Example:

```ruby
options: {
  admin: "Administrator",
  manager: "Manager",
  writer: "Writer"
}
```

Or a `Proc`:

```ruby
options: -> do
  record.roles.each_with_object({}) do |role, hash|
    hash[role.id] = role.name.humanize
  end
end
```

</Option>
