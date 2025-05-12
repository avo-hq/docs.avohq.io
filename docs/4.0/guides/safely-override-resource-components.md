# How to safely override the resource views without maintaining core components

Sometimes it's the small things in a UI that make a big impact. One of those things is being able to show a helpful message at the top of an index view page. This is typically where users land to see lists of posts, products, orders, or anything else. You might want to point out something important, offer quick guidance, or simply highlight a recent change.

:::info
What makes this guide particularly valuable is that it demonstrates how to safely override and customize the resource index component without having to maintain the original index component on each version update. While we'll be focusing on the index component in this guide, this technique can be applied to any resource view component in Avo. This approach lets you add custom functionality while still benefiting from Avo's updates to the core components, ensuring your customizations remain compatible across upgrades.
:::

<Image src="/assets/img/guides/index_messages/custom_index_component_2.png" width="1664" height="745" alt="Original component + message as index" />


That's where this guide comes in. I'll walk you through how to inject a custom message at the top of the index view. We'll do this by creating a new component that extends the one Avo already uses to render index pages, setting it as the default for specific resources (or all of them), and customizing the view to display our message cleanly above the list.

Let's jump in.

## Create a new view component

Start by generating a new view component that inherits from Avo's index view:

```sh
rails generate component Avo::Views::ResourceCustomIndex --parent=Avo::Views::ResourceIndexComponent
```

This will generate three files:

```ruby
# app/components/avo/views/resource_custom_index_component.rb
# frozen_string_literal: true

class Avo::Views::ResourceCustomIndexComponent < Avo::Views::ResourceIndex
end
```

```html
<!-- components/avo/views/resource_custom_index_component.html.erb -->
<div>Add Avo::Views::ResourceCustomIndexComponent template here</div>
```

```rb
# test/components/avo/views/resource_custom_index_component_test.rb
# frozen_string_literal: true

require "test_helper"

class Avo::Views::ResourceCustomIndexeComponentTest < ViewComponent::TestCase
  def test_component_renders_something_useful
    # assert_equal(
    #   %(<span>Hello, components!</span>),
    #   render_inline(Avo::Views::ResourceCustomIndexeComponent.new(message: "Hello, components!")).css("span").to_html
    # )
  end
end
```

:::tip
You can delete the generated test file `test/components/avo/views/resource_custom_index_component_test.rb` since we won't cover testing in this guide.
:::

## Use the custom component in a resource

Let's apply the new component to a specific resource. I'll use the `Movie` resource as an example.

