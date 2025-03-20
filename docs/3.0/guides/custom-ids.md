# How to Use Custom IDs with Avo
Avo seamlessly integrates custom IDs, including popular solutions like FriendlyID, prefixed IDs, or Hashids. Below, you'll find examples illustrating each approach for effortless customization within your application.

## Example with FriendlyID

FriendlyID is a gem that allows you to generate pretty URLs and unique IDs. To integrate FriendlyID with Avo, follow these steps:

**Install [friendly_id](https://github.com/norman/friendly_id) gem by adding this line to your application's Gemfile:**

```ruby
gem "friendly_id", "~> 5.5.0"
```

And then execute:

```bash
bundle install
```

**Generate and run the migration to add a slug column to your model:**

```bash
rails generate friendly_id
rails db:migrate
```

**Add `friendly_id` to your model:**

```ruby{3,6}
# app/models/post.rb
class Post < ApplicationRecord
  extend FriendlyId

  # This post model have a name column
  friendly_id :name, use: :finders
end

```

With this setup, you can use `Post.find("bar")` to find records by their custom IDs.

:::info
For a version of [friendly_id](https://github.com/norman/friendly_id) smaller then 5.0 you can use [custom query scopes](/3.0/customization.md#custom-query-scopes)
:::
View [friendly_id](https://github.com/norman/friendly_id) setup in action: [View Demo](https://main.avodemo.com/avo/resources/users)

Check out the code: [Code on GitHub](https://github.com/avo-hq/main.avodemo.com/blob/main/app/models/user.rb)

## Example with Prefixed IDs

Prefixed IDs involve adding a custom prefix to your IDs.

**Install [prefixed_ids](https://github.com/excid3/prefixed_ids) gem by adding this line to your application's Gemfile:**

```ruby
gem "prefixed_ids"
```

And then execute:

```bash
bundle install
```

**Basic Usage**

Add `has_prefix_id :my_prefix` to your models to autogenerate prefixed IDs:
```ruby{3}
# app/models/post.rb
class Post < ApplicationRecord
  has_prefix_id :post
end
```

View [prefixed_ids](https://github.com/excid3/prefixed_ids) setup in action: [View Demo](https://main.avodemo.com/avo/resources/teams)

Check out the code: [Code on GitHub](https://github.com/avo-hq/main.avodemo.com/blob/main/app/models/team.rb)

## Example with Hashids

Hashid Rials is a gem that generates short, unique, and cryptographically secure IDs.

**Install [hashid-rails](https://github.com/jcypret/hashid-rails) gem by adding this line to your application's Gemfile:**

```ruby
gem "hashid-rails", "~> 1.0"
```

And then execute:

```bash
bundle install
```

**Include Hashid Rails in the ActiveRecord model you'd like to enable hashids:**

```ruby{3}
# app/models/post.rb
class Post < ApplicationRecord
  include Hashid::Rails
end
```

View [hashid-rails](https://github.com/jcypret/hashid-rails) setup in action: [View Demo](https://main.avodemo.com/avo/resources/spouses)

Check out the code: [Code on GitHub](https://github.com/avo-hq/main.avodemo.com/blob/main/app/models/spouse.rb)
