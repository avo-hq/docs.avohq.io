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

A `Hash` representing the options that should be displayed in the radio buttons.

The keys represent the value that will be persisted and the values are the visible labels.

#### Default value

Empty `Hash`.

```ruby
{}
```

#### Possible values

Any `Hash`. Example:

```ruby
{
  admin: "Administrator",
  manager: "Manager",
  writer: "Writer"
}
```

</Option>
