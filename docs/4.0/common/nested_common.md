## Nested in Forms
<div class="space-x-2">
  <VersionReq version="3.19.0"/>
  <BetaStatus label="Public beta"/>
  <LicenseReq license="advanced"/>
</div>


You can use ["Show on edit screens"](#show-on-edit-screens) to make the `{{ $frontmatter.field_type }}` field available in the [edit](./../views.html#Edit) view. However, this will render it using the [show](./../views.html#Show) view component.

To enable nested creation for the `{{ $frontmatter.field_type }}` field, allowing it to be created and / or edited alongside its parent record within the same form, use the `nested` option which is a hash with configurable option.

:::info The `avo-nested` gem
Nested association forms are provided by the **`avo-nested`** gem. Add it to your `Gemfile` using the same private gem source as your other Avo paid gems:

```ruby
gem "avo-nested", source: "https://packager.dev/avo-hq/"
```

Run `bundle install`. If you have not set up packager.dev access yet, see [Gem server authentication](./../gem-server-authentication.html).
:::

Keep in mind that this will display the field’s resource as it appears in the edit view.

<Option name="nested">

Enables this field as a nested form in the specified views.

##### Default value

`{}`

#### Possible values

A hash with the following options:
- `on:` Views in which to enable nesting. Accepted values:
  - `:new` - Enables nesting in the [new](./../views.html#New) view.
  - `:edit` - Enables nesting in the [edit](./../views.html#Edit) view.
  - `:forms` - Enables nesting in the [new](./../views.html#New) and [edit](./../views.html#Edit) views.
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
    field :{{ $frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, as: :{{ $frontmatter.field_type }}, nested: true

    # Explicit nesting on new only
    field :{{ $frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, as: :{{ $frontmatter.field_type }}, nested: { on: :new }

    # Explicit nesting on edit only
    field :{{ $frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, as: :{{ $frontmatter.field_type }}, nested: { on: :edit }

    # Explicit nesting on both new and edit
    field :{{ $frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, as: :{{ $frontmatter.field_type }}, nested: { on: :forms }

    # Limit nested creation (for has_many or has_and_belongs_to_many only)
    field :authors,
      as: :{{ $frontmatter.field_type }},
      nested: { on: [:new, :edit], limit: 2 }
  end
end
```

</Option>
