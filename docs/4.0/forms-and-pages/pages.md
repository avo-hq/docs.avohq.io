---
license: add_on
add_on_link: "https://avohq.io/pricing-4?add_ons[]=forms"
betaStatus: Beta
outline: [2, 3]
api_docs: ./pages-api.html
---

# Pages

Pages give you structured, hierarchical screens for organizing [forms](./forms.html) and sub-pages — the place to build settings areas, configuration sections, and other non-resource interfaces. A page works like a resource, but instead of records it presents forms and child pages.

Every page is a class under `app/avo/pages/` that inherits from `Avo::Forms::Core::Page`:

```ruby
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  self.title = "Settings"

  def navigation
    page Avo::Pages::Settings::General, default: true
  end
end
```

With nothing but a class name, a page already has a title and URL derived from its namespace. You add structure by declaring a [`navigation`](./pages-api.html#navigation) of sub-pages, or a [`content`](./pages-api.html#content) of forms — or both.

## How pages are organized

Pages form a shallow hierarchy based on their namespace depth:

- **Main pages** sit one level under `Avo::Pages` (e.g. `Avo::Pages::Settings`). They act as containers, get a left-sidebar menu entry, and can declare a [`navigation`](./pages-api.html#navigation) of children.
- **Sub-pages** are nested deeper (e.g. `Avo::Pages::Settings::General`). They hold the actual [forms](./forms.html) and are reached through their parent's navigation.

When a user opens a main page, Avo redirects to its [`default`](./pages-api.html#page) sub-page if one is set; otherwise it shows the main page's own content. Sub-pages appear in a sidebar for easy switching.

## Generate a page

Use the page generator to scaffold the class. Its usage is documented in the [Generators](./overview.html#page-generator) section.

## Build the navigation

Declare a main page's children inside [`navigation`](./pages-api.html#navigation). There are three ways to register an entry, and you can mix them freely.

Reference an existing page class — the common case — and optionally mark one as the [`default`](./pages-api.html#page):

```ruby
# app/avo/pages/settings.rb
class Avo::Pages::Settings < Avo::Forms::Core::Page
  def navigation
    page Avo::Pages::Settings::General, default: true
    page Avo::Pages::Settings::Security
  end
end
```

For a simple section, skip the file and declare a [virtual page](./pages-api.html#page) inline with its content:

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

To surface a single form without a page of its own, register it directly with [`form`](./pages-api.html#form) — it becomes a navigation entry that shows the form inline:

```ruby
def navigation
  form Avo::Forms::Profiles
end
```

:::warning Parsed once at boot
`navigation` is evaluated once during application boot, so keep it static — no `if`/`else` or other runtime logic inside it. The same applies to [`content`](./pages-api.html#content).
:::

## Put forms on a page

A sub-page shows its forms by declaring them in [`content`](./pages-api.html#content) with [`form`](./pages-api.html#form). They render in the order you list them.

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

Each form renders with its own header (title and description). If you're already on a page that provides context, drop the header for that placement with `show_header: false`:

```ruby
def content
  form Avo::Forms::Settings::AppSettings, show_header: false
end
```

## Name the menu entry

By default a page's menu label is its [`title`](./pages-api.html#self.title). Set [`navigation_label`](./pages-api.html#self.navigation_label) when you want a shorter or different label in the menu than the title shown on the page.

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

A settings area with a default sub-page, an inline form, and a virtual page:

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
    form Avo::Forms::Settings::AppSettings
    form Avo::Forms::Settings::CompanyInfo
  end
end
```

## Best practices

- **Keep the hierarchy shallow** — a main page plus one level of sub-pages covers most cases.
- **Set a default sub-page** when the main page is mainly a container, so it lands somewhere useful.
- **Pick the right page type**: class-based pages for anything with custom logic or several forms; virtual pages with forms for a single-form section; virtual pages with content to group related forms without extra files.
- **Use `navigation_label`** to keep long titles readable in the menu.

## Related

- [Forms](./forms.html) — build the forms you register on a page with `content` and `form`.
- [Pages API](./pages-api.html) — the full reference for every page attribute and method.
- [Overview](./overview.html) — installation, the generators, and a quick start.
