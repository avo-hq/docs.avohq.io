---
license: add_on
add_on_link: "https://avohq.io/pricing-4?add_ons[]=forms"
add_on: forms_feature
betaStatus: Beta
outline: [2, 3]
---

# Forms & Pages

Build structured configuration and settings interfaces in your Avo admin using standalone forms and organized page hierarchies — no database models required.

Forms handle custom data processing, settings management, and workflows. Pages organize those forms into a sidebar-navigable interface with a main page and sub-pages.

## Requirements

- Avo >= 4.0
- An active Avo license with the Forms add-on enabled

## Installation

### 1. Add the gem

Add `avo-forms` to your `Gemfile`:

```ruby
gem "avo-forms", source: "https://packager.dev/avo-hq/"
```

Then install it:

```bash
bundle install
```

### 2. Verify the engine loads

The engine registers itself automatically via `Avo.plugin_manager`. No initializer changes are required — start creating forms and pages right away.

## Quick start

### Create your first form

Generate a form with:

```bash
rails generate avo:form general_settings
```

This creates `app/avo/forms/general_settings.rb`. Edit it to add fields and handle submission:

```ruby
# app/avo/forms/general_settings.rb
class Avo::Forms::GeneralSettings < Avo::Forms::Core::Form
  self.title = "General Settings"
  self.description = "Configure your application"

  def fields
    field :app_name, as: :text, required: true
    field :maintenance_mode, as: :boolean, default: false
  end

  def handle
    # params contains submitted form data
    flash[:notice] = "Settings saved"
    default_response
  end
end
```

### Create a page to host your form

Generate a page:

```bash
rails generate avo:page settings
```

Edit `app/avo/pages/settings.rb` to wire in your form:

```ruby
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  self.title = "Settings"
  self.description = "Manage your application settings"

  def navigation
    page Avo::Pages::Settings::General, default: true
  end
end
```

Create the sub-page `app/avo/pages/settings/general.rb`:

```ruby
# app/avo/pages/settings/general.rb
class Avo::Pages::Settings::General < Avo::Forms::Core::Page
  self.title = "General"

  def content
    form Avo::Forms::GeneralSettings
  end
end
```

### Add the page to your Avo menu

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section "Configuration", icon: "cog" do
      page "Avo::Pages::Settings", icon: "adjustments"
    end
  }
end
```

Users can now navigate to **Settings → General** in the sidebar and submit the form.

## How it works

- **Forms** inherit from `Avo::Forms::Core::Form`. They define fields via `def fields` and handle submissions via `def handle`. The `handle` method runs in the controller context, so `params`, `current_user`, `flash`, and `cookies` are all available directly.

- **Pages** inherit from `Avo::Forms::Core::Page`. A **main page** (one namespace level deep, e.g. `Avo::Pages::Settings`) acts as a container and defines navigation. **Sub-pages** (deeper, e.g. `Avo::Pages::Settings::General`) define the actual content via `def content`.

- **Routes** are resolved dynamically at request time — no manual route declarations needed. Pages live at `<root_path>/pages/<id>` and forms at `<root_path>/forms/<id>`, where `id` defaults to the class path (e.g. `Avo::Pages::Settings::General` → `settings/general`) and can be overridden with [`self.id`](./pages-api.html#self.id).

- **Rendering**: Pages render with a sidebar navigation listing all sub-pages. Each sub-page shows its title, description, and all registered forms in order.

## Generators

Avo Forms ships generators for both building blocks. Use them to scaffold a class with the right structure, then fill in the fields, content, and navigation.

### Form generator

```bash
rails generate avo:form your_form_name
```

Creates `app/avo/forms/your_form_name.rb`:

```ruby
# app/avo/forms/your_form_name.rb
class Avo::Forms::YourFormName < Avo::Forms::Core::Form
  self.title = "Your Form Name"
  self.description = "Manage your your form name"

  def fields
    field :example, as: :text, default: "Hello World"
  end

  def handle
    flash[:success] = { body: "Form submitted successfully", timeout: :forever }
    flash[:notice] = params[:example]

    default_response
  end
end
```

### Page generator

```bash
rails generate avo:page your_page_name
```

Creates `app/avo/pages/your_page_name.rb`, with commented examples of every navigation and content declaration:

```ruby
# app/avo/pages/your_page_name.rb
class Avo::Pages::YourPageName < Avo::Forms::Core::Page
  self.title = "Your Page Name"
  self.description = "A page for your page name"
  # self.navigation_label = "Your Page Name"

  def content
    # form Avo::Forms::AnyFormClass
  end

  def navigation
    # Reference an existing page class:
    # page Avo::Pages::AnySubPageClass

    # Show a form directly in the navigation:
    # form Avo::Forms::AnyFormClass

    # Declare a virtual page inline with its content:
    # page "Custom Page",
    #   description: "A page for custom page",
    #   content: -> { form Avo::Forms::SomeForm }
  end
end
```

To create a sub-page, generate the parent first and namespace the child under it — see [how pages are organized](./pages.html#how-pages-are-organized).

:::warning Parsed once at boot
`content` and `navigation` are evaluated a single time during application boot. Keep them static — no conditional or dynamic logic inside them.
:::

## Related

- [Forms](./forms.html) — define a form's fields and handle its submission. Start here to build the inputs.
- [Pages](./pages.html) — organize forms into a navigable hierarchy of main pages and sub-pages.
