---
license: community
description: "The Preview field adds a tiny icon to each row on the Index view that, when hovered, it will display a preview popup with more information regarding that record."
fieldTags: [display]
outline: [2, 3]
---

# Preview

The `Preview` field adds an icon to each row on the <Index /> view. Hover over it to see a popup with selected fields from that record, or click it to open the record's <Show /> view.

```ruby
# app/avo/resources/team.rb
class Avo::Resources::Team < Avo::BaseResource
  def fields
    field :preview, as: :preview
    field :name, as: :text, show_on: :preview
  end
end
```

By default, the preview column has a blank header and no fields are selected for the popup. Add `show_on: :preview` to each field you want to include.

<Image src="/assets/img/4_0/fields/preview/index.webm" dark-src="/assets/img/4_0/fields/preview/index-dark.webm" width="900" height="438" alt="An Avo Teams index table where hovering the preview icon on a row opens a popup showing that record's preview fields." prompt="gif with the the preview" />

## Define the fields

The fields shown in the preview popup are configured similarly to how you [configure the visibility in the different views](./../resources#views).

Add [`show_on: :preview`](../field-options.html#show_on) to include a field in the popup without changing its visibility in other views. Combine it with `hide_on: :index` when the value should appear in the popup but not as a table column.

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

## Label the preview column

If you want a heading above the preview icons, set [`name`](../field-options.html#name) on the preview field:

```ruby
# app/avo/resources/team.rb
field :preview, as: :preview, name: "Preview"
```

## Control who can preview records {#authorization}

The preview request authorization is controlled with the [`preview?` policy method](./../authorization-api.html#preview).

For shared field settings, see [Common field options](../field-options.html).
