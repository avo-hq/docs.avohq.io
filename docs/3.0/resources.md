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

```ruby [app/avo/resources/post.rb]
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
  self.model_class = "Post"
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

<Image src="/assets/img/resources/model-resource-mapping-1.jpg" width="2048" height="1280" alt="" />

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

<Image src="/assets/img/resources/model-resource-mapping-2.jpg" width="1524" height="714" alt="" />

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

## Extending `Avo::BaseResource`

<VersionReq version="3.10.7" /> we have restructured the `Avo::BaseResource` to enhance user customization capabilities. The existing functionality has been moved to a new base class `Avo::Resources::Base`, and `Avo::BaseResource` is now left empty for user overrides. This allows users to easily add custom methods that all of their resources will inherit, without having to modify the internal base class.

### How to Customize `Avo::BaseResource`

You can customize `Avo::BaseResource` by creating your own version in your application. This custom resource can include methods and logic that you want all your resources to inherit. Here's an example to illustrate how you can do this:

```ruby
# app/avo/base_resource.rb
module Avo
  class BaseResource < Avo::Resources::Base
    # Example custom method: make all number fields cast their values to float
    def field(id, **args, &block)
      if args[:as] == :number
        args[:format_using] = -> { value.to_f }
      end

      super(id, **args, &block)
    end
  end
end
```


All your resources will now inherit from your custom `Avo::BaseResource`, allowing you to add common functionality across your admin interface. For instance, the above example ensures that all number fields in your resources will have their values cast to floats. You can add any other shared methods or customizations here, making it easier to maintain consistent behavior across all resources.

### Your resource files

Your resource file will still look the same as it did before.

```ruby
# app/avo/resources/post_resource.rb
module Avo::Resources::Post < Avo::BaseResource
  # Your existing configuration for the Post resource
end
```

## Resource Options

Resources have a few options available for customization.

<Option name="`self.title`">

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
```
</Option>

<Option name="`self.description`">

You might want to display information about the current resource to your users. Then, using the `description` class attribute, you can add some text to the `Index`, `Show`, `Edit`, and `New` views.

<Image src="/assets/img/resources/description.png" width="1272" height="216" alt="Avo message" />

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
</Option>

<Option name="`self.includes`">

If you regularly need access to a resource's associations, you can tell Avo to eager load those associations on the `Index` view using `includes`.

That will help you avoid those nasty `n+1` performance issues.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.includes = [:user, :tags]

  # or a very nested scenario
  self.includes = [files_attachments: :blob, users: [:comments, :teams, post: [comments: :user]]]
end
```

We know, the array notation looks weird, but it works.

</Option>

<Option name="`self.single_includes`">

`single_includes` works the same as `includes` but it's going to eager load the associtations on the <Show /> and <Edit /> views only.
</Option>

<Option name="`self.attachments`">

Similar to how `includes` works, you can use `attachments` to eager load attachments on the `Index` view.

:::code-group
```ruby{2-4} [app/models/post.rb]
class Post < ApplicationRecord
  has_one_attached :cover_photo
  has_one_attached :audio
  has_many_attached :attachments
end
```

```ruby{5-7} [app/avo/resources/post.rb]
class Avo::Resources::Post < Avo::BaseResource
  self.attachments = [:cover_photo, :audio, :attachments]
end
```
:::

</Option>

<Option name="`self.single_attachments`">

`single_attachments` works the same as `attachments` but it's going to eager load the attachments on the <Show /> and <Edit /> views only.

</Option>

<Option name="`self.confirm_on_save`">

<VersionReq version="3.10.10" />
If you would like to ask for confirmation when saving a resource you can do so by setting `confirm_on_save` to `true`.

That will help add friction to the saving process, avoiding human error.

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.confirm_on_save = true
end
```

This option defaults to false

<Image src="/assets/img/customization/confirm-on-save.png" width="2494" height="845" alt="Confirm on save" />

</Option>

<Option name="`default_view_type`">

On <Index />, the most common view type is `:table`, but you might have some data that you want to display in a `:grid` or `:map`. You can change that by setting `default_view_type` to `:grid` and by adding the `grid` block.

<Image src="/assets/img/grid-view.jpg" width="1312" height="1096" alt="Avo grid view" />

```ruby{2}
class Avo::Resources::Post < Avo::BaseResource
  self.default_view_type = :grid
end
```

Find out more on the [grid view documentation page](grid-view).

