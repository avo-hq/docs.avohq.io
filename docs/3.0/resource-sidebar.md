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

Using the `sidebar` block on a resource you may declare fields the same way you would do on the root level.

```ruby
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true
    field :first_name, as: :text, placeholder: "John"
    field :last_name, as: :text, placeholder: "Doe"

    sidebar do
      field :email, as: :gravatar, link_to_record: true, as_avatar: :circle, only_on: :show
      field :active, as: :boolean, name: "Is active", only_on: :show
    end
  end
end
```

![](/assets/img/resource-sidebar/sidebar.jpg)

:::info
For this initial iteration you may use the `field` and `heading` helpers.
:::

The fields will be stacked in a similar way in a narrower area on the side of the main panel. You may notice that inside each field, the tabel and value zones are also stacked one on top of the other to allow for a larger area to display the field value.
