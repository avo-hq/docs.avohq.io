---
version: '1.0'
license: community
---

# Boolean Group

<Image src="/assets/img/fields/boolean-group.jpg" width="645" height="275" alt="Boolean group field" />

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



:::option `options`
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

:::


## Updates

Before version <Version version="3.7.0" /> Avo would override the whole attribute with only the payload sent from the client.

```json
// Before update.
{
  "feature_enabled": true,
  "another_feature_enabled": false,
  "something_else": "some_value" // this will disappear
}

// After update.
{
  "feature_enabled": true,
  "another_feature_enabled": false,
}
```

<VersionReq version="3.7.0" /> will only update the keys that you send from the client.

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
