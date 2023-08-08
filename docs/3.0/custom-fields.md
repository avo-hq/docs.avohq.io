---
feedbackId: 836
license: pro
---

# Custom fields

Avo ships with 20+ well polished and ready to be used, fields out of the box.

When you need a field that is not provided by default, Avo makes it easy to add it.

## Generate a new field

Every new field comes with three [view components](https://viewcomponent.org/), `Edit` (which is also used in the `New` view), and `Show` and `Index`. There's also a `Field` configuration file.

`bin/rails generate avo:field progress_bar` generates the files for you.

:::info
Please restart your rails server after adding a new custom field.
:::

```bash{2-9}
▶ bin/rails generate avo:field progress_bar
      create  app/components/avo/fields/progress_bar_field
      create  app/components/avo/fields/progress_bar_field/edit_component.html.erb
      create  app/components/avo/fields/progress_bar_field/edit_component.rb
      create  app/components/avo/fields/progress_bar_field/index_component.html.erb
      create  app/components/avo/fields/progress_bar_field/index_component.rb
      create  app/components/avo/fields/progress_bar_field/show_component.html.erb
      create  app/components/avo/fields/progress_bar_field/show_component.rb
      create  app/avo/fields/progress_bar_field.rb
```

The `ProgressBarField` file is what registers the field in your admin.

```ruby
class Avo::Fields::ProgressBarField < Avo::Fields::BaseField
  def initialize(name, **args, &block)
    super(name, **args, &block)
  end
end
```

Now you can use your field like so:

```ruby{7}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_resource: true
    field :progress, as: :progress_bar
  end
end
```
<img :src="('/assets/img/custom-fields/progress-show.jpg')" alt="Progress custom field" class="border mb-4" />

The generated view components are basic text fields for now.

```erb{1,9,14}
# app/components/avo/fields/progress_bar_field/edit_component.html.erb
<%= edit_field_wrapper field: @field, index: @index, form: @form, resource: @resource, displayed_in_modal: @displayed_in_modal do %>
  <%= @form.text_field @field.id,
    class: helpers.input_classes('w-full', has_error: @field.model_errors.include?(@field.id)),
    placeholder: @field.placeholder,
    disabled: @field.readonly %>
<% end %>

# app/components/avo/fields/progress_bar_field/index_component.html.erb
<%= index_field_wrapper field: @field do %>
  <%= @field.value %>
<% end %>

# app/components/avo/fields/progress_bar_field/show_component.html.erb
<%= show_field_wrapper field: @field, index: @index do %>
  <%= @field.value %>
<% end %>
```

You can customize them and add as much or as little content as needed. More on customization [below](#customize-the-views).

## Field options

This file is where you may add field-specific options.

 ```ruby{3-6,11-14}
# app/avo/fields/progress_bar_field.rb
class Avo::Fields::ProgressBarField < Avo::Fields::BaseField
  attr_reader :max
  attr_reader :step
  attr_reader :display_value
  attr_reader :value_suffix

  def initialize(name, **args, &block)
    super(name, **args, &block)

    @max = 100
    @step = 1
    @display_value = false
    @value_suffix = nil
  end
end
```

The field-specific options can come from the field declaration as well.

```ruby{11-14,24}
# app/avo/fields/progress_bar_field.rb
class Avo::Fields::ProgressBarField < Avo::Fields::BaseField
  attr_reader :max
  attr_reader :step
  attr_reader :display_value
  attr_reader :value_suffix

  def initialize(name, **args, &block)
    super(name, **args, &block)

    @max = args[:max] || 100
    @step = args[:step] || 1
    @display_value = args[:display_value] || false
    @value_suffix = args[:value_suffix] || nil
  end
end

# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_resource: true
    field :progress, as: :progress_bar, step: 10, display_value: true, value_suffix: "%"
  end
end
```

## Field Visibility

If you need to hide the field in some view, you can use the [visibility helpers](./field-options.html#showing-hiding-fields-on-different-views).

```ruby{16}
# app/avo/fields/progress_bar_field.rb
class Avo::Fields::ProgressBarField < Avo::Fields::BaseField
  attr_reader :max
  attr_reader :step
  attr_reader :display_value
  attr_reader :value_suffix

  def initialize(name, **args, &block)
    super(name, **args, &block)

    @max = args[:max] || 100
    @step = args[:step] || 1
    @display_value = args[:display_value] || false
    @value_suffix = args[:value_suffix] || nil

    hide_on :forms
  end
end
```

## Customize the views

No let's do something about those views. Let's add a progress bar to the `Index` and `Show` views.

```erb{1,15}
# app/components/avo/fields/progress_bar_field/show_component.html.erb
<%= show_field_wrapper field: @field, index: @index do %>
  <!-- If display_value is set to true, show the value above the progress bar -->
  <% if @field.display_value %>
    <div class="text-center text-sm font-semibold w-full leading-none mb-1">
      <!-- Add the suffix if value_suffix is set -->
      <%= @field.value %><%= @field.value_suffix if @field.value_suffix.present? %>
    </div>
  <% end %>

  <!-- Show the progress input with the settings we passed to the field. -->
  <progress max="<%= @field.max %>" value="<%= @field.value %>" class="block w-full"></progress>
<% end %>

# app/components/avo/fields/progress_bar_field/index_component.html.erb
<%= index_field_wrapper field: @field do %>
  <!-- If display_value is set to true, show the value above the progress bar -->
  <% if @field.display_value %>
    <div class="text-center text-sm font-semibold w-full leading-none mb-1">
      <!-- Add the suffix if value_suffix is set -->
      <%= @field.value %><%= @field.value_suffix if @field.value_suffix.present? %>
    </div>
  <% end %>

  <!-- Show the progress input with the settings we passed to the field. -->
  <progress max="<%= @field.max %>" value="<%= @field.value %>" class="block w-24"></progress>
<% end %>
```

<img :src="('/assets/img/custom-fields/progress-index.jpg')" alt="Progress bar custom field on index" class="border mb-4" />

For the `Edit` view, we're going to do something different. We'll implement a `range` input.

```erb{1}
# app/components/avo/fields/progress_bar_field/edit_component.html.erb
<%= edit_field_wrapper field: @field, index: @index, form: @form, resource: @resource, displayed_in_modal: @displayed_in_modal do %>
  <!-- Show the progress input with the settings we passed to the field. -->
  <% if @field.display_value %>
    <div class="text-center text-sm font-semibold w-full leading-none mb-1">
      <!-- Add the suffix if value_suffix is set -->
      <span class="js-progress-bar-value-<%= @field.id %>"><%= @field.value %></span><%= @field.value_suffix if @field.value_suffix.present? %>
    </div>
  <% end %>
  <!-- Add the range input with the settings we passed to the field -->
  <%= @form.range_field @field.id,
    class: 'w-full',
    placeholder: @field.placeholder,
    disabled: @field.readonly,
    min: 0,
    # add the field-specific options
    max: @field.max,
    step: @field.step,
    %>
<% end %>

<script>
// Get the input and value elements
var input = document.getElementById('project_progress');
// Scope the selector to the current field. You might have more than one progress field on the page.
var log = document.querySelector('.js-progress-bar-value-<%= @field.id %>');

// Add an event listener for when the input is updated
input.addEventListener('input', updateValue);

// Update the value element with the value from the input
function updateValue(e) {
  log.textContent = e.target.value;
}
</script>
```
<img :src="('/assets/img/custom-fields/progress-edit.jpg')" alt="Progress bar custom field edit" class="border mb-4" />

## Field assets

Because there isn't just one standardized way of handling assets in Rails, we decided we won't provide **asset loading** support for custom fields for now. That doesn't mean that you can't use custom assets (javascript or CSS files), but you will have to load them in your own pipeline in dedicated Avo files.

In the example above, we added javascript on the page just to demonstrate the functionality. In reality, you might add that to a stimulus controller inside your own Avo [dedicated pipeline](./custom-asset-pipeline.html) (webpacker or sprockets).

Some styles were added in the asset pipeline directly.
```css
progress {
  @apply h-2 bg-white border border-gray-400 rounded shadow-inner;
}
progress[value]::-webkit-progress-bar {
  @apply bg-white border border-gray-500 rounded shadow-inner;
}
progress[value]::-webkit-progress-value{
  @apply bg-green-600 rounded;

}
progress[value]::-moz-progress-bar {
  @apply bg-green-600 rounded appearance-none;
}
```

## Use pre-built Stimulus controllers

Avo ships with a few Stimulus controllers that help you build more dynamic fields.

### Hidden input controller

This controller allows you to hide your content and add a trigger to show it. You'll find it in the Trix field.

<img :src="('/assets/img/stimulus/hidden_input_trix.gif')" alt="Hidden input controller" class="border mb-4" />

You should add the `:always_show` `attr_reader` and `@always_show` instance variables to your field.

```ruby{3,8}
# app/avo/fields/color_picker_field.rb
class Avo::Fields::ColorPickerField < Avo::Fields::BaseField
  attr_reader :always_show

  def initialize(id, **args, &block)
    super(id, **args, &block)

    @always_show = args[:always_show] || false
    @allow_non_colors = args[:allow_non_colors]
  end
end
```

Next, in your fields `Show` component, you need to do a few things.

1. Wrap the field inside a controller tag
1. Add the trigger that will show the content.
1. Wrap the value in a div with the `hidden` class applied if the condition `@field.always_show` is `false`.
1. Add the `content` target (`data-hidden-input-target="content"`) to that div.

```erb{4-7,8}
# app/components/avo/fields/color_picker_field/show_component.html.erb

<%= show_field_wrapper field: @field, index: @index do %>
  <div data-controller="hidden-input">
    <% unless @field.always_show %>
      <%= link_to t('avo.show_content'), 'javascript:void(0);', class: 'font-bold inline-block', data: { action: 'click->hidden-input#showContent' } %>
    <% end %>
    <div <% unless @field.always_show %> class="hidden" <% end %> data-hidden-input-target="content">
      <div style="background-color: <%= @field.value %>"
        class="h-6 px-1 rounded-md text-white text-sm flex items-center justify-center leading-none"
      >
        <%= @field.value %>
      </div>
    </div>
  </div>
<% end %>
```

<img :src="('/assets/img/stimulus/hidden_input_color.gif')" alt="Hidden input controller" class="border mb-4" />
