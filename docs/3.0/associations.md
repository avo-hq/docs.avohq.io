# Associations

One of the most amazing things about Ruby on Rails is how easy it is to create [Active Record associations](https://guides.rubyonrails.org/association_basics.html) between models. We try to keep the same simple approach in Avo too.

:::warning
It's important to set the `inverse_of` as often as possible to your model's association attribute.
:::

 - [Belongs to](./associations/belongs_to)
 - [Has one](./associations/has_one)
 - [Has many](./associations/has_many)
 - [Has many through](./associations/has_many#has-many-through)
 - [Has and belongs to many](./associations/has_and_belongs_to_many)

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

For example, when you have two models, `User` and `SuperUser` with STI, when you call `User.all`, Rails will return an instance of `User` and an instance of `SuperUser`. That confuses Avo in producing the proper resource of `User`. That's why when you deal with STI, the final resource `Avo::Resources::SuperUser` should receive the underlying `model_class` so Avo knows which model it represents.

```ruby{5}
# app/avo/resources/super_user.rb
class Avo::Resources::SuperUser < Avo::BaseResource
  self.title = :name
  self.includes = []
  self.model_class = "SuperUser"

  def fields
    field :id, as: :id
    field :name, as: :text
  end
end
```

## Link to child resource when using STI

Let's take another example. We have a `Person` model and `Sibling` and `Spouse` models that inherit from it.

You may want to use the `Avo::Resources::Person` to list all the records, but when your user clicks on a person, you want to use the inherited resources (`Avo::Resources::Sibiling` and `Avo::Resources::Spouse`) to display the details. The reason is that you may want to display different fields or resource tools for each resource type.

There are two ways you can use this:

1. `self.link_to_child_resource = true` Declare this option on the parent resource. When a user is on the <Index /> view of your the `Avo::Resources::Person` and clicks on the view button of a `Person` they will be redirected to a `Child` or `Spouse` resource instead of a `Person` resource.
2. `field :peoples, as: :has_many, link_to_child_resource: false` Use it on a `has_many` field. On the `Avo::Resources::Person` you may want to show all the related people on the <Show /> page, but when someone click on a record, they are redirected to the inherited `Child` or `Spouse` resource.

## Add custom labels to the associations' pages

You might want to change the name that appears on the association page. For example, if you're displaying a `team_members` association, your users will default see `Team members` as the title, but you'd like to show them `Members`.

You can customize that using [fields localization](i18n.html#localizing-fields).

<Image src="/assets/img/associations/custom-label.jpg" width="1224" height="692" alt="Custom label" />
