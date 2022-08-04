# Resource options

Avo effortlessly empowers you to build a full admin dashboard for your Ruby on Rails application.
One of the most powerful features is how easy you can administer your database records.

Similarly to how you configure your database layer using Rails models, Avo uses `Resource` files. Each resource maps out one of your models. There can be multiple eesource associated to the same model.

All resources are located in the `app/avo/resources` directory. Resources can't be namespaced yet so they all need to be in the root level of that directory.

## Defining Resources

```bash
bin/rails generate avo:resource post
```

This command will generate the `PostResource` file in `app/avo/resources/post_resource.rb` with the following code:

```ruby
# app/avo/resources/post_resource.rb
class PostResource < Avo::BaseResource
  self.title = :id
  self.includes = []
  # self.search_query = ->(params:) do
  #   scope.ransack(id_eq: params[:q], m: "or").result(distinct: false)
  # end

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

### Using a computed title

You can use a computed `title` property for your resources if the field that is the title is not that unique.

```ruby{2}
# app/avo/resources/comment_resource.rb
class CommentResource < Avo::BaseResource
  self.title = :tiny_name

  # fieldd go here
end

# app/models/comment.rb
class Comment < ApplicationRecord
  def tiny_name
    ActionView::Base.full_sanitizer.sanitize(body).truncate 30
  end
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
  self.description = -> do
    if view == :index
    "These are the users of the app"
    else
      if user.is_admin?
        "You can update all properties for this user: #{model.id}"
      else
        "You can update some properties for this user: #{model.id}"
      end
    end
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

Each resource will be available in four views;

#### Index

**Index** is where you see all your resources listed in a table or a [grid](grid-view.md)

#### Show

**Show** is where you get to see one resource in more detail.

#### Edit

**Edit** is where you can edit one resource.

#### Create

**Create** is where you can create a new resource.

### Grid view

On **Index**, the most common view type is `:table`, but you might have some data that you want to display in a **grid**. You can change that by setting `default_view_type` to `:grid` and by adding the `grid` block.

<img :src="('/assets/img/grid-view.jpg')" alt="Avo grid view" class="border mb-4" />

```ruby{2}
class PostResource < Avo::BaseResource
  self.default_view_type = :grid
end
```

Find out more on the [grid view documentation page](grid-view).

## Custom model class

You might have a model that belongs to a namespace or that has a different name than than the resource. For that scenario you can use the `@model` option to tell Avo which model to reference.

```ruby{2}
class DelayedJobResource < Avo::BaseResource
  self.model_class = ::Delayed::Job

  field :id, as: :id
  # ... other fields go here
end
```

## Routing

When generating a resource, Avo will automatically generate routes based on the resource name.

```
PostResource -> /avo/resources/posts
PhotoCommentResource -> /avo/resources/photo_comments
```

If you change the resource name you should change the generated controller name too.

## Devise password optional

If you use `devise` and you update your user models (usually `User`) without passing a password you will get a validation error. You can use `devise_password_optional` to stop receiving that error. It will [strip out](https://stackoverflow.com/questions/5113248/devise-update-user-without-password/11676957#11676957) the `password` key from `params`.

```ruby
class UserResource < Avo::BaseResource
  self.devise_password_optional = true
end
```

## Unscoped queries on `Index`

You might have a `default_scope` on your model that you don't want to be applied when you render the `Index` view.

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

When you get started, the sidebar will be auto-generated for you with all the dashboards, resources and custom tools. You may have resources that should not appear on the sidebar which you can hide using the `visible_on_sidebar` option.

```ruby{3}
class TeamMembershipResource < Avo::BaseResource
  self.title = :id
  self.visible_on_sidebar = false

  # fields declaration
end
```

<Alert type="warning" details-link="/2.0/menu-editor.html#item-visibility">
  This option is used in the <strong>auto-generated menu</strong>, not in the <strong>menu editor</strong>. <br/> You'll have to use your own logic in the <code>visible</code> block for that.
</Alert>

## Extending `Avo::ResourcesController`

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

