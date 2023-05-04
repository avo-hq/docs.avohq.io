---
feedbackId: 1273
---

# Native field components

One of the most important features of Avo is the ability to extend it pass the DSL. It's very important to us to enable you to add the features you need and create the best experience for your users.

That's why you can so easily create [custom fields](./custom-fields), [resource tools](./resource-tools), and [custom tools](./custom-tools) altogether. When you need to augment the UI even more you can use your [custom CSS and JS assets](./custom-asset-pipeline) too.

When you start adding those custom views you might want to add your own fields, and you'd like to make them look like the rest of the app.
That's why Avo provides a way to use those fields beyond the DSL, in your own custom Rails partials.

## Declaring fields

When you generate a new [resource tool](./resource-tools) you get access to the resource partial.

:::details Sample resource tool
```erb
<div class="flex flex-col">
  <%= render Avo::PanelComponent.new title: "Post info" do |c| %>
    <% c.with_tools do %>
      <%= a_link('/avo', icon: 'heroicons/solid/academic-cap', style: :primary) do %>
        Dummy link
      <% end %>
    <% end %>
    <% c.with_body do %>
      <div class="flex flex-col p-4 min-h-24">
        <div class="space-y-4">
          <h3>🪧 This partial is waiting to be updated</h3>
          <p>
            You can edit this file here <code class='p-1 rounded bg-gray-500 text-white text-sm'>app/views/avo/resource_tools/post_info.html.erb</code>.
          </p>
          <p>
            The resource tool configuration file should be here <code class='p-1 rounded bg-gray-500 text-white text-sm'>app/avo/resource_tools/post_info.rb</code>.
          </p>
          <%
            # In this partial, you have access to the following variables:
            # tool
            # @resource
            # @resource.model
            # form (on create & edit pages. please check for presence first)
            # params
            # Avo::App.context
            # current_user
          %>
        </div>
      </div>
    <% end %>
  <% end %>
</div>
```
:::

You may add new fields using the `avo_show_field`, or `avo_edit_field` methods and use [the arguments you are used to from resources](./field-options).

```ruby
# In your resource file
field :name, as: :text
```

```erb
<!-- In your partial file -->
<%= avo_edit_field :name, as: :text %>
```

## The `form` option

If this is an <Edit /> or a <New /> view, you should pass it the `form` object that an Avo resource tool provides for you.

```erb
<%= avo_edit_field :name, as: :text, form: form %>
```

## The `value` option

When you are building a show field and you want to give it a value to show, use the `value` options

```erb
<%= avo_show_field(:photo, as: :external_image, value: record.cdn_image) %>
```

## Other field options

The fields take all the [field options](./field-options) you are used to like, `help`, `required`, `readonly`, `placeholder`, and more.

```erb
<%= avo_edit_field :name, as: :text, form: form, help: "The user's name", readonly: -> { !current_user.is_admin? }, placeholder: "John Doe", nullable: true %>
```

## Component options

The field taks a new `component_options` argument that will be passed to the view component for that field. Please check out the [field wrapper documentation](./field-wrappers) for more details on that.

## `avo_field` helper

You may use the `avo_field` helper to conditionally switch from `avo_show_field` and `avo_edit_field`.

```erb
<%= avo_field :name, as: :text, view: :show %>
<%= avo_field :name, as: :text, view: :edit %>
<%= avo_field :name, as: :text, view: ExampleHelper.view_conditional %>
```