Update the resource file (`Avo::Resources::Movie`) to use the new component via the [`self.components`](./../resources.html#self.components) configuration:

```ruby
# app/avo/resources/movie.rb
class Avo::Resources::Movie < Avo::Resources::ArrayResource
  self.components = { # [!code ++]
    "Avo::Views::ResourceIndexComponent": Avo::Views::ResourceCustomIndexComponent # [!code ++]
  } # [!code ++]

  # ...
end
```

Now when you visit the Movies resource page, it will render the custom component, currently just showing the placeholder text.

<Image src="/assets/img/guides/index_messages/custom_index_component_1.png" width="1494" height="677" alt="Empty component as index" />


## Render the parent view and add your message

Next, let's modify the component so it wraps the original Avo index component and adds a message on top.

Avo will now call this custom component first, let's update the Ruby component file to store all keyword arguments, and use those to render the parent component.

```ruby
# app/components/avo/views/resource_custom_index_component.rb
# frozen_string_literal: true

class Avo::Views::ResourceCustomIndexComponent < Avo::Views::ResourceIndex
  def initialize(**kwargs)  # [!code ++]
    @kwargs = kwargs  # [!code ++]
  end  # [!code ++]
end
```

Update the ERB template to render a message above the original component:

:::warning
All Tailwind CSS classes used in this guide are already part of Avo's design system and included in its pre-purged assets. If you plan to customize the appearance of the message component beyond what's shown here, you may need to set up the [TailwindCSS integration](./../tailwindcss-integration.md).
:::

```html
<!-- app/components/avo/views/resource_custom_index_component.html.erb -->
<div>Add Avo::Views::ResourceCustomIndexComponent template here</div> <!-- [!code --] -->
<div class="flex flex-col"> <!-- [!code ++] -->
  <div class=" w-full shadow-lg rounded px-2 py-3 rounded relative border text-white pointer-events-auto bg-blue-400 border-blue-600 mb-4"> <!-- [!code ++] -->
    <div class="flex h-full"> <!-- [!code ++] -->
      <div class="ml-3 w-0 flex-1 pt-0.5"> <!-- [!code ++] -->
        <p class="text-sm leading-5 font-semibold"> <!-- [!code ++] -->
          <strong>MovieFest 2025</strong> • Discover what\'s trending this season in cinema 🍿 <!-- [!code ++] -->
        </p> <!-- [!code ++] -->
      </div> <!-- [!code ++] -->
    </div> <!-- [!code ++] -->
  </div> <!-- [!code ++] -->

  <%= render Avo::Views::ResourceIndexComponent.new(**@kwargs) %> <!-- [!code ++] -->
</div> <!-- [!code ++] -->
```

Now when you visit the Movies resource page, it will render the custom component that shows the original component and your custom message on top. 🎉🎉🎉

<Image src="/assets/img/guides/index_messages/custom_index_component_2.png" width="1664" height="745" alt="Original component + message as index" />

## Apply this component to all the resources

You can apply the new component to each resource individually by setting `self.components`, but there's a more efficient approach. Since all your resources inherit from `Avo::BaseResource`, we can centralize this configuration by [extending that base class](./../resources.html#extending-avo-baseresource).


To do this, override the base resource class by creating or modifying `app/avo/base_resource.rb`:

```rb
# app/avo/base_resource.rb
module Avo
  class BaseResource < Avo::Resources::Base
    self.components = { # [!code ++]
      "Avo::Views::ResourceIndexComponent": Avo::Views::ResourceCustomIndexComponent # [!code ++]
    } # [!code ++]
  end
end
```

Now you can remove this configuration from the Movie resource:
```ruby
# app/avo/resources/movie.rb
class Avo::Resources::Movie < Avo::Resources::ArrayResource
  self.components = { # [!code --]
    "Avo::Views::ResourceIndexComponent": Avo::Views::ResourceCustomIndexComponent # [!code --]
  } # [!code --]

  # ...
end
```

With this change in place, every resource will automatically use the custom index component, no extra configuration needed. However, that raises a practical question: what if some resources should have a message, and others shouldn't?

Let's make the component more flexible by introducing a lightweight DSL extension.

## Make the message configurable via a resource method

To turn our static message into something dynamic and optional we'll fetch the message from a method on each resource. If a resource defines the `index_message` method, the component will render it. If not, it won’t show anything.

Let’s update the Ruby component to support this:

```ruby
# app/components/avo/views/resource_custom_index_component.rb
# frozen_string_literal: true

class Avo::Views::ResourceCustomIndexComponent < Avo::Views::ResourceIndex
  def initialize(**kwargs)
    @kwargs = kwargs
    @index_message = kwargs[:resource].try(:index_message) # [!code ++]
  end
end
```

Now tweak the view to conditionally render the message:

```html
<!-- app/components/avo/views/resource_custom_index_component.html.erb -->
<div class="flex flex-col">
  <% if @index_message.present? %> <!-- [!code ++] -->
    <div class=" w-full shadow-lg rounded px-2 py-3 rounded relative border text-white pointer-events-auto bg-blue-400 border-blue-600 mb-4">
      <div class="flex h-full">
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm leading-5 font-semibold">
            <strong>MovieFest 2025</strong> • Discover what\'s trending this season in cinema 🍿 <!-- [!code --] -->
            <%= @index_message %> <!-- [!code ++] -->
          </p>
        </div>
      </div>
    </div>
  <% end %> <!-- [!code ++] -->

  <%= render Avo::Views::ResourceIndexComponent.new(**@kwargs) %>
</div>
```

To use this, just add an `index_message` method to any resource:

```ruby
# app/avo/resources/movie.rb
class Avo::Resources::Movie < Avo::Resources::ArrayResource
  def index_message # [!code ++]
    '<strong>MovieFest 2025</strong> • Discover what\'s trending this season in cinema 🍿'.html_safe # [!code ++]
  end # [!code ++]

  # ...
end
```

---

### Wrapping up

Adding contextual messages to index pages can go a long way in making your internal tool more helpful. With this approach, you've learned how to:

- Extend Avo's default index view component
- Add custom UI above the resource index table
- Apply the enhancement globally across all resources
- Keep it flexible using a simple per-resource DSL

This solution is modular, declarative, and easy to maintain. You can now provide dynamic guidance to your users where it makes the most sense.

The beauty of this approach is that it safely overrides and customizes the resource index component without requiring you to maintain the original index component on each version update. While we've focused on adding a message at the top, this pattern opens horizons for extending the index component in any direction, whether adding elements at the bottom, on the sides, or anywhere else your application needs. You get the flexibility of customization while continuing to benefit from Avo's ongoing improvements to the core components.
