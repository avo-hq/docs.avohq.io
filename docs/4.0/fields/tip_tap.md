---
license: community
betaStatus: Deprecated
description: "The TipTap field is deprecated in favor of the Rhino field."
fieldTags: [rich text]
outline: [2, 3]
api_docs: ./tip_tap-api.html
---

# Tip Tap

The TipTap field provides a rich text editor for existing Avo resources. It is deprecated in favor of the [Rhino](./rhino) field; use Rhino for new rich text fields.

```ruby
# app/avo/resources/post.rb
field :body, as: :tiptap
```

By default, TipTap is hidden on the index view. On the show view, long content is collapsed to a short preview with a link to expand it.

## Choose the replacement editor

The [Rhino field](./rhino) is based on TipTap and adds features and improvements, including [ActiveStorage](https://guides.rubyonrails.org/active_storage_overview.html) integration and support for the [Media Library](./../media-library). Follow its guide to install and configure the replacement editor.

## Keep the full content visible {#always_show}

<span id="always-show"></span>
<span id="keep-the-full-content-visible"></span>

If readers need to see the complete content without expanding a preview, set [`always_show`](./tip_tap-api.html#always_show) to `true`:

```ruby
# app/avo/resources/post.rb
field :body, as: :tiptap, always_show: true
```

With `always_show` omitted or set to `false`, readers can use the More content and Less content links on the show view to expand and collapse long content.

## Common field options

See the [Tip Tap API](./tip_tap-api.html) for the field-specific option and its default. For options shared with other fields, see [Common field options](../field-options.html).
