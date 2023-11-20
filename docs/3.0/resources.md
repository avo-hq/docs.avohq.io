# Resource options

Avo effortlessly empowers you to build an entire customer-facing interface for your Ruby on Rails application. One of the most powerful features is how easy you can administer your database records using the CRUD UI.

## Overview

Similar to how you configure your database layer using the Rails models and their DSL, Avo's CRUD UI is configured using `Resource` files.

Each `Resource` maps out one of your models. There can be multiple `Resource`s associated to the same model if you need that.

All resources are located in the `app/avo/resources` directory.

## Resources from model generation

```bash
bin/rails generate model car make:string mileage:integer
```

Running this command will generate the standard Rails files (model, controller, etc.) and `Avo::Resources::Car` & `Avo::CarsController` for Avo.

The auto-generated resource file will look like this:

```ruby
class Avo::Resources::Car < Avo::BaseResource
  self.includes = []
  # self.search = {
  #   query: -> { query.ransack(id_eq: params[:q], m: "or").result(distinct: false) }
  # }

  def fields
    field :id, as: :id
    field :make, as: :text
    field :mileage, as: :number
  end
end
```

This behavior can be omitted by using the argument `--skip-avo-resource`. For example if we want to generate a `Car` model but no Avo counterpart we should use the following command:

```bash
bin/rails generate model car make:string kms:integer --skip-avo-resource
```

## Manually defining resources

```bash
bin/rails generate avo:resource post
```

This command will generate the `Post` resource file in `app/avo/resources/post.rb` with the following code:

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.includes = []
  # self.search = {
  #   query: -> { query.ransack(id_eq: params[:q], m: "or").result(distinct: false) }
  # }

  def fields
    field :id, as: :id
  end
end
```

From this config, Avo will infer a few things like the resource's model will be the `Post` model and the name of the resource is `Post`. But all of those inferred things are actually overridable.

Now, let's say we already have a model `Post` well defined with attributes and associations. In that case, the Avo resource will be generated with the fields attributes and associations.

::: code-group

```ruby [app/models/post.rb]
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

```ruby [app/avo/resource/post.rb]
class Avo::Resources::Post < Avo::BaseResource
  self.includes = []
  # self.search = {
  #   query: -> { query.ransack(id_eq: params[:q], m: "or").result(distinct: false) }
  # }

  def fields
    field :id, as: :id
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
  end
end
```

:::

It's also possible to specify the resource model class. For example, if we want to create a new resource named `MiniPost` resource using the `Post` model we can do that using the following command:

```bash
bin/rails generate avo:resource mini-post --model-class post
```

That command will create a new resource with the same attributes as the post resource above with specifying the `model_class`:

```ruby
class Avo::Resources::MiniPost < Avo::BaseResource
  self.model_class = ::Post
end
```

:::info
You can see the result in the admin panel using this URL `/avo`. The `Post` resource will be visible on the left sidebar.
:::

## Fields

`Resource` files tell Avo what records should be displayed in the UI, but not what kinds of data they hold. You do that using the `fields` method.

Read more about the fields [here](./fields).

```ruby{5-17}
class Avo::Resources::Post < Avo::BaseResource
  self.title = :id
  self.includes = []

  def fields
    field :id, as: :id
    field :name, as: :text, required: true
    field :body, as: :trix, placeholder: "Add the post body here", always_show: false
    field :cover_photo, as: :file, is_image: true, link_to_record: true
    field :is_featured, as: :boolean

    field :is_published, as: :boolean do
      record.published_at.present?
    end

    field :user, as: :belongs_to, placeholder: "—"
  end
end
```

## Routing

Avo will automatically generate routes based on the resource name when generating a resource.

```
Avo::Resources::Post         -> /avo/resources/posts
Avo::Resources::PhotoComment -> /avo/resources/photo_comments
```

If you change the resource name, you should change the generated controller name too.

## Use multiple resources for the same model

Usually, an Avo Resource maps to one Rails model. So there will be a one-to-one relationship between them. But there will be scenarios where you'd like to create another resource for the same model.

Let's take as an example the `User` model. You'll have an `User` resource associated with it.

