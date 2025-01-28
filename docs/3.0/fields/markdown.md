---
version: '3.17'
license: community
---

# Markdown

:::info
In Avo 3.17 we renamed the `markdown` field `easy_mde` and introduced this custom one.
:::

This field is inspired by the wonderful GitHub editor we all love and use.

It supports applying styles to the markup and dropping files in the editor. The file will be taken over by Rails and persisted using Active Storage.


```ruby
field :body, as: :markdown
```

:::warning
Please add these gems to your `Gemfile`.

```ruby
gem "avo-markdown_field"
gem "redcarpet"
```
:::

## Customize the parser & renderer

There are two places where we parse the markdown into the HTML you see.

1. In the controller
2. In the <Show /> field component

You may customize the renderer by overriding the implementation.

### Everywhere

Both parsers inherit from the same parser from the field. So you can override in the field and it will be visible everywhere.

```ruby
# config/initializers/avo.rb

module Avo
  module Fields
    class MarkdownField < BaseField
      def self.parser
      # update this to your liking
        renderer = ::Redcarpet::Render::HTML.new(hard_wrap: true)
        ::Redcarpet::Markdown.new(renderer, lax_spacing: true, fenced_code_blocks: true, hard_wrap: true)
      end
    end
  end
end
```

### In the controller

```ruby
module Avo
  class MarkdownPreviewsController < ApplicationController
    def create
      # fetch the resource to get some information off of it
      resource_class = Avo.resource_manager.get_resource_by_name(params[:resource_class])
      # initialize it
      resource = resource_class.new view: :edit
      # run field detection
      resource.detect_fields
      # fetch the field
      field = resource.get_field(params[:field_id])
      # render the result
      @result = field.parser.render(params[:body])
    end
  end
end
```

### In the `ShowFieldComponent`

```ruby
# app/components/avo/fields/markdown_field/show_component.rb

class Avo::Fields::MarkdownField::ShowComponent < Avo::Fields::ShowComponent
  def parsed_body
    renderer = Redcarpet::Render::HTML.new(hard_wrap: true)
    parser = Redcarpet::Markdown.new(renderer, lax_spacing: true, fenced_code_blocks: true, hard_wrap: true)
    parser.render(@field.value)
  end
end
```
