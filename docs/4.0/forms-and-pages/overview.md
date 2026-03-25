---
license: add_on
add_on: forms_feature
betaStatus: Beta
outline: [2,3]
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

<LicenseReq license="pro"/>

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section "Configuration", icon: "cog" do
      page Avo::Pages::Settings, icon: "adjustments"
    end
  }
end
```

Users can now navigate to **Settings → General** in the sidebar and submit the form.

## How it works

- **Forms** inherit from `Avo::Forms::Core::Form`. They define fields via `def fields` and handle submissions via `def handle`. The `handle` method runs in the controller context, so `params`, `current_user`, `flash`, and `cookies` are all available directly.

- **Pages** inherit from `Avo::Forms::Core::Page`. A **main page** (one namespace level deep, e.g. `Avo::Pages::Settings`) acts as a container and defines navigation. **Sub-pages** (deeper, e.g. `Avo::Pages::Settings::General`) define the actual content via `def content`.

- **Routes** are generated dynamically at boot time from your form and page class definitions — no manual route declarations needed.

- **Rendering**: Pages render with a sidebar navigation listing all sub-pages. Each sub-page shows its title, description, and all registered forms in order.

## Next steps

- [Forms](./forms.html) — field types, panels, record binding, flash messages, and full examples
- [Pages](./pages.html) — hierarchy, virtual pages, navigation configuration, menu integration
- [Generators](./generator.html) — all generator commands and generated file templates
- [Guides & Tutorials](./guides-and-tutorials.html) — form organization strategies and page patterns
