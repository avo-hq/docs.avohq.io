---
license: community
outline: [2, 3]
guide: ./has_many.html
prev:
  text: "Has Many"
  link: "./has_many.html"
next: false
---

# Has Many API

Per-option reference for `has_many` fields; see the [Has Many guide](./has_many.html) for tasks and examples.

Options are passed to `field` in the resource's `fields` method in `app/avo/resources/user.rb`:

```ruby
field :projects, as: :has_many, loading: :manual
```

Common options such as visibility are documented in [shared field options](../field-options.html). Rails association options, including `through:`, belong on the model; Avo detects through associations from reflection rather than a field-level `through:` option.

## Listing and resource selection

<Option name="`scope`">

Transforms the policy-scoped association relation used for table rows. It does not filter attach choices.

```ruby
field :comments, as: :has_many, scope: -> { query.where(approved: true) }
```

- **Type:** `Proc` / `Lambda` returning an Active Record relation.
- **Default:** `nil`.
- **Context:** `Avo::ExecutionContext`.
- **Locals:** `query` (policy-scoped association), `parent` (parent record), `resource` (associated resource), `parent_resource` (parent's resource).

</Option>

<Option name="`for_attribute`">

Maps the field ID to another model association, allowing multiple panels with different scopes for the same association.

```ruby
field :approved_comments, as: :has_many, for_attribute: :comments,
  scope: -> { query.where(approved: true) }
```

- **Type:** `Symbol` / `String` naming a model association.
- **Default:** `nil`, using the field ID.

</Option>

<Option name="`use_resource`">

Overrides the resource used to display or redirect to the association table.

```ruby
field :comments, as: :has_many, use_resource: Avo::Resources::PhotoComment
```

- **Type:** Avo resource class / its class name as a `String`.
- **Default:** `nil`, inferring the resource from the reflected model.

</Option>

<Option name="`link_to_child_resource`">

Controls whether STI row links resolve to the child model's resource. See [STI associations](../associations.html#link-to-child-resource-when-using-sti).

```ruby
field :users, as: :has_many, link_to_child_resource: true
```

- **Type:** `Boolean`.
- **Default:** `nil`, falling back to the associated resource's `link_to_child_resource` setting (normally `false`). An explicit `false` overrides a resource-level `true`.

</Option>

## Attach picker

<Option name="`attach_scope`">

Transforms the policy-scoped relation offered by the attach picker. The save resolves submitted IDs against the same relation; excluded records are refused as missing.

```ruby
field :members, as: :has_many,
  attach_scope: -> { query.where.not(team_id: parent.id) }
```

- **Type:** `Proc` / `Lambda` returning an Active Record relation.
- **Default:** `nil`.
- **Context:** `Avo::ExecutionContext`.
- **Locals:** `query` (policy-scoped target relation), `parent` (parent record).

:::warning
A fresh relation can widen beyond the policy-scoped `query`, including at save time. This option does not filter the association table; that is the role of `scope`.
:::

</Option>

<Option name="`searchable`">

Enables the search-as-you-type attach picker. Configuration, licensing, query/item locals, and precedence are described in [Searchable associations](./searchable.html) and its [API](./searchable-api.html).

```ruby
field :projects, as: :has_many, searchable: true
```

- **Type:** `Boolean` / `Hash` with `query:`, `item:`, `enabled:` overrides.
- **Default:** `nil` (searchable picker disabled).
- **Values:** `true`, `false`, or the hash form documented in the searchable API.

</Option>

<Option name="`attach_using`">

Selects the non-searchable attach input. The checkbox list supports multiple selections and client-side filtering of the loaded choices. It respects `attach_scope`, the global lookup limit, and the target resource's [`search[:item]`](../search-api.html#item) row presentation.

```ruby
field :users, as: :has_many, attach_using: :checkbox_list
```

| Value | Behavior |
| --- | --- |
| `nil` | Standard select input. |
| `:checkbox_list` | Checkbox list with multi-select. |

- **Type:** `Symbol` / `String`.
- **Default:** `nil`.
- **Validation:** The checkbox-list check calls `to_sym`; other symbol values use the select input rather than raising an enum validation error.

</Option>

<Option name="`attach_fields`">

Declares additional fields displayed in the attach modal and persisted on the through join record. Plain `has_many` associations have no join record to receive these values.

```ruby
field :patrons, as: :has_many, attach_fields: -> {
  field :review, as: :text
}
```

- **Type:** `Proc` / `Lambda` containing field declarations.
- **Default:** `nil`.
- **Context:** `Avo::FieldsExecutionContext`, not the hook execution context. Declared fields are hydrated with a new through-model record.
- **Locals:** No callback-specific locals are supplied.

:::warning
Polymorphic join models require their type field when building a join with extra attributes; see the [through-association example](./has_many.html#has-many-through).
:::

</Option>

## Attach and detach hooks {#attach-detach-hooks}

<VersionReq package="avo" version="4.3.11" />

All four hooks run in `Avo::ExecutionContext`, with `current_user`, `params`, and these additional locals:

| Local | Value |
| --- | --- |
| `parent` | Parent record whose page holds the association. |
| `record` | Record being attached or detached. |
| `resource` | Parent record's resource. |
| `field` | Association field. |

Hooks run only for Attach and Detach requests, not Create, nested forms, deletes, model changes, actions, or API writes. Return values are ignored. Selecting several records runs attach hooks once per record. Attaching an already attached record still runs attach hooks; a through association can create another join row unless a constraint or validation prevents it. Detaching a record not attached to this parent runs no hooks.

:::warning
Raise a regular error to stop a before hook, not `ActiveRecord::Rollback`, which Rails swallows. After hooks run after commit: errors cannot undo the change, produce an error response, and stop subsequent hooks. Rescue failed side effects inside the hook if they must not reach the user.
:::

<Option name="`before_attach`">

Runs before each attachment inside the transaction for the entire selection. Raising rolls back all attachments in the request and displays the error message.

```ruby
field :members, as: :has_many,
  before_attach: -> { raise "Archived member" if record.archived? }
```

- **Type:** `Proc` / `Lambda`.
- **Default:** `nil`.
- **Context / Locals:** Shared [hook contract](#attach-detach-hooks).

</Option>

<Option name="`after_attach`">

Runs once per attached record after the transaction commits. It is skipped when attachment fails.

```ruby
field :members, as: :has_many,
  after_attach: -> { Rails.logger.info "Attached #{record.id}" }
```

- **Type:** `Proc` / `Lambda`.
- **Default:** `nil`.
- **Context / Locals:** Shared [hook contract](#attach-detach-hooks).

</Option>

<Option name="`before_detach`">

Runs before detachment inside its transaction. Raising rolls back detachment but produces an error response rather than the attach flow's flash message.

```ruby
field :members, as: :has_many,
  before_detach: -> { raise "Locked member" if record.locked? }
```

- **Type:** `Proc` / `Lambda`.
- **Default:** `nil`.
- **Context / Locals:** Shared [hook contract](#attach-detach-hooks).

</Option>

<Option name="`after_detach`">

Runs after the detach transaction commits, and is skipped on failure. For direct `has_many` associations with `dependent: :destroy` or `:delete_all`, `record` has already been deleted. Through associations remove only the join row.

```ruby
field :members, as: :has_many,
  after_detach: -> { Rails.logger.info "Detached #{record.id}" }
```

- **Type:** `Proc` / `Lambda`.
- **Default:** `nil`.
- **Context / Locals:** Shared [hook contract](#attach-detach-hooks).

</Option>

## Panel presentation and loading

<Option name="`name`">

Overrides the panel title. Without an override, field translations or the generated name apply; `use_resource` can supply the resource name.

```ruby
field :comments, as: :has_many, name: "User feedback"
```

- **Type:** `String` / zero-arity `Proc` / `Lambda` returning a string.
- **Default:** `nil` (translated or generated association name).
- **Context:** `Avo::ExecutionContext`; no additional locals are supplied.

</Option>

<Option name="`description`">

Text beneath the association title, including on an unloaded manual placeholder.

```ruby
field :comments, as: :has_many,
  description: -> { loading_type == :manual ? "Comments" : "#{query.count} comments" }
```

- **Type:** `String` / zero-arity `Proc` / `Lambda`.
- **Default:** `nil` (unless a class-level description is defined).
- **Context:** `Avo::ExecutionContext`.
- **Locals:** `query` (parent's association relation), `loading_type` (`:manual` on the placeholder, otherwise `nil`). This relation is not the table's policy-scoped `scope` result.

:::warning
Calling `query.count` or otherwise querying inside the placeholder description runs SQL before Load is clicked.
:::

</Option>

<Option name="`loading`">

Controls when the association frame loads. Manual frames show Load and support inline Retry on a failed fetch. Their opened state is remembered by a per-record, per-frame cookie with a sliding expiry.

```ruby
field :orders, as: :has_many,
  loading: { mode: :manual, auto_load_for: 5.minutes }
```

| Value | Behavior |
| --- | --- |
| `:lazy` / `{ mode: :lazy }` | Loads when the frame becomes visible. |
| `:manual` / `{ mode: :manual }` | Loads on demand, remembering opened frames for the default window. |
| `{ auto_load_for: 5.minutes }` | Hash without `mode` implies manual mode. |

- **Type:** `Symbol` / `String` / `Hash`.
- **Default:** `nil`, inheriting [`config.associations[:frames][:loading]`](../customization.html#associations), normally `:lazy`.
- **Validation:** Mode strings are converted with `to_sym`; there is no strict enum validation.

<Option name="`mode`" headingSize="3">

The hash form's loading mode, with the same lazy/manual behavior as the shorthand.

```ruby
field :orders, as: :has_many, loading: { mode: :manual }
```

- **Type:** `Symbol` / `String`.
- **Default:** `:manual` when a loading hash omits `mode`.

</Option>

<Option name="`auto_load_for`" headingSize="3">

Sliding memory window for an opened manual frame, not a delay before loading. Each return within the window refreshes it.

```ruby
field :orders, as: :has_many, loading: { mode: :manual, auto_load_for: 0 }
```

- **Type:** `ActiveSupport::Duration` / integer seconds / `nil`.
- **Default:** Global `config.associations[:frames][:auto_load_for]`, falling back to `15.minutes`.
- **Values:** Positive durations remember the frame; `0`, `nil`, or negative values disable memory.
- **Validation:** Converted with `to_i`; positive seconds are retained.

</Option>

</Option>

<Option name="`reloadable`">

Displays a reload icon for refreshing only the association frame.

```ruby
field :reviews, as: :has_many, reloadable: -> { current_user.admin? }
```

- **Type:** `Boolean` / `Proc` / `Lambda`.
- **Default:** `nil` (icon hidden).
- **Context:** `Avo::ExecutionContext`; no additional locals are supplied.

</Option>

<Option name="`linkable`">

Displays an open-in-new-tab icon next to the title, linking to the association table's standalone page.

```ruby
field :memberships, as: :has_many, linkable: true
```

- **Type:** `Boolean` / `Proc` / `Lambda`.
- **Default:** `nil` (icon hidden).
- **Context:** `Avo::ExecutionContext`; no additional locals are supplied.

</Option>

## Table controls

<Option name="`per_page`">

Sets the association's page size ahead of `config.via_per_page`. A request's `per_page` parameter and a persisted session choice take precedence. The dropdown includes the field's page size.

```ruby
field :certifications, as: :has_many, per_page: 24
```

- **Type:** Positive `Integer`.
- **Default:** `nil`, using [`config.via_per_page`](../customization-api.html#via_per_page).

:::info
With [session persistence](../customization-api.html#persistence) enabled for pagination, the saved size is keyed by parent resource and associated resource, not field. Two fields targeting the same resource share it.
:::

</Option>

<Option name="`discreet_pagination`">

Hides pagination details when the association has only one page.

```ruby
field :projects, as: :has_many, discreet_pagination: true
```

- **Type:** `Boolean`.
- **Default:** `nil` (pagination details are not suppressed).

</Option>

<Option name="`hide_search_input`">

Hides table search, independently of attach picker search. Without this flag, table search still requires the target resource's search query configuration.

```ruby
field :projects, as: :has_many, hide_search_input: true
```

- **Type:** `Boolean`.
- **Default:** `nil` (search not explicitly hidden).

</Option>

<Option name="`hide_filter_button`">

Hides filter controls on the association table.

```ruby
field :projects, as: :has_many, hide_filter_button: true
```

- **Type:** `Boolean`.
- **Default:** `nil` (filter controls not explicitly hidden).

</Option>

<Option name="`refresh_on_destroy`">

Reloads the whole page after deleting an associated record, rather than only the table frame. The current URL and success message are retained.

```ruby
field :reviews, as: :has_many, refresh_on_destroy: true
```

- **Type:** `Boolean`.
- **Default:** `nil` (only the table reloads).

</Option>

## Nested forms

<Option name="`nested`">

Enables nested child forms in selected views. Rendering and saving nested forms requires `avo-nested` and Rails `accepts_nested_attributes_for`; see the [nested form guide](./has_many.html#nested-in-forms).

```ruby
field :authors, as: :has_many, nested: { on: :forms, limit: 2 }
```

- **Type:** `Boolean` / `Hash`.
- **Default:** `{}` (disabled).
- **Values:** `true` is shorthand for `{ on: [:new, :edit] }`; `false` disables nesting.

<Option name="`on`" headingSize="3">

Views that render nested forms instead of the association panel.

```ruby
field :authors, as: :has_many, nested: { on: :new }
```

| Value | Behavior |
| --- | --- |
| `:new` | New form only. |
| `:edit` | Edit form only. |
| `:forms` | New and Edit forms. |
| `[:new, :edit]` | Explicit list of views. |

- **Type:** `Symbol` / array of view names.
- **Default:** `nil` for a hash without `on` (no nested form).

</Option>

<Option name="`limit`" headingSize="3">

Hides Add when the initialized nested record count reaches the limit. This is a form control, not a model validation.

```ruby
field :authors, as: :has_many, nested: { on: :forms, limit: 2 }
```

- **Type:** Non-negative `Integer`.
- **Default:** `0` (unlimited) for `has_many`.

</Option>

</Option>
