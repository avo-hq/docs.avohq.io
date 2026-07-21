---
license: community
outline: [2, 3]
guide: ./field-options.html
---

# Field options API

Per-option reference for the options every Avo field accepts. For task-oriented documentation and worked examples, see the [Field options guide](./field-options.html).

All options are passed to the `field` method inside a resource's `def fields`:

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :name, as: :text, sortable: true, help: "The user's full name"
  end
end
```

Options that only certain field types respond to (like `options` on the [select field](./fields/select.html)) are documented on each field's page.

## Naming and description

<Option name="`name`" headingSize="3">

The label displayed for the field. When omitted, Avo humanizes the field's id (`is_available` becomes "Is available"), first checking for an [i18n translation](./i18n.html) under `avo.field_translations.<id>`.

```ruby
field :is_available, as: :boolean, name: "Availability"
```

- **Type:** String or Proc
- **Default:** the humanized field id, or its translation when one exists

</Option>

<Option name="`translation_key`" headingSize="3">

The i18n key used to translate the field's label, help, and placeholder. See the [i18n page](./i18n.html) for the full lookup rules.

```ruby
field :is_available, as: :boolean, translation_key: "avo.field_translations.availability"
```

- **Type:** String
- **Default:** `avo.field_translations.<field_id>`

</Option>

<Option name="`help`" headingSize="3">

Extra text displayed below the input on the form views (<New /> and <Edit />). Accepts HTML. Use [`label_help`](#label_help) to show text on every view instead.

```ruby
field :password, as: :password, help: 'Verify the password strength <a href="http://www.passwordmeter.com/">here</a>.'
```

- **Type:** String (HTML allowed) or Proc
- **Default:** `nil`, falling back to the `avo.field_translations.<field_id>.help` i18n key when defined

</Option>

<Option name="`label_help`" headingSize="3">

Help text displayed below the field's label on every view. Accepts HTML.

```ruby
field :custom_css, as: :code, label_help: "This enables you to edit the user's custom styles."
```

- **Type:** String (HTML allowed) or Proc
- **Default:** `nil`

</Option>

<Option name="`placeholder`" headingSize="3">

The placeholder shown inside empty inputs on the <New /> and <Edit /> views. Only applies to fields that render a text-like input.

```ruby
field :name, as: :text, placeholder: "John Doe"
```

- **Type:** String or Proc
- **Default:** the `avo.field_translations.<field_id>.placeholder` i18n key when defined, otherwise the field's name

</Option>

## Visibility on views

Four methods control which views a field appears on. They all accept a single value or an array of values from this table:

| Value      | Meaning                                                     |
| ---------- | ----------------------------------------------------------- |
| `:index`   | the <Index /> view                                          |
| `:show`    | the <Show /> view                                           |
| `:new`     | the <New /> view                                            |
| `:edit`    | the <Edit /> view                                           |
| `:preview` | the [preview](./fields/preview.html) popover                |
| `:forms`   | `:new` and `:edit`                                          |
| `:display` | `:index` and `:show`                                        |
| `:all`     | every view — only for [`show_on`](#show_on) and [`hide_on`](#hide_on) |

By default a field is visible on `:index`, `:show`, `:new`, and `:edit`, and hidden on `:preview`.

:::info
A few fields override these defaults — for example, the [`id`](./fields/id.html) field hides itself on the form views.
:::

<Option name="`show_on`" headingSize="3">

Shows the field on the given views, on top of the defaults.

```ruby
field :body, as: :textarea, show_on: :preview
```

- **Type:** Symbol or Array of Symbols
- **Values:** see the table above, including `:all`

</Option>

<Option name="`hide_on`" headingSize="3">

Hides the field on the given views, keeping the defaults elsewhere.

```ruby
field :body, as: :textarea, hide_on: [:index, :show]
```

- **Type:** Symbol or Array of Symbols
- **Values:** see the table above, including `:all`

</Option>

<Option name="`only_on`" headingSize="3">

Shows the field exclusively on the given views and hides it everywhere else.

```ruby
field :body, as: :textarea, only_on: :forms
```

- **Type:** Symbol or Array of Symbols
- **Values:** see the table above, except `:all`

</Option>

<Option name="`except_on`" headingSize="3">

Shows the field everywhere except the given views.

```ruby
field :body, as: :textarea, except_on: :forms
```

- **Type:** Symbol or Array of Symbols
- **Values:** see the table above, except `:all`

</Option>

<Option name="`visible`" headingSize="3">

Conditionally shows or hides the field. The block is executed in [`Avo::ExecutionContext`](./execution-context.html) and has access to the [`context`](./customization.html#context) object and the current `resource` (the record is available as `resource.record`).

```ruby
field :is_featured, as: :boolean, visible: -> { context[:user].is_admin? }
```

- **Type:** Boolean or Proc
- **Default:** `true`

:::warning
On form submissions, the `visible` block is evaluated in the `create` and `update` controller actions, where `resource.record` can be `nil` (on creation). Use safe navigation: `resource.record&.enabled?`.
:::

</Option>

## Formatting values

Formatter blocks are executed in [`Avo::ExecutionContext`](./execution-context.html) and have access to `value`, `record`, `resource`, `view`, and `field`, plus the usual defaults (`context`, `params`, `view_context`, `current_user`).

<Option name="`format_using`" headingSize="3">

Formats the field's value on **every** view — including the value rendered inside inputs on the form views.

```ruby
field :price, as: :number, format_using: -> { view_context.number_to_currency(value) }
```

- **Type:** Proc
- **Default:** `nil`

:::warning Copyable values
When combined with [`copyable`](#copyable), the **formatted** value is what gets copied to the clipboard, not the original database value.
:::

</Option>

<Option name="`format_{view}_using`" headingSize="3">

View-scoped variants of [`format_using`](#format_using). Each one formats the value only on the view (or view group) it names.

| Option                 | Applies on                        |
| ---------------------- | --------------------------------- |
| `format_index_using`   | <Index />                         |
| `format_show_using`    | <Show />                          |
| `format_edit_using`    | <Edit />                          |
| `format_new_using`     | <New />                           |
| `format_form_using`    | <New /> and <Edit />              |
| `format_display_using` | <Index /> and <Show />            |

```ruby
field :is_writer, format_display_using: -> { value.present? ? "👍" : "👎" }
```

- **Type:** Proc
- **Default:** `nil`

When several formatters are declared, the most specific one wins and the others are ignored — they do not chain:

| View       | Order of precedence                                            |
| ---------- | -------------------------------------------------------------- |
| <Index />  | `format_index_using` → `format_display_using` → `format_using` |
| <Show />   | `format_show_using` → `format_display_using` → `format_using`  |
| <Edit />   | `format_edit_using` → `format_form_using` → `format_using`     |
| <New />    | `format_new_using` → `format_form_using` → `format_using`      |

</Option>

<Option name="`update_using`" headingSize="3">

Parses the raw form `value` before it is stored in the database on `create` and `update`. The block's return value is what gets saved. Also receives `key` (the attribute being written) alongside the usual variables.

```ruby
field :metadata,
  as: :code,
  update_using: -> do
    ActiveSupport::JSON.decode(value)
  end
