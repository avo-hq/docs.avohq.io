## Add scopes to associations

<DemoVideo demo-video="https://youtu.be/3ee9iq2CnzA" />


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
  # Before v2.5.0
  field :comments, as: :has_many, scope: -> { approved }
end

# app/avo/resources/user_resource.rb
class UserResource < Avo::BaseResource
  # After v2.5.0
  field :comments, as: :has_many, scope: -> { query.approved }
end
```

The `comments` query on the user `Index` page will have the `approved` scope attached.

<img :src="('/assets/img/associations/scope.jpg')" alt="Association scope" class="border mb-4" />

With version 2.5.0, you'll also have access to the `parent` record so that you can use that to scope your associated models even better.

All the `has_many` associations have the [`attach_scope`](/2.0/associations/belongs_to#attach-scope) option available too.
