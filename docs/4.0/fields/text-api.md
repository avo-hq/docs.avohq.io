---
license: community
outline: [2, 3]
guide: ./text.html
prev:
  text: "Text"
  link: "./text.html"
next: false
---

# Text API

Per-option reference for the Text field; see the [Text guide](./text.html) for tasks and examples.

Pass these options to a field declaration in your resource's `fields` method, for example in `app/avo/resources/post.rb`:

```ruby
field :title, as: :text, link_to_record: true
```

For options shared by all fields, see [Field options](../field-options.html).

## Display options

<Option name="`protocol`">

Turns the value into a link on Index and Show views when the configured protocol is present. The destination is `"#{protocol}:#{value}"`, with the value as the link text. Blank protocols do not create protocol links.

```ruby
field :email, as: :text, protocol: :mailto
```

- **Type:** `String` or `Symbol`
- **Default:** `nil`
- **Values:** A protocol name without the trailing colon, such as `:mailto`, `:tel`, or a custom string. There is no fixed enum.
- **Validation:** No protocol allowlist or type validation is applied; the value is interpolated into the destination.

</Option>

<Option name="`link_to_record`">

Wraps the value in a link to the record on the Index view. It has no effect on the Show view or on forms, and is ignored when HTML or protocol rendering takes precedence.

```ruby
field :title, as: :text, link_to_record: true
```

- **Type:** Boolean
- **Default:** `false`
- **Values:** `true` enables the option; `false` disables it. `nil` and non-Boolean values fall back to `false`.

</Option>

<Option name="`as_html`">

Renders the value as raw HTML on Index and Show views. It takes precedence over both link options and does not change form inputs.

```ruby
field :title, as: :text, as_html: true
```

- **Type:** Boolean
- **Default:** `false`
- **Values:** `true` enables the option; `false` disables it. `nil` and non-Boolean values fall back to `false`.

:::warning Unsafe HTML
The value is rendered without escaping or sanitization. Untrusted content can execute scripts; only trusted or already sanitized HTML is safe to render this way.
:::

</Option>

## Rendering precedence

On Index and Show views, `as_html: true` wins over a present `protocol`. On Index, a present `protocol` wins over `link_to_record`; otherwise the value is linked only when `link_to_record: true`. On Show, `link_to_record` is not used. Without HTML or link rendering, the value is displayed as escaped text.

New and Edit forms always use a text input; none of these options changes its type.
