---
feedbackId: 836
license: community
outline: [2, 3]
---

# Custom fields

Avo ships with 20+ polished, ready-to-use fields out of the box.

When you need a field that isn't provided by default, Avo makes it easy to build your own.

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
    field :id, as: :id, link_to_record: true
    field :progress, as: :progress_bar
  end
end
```

<Image src="/assets/img/4_0/custom-fields/progress-show.webp" dark-src="/assets/img/4_0/custom-fields/progress-show-dark.webp" width="1360" height="200" alt="A progress_bar custom field on an Avo Show view, rendering a progress bar with the value 98% above it." />

The generated view components are basic text fields for now.

```erb
<%# app/components/avo/fields/progress_bar_field/edit_component.html.erb %>
<%= field_wrapper **field_wrapper_args do %>
  <%= @form.text_field @field.id,
    class: classes("w-full"),
    placeholder: @field.placeholder,
    disabled: disabled? %>
<% end %>

<%# app/components/avo/fields/progress_bar_field/index_component.html.erb %>
<%= index_field_wrapper **field_wrapper_args do %>
  <%= @field.value %>
<% end %>

<%# app/components/avo/fields/progress_bar_field/show_component.html.erb %>
<%= field_wrapper **field_wrapper_args do %>
  <%= @field.value %>
<% end %>
```

The `field_wrapper_args`, `classes`, and `disabled?` helpers come from the base components your field inherits from (`Avo::Fields::EditComponent`, `ShowComponent`, and `IndexComponent`), so they're available in every generated component.

You can customize them and add as much or as little content as needed. More on customization [below](#customize-the-views).

## Start from an existing field

There may be times when you want to duplicate an existing field and start from there.

To achieve this behavior, use the `--field_template` argument and pass the original field as a value.

Now, all components will have the exact same code (except the name) as the original field.

```bash
$ bin/rails generate avo:field super_text --field_template text
      create  app/components/avo/fields/super_text_field
      create  app/components/avo/fields/super_text_field/edit_component.html.erb
      create  app/components/avo/fields/super_text_field/edit_component.rb
      create  app/components/avo/fields/super_text_field/index_component.html.erb
      create  app/components/avo/fields/super_text_field/index_component.rb
      create  app/components/avo/fields/super_text_field/show_component.html.erb
      create  app/components/avo/fields/super_text_field/show_component.rb
      create  app/avo/fields/super_text_field.rb
```

We can verify that all components have the text field code. From here there are endless possibilities to extend the original field features.

```ruby
# app/avo/fields/super_text_field.rb
module Avo
  module Fields
    class SuperTextField < BaseField
      attr_reader :link_to_record
      attr_reader :as_html
      attr_reader :protocol

      def initialize(id, **args, &block)
        super(id, **args, &block)

        add_boolean_prop args, :link_to_record
        add_boolean_prop args, :as_html
        add_string_prop args, :protocol
      end
    end
  end
end

# lib/avo/fields/text_field.rb
module Avo
  module Fields
    class TextField < BaseField
      attr_reader :link_to_record
      attr_reader :as_html
      attr_reader :protocol

      def initialize(id, **args, &block)
        super(id, **args, &block)

        add_boolean_prop args, :link_to_record
        add_boolean_prop args, :as_html
        add_string_prop args, :protocol
      end
    end
  end
end
```

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
    field :id, as: :id, link_to_record: true
    field :progress, as: :progress_bar, step: 10, display_value: true, value_suffix: "%"
  end
end
```

## Field Visibility

