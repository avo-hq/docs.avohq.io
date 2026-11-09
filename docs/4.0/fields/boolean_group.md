---
license: community
description: "The BooleanGroup is used to update a Hash with string keys and boolean values in the database."
fieldTags: [boolean, structured]
outline: [2, 3]
---

# Boolean Group

The `boolean_group` field edits a hash of boolean values as a group of checkboxes. Use it for settings such as user roles, where each key has its own enabled or disabled state.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :roles,
      as: :boolean_group,
      name: "User roles",
      options: {
        admin: "Administrator",
        manager: "Manager",
        writer: "Writer"
      }
  end
end
```

Without `options`, the field uses an empty hash and renders no checkboxes. With options configured, checked states come from the record's stored values. On index and show pages, a View link opens a popover listing the options and their states.

<Image src="/assets/img/4_0/fields/boolean_group/index.webp" dark-src="/assets/img/4_0/fields/boolean_group/index-dark.webp" width="1776" height="570" alt="An Avo index table with ID, Name and User roles columns. A View popover lists Administrator, Manager and Writer with checked or unchecked boxes." prompt="use index page" />

## Choose the available checkboxes {#options}

Set `options` to a hash whose keys match the stored keys and whose values are the visible labels. String and symbol keys both work for matching stored values.

For example, the roles field above can edit this JSON value in the database:

```json
{
  "admin": true,
  "manager": true,
  "writer": true
}
```

### Compute checkboxes from the record

If the choices depend on the record, pass a lambda to `options`. It must return the same key-to-label hash. The lambda runs in an [execution context](../execution-context.html) with access to `record`, `resource`, `view`, and `field`.

For a project with a `features` association, use each feature's ID as its stored key:

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  def fields
    field :enabled_features,
      as: :boolean_group,
      options: -> do
        record.features.each_with_object({}) do |feature, hash|
          hash[feature.id.to_s] = feature.name.humanize
        end
      end
  end
end
```

Here, `enabled_features` is the hash attribute being edited, separate from the `features` association that supplies the choices.

## Keep unrelated stored keys when saving {#updates}

Avo writes a boolean for every key in `options`: checked choices become `true`, and unchecked choices become `false`. Keys outside `options` remain unchanged, even if they contain non-boolean values.

For example, with only `feature_enabled` and `another_feature_enabled` in `options`, unchecking the second checkbox changes this stored value:

```json
{
  "feature_enabled": true,
  "another_feature_enabled": true,
  "something_else": "some_value"
}
```

to:

```json
{
  "feature_enabled": true,
  "another_feature_enabled": false,
  "something_else": "some_value"
}
```

## Customize shared field behavior

For labels, visibility, read-only behavior, and other settings shared with all fields, see [Field options](../field-options.html).
