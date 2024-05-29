# How to Use Custom IDs with Avo
Avo seamlessly integrates custom IDs, including popular solutions like FriendlyID, prefixed IDs, or Hashids. Below, you'll find examples illustrating each approach for effortless customization within your application.

## Example with FriendlyID

FriendlyID is a gem that allows you to generate pretty URLs and unique IDs. To integrate FriendlyID with Avo, follow these steps:

 **Install FriendlyID gem:**

  ```ruby
  gem 'friendly_id'
  ```

 **Generate and run the migration to add a slug column to your model:**

  ```bash
  rails generate friendly_id
  rails db:migrate
  ```

 **Add `friendly_id` to your model:**

  ```ruby
  class MyModel < ApplicationRecord
    extend FriendlyId
    friendly_id :name, use: :slugged
  end
  ```
 Integration with Finders
:::warning
Since version 5.0 of friendly_id

To integrate FriendlyIDs with finders in Avo, follow these steps:

1. Ensure you have FriendlyID.
2. Use the `:finders` addon in the `friendly_id` configuration:
:::

  ```ruby
  class MyModel < ApplicationRecord
    extend FriendlyId
    friendly_id :foo, use: [:slugged, :finders]
  end
  ```

With this setup, you can use `MyModel.find('bar')` to find records by their custom IDs.

  :::info
  For a version of friendlyid smaller then 5.0 you can use [custom query scopes](/3.0/customization.md#custom-query-scopes)
  :::
View FriendlyID setup in action: [View Demo](https://main.avodemo.com/avo/resources/users)

Check out the code: [Code on GitHub](https://github.com/avo-hq/main.avodemo.com/blob/main/app/models/user.rb)

## Example with Prefixed IDs

Prefixed IDs involve adding a custom prefix to your IDs.

Installation
Add this line to your application's Gemfile:

  ```bash
  gem 'prefixed_ids'
  ```

 **Basic Usage**
Add has_prefix_id :my_prefix to your models to autogenerate prefixed IDs:
  ```ruby
  class User < ApplicationRecord
    has_prefix_id :user
  end
  ```

  View Prefixed IDs setup in action: [View Demo](https://main.avodemo.com/avo/resources/teams)

Check out the code: [Code on GitHub](https://github.com/avo-hq/main.avodemo.com/blob/main/app/models/team.rb)

## Example with Hashids

Hashids is a library that generates short, unique, and cryptographically secure IDs.

 **Install Hashids gem:**

  ```ruby
    gem 'hashid-rails'
  ```

 **Include Hashid Rails in the ActiveRecord model you'd like to enable hashids:**

  ```ruby
    class Model < ApplicationRecord
      include Hashid::Rails
    end
  ```

 **Continue using Model#find passing in either a hashid or regular ID:**

  ```ruby
    @person = Person.find(params[:hashid])
  ```
  **Get hashid of model:**

  ```ruby
    model.hashid
  ```

  View hashid-rails setup in action: [View Demo](https://main.avodemo.com/avo/resources/spouses)

Check out the code: [Code on GitHub](https://github.com/avo-hq/main.avodemo.com/blob/main/app/models/spouse.rb)
