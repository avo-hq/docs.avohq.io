---
license: community
---

# Preview

The `Preview` field adds a tiny icon to each row on the <Index /> view that, when hovered, it will display a preview popup with more information regarding that record.

<Image src="/assets/img/4_0/fields/preview/index.webm" dark-src="/assets/img/4_0/fields/preview/index-dark.webm" width="900" height="438" alt="An Avo Teams index table where hovering the preview icon on a row opens a popup showing that record's preview fields." prompt="gif with the the preview" />

```ruby
field :preview, as: :preview
```

## Define the fields

The fields shown in the preview popup are configured similarly to how you [configure the visibility in the different views](./../resources#views).

When you want to display a field in the preview popup simply call the `show_on :preview` option on the field.

```ruby
  field :name, as: :text, show_on :preview
```

## Authorization

The preview request authorization is controlled with the [`preview?` policy method](./../authorization.html#preview).