```

- **Type:** Proc
- **Default:** `nil`

</Option>

## Form behavior

<Option name="`required`" headingSize="3">

Adds an asterisk to the field's label, marking it as mandatory. Purely cosmetic — add the actual validation to your model (`validates :name, presence: true`). The block is executed in `Avo::ExecutionContext` with access to `view`, `record`, `resource`, `params`, `context`, `view_context`, and `current_user`.

```ruby
field :name, as: :text, required: -> { view == :new }
```

- **Type:** Boolean or Proc
- **Default:** `nil` — the asterisk is added automatically when the model has a presence validator on the attribute

</Option>

<Option name="`disabled`" headingSize="3">

Renders the input as `disabled` on the <New /> and <Edit /> views **and** ignores the field's value on save. A bad actor re-enabling the input in the DOM cannot write to the record. The block runs in `Avo::ExecutionContext` with the same variables as [`required`](#required).

```ruby
field :name, as: :text, disabled: -> { view == :edit }
```

- **Type:** Boolean or Proc
- **Default:** `false`

</Option>

<Option name="`readonly`" headingSize="3">

Renders the input as `disabled` on the <New /> and <Edit /> views, but — unlike [`disabled`](#disabled) — the value is still processed on save. The block runs in `Avo::ExecutionContext` with the same variables as [`required`](#required).

```ruby
field :name, as: :text, readonly: true
```

- **Type:** Boolean or Proc
- **Default:** `false`

:::warning
`readonly` is a UI affordance only. A user can re-enable the input in the DOM and submit an arbitrary value. Use [`disabled`](#disabled) to protect the attribute server-side.
:::

</Option>

<Option name="`default`" headingSize="3">

Pre-fills the field on the <New /> view (and in [action](./actions/overview.html) modals) when the record's attribute is `nil`. The block is executed in `Avo::ExecutionContext` with access to `record`, `resource`, `view`, and `parent`.

```ruby
field :level, as: :select, options: {Beginner: :beginner, Advanced: :advanced}, default: -> { Time.now.hour < 12 ? "advanced" : "beginner" }
```

- **Type:** any value or Proc
- **Default:** `nil`

</Option>

<Option name="`nullable`" headingSize="3">

Stores `NULL` in the database instead of an empty value. On form submission, any submitted value included in [`null_values`](#null_values) is cast to `nil` before the record is saved.

```ruby
field :body, as: :textarea, nullable: true
```

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`null_values`" headingSize="3">

The set of submitted values that [`nullable`](#nullable) converts to `nil`.

```ruby
field :body, as: :textarea, nullable: true, null_values: ["0", "", "null", "nil", nil]
```

- **Type:** Array
- **Default:** `[nil, ""]`

</Option>

<Option name="`autocomplete`" headingSize="3">

Forwarded verbatim to the input's `autocomplete` HTML attribute on fields that render a text-like input (text, number, password, and similar).

```ruby
field :one_time_password, as: :text, autocomplete: "one-time-code"
```

- **Type:** String
- **Default:** `nil`
- **Values:** any valid [HTML `autocomplete` token](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)

</Option>

## Index view

<Option name="`sortable`" headingSize="3">

Makes the column sortable on the <Index /> view. For computed fields or associations — where Avo can't infer the column to sort by — pass a block that receives `query` and `direction` and returns a query.

```ruby
field :name, as: :text, sortable: true

