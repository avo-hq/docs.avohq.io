---
license: community
description: "Renders the Lexxy rich text editor, Basecamp's modern Action Text editor built on Lexical."
fieldTags: [rich text, attachments]
---

# Lexxy

```ruby
field :body, as: :lexxy
```

The `Lexxy` field renders [Lexxy](https://github.com/basecamp/lexxy), Basecamp's modern rich text editor for Action Text, built on Meta's Lexical framework. It produces clean HTML semantics, supports Markdown shortcuts, code syntax highlighting, and rich attachment previews.

It supports [Action Text](https://guides.rubyonrails.org/action_text_overview.html) attributes and plain `string`/`text` columns storing HTML, with file attachments uploaded through [Active Storage](https://guides.rubyonrails.org/active_storage_overview.html) direct uploads.

Lexxy field is hidden from the `Index` view.

## Requirements

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

## Options

<!-- @include: ./../common/field_options/always_show.md-->

<Option name="`attachments_disabled`">

Disables file attachments (toolbar button, paste, and drag & drop).

#### Default value

`false` on Action Text attributes, `true` on plain columns.

Lexxy uploads files through Active Storage direct uploads and relies on Action Text to attach the blobs to the record on save. On plain columns the uploads would remain orphaned blobs, so attachments are disabled there by default. Pass `attachments_disabled: false` to enable them anyway.
</Option>

## Action Text

Lexxy is built for Action Text and works with it out of the box, including file attachments.

```ruby
class Post < ApplicationRecord
  has_rich_text :body
end
```

```ruby
field :body, as: :lexxy
```

## Editor configuration

Lexxy's element attributes (`markdown`, `rich-text`, `headings`, `permitted-attachment-types`, etc.) are documented in the [Lexxy docs](https://lexxy.dev/docs/) and can be configured globally through `Lexxy.configure` presets in your JavaScript, or per field through the field's `html` option.
