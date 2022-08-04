# Resources

[[toc]]

<a href="https://github.com/avo-hq/avo/discussions/835" target="_blank" class="rounded bg-purple-600 hover:bg-purple-500 text-white no-underline px-2 py-1 inline leading-none mt-2">
  Provide feedback
</a>

Avo effortlessly empowers you to build a full admin dashboard for your Ruby on Rails application.
One of the most powerful features is how easy you can administer your database records.
Avo does this using **Resources**. Each resource maps out one of your models.

## Defining Resources

```bash
bin/rails generate avo:resource post
```

This command will generate a resource file under your `app/avo/resources` directory. The `app/avo` directory will have all of your Avo resource files.

The created resource file will have the following code:

```ruby
class PostResource < Avo::BaseResource
  self.title = :id
  self.includes = []

  field :id, as: :id
  # add fields here
end
```

From this config, Avo will infer that the resource's model will be the `Post` model.

You can add more fields to this resource below the `id` field.

```ruby{5-15}
class PostResource < Avo::BaseResource
  self.title = :id
  self.includes = []

  field :id, as: :id
  field :name, as: :text, required: true
  field :body, as: :trix, placeholder: "Add the post body here", always_show: false
  field :cover_photo, as: :file, is_image: true, link_to_resource: true
  field :is_featured, as: :boolean

  field :is_published, as: :boolean do |model|
    model.published_at.present?
  end

  field :user, as: :belongs_to, placeholder: "—"
end
```

## Setting the title of the resource

Initially, the `title` attribute is set to `:id`, so the model's `id` attribute will be used to display the resource in search results and belongs select fields. You usually change it to something more representative, like the model's `title`, `name` or `label` attributes.

```ruby
class PostResource < Avo::BaseResource
  self.title = :name # it will now reference @post.name to show you the title
end
```

## Resource description

You might want to display some information about the current resource to your users. Using the `description` class attribute, you can add some text to the `Index`, `Show`, `Edit`, and `New` views.

<img :src="('/assets/img/resources/description.jpg')" alt="Avo message" class="border mb-4" />

There are two ways of setting the description. The quick way as a `string` and the more customizable way as a `block`.

### Set the description as a string

```ruby{3}
class UserResource < Avo::BaseResource
  self.title = :name
  self.description = "These are the users of the app."
end
```

This is the quick way to set the label, and it will be displayed **only on the `Index` page**. If you want to show the message on all views, use the block method.

### Set the description as a block

This is the more customizable method where you have access to the `model`, `view`, `user` (the current user), and `params` objects.

```ruby{3-13}
class UserResource < Avo::BaseResource
  self.title = :name
  self.description = -> {
    if view == :index
    "These are the users of the app"
    else
      if user.is_admin?
        "You can update all properties for this user: #{model.id}"
      else
        "You can update some properties for this user: #{model.id}"
      end
    end
  }
end
```

## Using a computed title

You can use a computed `title` property for your resources if the field that is the title is not that unique.

```ruby{2}
# app/avo/resources/comment_resource.rb
class CommentResource < Avo::BaseResource
  self.title = :tiny_name

  # field go here
end

# app/models/comment.rb
class Comment < ApplicationRecord
  def tiny_name
    ActionView::Base.full_sanitizer.sanitize(body).truncate 30
  end
end
```

## Eager loading

If you regularly need access to a resource's associations, you can tell Avo to eager load those associations on the **Index** view using `includes`. This will help you avoid those nasty `n+1` performance issues.

```ruby
class PostResource < Avo::BaseResource
  self.includes = [:user, :tags]
end
```

## Views

Each generated resource will have four views **Index** view where you see all your resources listed, **Show** view where you get to see one resource in more detail, **Edit** view where you can edit one resource and **Create** view where you can create a new resource.

### Grid view

On **Index view**, the most common view type is `:table`. You might have some data that you want to display in a **grid view**. You change that by setting `default_view_type` to `:grid` and add the `grid` block.

<img :src="('/assets/img/grid-view.jpg')" alt="Avo grid view" class="border mb-4" />