field :last_commented_at,
  as: :date,
  sortable: -> {
    query.includes(:comments).order("comments.created_at #{direction}")
  }
```

- **Type:** Boolean or Proc
- **Default:** `false` (the [`id`](./fields/id.html) field defaults to `true`)

</Option>

<Option name="`summarizable`" headingSize="3">

Adds a chart icon to the column's table header. Clicking it opens a popover with a chart of the column's data distribution.

```ruby
field :status, as: :select, summarizable: true
```

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`link_to_record`" headingSize="3">

Renders the field's <Index /> table cell as a link to the record.

```ruby
field :name, as: :text, link_to_record: true
```

- **Type:** Boolean
- **Default:** `false`
- **Available on:** [`id`](./fields/id.html), [`text`](./fields/text.html), [`gravatar`](./fields/gravatar.html), and [`belongs_to`](./associations/belongs_to.html) fields

Related: the global [`id_links_to_resource`](./customization.html#id-links-to-resource) configuration links every `id` field automatically.

</Option>

## Layout and rendering

<Option name="`width`" headingSize="3">

The percentage of horizontal space the field takes inside its panel. Adjacent fields with widths below `100` sit on the same row.

```ruby
field :first_name, width: 50
field :last_name,  width: 50
```

- **Type:** Integer or Proc
- **Default:** `100`
- **Values:**

| `width` | Approx. fraction   |
| ------- | ------------------ |
| `25`    | ¼                  |
| `33`    | ⅓                  |
| `50`    | ½                  |
| `66`    | ⅔                  |
| `75`    | ¾                  |
| `100`   | full row (default) |

Unlisted values fall back to the full row width.

:::info
Any `width` below `100` automatically marks the field as [`stacked`](#stacked).
:::

</Option>

<Option name="`stacked`" headingSize="3">

Renders the field's label above its value instead of beside it.

```ruby
field :meta, as: :key_value, stacked: true
```

- **Type:** Boolean
- **Default:** `nil` — falls back to the `config.field_wrapper_layout` initializer option (`:inline` unless changed to `:stacked`)

</Option>

<Option name="`html`" headingSize="3">

Attaches `style`, `classes`, and `data` HTML attributes to the field's wrapper, label, or input, per view. See the [HTML attributes page](./html.html) for the full structure.

```ruby
field :users_required, as: :number, html: {index: {wrapper: {classes: "text-right"}}}
```

- **Type:** Hash or Proc
- **Default:** `nil`

</Option>

<Option name="`components`" headingSize="3">

Overrides the view components used to render the field, per view. Keys follow the `<view>_component` pattern (`index_component`, `show_component`, `edit_component`); values are component classes or class names as strings. The block is executed in `Avo::ExecutionContext` with access to `resource`, `record`, `view`, `params`, and more.

```ruby
field :description,
  as: :text,
  components: {
    index_component: Avo::Fields::Admin::TextField::IndexComponent,
    show_component: Avo::Fields::Admin::TextField::ShowComponent,
    edit_component: "Avo::Fields::Admin::TextField::EditComponent"
  }
