---
version: '2.17'
license: pro
feedbackId: 1073
demoVideo: https://youtu.be/3udJOcc0Jfo
---

# Resource Sidebar

By default, all declared fields are going to be stacked vertically in the main area. But there are some fields with information that needs to be displayed in a smaller area, like boolean, date, and badge fields.
Those fields don't need all that horizontal space and can probably be displayed in a different space.
That's we created the **resource sidebar**.

## Adding fields to the sidebar

Using the `sidebar` block on a resource you may declare fields the same way you would do on the root level. Notice that the sidebar should be declared inside a panel. Each resource can have several panels or main panels and each panel can have it's own sidebars.

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    main_panel do
      field :id, as: :id, link_to_record: true
      field :first_name, as: :text, placeholder: "John"
      field :last_name, as: :text, placeholder: "Doe"

      sidebar do
        field :email, as: :gravatar, link_to_record: true, only_on: :show
        field :active, as: :boolean, name: "Is active", only_on: :show
      end
    end
  end
end
```

![](/assets/img/resource-sidebar/sidebar.jpg)


The fields will be stacked in a similar way in a narrower area on the side of the main panel. You may notice that inside each field, the tabel and value zones are also stacked one on top of the other to allow for a larger area to display the field value.

:::option panel_wrapper
The `panel_wrapper` it's helpful when you want to render a custom tool inside a sidebar and you don't want to apply the `white_panel_classes` to it

```ruby
sidebar panel_wrapper: false do
  tool Avo::ResourceTools::SidebarTool
end
```
:::
