# Grid view

[[toc]]

<br />
<img :src="$withBase('/assets/img/grid-view.jpg')" alt="Avo grid view" class="border mb-4" />

Some resources are best displayed in a grid view. We can do that with Avo using a `cover`, a `title` and a `body`.

## Enable grid view

To enable grid view for a resource you need to add the `grid` block. This will add the view switcher to the **Index** view.

```ruby
class PostResource < Avo::BaseResource
  # ...
  grid do
    cover :cover_photo, as: :file, link_to_resource: true
    title :name, as: :text, required: true, link_to_resource: true
    body :excerpt, as: :text
  end
end
```

<img :src="$withBase('/assets/img/view-switcher.jpg')" alt="Avo view switcher" class="border mb-4" />

## Make default view

To make the grid the default way of viewing a resource **Index** we have to use the `default_view_type` class attribute.

```ruby{7}
class Post < Avo::BaseResource
  self.default_view_type = :grid
end
```

## Fields configuration

Besides the regular `field` methods you should add a new `grid` block that configures the grid fields. The main difference is that the fields are not declared using the `field` class method but three new ones `cover`, `title` and `body`


```ruby{7-11}
class Post < Avo::BaseResource
  self.default_view_type = :grid

  field :id, as: :id
  field :name, as: :text, required: true
  field :body, as: :textarea
  field :cover_photo, as: :file, is_image: true

  grid do
    cover :cover_photo, as: :file, is_image: true
    title :name, as: :text
    body :body, as: :textarea
  end
end
```

This will render the `Post` resource index view as a **Grid view** using the selected fields. Avo will also display a button to toggle between the two view types `:grid` and `:table`.

These fields take the same options like those in the `fields` method, so you can configure them however you want.

For example, in the **Grid view** you might want to truncate the `:body` to a certain length and use an external image for the cover that you compute on the fly. And also render the `:cover` and the `:title` fields as links to that resource with `link_to_resource: true`.

```ruby
grid do
  cover :logo, as: :external_image, link_to_resource: true do |model|
    if model.url.present?
      "//logo.clearbit.com/#{URI.parse(model.url).host}?size=180"
    end
  end
  title :name, as: :text, link_to_resource: true
  body :excerpt, as: :text do |model|
    begin
      ActionView::Base.full_sanitizer.sanitize(model.body).truncate 130
    rescue => exception
      ''
    end
  end
end
```
