---
license: add_on
add_on: forms_feature
betaStatus: Beta
outline: [2, 3]
api_docs: ./forms-api.html
---

# Forms

Forms are standalone, model-agnostic screens for anything that isn't CRUD on a database record — application settings, user preferences, data imports, or any custom workflow. Unlike resources, a form isn't tied to a model: you declare its fields, and you decide what happens when it's submitted.

Every form is a class under `app/avo/forms/` that inherits from `Avo::Forms::Core::Form`, defines its fields, and handles its own submission:

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

A form needs only two things to work: a [`fields`](./forms-api.html#fields) method describing what to show, and a [`handle`](./forms-api.html#handle) method describing what to do on submit. Everything else — title, description, routing — has a sensible default.

Forms are usually displayed on [Pages](./pages.html), but they can also be rendered [anywhere in the interface](#render-a-form-anywhere).

## Generate a form

Use the form generator to scaffold the class. Its usage is documented in the [Generators](./overview.html#form-generator) section.

## Build the form's fields

Declare what the form shows inside [`fields`](./forms-api.html#fields), using the same [`field`](./forms-api.html#field) syntax as resources and actions. Every Avo field type and option works here.

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

Wrap related fields in a `card` or [`panel`](./../resource-panels.html) to organize them. Both take `title:` and `description:` as keyword arguments.

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

## Handle the submission

When the form is submitted, [`handle`](./forms-api.html#handle) runs. It executes in the controller's context, so the submitted data is in `params` and every controller helper — `current_user`, `flash`, `cookies`, `redirect_to` — is available. Call `default_response` to send the standard redirect-back response.

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

## Show a form on a page

Forms become reachable in the UI by registering them on a [Page](./pages.html) — see the [Pages guide](./pages.html) for the navigation and content structure. When a form is shown on a page, its title and description render as a header above the fields; hide that header for a placement with `show_header: false` on the page's [`form`](./pages-api.html#form) declaration.

## Render a form anywhere

A form can also be dropped into any view as a standalone component via its `.component` method:

```erb
<%= render Avo::Forms::Settings::General.component %>
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

## Full example

A complete settings form, grouping fields into panels and persisting them in `handle`:

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

## Best practices

- **Keep each form focused** on one related set of functionality rather than doing everything at once.
- **Group fields with panels** so long forms stay scannable.
- **Validate and permit input** in `handle` before acting on it.
- **Give feedback** with flash messages so users know the result.
- **Wrap risky work in `begin`/`rescue`** and surface failures via `flash[:error]`.
- **Offload long-running work** to a background job and tell the user it's processing.

## Related

- [Pages](./pages.html) — put this form in front of users by registering it on a page.
- [Forms API](./forms-api.html) — the full reference for every form attribute and method.
- [Overview](./overview.html) — installation, the generators, and a quick start.
