---
version: '3.7.0'
license: community
---

# Record link

Sometimes you just need to link to a field. That's it!

This is what this field does. You give it a record and it will link to it.
That record can come off an association a method or any kind of property on the record instance.

:::warning
That record should have [a resource configured](./../resources.html#overview).
:::

```ruby{14,19}
class Comment < ApplicationRecord
  # Your model must return an instance of a record
  has_one :post
  # or
  belongs_to :post
  # or
  def post
    # trivially find a post
    Post.find 42
  end
end

# Calling the method like so will give us an instance of a Post
Comment.first.post => #<Post:0x00000001685bb558 ...>

class Avo::Resources::Comment < Avo::BaseResource
  def fields
    # This will run `record.post` and try to display whatever is returned.
    field :post, as: :record_link
  end
end
```

<img :src="('/assets/img/fields/record_link/record-link.png')" alt="Record link field" title="Record link field on the Show view" class="border mb-4" />

## Options

Besides some of the [default options](./../field-options.html), there are a few custom ones.

:::option `target`
In case you want to set the target to `_blank`.

#### Default value

`nil`

#### Possible values

`:self`, `:blank`

#### Example

```ruby
field :post, as: :record_link, target: :blank
```
:::

:::option `use_resource`

Because you only give it an instance of a record, Avo will try to guess which resource it should use to display the title of the record and how to compute it's link.
With more advanced configurations (when you have [multiple resources for the same model](./../resources.html#use-multiple-resources-for-the-same-model)) that resource might not be the one that you wish for.

Using the `use_resource` configuration value you can tell Avo which resource it should use.

#### Default value

`nil`

#### Possible values

`big_post`, `AdminUser`, `Avo::Resources::TinyPhoto`

#### Example

```ruby
field :post, as: :record_link, use_resource: "big_post"

field :admin, as: :record_link, use_resource: "AdminUser"

field :thumbnail, as: :record_link, use_resource: "Avo::Resources::TinyPhoto"
```
:::

:::option `add_via_params`

In other places where Avo generates a link to a record like in the [`belongs_to` field](./../associations/belongs_to.html), Avo adds `via` params to the URL so it knows how to generate the back button link.
That URL can also be passed on to other team mates and everyone can have the same navigation experience.

In the `record_link` field Avo adds these params automatically, but that might not be what you want. You can remove those `via` params by setting the `add_via_params` option to `false`.

#### Default value

`true`

#### Possible values

`true`, `false`

#### Example

```ruby
# This will generate a link similar to this
# https://example.com/avo/resources/projects/40?via_record_id=40&via_resource_class=Avo%3A%3AResources%3A%3AProject
field :post, as: :record_link, add_via_params: true

# This will generate a link similar to this
# https://example.com/avo/resources/projects/40
field :post, as: :record_link, add_via_params: false
```
:::

## Using computed values

Of course you can take full control of this field and use your computed values too.

In order to do that, open a block and run some ruby query to return an instance of a record.

#### Example

```ruby
field :post, as: :record_link do
  # This will generate a link similar to this
  # https://example.com/avo/resources/posts/42
  Post.find 42
end

# or

field :creator, as: :record_link, add_via_params: false do
  user_id = SomeService.new(comment: record).fetch_user_id # returns 31

  # This will generate a link similar to this
  # https://example.com/avo/resources/users/31
  User.find user_id
end

# or

field :creator, as: :record_link, use_resource: "AdminUser", add_via_params: false do
  user_id = SomeService.new(comment: record).fetch_user_id # returns 31

  # This will generate a link similar to this
  # https://example.com/avo/resources/admin_users/31
  User.find user_id
end
```
