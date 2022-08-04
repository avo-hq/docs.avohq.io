# Associations

[[toc]]

One of the most amazing things about Ruby on Rails is how easy it is to create [Active Record associations](https://guides.rubyonrails.org/association_basics.html) between models. We try to keep the same simple approach in Avo too.

<div class="rounded-md bg-blue-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-blue-700">
        It's important to set the <code>inverse_of</code> as often as possible to your model's association attribute.
      </div>
    </div>
  </div>
</div>

## Belongs to

```ruby
field :user, as: :belongs_to
```

When you add a `BelongsTo` association to a model, you will see three different field types.

On the **Index** view, you'll see a column with the [`@title`](./resources.html#setting-the-title-of-the-resource) value of the associated model.

<img :src="('/assets/img/associations/belongs-to-index.jpg')" alt="Belongs to index" class="border mb-4" />

On the **Show** view, you'll see a link to the associated model.

<img :src="('/assets/img/associations/belongs-to-show.jpg')" alt="Belongs to show" class="border mb-4" />

On the **Edit** and **Create** views, you'll see a drop-down element with the available records. Here you may change the associated model.

<img :src="('/assets/img/associations/belongs-to-edit.jpg')" alt="Belongs to edit" class="border mb-4" />

### Polymorphic `belongs_to`

To use a polymorphic relation you need to add the `polymorphic_as` and `types` properties.

```ruby{12}
class CommentResource < Avo::BaseResource
  self.title = :id

  field :id, as: :id
  field :body, as: :textarea
  field :excerpt, as: :text, show_on: :index, as_description: true do |model|
    ActionView::Base.full_sanitizer.sanitize(model.body).truncate 60
  rescue
    ""
  end

  field :commentable, as: :belongs_to, polymorphic_as: :commentable, types: [::Post, ::Project]
end
```

### Polymorphic help

**Requires V 2.5 +**

When displaying a polymorphic association, you will get two dropdowns. One selects the polymorphic type (`Post` or `Project`), and one for choosing the actual record. You may want to give the user explicit information about those dropdowns. For example, you can use the `polymorphic_help` option for the first dropdown and `help` for the second.

```ruby{16-17}
class CommentResource < Avo::BaseResource
  self.title = :id

  field :id, as: :id
  field :body, as: :textarea
  field :excerpt, as: :text, show_on: :index, as_description: true do |model|
    ActionView::Base.full_sanitizer.sanitize(model.body).truncate 60
  rescue
    ""
  end

  field :reviewable,
    as: :belongs_to,
    polymorphic_as: :reviewable,
    types: [::Post, ::Project, ::Team],
    polymorphic_help: "Choose the type of record to review",
    help: "Choose the record you need"
end
```

<img :src="('/assets/img/associations/polymorphic_help.jpg')" alt="Belongs to ploymorphic help" class="border mb-4" />

### Searchable `belongs_to`

**Requires V 1.21 +**

&nbsp;

<div class="rounded-md bg-blue-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-blue-700">
        Searchable associations are available as a <a href="https://avohq.io/purchase/pro" target="_blank" class="underline">pro</a> feature
      </div>
    </div>
  </div>
</div>

There might be the case that you have a lot of records for the parent resource, and a simple drop-down won't cut it. This is where you can use the `searchable` option to get a better search experience for that resource.

```ruby{7}
class CommentResource < Avo::BaseResource
  self.title = :id

  field :id, as: :id
  field :body, as: :textarea

  field :user, as: :belongs_to, searchable: true
end
```

<img :src="('/assets/img/associations/searchable-closed.jpg')" alt="Belongs to searchable" class="border mb-4" />
<img :src="('/assets/img/associations/searchable-open.jpg')" alt="Belongs to searchable" class="border mb-4" />

`searchable` works with `polymorphic` `belongs_to` associations too.

```ruby{7}
class CommentResource < Avo::BaseResource
  self.title = :id

  field :id, as: :id
  field :body, as: :textarea

  field :commentable, as: :belongs_to, polymorphic_as: :commentable, types: [::Post, ::Project], searchable: true
end
```

<div class="rounded-md bg-yellow-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-yellow-700">
        Avo uses the <a href="/2.0/search.html">search feature</a> behind the scenes, so <strong>make sure the target resource has the `search_query` option configured</strong>.
      </div>
    </div>
  </div>
</div>

```ruby
# app/avo/resources/post_resource.rb
class PostResource < Avo::BaseResource
  self.search_query = ->(params:) do
    scope.ransack(id_eq: params[:q], name_cont: params[:q], body_cont: params[:q], m: "or").result(distinct: false)
  end
end

# app/avo/resources/project_resource.rb
class ProjectResource < Avo::BaseResource
  self.search_query = ->(params:) do
    scope.ransack(id_eq: params[:q], name_cont: params[:q], country_cont: params[:q], m: "or").result(distinct: false)
  end
end
```

Watch the video below to get an ideea on how it works.

[![Demo video](https://img.youtube.com/vi/KLI_sVTPX-Q/0.jpg)](https://youtu.be/KLI_sVTPX-Q)

### Belongs to attach scope

When you edit a record that has a `belongs_to` association, on the edit screen, you will have a list of records from which you can choose a record to associate with.

Let's take, for example, a `Post` belongs to a `User`. On the post edit screen, you will have a dropdown (or a search field if it's [searchable](#searchable-belongs-to)) with all the available users. But that's not ideal. Maybe you don't want to show all the users in your app but only those who are not admins.

You can use the `attach_scope` option to keep only the users you need in the `belongs_to` dropdown field.

You have access to the `query` that you can alter and return it and the `parent` object which is the actual record where you want to assign the association (the actual `Post` in the below example).

```ruby
# app/models/user.rb
class User < ApplicationRecord
  scope :non_admins, -> { where "(roles->>'admin')::boolean != true" }
end

# app/avo/resources/post_resource.rb
class PostResource < Avo::BaseResource
  field :user, as: :belongs_to, attach_scope: -> { query.non_admins }
end
```

For the scenarios where you need to add a record associated to that resource (you create a `Post` through a `Category`), the `parent` is not available (the `Post` is not persisted in the database). Avo makes the `parent` an instantiated object with it's parent populated (a `Post` with the `category_id` populated with the parent `Category` from which you started the creation process) so you can better scope out the data (you know from which `Category` it was initiated).

<div class="space-x-2 mt-2">
  <a href="https://youtu.be/Eex8CiinQZ8?t=6" target="_blank" class="rounded bg-green-600 hover:bg-green-500 text-white no-underline px-2 py-1 inline leading-none mt-2">
    Demo video
  </a>
</div>

### Allow detaching via the association

By default, when you visit a record through an association that `belongs_to` field is disabled. There might be cases where you'd like that field not to be disabled and allow your users to change that association.

You can instruct Avo to keep that field enabled in this scenario using `allow_via_detaching`.

```ruby{11}
class CommentResource < Avo::BaseResource
  self.title = :id

  field :id, as: :id
  field :body, as: :textarea

  field :commentable,
    as: :belongs_to,
    polymorphic_as: :commentable,
    types: [::Post, ::Project],
    allow_via_detaching: true
end
```

## Has One

The `HasOne` association shows the unfolded view of you `HasOne` association. It's like peaking on the **Show** view of that association. You also get the _Attach_/_Detach_ button to easily switch records.

```ruby
field :admin, as: :has_one
```

<img :src="('/assets/img/associations/has-one.jpg')" alt="Has one" class="border mb-4" />

### Show on edit screens

By default, `has_one` is only visible on the **Show** page. If you want to enable it on the **Form** pages as well you need to add the `show_on: :edit` option.

## Has Many

The `HasMany` field is visible, by default, only on the **Show** page. Below the regular fields panel, you will see a new panel with the model's associated records.

```ruby
field :projects, as: :has_many
```

<img :src="('/assets/img/associations/has-many-table.jpg')" alt="Has many table" class="border mb-4" />

Here you may attach more records by clicking the "Attach" button.

<img :src="('/assets/img/associations/has-many-attach-modal.jpg')" alt="Has many attach" class="border mb-4" />

In a similar fashion, you may detach a model using the detach button.

<img :src="('/assets/img/associations/has-many-detach.jpg')" alt="Has many detach" class="border mb-4" />

### Show on edit screens

By default, `has_many` is only visible on the **Show** page. If you want to enable it on the **Form** pages as well you need to add the `show_on: :edit` option.

## Has Many Through

The `HasMany` association also supports the `:through` option.

```ruby
field :members, as: :has_many, through: :memberships
```

### Show on edit screens

By default, `has_many` is only visible on the **Show** page. If you want to enable it on the **Form** pages as well you need to add the `show_on: :edit` option.

**Adding associations on the `New` screen is not supported at the moment. The association needs some information form the parent record that hasn't been created yet (because the user is on the `New` screen).**

You may use the [redirect helpers](resources.html#customize-what-happens-after-record-is-created-edited) to have the following flow:

1. User on the `New` screen. They can't see the association panels yet.
1. User creates the record. They get redirected to the `Show`/`Edit` screen where they can see the association panels.
1. User attaches associations.

## Has And Belongs To Many

The `HasAndBelongsToMany` association works similarly to `HasMany`.

```ruby
field :users, as: :has_and_belongs_to_many
```

### Show on edit screens

By default, `has_and_belongs_to_many` is only visible on the **Show** page. If you want to enable it on the **Form** pages as well you need to add the `show_on: :edit` option.

### Searchable `has_many`

**Requires V 1.25 +**

&nbsp;

<div class="rounded-md bg-blue-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-blue-700">
        Searchable associations are available as a <a href="https://avohq.io/purchase/pro" target="_blank" class="underline">pro</a> feature
      </div>
    </div>
  </div>
</div>

Similar to [`belongs_to`](#searchable-belongs-to), the `has_many` associations support the `searchable` option.

```ruby{2}
class CourseLink < Avo::BaseResource
  field :links, as: :has_many, searchable: true, placeholder: "Click to choose a link"
end
```

<div class="rounded-md bg-yellow-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-yellow-700">
        Avo uses the <a href="/2.0/search.html">search feature</a> behind the scenes, so <strong>make sure the target resource has the `search_query` option configured</strong>.
      </div>
    </div>
  </div>
</div>

```ruby
# app/avo/resources/course_link_resource.rb
class CourseLinkResource < Avo::BaseResource
  self.search_query = ->(params:) do
    scope.ransack(id_eq: params[:q], link_cont: params[:q], m: "or").result(distinct: false)
  end
end
```

## Single Table Inheritance (STI)

When you have models that share behavior and fields through with STI, Rails will cast the model as the final class no matter how you query it.

```ruby
# app/models/user.rb
class User < ApplicationRecord
end

# app/models/super_user.rb
class SuperUser < User
end

# User.all.map(&:class) => [User, SuperUser]
```

For example, when you have two models, `User` and `SuperUser` with STI, when you call `User.all` Rails will return an instance of `User` and an instance of `SuperUser`. That confuses Avo in producing the proper resource of `User`. That's why when you deal with STI, the final resource `SuperUserResource` should receive the underlying `model_class` so Avo knows which model it represents.

```ruby{4}
class SuperUserResource < Avo::BaseResource
  self.title = :name
  self.includes = []
  self.model_class = ::SuperUser

  field :id, as: :id
  field :name, as: :text
end
```

## Add scopes to associations

<a href="https://youtu.be/3ee9iq2CnzA" target="_blank" class="rounded bg-green-600 hover:bg-green-500 text-white no-underline px-2 py-1 inline leading-none mt-2">
  Demo video
</a>

When displaying `has_many` associations, you might want to scope out some associated records. For example a user might have multiple comments, but on the user's `Show` page you don't want to display all the comments, but only the ones that have been approved beforehand.

```ruby{5,16,22}
# app/models/comment.rb
class Comment < ApplicationRecord
  belongs_to :user, optional: true

  scope :approved, -> { where(approved: true) }
end

# app/models/user.rb
class User < ApplicationRecord
  has_many :comments
end

# app/avo/resources/user_resource.rb
class UserResource < Avo::BaseResource
  # Version before v2.5.0
  field :comments, as: :has_many, scope: -> { approved }
end

# app/avo/resources/user_resource.rb
class UserResource < Avo::BaseResource
  # Version after v2.5.0
  field :comments, as: :has_many, scope: -> { query.approved }
end
```

Now, the `comments` query on the user `Index` page will have the `approved` scope attached.

<img :src="('/assets/img/associations/scope.jpg')" alt="Association scope" class="border mb-4" />

With version 2.5.0 you'll also have access to the `parent` record so you can use that to scope your associated models even better.

All the `has_many` associations have the [`attach_scope`](#belongs-to-attach-scope) option available too.

## Show/hide buttons

You will want to control the visibility of the attach/detach/create/destroy/actions buttons that are visible throughout your app. You can use the policy methods to do that.

Find out more on the [authorization](authorization#associations) page.

<img :src="('/assets/img/associations/authorization.jpg')" alt="Associations authorization" class="border mb-4" />

## Add custom labels to the associations pages

You might want to change the name that appears on the association page. For example, if you're displaying a `team_members` associations, by default your users will see `Team members` as the title, but you'd like to show them `Members`.

You can customize that using [fields localization](localization.html#localizing-fields).

<img :src="('/assets/img/associations/custom-label.jpg')" alt="Custom label" class="border mb-4" />
