# Resource options

Avo effortlessly empowers you to build an entire customer-facing interface for your Ruby on Rails application. One of the most powerful features is how easy you can administer your database records using the CRUD UI.

## Overview

Similar to how you configure your database layer using Rails  `Model` files and their DSL, Avo's CRUD UI is configured using `Resource` files.

Each `Resource` maps out one of your models. There can be multiple `Resource`s associated to the same model if you need that.

All resources are located in the `app/avo/resources` directory. Unfortunately, `Resource`s can't be namespaced yet, so they all need to be in the root level of that directory.

## Resources from model generation

```bash
bin/rails generate model car make:string mileage:integer
```

Running this command will generate the expected Rails files for a model and for Avo the `CarResource` and `CarsController`.

The auto-generated resource file will look like this:

```ruby
class CarResource < Avo::BaseResource
  self.title = :id
  self.includes = []
  # self.search_query = -> do
  #   scope.ransack(id_eq: params[:q], m: "or").result(distinct: false)
  # end

  field :id, as: :id
  # Generated fields from model
  field :make, as: :text
  field :mileage, as: :number
  # add fields here
end
```

This behavior can be ommited by using the argument `--skip-avo-resource`. For example if we want to generate a `Car` model but no Avo counterpart we should use the following command:

```bash
bin/rails generate model car make:string kms:integer --skip-avo-resource
```

## Manually defining resources

```bash
bin/rails generate avo:resource post
```

This command will generate the `PostResource` file in `app/avo/resources/post_resource.rb` with the following code:

```ruby
# app/avo/resources/post_resource.rb
class PostResource < Avo::BaseResource
  self.title = :id
  self.includes = []
  # self.search_query = -> do
  #   scope.ransack(id_eq: params[:q], m: "or").result(distinct: false)
  # end

  field :id, as: :id
  # add fields here
end
```

From this config, Avo will infer a few things like the resource's model will be the `Post` model and the name of the resource is `Post`. But all of those inferred things are actually overridable.

Now, let's say we already have a model Post well defined with the following attributes:

```ruby
# == Schema Information
#
# Table name: posts
#
#  id           :bigint           not null, primary key
#  name         :string
#  body         :text
#  is_featured  :boolean
#  published_at :datetime
#  user_id      :bigint
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  status       :integer          default("draft")
#
class Post < ApplicationRecord
 enum status: [:draft, :published, :archived]

 validates :name, presence: true

 has_one_attached :cover_photo
 has_one_attached :audio
 has_many_attached :attachments

 belongs_to :user, optional: true
 has_many :comments, as: :commentable
 has_many :reviews, as: :reviewable

 acts_as_taggable_on :tags
end
```

In this case, the avo resource will generate the fields (without any configuration) from the model attributes and relationships resulting in the following resource:

```ruby
class PostResource < Avo::BaseResource
  self.title = :id
  self.includes = []
  # self.search_query = -> do
  #   scope.ransack(id_eq: params[:q], m: "or").result(distinct: false)
  # end

  field :id, as: :id
  # Generated fields from model
  field :name, as: :text
  field :body, as: :textarea
  field :is_featured, as: :boolean
  field :published_at, as: :datetime
  field :user_id, as: :number
  field :status, as: :select, enum: ::Post.statuses
  field :cover_photo, as: :file
  field :audio, as: :file
  field :attachments, as: :files
  field :user, as: :belongs_to
  field :comments, as: :has_many
  field :reviews, as: :has_many
  field :tags, as: :tags
  # add fields here
end
```

It's also possible to specify the resource model class. For example, if we want to create a new resource named `MiniPostResource` using the `Post` model we can do that using the following command:

```bash
bin/rails generate avo:resource mini-post --model-class post
```

That command will create a new resource with the same attributes as the post resource above with specifying the `model_class`:

```ruby
class MiniPostResource < Avo::BaseResource
  self.model_class = ::Post
end
```