```ruby
class PostResource < Avo::BaseResource
  self.default_view_type = :grid
end
```

See how you can customize the grid item in the additional [grid view documentation](grid-view).

## Custom model class

You might have a model that belongs to a namespace or that has a different name than than the resource. For those occasions you can use the `@model` option to tell Avo which model to reference.

```ruby{2}
class DelayedJobResource < Avo::BaseResource
  self.model_class = ::Delayed::Job

  field :id, as: :id
  # ... other fields go here
end
```

### `model_class` with namespace

Because the controllers are generated, when changing the `model_class` for a resource, you might brake the model->route link, so make sure you update the controller too.

```ruby{7-8,12-13}
# app/avo/resources/store_resource.rb
class StoreResource < Avo::BaseResource
  self.model_class = Spree::Store
end

# Before
# app/controllers/avo/stores_controller.rb
class Avo::StoresController < Avo::ResourcesController
end

# After
# app/controllers/avo/spree_stores_controller.rb
class Avo::SpreeStoresController < Avo::ResourcesController
end
```

## Devise password optional

If you use `devise` and you update your user models (usually `User`) without passing a password you will get a validation error. You can use `devise_password_optional` to stop receiving that error. It will [strip out](https://stackoverflow.com/questions/5113248/devise-update-user-without-password/11676957#11676957) the `password` key from `params`.

```ruby
class UserResource < Avo::BaseResource
  self.devise_password_optional = true
end
```

## Unscoped queries on `Index`

You might have a `default_scope` on your model and you don't want it to be applied to your resource when rendered on the Index view.

```ruby{2}
class Project < ApplicationRecord
  default_scope { order(name: :asc) }
end
```

You can unscope the query using the `unscoped_queries_on_index` (defaults to `false`) class variable on that resource.

```ruby{3}
class ProjectResource < Avo::BaseResource
  self.title = :name
  self.unscoped_queries_on_index = true

  # fields go here
end
```

## Hide resource from sidebar

You may hide a resource from the sidebar using the `visible_on_sidebar` class attribute.


```ruby{3}
class TeamMembershipResource < Avo::BaseResource
  self.title = :id
  self.visible_on_sidebar = false

  # fields declaration
end
```

**Warning**: This option is for the generated menu, not for the [menu editor](menu-editor.html). You have to use your own logic in the [`visible` block](menu-editor.html#item-visibility) for that.

## Extend the Avo::ResourcesController

You may need to execute additional actions on the `ResourcesController` before loading the Avo pages. You can do that by creating an `Avo::BaseResourcesController` and extend your resource controller from it.

```ruby
# app/controllers/avo/base_resources_controller.rb
class Avo::BaseResourcesController < Avo::ResourcesController
  include AuthenticationController::Authentication

  before_action :is_logged_in?
end

# app/controllers/avo/posts_controller.rb
class Avo::PostsController < Avo::BaseResourcesController
end
```

*You can't use `Avo::BaseController` and `Avo::ResourcesController` as **your base controller**. They are defined inside Avo.*

## Records ordering

**Requires V 1.24.2 +**

<div class="rounded-md bg-blue-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-blue-700">
        Records ordering is a <a href="https://avohq.io/purchase/pro" target="_blank" class="underline">pro</a> feature
      </div>
    </div>
  </div>
</div>

A typical scenario is when you need to set your records into a specific order. Like re-ordering `Slide`s inside a `Carousel` or `MenuItem`s inside a `Menu`.

The `ordering` class attribute is your friend for this. You can set four actions `higher`, `lower`, `to_top` or `to_bottom`, and the `display_inline` and `visible_on` options.
The actions themselves are simple lambda functions but coupled with your logic or an ordering gem, they can be quite powerful.

I'll demonstrate the ordering feature using the `act_as_list` gem.

You need to install and configure the gem as instructed in the [tutorials](https://github.com/brendon/acts_as_list#example). Please make sure you [give all records position attribut values](https://github.com/brendon/acts_as_list#adding-acts_as_list-to-an-existing-model) so the gem works appropriately.

Next, you add the order actions like below.

```ruby
class CourseLinkResource < Avo::BaseResource
  self.ordering = {
    visible_on: :index,
    actions: {
      higher: -> { record.move_higher },
      lower: -> { record.move_lower },
      to_top: -> { record.move_to_top },
      to_bottom: -> { record.move_to_bottom },
    }
  }
end
```

The `record` is the actual instantiated model. The `move_higher`, `move_lower`, `move_to_top`, and `move_to_bottom` methods are provided by `act_as_list`. If you're not using that gem, you can add your own logic inside to change the position of the record.

The actions have access to `record`, `resource`, `options` (the `ordering` class attribute) and `params` (the `request` params).

That configuration will generate a button with a popover containing the ordering buttons.

<img :src="('/assets/img/resources/ordering_hover.jpg')" alt="Avo ordering" class="border mb-4" />

### Always show the order buttons

If the resource you're trying to update requires re-ordering often, you can have the buttons visible at all times using the `display_inline: true` option.

```ruby
class CourseLinkResource < Avo::BaseResource
  self.ordering = {
    display_inline: true,
    visible_on: :index,
    actions: {
      higher: -> (record) { record.move_higher },
      lower: -> (record) { record.move_lower },
      to_top: -> (record) { record.move_to_top },
      to_bottom: -> (record) { record.move_to_bottom },
    }
  }
end
```

<img :src="('/assets/img/resources/ordering_visible.jpg')" alt="Avo ordering" class="border mb-4" />

### Display the buttons in the `Index` view or association view

A common scenario is to order the records only in the scope of a parent record like order the `MenuItems` for a `Menu` or `Slides` for a `Slider`. So you wouldn't need to have the order buttons on the `Index` view but only in the association section.

To control that you can use the `visible_on` option. THe possible values are `:index`, `:association` or `[:index, :association]` for both views.

<!-- Follow this video guide on how you could implement the feature in your app.

<iframe style="width: 100%; aspect-ratio: 16/9" src="https://www.youtube.com/embed/LEALfPiyfRk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> -->

## Show buttons on form footers

If you have a lot of fields on a resource, that form might get pretty tall. It would be useful to have the `Save` button in the footer of that form.

You can do that by setting the `buttons_on_form_footers` option to `true` in your initializer. That will add the `Back` and `Save` buttons on the footer of that form for the `New` and `Edit` screens.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.buttons_on_form_footers = true
end
```

<img :src="('/assets/img/resources/buttons_on_footer.jpg')" alt="Buttons on footer" class="border mb-4" />

## Customize what happens after record is created/edited

For some resources it might make sense to redirect to something else than the `Show` view. With `after_create_path` and `after_update_path` you can control that.

The valid options are `:show` (default) or `:index`.

```ruby{2-3}
class CommentResource < Avo::BaseResource
  self.after_create_path = :index
  self.after_update_path = :index

  field :id, as: :id
  field :body, as: :textarea
end
```

## Hide the record selector checkbox

You might have resources that will never be selected and you have no need for that checkbox to waste your horizontal space.

You can hide it using the `record_selector` class_attribute.

```ruby{2}
class CommentResource < Avo::BaseResource
  self.record_selector = false

  field :id, as: :id
  field :body, as: :textarea
end
```

<img :src="('/assets/img/resources/record_selector.jpg')" alt="Hide the record selector." class="border mb-4" />

## Filters

It's a very common scenario to add filters to your resources to make it easier to find your records. Check out the additional [Filters documentation](./filters.html) to see how easy it is to set up custom filters with Avo.

<img :src="('/assets/img/filters.jpg')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

## Actions

Most of the time, you will want to trigger some events against your records or run more heavy updates. Avo makes this so easy with **Actions**.

<img :src="('/assets/img/actions.jpg')" alt="Avo actions" class="border mb-4" />

Check out the additional [Actions documentation](./actions.html).

## Search

Check out the additional [Search documentation](./search.html).
