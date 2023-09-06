---
feedbackId: 1073
version: '2.10'
license: pro
demoVideo: https://youtu.be/B1Y-Z-R-Ys8?t=175
betaStatus: Open beta
---

# Tabs and panels

Once your Avo resources reach a certain level of complexity, you might feel the need to better organize the fields, associations, and resource tools into groups. You can already use the [`heading`](fields/heading) to separate the fields inside a panel, but maybe you'd like to do more.

## Panels

<img :src="('/assets/img/tabs-and-panels/panel.png')" alt="Panel" class="border mb-4" />

First, we should talk a bit about panels. They are the backbone of Avo's display infrastructure. Most of the information that's on display is wrapped inside a panel. They help to give Avo that uniform design on every page. They are also available as a view component `Avo::PanelComponent` for custom tools, and you can make your own pages using it.

When using the fields DSL for resources, all fields declared in the root will be grouped into a "main" panel, but you can add your panels.

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true
    field :email, as: :text, name: "User Email", required: true

    panel name: "User information", description: "Some information about this user" do
      field :first_name, as: :text, required: true, placeholder: "John"
      field :last_name, as: :text, required: true, placeholder: "Doe"
      field :active, as: :boolean, name: "Is active", show_on: :show
    end
  end
end
```
<img :src="('/assets/img/tabs-and-panels/root-and-panel.png')" alt="Root fields and panel fields" class="border mb-4" />

You can customize the panel `name` and panel `description`.

### Index view fields

By default, only the fields declared in the root will be visible on the `Index` view.

```ruby{3-7}
class Avo::Resources::User < Avo::BaseResource
  def fields
    # Only these fields will be visible on the `Index` view
    field :id, as: :id, link_to_record: true
    field :email, as: :text, name: "User Email", required: true
    field :name, as: :text, only_on: :index do
      "#{record.first_name} #{record.last_name}"
    end

    # These fields will be hidden on the `Index` view
    panel name: "User information", description: "Some information about this user" do
      field :first_name, as: :text, required: true, placeholder: "John"
      field :last_name, as: :text, required: true, placeholder: "Doe"
      field :active, as: :boolean, name: "Is active", show_on: :show
    end
  end
end
```

<img :src="('/assets/img/tabs-and-panels/index-view.png')" alt="Index view" class="border mb-4" />

## Tabs

Tabs are a new layer of abstraction over panels. They enable you to group panels and tools together under a single pavilion and toggle between them.

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true
    field :email, as: :text, name: "User Email", required: true

    tabs do
      tab "User information", description: "Some information about this user" do
        panel do
          field :first_name, as: :text, required: true, placeholder: "John"
          field :last_name, as: :text, required: true, placeholder: "Doe"
          field :active, as: :boolean, name: "Is active", show_on: :show
        end
      end

      field :teams, as: :has_and_belongs_to_many
      field :people, as: :has_many
      field :spouses, as: :has_many
      field :projects, as: :has_and_belongs_to_many
    end
  end
end
```

<img :src="('/assets/img/tabs-and-panels/tabs.png')" alt="Avo tabs" class="border mb-4" />

To use tabs, you need to open a `tabs` group block. Next, you add your `tab` block where you add fields and panels like you're used to on resource root. Most fields like `text`, `number`, `gravatar`, `date`, etc. need to be placed in a `panel`. However, the `has_one`, `has_many`, and `has_and_belongs_to_many` have their own panels, and they don't require a `panel` or a `tab`.

The tab `name` is mandatory is what will be displayed on the tab switcher. The tab `description` is what will be displayed in the tooltip on hover.

<img :src="('/assets/img/tabs-and-panels/tab-name-description.png')" alt="Avo tab name and description" class="border mb-4" />

### Tabs on Show view

Tabs have more than an aesthetic function. They have a performance function too. On the `Show` page, if you have a lot of `has_many` type of fields or tools, they won't load right away, making it a bit more lightweight for your Rails app. Instead, they will lazy-load only when they are displayed.

### Tabs on Edit view

All visibility rules still apply on' Edit', meaning that `has_*` fields will be hidden by default. However, you can enable them by adding `show_on: :edit`. All other fields will be loaded and hidden on page load. This way, when you submit a form, if you have validation rules in place requiring a field that's in a hidden tab, it will be present on the page on submit-time.

## Display as pills

<div class="space-x-2">
  <VersionReq version="2.14" class="mt-2" />
  <DemoVideo demo-video="https://youtu.be/peKt90XhdOg?t=710" />
</div>

When you have a lot of tabs in one group the tab switcher will overflow on the right-hand side. It will become scrollable to allow your users to get to the last tabs in the group.

![](/assets/img/tabs-and-panels/scrollable-tabs.gif)

If you want to be able to see all your tabs in one group at a glance you may change the display to `:pills`. The pills will collapse and won't overflow off the page.

![](/assets/img/tabs-and-panels/tabs-as-pills.gif)

### Display all tabs as pills

If you want to display all tabs as pills update your initializer's `tabs_style`.

```ruby
Avo.configure do |config|
  config.tabs_style = :pills
end
```

### Display only some tabs as pills

If you only need to display certain tabs as pills you can do that using the `style` option.

```ruby
tabs style: :pills do
  # tabs go here
end
```

<!-- The panel has a few parts available -->


<!-- <img :src="('/assets/img/tabs-and-panels/panel-top.png')" alt="Avo Panels" class="border mb-4" /> -->
<!-- <img :src="('/assets/img/tabs-and-panels/panel-bottom.png')" alt="Avo Panels" class="border mb-4" /> -->


