---
license: community
outline: [2, 3]
guide: ./checkbox_list.html
prev:
  text: "Checkbox List"
  link: "./checkbox_list.html"
next: false
---

# Checkbox List API

Per-option reference for the `checkbox_list` field; see the [Checkbox List guide](./checkbox_list.html) for tasks and examples.

Options are passed to a field declaration in a resource file such as `app/avo/resources/team.rb`:

```ruby
field :team_member_ids,
  as: :checkbox_list,
  options: [{id: 1, title: "Alex"}],
  inline_search: true
```

For options common to all fields, see [Shared field options](../field-options.html).

## Choice data

<Option name="`options`">

The list of choices. Hash keys accept symbols or strings. A lambda is evaluated in [`Avo::ExecutionContext`](../execution-context.html), with `record`, `resource`, `view`, `field`, and the standard context helpers available. The result is reused until the field is hydrated again.

```ruby
field :team_member_ids, as: :checkbox_list,
  options: [{id: 1, title: "Alex"}]
```

- **Type:** `Array` of `Hash` entries, or `Proc` / lambda returning that array.
- **Default:** None; required. An empty array is allowed and displays "No options available".
- **Validation:** Missing `options:` or passing `nil` raises `ArgumentError` during field initialization. The array shape and individual keys are not explicitly validated. Errors from the lambda propagate.

:::warning Required entry data
Selectable entries need an `id` and a `title`. Passing a non-array value, a lambda returning `nil`, or malformed entries is not given a dedicated validation error and may fail during rendering.
:::

<Option name="`id`" headingSize="3">

The submitted value of a selectable entry. Values are normalized to strings for checkbox values and selection matching; integer `1` and string `"1"` therefore match the same selection.

```ruby
options: [{id: 1, title: "Alex"}]
```

- **Type:** `String` or `Integer` (other non-`nil` values are converted with `to_s`).
- **Default:** `nil`; no id is generated.

</Option>

<Option name="`title`" headingSize="3">

The visible label of a choice, or the message for a hint entry. Also supplies the image alt text when no explicit alt text is provided.

```ruby
options: [{id: 1, title: "Alex"}]
```

- **Type:** `String`.
- **Default:** `nil`.

</Option>

<Option name="`description`" headingSize="3">

Supporting text below the title. Included alongside the title in inline search.

```ruby
options: [{id: 1, title: "Alex", description: "alex@example.com"}]
```

- **Type:** `String`.
- **Default:** `nil`; no supporting text is rendered.

</Option>

<Option name="`avatar_url`" headingSize="3">

The image URL displayed before a choice's title. Takes precedence over `image_url`.

```ruby
options: [{id: 1, title: "Alex", avatar_url: "/avatars/alex.png"}]
```

- **Type:** `String`.
- **Default:** `nil`; no image unless `image_url` is provided.

</Option>

<Option name="`image_url`" headingSize="3">

Alternative image URL, used when `avatar_url` is absent.

```ruby
options: [{id: 1, title: "Alex", image_url: "/avatars/alex.png"}]
```

- **Type:** `String`.
- **Default:** `nil`.

</Option>

<Option name="`image_format`" headingSize="3">

The shape of the choice's image.

```ruby
options: [{id: 1, title: "Alex", image_url: "/avatars/alex.png", image_format: :rounded}]
```

| Value | Behavior |
| --- | --- |
| `:circle` / `"circle"` | Circular image. |
| `:rounded` / `"rounded"` | Slightly rounded corners. |
| `:square` / `"square"` | No corner rounding. |
| `nil` or another symbol/string | Circular image. |

- **Type:** `Symbol`, `String`, or `nil`.
- **Default:** `nil`; renders as a circle.
- **Validation:** No enum validation. Non-`nil` values must respond to `to_sym` or rendering raises `NoMethodError`.

</Option>

<Option name="`image_alt`" headingSize="3">

The image's alt text. Takes precedence over `avatar_alt`.

```ruby
options: [{id: 1, title: "Alex", image_url: "/avatars/alex.png", image_alt: "Alex's portrait"}]
```

- **Type:** `String`.
- **Default:** `nil`; falls back to `avatar_alt`, then the entry's title.

</Option>

<Option name="`avatar_alt`" headingSize="3">

Alternative image alt text, used when `image_alt` is absent.

```ruby
options: [{id: 1, title: "Alex", avatar_url: "/avatars/alex.png", avatar_alt: "Alex's portrait"}]
```

- **Type:** `String`.
- **Default:** `nil`; falls back to the entry's title.

</Option>

<Option name="`hint`" headingSize="3">

Marks an entry as a non-selectable message below the choices. All hint entries are excluded from checkboxes; only the first hint's title is displayed. It is not included in inline search.

```ruby
options: [{id: 1, title: "Alex"}, {title: "Showing up to 50 users", hint: true}]
```

- **Type:** `Boolean` (evaluated by Ruby truthiness).
- **Default:** `nil`; the entry is selectable.

</Option>

</Option>

## Search within choices

<Option name="`inline_search`">

Enables a client-side search input when there is at least one selectable choice. Search matches the combined title and description, case-insensitively, without fetching additional records. Choices hidden by search retain their checked state and remain submittable.

```ruby
field :team_member_ids, as: :checkbox_list,
  options: [{id: 1, title: "Alex"}], inline_search: true
```

- **Type:** `Boolean` or `Proc` / lambda returning a boolean.
- **Default:** `nil` (search disabled).
- **Values:** Only literal `true`, or a lambda result equal to `true`, enables search. Other truthy values do not.
- **Context:** Lambdas run in `Avo::ExecutionContext`, with the same helpers as `options`.
- **i18n key:** `avo.search.placeholder` ("Search").

</Option>
