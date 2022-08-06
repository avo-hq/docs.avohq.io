---
version: '1.0'
license: community
---

# Belongs to

```ruby
field :user, as: :belongs_to
```

You will see three field types when you add a `BelongsTo` association to a model.


        @searchable = args[:searchable] == true
        @polymorphic_as = args[:polymorphic_as]
        @types = args[:types]
        @relation_method = id.to_s.parameterize.underscore
        @allow_via_detaching = args[:allow_via_detaching] == true
        @attach_scope = args[:attach_scope]
        @polymorphic_help = args[:polymorphic_help]

## Options


:::option `searchable`
<LicenseReq license="pro" />


<!-- @include: ./../common/default_boolean_false.md-->
:::

On the `Index` view, you'll see a column with the [`@title`](./../resources.html#setting-the-title-of-the-resource) value of the associated model.

<img :src="('/assets/img/associations/belongs-to-index.jpg')" alt="Belongs to index" class="border mb-4" />

On the `Show` view, you'll see a link to the associated model.

<img :src="('/assets/img/associations/belongs-to-show.jpg')" alt="Belongs to show" class="border mb-4" />

You'll see a dropdown element with the available records on the `Edit` and `New` views. Here you may change the associated model.

<img :src="('/assets/img/associations/belongs-to-edit.jpg')" alt="Belongs to edit" class="border mb-4" />

## Polymorphic `belongs_to`

To use a polymorphic relation, you must add the `polymorphic_as` and `types` properties.

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

## Polymorphic help

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
    help: "Choose the record you need."
end
```

<img :src="('/assets/img/associations/polymorphic_help.jpg')" alt="Belongs to ploymorphic help" class="border mb-4" />

## Searchable `belongs_to`


There might be the case that you have a lot of records for the parent resource, and a simple dropdown won't cut it. This is where you can use the `searchable` option to get a better search experience for that resource.

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

Watch the video below to get an idea on how it works.

<DemoVideo demo-video="https://youtu.be/KLI_sVTPX-Q" />

## Belongs to attach scope

When you edit a record that has a `belongs_to` association, on the edit screen, you will have a list of records from which you can choose a record to associate with.

For example, a `Post` belongs to a `User`. So on the post edit screen, you will have a dropdown (or a search field if it's [searchable](#searchable-belongs-to)) with all the available users. But that's not ideal. For example, maybe you don't want to show all the users in your app but only those who are not admins.

You can use the `attach_scope` option to keep only the users you need in the `belongs_to` dropdown field.

You have access to the `query` that you can alter and return it and the `parent` object, which is the actual record where you want to assign the association (the true `Post` in the below example).

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

For scenarios where you need to add a record associated with that resource (you create a `Post` through a `Category`), the `parent` is unavailable (the `Post` is not persisted in the database). Therefore, Avo makes the `parent` an instantiated object with its parent populated (a `Post` with the `category_id` populated with the parent `Category` from which you started the creation process) so you can better scope out the data (you know from which `Category` it was initiated).


<DemoVideo demo-video="https://youtu.be/Eex8CiinQZ8?t=6" />

## Allow detaching via the association

When you visit a record through an association, that `belongs_to` field is disabled. There might be cases where you'd like that field not to be disabled and allow your users to change that association.

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
