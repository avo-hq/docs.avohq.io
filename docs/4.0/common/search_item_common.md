The `item` option configures how each result row is rendered. It's a hash with the following keys:

| Option | Description | Default | Possible Values |
|--------|-------------|---------|-----------------|
| `title` | The title of the result | `Resource title` | Any string |
| `description` | The description of the result | `nil` | Any string |
| `image_url` | The URL of the image to display in the result | `nil` | Any valid URL |
| `image_format` | The format of the image to display in the result | `:circle` | `:square`, `:rounded`, `:circle` |

**Example**

```ruby{5-12}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  self.search = {
    query: -> { query.ransack(name_cont: q, body_cont: q, m: "or").result(distinct: false) },
    item: -> do
      {
        title: "[#{record.id}] #{record.name}",
        description: record.truncated_body,
        image_url: main_app.url_for(record.cover_photo),
        image_format: :rounded
      }
    end
  }
end
```
