---
version: '3.17'
betaStatus: Open Beta
license: community
---

# Discreet Information

Sometimes you need to have some information available on the record page, but not necesarily front-and-center.
This is where the Discreet Information option is handy.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = [
    :timestamps,
    {
      tooltip: -> { sanitize("Product is <strong>#{record.published_at ? "published" : "draft"}</strong>", tags: %w[strong]) },
      icon: -> { "heroicons/outline/#{record.published_at ? "eye" : "eye-slash"}" }
    },
    {
      label: -> { record.published_at ? "🚀" : "😬" },
      url: -> { "https://avohq.io" },
      url_target: :_blank
    }
  ]
end
```

## Display the `created_at` and `updated_at` timestamps

The reason why we built this feature was that we wanted a place to display the created and updated at timestamps but didn't want to use up a whole field for it.
That's why this is the most simple thing to add.

Set the option to the `:timestamps` value and a new icon will be added next to the title. When the user hovers over the icon, they will see the record's default timestamps.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = :timestamps

  # fields and other resource configuration
end
```

If the record doesn't have the `created_at` or `updated_at` attributes, they will be ommited.

## Options

You may fully customize the discreet information item by taking control of different options.
To do that, you can set it to a `Hash` with various keys.


```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    tooltip: -> { "Product is #{record.published_at ? "published" : "draft"}" },
    icon: -> { "heroicons/outline/#{record.published_at ? "eye" : "eye-slash"}" }
    url: -> { main_app.post_path record }
  }
end
```

<Option name="`tooltip`">

Use the `tooltip` option to set the body of the tooltip.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    tooltip: -> { "Product is #{record.published_at ? "published" : "draft"}" },
  }
end
```

You may return HTML for that tooltip but don't forget to sanitize the output.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    tooltip: -> { sanitize("Product is <strong>#{record.published_at ? "published" : "draft"}</strong>", tags: %w[strong]) },
    icon: "heroicons/outline/academic-cap"
  }
end
```

</Option>

<Option name="`url`">

The `url` option will transform the icon into a link.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = {
    tooltip: -> { "Product is #{record.published_at ? "published" : "draft"}" },
    icon: "heroicons/outline/academic-cap",
    url: -> { main_app. }
  }
end
```

</Option>


## Display multiple pieces of information

You can use it to display one or more pieces of information.

## Information properties

Each piece of information has a fe



## Full configuration


```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.discreet_information = [
    :timestamps,
    {
      tooltip: -> { sanitize("Product is <strong>#{record.published_at ? "published" : "draft"}</strong>", tags: %w[strong]) },
      icon: -> { "heroicons/outline/#{record.published_at ? "eye" : "eye-slash"}" }
    },
    {
      label: -> { record.published_at ? "✅" : "🙄" },
      url: -> { "https://avohq.io" },
      url_target: :_blank
    }
  ]

  # fields and other resource configuration
end
```