```ruby
# app/models/user.rb
class User < ApplicationRecord
end

# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_record: true
    field :email, as: :gravatar, link_to_record: true, as_avatar: :circle
    field :first_name, as: :text, required: true, placeholder: "John"
    field :last_name, as: :text, required: true, placeholder: "Doe"
  end
end
```

![](/assets/img/resources/model-resource-mapping-1.jpg)

So when you click on the Users sidebar menu item, you get to the `Index` page where all the users will be displayed. The information displayed will be the gravatar image, the first and the last name.

Let's say we have a `Team` model with many `User`s. You'll have a `Team` resource like so:

```ruby{12}
# app/models/team.rb
class Team < ApplicationRecord
end

# app/avo/resources/team.rb
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_record: true
    field :name, as: :text
    field :users, as: :has_many
  end
end
```

From that configuration, Avo will figure out that the `users` field points to the `User` resource and will use that one to display the users.

But, let's imagine that we don't want to display the gravatar on the `has_many` association, and we want to show the name on one column and the number of projects the user has on another column.
We can create a different resource named `TeamUser` resource and add those fields.

```ruby
# app/avo/resources/team_user.rb
class Avo::Resources::TeamUser < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_record: true
    field :name, as: :text
    field :projects_count, as: :number
  end
end
```

We also need to update the `Team` resource to use the new `TeamUser` resource for reference.

```ruby
# app/avo/resources/team.rb
class Avo::Resources::Team < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id, link_to_record: true
    field :name, as: :text
    field :users, as: :has_many, use_resource: Avo::Resources::TeamUser
  end
end
```

![](/assets/img/resources/model-resource-mapping-2.jpg)

But now, if we visit the `Users` page, we will see the fields for the `TeamUser` resource instead of `User` resource, and that's because Avo fetches the resources in an alphabetical order, and `TeamUser` resource is before `User` resource. That's definitely not what we want.
The same might happen if you reference the `User` in other associations throughout your resource files.

To mitigate that, we are going to use the `model_resource_mapping` option to set the "default" resource for a model.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.model_resource_mapping = {
    'User': 'Avo::Resources::User'
  }
end
```

That will "shortcircuit" the regular alphabetical search and use the `User` resource every time we don't specify otherwise.

We can still tell Avo which resource to use in other `has_many` or `has_and_belongs_to_many` associations with the [`use_resource`](./associations/has_many#default-4) option.

## Namespaced resources

`Resource`s can't be namespaced yet, so they all need to be in the root level of that directory. If you have a model `Super::Dooper::Trooper::Model` you can use `Avo::Resources::SuperDooperTrooperModel` with the `model_class` option.

```ruby
class Avo::Resources::SuperDooperTrooperModel < Avo::BaseResource
  self.model_class = "Super::Dooper::Trooper::Model"
end
```

## Views

Please read the detailed [views](./views.html) page.


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

:::warning
You can't use `Avo::BaseController` and `Avo::ResourcesController` as **your base controller**. They are defined inside Avo.
:::

When you generate a new resource or controller in Avo, it won't automatically inherit from the `Avo::BaseResourcesController`. However, you have two approaches to ensure that the new generated controllers inherit from a custom controller:

### `--parent-controller` option on the generators
Both the `avo:controller` and `avo:resource` generators accept the `--parent-controller` option, which allows you to specify the controller from which the new controller should inherit. Here are examples of how to use it:

```bash
rails g avo:controller city --parent-controller Avo::BaseResourcesController
rails g avo:resource city --parent-controller Avo::BaseResourcesController
```

### `resource_parent_controller` configuration option
You can configure the `resource_parent_controller` option in the `avo.rb` initializer. This option will be used to establish the inherited controller if the `--parent-controller` argument is not passed on the generators. Here's how you can do it:

```ruby
Avo.configure do |config|
  # ...
  config.resource_parent_controller = "Avo::BaseResourcesController" # "Avo::ResourcesController" is default value
  # ...
end
```

### Attach concerns to `Avo::BaseController`

Alternatively you can use [this guide](https://avohq.io/blog/safely-extend-a-ruby-on-rails-controller) to attach methods, actions, and hooks to the main `Avo::BaseController` or `Avo::ApplicationController`.


## Manually registering resources

In order to have a more straightforward experience when getting started with Avo, we are eager-loading the `app/avo/resources` directory.
That makes all those resources available to your app without you doing anything else.

If you want to manually load them use the `config.resources` option.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.resources = [
    "Avo::Resources::User",
    "Avo::Resources::Fish",
  ]
end
```

