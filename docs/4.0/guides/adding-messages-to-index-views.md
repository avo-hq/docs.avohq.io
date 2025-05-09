# How to add a message to the top of an Index view page

Sometimes it's the small things in a UI that make a big impact. One of those things is being able to show a helpful message at the top of an index view page. This is typically where users land to see lists of posts, products, orders, or anything else. You might want to point out something important, offer quick guidance, or simply highlight a recent change.

<Image src="/assets/img/guides/index_messages/custom_index_component_2.png" width="1494" height="677" alt="Original component + message as index" />


That's where this guide comes in. I'll walk you through how to inject a custom message at the top of the index view. We'll do this by creating a new component that extends the one Avo already uses to render index pages, setting it as the default for specific resources (or all of them), and customizing the view to display our message cleanly above the list.

Let's jump in.

## Create a new view component

Start by generating a new view component that inherits from Avo's index view:

```sh
rails generate component Avo::Views::ResourceCustomIndex --parent=Avo::Views::ResourceIndexComponent
```

This will generate three files:

::: code-group
```ruby [app/components/avo/views/resource_custom_index_component.rb]
# frozen_string_literal: true

class Avo::Views::ResourceCustomIndexComponent < Avo::Views::ResourceIndex
end
```
:::

::: code-group
```erb [app/components/avo/views/resource_custom_index_component.html.erb]
<div>Add Avo::Views::ResourceCustomIndexComponent template here</div>
```
:::

::: code-group
```rb [test/components/avo/views/resource_custom_index_component_test.rb]
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
:::


:::tip
You can delete the generated test file `test/components/avo/views/resource_custom_index_component_test.rb` since we won't cover testing in this guide.
:::


## Use the custom component in a resource

Let's apply the new component to a specific resource. I'll use the `Movie` resource as an example.

Update the resource file (`Avo::Resources::Movie`) to use the new component via the [`self.components`](./../resources.html#self.components) configuration:

:::code-group
```ruby [app/avo/resources/movie.rb"]
class Avo::Resources::Movie < Avo::Resources::ArrayResource
  self.components = { # [!code ++]
    "Avo::Views::ResourceIndexComponent": Avo::Views::ResourceCustomIndexComponent # [!code ++]
  } # [!code ++]

  # ...
end
```
:::

Now when you visit the Movies resource page, it will render the custom component, currently just showing the placeholder text.

<Image src="/assets/img/guides/index_messages/custom_index_component_1.png" width="1494" height="677" alt="Empty component as index" />


## Render the parent view and add your message

Next, let's modify the component so it wraps the original Avo index component and adds a message on top.

Avo will now call this custom component first, let's update the Ruby component file to store all keyword arguments, and use those to render the parent component.

::: code-group
```ruby [app/components/avo/views/resource_custom_index_component.rb]
# frozen_string_literal: true

class Avo::Views::ResourceCustomIndexComponent < Avo::Views::ResourceIndex
  def initialize(**kwargs)  # [!code ++]
    @kwargs = kwargs  # [!code ++]
  end  # [!code ++]
end
```
:::

Update the ERB template to render a message above the original component:

::: code-group
```erb [app/components/avo/views/resource_custom_index_component.html.erb]
<div>Add Avo::Views::ResourceCustomIndexComponent template here</div> # [!code --]
<div class="flex flex-col"> # [!code ++]
  <div class="flex flex-col justify-center p-4 bg-primary-100 rounded-md mb-4 text-sm"> # [!code ++]
    Message here # [!code ++]
  </div> # [!code ++]
  <%= render Avo::Views::ResourceIndexComponent.new(**@kwargs) %> # [!code ++]
</div> # [!code ++]
```
:::

Now when you visit the Movies resource page, it will render the custom component that shows the original component and your custom message on top. 🎉🎉🎉

<Image src="/assets/img/guides/index_messages/custom_index_component_2.png" width="1494" height="677" alt="Original component + message as index" />

## Apply this component to all the resources

You can apply the new component to each resource individually by setting `self.components`, but there's a more efficient approach. Since all your resources inherit from `Avo::BaseResource`, we can centralize this configuration by extending that base class. (Documentation on how to extend the base resource [here](./../resources.html#extending-avo-baseresource).)


To do this, override the base resource class by creating or modifying `app/avo/base_resource.rb`:

::: code-group
```rb [app/avo/base_resource.rb]
module Avo
  class BaseResource < Avo::Resources::Base
    self.components = { # [!code ++]
      "Avo::Views::ResourceIndexComponent": Avo::Views::ResourceCustomIndexComponent # [!code ++]
    } # [!code ++]
  end
end
```
:::

Now you can remove this configuration from the Movie resource:

:::code-group
```ruby [app/avo/resources/movie.rb"]
class Avo::Resources::Movie < Avo::Resources::ArrayResource
  self.components = { # [!code --]
    "Avo::Views::ResourceIndexComponent": Avo::Views::ResourceCustomIndexComponent # [!code --]
  } # [!code --]

  # ...
end
```
:::

With this change in place, every resource will automatically use the custom index component, no extra configuration needed. However, that raises a practical question: what if some resources should have a message, and others shouldn't?

Let's make the component more flexible by introducing a lightweight DSL extension.

## Make the message configurable via a resource method

To turn our static message into something dynamic and optional we'll fetch the message from a method on each resource. If a resource defines the `index_message` method, the component will render it. If not, it won’t show anything.

Let’s update the Ruby component to support this:

::: code-group
```ruby [app/components/avo/views/resource_custom_index_component.rb]
# frozen_string_literal: true

class Avo::Views::ResourceCustomIndexComponent < Avo::Views::ResourceIndex
  def initialize(**kwargs)
    @kwargs = kwargs
    @index_message = kwargs[:resource].try(:index_message) # [!code ++]
  end
end
```
:::

Now tweak the view to conditionally render the message:

::: code-group
```erb [app/components/avo/views/resource_custom_index_component.html.erb]
<div class="flex flex-col">
  <% if @index_message.present? %># [!code ++]
    <div class="flex flex-col justify-center p-4 bg-primary-100 rounded-md mb-4 text-sm">
      Message here # [!code --]
      <%= @index_message %># [!code ++]
    </div>
  <% end %># [!code ++]
  <%= render Avo::Views::ResourceIndexComponent.new(**@kwargs) %>
</div>

```
:::

To use this, just add an `index_message` method to any resource:

:::code-group
```ruby [app/avo/resources/movie.rb]
class Avo::Resources::Movie < Avo::Resources::ArrayResource
  def index_message = "Message here" # [!code ++]

  # ...
end
```
:::

---

### Wrapping up

Adding contextual messages to index pages can go a long way in making your internal tool more helpful. With this approach, you've learned how to:

- Extend Avo's default index view component
- Add custom UI above the resource index table
- Apply the enhancement globally across all resources
- Keep it flexible using a simple per-resource DSL

This solution is modular, declarative, and easy to maintain. You can now provide dynamic guidance to your users where it makes the most sense.
