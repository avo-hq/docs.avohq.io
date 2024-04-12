---
version: '1.0'
license: community
---

# Boolean Group

<img :src="('/assets/img/fields/boolean-group.jpg')" alt="Boolean group field" class="border mb-4" />

The `BooleanGroup` is used to update a `Hash` with `string` keys and `boolean` values in the database.

It's useful when you have something like a roles hash in your database.

```ruby
field :roles, as: :boolean_group, name: 'User roles', options: { admin: 'Administrator', manager: 'Manager', writer: 'Writer' }
```

## Options

:::option `options`
`options` should be a `Hash` with the keys to one of the four available types (`info`, `success`, `warning`, `danger`) and the values matching your record's database values.

#### Default value

```ruby
{
  info: :info,
  success: :success,
  danger: :danger,
  warning: :warning
}
```

#### Computed options

You may want to compute the values on the fly for your `BooleanGroup` field. You can use a lambda for that where you have access to the `record`, `resource`, `view`, and `field` properties where you can pull data off.

```ruby{5-7}
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

## Example DB payload

```ruby
# Example boolean group object stored in the database
{
  "admin": true,
  "manager": true,
  "creator": true,
}
```


:::warning
The final value in the database column will be overwritten, The options will not be appended.


```json
// this
{
  "feature_enabled": true,
  "another_feature_enabled": false,
  "something_else": "some_value" // this will disappear
}

// becomes
{
  "feature_enabled": true,
  "another_feature_enabled": false,
}
```
:::
