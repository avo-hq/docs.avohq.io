---
license: community
outline: [2, 3]
guide: ./has_and_belongs_to_many.html
prev:
  text: "Has And Belongs To Many"
  link: ./has_and_belongs_to_many.html
next: false
---

# Has And Belongs To Many API

Per-option reference for `has_and_belongs_to_many` fields; see the [guide](./has_and_belongs_to_many.html) for tasks and worked examples.

Options are keyword arguments to `field` inside a resource's `fields` method in `app/avo/resources/team.rb`:

```ruby
field :users, as: :has_and_belongs_to_many, attach_using: :checkbox_list
```

Shared field options, including visibility, are documented in [Field options](../field-options.html). All callbacks below run in [ExecutionContext](../execution-context.html), with `current_user`, `params`, and the standard context helpers. Listed locals are additional named methods available inside zero-argument blocks, not positional arguments.

## Attach picker

<Option name="`searchable`">

Enables the searchable attach picker. Its query, item rendering, enabled callback, licensing requirements, and precedence rules are defined in [Searchable associations](./searchable.html) and its [API](./searchable-api.html).

```ruby
field :users, as: :has_and_belongs_to_many, searchable: true
```

- **Type:** `Boolean` or `Hash` with `query`, `item`, and `enabled` overrides.
- **Default:** `nil` (non-searchable).
- **Behavior:** When enabled, takes precedence over `attach_using`.

</Option>

<Option name="`attach_using`">

Selects the input for a non-searchable attach modal. The checkbox list supports attaching several records at once and client-side search of loaded options. It respects `attach_scope` and the global association lookup limit, and uses the target resource's `self.search[:item]` presentation when available.

```ruby
field :users, as: :has_and_belongs_to_many, attach_using: :checkbox_list
```

| Value | Behavior |
| ----- | -------- |
| `nil` | Standard select input. |
| `:checkbox_list` | Multi-selection checkbox list. |

- **Type:** `Symbol` or `String`.
- **Default:** `nil`.
- **Validation:** The value is converted with `to_sym`; only `:checkbox_list` selects the checkbox list. Other symbolizable values fall back to the select input.

</Option>

<Option name="`attach_scope`">

Filters the attach candidates and the records accepted on attach submission, not the existing association table. Building on `query` preserves its policy scope; returning a fresh relation can widen it, including the records accepted on save.

```ruby
field :users, as: :has_and_belongs_to_many,
  attach_scope: -> { query.where.not(id: parent.users.select(:id)) }
```

- **Type:** `Proc` / `Lambda` returning an Active Record relation.
- **Default:** `nil`.
- **Locals:** `query` (policy-scoped candidate relation), `parent` (owning record).
- **Validation:** A submitted record outside the returned relation is rejected as not found.

</Option>

## Displayed records and resource selection

<Option name="`scope`">

Narrows the association table's relation after the child policy scope has been applied. Does not constrain the attach picker.

```ruby
field :users, as: :has_and_belongs_to_many, scope: -> { query.where(active: true) }
```

- **Type:** `Proc` / `Lambda` returning an Active Record relation.
- **Default:** `nil`.
- **Locals:** `query` (policy-scoped associated records), `parent` (owning record), `resource` (associated resource), `parent_resource` (owning resource).

</Option>

<Option name="`use_resource`">

Overrides the Avo resource used for the association table and related navigation.

```ruby
field :users, as: :has_and_belongs_to_many, use_resource: "Avo::Resources::User"
```

- **Type:** Avo resource class or its `String` class name.
- **Default:** `nil` (inferred from the reflected association model).

</Option>

<Option name="`for_attribute`">

Maps the field ID to a different Rails association name, allowing several scoped fields for the same association.

```ruby
field :active_users, as: :has_and_belongs_to_many,
  for_attribute: :users, scope: -> { query.where(active: true) }
```

- **Type:** `Symbol` or `String`.
- **Default:** `nil` (uses the field ID).

</Option>

<Option name="`link_to_child_resource`">

