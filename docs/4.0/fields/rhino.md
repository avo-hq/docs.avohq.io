---
license: community
description: "Renders the Rhino WYSIWYG editor, based on TipTap, with ActionText and Media Library support."
fieldTags: [rich text, attachments]
outline: [2, 3]
---

# Rhino

The [Rhino Editor](https://rhino-editor.vercel.app/), built by [Konnor Rogers](https://www.konnorrogers.com/), is a rich-text editor based on [TipTap](https://tiptap.dev/). Avo integrates it with [ActionText](https://guides.rubyonrails.org/action_text_overview.html), [ActiveStorage](https://guides.rubyonrails.org/active_storage_overview.html) file attachments, and the [Media Library](./../media-library).

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :body, as: :rhino
  end
end
```

By default, the field is hidden on the index view. On the show view, long content is collapsed into a preview that users can expand.

<Image src="/assets/img/4_0/fields/rhino/form.webp" dark-src="/assets/img/4_0/fields/rhino/form-dark.webp" width="1520" height="604" alt="An Avo edit-form card with a Rhino WYSIWYG editor showing the formatting toolbar above a text area with sample content." prompt="an exemple" />

## Install the editor

Add the field's gem to your `Gemfile`, then run `bundle install`:

```ruby
# Gemfile
gem "avo-rhino_field"
```

## Store rich text with ActionText

If you want ActionText to manage the content and its attachments, configure the model attribute to match the field name:

```ruby
# app/models/post.rb
class Post < ApplicationRecord
  has_rich_text :body
end
```

See the [ActionText guide](https://guides.rubyonrails.org/action_text_overview.html) for Rails setup. The editor also integrates with Avo's [Media Library](./../media-library) to insert existing media.

## Keep the full content visible

Set `always_show: true` to display the full content on the show view without an expand/collapse control:

```ruby
# app/avo/resources/post.rb
field :body, as: :rhino, always_show: true
```

`always_show` is a Boolean and defaults to `false`.

## Common field options

For labels, help text, placeholders, visibility, and other shared settings, see [Common field options](../field-options.html).