This tells Avo which resources you use and stops the eager-loading process on boot-time.
This means that other resources that are not declared in this array will not show up in your app.


## Resource Options

Resources have a few options available for customization.

:::option `self.title`

Each Avo resource will try to figure out what the title of a record is. It will try the following attributes in order `name`, `title`, `label`, and fallback to the `id`.

You can change it to something more specific, like the model's `first_name` or `slug` attributes.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.title = :slug # it will now reference @post.slug to show the title
end
```

### Using a computed title

If you don't have a `title`, `name`, or `label` attribute in the database, you can add a getter method to your model where you compose the name.

```ruby{3,8-10}
# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :tiny_name
end

# app/models/comment.rb
class Comment < ApplicationRecord
  def tiny_name
    ActionView::Base.full_sanitizer.sanitize(body).truncate 30
  end
end
```

### `title` as a block

If you prefer not to use any record methods and instead compute the resource's title directly within the resource itself, you can accomplish this by assigning a lambda function to the `title` class attribute. You'll have access to `resource` and `record`.

```ruby{3-5}
# app/avo/resources/comment.rb
class Avo::Resources::Comment < Avo::BaseResource
  self.title = -> {
    ActionView::Base.full_sanitizer.sanitize(record.body).truncate 30
  }
end
:::

:::option `self.description`

You might want to display information about the current resource to your users. Then, using the `description` class attribute, you can add some text to the `Index`, `Show`, `Edit`, and `New` views.

<img :src="('/assets/img/resources/description.png')" alt="Avo message" class="border mb-4" />

There are two ways of setting the description. The quick way as a `string` and the more customizable way as a `block`.

### Set the description as a string

```ruby{3}
class Avo::Resources::User < Avo::BaseResource
  self.title = :name
  self.description = "These are the users of the app."
end
```

This is the quick way to set the label, and it will be displayed **on all pages**. If you want to restrict the message to custom views, use a lambda function.

### Set the description as a block

This is the more customizable method where you can access the `record`, `resource`, `view`, `current_user`, and `params` objects.

```ruby{3-13}
class Avo::Resources::User < Avo::BaseResource
  self.title = :name
  self.description = -> do
    if view == :index
    "These are the users of the app"
    else
      if current_user.is_admin?
        "You can update all properties for this user: #{record.id}"
      else
        "You can update some properties for this user: #{record.id}"
      end
    end
  end
end
```
:::

:::option `self.includes`

If you regularly need access to a resource's associations, you can tell Avo to eager load those associations on the <Index /> view using `includes`.

That will help you avoid those nasty `n+1` performance issues.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.includes = [:user, :tags]
end
```
:::

:::option `default_view_type`

On <Index />, the most common view type is `:table`, but you might have some data that you want to display in a `:grid` or `:map`. You can change that by setting `default_view_type` to `:grid` and by adding the `grid` block.

<img :src="('/assets/img/grid-view.jpg')" alt="Avo grid view" class="border mb-4" />

```ruby{2}
class Avo::Resources::Post < Avo::BaseResource
  self.default_view_type = :grid
end
```

Find out more on the [grid view documentation page](grid-view).
:::

:::option `self.model_class`

For some resources you might have a model that is namespaced, or you might have a secondary resource for a model. For that scenario, you can use the `self.model_class` option to tell Avo which model to reference in that resource.

```ruby{2}
class Avo::Resources::DelayedJob < Avo::BaseResource
  self.model_class = ::Delayed::Job

  def fields
    field :id, as: :id
  end
end
```

:::

:::option `self.devise_password_optional`

If you use `devise` and update your user models (usually `User`) without passing a password, you will get a validation error. You can use `devise_password_optional` to stop receiving that error. It will [strip out](https://stackoverflow.com/questions/5113248/devise-update-user-without-password/11676957#11676957) the `password` key from `params`.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.devise_password_optional = true
end
```

### Related

- [Password field](./fields/password)

:::

::::option `self.visible_on_sidebar`

