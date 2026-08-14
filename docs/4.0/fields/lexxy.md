---
license: community
description: "Renders the Lexxy rich text editor — Basecamp's modern Action Text editor built on Meta's Lexical framework."
fieldTags: [rich text, attachments]
---

# Lexxy

The `lexxy` field renders the [Lexxy editor](https://lexxy.dev) — Basecamp's modern rich text editor for Action Text, built on Meta's Lexical framework.

## Requirements

- Avo >= 4.0
- Rails >= 8.0.2 (required by the `lexxy` gem)
- Action Text (for attachments support)

## Installation

Add the gem to your `Gemfile`:

```ruby
gem "avo-lexxy_field"
```

:::warning
The gem depends on `lexxy`, which takes over `form.rich_text_area` in your whole app by default. If you only want Lexxy inside Avo, opt out in the host app:

```ruby
# config/application.rb (Rails 8.0/8.1 only)
config.lexxy.override_action_text_defaults = false
```
:::

## Usage

```ruby
field :body, as: :lexxy
```

## Options

<!-- @include: ./../common/field_options/always_show.md-->

<Option name="`attachments_disabled`">

Disable file attachments. Lexxy uploads through Active Storage direct uploads and relies on Action Text to attach the blobs, so plain columns have attachments disabled by default to avoid orphaned blobs.

#### Default value

`false` for Action Text attributes, `true` otherwise.
</Option>

## Editor configuration

Lexxy's [editor options](https://lexxy.dev/docs/) are field options too. They land on the `<lexxy-editor>` element, which is where Lexxy reads them from:

```ruby
field :body, as: :lexxy,
  preset: :comment,
  markdown: false,
  headings: %w[h2 h3],
  permitted_attachment_types: %w[image/png image/jpeg]
```

| Option                        | Description                                              |
| ----------------------------- | -------------------------------------------------------- |
| `preset`                      | Name of a preset registered with `Lexxy.configure`.      |
| `markdown`                    | Markdown shortcuts while typing.                         |
| `rich_text`                   | Rich text at all — `false` gives you a plain text editor. |
| `multi_line`                  | Whether Enter creates a new paragraph.                   |
| `headings`                    | Heading levels the toolbar offers.                       |
| `toolbar`                     | Toolbar configuration.                                   |
| `highlight`                   | Highlight colors.                                        |
| `permitted_attachment_types`  | Content types accepted for upload.                       |
