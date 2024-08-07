---
feedbackId: 1073
version: '2.10'
license: pro
demoVideo: https://youtu.be/B1Y-Z-R-Ys8?t=175
betaStatus: Open beta
---

# Tabs

Once your Avo resources reach a certain level of complexity, you might feel the need to better organize the fields, associations, and resource tools into groups. You can already use the [`heading`](fields/heading) to separate the fields inside a panel, but maybe you'd like to do more.

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

<Image src="/assets/img/tabs-and-panels/tabs.png" width="1024" height="640" alt="Avo tabs" />

To use tabs, you need to open a `tabs` group block. Next, you add your `tab` block where you add fields and panels like you're used to on resource root. Most fields like `text`, `number`, `gravatar`, `date`, etc. need to be placed in a `panel`. However, the `has_one`, `has_many`, and `has_and_belongs_to_many` have their own panels, and they don't require a `panel` or a `tab`.

The tab `name` is mandatory is what will be displayed on the tab switcher. The tab `description` is what will be displayed in the tooltip on hover.

<Image src="/assets/img/tabs-and-panels/tab-name-description.png" width="640" height="211" alt="Avo tab name and description" />

## Tabs on Show view

Tabs have more than an aesthetic function. They have a performance function too. On the <Show /> page, if you have a lot of `has_many` type of fields or tools, they won't load right away, making it a bit more lightweight for your Rails app. Instead, they will lazy-load only when they are displayed.

## Tabs on Edit view

All visibility rules still apply on <Edit />, meaning that `has_*` fields will be hidden by default. However, you can enable them by adding `show_on: :edit`. All other fields will be loaded and hidden on page load. This way, when you submit a form, if you have validation rules in place requiring a field that's in a hidden tab, it will be present on the page on submit-time.

## Durable and "Bookmarkable"

Tabs remain durable within views, meaning that when switch between views, each tab group retains the selected tab. This ensures a consistent UX, allowing for seamless navigation without losing context.

Moreover, you have the ability to bookmark a link with a personalized tab selection.

This functionalities relies on the unique tab group ID. To take full advantage of this feature, it's important to assign a unique ID to each tab group defined in your application.

```ruby {1}
tabs id: :some_random_uniq_id do
  field :posts, as: :has_many, show_on: :edit
end
```
<!-- The panel has a few parts available -->


<!-- <img :src="('/assets/img/tabs-and-panels/panel-top.png')" alt="Avo Panels" class="border mb-4" /> -->
<!-- <img :src="('/assets/img/tabs-and-panels/panel-bottom.png')" alt="Avo Panels" class="border mb-4" /> -->


## Display counter indicator on tabs switcher

Check [this recipe](guides/tabs-counter-indicator.html) on how to enhance your tabs switcher with a counter for each association tab.

## Visibility control

<VersionReq version="3.10.10" />

Both `tabs` and individual `tab` components support a `visible` option that allows you to dynamically control their visibility based on certain conditions. For example, you might want to hide a tab if the user doesn't have the necessary permissions to view its content.

<Option name="`visible`">

The `visible` option allows you to control the visibility of either a group of tabs or an individual tab. It can be a `boolean` or a lambda.

#### Example

```ruby
tabs visible: -> { resource.record.enabled? } do
  tab name: "General Information" do
    panel do
      field :name, as: :text
      field :email, as: :text
    end
  end
  tab "Admin Information", visible: -> { current_user.is_admin? } do
    panel do
      field :role, as: :text
      field :permissions, as: :text
    end
  end
end
```

In this example:
- The entire group of tabs is only visible if the record is enabled (`resource.record.enabled?`).
- Within this group, the "General Information" tab is always visible when the tabs are shown.
- The "Admin Information" tab is only visible for admin records (`resource.record.admin?`).

</Option>