```

- **Type:** Hash, or Proc returning a Hash
- **Default:** `{}`

:::warning Initializer
Keep the same initializer signature on your custom components as the original field view component.
:::

</Option>

<Option name="`copyable`" headingSize="3">

Shows a clipboard icon when hovering over the field's value on the <Show /> and <Index /> views, letting users copy it. Applies to fields that render text values.

```ruby
field :name, as: :text, copyable: true
```

- **Type:** Boolean
- **Default:** `false`

:::info
The copied value is the **displayed** value — if the field uses [`format_using`](#format_using), the formatted result is what lands in the clipboard.
:::

</Option>

## Advanced

<Option name="`for_attribute`" headingSize="3">

Reads from and writes to a different model attribute than the field's id. Useful for declaring two fields backed by the same attribute.

```ruby
field :secondary_field_for_status,
  as: :badge,
  for_attribute: :status,
  options: {info: :one, success: :two, warning: :three}
```

- **Type:** Symbol or String
- **Default:** `nil` — the field's id is used as the attribute

</Option>

<Option name="`meta`" headingSize="3">

Sends arbitrary data to the field, readable inside components and templates as `@field.meta`. Useful with [custom fields](./custom-fields.html) or custom [`components`](#components).

```ruby
field :status, as: :custom_status, meta: {foo: :bar}
```

- **Type:** Hash or Proc
- **Default:** `nil`

</Option>

<Option name="`react_on`" headingSize="3">

Re-evaluates the field when other fields change in the form, refreshing `@record` with the latest form values. Requires the **`avo-reactive_fields`** add-on gem (see the [Avo 4 upgrade guide](./avo-3-avo-4-upgrade.html#gems) for the `packager.dev` source).

```ruby
field :city,
  as: :select,
  react_on: :country,
  options: -> { Course.cities.dig(@record.country&.to_sym) || [""] }
```

- **Type:** Symbol, Array of Symbols, or `:all`
- **Default:** `nil`
- **Values:** a single field (`:field_one`), multiple fields (`[:field_one, :field_two]`), or `:all` (react to every field in the form)

Updates run when a watched field's value is committed — the `change` event. For selects, checkboxes, and radios that's on selection; for text inputs and textareas it's when the input loses focus. To read a field's original value inside a block, use the [`*_was`](https://api.rubyonrails.org/classes/ActiveModel/Dirty.html#method-i-2A_was) methods.

</Option>
