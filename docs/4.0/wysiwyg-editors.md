---
outline: [2, 3]
---

# WYSIWYG & Markdown editors

Avo has six rich text fields, plus the `code` field for source code. They differ in the editor they render on forms, but they all behave the same on the `Show` view:

- they span the full width of the panel, with the label beside the value (non-stacked)
- the content is collapsed to a short, faded preview with a `More content` link that expands it (with an animated height transition) and a `Less content` link that collapses it back
- `always_show: true` skips the collapsing and renders the full content
- they are hidden on the `Index` view

## Which one should I pick?

| Field       | Editor                                                          | Format   | Storage                    | Gem                                |
| ----------- | --------------------------------------------------------------- | -------- | -------------------------- | ---------------------------------- |
| `rhino`     | [Rhino](https://rhino-editor.vercel.app/) (TipTap)              | HTML     | Action Text or text column | `avo-rhino_field`                  |
| `lexxy`     | [Lexxy](https://lexxy.dev) (Lexical, by Basecamp)               | HTML     | Action Text                | `avo-lexxy_field` (Rails >= 8.0.2) |
| `trix`      | [Trix](https://trix-editor.org/)                                | HTML     | Action Text or text column | built into Avo                     |
| `markdown`  | [Marksmith](https://github.com/avo-hq/marksmith) (GitHub-style) | Markdown | text column                | `marksmith` + `commonmarker`       |
| `easy_mde`  | [EasyMDE](https://github.com/Ionaru/easy-markdown-editor)       | Markdown | text column                | built into Avo                     |
| `tip_tap`   | TipTap                                                          | HTML     | text column                | built into Avo, **deprecated**     |
| `code`      | [CodeMirror](https://codemirror.net/)                           | code     | text column                | built into Avo                     |

Recommendations:

- For rich text (HTML) content, use [`rhino`](./fields/rhino) — or [`lexxy`](./fields/lexxy) if you're on Rails >= 8.0.2 and want Basecamp's newer editor. [`trix`](./fields/trix) remains the zero-dependency default.
- For markdown content, use [`markdown`](./fields/markdown) (the Marksmith editor). [`easy_mde`](./fields/easy_mde) is the legacy markdown field.
- For source code, configuration snippets, or JSON, use [`code`](./fields/code).
- [`tip_tap`](./fields/tip_tap) is deprecated in favor of `rhino`.

## Shared Show view behavior

```ruby
field :body, as: :rhino                    # collapsed preview + More/Less content
field :body, as: :rhino, always_show: true # full content, no toggle
```

All of these fields render their value through the same collapsible wrapper (the field wrapper's `collapsable` option, backed by `Avo::Fields::Common::CollapsableContentComponent`), so switching between editors doesn't change how records read on the `Show` view.

## Resizable editors

On forms, every editor's viewport can be resized vertically by dragging its bottom-end resize handle. The height is remembered per resource and field (in the browser's local storage) and restored the next time the form renders.

Custom editor fields can opt in from their field class:

```ruby
class Avo::Fields::MyEditorField < Avo::Fields::BaseField
  resizable_editor target: ".my-editor__content"
end
```

The `target` is a CSS selector for the editor's scrollable viewport, resolved inside the field wrapper after the editor boots — client-rendered editors work too.

## Usage

```ruby
field :body, as: :trix
field :body, as: :rhino
field :body, as: :lexxy
field :body, as: :markdown
field :body, as: :easy_mde
field :body, as: :code, language: "ruby"
```

See each field's page for its editor-specific options: [Trix](./fields/trix), [Rhino](./fields/rhino), [Lexxy](./fields/lexxy), [Markdown](./fields/markdown), [Easy MDE](./fields/easy_mde), [Tip Tap](./fields/tip_tap), [Code](./fields/code).
