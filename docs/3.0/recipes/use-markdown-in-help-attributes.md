# Use markdown for help attributes

:::info User contribution
Recipe [contributed](https://github.com/avo-hq/avo/issues/1390#issuecomment-1302553590) by [dhnaranjo](https://github.com/dhnaranjo).
:::

Desmond needed a way to write markdown in the help field and built an HTML to Markdown compiler.

```ruby
module MarkdownHelpText
  class Renderer < Redcarpet::Render::HTML
    def header(text, level)
      case level
      when 1 then %(<h1 class="mb-4">#{text}</h1>)
      when 2 then %(<h2 class="mb-4">#{text}</h1>)
      else
        %(<h#{level} class="mb-2">#{text}</h#{level}>)
      end
    end

    def paragraph(text)
      %(<p class="mb-2">#{text}</p>)
    end

    def block_code(code, language)
      <<~HTML
        <pre class="mb-2 p-1 rounded bg-gray-500 text-white text-sm">
        <code class="#{language}">#{code.chomp}</code>
        </pre>
      HTML
    end

    def codespan(code)
      %(<code class="mb-2 p-1 rounded bg-gray-500 text-white text-sm">#{code}</code>)
    end

    def list(contents, list_type)
      list_style = case list_type
             when "ul" then "list-disc"
             when "ol" then "list-decimal"
             else "list-none"
             end
      %(<#{list_type} class="ml-8 mb-2 #{list_style}">#{contents}</#{list_type}>)
    end
  end

  def markdown_help(content, renderer: Renderer)
    markdown = Redcarpet::Markdown.new(
      renderer.new,
      filter_html: false,
      escape_html: false,
      autolink: true,
      fenced_code_blocks: true
    ).render(content)

    %(<section>#{markdown}</section>)
  end
end
```

```ruby
 field :description_copy, as: :markdown,
    help: markdown_help(<<~MARKDOWN
      # Dog
      ## Cat
      ### bird
      paragraph about hats **bold hat**

      ~~~
      class Ham
        def wow
          puts "wow"
        end
      end
      ~~~

      `code thinger`

      - one
      - two
      - three
    MARKDOWN
    )
```

![](/assets/img/3_0/guides/use-markdown-in-help-attributes/result.png)
