# Grid view

<img :src="$withBase('/assets/img/grid-view.jpg')" alt="Avo grid view" class="border mb-4" />

Some resources are best displayed in a grid view. The grid view enables you to display the resource using an image (`:preview`), a title (`:title`) and a sub-title (`:body`).
To enable grid view in a resource you need to declare it in the resource initializer.

```ruby
module Avo
  module Resources
    class Post < Resource
      def initialize
        @title = :name
        @search = [:name, :id]
        @default_view_type = :grid
      end
    end
  end
end
```

You add and configure your fields as you regularly do in the `fields` block, then, the next step is to tell Avo which fields are which in grid view.

```ruby
  fields do
    id
    text :name, required: true
    textarea :body
    file :cover_photo, is_image: true
  end

  grid do
    preview :cover_photo
    title :name
    body :body
  end
```

This will render the `Post` resource index view as a **grid view** using the selected fields. You also get a button to toggle between the two view types `:grid` and `:table`.