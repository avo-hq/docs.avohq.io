# Generators

Avo Forms provides generators to help you quickly create forms and pages.

## Form Generator

```bash
rails generate avo:form your_form_name
```

This will create a new form file at `app/avo/forms/your_form_name.rb` with the following structure:

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

## Page Generator

The page generator creates a new page class.

```bash
rails generate avo:page your_page_name
```

This will create a new page file at `app/avo/pages/your_page_name.rb` with the following structure:

```ruby
class Avo::Pages::YourPageName < Avo::Forms::Core::Page
  self.title = "Your Page Name"
  self.description = "A page for your page name"

  def content
    # form Avo::Forms::AnyFormClass
  end

  def navigation
    # page Avo::Pages::AnySubPageClass
  end
end
```

:::warning Boot-time Parsing
The `def content` and `def navigation` methods are parsed only once during application boot. Do not use conditional logic (if/else statements) or dynamic content inside these methods, as they will not be re-evaluated during runtime.
:::

:::tip
To create a sub-page, you need to create a page first. The sub-page need to be namespaced under the parent page.

Read more about the [Page Hierarchy](./pages.html#hierarchy).

Example:

```ruby
# app/avo/pages/parent_page.rb
class Avo::Pages::ParentPage < Avo::Forms::Core::Page
  self.title = "Parent Page"
  self.description = "A page for parent page"

  def navigation
    page Avo::Pages::ParentPage::SubPage
  end
end
```
<br>

```ruby
# app/avo/pages/parent_page/sub_page.rb
class Avo::Pages::ParentPage::SubPage < Avo::Forms::Core::Page
  self.title = "Sub Page"
  self.description = "A page for sub page"
end
```
:::

## Best Practices

1. Use descriptive names for your forms and pages
2. Keep form fields focused and relevant to their purpose
3. Organize related forms and pages together
4. Use sub-pages to create a logical navigation structure
5. Add appropriate descriptions to help users understand the purpose of each form and page
