---
license: add_on
add_on_link: https://avohq.io/addons/forms
add_on: forms_feature
betaStatus: Beta
outline: [2, 3]
api_docs: ./forms-and-pages-api.html
---

# Forms & Pages

Build structured configuration and settings interfaces in your Avo admin using standalone forms and organized page hierarchies — no database models required.

**Forms** are model-agnostic screens for anything that isn't CRUD on a record — application settings, user preferences, data imports, or any custom workflow. You declare a form's fields and decide what happens when it's submitted. **Pages** organize those forms into a sidebar-navigable interface with a main page and sub-pages.

A form is a class under `app/avo/forms/` that defines its fields and handles its own submission:

```ruby
# app/avo/forms/app_settings.rb
class Avo::Forms::AppSettings < Avo::Forms::Core::Form
  self.title = "Application Settings"
  self.description = "Manage your application configuration"

  def fields
    field :app_name, as: :text
    field :maintenance_mode, as: :boolean
  end

  def handle
    flash[:notice] = "Settings updated successfully"
    default_response
  end
end
```

A form needs only two things: a [`fields`](./forms-and-pages-api.html#fields) method describing what to show, and a [`handle`](./forms-and-pages-api.html#handle) method describing what to do on submit. Everything else — title, description, routing — has a sensible default.

## Install the add-on

Forms & Pages ships as the `avo-forms` add-on and requires Avo >= 4.0 with an active license that has the add-on enabled.

Add the gem to your `Gemfile`:

```ruby
# Gemfile
gem "avo-forms", source: "https://packager.dev/avo-hq/"
```

Then install it:

```bash
bundle install
```

The engine registers itself automatically via `Avo.plugin_manager` — no initializer changes are required. Start creating forms and pages right away.

## Quick start

Generate a form:

```bash
rails generate avo:form general_settings
```

This creates `app/avo/forms/general_settings.rb`. Add fields and handle submission:

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

Generate a page to host it:

```bash
rails generate avo:page settings
```

Wire the form into a sub-page. The main page declares navigation; the sub-page declares content:

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

```ruby
# app/avo/pages/settings/general.rb
class Avo::Pages::Settings::General < Avo::Forms::Core::Page
  self.title = "General"

  def content
    form Avo::Forms::GeneralSettings
  end
end
```

Finally, add the page to your Avo menu:

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

- **Forms** inherit from `Avo::Forms::Core::Form`. They define fields via [`fields`](./forms-and-pages-api.html#fields) and handle submissions via [`handle`](./forms-and-pages-api.html#handle). The `handle` method runs in the controller context, so `params`, `current_user`, `flash`, and `cookies` are all available directly.
- **Pages** inherit from `Avo::Forms::Core::Page`. A **main page** (one namespace level deep, e.g. `Avo::Pages::Settings`) acts as a container and defines [`navigation`](./forms-and-pages-api.html#navigation). **Sub-pages** (deeper, e.g. `Avo::Pages::Settings::General`) define the actual [`content`](./forms-and-pages-api.html#content).
- **Routes** are resolved dynamically at request time — no manual route declarations. Pages live at `<root_path>/pages/<id>` and forms at `<root_path>/forms/<id>`, where `id` defaults to the class path (e.g. `Avo::Pages::Settings::General` → `settings/general`) and can be overridden with [`self.id`](./forms-and-pages-api.html#self.id).
- **Rendering**: pages render with a sidebar navigation listing all sub-pages. Each sub-page shows its title, description, and all registered forms in order.

## Generate forms and pages

Avo Forms ships generators for both building blocks. Use them to scaffold a class with the right structure, then fill in the fields, content, and navigation.

Generate a form:

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

Generate a page:

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

To create a sub-page, generate the parent first and namespace the child under it — see [how pages are organized](#organize-pages).

:::warning Parsed once at boot
`content` and `navigation` are evaluated a single time during application boot. Keep them static — no conditional or dynamic logic inside them.
:::

## Build a form's fields

Declare what the form shows inside [`fields`](./forms-and-pages-api.html#fields), using the same [`field`](./forms-and-pages-api.html#field) syntax as resources and actions. Every Avo field type and option works here.

```ruby
# app/avo/forms/user_preferences.rb
class Avo::Forms::UserPreferences < Avo::Forms::Core::Form
  def fields
    field :email, as: :text, required: true
    field :notifications, as: :boolean, default: true
    field :theme, as: :select, options: { light: "Light", dark: "Dark" }
  end
end
```

### Group fields with cards and panels

Wrap related fields in a `card` or [`panel`](./fields-layout.html#group-fields-into-panels) to organize them. Both take `title:` and `description:` as keyword arguments.

```ruby
def fields
  card title: "Personal Information" do
    field :first_name, as: :text
    field :last_name, as: :text
  end

  panel title: "Preferences", description: "Customize your experience" do
    field :theme, as: :select, options: { light: "Light", dark: "Dark" }
    field :notifications, as: :boolean
  end
end
```

### Place fields side by side

Use the `width` field option to lay fields out inline. `with_options` applies it to a group at once.

```ruby
def fields
  card do
    with_options width: 50 do
      field :first_name, as: :text
      field :last_name, as: :text
    end
  end
end
```

### Prefill from a record

Bind a field to an existing record to prefill its value. `with_options record:` binds a whole group.

```ruby
def fields
  field :first_name, record: Avo::Current.user
  field :last_name, record: Avo::Current.user
  field :email, record: Avo::Current.user
end
```

## Handle a form's submission

When the form is submitted, [`handle`](./forms-and-pages-api.html#handle) runs. It executes in the controller's context, so the submitted data is in `params` and every controller helper — `current_user`, `flash`, `cookies`, `redirect_to` — is available. Call `default_response` to send the standard redirect-back response.

```ruby
def handle
  current_user.update(params.permit(:first_name, :last_name, :email))
  flash[:notice] = "Profile updated successfully"
  default_response
end
```

Because it's plain controller code, you can do anything Rails can — update several models, kick off a background job, or branch on the input:

```ruby
def handle
  ImportService.new(params[:file]).process if params[:import_data]
  Post.create(title: params[:title], body: params[:body])
  default_response
end
```

### Flash messages

Set a flash before returning to surface feedback. Pass a string for a simple message, or a Hash to control the timeout (`:forever` keeps it until dismissed).

```ruby
def handle
  flash[:notice] = "Operation completed successfully"
  flash[:error] = "Something went wrong"
  flash[:success] = { body: "Saved successfully", timeout: 3000 }
  flash[:warning] = { body: "Heads up", timeout: :forever }

  default_response
end
```

## Reusable vs. inline forms

The generator gives each form its own file under `app/avo/forms/` — the default, and the right choice for anything you'll show on more than one page or render as a component. The class name is its public handle.

For a form that only ever belongs to one page, you can define it inline, nested in the page class:

```ruby
# app/avo/pages/settings/integrations.rb
class Avo::Pages::Settings::Integrations < Avo::Forms::Core::Page
  self.title = "Integrations"

  def content
    form ApiConfiguration
  end

  class ApiConfiguration < Avo::Forms::Core::Form
    self.title = "API Configuration"

    def fields
      field :api_key, as: :text, required: true
      field :webhook_url, as: :text
    end

    def handle
      flash[:success] = "API configuration updated"
      default_response
    end
  end
end
```

:::warning Nesting hides intent
A nested `Avo::Pages::Settings::Integrations::ApiConfiguration` doesn't read as a form, which makes the code harder to navigate. Reach for inline definitions only for simple, page-specific forms — give a form its own file the moment you want to reuse it elsewhere.
:::

## Render a form anywhere

Forms are usually shown on a page, but a form can also be dropped into any view as a standalone component via its `.component` method:

```erb
<%# app/views/some/view.html.erb %>
<%= render Avo::Forms::Settings::General.component %>
```

## Organize pages

Pages give you structured, hierarchical screens for organizing forms and sub-pages. A page works like a resource, but instead of records it presents forms and child pages. With nothing but a class name, a page already has a title and URL derived from its namespace; you add structure by declaring a [`navigation`](./forms-and-pages-api.html#navigation) of sub-pages, a [`content`](./forms-and-pages-api.html#content) of forms, or both.

Pages form a shallow hierarchy based on their namespace depth:

- **Main pages** sit one level under `Avo::Pages` (e.g. `Avo::Pages::Settings`). They act as containers, get a left-sidebar menu entry, and can declare a [`navigation`](./forms-and-pages-api.html#navigation) of children.
- **Sub-pages** are nested deeper (e.g. `Avo::Pages::Settings::General`). They hold the actual forms and are reached through their parent's navigation.

When a user opens a main page, Avo redirects to its [`default`](./forms-and-pages-api.html#page) sub-page if one is set; otherwise it shows the main page's own content. Sub-pages appear in a sidebar for easy switching.

## Build a page's navigation

Declare a main page's children inside [`navigation`](./forms-and-pages-api.html#navigation). There are three ways to register an entry, and you can mix them freely.

Reference an existing page class — the common case — and optionally mark one as the [`default`](./forms-and-pages-api.html#page):

```ruby
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  def navigation
    page Avo::Pages::Settings::General, default: true
    page Avo::Pages::Settings::Security
  end
end
```

For a simple section, skip the file and declare a [virtual page](./forms-and-pages-api.html#page) inline with its content:

```ruby
def navigation
  page "Integrations",
    description: "Connect third-party services",
    content: -> do
      form Avo::Forms::Settings::Slack
      form Avo::Forms::Settings::Email
    end
end
```

To surface a single form without a page of its own, register it directly with [`form`](./forms-and-pages-api.html#form) — it becomes a navigation entry that shows the form inline:

```ruby
def navigation
  form Avo::Forms::Profiles
end
```

## Put forms on a page

A sub-page shows its forms by declaring them in [`content`](./forms-and-pages-api.html#content) with [`form`](./forms-and-pages-api.html#form). They render in the order you list them.

```ruby
# app/avo/pages/settings/general.rb
class Avo::Pages::Settings::General < Avo::Forms::Core::Page
  self.title = "General Settings"

  def content
    form Avo::Forms::Settings::AppSettings
    form Avo::Forms::Settings::CompanyInfo
  end
end
```

Each form renders with its own header — its [`title`](./forms-and-pages-api.html#self.title) and [`description`](./forms-and-pages-api.html#self.description). If you're already on a page that provides context, drop the header for that placement with `show_header: false`:

```ruby
def content
  form Avo::Forms::Settings::AppSettings, show_header: false
end
```

## Name the menu entry

By default a page's menu label is its [`title`](./forms-and-pages-api.html#self.title). Set [`navigation_label`](./forms-and-pages-api.html#self.navigation_label) when you want a shorter or different label in the menu than the title shown on the page.

```ruby
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  self.title = "Application Settings"
  self.navigation_label = "App Config"
end
```

## Add pages to the main menu

Pages don't appear in Avo's main navigation until you add them. Reference them individually in `config.main_menu`, or pull in all of them with `all_pages`:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section "Configuration", icon: "cog" do
      page "Avo::Pages::Settings", icon: "adjustments"

      # Or add every page at once:
      all_pages
    end
  }
end
```

## Full example

A complete settings area: a form that groups fields into panels and persists them in `handle`, and a page that wires it up with a default sub-page, an inline form, and a virtual page.

```ruby
# app/avo/forms/app_settings.rb
class Avo::Forms::AppSettings < Avo::Forms::Core::Form
  self.title = "Application Settings"
  self.description = "Configure global application settings"

  def fields
    card do
      field :app_name, as: :text,
            default: -> { Rails.application.class.module_parent_name },
            required: true
      field :app_url, as: :text, placeholder: "https://yourapp.com"
      field :maintenance_mode, as: :boolean, default: false
    end

    panel title: "Feature Flags" do
      field :enable_registrations, as: :boolean, default: true
      field :max_file_upload_size, as: :number, default: 10, help_text: "In MB"
    end
  end

  def handle
    ApplicationSettings.update_all(
      params.permit(:app_name, :app_url, :maintenance_mode,
                    :enable_registrations, :max_file_upload_size)
    )

    flash[:success] = { body: "Application settings updated", timeout: 5000 }
    default_response
  end
end
```

```ruby
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  self.title = "Settings"
  self.description = "Manage your application settings"
  self.navigation_label = "App Settings"

  def navigation
    page Avo::Pages::Settings::General, default: true
    form Avo::Forms::UserProfiles
    page "Integrations",
      content: -> do
        form Avo::Forms::Settings::SlackIntegration
        form Avo::Forms::Settings::EmailIntegration
      end
    page Avo::Pages::Settings::Security
  end
end
```

```ruby
# app/avo/pages/settings/general.rb
class Avo::Pages::Settings::General < Avo::Forms::Core::Page
  self.title = "General Settings"
  self.description = "Basic application configuration"

  def content
    form Avo::Forms::AppSettings
    form Avo::Forms::Settings::CompanyInfo
  end
end
```

## Best practices

- **Keep each form focused** on one related set of functionality rather than doing everything at once.
- **Group fields with panels** so long forms stay scannable.
- **Validate and permit input** in `handle` before acting on it.
- **Give feedback** with flash messages so users know the result.
- **Wrap risky work in `begin`/`rescue`** and surface failures via `flash[:error]`.
- **Offload long-running work** to a background job and tell the user it's processing.
- **Keep the page hierarchy shallow** — a main page plus one level of sub-pages covers most cases.
- **Set a default sub-page** when the main page is mainly a container, so it lands somewhere useful.
- **Pick the right page type**: class-based pages for anything with custom logic or several forms; virtual pages with forms for a single-form section; virtual pages with content to group related forms without extra files.
- **Use `navigation_label`** to keep long titles readable in the menu.