<VersionReq version="3.5.6" /> `default_view_type` become callable. Within this block, you gain access to all attributes of [`Avo::ExecutionContext`](execution-context) along with the `resource` and `view`. Example:

```ruby
class Avo::Resources::Post < Avo::BaseResource
  self.default_view_type = -> {
    mobile_user = request.user_agent =~ /Mobile/

    mobile_user ? :table : :grid
  }
end
```

</Option>

<Option name="`self.model_class`">

For some resources you might have a model that is namespaced, or you might have a secondary resource for a model. For that scenario, you can use the `self.model_class` option to tell Avo which model to reference in that resource.

```ruby{2}
class Avo::Resources::DelayedJob < Avo::BaseResource
  self.model_class = "Delayed::Job"

  def fields
    field :id, as: :id
  end
end
```

</Option>

<Option name="`self.devise_password_optional`">

If you use `devise` and update your user models (usually `User`) without passing a password, you will get a validation error. You can use `devise_password_optional` to stop receiving that error. It will [strip out](https://stackoverflow.com/questions/5113248/devise-update-user-without-password/11676957#11676957) the `password` key from `params`.

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.devise_password_optional = true
end
```

### Related

- [Password field](./fields/password)

</Option>

<Option name="`self.visible_on_sidebar`">

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
</Option>

<Option name="`config.buttons_on_form_footers`">

If you have a lot of fields on a resource, that form might get pretty tall. So it would be useful to have the `Save` button in the footer of that form.

You can do that by setting the `buttons_on_form_footers` option to `true` in your initializer. That will add the `Back` and `Save` buttons on the footer of that form for the `New` and `Edit` screens.

```ruby{3}
# config/initializers/avo.rb
Avo.configure do |config|
  config.buttons_on_form_footers = true
end
```

<Image src="/assets/img/resources/buttons_on_footer.png" width="1276" height="594" alt="Buttons on footer" />

</Option>

<Option name="`after_create_path`/`after_update_path`">

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
</Option>


<Option name="`self.record_selector`">

You might have resources that will never be selected, and you do not need that checkbox to waste your horizontal space.

You can hide it using the `record_selector` class_attribute.

```ruby{2}
class Avo::Resources::Comment < Avo::BaseResource
  self.record_selector = false
end
```

<Image src="/assets/img/resources/record_selector.png" width="688" height="361" alt="Hide the record selector." />
</Option>

<Option name="`self.link_to_child_resource`">

Let's take an example. We have a `Person` model and `Sibling` and `Spouse` models that inherit from it using Single Table Inheritance (STI).

When you declare this option on the parent resource `Person` it has the following effect. When a user is on the <Index /> view of your the `Person` resource and clicks to visit a `Person` record they will be redirected to a `Child` or `Spouse` record instead of a `Person` record.

```ruby
class Avo::Resources::Person < Avo::BaseResource
  self.link_to_child_resource = true
end
```
</Option>

<Option name="`self.keep_filters_panel_open`">

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

<Image src="/assets/img/filters/keep-filters-panel-open.gif" width="449" height="800" alt="Avo filters" />
</Option>

<Option name="`self.components`">
By default, for each view we render an component:

[Index](views.html#Index) -> `Avo::Views::ResourceIndexComponent`<br>
[Show](views.html#Show) -> `Avo::Views::ResourceShowComponent`<br>
[New](views.html#New), [Edit](views.html#Edit) -> `Avo::Views::ResourceEditComponent`

It's possible to change this behavior by using the `self.components` resource option.

```ruby
self.components = {
  resource_index_component: Avo::Views::Users::ResourceIndexComponent,
  resource_show_component: "Avo::Views::Users::ResourceShowComponent",
  resource_edit_component: "Avo::Views::Users::ResourceEditComponent",
  resource_new_component: Avo::Views::Users::ResourceEditComponent
}
```

<VersionReq version="3.11.8" /> more components can be replaced. From this version, keys must be strings that match the original component with the exception of those from the snippet above.

Here is a list of all the supported customizable components:

```ruby
self.components = {
  "Avo::Views::ResourceIndexComponent": Avo::Custom::ResourceIndexComponent,
  "Avo::Views::ResourceShowComponent": "Avo::Custom::ResourceShowComponent",
  "Avo::Views::ResourceEditComponent": "Avo::Custom::ResourceEditComponent",
  "Avo::Index::GridItemComponent": "Avo::Custom::GridItemComponent",
  "Avo::Index::ResourceMapComponent": "Avo::Custom::ResourceMapComponent",
  "Avo::Index::ResourceTableComponent": "Avo::Custom::ResourceTableComponent",
  "Avo::Index::TableRowComponent": "Avo::Custom::TableRowComponent"
}
```


A resource configured with the example above will start using the declared components instead the default ones.

:::warning
The custom view components must ensure that their initializers are configured to receive all the arguments passed during the rendering of a component. You can verify this in our codebase through the following files:

[Index](views.html#Index) -> `app/views/avo/base/index.html.erb`<br>
[Show](views.html#Show) -> `app/views/avo/base/show.html.erb`<br>
[New](views.html#New) -> `app/views/avo/base/new.html.erb`<br>
[Edit](views.html#Edit) -> `app/views/avo/base/edit.html.erb`
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
</Option>

<Option name="`self.index_query`">

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
</Option>

<Option name="`self.default_sort_column`">
<VersionReq version="3.10.7" />

By default, Avo sorts records on the <Index /> view by the `created_at` attribute. However, you can customize this behavior using the `default_sort_column` option in your resource file.

#### Default

`:created_at`

#### Possible values

Any symbol representing a sortable column in your model. If the specified column doesn't exist in the model, Avo will fall back to the default sort column (`created_at`).

```ruby
class Avo::Resources::User < Avo::BaseResource
  self.default_sort_column = :last_name

  def fields
    field :id, as: :id
    field :last_name, as: :text
  end

  # other resource configurations...
end
```

:::info
When changing the default sort column, it's recommended to add an index to that column in your database for better query performance.

```ruby
# Example migration
class AddIndexOnUsersCreatedAt < ActiveRecord::Migration[7.1]
  def change
    add_index :users, :last_name
  end
end
```
:::

**Related:**
  - [Add an index on the `created_at` column](./best-practices#add-an-index-on-the-created-at-column)
</Option>

<Option name="`self.default_sort_direction`">
<VersionReq version="3.11.5" />

By default, Avo sorts records in descending order of the [default sort column](./resources#self.default_sort_column). However, you can customize this using the `self.default_sort_direction` option in your resource file.

#### Default

`:desc`

#### Possible values

Either `:desc` (descending) or `:asc` (ascending).

```ruby
class Avo::Resources::Task < Avo::BaseResource
  self.default_sort_column = :position
  self.default_sort_direction = :asc

  # ...
end
```

</Option>

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

<Image src="/assets/img/cards_on_resource.png" width="2520" height="1258" alt="Alt text" />

<Option name="`self.pagination`">
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
  `[1, 2, 2, 1]` - before <Version version="3.11.5" />

  `9` - <VersionReq version="3.11.5" />

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

<Image src="/assets/img/resources/pagination/default.png" width="1025" height="65" alt="Default pagination" />
<br><br>

#### Countless

```ruby
self.pagination = -> do
  {
    type: :countless
  }
end
```

<Image src="/assets/img/resources/pagination/countless.png" width="1030" height="67" alt="Countless pagination" />
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
<Image src="/assets/img/resources/pagination/countless_empty_size.png" width="1029" height="62" alt="Countless pagination size empty" />
</Option>

<Option name="`cache_hash`">

The `cache_hash` method is used to compute the cache key for each row. The method looks something like this:

```ruby
def cache_hash(parent_record)
  result = [record, file_hash]

  if parent_record.present?
    result << parent_record
  end

  result
end

def file_hash
  content_to_be_hashed = ""

  file_name = self.class.underscore_name.tr(" ", "_")
  resource_path = Rails.root.join("app", "avo", "resources", "#{file_name}.rb").to_s
  if File.file? resource_path
    content_to_be_hashed += File.read(resource_path)
  end

  # policy file hash
  policy_path = Rails.root.join("app", "policies", "#{file_name.gsub("_resource", "")}_policy.rb").to_s
  if File.file? policy_path
    content_to_be_hashed += File.read(policy_path)
  end

  Digest::MD5.hexdigest(content_to_be_hashed)
end
```

It's an md5 of the resource file name, the policy file (so the cache gets busted when the rules change). We also add the `parent_record` when it's displayed in as an association, so there's a separate cache record for each association.

This is the default, but if you have special requirements you can add it to your resource file and it will be used to cache your records accordingly.

```ruby
class Avo::Resources::User < Avo::BaseResource
  def cache_hash(parent_record)
    result = [record, file_hash, "SOMETHING_NEW"]

    if parent_record.present?
      result << parent_record
    end

    result
  end

  # fields, cards and more
end
```
</Option>
