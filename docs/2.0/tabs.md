# Tabs and panels

[[toc]]

**Available from `v2.10`**

<div class="rounded-md bg-blue-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-blue-700">
        Tabs and panels are a <a href="https://avohq.io/purchase/pro" target="_blank" class="underline">Pro</a> feature
      </div>
    </div>
  </div>
</div>

<div class="flex flex-grow-0 space-x-2 mt-2">
  <div class="flex flex-grow-0 rounded-md border border-blue-500 py-1 px-4" title="This feature is in public beta">
    Public Beta
  </div>

  <a href="https://github.com/avo-hq/avo/discussions/1073" target="_blank" class="rounded bg-purple-600 hover:bg-purple-500 text-white no-underline px-2 py-1 inline leading-none mt-2">
    Provide feedback
  </a>

  <a href="https://youtu.be/B1Y-Z-R-Ys8?t=175" target="_blank" class="rounded bg-green-600 hover:bg-green-500 text-white no-underline px-2 py-1 inline leading-none mt-2">
    Demo video
  </a>
</div>

Once your Avo resources reach a certain level of complexity you feel the need to better organize them into groups. You can already use the [`heading`](fields.html#heading) to separate the fields inside a panel but maybe you'd like to do more.

## Panels

<img :src="('/assets/img/tabs-and-panels/panel.png')" alt="Panel" class="border mb-4" />

First we should talk a bit about panels. They are the backbone of Avo's display infrastructure. Most of the information that's on display is wrapped inside a panel. They help to give Avo that uniform design on every page. They are available as a view component too for custom tools and you can make your own pages using the same component.

When using the fields DSL for resources, all fields declared in the root will be grouped into a "main" panel, but you can add your own panels.

```ruby
class UserResource < Avo::BaseResource
  field :id, as: :id, link_to_resource: true
  field :email, as: :text, name: "User Email", required: true

  panel name: "User information", description: "Some information about this user" do
    field :first_name, as: :text, required: true, placeholder: "John"
    field :last_name, as: :text, required: true, placeholder: "Doe"
    field :active, as: :boolean, name: "Is active", show_on: :show
  end
end
```
<img :src="('/assets/img/tabs-and-panels/root-and-panel.png')" alt="Root fields and panel fields" class="border mb-4" />

You can customize the panel `name` and panel `description`.

### Index view fields

By default only the fields declared in the root will be visible on the `Index` view.

```ruby{3-7}
class UserResource < Avo::BaseResource
  # Only these fields will be visible on the `Index` view
  field :id, as: :id, link_to_resource: true
  field :email, as: :text, name: "User Email", required: true
  field :name, as: :text, only_on: :index do |model|
    "#{model.first_name} #{model.last_name}"
  end

  # These fields will be hidden on the `Index` view
  panel name: "User information", description: "Some information about this user" do
    field :first_name, as: :text, required: true, placeholder: "John"
    field :last_name, as: :text, required: true, placeholder: "Doe"
    field :active, as: :boolean, name: "Is active", show_on: :show
  end
end
```

<img :src="('/assets/img/tabs-and-panels/index-view.png')" alt="Index view" class="border mb-4" />

## Tabs

Tabs are a new layer of abstraction over panels. They enable you to group panels and tools together under a single pavilion and toggle between them.

```ruby
class UserResource < Avo::BaseResource
  field :id, as: :id, link_to_resource: true
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
```

<img :src="('/assets/img/tabs-and-panels/tabs.png')" alt="Avo tabs" class="border mb-4" />

To use tabs you open a tabs group block using `tabs`. Next you add your `tab` block where you add fields and panels like you're used to on resource root. Most fields like `text`, `number`, `gravatar`, `date`, etc. need to be placed in a `panel`. The `has_one`, `has_many`, and `has_and_belongs_to_many` have their own panels and they don't require a `panel` or a `tab`.

The tab `name` is mandatory is what will be displayed on the tab switcher. The tab `description` is what will be displayed in the tooltip on hover.

<img :src="('/assets/img/tabs-and-panels/tab-name-description.png')" alt="Avo tab name and description" class="border mb-4" />

### Tabs on Show view

Tabs have more than an aesthetic function. They have a performance function too. On the `Show` page, if you have a lot of `has_many` type of fields or tools, they won't load right away making it a bit more lightweight for your Rails app. They will lazy-load only when they are displayed.

### Tabs on Edit view

On `Edit`, all visibility rules still apply, meaning that `has_*` fields will be hidden by default. You can enable them by adding `show_on: :edit`. All other fields will be loaded and hidden on page load. This way when you submit a form, if you have validation rules in place requiring a field that's in a hidden tab, it will actually be present on the page on submit-time.

<!-- The panel has a few parts available -->


<!-- <img :src="('/assets/img/tabs-and-panels/panel-top.png')" alt="Avo Panels" class="border mb-4" /> -->
<!-- <img :src="('/assets/img/tabs-and-panels/panel-bottom.png')" alt="Avo Panels" class="border mb-4" /> -->


