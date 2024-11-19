---
version: '3.15.0'
license: community
---

# Radio

<Image src="/assets/img/fields/radio.png" width="425" height="87" alt="Radio field" />

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
