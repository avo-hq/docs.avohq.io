---
license: community
outline: [2, 3]
betaStatus: Beta
demoVideo: "https://youtu.be/wnWvzQyyo6A?t=2128"
description: "A GitHub-inspired Markdown editor based on the Marksmith editor."
fieldTags: [rich text]
---

# Markdown

The Markdown field provides a GitHub-inspired editor based on [Marksmith](https://github.com/avo-hq/marksmith), with text formatting, file attachments, and a preview of the rendered content.

```ruby
# app/avo/resources/post.rb
field :body, as: :markdown
```

By default, the field is hidden on Index. The editor offers uploads when an upload URL is available and a gallery picker when the [Media Library](./../media-library) is enabled. Preview requests include Avo's resource and field identifiers, with no additional custom parameters.

<Image src="/assets/img/4_0/fields/markdown/markdown-field.webm" dark-src="/assets/img/4_0/fields/markdown/markdown-field-dark.webm" width="760" height="385" alt="Typing Markdown in the Marksmith editor, then toggling the Preview tab to see the rendered HTML" />

:::info
In Avo 3.17 we renamed the previous `markdown` field [`easy_mde`](./easy_mde.html) and introduced this one based on the [Marksmith editor](https://github.com/avo-hq/marksmith).

See the Marksmith repository for its editor configuration and renderer documentation.
:::

## Install the editor dependencies

:::warning
Ensure these gems are in your `Gemfile`.

```ruby
# Gemfile
gem "marksmith"
gem "commonmarker"
```
:::

<div class="aspect-video">
  <iframe width="100%" height="100%" src="https://www.youtube.com/embed/wnWvzQyyo6A?start=2128" title="Avo 3.17 - Media Library, new Markdown field &amp; the Array Adapter" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## Write and preview Markdown

Use the editor toolbar to format text, or write Markdown directly and switch to the preview panel to see the result. The editor supports:

- [x] ActiveStorage file attachments
- [x] [Media Library](./../media-library) integration
- [x] Preview panel
- [x] [Ready-to-use renderer](https://github.com/avo-hq/marksmith#built-in-preview-renderer)
- [x] Text formatting
- [x] Lists
- [x] Links
- [x] Images
- [x] Tables
- [x] Code blocks
- [x] Headings

## Control file attachments

Users can drop files into the editor or select them through the upload control. Rails persists uploaded files using Active Storage. The [Media Library](./../media-library) lets users reuse existing uploads.

<span id="file_uploads"></span>

To hide the **"Upload files"** option for a field, set `file_uploads` to `false`. When omitted, Marksmith enables uploads only if an upload URL is available, normally through Active Storage's direct-upload route. Setting it to `true` does not enable uploads without a URL.

```ruby
# app/avo/resources/post.rb
field :body, as: :markdown, file_uploads: false
```

<span id="media_library"></span>

To hide **"Attach from gallery"** for a field while keeping the Media Library available elsewhere, set `media_library` to `false`. It is enabled by default.

```ruby
# app/avo/resources/post.rb
field :body, as: :markdown, media_library: false
```

## Pass context to the preview renderer {#extra_preview_params}

If the preview renderer needs additional context, pass a Hash of key-value pairs through `extra_preview_params`. Its default is an empty Hash (`{}`); Avo already sends `resource_class` and `field_id` with each preview request. Custom keys are merged after those identifiers, so matching keys override them.

```ruby
# app/avo/resources/post.rb
field :body, as: :markdown, extra_preview_params: { foo: :bar }
```

## Customize the renderer

To change how Markdown becomes HTML in the preview and on the Show view, override `Marksmith::Renderer`. The following example supports Commonmarker, Kramdown, and Redcarpet; install the parser gems you use.

```ruby
# app/models/marksmith/renderer.rb

module Marksmith
  class Renderer
    def initialize(body:)
      @body = body
    end

    def render
      if Marksmith.configuration.parser == "commonmarker"
        render_commonmarker
      elsif Marksmith.configuration.parser == "kramdown"
        render_kramdown
      else
        render_redcarpet
      end
    end

    def render_commonmarker
      # commonmarker expects an utf-8 encoded string
      body = @body.to_s.dup.force_encoding("utf-8")
      Commonmarker.to_html(body)
    end

    def render_redcarpet
      ::Redcarpet::Markdown.new(
        ::Redcarpet::Render::HTML,
        tables: true,
        lax_spacing: true,
        fenced_code_blocks: true,
        space_after_headers: true,
        hard_wrap: true,
        autolink: true,
        strikethrough: true,
        underline: true,
        highlight: true,
        quote: true,
        with_toc_data: true
      ).render(@body)
    end

    def render_kramdown
      body = @body.to_s.dup.force_encoding("utf-8")
      Kramdown::Document.new(body).to_html
    end
  end
end
```

## Show the full content on the Show view

Set the shared `always_show` option to `true` to display the full content instead of a collapsed preview.

```ruby
# app/avo/resources/post.rb
field :body, as: :markdown, always_show: true
```

:::info
The collapsed preview requires `marksmith` **0.6.0 or newer**. On older versions the field always shows its full content and `always_show` has no effect.
:::

See [Field options](../field-options.html) for configuration shared with other field types.