When you get started, the sidebar will be auto-generated for you with all the [dashboards](./dashboards), resources, and [custom tools](./custom-tools).
However, you may have resources that should not appear on the sidebar, which you can hide using the `visible_on_sidebar` option.

```ruby{2}
class Avo::Resources::TeamMembership < Avo::BaseResource
  self.visible_on_sidebar = false
end
```

:::warning
This option is used in the **auto-generated menu**, not in the [menu editor](./menu-editor).

You'll have to use your own logic in the [`visible`](./menu-editor#item-visibility) block for that.
:::
::::

:::option `config.buttons_on_form_footers`

If you have a lot of fields on a resource, that form might get pretty tall. So it would be useful to have the `Save` button in the footer of that form.

You can do that by setting the `buttons_on_form_footers` option to `true` in your initializer. That will add the `Back` and `Save` buttons on the footer of that form for the `New` and `Edit` screens.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.buttons_on_form_footers = true
end
```

<img :src="('/assets/img/resources/buttons_on_footer.png')" alt="Buttons on footer" class="border mb-4" />

:::

:::option `after_create_path`/`after_update_path`

For some resources, it might make sense to redirect to something other than the `Show` view. With `after_create_path` and `after_update_path` you can control that.

The valid options are `:show` (default), `:edit`, or `:index`.

```ruby{2-3}
class Avo::Resources::Comment < Avo::BaseResource
  self.after_create_path = :index
  self.after_update_path = :edit
end
```

### Related

You can go more granular and customize these paths or response more using controller methods.

 - [`after_create_path`](./controllers#after_create_path)
 - [`after_update_path`](./controllers#after_update_path)
 - [`after_destroy_path`](./controllers#after_destroy_path)
:::


:::option `self.record_selector`

You might have resources that will never be selected, and you do not need that checkbox to waste your horizontal space.

You can hide it using the `record_selector` class_attribute.

```ruby{2}
class Avo::Resources::Comment < Avo::BaseResource
  self.record_selector = false
end
```

<img :src="('/assets/img/resources/record_selector.png')" alt="Hide the record selector." class="border mb-4" />
:::

:::option `self.link_to_child_resource`

Let's take an example. We have a `Person` model and `Sibling` and `Spouse` models that inherit from it using Single Table Inheritance (STI).

When you declare this option on the parent resource `Person` it has the following effect. When a user is on the <Index /> view of your the `Person` resource and clicks to visit a `Person` record they will be redirected to a `Child` or `Spouse` record instead of a `Person` record.

```ruby
class Avo::Resources::Person < Avo::BaseResource
  self.link_to_child_resource = true
end
```
:::

:::option `self.keep_filters_panel_open`

<DemoVideo demo-video="https://youtu.be/M2RsNPPFOio?t=374" />

There are scenarios where you wouldn't want to close the filters panel when you change the values. For that, you can use the `keep_filters_panel_open` resource option.

```ruby{2}
class Avo::Resources::Course < Avo::BaseResource
  self.keep_filters_panel_open = true

  def fields
    field :id, as: :id
    field :name, as: :text
  end

  def filters
    filter Avo::Filters::CourseCountryFilter
    filter Avo::Filters::CourseCityFilter
  end
