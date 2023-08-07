---
version: '1.0'
license: community
---

# Belongs to

```ruby
field :user, as: :belongs_to
```

You will see three field types when you add a `BelongsTo` association to a model.


## Options

<!-- @include: ./../common/associations_searchable_option_common.md-->

:::option `allow_via_detaching`
Keeps the field enabled when visiting from the parent record.

<!-- @include: ./../common/default_boolean_false.md-->
:::

<!-- @include: ./../common/associations_attach_scope_option_common.md-->

:::option `polymorphic_as`
Sets the field as polymorphic with the key set on the model.

#### Default

`nil`

#### Possible values

A symbol, used on the `belongs_to` association with `polymorphic: true`.
:::

:::option `types`
Sets the types the field can morph to.

#### Default

`[]`

#### Possible values

`[Post, Project, Team]`. Any array of model names.
:::

:::option `polymorphic_help`
Sets the help text for the polymorphic type dropdown. Useful when you need to specify to the user why and what they need to choose as polymorphic.

#### Default

`nil`

#### Possible values

Any string.
:::

<!-- @include: ./../common/associations_use_resource_option_common.md-->

## Overview

On the `Index` and `Show` views, Avo will generate a link to the associated record containing the [`@title`](./../resources.html#setting-the-title-of-the-resource) value.

<img :src="('/assets/img/associations/belongs-to-index.jpg')" alt="Belongs to index" class="border mb-4" />

<img :src="('/assets/img/associations/belongs-to-show.jpg')" alt="Belongs to show" class="border mb-4" />

On the `Edit` and `New` views, Avo will generate a dropdown element with the available records where the user can change the associated model.

<img :src="('/assets/img/associations/belongs-to-edit.jpg')" alt="Belongs to edit" class="border mb-4" />

## Polymorphic `belongs_to`

To use a polymorphic relation, you must add the `polymorphic_as` and `types` properties.

```ruby{13}
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :id

  def fields
    field :id, as: :id
    field :body, as: :textarea
    field :excerpt, as: :text, show_on: :index do
      ActionView::Base.full_sanitizer.sanitize(record.body).truncate 60
    rescue
      ""
    end

    field :commentable, as: :belongs_to, polymorphic_as: :commentable, types: [::Post, ::Project]
  end
end
```

## Polymorphic help

When displaying a polymorphic association, you will see two dropdowns. One selects the polymorphic type (`Post` or `Project`), and one for choosing the actual record. You may want to give the user explicit information about those dropdowns using the `polymorphic_help` option for the first dropdown and `help` for the second.

```ruby{17-18}
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :id

  def fields
    field :id, as: :id
    field :body, as: :textarea
    field :excerpt, as: :text, show_on: :index do
      ActionView::Base.full_sanitizer.sanitize(record.body).truncate 60
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
end
```

<img :src="('/assets/img/associations/polymorphic_help.jpg')" alt="Belongs to ploymorphic help" class="border mb-4" />

## Searchable `belongs_to`

<DemoVideo demo-video="https://youtu.be/KLI_sVTPX-Q" />

There might be the case that you have a lot of records for the parent resource, and a simple dropdown won't cut it. This is where you can use the `searchable` option to get a better search experience for that resource.

```ruby{8}
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :id

  def fields
    field :id, as: :id
    field :body, as: :textarea

    field :user, as: :belongs_to, searchable: true
  end
end
```

<img :src="('/assets/img/associations/searchable-closed.jpg')" alt="Belongs to searchable" class="border mb-4" />
<img :src="('/assets/img/associations/searchable-open.jpg')" alt="Belongs to searchable" class="border mb-4" />

`searchable` works with `polymorphic` `belongs_to` associations too.

```ruby{8}
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :id

  def fields
    field :id, as: :id
    field :body, as: :textarea

    field :commentable, as: :belongs_to, polymorphic_as: :commentable, types: [::Post, ::Project], searchable: true
  end
end
```

:::info
Avo uses the [search feature](./../search) behind the scenes, so **make sure the target resource has the `query` option configured inside the `search` block**.
:::


```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(id_eq: params[:q], name_cont: params[:q], body_cont: params[:q], m: "or").result(distinct: false)
    }
  }
end

# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(id_eq: params[:q], name_cont: params[:q], country_cont: params[:q], m: "or").result(distinct: false)
    }
  }
end
```

## Belongs to attach scope

<DemoVideo demo-video="https://youtu.be/Eex8CiinQZ8?t=6" />

When you edit a record that has a `belongs_to` association, on the edit screen, you will have a list of records from which you can choose a record to associate with.

For example, a `Post` belongs to a `User`. So on the post edit screen, you will have a dropdown (or a search field if it's [searchable](#searchable-belongs-to)) with all the available users. But that's not ideal. For example, maybe you don't want to show all the users in your app but only those who are not admins.

You can use the `attach_scope` option to keep only the users you need in the `belongs_to` dropdown field.

You have access to the `query` that you can alter and return it and the `parent` object, which is the actual record where you want to assign the association (the true `Post` in the below example).

```ruby
# app/models/user.rb
class User < ApplicationRecord
  scope :non_admins, -> { where "(roles->>'admin')::boolean != true" }
end

# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :user, as: :belongs_to, attach_scope: -> { query.non_admins }
  end
end
```

For scenarios where you need to add a record associated with that resource (you create a `Post` through a `Category`), the `parent` is unavailable (the `Post` is not persisted in the database). Therefore, Avo makes the `parent` an instantiated object with its parent populated (a `Post` with the `category_id` populated with the parent `Category` from which you started the creation process) so you can better scope out the data (you know from which `Category` it was initiated).

## Allow detaching via the association

When you visit a record through an association, that `belongs_to` field is disabled. There might be cases where you'd like that field not to be disabled and allow your users to change that association.

You can instruct Avo to keep that field enabled in this scenario using `allow_via_detaching`.

```ruby{12}
class Avo::Resources::Comment < Avo::BaseResource
  self.title = :id

  def fields
    field :id, as: :id
    field :body, as: :textarea

    field :commentable,
      as: :belongs_to,
      polymorphic_as: :commentable,
      types: [::Post, ::Project],
      allow_via_detaching: true
  end
end
```
