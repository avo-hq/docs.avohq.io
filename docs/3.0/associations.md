# Associations

One of the most amazing things about Ruby on Rails is how easy it is to create [Active Record associations](https://guides.rubyonrails.org/association_basics.html) between models. We try to keep the same simple approach in Avo too.

:::warning
It's important to set the `inverse_of` as often as possible to your model's association attribute.
:::

 - [Belongs to](./associations/belongs_to)
 - [Has one](./associations/has_one)
 - [Has many](./associations/has_many)
 - [Has many through](./associations/has_many#has-many-through)
 - [Has and blongs to many](./associations/has_and_belongs_to_many)

## Single Table Inheritance (STI)

When you have models that share behavior and fields with STI, Rails will cast the model as the final class no matter how you query it.

```ruby
# app/models/user.rb
class User < ApplicationRecord
end

# app/models/super_user.rb
class SuperUser < User
end

# User.all.map(&:class) => [User, SuperUser]
```

For example, when you have two models, `User` and `SuperUser` with STI, when you call `User.all`, Rails will return an instance of `User` and an instance of `SuperUser`. That confuses Avo in producing the proper resource of `User`. That's why when you deal with STI, the final resource `SuperUserResource` should receive the underlying `model_class` so Avo knows which model it represents.

```ruby{4}
class SuperUserResource < Avo::BaseResource
  self.title = :name
  self.includes = []
  self.model_class = ::SuperUser

  field :id, as: :id
  field :name, as: :text
end
```

## Add custom labels to the associations' pages

You might want to change the name that appears on the association page. For example, if you're displaying a `team_members` association, your users will default see `Team members` as the title, but you'd like to show them `Members`.

You can customize that using [fields localization](localization.html#localizing-fields).

<img :src="('/assets/img/associations/custom-label.jpg')" alt="Custom label" class="border mb-4" />
