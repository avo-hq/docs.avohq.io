---
license: community
outline: [2, 3]
---

# Single Table Inheritance (STI)

With [Single Table Inheritance](https://api.rubyonrails.org/classes/ActiveRecord/Inheritance.html), several models share one table and a `type` column records which class each row belongs to. Avo works with STI models the way it works with any other model: you give each class its own resource. The parent resource lists every record in the table, each child resource lists only its own type, and you choose which resource a record opens in.

This guide uses a `Person` model with two subclasses, `Spouse` and `Sibling`. The [demo app](https://main.avodemo.com/) runs the `Person` and `Spouse` part of it.

```ruby
# app/models/person.rb
class Person < ApplicationRecord
  belongs_to :person, optional: true
  has_many :relatives, foreign_key: :person_id, class_name: "Person", inverse_of: :person
end

# app/models/spouse.rb
class Spouse < Person
end

# app/models/sibling.rb
class Sibling < Person
  has_many :spouses, foreign_key: :person_id
end
```

## Give every model its own resource

Generate a resource for the parent and for each subclass:

```bash
bin/rails generate avo:resource person
bin/rails generate avo:resource spouse
bin/rails generate avo:resource sibling
```

Each one gets its own sidebar entry, Index page and fields. Rails scopes a subclass's queries to its type, so the `Spouse` Index lists only spouses, while the `Person` Index lists every row in the `people` table, spouses and siblings included.

Set [`self.model_class`](../resources-api.html#self.model_class) on each child resource to the subclass it represents:

```ruby
# app/avo/resources/spouse.rb
class Avo::Resources::Spouse < Avo::BaseResource
  self.title = :name
  self.model_class = "Spouse"

  def fields
    field :id, as: :id
    field :name, as: :text
  end
end
```

```ruby
# app/avo/resources/sibling.rb
class Avo::Resources::Sibling < Avo::BaseResource
  self.title = :name
  self.model_class = "Sibling"

  def fields
    field :id, as: :id
    field :name, as: :text
    field :spouses, as: :has_many
  end
end
```

A child resource declares its own fields, so it can show what only that type has. Above, only siblings get a `spouses` panel. A record created from a child resource is saved with that type, so a new record on the `Spouse` resource is a `Spouse`.

If two resources for the same class are what you're after rather than STI, see [use multiple resources for the same model](../resources.html#use-multiple-resources-for-the-same-model) instead.

## Pick the type on the parent's form

To create records of any type from the parent resource, add a field for the `type` column with the subclass names as options:

```ruby
# app/avo/resources/person.rb
class Avo::Resources::Person < Avo::BaseResource
  self.title = :name

  def fields
    field :id, as: :id
    field :name, as: :text, link_to_record: true
    field :type, as: :select, options: {Spouse: "Spouse", Sibling: "Sibling"}, include_blank: true
    field :person, as: :belongs_to
    field :relatives, as: :has_many
  end
end
```

Leave the select blank and the record is saved as a plain `Person`. Pick `Spouse` and Rails saves a `Spouse`, which the `Spouse` resource lists from then on. With the [Dynamic filters](../dynamic-filters.html) add-on, add `filterable: true` to the `type` field to filter the parent's Index by type.

Declare the `type` field on the parent resource only. A child resource saves records with its own type, and a select there would offer to move the record out of the resource the user is editing it in.

Forms on every resource in the hierarchy submit their values under the base class's name, `person` here. That's the key to read in [`params`](../controllers.html) and the prefix of the input ids, such as `person_name`, in your tests, whichever resource renders the form.

## Open records in their own resource

On the parent's Index, every row opens in the parent resource by default, so a spouse shows the `Person` fields. To open each record in the resource for its class instead, turn on [`self.link_to_child_resource`](../resources-api.html#self.link_to_child_resource) on the parent:

```ruby{3}
# app/avo/resources/person.rb
class Avo::Resources::Person < Avo::BaseResource
  self.link_to_child_resource = true
end
```

Now a spouse on the `Person` Index links to `/avo/resources/spouses/:id` and a sibling to `/avo/resources/siblings/:id`. That covers the row's view and edit controls, fields with [`link_to_record`](../field-options-api.html#link_to_record), and the parent resource's [search](../search.html) results. A record that's a plain `Person` keeps opening in the `Person` resource.

A record links to a child resource only when one exists for its class; otherwise it stays on the `Person` resource. That's another reason to give every subclass a resource.

### Choose per association

Association fields take a `link_to_child_resource` option too, so you can decide for each panel.

On a [`has_many`](../associations/has_many-api.html#link_to_child_resource) or [`has_and_belongs_to_many`](../associations/has_and_belongs_to_many-api.html#link_to_child_resource) field, the option decides where the panel's rows link. Leave it out and the panel follows the listed resource's own `self.link_to_child_resource`. Set it to `true` to link the rows to the children even when the parent's Index doesn't, or to `false` to keep a panel on the parent resource while the Index links to the children:

```ruby
# app/avo/resources/person.rb
class Avo::Resources::Person < Avo::BaseResource
  def fields
    # Spouses open in Avo::Resources::Spouse, siblings in Avo::Resources::Sibling
    field :relatives, as: :has_many, link_to_child_resource: true
  end
end
```

On a [`belongs_to`](../associations/belongs_to-api.html#link_to_child_resource) field, the option makes the link to the associated record use the resource for that record's class. The field also links to the child resource when the resource it's declared on has `self.link_to_child_resource = true`, and `link_to_child_resource: false` doesn't turn that off. To pin the link to one resource, set [`use_resource`](../associations/belongs_to-api.html#use_resource), which takes precedence over both.

```ruby
# app/avo/resources/person.rb
class Avo::Resources::Person < Avo::BaseResource
  def fields
    # Links to the Sibling or Spouse resource when the person is one
    field :person, as: :belongs_to, link_to_child_resource: true
  end
end
```
