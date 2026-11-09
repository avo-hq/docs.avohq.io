---
license: community
description: "Renders a checkbox on form views and a green check or red X icon on the Index and Show views."
fieldTags: [boolean]
outline: [2, 3]
api_docs: ./boolean-api.html
---

# Boolean

The `Boolean` field renders a checkbox on form views and a green check or red X icon on the Index and Show views.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :is_published, as: :boolean, name: "Published"
  end
end
```

Without additional options, forms use a checkbox, true and false values display their respective icons, and `nil` displays a dash.

<Image src="/assets/img/4_0/fields/boolean.webp" dark-src="/assets/img/4_0/fields/boolean-dark.webp" width="1520" height="382" alt="An Avo index table with ID, Name and Published columns — a green check and a red X in the Published column." prompt="Boolean field shown as a green check and a red X on the Index view" />

## Display a custom stored value as true {#true_value}

If your column stores `"yes"` rather than a Boolean, set [`true_value`](./boolean-api.html#true_value) so it displays as checked. Avo also recognizes the strings `"true"` and `"1"` as true.

```ruby
# app/avo/resources/post.rb
field :is_published, as: :boolean, true_value: "yes", false_value: "no"
```

<span id="false_value"></span>

:::warning Custom storage on forms
[`false_value`](./boolean-api.html#false_value) does not define a separate false-value mapping for display. Present values that do not match a recognized true value display as false. Neither option changes the checkbox's submitted values: forms submit `"1"` when checked and `"0"` when unchecked. If your model stores custom values, handle that conversion in the model.
:::

## Make missing values more visible {#nil_as_indeterminate}

If you want to distinguish an unset value from true or false at a glance, enable [`nil_as_indeterminate`](./boolean-api.html#nil_as_indeterminate). On Index and Show views, `nil` then displays a gray minus-circle icon instead of a dash. This does not change the stored value or add a third checkbox state to forms.

```ruby
# app/avo/resources/post.rb
field :is_published, as: :boolean, nil_as_indeterminate: true
```

<Image src="/assets/img/4_0/fields/boolean_nil_as_indeterminate.webp" dark-src="/assets/img/4_0/fields/boolean_nil_as_indeterminate-dark.webp" width="1800" height="156" alt="Boolean field with nil_as_indeterminate showing a gray minus-circle icon" prompt="Boolean field with nil_as_indeterminate showing a gray minus-circle icon" />

## Use a toggle on forms {#as_toggle}

Enable [`as_toggle`](./boolean-api.html#as_toggle) to style the checkbox as a toggle. It keeps the same checked and unchecked behavior and only changes the form's appearance.

```ruby
# app/avo/resources/post.rb
field :is_published, as: :boolean, as_toggle: true
```

## Options reference {#options}

See the [Boolean API](./boolean-api.html) for all four field-specific options and their defaults. For options shared by fields, such as names, visibility, and help text, see [Field options](../field-options.html).