:::info
You can see the result in the admin panel using this URL `/avo`. The `Post` resource will be visible on the left sidebar.
:::
### Fields

`Resource` files tell Avo what models should be displayed in the UI, but not what kinds of data they hold. You do that using fields.
One can add more fields to this resource below the `id` field using the `field DATABASE_COLUMN, as: FIELD_TYPE, **FIELD_OPTIONS` signature.

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

## Use multiple resources for the same model

<VersionReq version="2.15" />

### `model_resource_mapping`

Usually, an Avo Resource maps to one Rails model. So there will be a one-to-one relationship between them. But there will be scenarios where you'd like to create another resource for the same model.

Let's take as an example the `User` model. You'll have an `UserResource` associated with it.

```ruby
# app/models/user.rb
class User < ApplicationRecord
end

# app/avo/resources/user_resource.rb
class UserResource < Avo::BaseResource
  self.title = :name

  field :id, as: :id, link_to_resource: true
  field :email, as: :gravatar, link_to_resource: true, as_avatar: :circle
  field :first_name, as: :text, required: true, placeholder: "John"
  field :last_name, as: :text, required: true, placeholder: "Doe"
end
```

![](/assets/img/resources/model-resource-mapping-1.jpg)

So when you click on the Users sidebar menu item, you get to the `Index` page where all the users will be displayed. The information displayed will be the gravatar image, the first and the last name.

Let's say we have a `Team` model with many `User`s. You'll have a `TeamResource` like so:

```ruby{11}
# app/models/team.rb
class Team < ApplicationRecord
end

# app/avo/resources/team_resource.rb
class TeamResource < Avo::BaseResource
  self.title = :name

  field :id, as: :id, link_to_resource: true
  field :name, as: :text
  field :users, as: :has_many
end
```

From that configuration, Avo will figure out that the `users` field points to the `UserResource` and will use that one to display the users.

But, let's imagine that we don't want to display the gravatar on the `has_many` association, and we want to show the name on one column and the number of projects the user has on another column.
We can create a different resource named `TeamUserResource` and add those fields.

```ruby
# app/avo/resources/team_user_resource.rb
class TeamUserResource < Avo::BaseResource
  self.title = :name

  field :id, as: :id, link_to_resource: true
  field :name, as: :text
  field :projects_count, as: :number
end
```

We also need to update the `TeamResource` to use the new `TeamUserResource` for reference.

```ruby
# app/avo/resources/team_resource.rb
class TeamResource < Avo::BaseResource
  self.title = :name

  field :id, as: :id, link_to_resource: true
  field :name, as: :text
  field :users, as: :has_many, use_resource: TeamUserResource
end
```

![](/assets/img/resources/model-resource-mapping-2.jpg)

But now, if we visit the `Users` page, we will see the fields for the `TeamUserResource` instead of `UserResource`, and that's because Avo fetches the resources in an alphabetical order, and `TeamUserResource` is before `UserResource`. That's definitely not what we want.
The same might happen if you reference the `User` in other associations throughout your resource files.

To mitigate that, we are going to use the `model_resource_mapping` option to set the "default" resource for a model.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.model_resource_mapping = {
    'User': 'UserResource'
  }
end
```

That will "shortcircuit" the regular alphabetical search and use the `UserResource` every time we don't specify otherwise.

We can still tell Avo which resource to use in other `has_many` or `has_and_belongs_to_many` associations with the [`use_resource`](./associations/has_many#default-4) option.

## Setting the title of the resource

Initially, the `title` attribute is set to `:id`, so the model's `id` attribute will be used to display the resource in search results and belongs select fields. You usually change it to something more representative, like the model's `title`, `name` or `label` attributes.

```ruby
class PostResource < Avo::BaseResource
  self.title = :name # it will now reference @post.name to show you the title
