---
license: community
outline: [2, 3]
guide: ./preview.html
prev:
  text: "Preview"
  link: "./preview.html"
next: false
---

# Preview API

Reference for the Preview field's declaration and behavior. For tasks and examples, see the [Preview guide](./preview.html).

Declare the field in your resource's `fields` method, for example in `app/avo/resources/team.rb`:

```ruby
field :preview, as: :preview
```

## Declaration and defaults

`as: :preview` resolves to `Avo::Fields::PreviewField`. The field adds a record-preview trigger rather than displaying a model attribute. It does not require a `preview` database column or model method.

| Setting | Default behavior |
| --- | --- |
| Table header | Blank unless a present `name` is explicitly supplied. |
| Index cell | A zoom-scan icon linking to the record's Show view. Hovering fetches the record preview. |
| Popup fields | No fields are selected by default. Selection uses the shared field visibility settings for `:preview`. |

## Views and value contract

| View | Behavior |
| --- | --- |
| Index | Renders the preview icon and link. The field's value is not displayed. |
| Show | No built-in Preview field component; falls back to a blank component. |
| New / Edit | No built-in Preview form component; no input is rendered. |
| Preview popup | Selected fields render using their Show components, with stacked, compact presentation. |

The icon and preview URL come from the resource and record, not from the Preview field's value. A computed value or value formatter on the Preview field does not supply the popup content. Each field selected for the popup resolves its own value in the Show view context.

The preview request checks the record's [`preview?` policy method](../authorization-api.html#preview). An unauthorized request renders an authorization message instead of the selected fields.

## Options

Preview defines no field-specific options. Its table header uses the shared [`name`](../field-options-api.html#name) option when present and otherwise remains blank, rather than deriving a label from the field ID.

Popup fields are selected through [`show_on`](../field-options-api.html#show_on), [`only_on`](../field-options-api.html#only_on), and the other [shared visibility options](../field-options.html#show-and-hide-fields-on-different-views). These options belong on the fields displayed inside the popup, not on the Preview trigger itself. `show_on: :preview` adds a field to the popup without removing it from other views.

For the remaining shared settings, see [Field options](../field-options.html) and the [Field options API](../field-options-api.html).
