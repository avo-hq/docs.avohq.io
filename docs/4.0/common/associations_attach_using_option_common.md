<Option name="`attach_using`">

By default, non-searchable `{{ $frontmatter.field_type }}` attach modals use a select input.

Use `attach_using: :checkbox_list` to render the attach modal with a checkbox list instead. Users can select more than one record and attach them in one submit.

The attach modal uses the same option shape and row presentation as the [`CheckboxList` field](../fields/checkbox_list).

```ruby{3}
field :users,
  as: :{{ $frontmatter.field_type }},
  attach_using: :checkbox_list
```

The checkbox list respects `attach_scope` and the global association lookup limit. It includes inline client-side search over the records already loaded in the modal.

If the related resource defines `self.search[:item]`, Avo uses its `title`, `description`, `image_url` or `avatar_url`, `image_format`, and image alt values for each row.

```ruby{3-11}
class Avo::Resources::User < Avo::BaseResource
  self.search = {
    item: -> do
      {
        title: record.name,
        description: record.email,
        image_url: record.avatar_url,
        image_format: :circle
      }
    end
  }
end
```

</Option>
