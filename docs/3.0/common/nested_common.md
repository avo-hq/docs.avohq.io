## Nested in Forms

<VersionReq version="3.19.0" />

You can use ["Show on edit screens"](#show-on-edit-screens) to make the `{{ $frontmatter.field_type }}` field available in the [edit](views.html#Edit) view. However, this will render it using the [show](views.html#Show) view component.

To enable nested creation for the `{{ $frontmatter.field_type }}` field, allowing it to be created and / or edited alongside its parent record within the same form, use the `nested_on` option. Keep in mind that this will display the field’s resource as it appears in the edit view.

<Option name="nested_on">

Enables this field as nested form on the specified views.

##### Default value

`[]`

#### Possible values

An array containing one or more of the following:
- `:new` - Enables nesting in the [new](views.html#New) view.
- `:edit` - Enables nesting in the [edit](views.html#Edit) view.

#### Example

```ruby-vue{4,5,7,8,10,11}
# app/avo/resources/book.rb
class Avo::Resources::Book < Avo::BaseResource
  def fields
    # Nested on new
    field :{{ this.$frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, as: :{{ $frontmatter.field_type }}, nested_on: :new

    # Or nested on edit
    field :{{ this.$frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, as: :{{ $frontmatter.field_type }}, nested_on: :edit

    # Or nested on both
    field :{{ this.$frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, as: :{{ $frontmatter.field_type }}, nested_on: [:new, :edit]
  end
end
```

</Option>

<Option name="nested_limit" v-if="['has_many', 'has_and_belongs_to_many'].includes($frontmatter.field_type)">

Hides the "Add" button when the specified limit is reached.

##### Default value

`0` (unlimited)

#### Possible values

Any positive integer.

#### Example

```ruby-vue{7,8}
# app/avo/resources/book.rb
class Avo::Resources::Book < Avo::BaseResource
  def fields
    field :authors,
      as: :{{ $frontmatter.field_type }},
      nested_on: [:new, :edit],
      # Limit nested author creation at 2
      nested_limit: 2
  end
end

```

</Option>