Chooses child-resource links for STI records when that resource exists. See [STI associations](../associations.html#link-to-child-resource-when-using-sti).

```ruby
field :users, as: :has_and_belongs_to_many, link_to_child_resource: true
```

- **Type:** `Boolean`.
- **Default:** `nil` (inherits the associated resource's `link_to_child_resource` setting).
- **Values:** `true` uses the child resource when available; `false` keeps the association resource.

</Option>

## Panel presentation

<Option name="`name`">

Overrides the association label. The panel uses its plural form, with plural translations taking precedence when available.

```ruby
field :users, as: :has_and_belongs_to_many, name: "Team members"
```

- **Type:** `String` or `Proc` / `Lambda` returning a string.
- **Default:** `nil` (resolved from field translations, the selected resource's name, or the humanized field ID).
- **Locals:** Standard ExecutionContext only; no additional record or resource local is supplied to the name callback.

</Option>

<Option name="`description`">

Text beneath the association title, including on a manual-loading placeholder.

```ruby
field :users, as: :has_and_belongs_to_many,
  description: -> { loading_type == :manual ? "Team members" : "#{query.count} members" }
```

- **Type:** `String` or `Proc` / `Lambda` returning a string.
- **Default:** `nil`.
- **Locals:** `query` (the parent's association relation), `loading_type` (`:manual` for the placeholder, otherwise `nil`). This `query` is not the policy-scoped table query.

:::warning
A description that counts or loads `query` executes that database work before the user clicks Load. Manual loading defers only the framed table, not the header description.
:::

</Option>

<Option name="`per_page`">

Sets the association's page size and includes it in the table's per-page dropdown. An explicit request parameter takes precedence, then a saved session value when pagination persistence is enabled, then this option, then `config.via_per_page`.

```ruby
field :users, as: :has_and_belongs_to_many, per_page: 24
```

- **Type:** Positive `Integer`.
- **Default:** `nil` (uses [`config.via_per_page`](../customization-api.html#via_per_page)).
- **Persistence:** Saved sizes are keyed by parent and associated resource, not field; fields with the same pair share the saved value.

</Option>

<Option name="`discreet_pagination`">

Hides pagination details when the table has only one page.

```ruby
field :users, as: :has_and_belongs_to_many, discreet_pagination: true
```

- **Type:** `Boolean`.
- **Default:** `nil` (disabled).

</Option>

<Option name="`hide_search_input`">

Hides the association table's search input, independently of the attach picker. When not hidden, the input still requires the associated resource's search query configuration.

```ruby
field :users, as: :has_and_belongs_to_many, hide_search_input: true
```

- **Type:** `Boolean`.
- **Default:** `nil` (not hidden).

</Option>

<Option name="`hide_filter_button`">

Hides the association table's filter button.

```ruby
field :users, as: :has_and_belongs_to_many, hide_filter_button: true
```

- **Type:** `Boolean`.
- **Default:** `nil` (not hidden).

</Option>

<Option name="`linkable`">

Adds an open-in-new-tab icon beside the title, linking to the association table on its own page.

```ruby
field :users, as: :has_and_belongs_to_many, linkable: true
```

- **Type:** `Boolean` or `Proc` / `Lambda`.
- **Default:** `nil` (disabled).
- **Locals:** Standard ExecutionContext only; no additional locals.

</Option>

## Loading and refreshing

<Option name="`loading`">

Controls how the table's Turbo Frame loads. A field value overrides the global [association frame defaults](../customization.html#associations).

```ruby
field :users, as: :has_and_belongs_to_many,
  loading: { mode: :manual, auto_load_for: 5.minutes }
```

| Value | Behavior |
| ----- | -------- |
| `:lazy` or `{ mode: :lazy }` | Loads when the frame is revealed. |
| `:manual` or `{ mode: :manual }` | Shows Load until opened; remembers the opened frame. |
| `{ auto_load_for: 5.minutes }` | Hash without `mode` defaults to manual. |

- **Type:** `Symbol`, `String`, or `Hash` with symbol or string keys.
- **Default:** `nil` (inherits `config.associations[:frames][:loading]`, initially `:lazy`).
- **Validation:** Mode values are converted to symbols, without enum validation. Supported modes are `:manual` and `:lazy`.

<Option name="`mode`" headingSize="3">

Selects manual or lazy loading in the Hash form.

```ruby
field :users, as: :has_and_belongs_to_many, loading: { mode: :manual }
```

- **Type:** `Symbol` or `String`, converted to a symbol.
- **Default:** `:manual` when the Hash omits `mode`.

</Option>

<Option name="`auto_load_for`" headingSize="3">

Sliding memory window for an opened manual frame, in seconds. A cookie scoped per record and frame refreshes on return visits within the window. This is not a delay; outside the window the placeholder returns. It has no effect on lazy frames.

```ruby
field :users, as: :has_and_belongs_to_many,
  loading: { mode: :manual, auto_load_for: 0 }
```

- **Type:** `Integer` seconds, `ActiveSupport::Duration`, or `nil`.
- **Default:** `config.associations[:frames][:auto_load_for]`, falling back to `15.minutes`.
- **Values:** A positive duration remembers the frame; `0`, `nil`, and negative values disable memory. Values are converted using `to_i`.

</Option>

</Option>

<Option name="`reloadable`">

Adds an icon beside the title to reload only the association frame.

```ruby
field :users, as: :has_and_belongs_to_many, reloadable: -> { current_user.admin? }
```

- **Type:** `Boolean` or `Proc` / `Lambda`.
- **Default:** `nil` (disabled).
- **Locals:** Standard ExecutionContext only; no additional locals.

</Option>

<Option name="`refresh_on_destroy`">

Refreshes the entire page after a record is deleted from the table, keeping the URL and success message. This is deletion, not detachment.

```ruby
field :users, as: :has_and_belongs_to_many, refresh_on_destroy: true
```

- **Type:** `Boolean`.
- **Default:** `nil` (only the association table refreshes).

</Option>

## Attach and detach callbacks

<VersionReq package="avo" version="4.3.11" />

All four hooks apply only to the association Attach and Detach controls. They do not run for Create, Delete, nested forms, actions, or model changes. Each receives `parent` (owning record), `record` (attached or detached record), `resource` (parent resource), and `field` (association field), plus the standard ExecutionContext. Return values are ignored.

<Option name="`before_attach`">

Runs once per selected record inside the transaction attaching all selected records. Raising a regular error rolls back the whole batch and displays its message. Attaching an already-attached record runs the hook again and can add another join row unless a database constraint refuses it.

```ruby
field :users, as: :has_and_belongs_to_many,
  before_attach: -> { raise "Inactive user" unless record.active? }
```

- **Type:** `Proc` / `Lambda`.
- **Default:** `nil`.
- **Locals:** `parent`, `record`, `resource`, `field`, as defined above.

</Option>

<Option name="`after_attach`">

Runs after the attach transaction commits, once per attached record. Skipped when attachment fails. An error does not undo the attach, produces an error response, and prevents later hooks in the batch from running.

```ruby
field :users, as: :has_and_belongs_to_many,
  after_attach: -> { Rails.logger.info "Attached #{record.id} to #{parent.id}" }
```

- **Type:** `Proc` / `Lambda`.
- **Default:** `nil`.
- **Locals:** `parent`, `record`, `resource`, `field`, as defined above.

</Option>

<Option name="`before_detach`">

Runs inside the detach transaction before removing the join row. Raising a regular error rolls back the detach but produces an error response rather than a friendly message. Detaching a record not attached to this parent changes nothing and runs no hooks.

```ruby
field :users, as: :has_and_belongs_to_many,
  before_detach: -> { raise "Cannot remove the last member" if parent.users.count == 1 }
```

- **Type:** `Proc` / `Lambda`.
- **Default:** `nil`.
- **Locals:** `parent`, `record`, `resource`, `field`, as defined above.

</Option>

<Option name="`after_detach`">

Runs after the detach commits; the associated record still exists because only the join row was removed. Skipped on failure. Errors produce an error response without undoing the detach.

```ruby
field :users, as: :has_and_belongs_to_many,
  after_detach: -> { Rails.logger.info "Detached #{record.id} from #{parent.id}" }
```

- **Type:** `Proc` / `Lambda`.
- **Default:** `nil`.
- **Locals:** `parent`, `record`, `resource`, `field`, as defined above.

</Option>

:::warning
`ActiveRecord::Rollback` is swallowed inside before-hook transactions, so the reason is not shown. After hooks have no transaction left to roll back. Errors in after hooks leave the change committed.
:::

## Nested forms

<Option name="`nested`">

Enables editing child records in the parent form through the `avo-nested` gem. Rails must define `accepts_nested_attributes_for` on the association. See the [guide](./has_and_belongs_to_many.html#nested-in-forms) for setup, deletion behavior, and authorization.

```ruby
field :users, as: :has_and_belongs_to_many, nested: { on: :forms, limit: 5 }
```

- **Type:** `Boolean` or `Hash`.
- **Default:** `{}` (disabled).
- **Values:** `true` is shorthand for `{ on: [:new, :edit] }`; `false` or `nil` disables nesting.
- **Validation:** Without the model's nested-attributes writer, the nested component raises outside production and is hidden in production.

<Option name="`on`" headingSize="3">

Views in which the nested component replaces the association table. Create and update requests use the New and Edit configurations respectively.

```ruby
field :users, as: :has_and_belongs_to_many, nested: { on: :new }
```

| Value | Behavior |
| ----- | -------- |
| `:new` | New form only. |
| `:edit` | Edit form only. |
| `:forms` | Both New and Edit. |
| `[:new, :edit]` | Explicit list of form views. |

- **Type:** `Symbol` or `Array` of symbols.
- **Default:** `nil` (disabled when omitted from a Hash).

</Option>

<Option name="`limit`" headingSize="3">

Hides Add once the nested form reaches the limit; this is a UI limit, not a model validation.

```ruby
field :users, as: :has_and_belongs_to_many, nested: { on: :forms, limit: 5 }
```

- **Type:** Non-negative `Integer`.
- **Default:** `0` (unlimited).

</Option>

</Option>
