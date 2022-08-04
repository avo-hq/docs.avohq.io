# Stimulus controllers

[[toc]]

Avo ships with a few Stimulus controllers that helps you build your admin.

## Hidden input controller

This controller allows you to hide your content and add a trigger to show it. You'll find it in the Trix field.

<img :src="$withBase('/assets/img/stimulus/hidden_input_trix.gif')" alt="Hidden input controller" class="border mb-4" />

You should add the `:always_show` `attr_reader` and `@always_show` instance variable to your field.

```ruby{3,8}
# app/avo/fields/color_picker_field.rb
class ColorPickerField < Avo::Fields::BaseField
  attr_reader :always_show

  def initialize(id, **args, &block)
    super(id, **args, &block)

    @always_show = args[:always_show] || false
    @allow_non_colors = args[:allow_non_colors]
  end
end
```

Next in your fields `Show` component you need to do a few things.

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

<img :src="$withBase('/assets/img/stimulus/hidden_input_color.gif')" alt="Hidden input controller" class="border mb-4" />


