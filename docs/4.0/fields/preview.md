---
license: community
description: "The Preview field adds a tiny icon to each row on the Index view that, when hovered, it will display a preview popup with more information regarding that record."
fieldTags: [display]
---

# Preview

The `Preview` field adds a tiny icon to each row on the <Index /> view that, when hovered, it will display a preview popup with more information regarding that record.

<Image src="/assets/img/4_0/fields/preview/index.webm" dark-src="/assets/img/4_0/fields/preview/index-dark.webm" width="900" height="438" alt="An Avo Teams index table where hovering the preview icon on a row opens a popup showing that record's preview fields." prompt="gif with the the preview" />

```ruby
field :preview, as: :preview
```

## Define the fields

The fields shown in the preview popup are configured similarly to how you [configure the visibility in the different views](./../resources#views).

When you want to display a field in the preview popup simply call the `show_on: :preview` option on the field.

```ruby{4,8,12,15}
# app/avo/resources/team.rb
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

<Image src="/assets/img/4_0/record-previews/preview-field.webp" dark-src="/assets/img/4_0/record-previews/preview-field-dark.webp" width="1419" height="467" alt="Record preview popover open over the Team index table, triggered from a row" />

## Authorization

The preview request authorization is controlled with the [`preview?` policy method](./../authorization.html#preview).