end
```

### Using a computed title

If you don't have a `title`, `name`, or `label` attribute in the database, you can add a getter method to your model where you compose the name.

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

You might want to display information about the current resource to your users. Then, using the `description` class attribute, you can add some text to the `Index`, `Show`, `Edit`, and `New` views.

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

This is the more customizable method where you can access the `model`, `view`, `user` (the current user), and `params` objects.

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

If you regularly need access to a resource's associations, you can tell Avo to eager load those associations on the **Index** view using `includes`. That will help you avoid those nasty `n+1` performance issues.

```ruby
class PostResource < Avo::BaseResource
  self.includes = [:user, :tags]
end
```

## Views

Avo generates the admin panel with four main views.

#### Index

The paget where you see all your resources listed in a table or a [grid](grid-view.md).

#### Show

The paget where you see one resource in more detail.

#### Edit

The paget where you can edit one resource.

#### Create

The paget where you can create a new resource.

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

You might have a model that belongs to a namespace or has a different name than the resource. For that scenario, you can use the `@model` option to tell Avo which model to reference.

```ruby{2}
class DelayedJobResource < Avo::BaseResource
  self.model_class = ::Delayed::Job

  field :id, as: :id
  # ... other fields go here
end
```

## Routing

Avo will automatically generate routes based on the resource name when generating a resource.

```
PostResource -> /avo/resources/posts
PhotoCommentResource -> /avo/resources/photo_comments
```

If you change the resource name, you should change the generated controller name too.

## Devise password optional

If you use `devise` and update your user models (usually `User`) without passing a password, you will get a validation error. You can use `devise_password_optional` to stop receiving that error. It will [strip out](https://stackoverflow.com/questions/5113248/devise-update-user-without-password/11676957#11676957) the `password` key from `params`.

```ruby
class UserResource < Avo::BaseResource
  self.devise_password_optional = true
end
```

Related:

- [Password field](./fields/password)

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

## Hide resource from the sidebar

When you get started, the sidebar will be auto-generated for you with all the dashboards, resources, and custom tools. However, you may have resources that should not appear on the sidebar, which you can hide using the `visible_on_sidebar` option.

```ruby{3}
class TeamMembershipResource < Avo::BaseResource
  self.title = :id
  self.visible_on_sidebar = false

  # fields declaration
end
```

:::warning
  This option is used in the **auto-generated menu**, not in the **menu editor**.

  You'll have to use your own logic in the [`visible`](./menu-editor#item-visibility) block for that.
:::

## Extending `Avo::ResourcesController`

You may need to execute additional actions on the `ResourcesController` before loading the Avo pages. You can create an `Avo::BaseResourcesController` and extend your resource controller from it.

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

If you have a lot of fields on a resource, that form might get pretty tall. So it would be useful to have the `Save` button in the footer of that form.

You can do that by setting the `buttons_on_form_footers` option to `true` in your initializer. That will add the `Back` and `Save` buttons on the footer of that form for the `New` and `Edit` screens.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.buttons_on_form_footers = true
end
```

<img :src="('/assets/img/resources/buttons_on_footer.jpg')" alt="Buttons on footer" class="border mb-4" />

## Customize what happens after a record is created/edited

For some resources, it might make sense to redirect to something other than the `Show` view. With `after_create_path` and `after_update_path` you can control that.

The valid options are `:show` (default), `:edit`, or `:index`.

```ruby{2-3}
class CommentResource < Avo::BaseResource
  self.after_create_path = :index
  self.after_update_path = :edit

  field :id, as: :id
  field :body, as: :textarea
end
```

## Hide the record selector checkbox

You might have resources that will never be selected, and you do not need that checkbox to waste your horizontal space.

You can hide it using the `record_selector` class_attribute.

```ruby{2}
class CommentResource < Avo::BaseResource
  self.record_selector = false

  field :id, as: :id
  field :body, as: :textarea
end
```

<img :src="('/assets/img/resources/record_selector.jpg')" alt="Hide the record selector." class="border mb-4" />

