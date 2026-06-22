---
license: add_on
add_on: forms_feature
betaStatus: Beta
outline: [2, 3]
guide: ./forms.html
---

# Forms API

Per-attribute and per-method reference for forms. For task-oriented documentation and worked examples, see the [Forms guide](./forms.html).

Every form is a class that inherits from `Avo::Forms::Core::Form` and lives under `app/avo/forms/`:

```ruby
class Avo::Forms::AppSettings < Avo::Forms::Core::Form
  self.title = "Application Settings"

  def fields
    # field declarations
  end

  def handle
    # submission logic
  end
end
```

## Class attributes

<Option name="`self.title`">

The display title for the form. When the form is rendered on a [page](./pages.html), it appears as the header above the fields unless that placement sets [`show_header: false`](./pages-api.html#form).

```ruby
self.title = "Application Settings"
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`self.description`">

A description rendered below the title in the form header.

```ruby
self.description = "Manage your application configuration"
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`self.id`">

The routing key — and URL segment — for the form. Forms are submitted to `<root_path>/forms/<id>` and resolved by their `id` at request time, so no routes are declared manually.

```ruby
self.id = :app_settings
```

- **Type:** Symbol or String
- **Default:** the class path under `Avo::Forms`, e.g. `Avo::Forms::Settings::Integrations` → `settings/integrations`. A form declared inline under a page resolves against its page path instead.
- **Constraint:** must be unique across all forms — it's how a submission is matched to a form.

</Option>

## Form methods

<Option name="`fields`">

Defines the form's structure. Uses the same field syntax as Avo resources and actions, so it supports every Avo field type, [panels and cards](./../resource-panels.html), and layout components.

```ruby
def fields
  field :email, as: :text, required: true
  field :notifications, as: :boolean, default: true
end
```

- **Type:** instance method you define
- **Returns:** ignored — declare fields for their side effect, as in resources

</Option>

<Option name="`field`">

Declares a single field inside `fields`. Accepts all standard Avo field types and field options.

```ruby
field :theme, as: :select, options: { light: "Light", dark: "Dark" }
```

- **Type:** DSL method called inside `fields`
- **Values:** any Avo field type via `as:`; all standard field options are supported (`required:`, `default:`, `help_text:`, `width:`, `record:`, …)

</Option>

<Option name="`handle`">

Processes the submission and defines the response. Called when the form is submitted, with submitted data available through `params`.

```ruby
def handle
  current_user.update(params.permit(:first_name, :last_name))
  flash[:notice] = "Saved"
  default_response
end
```

- **Type:** instance method you define
- **Context:** evaluated in the controller that received the request, so any controller helper (`params`, `current_user`, `flash`, `cookies`, `redirect_to`, …) is available.
- **Helpers:** `default_response` — the standard redirect-back Turbo Stream response.

:::info Experimental
`handle` runs in the controller's context rather than behind a dedicated DSL. This keeps the full Rails toolbox available, but the exact contract may change in a future release.
:::

</Option>
