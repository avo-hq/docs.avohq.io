---
license: community
outline: [2, 3]
guide: ./has_one.html
prev:
  text: "Has One"
  link: "./has_one.html"
next: false
---

# Has One API

Per-option reference for `has_one` fields; see the [Has One guide](./has_one.html) for workflows and examples.

Options are passed to the field declaration in `app/avo/resources/team.rb`:

```ruby
field :admin, as: :has_one, linkable: true
```

These options supplement [shared field options](../field-options.html). Rails defines the association and any `through:` relationship, not the field.

## Attachment

<Option name="`searchable`">

Replaces the standard attach select with a search-as-you-type picker when the searchable associations add-on is installed and enabled.

```ruby
field :admin, as: :has_one, searchable: true
```

- **Type:** `Boolean` or `Hash`
- **Default:** `false`
- **Values:** `true`, `false`, or a hash with `query:`, `item:`, and `enabled:` overrides. Other inputs are normalized to `false`.
- **Context:** See [Searchable associations](./searchable.html) and its [API](./searchable-api.html) for the complete nested contract, callback locals, resource-search fallback, and add-on requirements. Core alone reports this field as not searchable.

</Option>

<Option name="`attach_scope`">

Defines the records available in the attach picker and accepted when saving an attachment. The initial relation is policy-scoped; returning a fresh relation can widen it beyond that policy scope.

```ruby
field :admin, as: :has_one, attach_scope: -> { query.where.not(team_id: parent.id) }
```