end
```

<img :src="('/assets/img/filters/keep-filters-panel-open.gif')" alt="Avo filters" style="width: 300px;" class="border mb-4" />
:::

:::option self.components
By default, for each view we render an component:

`:index` -> `Avo::Views::ResourceIndexComponent`<br>
`:show` -> `Avo::Views::ResourceShowComponent`<br>
`:new`, `:edit` -> `Avo::Views::ResourceEditComponent`

It's possible to change this behavior by using the `self.components` resource option.

```ruby
self.components = {
  resource_index_component: Avo::Views::Users::ResourceIndexComponent,
  resource_show_component: "Avo::Views::Users::ResourceShowComponent",
  resource_edit_component: "Avo::Views::Users::ResourceEditComponent",
  resource_new_component: Avo::Views::Users::ResourceEditComponent
}
```

A resource configured with the example above will start using the declared components instead the default ones.

:::warning Warning
The custom view components must ensure that their initializers are configured to receive all the arguments passed during the rendering of a component. You can verify this in our codebase through the following files:

`:index` -> `app/views/avo/base/index.html.erb`<br>
`:show` -> `app/views/avo/base/show.html.erb`<br>
`:new` -> `app/views/avo/base/new.html.erb`<br>
`:edit` -> `app/views/avo/base/edit.html.erb`
:::
Creating a customized component for a view is most easily achieved by ejecting one of our pre-existing components using the `--scope` parameter. You can find step-by-step instructions in the documentation [here](./customization.html#scope).

Alternatively, there is another method which requires two additional manual steps. This involves crafting a personalized component by extracting an existing one and adjusting its namespace. Although changing the namespace is not mandatory, we strongly recommend it unless you intend for all resources to adopt the extracted component.

Example:
1. Execute the command `bin/rails generate avo:eject --component Avo::Views::ResourceIndexComponent` to eject the specified component.<br><br>
2. Access the newly ejected file and adjust the namespace. You can create a fresh directory like `my_dir` and transfer the component to that directory.<br><br>
2. You have the flexibility to establish multiple directories, just ensure that the class name corresponds to the path of the directories.<br><br>
3. Update the class namespace in the file from `Avo::Views::ResourceIndexComponent` to `Avo::MyDir::Views::ResourceIndexComponent`.<br><br>
4. You can now utilize the customized component in a resource.

```ruby
self.components = {
  resource_index_component: Avo::MyDir::Views::ResourceIndexComponent
}
```

This way you can choose the whatever namespace structure you want and you assure that the initializer is accepting the right arguments.


:::option self.index_query
### Unscoped queries on `Index`
You might have a `default_scope` on your model that you don't want to be applied when you render the `Index` view.
```ruby{2}
class Project < ApplicationRecord
  default_scope { order(name: :asc) }
end
```

You can unscope the query using the `index_query` method on that resource.

```ruby{3}
class Avo::Resources::Project < Avo::BaseResource
  self.title = :name
  self.index_query = -> { query.unscoped }
end
```

## Cards

Use the `def cards` method to add some cards to your resource.

Check [cards documentation](./cards) for more details.

```ruby{9-19}
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id
    field :name, as: :text
    field :email, as: :text
    field :roles, as: :boolean_group, options: {admin: "Administrator", manager: "Manager", writer: "Writer"}
  end

  def cards
    card Avo::Cards::ExampleAreaChart, cols: 3
    card Avo::Cards::ExampleMetric, cols: 2
    card Avo::Cards::ExampleMetric,
      label: "Active users metric",
      description: "Count of the active users.",
      arguments: { active_users: true },
      visible: -> { !resource.view.form? }
  end
end
```

![Alt text](/assets/img/cards_on_resource.png)

:::option self.pagination
<VersionReq version="2.45" />
This feature is designed for managing pagination. For example on large tables of data sometimes count is inefficient and unnecessary.

By setting `self.pagination[:type]` to `:countless`, you can disable the pagination count on the index page.

This is especially beneficial for large datasets, where displaying the total number of items and pages may have some performance impact.

```ruby
# As block:
self.pagination = -> do
  {
    type: :default,
    size: [1, 2, 2, 1],
  }
end

# Or as hash:
self.pagination = {
  type: :default,
  size: [1, 2, 2, 1],
}
```

The exposed pagination setting above have the default value for each key.

### `type`<br><br>
  #### Possible values
  `:default`, `:countless`
  #### Default
  `:default`


### `size`<br><br>
  #### Possible values
  [Pagy docs - Control the page links](https://ddnexus.github.io/pagy/docs/how-to/#control-the-page-links)
  #### Default
  `[1, 2, 2, 1]`

### Examples
#### Default
```ruby
self.pagination = -> do
  {
    type: :default,
    size: [1, 2, 2, 1],
  }
end
```

![Default pagination](/assets/img/resources/pagination/default.png)
<br><br>

#### Countless

```ruby
self.pagination = -> do
  {
    type: :countless
  }
end
```

![Countless pagination](/assets/img/resources/pagination/countless.png)
<br><br>

#### Countless and "pageless"
```ruby
self.pagination = -> do
  {
    type: :countless,
    size: []
  }
end
```
![Countless pagination size empty](/assets/img/resources/pagination/countless_empty_size.png)
:::
