---
license: pro
---

# Record previews

:::warning
This section is a work in progress.
:::

To use record previews add the `preview` field on your resource and add `show_on: :preview` to the fields you'd like to have visible on the preview popover.


```ruby{3,7,11,14}
class Avo::Resources::Team < Avo::BaseResource
  def fields
    field :preview, as: :preview
    field :name,
     as: :text,
     sortable: true,
     show_on: :preview
    field :color,
      as: Avo::Fields::ColorPickerField,
      hide_on: :index,
      show_on: :preview
    field :description,
      as: :textarea,
      show_on: :preview
  end
end
```
![](/assets/img/3_0/record-previews/preview-field.png)