- **Type:** `Proc` / `Lambda` returning an Active Record relation
- **Default:** `nil` (the target resource's policy scope)
- **Context:** [`Avo::ExecutionContext`](../execution-context.html)
- **Locals:** `query` (policy-scoped candidate relation), `parent` (the parent record)
- **Validation:** A submitted ID outside the resulting relation is not accepted as an attachment.

</Option>

<Option name="`attach_fields`">

Declares extra fields in the attach modal. Values persist on the join record of a `has_one :through`, including when replacing the current association.

<VersionReq package="avo" version="4.0.25" />

```ruby
field :admin, as: :has_one, attach_fields: -> {
  field :notes, as: :text
}
```

- **Type:** `Proc` / `Lambda` containing field declarations
- **Default:** `nil`
- **Context:** `Avo::FieldsExecutionContext`; no attachment `parent` or `record` locals are supplied to the declaration block. Declared fields are hydrated with a new join record.
- **Validation:** Join-record validation failures fail the attach transaction.

:::warning
On a plain `has_one`, there is no join record on which to persist these values.
:::

</Option>

## Attach and detach callbacks {#attach-detach-hooks}

<VersionReq package="avo" version="4.3.11" />

All four callbacks run in [`Avo::ExecutionContext`](../execution-context.html), with the standard context (including `current_user` and `params`) and these explicit locals:

| Local | Value |
| ----- | ----- |
| `parent` | The parent record holding the association. |
| `record` | The record being attached or detached. |
| `resource` | The parent resource. |
| `field` | The association field. |

Hooks apply only to Attach and Detach, not Create, nested forms, record deletion, application code, or API writes. An attach reaching an occupied association replaces its current record and runs that record's detach hooks before the new record's corresponding attach hooks. Replacement checks the parent's attach permission, not its detach permission. Attaching the same record again runs attach hooks without detach hooks. A detach naming an unrelated record runs no hooks; for a through association it is a no-op, while a plain `has_one` raises `ActiveRecord::RecordNotFound`.

<Option name="`before_attach`">

Runs before the record is attached, inside the attach transaction. Return values are ignored; raising a regular error rolls back the attach and shows its message to the user.

```ruby
field :admin, as: :has_one, before_attach: -> {
  raise "This user is archived" if record.try(:archived?)
}
```

- **Type:** `Proc` / `Lambda`
- **Default:** `nil`
- **Locals:** `parent`, `record`, `resource`, `field`, as described above.

</Option>

<Option name="`after_attach`">

Runs after the attach transaction commits, only on success. An exception does not undo the attachment and reaches the user as an error response.

```ruby
field :admin, as: :has_one, after_attach: -> {
  Rails.logger.info "Attached #{record.id} to #{parent.id}"
}
```

- **Type:** `Proc` / `Lambda`
- **Default:** `nil`
- **Locals:** `parent`, `record`, `resource`, `field`, as described above.

</Option>

<Option name="`before_detach`">

Runs inside the detach transaction, before removal. Raising a regular error rolls back removal. A direct Detach returns an error response; a detach caused by replacement fails the attach and displays the error message.

```ruby
field :admin, as: :has_one, before_detach: -> {
  raise "This user must remain attached" if record.try(:protected?)
}
```

- **Type:** `Proc` / `Lambda`
- **Default:** `nil`
- **Locals:** `parent`, `record`, `resource`, `field`, as described above.
- **Return value:** Ignored.

</Option>

<Option name="`after_detach`">

Runs after the detach transaction commits, only on success. For a plain `has_one` with `dependent: :destroy` or `:delete`, `record` is already deleted. A through association removes only its join record. Exceptions do not undo removal and prevent later hooks, including a replacement's `after_attach`, from running.

```ruby
field :admin, as: :has_one, after_detach: -> {
  Rails.logger.info "Detached #{record.id} from #{parent.id}"
}
```

- **Type:** `Proc` / `Lambda`
- **Default:** `nil`
- **Locals:** `parent`, `record`, `resource`, `field`, as described above.

</Option>

:::warning
`ActiveRecord::Rollback` is swallowed inside before-hook transactions, producing a generic failure rather than the error's message. In after-hooks it cannot roll back the already committed change. Rescue side-effect failures inside after-hooks when they must not reach the user.
:::

## Panel presentation

<Option name="`description`">

Text below the association title on a manual-loading placeholder. The loaded Has One header uses the target resource's description, not this field option.

```ruby
field :admin, as: :has_one, description: "The user responsible for this team."
```

- **Type:** `String` or zero-argument `Proc` / `Lambda`
- **Default:** `nil`
- **Context:** [`Avo::ExecutionContext`](../execution-context.html)
- **Locals:** `loading_type` is `:manual` for the placeholder and `nil` otherwise. No `query` local is supplied by this field.

:::warning
The callable runs when the header renders, even before the user clicks Load. Database work inside it can defeat manual loading.
:::

</Option>

<Option name="`use_resource`">

Overrides the resource used for the association instead of inferring it from Rails reflection.

```ruby
field :admin, as: :has_one, use_resource: Avo::Resources::User
```

- **Type:** Avo resource `Class` or fully qualified class-name `String`
- **Default:** `nil` (inferred resource)

</Option>

<Option name="`linkable`">

Adds an open-in-new-tab icon to the association panel title, linking to the associated record's Show page.

```ruby
field :admin, as: :has_one, linkable: true
```

- **Type:** `Boolean` or zero-argument `Proc` / `Lambda`
- **Default:** `nil` (no icon)
- **Context:** [`Avo::ExecutionContext`](../execution-context.html); no field-specific locals are supplied.

</Option>

<Option name="`reloadable`">

Stores the shared frame reload-control setting. The current Has One Show header does not render this control; the reload icon is implemented on collection association headers.

```ruby
field :admin, as: :has_one, reloadable: true
```

- **Type:** `Boolean` or zero-argument `Proc` / `Lambda`
- **Default:** `nil` (no icon)
- **Context:** [`Avo::ExecutionContext`](../execution-context.html); no field-specific locals are supplied.

:::info
Setting this option does not currently add a reload icon to a Has One panel.
:::

</Option>

## Frame loading

<Option name="`loading`">

Controls fetching of the associated record's panel. An empty association renders the attach/create state instead of a manual placeholder. Manual deferral applies to display views, not an Edit page's Show panel.

```ruby
field :admin, as: :has_one, loading: { mode: :manual, auto_load_for: 5.minutes }
```

| Value | Behavior |
| ----- | -------- |
| `:lazy` or `{ mode: :lazy }` | Fetches when the frame is revealed. |
| `:manual` or `{ mode: :manual }` | Shows a Load button until opened or remembered. |
| `{ auto_load_for: 5.minutes }` | Hashes without `mode` select manual mode. |

- **Type:** `Symbol`, `String`, or `Hash`; strings are converted to symbols, and hash keys are symbolized.
- **Default:** `nil` at field level, inheriting `config.associations[:frames][:loading]`, which defaults to `:lazy`.
- **Values:** Supported modes are `:lazy` and `:manual`.
- **Validation:** Modes are not explicitly validated; an unrecognized mode selects neither lazy nor manual behavior.

<Option name="`mode`" headingSize="3">

The loading mode in the hash form.

```ruby
field :admin, as: :has_one, loading: { mode: :manual }
```

- **Type:** `Symbol` or `String`
- **Default:** `:manual` when the hash omits `mode` or sets it to `nil`
- **Values:** `:lazy`, `:manual`

</Option>

<Option name="`auto_load_for`" headingSize="3">

Sliding cookie-based memory window for an opened manual frame, scoped to the record and frame. Return visits within the window refresh it. It is not a fetch delay.

```ruby
field :admin, as: :has_one, loading: { mode: :manual, auto_load_for: 0 }
```

- **Type:** `Integer` seconds, `ActiveSupport::Duration`, or `nil`; converted with `to_i`.
- **Default:** `config.associations[:frames][:auto_load_for]`, initially `900` seconds (15 minutes).
- **Values:** Positive durations enable memory; `0`, negative values, or explicit `nil` disable it. Memory is used only for manual frames.

</Option>

</Option>

## Nested forms

<Option name="`nested`">

Enables the associated resource's edit fields inside the parent form. Requires `avo-nested` and the model's `accepts_nested_attributes_for`; the add-on raises when the model has not configured nested attributes.

```ruby
field :admin, as: :has_one, nested: true
```

- **Type:** `Boolean` or `Hash`
- **Default:** `{}` (disabled)
- **Values:** `true` expands to `{ on: [:new, :edit] }`; `false` or `nil` disables nesting. A hash selects views with `on:`.
- **Validation:** No general option-schema validation is performed. `limit:` is not a Has One option.

<Option name="`on`" headingSize="3">

Views in which the nested form is used.

```ruby
field :admin, as: :has_one, nested: { on: :edit }
```

- **Type:** `Symbol` or `Array` of view names
- **Default:** `[:new, :edit]` for `nested: true`; no nesting when a hash omits `on`.
- **Values:** `:new`, `:edit`, `[:new, :edit]`, or `:forms` (normalized to both forms). Create and Update requests map to New and Edit respectively.

</Option>

</Option>

For model setup, deletion, and nested authorization, see [Edit the child in the parent form](./has_one.html#nested-in-forms). To show the non-editable association panel on Edit instead, use shared [`show_on`](../field-options-api.html#show_on).
