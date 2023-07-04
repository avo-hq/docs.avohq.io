# Use the `has_many` field for Active Storage attachments

Because [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html) is implemented as an association.

For that you should create an `attachment_resource.rb` and configure it like so.

```ruby
class AttachmentResource < Avo::BaseResource
  self.title = :filename
  self.model_class = "ActiveStorage::Attachment"

  field :id, as: :id
  field :filename, as: :text
  field :service_url, as: :external_image, name: "Image"
  field :created_at, as: :date_time
end
```

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

![](/assets/img/recipes/use-the-has-many-field-for-active-storage-attachments/preview.png)

We suggest making this resource read-only using Pundit policies so you don't accidentaly update Active Storage keys and settings.
