---
license: community
outline: [2, 3]
guide: ./belongs_to.html
prev:
  text: "Belongs to"
  link: "./belongs_to.html"
next: false
---

# Belongs to API

Per-option reference for `belongs_to` fields; see the [Belongs to guide](./belongs_to.html) for tasks and examples.

Options are passed to `field` inside the resource's `fields` method in `app/avo/resources/post.rb`:

```ruby
field :user, as: :belongs_to, can_create: false
```

[Shared field options](../field-options.html), including `help`, `placeholder`, `readonly`, and `disabled`, also apply. The default placeholder uses `avo.choose_an_option` ("Choose an option"). See also [associations](../associations.html) and [searchable associations](./searchable.html).

## Record selection

<Option name="`searchable`">

Replaces the standard dropdown with the searchable associations picker when the add-on is installed and licensed.

```ruby
field :user, as: :belongs_to, searchable: true
```

| Value | Behavior |
| ----- | -------- |
| `false` | Standard dropdown |
| `true` | Search using the target resource's search configuration |
| `Hash` | Per-field `query`, `item`, and `enabled` overrides |

- **Type:** `Boolean` or `Hash`
- **Default:** `false`
- **Validation:** Values other than literal `true` or a `Hash` normalize to `false`.

The [searchable associations API](./searchable-api.html) defines the nested options, callback locals, fallbacks, and precedence. Without the add-on, the core field remains a standard dropdown.

</Option>

<Option name="`attach_scope`">

Filters eligible records for the dropdown, searchable picker, and submitted association. The callback returns an Active Record relation.

```ruby
field :user, as: :belongs_to,
  attach_scope: -> { query.where(active: true) }
```

- **Type:** `Proc` / `Lambda` returning an `ActiveRecord::Relation`
- **Default:** `nil`
- **Context:** [`Avo::ExecutionContext`](../execution-context.html)
- **Locals:** `query`, `parent`
- **Validation:** A submitted ID outside the returned scope raises `Avo::Fields::BelongsToField::TargetNotFound`, a subclass of `ActiveRecord::RecordNotFound`, and is rejected by the form.

`parent` is the record whose association is being assigned, including an unsaved instance on new forms. For creation through an association, that instance has the originating association pre-filled. `query` starts with the target resource's query scope for selection and find scope for saving.

:::warning
Building on `query` preserves its policy restrictions. Returning a fresh relation can widen both the available records and the records accepted on save.
:::

</Option>

<Option name="`can_create`">

Controls the creation link on new and edit forms. The link opens a form in a modal and is hidden when the field is disabled or the target resource denies `create?`.

```ruby
field :user, as: :belongs_to, can_create: false
```

- **Type:** `Boolean`
- **Default:** `true` (also when explicitly set to `nil`)
- **i18n key:** `avo.create_new_item` ("Create new %{item}")

`true` does not override the target resource's authorization policy. Polymorphic fields check each type's resource separately.

</Option>

<Option name="`allow_via_detaching`">

Keeps the field enabled when the form was opened through its parent association. Explicit shared `readonly` or `disabled` settings still disable it.

```ruby
field :user, as: :belongs_to, allow_via_detaching: true
```

- **Type:** `Boolean`
- **Default:** `false`
- **Validation:** Only literal `true` enables this option.

</Option>

## Polymorphic associations

<Option name="`polymorphic_as`">

Identifies the Rails polymorphic association and its type/ID columns. Used with `types`.

```ruby
field :commentable, as: :belongs_to,
  polymorphic_as: :commentable, types: [::Post, ::Project]
```

- **Type:** `Symbol` or `String`
- **Default:** `nil`
- **Values:** The name of a Rails `belongs_to` association declared with `polymorphic: true`.

:::warning
Both `polymorphic_as` and a nonempty `types` array are required for a working polymorphic picker. There is no eager configuration validation for a missing pair.
:::

</Option>

<Option name="`types`">

Lists the model classes available in the polymorphic type dropdown. Labels come from their Avo resources; submitted types are matched against this list.

```ruby
field :commentable, as: :belongs_to,
  polymorphic_as: :commentable, types: [::Post, ::Project]
```

- **Type:** `Array` of model classes
- **Default:** `nil`
- **Validation:** Only listed types are accepted. An unrecognized or blank submitted type clears the polymorphic type and ID.

Each type must have an Avo resource. This option is used together with `polymorphic_as`.

</Option>

<Option name="`polymorphic_help`">

Help text for the polymorphic type dropdown. The shared [`help`](../field-options-api.html#help) option applies to the record dropdown.

```ruby
field :commentable, as: :belongs_to,
  polymorphic_as: :commentable, types: [::Post, ::Project],
  polymorphic_help: "Choose a type of record"
```

- **Type:** `String`
- **Default:** `nil`

</Option>

## Resource resolution and links

<Option name="`use_resource`">

Overrides the target Avo resource inferred from the Rails association. An explicit resource takes precedence over STI child-resource resolution.

```ruby
field :user, as: :belongs_to, use_resource: Avo::Resources::Author
```

- **Type:** Avo resource class or its fully qualified `String` name
- **Default:** `nil` (infer from the association)

</Option>

<Option name="`link_to_child_resource`">

Uses the associated record's concrete model class to resolve the target resource in an STI association. See [STI associations](../associations.html#link-to-child-resource-when-using-sti).

```ruby
field :user, as: :belongs_to, link_to_child_resource: true
```

- **Type:** `Boolean`
- **Default:** `nil` (the field does not request child-resource resolution)
- **Precedence:** Enabled by either the field or the owning resource's `self.link_to_child_resource`; field-level `false` does not override resource-level `true`. `use_resource` takes precedence over both.

</Option>

<Option name="`link_to_record`">

Makes the index cell link to the current record instead of the associated record. The displayed label remains the association's title; show-page links are unaffected.

```ruby
field :user, as: :belongs_to, link_to_record: true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`target`">

Sets the show-page association link's `data-turbo-frame` attribute.

```ruby
field :user, as: :belongs_to, target: "_top"
```

- **Type:** `String`
- **Default:** `nil`
- **Values:** A Turbo Frame ID or `"_top"` for full-page navigation; this is not an HTML `target` attribute for opening a new tab.

</Option>
