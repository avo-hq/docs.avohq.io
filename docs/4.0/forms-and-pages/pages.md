---
license: add_on
betaStatus: Beta
outline: [2,3]
---

# Pages

Avo provides a powerful page system that enables you to build structured interfaces with nested content organization. Pages in Avo work similarly to resources but are designed for displaying and managing forms and sub-pages rather than database records.

## Hierarchy

Pages are organized in a hierarchical structure that follows a specific pattern:

### Page Structure

1. **Main Pages**

   Example: `Avo::Pages::Settings`

   - Always 1 level deep in the namespace
   - Act as containers for related sub-pages
   - Have a navigation entry on the left sidebar menu (if `self.menu_entry` is `true`)
   - When accessed directly, redirect to the default sub-page if one is configured

2. **Sub-Pages**

   Example: `Avo::Pages::Settings::General`, `Avo::Pages::Settings::Notifications`

   - Always 2 or more levels deep in the namespace
   - Contain the actual forms and content
   - Are accessible through the parent page's navigation

This hierarchical organization allows you to create structured interfaces where users can navigate through different sections and manage various settings or configurations.

### Navigation Behavior

When a user visits a main page that has sub-pages:

1. If a default sub-page is configured, the user is automatically redirected to it
2. If no default sub-page is configured, the main page is displayed with its own forms (if any)
3. Sub-pages are displayed in a sidebar navigation for easy access

## Generating Pages

The generator usage is documented in the [Generators](./generator.html#page-generator) page.

## Page Configuration Options

Pages have several class attributes that you can configure to customize their behavior and appearance.

<Option name="self.title" headingSize=3>

Sets the display title for the page.

```ruby{3}
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  self.title = "Application Settings"
end
```
</Option>

<Option name="self.description" headingSize=3>

Provides a description that appears below the page title.

```ruby{3}
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  self.description = "Manage your application settings and preferences"
end
```

</Option>

<Option name="self.navigation_label" headingSize=3>

Customizes the label displayed in the Avo menu entry and page sidebar menu entry.

**Default behavior:**
- If `navigation_label` is not set, it defaults to the `title`
- If `title` is not set, it takes the last namespace from the class and humanizes it

```ruby{3}
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  self.navigation_label = "App Configuration"
end
```

This is particularly useful when you want different text in navigation menus than what's displayed as the page title, or when you want to shorten long titles for better menu presentation.

</Option>


## Page Methods

<Option name="def navigation" headingSize=3>


Define sub-pages that belong to this page. This method is used to register child pages and configure their relationship to the parent.

:::warning Boot-time Parsing
The `def navigation` method is parsed only once during application boot. Do not use conditional logic (if/else statements) or dynamic content inside this method, as it will not be re-evaluated during runtime.
:::

```ruby{3-5}
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  def navigation
    # ...
  end
end
```

</Option>

<Option name="page" headingSize=3>

This method is used to register child pages that belong to this page.

It expects the child page class as the first argument.

```ruby
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  def navigation
    page Avo::Pages::Settings::General # [!code focus]
  end
end
```

When defining sub-pages, you can pass additional options:

<div class="pl-8">

#### `default`

Marks a sub-page as the default one to display when the main page is accessed.

**Default value**: `false`

**Possible values**: `true` or `false`

```ruby
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  def navigation
    page Avo::Pages::Settings::General, default: true # [!code focus]
    page Avo::Pages::Settings::Notifications
  end
end
```

</div>

</Option>

<Option name="def content" headingSize=3>

Define forms that should be displayed on this page. Forms are the primary way users interact with your page's functionality.

:::warning Boot-time Parsing
The `def content` method is parsed only once during application boot. Do not use conditional logic (if/else statements) or dynamic content inside this method, as it will not be re-evaluated during runtime.
:::

```ruby{3-5}
# app/avo/pages/settings/general.rb
class Avo::Pages::Settings::General < Avo::Forms::Core::Page
  def content
    # ...
  end
end
```

You can define multiple forms on a single page, and they will be displayed in the order you declare them.
</Option>

<Option name="form" headingSize=3>

This method is used to register forms that should be displayed on this page.

It expects the form class as the first argument.

```ruby
# app/avo/pages/settings/general.rb
class Avo::Pages::Settings::General < Avo::Forms::Core::Page
  def content
    form Avo::Forms::Settings::AppSettings # [!code focus]
    form Avo::Forms::Settings::ProfileSettings # [!code focus]
  end
end
```


</Option>

## Complete Example

Here's a complete example showing a settings page with multiple sub-pages:

```ruby
# Main settings page
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  self.title = "Settings"
  self.description = "Manage your application settings"
  self.navigation_label = "App Settings"

  def navigation
    page Avo::Pages::Settings::General, default: true
    page Avo::Pages::Settings::Notifications
    page Avo::Pages::Settings::Integrations
    page Avo::Pages::Settings::Security
  end
end
```

```ruby
# General settings sub-page
# app/avo/pages/settings/general.rb
class Avo::Pages::Settings::General < Avo::Forms::Core::Page
  self.title = "General Settings"
  self.description = "Basic application configuration"

  def content
    form Avo::Forms::Settings::AppSettings
    form Avo::Forms::Settings::CompanyInfo
  end
end
```

```ruby
# Notifications sub-page
# app/avo/pages/settings/notifications.rb
class Avo::Pages::Settings::Notifications < Avo::Forms::Core::Page
  self.title = "Notifications"
  self.description = "Configure notification preferences"

  def content
    form Avo::Forms::Settings::EmailNotifications
    form Avo::Forms::Settings::SlackIntegration
  end
end
```

## Adding Pages to the Menu

<LicenseReq license="pro"/>

To make your pages accessible through Avo's main navigation, add them to your Avo configuration:

```ruby{9-10,12,14}
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = -> {
    section "Resources", icon: "avo/resources" do
      all_resources
    end

    section "Configuration", icon: "cog" do
      page Avo::Pages::Settings, icon: "adjustments"
      page Avo::Pages::SystemHealth, icon: "heart"

      # Or

      all_pages
    end
  }
end
```


## Best Practices

**Keep the hierarchy shallow**: While you can nest pages deeply, it's best to keep the structure simple with main pages and one level of sub-pages.

**Set default sub-pages**: If your main page primarily serves as a container, always set a default sub-page to improve user experience.

**Use descriptive titles and descriptions**: Help users understand what each page contains and what actions they can perform.

**Customize navigation labels**: Use `navigation_label` to provide concise, menu-friendly names that may differ from your page titles, especially for long or technical titles.

**Group related functionality**: Use the page hierarchy to logically group related forms and settings.
