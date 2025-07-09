---
license: add_on
add_on: forms_feature
betaStatus: Beta
outline: [2,3]
---

# Guides and Tutorials

This section provides practical guidance and best practices for common scenarios when working with Avo Forms and Pages.

## Form Definition Approaches

When building forms in Avo, there are several approaches for organizing your form code. The recommended approach is to use the default generator approach. But in this guide we'll cover other approach as well.

### Approach 1: Default Generator Approach

Use the generator to create standalone form files in the `app/avo/forms/` directory.

```bash
rails generate avo:form user_profiles
```

This creates:

```ruby
# app/avo/forms/user_profiles.rb
class Avo::Forms::UserProfiles < Avo::Forms::Core::Form
  self.title = "User Profiles"
  self.description = "Manage your user profiles"

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

Then reference it in your page:

```ruby
# app/avo/pages/settings/profiles.rb
class Avo::Pages::Settings::Profiles < Avo::Forms::Core::Page
  def content
    form Avo::Forms::UserProfiles
  end
end
```

Or render it in a custom component:

```ruby
<%= render Avo::Forms::UserProfiles.new.component %>
```



### Approach 2: Inline Form Definitions

You can define forms directly within page classes using the page's namespace.

```ruby
# app/avo/pages/settings/integrations.rb
class Avo::Pages::Settings::Integrations < Avo::Forms::Core::Page
  self.title = "Integrations"
  self.description = "Manage your integrations"

  def content
    form ApiConfiguration
  end

  # Form defined inline within the page class
  class ApiConfiguration < Avo::Forms::Core::Form
    self.title = "API Configuration"
    self.description = "Configure your API settings"

    def fields
      field :api_key, as: :text, required: true
      field :api_endpoint, as: :text
      field :webhook_url, as: :text
    end

    def handle
      flash[:success] = "API Configuration updated successfully"
      default_response
    end
  end
end
```

:::warning Namespace Confusion
When defining forms inline within page classes, it's not immediately clear that `Avo::Pages::Settings::Integrations::ApiConfiguration` is a form class rather than page. This can lead to confusion about the class's purpose and make code navigation more difficult. **This strategy is not recommended when you want to reuse the form in other pages or components.**
:::

## When to Use Each Approach

**Approach 1 (Default Generator)**: Good starting point for most forms. Easy to generate and maintain.

**Approach 2 (Inline)**: Best for simple, page-specific forms that won't be reused elsewhere.
