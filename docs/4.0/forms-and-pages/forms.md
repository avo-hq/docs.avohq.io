---
license: add_on
betaStatus: Beta
outline: [2,3]
---

# Forms

Avo provide a powerful way to build custom forms for your interface. Unlike resources that are tied to database models, forms are standalone components that can handle any kind of data processing, settings management, or custom workflows.

## Overview

Forms in Avo are designed to:
- Handle custom data processing and workflows
- Manage application settings and configurations
- Provide standalone forms not tied to specific models
- Integrate seamlessly with pages for organized interfaces
- Support all Avo field types and layout components
- Be rendered anywhere in the interface

Forms are typically displayed on [Pages](./pages.html) and can be used for various purposes like user preferences, system settings, data imports, or any custom functionality your application requires.

Forms can also be rendered as a standalone component anywhere in the interface. For example, you can render the general settings form in a tool by using the following code:

```erb
<%= render Avo::Forms::Settings::General.new.component %>
```

## Generating Forms

The generator usage is documented in the [Generators](./generator.html#form-generator) page.

## Form Structure

Every form inherits from `Avo::Forms::Core::Form` and requires two main methods:

1. **`def fields`** - Define the form structure and fields
2. **`def handle`** - Process form submission and define response

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
    # Process form data
    flash[:notice] = "Settings updated successfully"
    default_response
  end
end
```

## Form Configuration Options

Forms have several class attributes that customize their behavior and appearance.

<Option name="self.title" headingSize=3>

Sets the display title for the form.

```ruby{3}
# app/avo/forms/app_settings.rb
class Avo::Forms::AppSettings < Avo::Forms::Core::Form
  self.title = "Application Settings"
end
```

</Option>

<Option name="self.description" headingSize=3>

Provides a description that appears below the form title.

```ruby{3}
# app/avo/forms/app_settings.rb
class Avo::Forms::AppSettings < Avo::Forms::Core::Form
  self.description = "Manage your application configurations"
end
```

</Option>

## Form Methods

<Option name="def fields" headingSize=3>

Define the structure and fields of your form. This method uses the same field syntax as Avo resources and actions, supporting all field types, [panels](./../resource-panels.html), [clusters](./../resource-clusters.html), and layout components.

:::tip
When using `panel` to group fields, you **must** use the `main_panel` for one of the panels where you want to display the save button.
:::

```ruby{3-5}
# app/avo/forms/user_preferences.rb
class Avo::Forms::UserPreferences < Avo::Forms::Core::Form
  def fields
    # Define form fields here
  end
end
```

</Option>

<Option name="field" headingSize=3>

Add individual fields to your form. Supports all Avo field types and options.

```ruby
# app/avo/forms/user_preferences.rb
class Avo::Forms::UserPreferences < Avo::Forms::Core::Form
  def fields
    field :email, as: :text, required: true # [!code focus]
    field :notifications, as: :boolean, default: true # [!code focus]
    field :theme, as: :select, options: { light: "Light", dark: "Dark" } # [!code focus]
  end
end
```

**Field Options**

All standard Avo field options are supported

</Option>

<Option name="def handle" headingSize=3>

Process form submission and define the response. This method is called when the form is submitted and receives form data through the `params` object.

:::warning
Currently, the `handle` method is executed in the context of the controller method that receives the form request. This means that you can use any of the methods available in the controller to process the form data. **This is something experimental and might change in the future.**

::::info
This experiment is to see if by not building a heavy DSL for forms, we can make it easier to use and maintain.

The main point is that since it is the controller method, everything is available and possible to the developer by using rails syntax.

If we build a heavy DSL for the `handle` method like we do for actions, it and might feel restrictive to the developer in some cases.

If you have any feedback, please share it with us.
::::

Right now the only pre-defined methods available in the controller are:
- `default_response` - Standard redirect back turbo stream response

```ruby{3-8}
# app/avo/forms/user_preferences.rb
class Avo::Forms::UserPreferences < Avo::Forms::Core::Form
  def handle
    # Process form data
    # Access form data via params
    # Set flash messages and redirect
    default_response
  end
end
```

</Option>

## Field Types and Layout

Forms support all Avo field types and layout components:

### Basic Fields

```ruby
def fields
  field :name, as: :text
  field :email, as: :text, required: true
  field :age, as: :number
  field :active, as: :boolean
  field :bio, as: :textarea
  field :role, as: :select, options: { admin: "Admin", user: "User" }
end
```

### Panels and Organization

```ruby
def fields
  main_panel "Personal Information" do
    field :first_name, as: :text
    field :last_name, as: :text
    field :email, as: :text
  end

  panel "Preferences", description: "Customize your experience" do
    field :theme, as: :select, options: { light: "Light", dark: "Dark" }
    field :notifications, as: :boolean
  end
end
```

### Clusters for Inline Layout

```ruby
def fields
  main_panel do
    cluster do
      field :first_name, as: :text
      field :last_name, as: :text
    end
  end
end
```

### Working with Records

You can bind form fields to existing records:

```ruby
def fields
  field :first_name, record: Avo::Current.user
  field :last_name, record: Avo::Current.user
  field :email, record: Avo::Current.user
end
```

## Form Submission Handling

### Processing Form Data

```ruby
def handle
  # Access form parameters
  app_name = params[:app_name]
  maintenance_mode = params[:maintenance_mode]

  # Update application settings
  Rails.application.config.app_name = app_name
  cookies[:maintenance_mode] = maintenance_mode

  # Set success message
  flash[:notice] = "Settings updated successfully"

  # Return standard response
  default_response
end
```

### Flash Messages

```ruby
def handle
  # Informative message
  flash[:notice] = "Operation completed successfully"

  # Error message
  flash[:error] = "Something went wrong"

  # Success with timeout
  flash[:success] = { body: "Saved successfully", timeout: 3000 }

  # Warning message without dismissing
  flash[:warning] = { body: "Something went wrong", timeout: :forever }

  default_response
end
```

### Working with Models

```ruby
def handle
  # Update current user
  current_user.update(params.permit(:first_name, :last_name, :email))

  # Create new records
  Post.create(title: params[:title], body: params[:body])

  # Complex data processing
  if params[:import_data]
    ImportService.new(params[:file]).process
  end

  flash[:notice] = "Data processed successfully"
  default_response
end
```

## Complete Examples

### User Profile Settings Form

```ruby
# app/avo/forms/profile_settings.rb
class Avo::Forms::ProfileSettings < Avo::Forms::Core::Form
  self.title = "Profile Settings"
  self.description = "Update your personal information"

  def fields
    main_panel do
      cluster do
        with_options stacked: true, record: Avo::Current.user do
          field :first_name, as: :text, required: true
          field :last_name, as: :text, required: true
        end
      end

      field :email, as: :text, required: true, record: Avo::Current.user
      field :phone, as: :text, record: Avo::Current.user
    end

    panel "Preferences" do
      field :theme, as: :select,
            options: { light: "Light", dark: "Dark", auto: "Auto" },
            default: "auto"
      field :email_notifications, as: :boolean, default: true
      field :timezone, as: :select, options: ActiveSupport::TimeZone.all.map { |tz| [tz.name, tz.name] }
    end
  end

  def handle
    # Update user profile
    current_user.update(params.permit(:first_name, :last_name, :email, :phone))

    # Update preferences (assuming a preferences model)
    current_user.preferences.update(
      theme: params[:theme],
      email_notifications: params[:email_notifications],
      timezone: params[:timezone]
    )

    flash[:notice] = "Profile updated successfully"
    default_response
  end
end
```

### Application Settings Form

```ruby
# app/avo/forms/app_settings.rb
class Avo::Forms::AppSettings < Avo::Forms::Core::Form
  self.title = "Application Settings"
  self.description = "Configure global application settings"

  def fields
    main_panel do
      field :app_name, as: :text,
            default: -> { Rails.application.class.module_parent_name },
            required: true
      field :app_url, as: :text,
            default: -> { request.base_url },
            placeholder: "https://yourapp.com"
      field :maintenance_mode, as: :boolean, default: false
    end

    panel "Email Configuration" do
      field :support_email, as: :text,
            default: "support@yourapp.com",
            required: true
      field :from_email, as: :text,
            default: "noreply@yourapp.com",
            required: true
    end

    panel "Feature Flags" do
      field :enable_registrations, as: :boolean, default: true
      field :enable_api_access, as: :boolean, default: false
      field :max_file_upload_size, as: :number,
            default: 10,
            help_text: "Maximum file size in MB"
    end
  end

  def handle
    # Store in application configuration or settings model
    settings = {
      app_name: params[:app_name],
      app_url: params[:app_url],
      maintenance_mode: params[:maintenance_mode],
      support_email: params[:support_email],
      from_email: params[:from_email],
      enable_registrations: params[:enable_registrations],
      enable_api_access: params[:enable_api_access],
      max_file_upload_size: params[:max_file_upload_size]
    }

    # Update application settings (your implementation)
    ApplicationSettings.update_all(settings)

    # Or store in Rails credentials
    # Rails.application.credentials.update(settings)

    flash[:success] = {
      body: "Application settings updated successfully",
      timeout: 5000
    }
    default_response
  end
end
```

### Data Import Form

```ruby
# app/avo/forms/data_import.rb
class Avo::Forms::DataImport < Avo::Forms::Core::Form
  self.title = "Import Data"
  self.description = "Upload and import data from CSV files"

  def fields
    main_panel do
      field :import_type, as: :select,
            options: {
              users: "Users",
              products: "Products",
              orders: "Orders"
            },
            required: true
      field :csv_file, as: :file,
            required: true,
            help_text: "Select a CSV file to import"
      field :skip_header_row, as: :boolean,
            default: true,
            help_text: "Skip the first row if it contains headers"
    end

    panel "Import Options" do
      field :update_existing, as: :boolean,
            default: false,
            help_text: "Update existing records if found"
      field :send_notification, as: :boolean,
            default: true,
            help_text: "Send email notification when import completes"
    end
  end

  def handle
    import_type = params[:import_type]
    csv_file = params[:csv_file]
    options = {
      skip_header_row: params[:skip_header_row],
      update_existing: params[:update_existing]
    }

    # Process the import
    begin
      importer = DataImporter.new(import_type, csv_file, options)
      result = importer.process

      if params[:send_notification]
        ImportNotificationMailer.import_completed(current_user, result).deliver_later
      end

      flash[:success] = {
        body: "Import completed: #{result[:imported]} records imported, #{result[:skipped]} skipped",
        timeout: 10000
      }
    rescue => e
      flash[:error] = "Import failed: #{e.message}"
    end

    default_response
  end
end
```

## Best Practices

**Keep forms focused**: Each form should handle a specific set of related functionality rather than trying to do everything.

**Use descriptive titles and descriptions**: Help users understand what the form does and what data is expected.

**Organize with panels**: Group related fields together using panels for better user experience.

**Validate input**: Always validate and sanitize form input in your handle method.

**Provide feedback**: Use flash messages to inform users about the results of their actions.

**Handle errors gracefully**: Wrap potentially failing operations in begin/rescue blocks.

**Use default values**: Provide sensible defaults for form fields when possible.

**Consider async processing**: For long-running operations, consider using background jobs and provide appropriate feedback to users.