## Nested in Forms

<VersionReq version="3.19.0" />

You can use ["Show on edit screens"](#show-on-edit-screens) to make the `{{ $frontmatter.field_type }}` field available in the [edit](views.html#Edit) view. However, this will render it using the [show](views.html#Show) view component.

To enable nested creation for the `{{ $frontmatter.field_type }}` field, allowing it to be created and / or edited alongside its parent record within the same form, use the `nested` option which is a hash with configurable option.


Keep in mind that this will display the field’s resource as it appears in the edit view.

<Option name="nested">

Enables this field as a nested form in the specified views.

##### Default value

{}

#### Possible values

A hash with the following options:
- `on:` Views in which to enable nesting. Accepted values:
  - `:new` - Enables nesting in the [new](views.html#New) view.
  - `:edit` - Enables nesting in the [edit](views.html#Edit) view.
  - `:forms` - Enables nesting in the [new](views.html#New) and [edit](views.html#Edit) views.
- `limit:` *(Only for `has_many` and `has_and_belongs_to_many` fields)* Hides the "Add" button when the specified limit is reached.

:::tip
Setting `nested: true` is a shortcut for `nested: { on: :forms }`.
:::

#### Example

```ruby-vue{4,5,7,8,10,11,13-14,16-19}
# app/avo/resources/book.rb
class Avo::Resources::Book < Avo::BaseResource
  def fields
    # Shortcut for full nesting
    field :{{ this.$frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, as: :{{ $frontmatter.field_type }}, nested: true

    # Explicit nesting on new only
    field :{{ this.$frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, as: :{{ $frontmatter.field_type }}, nested: { on: :new }

    # Explicit nesting on edit only
    field :{{ this.$frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, as: :{{ $frontmatter.field_type }}, nested: { on: :edit }

    # Explicit nesting on both new and edit
    field :{{ this.$frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, as: :{{ $frontmatter.field_type }}, nested: { on: :forms }

    # Limit nested creation (for has_many or has_and_belongs_to_many only)
    field :authors,
      as: :{{ $frontmatter.field_type }},
      nested: { on: [:new, :edit], limit: 2 }
  end
end
```

</Option>
