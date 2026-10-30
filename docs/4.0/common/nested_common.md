## Nested in Forms

You can use ["Show on edit screens"](#show-on-edit-screens) to make the `{{ $frontmatter.field_type }}` field available in the [edit](./../views.html#edit) view. However, this will render it using the [show](./../views.html#show) view component.

To enable nested creation for the `{{ $frontmatter.field_type }}` field, allowing it to be created and / or edited alongside its parent record within the same form, use the `nested` option which is a hash with configurable option.

:::info The `avo-nested` gem
Nested association forms are provided by the **`avo-nested`** gem. Add it to your `Gemfile` using the same private gem source as your other Avo paid gems:

```ruby
gem "avo-nested", source: "https://packager.dev/avo-hq/"
```

Run `bundle install`. If you have not set up packager.dev access yet, see [Gem server authentication](./../gem-server-authentication.html).
:::

Keep in mind that this will display the field’s resource as it appears in the edit view.

<Option name="`nested`">

Enables this field as a nested form in the specified views.

#### Default value

`{}`

#### Possible values

A hash with the following options:
- `on:` Views in which to enable nesting. Accepted values:
  - `:new` - Enables nesting in the [new](./../views.html#new) view.
  - `:edit` - Enables nesting in the [edit](./../views.html#edit) view.
  - `:forms` - Enables nesting in the [new](./../views.html#new) and [edit](./../views.html#edit) views.
- `limit:` *(Only for `has_many` and `has_and_belongs_to_many` fields)* Hides the "Add" button when the specified limit is reached.

:::tip
Setting `nested: true` is a shortcut for `nested: { on: :forms }`.
:::

#### Deleting existing records

<VersionReq version="4.3.3" />

A record added in the form but not saved yet can be removed at any time. An existing record gets a "Delete" button only when the parent model opts in with `allow_destroy: true`:

```ruby-vue
# app/models/book.rb
accepts_nested_attributes_for :{{ $frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}, allow_destroy: true
```

Clicking it asks for confirmation, then marks the record for deletion. It stays in the form, dimmed, with an "Undo" link, and nothing happens until the parent form is saved. {{ $frontmatter.field_type === 'has_and_belongs_to_many' ? 'Saving removes the join row only; the record itself is kept.' : 'Saving destroys the record.' }} See [Authorization](#authorization) for the policy check that applies.

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

### Authorization

With [authorization](./../authorization.html) enabled, a nested form writes a child only when the child's own pages would let the user write it.

- **Existing records** are saved only when they are inside the child resource's [policy scope](./../authorization-api.html#Scope) and the child policy allows [`update?`](./../authorization-api.html#update). `update?` is asked twice: once with the record as loaded, and again with the submitted values. A row the user may not update is skipped, and the rest of the form still saves.
- **Records marked for deletion** are destroyed only when they are inside the policy scope and the child policy allows [`destroy?`](./../authorization-api.html#destroy). If `destroy?` refuses, the save is refused.
- **New records** need the child policy's [`create?`](./../authorization-api.html#create) and the parent policy's [`create_{{ $frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}?`](./../authorization-api.html#create_association). If either refuses, the save is refused.
- When `create_{{ $frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}?` refuses, the form hides its "Add" button, the same way the association panel hides "Create new".

:::info
With [`explicit_authorization`](./../authorization-api.html#explicit_authorization) on, a parent policy that doesn't define `create_{{ $frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}?` refuses new rows. Define it to let users add records from the form:

```ruby-vue
# app/policies/book_policy.rb
class BookPolicy < ApplicationPolicy
  def create_{{ $frontmatter.field_type === 'has_one' ? 'author' : 'authors' }}?
    user.admin?
  end
end
```
:::
