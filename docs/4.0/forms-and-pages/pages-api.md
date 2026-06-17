---
license: add_on
add_on_link: "https://avohq.io/pricing-4?add_ons[]=forms"
betaStatus: Beta
outline: [2, 3]
guide: ./pages.html
---

# Pages API

Per-attribute and per-method reference for pages. For task-oriented documentation and worked examples, see the [Pages guide](./pages.html).

Every page is a class that inherits from `Avo::Forms::Core::Page` and lives under `app/avo/pages/`. A main page sits one level under `Avo::Pages`; a sub-page is nested deeper:

```ruby
class Avo::Pages::Settings < Avo::Forms::Core::Page
  self.title = "Settings"

  def navigation
    page Avo::Pages::Settings::General, default: true
  end
end
```

## Class attributes

<Option name="`self.title`">

The display title for the page.

```ruby
self.title = "Application Settings"
```

- **Type:** String
- **Default:** `nil` — when unset, the page falls back to the humanized last segment of the class name for its navigation label.

</Option>

<Option name="`self.description`">

A description rendered below the page title.

```ruby
self.description = "Manage your application settings and preferences"
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`self.navigation_label`">

The label shown in the Avo main menu and in the page's sidebar entry, when it should differ from the title.

```ruby
self.navigation_label = "App Configuration"
```

- **Type:** String
- **Default:** falls back to [`self.title`](#self.title); if that is also unset, the humanized last segment of the class name.

</Option>

<Option name="`self.id`">

The routing key — and URL segment — for the page. Pages are served at `<root_path>/pages/<id>` and resolved by their `id` at request time, so no routes are declared manually.

```ruby
self.id = :app_settings
```

- **Type:** Symbol or String
- **Default:** the class path under `Avo::Pages`, e.g. `Avo::Pages::Settings::General` → `settings/general`. [Virtual pages](#page) declared with a string title default the same way (`page "Feedback"` under `Avo::Pages::Settings` → `settings/feedback`); override those inline with the [`id` option](#page).
- **Constraint:** must be unique across all pages — it's how a request is matched to a page.

</Option>

## Navigation

<Option name="`navigation`">

Defines the sub-pages and forms that make up this page's navigation. Register children here with [`page`](#page) and [`form`](#form).

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
| `content`    | Proc            | `nil`   | Block declaring the virtual page's forms (string-title form only).                       |

</Option>

<Option name="`form`">

Registers a form by its class. `form` behaves differently depending on where it's called:

- Inside [`content`](#content) — renders the form on the page. Multiple forms stack in declaration order.
- Inside [`navigation`](#navigation) — adds the form as a navigation entry that shows the form directly, under the current page, with no dedicated page file. Its navigation label and header default to the form's [`title`](./forms-api.html#self.title) and [`description`](./forms-api.html#self.description).

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

## Content

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
