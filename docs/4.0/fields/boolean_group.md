---
license: community
---

# Boolean Group

The `BooleanGroup` is used to update a `Hash` with `string` keys and `boolean` values in the database.

It's useful when you have something like a roles hash in your database.

### DB payload example
An example of a boolean group object stored in the database:

```ruby
{
  "admin": true,
  "manager": true,
  "writer": true,
}
```

### Field declaration example
Below is an example of declaring a `boolean_group` field for roles that matches the DB value from the example above:

```ruby
field :roles,
  as: :boolean_group,
  name: "User roles",
  options: {
    admin: "Administrator",
    manager: "Manager",
    writer: "Writer"
  }
```

<Image src="/assets/img/4_0/fields/boolean-group.png" dark-src="/assets/img/4_0/fields/boolean-group-dark.png" width="350" height="112" alt="Boolean group field on a form: the User roles group with Administrator and Manager checked and Writer unchecked" />

<Option name="`options`">

The `options` attribute should be a `Hash` where the keys match the DB keys and the values are the visible labels.

#### Default value

Empty `Hash`.

```ruby
{}
```

#### Computed options

You may need to compute the options dynamically for your `BooleanGroup` field. You can use a lambda for this, which provides access to the `record`, `resource`, `view`, and `field` properties where you can pull data off.

```ruby{5-9}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  field :features,
    as: :boolean_group,
    options: -> do
      record.features.each_with_object({}) do |feature, hash|
        hash[feature.id] = feature.name.humanize
      end
    end
end
```

The output value must be a hash as described above.

</Option>


## Updates

Avo only updates the keys that you send from the client. Other keys in the stored hash are left unchanged.

```json
// Before update.
{
  "feature_enabled": true,
  "another_feature_enabled": false,
  "something_else": "some_value" // this will be kept
}

// After update.
{
  "feature_enabled": true,
  "another_feature_enabled": false,
  "something_else": "some_value"
}
```
