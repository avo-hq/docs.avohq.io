---
license: add_on
add_on_link: https://avohq.io/addons/forms
add_on: forms_feature
betaStatus: Beta
outline: [2, 3]
guide: ./forms-and-pages.html
---

# Forms & Pages API

Per-attribute and per-method reference for forms and pages. For task-oriented documentation and worked examples, see the [Forms & Pages guide](./forms-and-pages.html).

A **form** inherits from `Avo::Forms::Core::Form` and lives under `app/avo/forms/`; a **page** inherits from `Avo::Forms::Core::Page` and lives under `app/avo/pages/` (a main page one level under `Avo::Pages`, a sub-page nested deeper).

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

class Avo::Pages::Settings < Avo::Forms::Core::Page
  self.title = "Settings"

  def navigation
    page Avo::Pages::Settings::General, default: true
  end
end
```

## Shared attributes

Both `Avo::Forms::Core::Form` and `Avo::Forms::Core::Page` expose these class attributes.

<Option name="`self.title`" headingSize="3">

The display title. On a form it renders as the header above the fields (unless a page placement sets [`show_header: false`](#form)); on a page it's the page's own title.

```ruby
self.title = "Application Settings"
```

- **Type:** String
- **Default:** `nil`. On a **page**, when unset the humanized last segment of the class name is used for the navigation label.

</Option>

<Option name="`self.description`" headingSize="3">

A description rendered below the title — in the form header, or below the page title.

```ruby
self.description = "Manage your application configuration"
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`self.id`" headingSize="3">

The routing key — and URL segment. Forms are submitted to `<root_path>/forms/<id>` and pages served at `<root_path>/pages/<id>`, each resolved by its `id` at request time, so no routes are declared manually.

```ruby
self.id = :app_settings
```

- **Type:** Symbol or String
- **Default:** the class path under its namespace — a form under `Avo::Forms` (e.g. `Avo::Forms::Settings::Integrations` → `settings/integrations`; inline under a page, it resolves against the page path instead), a page under `Avo::Pages` (e.g. `Avo::Pages::Settings::General` → `settings/general`). [Virtual pages](#page) declared with a string title default the same way; override those with the [`id` option](#page).
- **Constraint:** must be unique across all forms (or all pages) — it's how a request is matched.

</Option>

## Form methods

<Option name="`fields`">

Defines the form's structure. Uses the same field syntax as Avo resources and actions, so it supports every Avo field type, [panels and cards](./fields-layout.html#group-fields-into-panels), and layout components.

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

## Page attributes

<Option name="`self.navigation_label`">

The label shown in the Avo main menu and in the page's sidebar entry, when it should differ from the title.

```ruby
self.navigation_label = "App Configuration"
```

- **Type:** String
- **Default:** falls back to [`self.title`](#self.title); if that is also unset, the humanized last segment of the class name.

</Option>

## Page navigation and content

<Option name="`navigation`">

Defines the sub-pages and forms that make up a main page's navigation. Register children here with [`page`](#page) and [`form`](#form).

```ruby
def navigation
  page Avo::Pages::Settings::General, default: true
  form Avo::Forms::Profiles
end
```

- **Type:** instance method you define

:::warning Parsed once at boot
`navigation` is evaluated a single time during application boot. Don't put conditional or otherwise dynamic logic inside it — it won't be re-evaluated per request.
:::

</Option>

<Option name="`page`">

Registers a sub-page inside `navigation`. Accepts either an existing page class or a string title that creates a virtual page inline.

```ruby
def navigation
  # Class-based: reference a page file
  page Avo::Pages::Settings::General, default: true

  # Virtual: declare the page inline with its content
  page "Integrations",
    description: "Connect third-party services",
    content: -> do
      form Avo::Forms::Settings::Slack
      form Avo::Forms::Settings::Email
    end
end
```

- **Type:** DSL method called inside `navigation`
- **Argument:** a `Avo::Forms::Core::Page` subclass, or a String title for a virtual page

Keyword options:

| Option        | Type            | Default | Behavior                                                                                 |
| ------------- | --------------- | ------- | ---------------------------------------------------------------------------------------- |
| `default`     | Boolean         | `false` | Marks the page shown when the parent main page is accessed directly. Any page type.       |
| `id`          | Symbol / String | derived | Routing key for a virtual page. Same behavior as [`self.id`](#self.id).                   |
| `description` | String          | `nil`   | Description for a virtual page (string-title form only).                                  |
| `content`     | Proc            | `nil`   | Block declaring the virtual page's forms (string-title form only).                       |

</Option>

<Option name="`form`">

Registers a form by its class. `form` behaves differently depending on where it's called:

- Inside [`content`](#content) — renders the form on the page. Multiple forms stack in declaration order.
- Inside [`navigation`](#navigation) — adds the form as a navigation entry that shows the form directly, under the current page, with no dedicated page file. Its navigation label and header default to the form's [`title`](#self.title) and [`description`](#self.description).

```ruby
def content
  form Avo::Forms::Settings::AppSettings
  form Avo::Forms::Settings::Profile, show_header: false
end
```

- **Type:** DSL method called inside `content` or `navigation`
- **Argument:** an `Avo::Forms::Core::Form` subclass

Keyword options:

| Option        | Type    | Default | Behavior                                                                                  |
| ------------- | ------- | ------- | ----------------------------------------------------------------------------------------- |
| `show_header` | Boolean | `true`  | Whether to render the form's header (its title + description) above the fields, for this placement. |

</Option>

<Option name="`content`">

Defines the forms displayed on this page. Register them with [`form`](#form); they render in declaration order.

```ruby
def content
  form Avo::Forms::Settings::AppSettings
  form Avo::Forms::Settings::CompanyInfo
end
```

- **Type:** instance method you define

:::warning Parsed once at boot
Like `navigation`, `content` is evaluated a single time during application boot. Keep it static — no conditional or dynamic logic.
:::

</Option>
