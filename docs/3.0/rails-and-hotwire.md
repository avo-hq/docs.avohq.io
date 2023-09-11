# Avo ❤️ Rails & Hotwire

In order to provide this all-in-one full-interface experience, we are using Rails' built-in [engines functionality](https://guides.rubyonrails.org/engines.html).

## Avo as a Rails engine

Avo is a **Ruby on Rails engine** that runs isolated and side-by-side with your app. You configure it using a familiar DSL and sometimes regular Rails code through controller methods and partials.

Avo's philosophy is to have as little business logic in your app as possible and give the developer the right tools to extend the functionality when needed.

That means we use a few files to configure most of the interface. When that configuration is not enough, we enable the developer to export ([eject](./eject-views#partial)) partials or even generate new ones for their total control.

### Prepend engine name in URL path helpers

Because it's a **Rails engine** you'll have to follow a few engine rules. One of them is that [routes are isolated](https://guides.rubyonrails.org/engines.html#routes). That means that whenever you're using Rails' [path helpers](https://guides.rubyonrails.org/routing.html#generating-paths-and-urls-from-code) you'll need to prepend the name of the engine. For example, Avo's name is `avo,` and your app's engine name is `main_app`.

```ruby
# When referencing an Avo route, use avo
link_to 'Users', avo.resources_users_path
link_to user.name, avo.resources_user_path(user)

# When referencing a path for your app, use main_app
link_to "Contact", main_app.contact_path
link_to post.name, main_app.posts_path(post)
```

### Use your helpers inside Avo

This is something that we'd like to improve in the future, but the flow right now is to 1. include the helper module inside the controller you need it for and then 2. reference the methods from the `view_context.controller` object in resource files or any other place you'd need them.

```ruby{3-5,10,16}
# app/helpers/application_helper.rb
module ApplicationHelper
  def render_copyright_info
    "Copyright #{Date.today.year}"
  end
end

# app/controller/avo/products_controller.rb
class Avo::ProductsController < Avo::ResourcesController
  include ApplicationHelper
end

# app/avo/resources/products_resource.rb
class ProductsResource < Avo::BaseResource
  field :copyright, as: :text do
    view_context.controller.render_copyright_info
  end
end
```

## Hotwire

Avo's built with Hotwire, so anytime you'd like to use Turbo Frames, that's supported out of the box.

## StimulusJS

Avo comes loaded with Stimulus JS and has a quite deep integration with it by providing useful built-in helpers that improve the development experience.

Please follow the [Stimulus JS guide](./stimulus-integration.md ) that takes an in-depth look at all the possible ways of extending the UI.
