# Use the `has_many` field for Active Storage attachments

[Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html) is implemented as an association we can take advantage of that and make the users' experience so much better!

## Create the resource

For that you should create an `attachment_resource.rb` and configure it like so.

```bash
bin/rails generate avo:resource active_record_attachment
```

:::warning
Please don't use the name `AttachmentResource` because the generated controller will override Avo's internal controller that handles the attachments.
:::

```ruby
class ActiveRecordAttachmentResource < Avo::BaseResource
  self.title = :filename
  self.model_class = "ActiveStorage::Attachment"

  field :id, as: :id
  field :filename, as: :text
  field :service_url, as: :external_image, name: "Image"
  field :created_at, as: :date_time
end
```

## `has_many`

Next, add it to your resource that `has_many_attached`:

```ruby
class Project < ApplicationRecord
  has_many_attached :files
end

class ProjectResource < Avo::BaseResource
  # Please make sure you use the _attachments suffix.
  # So the :files key from the model file becomes :files_attachments on the resource file.
  field :files_attachments, as: :has_many
end
```

![](/assets/img/recipes/use-active-storage-attachments-as-associations/has_many.png)

We suggest making this resource read-only using Pundit policies so you don't accidentaly update Active Storage keys and settings.

## `has_many`

We can use the same resource on a different `has_one` association.

```ruby
class Post < ApplicationRecord
  has_one_attached :cover_photo
end

class PostResource < Avo::BaseResource
  # Please make sure you use the _attachment suffix.
  # So the :cover_photo key from the model file becomes :cover_photo_attachment on the resource file.
  field :cover_photo_attachment, as: :has_one
end
```

![](/assets/img/recipes/use-active-storage-attachments-as-associations/has_one.png)
