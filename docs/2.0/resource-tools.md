# Resource tools

[[toc]]

<div class="rounded-md bg-blue-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-blue-700">
        This is a <a href="https://avohq.io/purchase/pro" target="_blank" class="underline">pro</a> feature
      </div>
    </div>
  </div>
</div>

<div class="space-x-2 mt-2">
  <a href="https://github.com/avo-hq/avo/discussions/836" target="_blank" class="rounded bg-purple-600 hover:bg-purple-500 text-white no-underline px-2 py-1 inline leading-none mt-2">
    Provide feedback
  </a>

  <a href="https://youtu.be/Eex8CiinQZ8?t=196" target="_blank" class="rounded bg-green-600 hover:bg-green-500 text-white no-underline px-2 py-1 inline leading-none mt-2">
    Demo video
  </a>
</div>

Similar to adding custom fields to a resource, you can add custom tools. A custom tool is a partial added to your resource's `Show` and `Edit` views.

## Generate a resource tool

Run `bin/rails generate avo:resource_tool post_info`. That will create two files. The configuration file `app/avo/resource_tools/post_info.rb` and the partial file `app/views/avo/resource_tools/_post_info.html.erb`.

The configuration file holds the tool's name and the partial path if you want to override it.

```ruby
class PostInfo < Avo::BaseResourceTool
  self.name = "Post info"
  # self.partial = "avo/resource_tools/post_info"
end
```

The partial is ready for you to customize further.

```erb
<div class="flex flex-col">
  <%= render Avo::PanelComponent.new title: "Post info" do |c| %>
    <% c.tools do %>
      <%= a_link('/avo', icon: 'heroicons/solid/academic-cap', style: :primary) do %>
        Dummy link
      <% end %>
    <% end %>

    <% c.body do %>
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
            # In this partial you have access to the following variables:
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

The resource tool is visible on the `Show` view of a resource by default. You can change that using the [visibility options](field-options.html#showing-hiding-fields-on-different-views) (`show_on`, `only_on`).

```ruby
# app/avo/resources/post_resource.rb
class PostResource < Avo::BaseResource
  tool PostInfo, show_on: :edit
end
```

### Using path helpers

Because you're in a Rails engine you will have to prepend the engine object to the path.

#### For Avo paths

Instead of writing `resources_posts_path(1)` you have to write `avo.resources_posts_path(1)`.

#### For the main app paths

When you want to reference paths from your main app, instead of writing `posts_path(1)` you have to write `main_app.posts_path`.

## Add custom fields on forms

**From Avo 2.12**

You might want to add a few more fields or pieces of functionality besides the CRUD generated fields on your forms. You can already create new [custom fields](./custom-fields) to do it in a more structured way but you can also use a resource tool to achieve more custom behavior.

You have acess to the `form` object that is available on the new/edit pages on which you can attach inputs of your choosing. You can even achieve nested forms functionality.

You have to follow three steps to enable this functionality:

1. Add the inputs in a resource tool and enable the tool on the form pages
2. Tell Avo which `params` it should permit to write to the model
3. Make sure the model is equipped to receive the params

In the example below we'll use the `FishResource`, add a few input fields (they will be a bit unstyled, because this is not the scope of the exercise), and do some actions with some of them.

The first thing we need to do is to generate the tool with `bin/rails g avo:resource_tool fish_information` and add the tool to the resource file.

```ruby{2}
class FishResource < Avo::BaseResource
  tool FishInformation, show_on: :forms
end
```

In the `_fish_information.html.erb` partial we'll add a few input fields. Some directly on the `form` and some nested with `form.fields_for`.

The fields are:

- `fish_type` as a text input
- `properties` as a multiple text input which will produce an array in the back-end
- `information` as nested inputs which will produce a `Hash` in the back-end

```erb{13-36}
<!-- _fish_information.html.erb -->
<div class="flex flex-col">
  <%= render Avo::PanelComponent.new(title: @resource.model.name) do |c| %>
    <% c.tools do %>
      <%= a_link('/admin', icon: 'heroicons/solid/academic-cap', style: :primary) do %>
        Primary
      <% end %>
    <% end %>

    <% c.body do %>
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

Next we need to tell Avo and Rails which params are welcomed in the `create`/`update` request. We do that using the `extra_params` option on the `FishResource`. The implementation that Avo follows internally is to assign the attributes you specify here to the underlying model (`model.assign_attributes params.permit(extra_params)`).

```ruby{2}
class FishResource < Avo::BaseResource
  self.extra_params = [:fish_type, :something_else, properties: [], information: [:name, :history]]

  tool FishInformation, show_on: :forms
end
```

The third step is optional. You have to make sure your model responds to the params your sending. In our example it should have the `fish_type`, `properties`, and `information` attributes or setter methods on the model class. We chose to add setters just to demonstrate the params are called to the model.

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

If you run this code you'll notice that the `information.information_age` param will not reach the `information=` method because we haven't allowed it in the `extra_params` option.