If you need to hide the field in some view, you can use the [visibility helpers](./field-options.html#show-and-hide-fields-on-different-views).

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

## What's available in your components

Each of the three generated components inherits from an Avo base component — `Avo::Fields::EditComponent`, `Avo::Fields::ShowComponent`, and `Avo::Fields::IndexComponent` (see the generated `*_component.rb` files). Those base classes expose the objects and helpers you use when rendering.

The most useful ones, available in the `.html.erb` templates:

| Variable / helper | Available in | What it is |
| --- | --- | --- |
| `@field` | all three | The field instance — your `Avo::Fields::ProgressBarField`. Read its value with `@field.value` and its `id`, `placeholder`, `name`, `type`, plus **every `attr_reader` you add** (`@field.max`, `@field.step`, …). |
| `@resource` | all three | The resource the field belongs to. |
| `@index` | all three | The field's position on the page. |
| `@view` | all three | An [`Avo::ViewInquirer`](./views.html) — `@view.index?`, `@view.show?`, `@view.edit?`, `@view.new?`. |
| `field_wrapper_args` | all three | The hash to splat into the [field wrapper](./field-wrappers.html): `field_wrapper **field_wrapper_args`. Passes `@field`, `@resource`, `@view`, and layout flags through for you. |
| `@form` | `Edit` | The Rails form builder. Build inputs with `@form.text_field @field.id`, `@form.range_field @field.id`, etc. |
| `classes("extra")` | `Edit` | Input CSS classes with error state, size, and any HTML overrides already applied. Pass extra classes as a string. |
| `disabled?` | `Edit`, `Show` | `true` when the field is readonly **or** disabled. Prefer it over `@field.readonly` — it covers both cases. |
| `@stacked`, `@full_width`, `@density` | vary by view | Layout flags forwarded from the resource; usually you just pass them through via `field_wrapper_args`. |

### How the field wrapper ties it together

The first thing every generated component does is wrap your content in the **[field wrapper](./field-wrappers.html)** — `field_wrapper` on `Show`/`Edit`, `index_field_wrapper` on `Index`. This is the piece that makes a custom field look native: the wrapper renders the label, the required asterisk, the help text, the validation error, and the blank-`—` placeholder, and it applies the `stacked` / `full_width` / `density` layout around whatever you put inside the block. You render the *value*; the wrapper renders everything around it.

That's why you splat `field_wrapper_args` into it instead of building the label and spacing yourself — the base component already collected everything the wrapper needs. You can still pass extra options alongside it (`field_wrapper **field_wrapper_args, full_width: true`); the full list lives in the [field wrappers reference](./field-wrappers.html).

:::warning
The wrapper renders a dash (`—`) instead of your block whenever `@field.value` is blank — it checks the value, not what your block actually renders. If your custom field draws something meaningful even when the value is `nil`, pass [`dash_if_blank: false`](./field-wrappers.html#dash_if_blank) or your content will never show.
:::

## Customize the views

Now let's do something about those views. Let's add a progress bar to the `Index` and `Show` views.

```erb{1,15}
<%# app/components/avo/fields/progress_bar_field/show_component.html.erb %>
<%= field_wrapper **field_wrapper_args do %>
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

<%# app/components/avo/fields/progress_bar_field/index_component.html.erb %>
<%= index_field_wrapper **field_wrapper_args do %>
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

<Image src="/assets/img/4_0/custom-fields/progress-index.webp" dark-src="/assets/img/4_0/custom-fields/progress-index-dark.webp" width="1520" height="570" alt="An Avo index table with ID, Name and Progress columns, where Progress renders a small progress bar with the value and a percent suffix." />

For the `Edit` view, we're going to do something different. We'll implement a `range` input.

```erb{1}
<%# app/components/avo/fields/progress_bar_field/edit_component.html.erb %>
<%= field_wrapper **field_wrapper_args do %>
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
    disabled: disabled?,
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

<Image src="/assets/img/4_0/custom-fields/progress-edit.webp" dark-src="/assets/img/4_0/custom-fields/progress-edit-dark.webp" width="1280" height="256" alt="A progress_bar custom field on an Avo Edit form, rendered as a range slider with the current value and percent suffix shown above it." />

## Field assets

Because there isn't just one standardized way of handling assets in Rails, we decided we won't provide **asset loading** support for custom fields for now. That doesn't mean that you can't use custom assets (javascript or CSS files), but you will have to load them in your own pipeline in dedicated Avo files.

In the example above, we added javascript on the page just to demonstrate the functionality. In reality, you might add that to a stimulus controller inside your own Avo [dedicated pipeline](./asset-handling.html).

Some styles were added in the asset pipeline directly.

```css
progress {
  @apply h-2 bg-white border border-gray-400 rounded shadow-inner;
}
progress[value]::-webkit-progress-bar {
  @apply bg-white border border-gray-500 rounded shadow-inner;
}
progress[value]::-webkit-progress-value {
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

<Image src="/assets/img/4_0/stimulus/hidden_input_trix.webm" dark-src="/assets/img/4_0/stimulus/hidden_input_trix-dark.webm" width="1000" height="278" alt="A Trix field on an Avo Show view with long content collapsed behind a “More content” link that, when clicked, reveals the rich text." prompt="the Trix field hiding long content behind a more content link on show" />

You should add the `:always_show` `attr_reader` and `@always_show` instance variables to your field.

```ruby{3,8}
# app/avo/fields/color_picker_field.rb
class Avo::Fields::ColorPickerField < Avo::Fields::BaseField
  attr_reader :always_show

  def initialize(id, **args, &block)
    super(id, **args, &block)

    @always_show = args[:always_show] || false
  end
end
```

Next, in your fields `Show` component, you need to do a few things.

1. Wrap the field inside a controller tag
1. Add the trigger that will show the content.
1. Wrap the value in a div with the `hidden` class applied if the condition `@field.always_show` is `false`.
1. Add the `content` target (`data-hidden-input-target="content"`) to that div.

```erb{4-7,8}
<%# app/components/avo/fields/color_picker_field/show_component.html.erb %>

<%= field_wrapper **field_wrapper_args do %>
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

<Image src="/assets/img/4_0/stimulus/hidden_input_color.webm" dark-src="/assets/img/4_0/stimulus/hidden_input_color-dark.webm" width="900" height="88" alt="A custom color field on an Avo Show view using the hidden-input controller: the Color label on the left and a Show content link on the right that, when clicked, reveals a colored swatch pill showing the hex value." prompt="the hidden input controller revealing a color swatch on show" />

### Non existing model field

To ensure proper rendering of a custom field that lacks getters and setters at the model level, you must implement these methods within the model.

```ruby
  def custom_field
  end

  def custom_field=(value)
  end
```

## Field methods

We won't be able to list all the methods available for a field here, but we've added a few methods to help you build better fields.

<Option name="`table_header_class`">

This adds a class to the `th` element of the table header.
We added it when we needed to force a certain column to be a certain size, but you can use it for any purpose.

It defaults to `nil`

```ruby
def table_header_class
  "w-32"
end
```

</Option>
