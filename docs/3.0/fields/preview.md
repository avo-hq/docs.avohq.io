---
version: '3.0'
license: community
---

# Preview

The `Preview` field adds a tiny icon to each row on the <Index /> view that, when hovered, it will display a preview popup with more information regarding that record.

![](/assets/img/fields/preview/preview.gif)

```ruby
field :preview, as: :preview
```

## Define the fields

The fields shown in the preview popup are configured similarly to how you [configure the visibility in the different views](./../resources#views).

When you want to display a field in the peview popup simply call the `show_on :preview` option on the field.

```ruby
  field :name, as: :text, show_on :preview
```
