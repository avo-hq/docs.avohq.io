# Field wrappers

Each field display in your Avo resource has a field wrapper that helps display it in a cohesive way across the whole app.
This not only helps with a unitary design, but also with styling in a future theming feature.

:::info
You'll probably never have to use these components and helpers by themselves, but we'd like to document how they work as a future reference for everyone.
:::

# Index field wrapper

![](/assets/img/field-wrappers/index_field_wrapper.jpg)

Each field displayed on the <Index /> view is wrapped in this component that regulates the way content is displayed and makes it easy to control some options.

You may use the component `Avo::Index::FieldWrapperComponent` or the helper `index_field_wrapper`.

:::option `dash_if_blank`
This option renders a dash `—` if the content inside responds to true on the `blank?` method.
In the example below, we'd like to show the field as a red checkmark even if the content is `nil`.

#### Default

`true`

```erb
<%= index_field_wrapper **field_wrapper_args, dash_if_blank: false do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `center_content`
Wraps the content in a container with `flex items-center justify-center` classes making everything centered horizontally and vertically.

#### Default

`false`

```erb
<%= index_field_wrapper **field_wrapper_args, center_content: true do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `flush`
Removes the padding around the field allowing it to flow from edge to edge.

#### Default

`false`

```erb
<%= index_field_wrapper **field_wrapper_args, flush: false do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `field`
The instance of the field. It's usually passed in with the `field_wrapper_args`.

```erb
<%= index_field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `resource`
The instance of the resource. It's usually passed in with the `field_wrapper_args`.

```erb
<%= index_field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

# Show & Edit field wrapper

![](/assets/img/field-wrappers/show_field_wrapper.jpg)
![](/assets/img/field-wrappers/edit_field_wrapper.jpg)

The <Show /> and <Edit /> field wrappers are actually the same component.

You may use the component `Avo::Index::FieldWrapperComponent` or the helper `field_wrapper`.

## Field wrapper areas

![](/assets/img/field-wrappers/field_wrapper_areas.jpg)

Each field wrapper is divided in three areas.

### Label

This is where the field name is being displayed. This is also where the [required](./field-options#required) asterisk is added for required fields.

### Value

This area holds the actual value of the field or it's representation. The falue can be simple text or more advanced types like images, advanced pickers, and content editors.

At the bottom the [help text](./field-options#help-text) is going to be shown on the <Edit /> view and below it the validation error.

### Extra

This space is rarely used and it's there just to fill some horizontal space so the content doesn't span to the whole width and maintain its readability. With the introduction of the sidebar, this space will be ignored

## Options

:::option `dash_if_blank`
This option renders a dash `—` if the content inside responds to true on the `blank?` method.
In the example below, we'd like to show the field as a red checkmark even if the content is `nil`.

#### Default

`true`

```erb
<%= field_wrapper **field_wrapper_args, dash_if_blank: false do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `compact`
This renders the field in a more compact way by removing the **Extra** area and decresing the width of the **Label** and **Content** areas.

This is enabled on the fields displayed in actions.

#### Default

`false`

```erb
<%= field_wrapper **field_wrapper_args, compact: true do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `data`
Pass in some data attributes. Perhaps you would like to attach a StimulusJS controller to this field.

```erb
<%= field_wrapper **field_wrapper_args, data: {controller: "boolean-check"} do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `full_width`
This removes the **Extra** area and renders the **Value** area full width.

This is used on fields that require a larger area to be displayed like [WYSIWYG editors](./fields/trix), [`KeyValue`](./fields/key_value), or [file fields](./fields/files).

#### Default

`false`

```erb
<%= field_wrapper **field_wrapper_args, full_width: true do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `form`
The instance of the form that is going to be populated. It's usually passed in with the `field_wrapper_args` on the <Edit /> view.

```erb
<%= field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `field`
The instance of the field. It's usually passed in with the `field_wrapper_args`.

```erb
<%= field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `help`
The text that is going to be displayed below the actual field on the <Edit /> view.

```erb
<%= field_wrapper **field_wrapper_args, help: "Specify if the post is published or not." do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `label`
The text that is going to be displayed in the **Label** area. You might want to override it.

```erb
<%= field_wrapper **field_wrapper_args, label: "Post is published" do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `resource`
The instance of the resource. It's usually passed in with the `field_wrapper_args`.

```erb
<%= field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `stacked`
Display the field in a column layout with the label on top of the value

```erb
<%= field_wrapper **field_wrapper_args, style: "background: red" do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

![](/assets/img/field-wrappers/stacked_field.jpg)


:::option `style`
The you might want to pass some styles to the wrapper to change it's looks.

```erb
<%= field_wrapper **field_wrapper_args, style: "background: red" do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

:::option `view`
The view where the field is diplayed so it knows if it's a <Show /> or <Edit /> view. It's usually passed in with the `field_wrapper_args`.

```erb
<%= field_wrapper **field_wrapper_args do %>
  <%= render Avo::Fields::Common::BooleanCheckComponent.new checked: @field.value %>
<% end %>
```
:::

