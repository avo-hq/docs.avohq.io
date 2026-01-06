---
version: '4.0'
license: community
---

# Resource Header

The resource header is a key component that, by default, is displayed at the top of your resource pages. It provides a consistent area showing the resource's title, description, profile photo, discreet information and controls.

The `header` DSL allows you to control where the header appears within your resource's field layout. By default, if you don't explicitly declare a `header`, Avo automatically generates one and places it at the top of the page.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.title = :name
  self.description = "Users of the application"

  def fields
    header # Explicitly place the header

    card do
      field :id, as: :id
      field :email, as: :text
    end
  end
end
```

## Automatic Header Generation

If you don't explicitly define a `header` in your `fields` method, Avo will automatically create one and insert it as the first item on the page. This ensures that every resource page has a consistent header with the title, description, and controls.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.title = :name

  def fields
    # No explicit header - Avo will automatically add one at the top
    card do
      field :id, as: :id
      field :email, as: :text
    end
  end
end
```

## Positioning the Header

One of the key benefits of the `header` DSL is the ability to position it anywhere within your fields layout. This is particularly useful when you want to display some content before the main header. 

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.title = :name

  def fields
    # Display a card before the header
    card do
      field :status, as: :badge
    end

    header # Header appears after the card

    card do
      field :id, as: :id
      field :email, as: :text
    end
  end
end
```
