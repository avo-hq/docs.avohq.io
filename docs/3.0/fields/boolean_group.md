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
