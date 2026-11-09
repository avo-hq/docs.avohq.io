---
license: community
outline: [2, 3]
guide: ./markdown.html
prev:
  text: "Markdown"
  link: "./markdown.html"
next: false
---

# Markdown API

Per-option reference for the Markdown field provided by `marksmith`. For tasks and examples, see the [Markdown guide](./markdown.html).

Pass options to a field declaration in your resource's `fields` method, for example in `app/avo/resources/post.rb`:

```ruby
field :body, as: :markdown, file_uploads: false
```

The contracts below describe `marksmith` `0.6.0`. The field is hidden on Index by default. For shared options, see [Field options](../field-options.html).

## Attachments

<Option name="`file_uploads`">

Controls the editor's file-upload UI. The field forwards this value to Marksmith's `enable_file_uploads` setting.

```ruby
field :body, as: :markdown, file_uploads: false
```

| Value | Behavior |
| --- | --- |
| `nil` | Enables uploads when an upload URL is available. |
| `true` | Enables uploads when an upload URL is available. |
| `false` | Disables uploads. |

- **Type:** `Boolean` or `nil`
- **Default:** `nil`

:::warning Upload URL required
Uploads remain disabled without an upload URL, even with `file_uploads: true`. When Active Storage is defined, Marksmith's helper supplies the app's `rails_direct_uploads_url`.
:::

</Option>

<Option name="`media_library`">

Controls the **"Attach from gallery"** option in the editor. The gallery is available only when the global [Media Library](../media-library.html) configuration is enabled and this option is truthy.

```ruby
field :body, as: :markdown, media_library: false
```

- **Type:** `Boolean`
- **Default:** `true`
- **Values:** `true` or `false`; an explicit `nil` falls back to `true`.

</Option>

## Preview requests

<Option name="`extra_preview_params`">

Additional parameters sent with preview requests. Avo starts with `resource_class` (the resource class name) and `field_id` (the field identifier), then merges this Hash after those entries. Custom matching keys override those identifiers.

```ruby
field :body, as: :markdown, extra_preview_params: { foo: :bar }
```

- **Type:** `Hash`
- **Default:** `{}`
- **Values:** A Hash of additional preview parameters; `nil` or `false` falls back to `{}`.

:::warning Hash required
The edit component expands this value with Ruby's double-splat operator. A value that cannot be converted to a Hash raises `TypeError` when the edit component renders; there is no earlier field-level type validation.
:::

</Option>

## Show presentation

<Option name="`always_show`">

Controls whether the Show view displays the full rendered Markdown instead of a collapsed preview. This option is defined by Marksmith's Markdown field, not by `BaseField`.

```ruby
field :body, as: :markdown, always_show: true
```

- **Type:** `Boolean`
- **Default:** `false`
- **Values:** `true` displays the full content; `false` or `nil` uses the collapsed preview. Other truthy values also disable collapsing; no Boolean type validation is performed.
- **Availability:** `marksmith` `0.6.0` or newer. Older versions display the full content without consulting this option.

</Option>
