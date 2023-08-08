---
feedbackId: 836
demoVideo: https://youtu.be/Eex8CiinQZ8?t=196
license: pro
---

# Resource tools

Similar to adding custom fields to a resource, you can add custom tools. A custom tool is a partial added to your resource's `Show` and `Edit` views.

## Generate a resource tool

Run `bin/rails generate avo:resource_tool post_info`. That will create two files. The configuration file `app/avo/resource_tools/post_info.rb` and the partial file `app/views/avo/resource_tools/_post_info.html.erb`.

The configuration file holds the tool's name and the partial path if you want to override it.

```ruby
class Avo::ResourceTools::PostInfo < Avo::BaseResourceTool
  self.name = "Post info"
  # self.partial = "avo/resource_tools/post_info"
end
```

The partial is ready for you to customize further.

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

<img :src="('/assets/img/resource-tools/resource-tool-partial.png')" alt="Avo resource tool partial" class="border mb-4" />

## Partial context

You might need access to a few things in the partial.

You have access to the `tool`, which is an instance of your tool `PostInfo`, and the `@resource`, which holds all the information about that particular resource (`view`, `model`, `params`, and others), the `params` of the request, the `Avo::App.context` and the `current_user`.
That should give you all the necessary data to scope out the partial content.

## Tool visibility

The resource tool is default visible on the `Show` view of a resource. You can change that using the [visibility options](field-options.html#showing-hiding-fields-on-different-views) (`show_on`, `only_on`).

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    tool Avo::ResourceTools::PostInfo, show_on: :edit
  end
end
```

### Using path helpers

Because you're in a Rails engine, you will have to prepend the engine object to the path.

#### For Avo paths

Instead of writing `resources_posts_path(1)` you have to write `avo.resources_posts_path(1)`.

#### For the main app paths

When you want to reference paths from your main app, instead of writing `posts_path(1)`, you have to write `main_app.posts_path`.

## Add custom fields on forms

**From Avo 2.12**

You might want to add a few more fields or pieces of functionality besides the CRUD-generated fields on your forms. Of course, you can already create new [custom fields](./custom-fields) to do it in a more structured way, but you can also use a resource tool to achieve more custom behavior.

You have access to the `form` object that is available on the new/edit pages on which you can attach inputs of your choosing. You can even achieve nested form functionality.

You have to follow three steps to enable this functionality:

1. Add the inputs in a resource tool and enable the tool on the form pages
2. Tell Avo which `params` it should permit to write to the model
3. Make sure the model is equipped to receive the params

In the example below, we'll use the `Avo::Resources::Fish`, add a few input fields (they will be a bit unstyled because this is not the scope of the exercise), and do some actions with some of them.

We first need to generate the tool with `bin/rails g avo:resource_tool fish_information` and add the tool to the resource file.

```ruby{3}
class Avo::ResourcesFish < Avo::BaseResource
  def fields
    tool Avo::ResourceTools::FishInformation, show_on: :forms
  end
end
```

In the `_fish_information.html.erb` partial, we'll add a few input fields. Some are directly on the `form`, and some are nested with `form.fields_for`.

The fields are:

- `fish_type` as a text input
- `properties` as a multiple text input which will produce an array in the back-end
- `information` as nested inputs which will produce a `Hash` in the back-end

```erb{13-36}
<!-- _fish_information.html.erb -->
<div class="flex flex-col">
  <%= render Avo::PanelComponent.new(title: @resource.model.name) do |c| %>
    <% c.with_tools do %>
      <%= a_link('/admin', icon: 'heroicons/solid/academic-cap', style: :primary) do %>
        Primary
      <% end %>
    <% end %>

    <% c.with_body do %>
      <div class="flex flex-col p-4 min-h-24">
        <div class="space-y-4">
          <% if form.present? %>
            <%= form.label :fish_type %>
            <%= form.text_field :fish_type, value: 'default type of fish', class: input_classes %>
            <br>

            <%= form.label :properties %>
            <%= form.text_field :properties, multiple: true, value: 'property 1', class: input_classes %>
            <%= form.text_field :properties, multiple: true, value: 'property 2', class: input_classes %>
            <br>

            <% form.fields_for :information do |information_form| %>
              <%= form.label :information_name %>
              <%= information_form.text_field :name, value: 'information name', class: input_classes %>
              <div class="text-gray-600 mt-2 text-sm">This is going to be passed to the model</div>
              <br>
              <%= form.label :information_history %>
              <%= information_form.text_field :history, value: 'information history', class: input_classes %>
              <div class="text-gray-600 mt-2 text-sm">This is going to be passed to the model</div>
              <br>
              <%= form.label :information_age %>
              <%= information_form.text_field :age, value: 'information age', class: input_classes %>
              <div class="text-gray-600 mt-2 text-sm">This is NOT going to be passed to the model</div>
            <% end %>
          <% end %>
        </div>
      </div>
    <% end %>
  <% end %>
</div>
```

Next, we need to tell Avo and Rails which params are welcomed in the `create`/`update` request. We do that using the `extra_params` option on the `Avo::Resources::Fish`. Avo's internal implementation is to assign the attributes you specify here to the underlying model (`model.assign_attributes params.permit(extra_params)`).

```ruby{2}
class Avo::Resources::Fish < Avo::BaseResource
  self.extra_params = [:fish_type, :something_else, properties: [], information: [:name, :history]]

  def fields
    tool Avo::ResourceTools::FishInformation, show_on: :forms
  end
end
```

The third step is optional. You must ensure your model responds to the params you're sending. Our example should have the `fish_type`, `properties`, and `information` attributes or setter methods on the model class. We chose to add setters to demonstrate the params are called to the model.

```ruby
class Fish < ApplicationRecord
  self.inheritance_column = nil # required in order to use the type DB attribute

  def fish_type=(value)
    self.type = value
  end

  def properties=(value)
    # properties should be an array
    puts ["properties in the Fish model->", value].inspect
  end

  def information=(value)
    # properties should be a hash
    puts ["information in the Fish model->", value].inspect
  end
end
```

If you run this code, you'll notice that the `information.information_age` param will not reach the `information=` method because we haven't allowed it in the `extra_params` option.
