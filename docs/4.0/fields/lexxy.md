---
license: community
outline: [2, 3]
api_docs: ./lexxy-api.html
description: "Renders the Lexxy rich text editor, Basecamp's modern Action Text editor built on Lexical."
fieldTags: [rich text, attachments]
---

# Lexxy

The `Lexxy` field renders [Lexxy](https://github.com/basecamp/lexxy), Basecamp's modern rich text editor for Action Text, built on Meta's Lexical framework. It produces clean HTML semantics, supports Markdown shortcuts, code syntax highlighting, and rich attachment previews.

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :body, as: :lexxy
  end
end
```

By default, the field is hidden on the `Index` view and collapsed to a preview on the `Show` view. Attachments are enabled for Action Text attributes and disabled for plain columns; editor settings otherwise follow Lexxy's default preset.

It supports [Action Text](https://guides.rubyonrails.org/action_text_overview.html) attributes and plain `string`/`text` columns storing HTML, with file attachments uploaded through [Active Storage](https://guides.rubyonrails.org/active_storage_overview.html) direct uploads.

## Install the editor

- Rails >= 8.0.2 (required by the `lexxy` gem)

:::info Add this field to the `Gemfile`
```ruby
# Gemfile
gem "avo-lexxy_field"
```
:::

:::warning Lexxy takes over Action Text
The `lexxy` gem replaces Trix as the default `form.rich_text_area` editor across your whole app. If you only want Lexxy inside Avo, opt out in the host app:

```ruby
# config/application.rb (Rails 8.0/8.1)
config.lexxy.override_action_text_defaults = false
```
:::

## Store content with Action Text

Lexxy is built for Action Text and works with it out of the box, including file attachments.

```ruby
# app/models/post.rb
class Post < ApplicationRecord
  has_rich_text :body
end
```

```ruby
# app/avo/resources/post.rb
field :body, as: :lexxy
```

<span id="attachments_disabled"></span>

If you want to prevent uploads, set [`attachments_disabled`](./lexxy-api.html#attachments_disabled) to `true`.

:::warning Attachments on plain columns
Lexxy relies on Action Text to attach uploaded blobs to the record on save. Setting `attachments_disabled: false` on a plain column enables uploads, but those blobs can remain orphaned.
:::

## Display the full content

Set [`always_show`](./lexxy-api.html#always_show) to `true` to display the full content on the `Show` view instead of an expandable preview.

```ruby
# app/avo/resources/post.rb
field :body, as: :lexxy, always_show: true
```

## Insert assets from the Media Library

When the [Media Library](../media-library) is enabled, the editor's toolbar gets a button that opens the library in a modal. Picking an asset inserts it into the content: images as Action Text attachments, other files as links.

The button is hidden when the field has attachments disabled (which is the default on plain `string`/`text` columns), since there is nothing to attach the blob to.

## Customize the editor

Pass editor settings directly as field options. For example, use [`markdown`](./lexxy-api.html#markdown) to disable Markdown shortcuts and [`headings`](./lexxy-api.html#headings) to limit the heading menu:

```ruby
# app/avo/resources/post.rb
field :body, as: :lexxy, markdown: false, headings: ["h2", "h3"]
```

For shared settings, configure presets globally through `Lexxy.configure` in your JavaScript and select one with [`preset`](./lexxy-api.html#preset).

Lexxy's element attributes (`markdown`, `rich-text`, `headings`, `permitted-attachment-types`, etc.) are documented in the [Lexxy docs](https://lexxy.dev/docs/). Avo exposes the supported editor settings as snake_case field options, such as [`rich_text`](./lexxy-api.html#rich_text) and [`permitted_attachment_types`](./lexxy-api.html#permitted_attachment_types).

For placeholder text, CSS classes, data attributes, and other shared settings, see [Common field options](../field-options.html). The `html` option customizes input classes, data, and style; use the dedicated editor options for Lexxy configuration.
