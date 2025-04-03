---
version: '3.17.0'
license: community
betaStatus: Beta
demoVideo: https://youtu.be/wnWvzQyyo6A?t=2128
---

# Markdown

<Image src="/assets/img/fields/markdown/markdown-field.gif" alt="Markdown field" size="800x427" />

:::info
In Avo 3.17 we renamed the `markdown` field `easy_mde` and introduced this custom one based on the [Marksmith editor](https://github.com/avo-hq/marksmith).

Please read the docs on the repo for more information on how it works.
:::

This field is inspired by the wonderful GitHub editor we all love and use.

It supports applying styles to the markup, dropping files in the editor, and using the [Media Library](./../media-library).
The uploaded files will be taken over by Rails and persisted using Active Storage.

```ruby
field :body, as: :markdown
```

:::warning
Please ensure you have these gems in your `Gemfile`.

```ruby
gem "marksmith"
gem "commonmarker"
```
:::

<div class="aspect-video">
  <iframe width="100%" height="100%" src="https://www.youtube.com/embed/wnWvzQyyo6A?start=2128" title="Avo 3.17 - Media Library, new Markdown field &amp; the Array Adapter" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## Supported features

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

## Customize the renderer

There are two places where we parse the markdown into the HTML you see.

1. In the controller
2. In the <Show /> field component

You may customize the renderer by overriding the model.

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
